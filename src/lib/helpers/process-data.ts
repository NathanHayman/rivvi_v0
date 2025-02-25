// helpers/process-data.ts
import { format, parse } from "date-fns";

interface CampaignConfig {
  baseConfig: {
    patientFields: Record<string, string[]>;
  };
  campaignFields: Array<{
    key: string;
    possibleColumns: string[];
    transform?: string;
  }>;
}

export function findColumn(row: any, possibilities: string[]): string {
  const found = possibilities.find((p) => row[p] !== undefined);
  if (!found) {
    throw new Error(
      `Required column not found. Possible columns: ${possibilities.join(", ")}`
    );
  }
  return found;
}

export function formatPhoneNumber(phone: string | number): string {
  if (!phone) throw new Error("Phone number is required");
  const cleaned = String(phone).replace(/\D/g, "");
  if (cleaned.length !== 10) throw new Error("Invalid phone number length");
  return `+1${cleaned}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) throw new Error("Date is required");
  const parsed = parse(dateStr, "M/d/yy", new Date());
  return format(parsed, "EEEE, MMMM d, yyyy");
}

export function formatTime(timeStr: string): string {
  if (!timeStr) throw new Error("Time is required");
  const [hours, minutes] = timeStr.split(":");
  const time = parse(`${hours}:${minutes}`, "H:mm", new Date());
  return format(time, "h:mm a");
}

export function formatProvider(provider: string): string {
  if (!provider) throw new Error("Provider is required");
  // Remove any extra annotations like "(3)" from provider names
  return provider.replace(/\s*\([^)]*\)/g, "").trim();
}

export function processField(value: any, transform?: string): any {
  if (!value) return value;

  switch (transform) {
    case "date":
      return formatDate(value);
    case "time":
      return formatTime(value);
    case "phone":
      return formatPhoneNumber(value);
    case "provider":
      return formatProvider(value);
    case "text":
    default:
      return String(value).trim();
  }
}

export function extractCampaignVariables(
  row: any,
  campaign: CampaignConfig
): Record<string, any> {
  const processed: Record<string, any> = {
    patient: {},
    campaign: {},
  };

  // Process base patient fields
  for (const [key, possibilities] of Object.entries(
    campaign.baseConfig.patientFields
  )) {
    const columnName = findColumn(row, possibilities);
    processed.patient[key] = processField(
      row[columnName],
      key === "phone" ? "phone" : undefined
    );
  }

  // Add is_minor flag based on DOB
  const dobDate = parse(processed.patient.dob, "M/d/yy", new Date());
  processed.patient.is_minor = (
    new Date().getFullYear() - dobDate.getFullYear() <
    18
  )
    .toString()
    .toUpperCase();

  // Process campaign-specific fields
  for (const field of campaign.campaignFields) {
    const columnName = findColumn(row, field.possibleColumns);
    processed.campaign[field.key] = processField(
      row[columnName],
      field.transform
    );
  }

  return processed;
}
