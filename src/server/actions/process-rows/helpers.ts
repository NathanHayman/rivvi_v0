import { formatBirthDate } from "@/lib/helpers/format-dates";
import { CampaignConfig } from "@/types/zod";
import { createHash } from "crypto";
import { format, parse } from "date-fns";
import { z } from "zod";

export const patientDataSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().min(10),
  secondary_phone: z.string().min(10).optional().nullable(),
  dob: z.string(), // format: M/d/yyyy
  is_minor: z.string().transform((val) => val === "TRUE"),
  patient_hash: z.string().min(1),
  emr_id: z.string().optional().nullable(),
});

// Find matching column from possible names
export function findColumn(
  row: Record<string, string>,
  possibleNames: string[]
): string | undefined {
  // First try exact match
  const exactMatch = Object.keys(row).find((key) =>
    possibleNames.some((name) => key === name)
  );
  if (exactMatch) return exactMatch;

  // Then try case-insensitive includes match
  const columnName = Object.keys(row).find((key) =>
    possibleNames.some((name) => key.toLowerCase().includes(name.toLowerCase()))
  );
  return columnName;
}

// Format phone number to E.164 format
export function formatPhoneNumber(phone: string | number | null): string {
  if (!phone) throw new Error("Phone number is required");

  // Handle NaN
  if (typeof phone === "number" && isNaN(phone)) {
    throw new Error("Invalid phone number: NaN");
  }

  const cleaned = String(phone).replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+${cleaned}`;
  }
  throw new Error("Invalid phone number format");
}

// Format date to desired format (e.g., "Friday, February 7, 2025")
export function formatDate(date: string): string {
  if (!date) throw new Error("Date is required");

  // Parse date in M/D/YY format
  const parsed = parse(date, "M/d/yy", new Date());
  if (isNaN(parsed.getTime())) {
    throw new Error("Invalid date format");
  }

  return format(parsed, "EEEE, MMMM d, yyyy");
}

export function formatShortDate(date: string): string {
  if (!date) throw new Error("Date is required");

  // Parse date in M/D/YYYY format
  const parsed = parse(date, "M/d/yyyy", new Date());
  if (isNaN(parsed.getTime())) {
    throw new Error("Invalid date format");
  }

  return format(parsed, "M/d/yyyy");
}

// Format time to 12-hour format with AM/PM
export function formatTime(time: string): string {
  if (!time) throw new Error("Time is required");

  // Parse time in HH:mm format
  const [hours, minutes] = time.split(":");
  const parsed = parse(`${hours}:${minutes}`, "H:mm", new Date());
  if (isNaN(parsed.getTime())) {
    throw new Error("Invalid time format");
  }

  return format(parsed, "h:mm a");
}

// Parse full name into first and last name
function parseFullName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = fullName.trim().split(" ");
  if (parts.length < 2) {
    throw new Error("Full name must contain both first and last name");
  }

  // Last word is the last name, everything else is first name
  const lastName = parts.pop() || "";
  const firstName = parts.join(" ");

  return { firstName, lastName };
}

interface ProcessedPatientData {
  emr_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  secondary_phone: string | null;
  dob: string;
  is_minor: boolean;
  patient_hash: string;
}

// Process patient data based on configuration
export async function processPatientData(
  row: Record<string, string>,
  config: CampaignConfig
): Promise<ProcessedPatientData> {
  const processedData: Record<string, any> = {};

  // Handle emr_id
  const emrIdField = config.variables.patient.fields.find(
    (f) => f.key === "emr_id"
  );
  if (!emrIdField) throw new Error("EMR ID field configuration missing");
  const emrIdCol = findColumn(row, emrIdField.possibleColumns);
  if (!emrIdCol) throw new Error("EMR ID column not found");
  processedData.emr_id = row[emrIdCol].trim();

  // Handle first name
  const firstNameField = config.variables.patient.fields.find(
    (f) => f.key === "first_name"
  );
  if (!firstNameField)
    throw new Error("First name field configuration missing");
  const firstNameCol = findColumn(row, firstNameField.possibleColumns);
  if (!firstNameCol) throw new Error("First name column not found");
  processedData.first_name = row[firstNameCol].trim();

  // Handle last name
  const lastNameField = config.variables.patient.fields.find(
    (f) => f.key === "last_name"
  );
  if (!lastNameField) throw new Error("Last name field configuration missing");
  const lastNameCol = findColumn(row, lastNameField.possibleColumns);
  if (!lastNameCol) throw new Error("Last name column not found");
  processedData.last_name = row[lastNameCol].trim();

  // Handle phone
  const phoneField = config.variables.patient.fields.find(
    (f) => f.key === "phone"
  );
  if (!phoneField) throw new Error("Phone field configuration missing");

  // Try cell phone first, then primary phone, then home phone
  const cellPhone = row["Cell Phone"];
  const primaryPhone = row["Primary Phone"];
  const homePhone = row["Home Phone"];

  let phone = null;
  if (cellPhone && !isNaN(Number(cellPhone))) phone = cellPhone;
  else if (primaryPhone && !isNaN(Number(primaryPhone))) phone = primaryPhone;
  else if (homePhone && !isNaN(Number(homePhone))) phone = homePhone;

  if (!phone) throw new Error("No valid phone number found");
  processedData.phone = formatPhoneNumber(phone);

  // the secondary phone should be the other phone number from the same row if they are different
  const secondaryPhone = row["Cell Phone"];
  if (secondaryPhone && !isNaN(Number(secondaryPhone))) {
    processedData.secondary_phone = formatPhoneNumber(secondaryPhone);
  } else {
    processedData.secondary_phone = null;
  }

  // Handle DOB
  const dobField = config.variables.patient.fields.find((f) => f.key === "dob");
  if (!dobField) throw new Error("DOB field configuration missing");
  const dobCol = findColumn(row, dobField.possibleColumns);
  if (!dobCol) throw new Error("DOB column not found");
  processedData.dob = formatBirthDate(row[dobCol]); // format: M/d/yyyy

  // Calculate is_minor
  const dobDate = parse(row[dobCol], "M/d/yyyy", new Date());
  processedData.is_minor = (
    new Date().getFullYear() - dobDate.getFullYear() <
    18
  )
    .toString()
    .toUpperCase();

  // Generate patient hash
  processedData.patient_hash = createHash("sha256")
    .update(`${processedData.phone}${row[dobCol]}`)
    .digest("hex");

  return {
    first_name: processedData.first_name,
    last_name: processedData.last_name,
    phone: processedData.phone,
    secondary_phone: processedData.secondary_phone,
    dob: processedData.dob,
    is_minor: processedData.is_minor,
    patient_hash: processedData.patient_hash,
    emr_id: processedData.emr_id,
  };
}

// Process campaign-specific data based on configuration
export async function processCampaignData(
  row: Record<string, string>,
  config: CampaignConfig
): Promise<Record<string, string>> {
  const processedData: Record<string, string> = {};

  for (const field of config.variables.campaign.fields) {
    const columnName = findColumn(row, field.possibleColumns);
    if (!columnName) {
      if (field.required) {
        throw new Error(`Required field ${field.key} not found in CSV`);
      }
      continue;
    }

    const value = row[columnName];
    if (!value && field.required) {
      throw new Error(`Required field ${field.key} is empty`);
    }

    try {
      switch (field.transform) {
        case "date":
          processedData[field.key] = formatDate(value);
          break;
        case "time":
          processedData[field.key] = formatTime(value);
          break;
        case "provider":
          processedData[field.key] = value.replace(/\s*\([^)]*\)/g, "").trim();
          break;
        case "text":
        default:
          processedData[field.key] = value.trim();
      }
    } catch (error) {
      throw new Error(
        `Error processing ${field.key}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  return processedData;
}
