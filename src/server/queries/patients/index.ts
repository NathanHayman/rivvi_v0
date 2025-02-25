import { db } from "@/server/db";
import { organizationPatients, patients } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getPatientSchema } from "./schema";

export async function getPatientById(props: z.infer<typeof getPatientSchema>) {
  // TODO: Implement
  console.log("getPatient", props);
}

export async function getPatientByPhoneNumber(phoneNumber: string) {
  try {
    if (!phoneNumber) {
      throw new Error("Phone number is required");
    }

    const patient = await db.query.patients.findFirst({
      where: eq(patients.primaryPhone, phoneNumber),
    });

    if (!patient) {
      throw new Error("Patient not found");
    }

    return patient;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get patient by phone number");
  }
}

export async function getPatientsByOrgId({ orgId }: { orgId: string }) {
  // Get all patients for the organization using the organizationPatients junction table
  const patientRelations = await db.query.organizationPatients.findMany({
    where: and(
      eq(organizationPatients.orgId, orgId),
      eq(organizationPatients.isActive, true)
    ),
    with: {
      patient: true,
    },
  });

  // Transform the result to return just the patient data with org-specific fields
  return patientRelations.map((relation) => ({
    ...relation.patient,
    emrId: relation.emrIdInOrg, // Use the organization-specific EMR ID
  }));
}
