// src/server/db/schema/organizationPatients.ts
import {
  boolean,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { patients } from "./patients";

// Junction table for many-to-many relationship between organizations and patients
export const organizationPatients = pgTable(
  "organization_patients",
  {
    orgId: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    patientId: uuid("patient_id")
      .references(() => patients.id)
      .notNull(),
    isActive: boolean("is_active").default(true),
    emrIdInOrg: text("emr_id_in_org"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.orgId, table.patientId] }),
    };
  }
);
