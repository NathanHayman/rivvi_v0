"use server";

import { db } from "@/server/db";
import {
  organizationPatients,
  patients,
  rows as rowsTable,
  runs,
} from "@/server/db/schema";
import { CampaignConfig } from "@/types/zod";
import { and, eq } from "drizzle-orm";
import { parse as parseCSV } from "papaparse";
import { v4 as uuidv4 } from "uuid";
import { read as readXLSX, utils as xlsxUtils } from "xlsx";
import { z } from "zod";
import {
  patientDataSchema,
  processCampaignData,
  processPatientData,
} from "./helpers";

interface RunWithCampaign {
  campaign: {
    orgId: string;
  } | null;
}

interface CSVRow {
  "Patient Number": string;
  "Patient First Name": string;
  "Patient Last Name": string;
  "Patient DOB": string;
  "Primary Phone": string;
  "Cell Phone": string;
  "Home Phone": string;
  "APPT LOCATION": string;
  "APPT DATE": string;
  "APPT TIME": string;
  "APPT TYPE": string;
  "Provider LFI": string;
  "Has 2nd Appt Confirmed": string;
  "DATE OF REPORT RUN": string;
  [key: string]: string;
}

const processRowsSchema = z.object({
  runId: z.string().uuid(),
  file: z.instanceof(File),
  config: z.custom<CampaignConfig>(),
});

async function parseFile(file: File): Promise<CSVRow[]> {
  const fileType = file.name.split(".").pop()?.toLowerCase();

  if (fileType === "csv") {
    const text = await file.text();
    const { data } = parseCSV<CSVRow>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });
    return data;
  } else if (fileType === "xlsx" || fileType === "xls") {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = readXLSX(arrayBuffer);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = xlsxUtils.sheet_to_json<CSVRow>(worksheet, {
      raw: false,
      defval: "",
    });
    return data;
  }

  throw new Error("Unsupported file type. Please upload a CSV or Excel file.");
}

export async function processRows(data: z.infer<typeof processRowsSchema>) {
  const validated = processRowsSchema.parse(data);
  const { runId, file, config } = validated;

  try {
    // Get organization ID from run
    const run = (await db.query.runs.findFirst({
      where: eq(runs.id, runId),
      with: {
        campaign: {
          columns: {
            orgId: true,
          },
        },
      },
    })) as RunWithCampaign;

    if (!run?.campaign?.orgId) {
      throw new Error("Run not found or missing organization ID");
    }

    const orgId = run.campaign.orgId;

    // Parse the file based on its type
    const parsedRows = await parseFile(file);

    console.log("Parsed rows:", parsedRows.length);

    // Process each row
    const processedRows = await Promise.all(
      parsedRows.map(async (row, index) => {
        try {
          // Convert all values to strings and handle NaN
          const processedRow = Object.entries(row).reduce(
            (acc, [key, value]) => {
              acc[key] =
                value === null || value === undefined || value === "NaN"
                  ? ""
                  : String(value).trim();
              return acc;
            },
            {} as Record<string, string>
          );

          // Process patient data
          const data = await processPatientData(processedRow, config);
          const patientDataResult = patientDataSchema.safeParse(data);

          if (!patientDataResult.success) {
            console.error("Invalid patient data:", patientDataResult.error);
            throw new Error(
              `Invalid patient data: ${JSON.stringify(patientDataResult.error)}`
            );
          }

          const patientData = patientDataResult.data;

          // Find or create patient and link to organization using a transaction
          const patientWithOrgLink = await db.transaction(async (tx) => {
            // Check if patient exists by patientHash
            const existingPatient = await tx.query.patients.findFirst({
              where: eq(patients.patientHash, patientData.patient_hash),
            });

            let patientId;

            if (existingPatient) {
              // Update existing patient
              patientId = existingPatient.id;

              // Update the patient data if needed
              await tx
                .update(patients)
                .set({
                  firstName: patientData.first_name,
                  lastName: patientData.last_name,
                  primaryPhone: patientData.phone,
                  dob: new Date(patientData.dob).toISOString(),
                  isMinor: patientData.is_minor,
                  updatedAt: new Date(),
                  secondaryPhone: patientData.secondary_phone || null,
                })
                .where(eq(patients.id, patientId));
            } else {
              // Create new patient
              patientId = uuidv4();
              const result = await tx
                .insert(patients)
                .values({
                  id: patientId,
                  emrId: patientData.emr_id || null,
                  patientHash: patientData.patient_hash,
                  lastName: patientData.last_name,
                  firstName: patientData.first_name,
                  primaryPhone: patientData.phone,
                  secondaryPhone: patientData.secondary_phone || null,
                  dob: new Date(patientData.dob).toISOString(),
                  isMinor: patientData.is_minor,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                })
                .returning({ id: patients.id });

              patientId = result[0].id;
            }

            // Now check if this patient is already linked to this organization
            const existingLink = await tx.query.organizationPatients.findFirst({
              where: and(
                eq(organizationPatients.orgId, orgId),
                eq(organizationPatients.patientId, patientId)
              ),
            });

            if (existingLink) {
              // Update the link
              await tx
                .update(organizationPatients)
                .set({
                  emrIdInOrg: patientData.emr_id || null,
                  updatedAt: new Date(),
                  isActive: true,
                })
                .where(
                  and(
                    eq(organizationPatients.orgId, orgId),
                    eq(organizationPatients.patientId, patientId)
                  )
                );
            } else {
              // Create new link
              await tx.insert(organizationPatients).values({
                orgId,
                patientId,
                emrIdInOrg: patientData.emr_id || null,
                isActive: true,
              });
            }

            return { id: patientId };
          });

          console.log("Patient processed with ID:", patientWithOrgLink.id);

          // Process campaign-specific data
          const campaignData = await processCampaignData(processedRow, config);

          // Structure the row object according to the schema
          const rowVariables = {
            phone: patientData.phone,
            firstName: patientData.first_name,
            lastName: patientData.last_name,
            dob: patientData.dob, // Store as string in variables
            patientHash: patientData.patient_hash,
            emrId: patientData.emr_id || "",
            isMinor: patientData.is_minor,
            secondaryPhone: patientData.secondary_phone || "",
            ...campaignData,
          };

          return {
            id: uuidv4(),
            orgId,
            runId,
            patientId: patientWithOrgLink.id,
            variables: rowVariables,
            status: "pending" as const,
            sortIndex: index,
            postCallData: null,
            error: null,
            retellCallId: null,
          };
        } catch (error) {
          console.error("Error processing row:", error);
          console.error("Row data:", JSON.stringify(row, null, 2));
          return null; // Skip invalid rows
        }
      })
    );

    // Filter out failed rows
    const validRows = processedRows.filter(
      (row): row is NonNullable<typeof row> => row !== null
    );

    console.log("Valid rows to insert:", validRows.length);

    // Update run with processing stats
    const totalRecords = parsedRows.length;
    const validRecords = validRows.length;
    const invalidRecords = totalRecords - validRecords;

    await db
      .update(runs)
      .set({
        status: "ready",
        metadata: {
          rows: {
            total: validRecords,
            invalid: invalidRecords,
          },
          calls: {
            total: validRecords,
            completed: 0,
            failed: 0,
            pending: validRecords,
            calling: 0,
            skipped: 0,
            voicemail: 0,
            connected: 0,
            converted: 0,
          },
          run: {
            error: "",
          },
        },
      })
      .where(eq(runs.id, runId));

    // Insert valid rows in batches
    const BATCH_SIZE = 100;
    for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
      const batch = validRows.slice(i, i + BATCH_SIZE);
      console.log(
        `Inserting batch ${i / BATCH_SIZE + 1} of ${Math.ceil(
          validRows.length / BATCH_SIZE
        )}`
      );

      // Ensure each row has the correct type for status
      const typedBatch = batch.map((row) => ({
        ...row,
        status: row.status as
          | "pending"
          | "calling"
          | "completed"
          | "failed"
          | "skipped",
      }));

      const result = await db.insert(rowsTable).values(typedBatch).returning();
      console.log(`Inserted ${result.length} rows`);
    }

    return {
      success: true,
      totalRecords,
      validRecords,
      invalidRecords,
      rows: validRows,
      runId,
      orgId,
    };
  } catch (error) {
    console.error("Error processing run data:", error);

    // Update run status to failed
    await db.update(runs).set({ status: "failed" }).where(eq(runs.id, runId));

    throw error;
  }
}
