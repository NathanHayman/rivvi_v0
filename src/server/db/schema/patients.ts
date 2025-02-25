// src/server/db/schema/patients.ts
import {
  boolean,
  date,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Patients are no longer directly tied to organizations - they use a junction table
export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  emrId: text("emr_id"),
  patientHash: text("patient_hash").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dob: date("dob").notNull(),
  isMinor: boolean("is_minor").notNull().default(false),
  primaryPhone: text("primary_phone").notNull(),
  secondaryPhone: text("secondary_phone"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
