// src/server/db/schema/relations.ts
import { relations } from "drizzle-orm";
import { calls } from "./calls";
import { campaigns } from "./campaigns";
import { organizationPatients } from "./organization-patients";
import { organizations } from "./organizations";
import { patients } from "./patients";
import { rows } from "./rows";
import { runs } from "./runs";
import { users } from "./users";

// Define all relations between tables
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  campaigns: many(campaigns),
  runs: many(runs),
  organizationPatients: many(organizationPatients),
  rows: many(rows),
  calls: many(calls),
}));

export const usersRelations = relations(users, ({ one }) => ({
  organization: one(organizations, {
    fields: [users.orgId],
    references: [organizations.id],
  }),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [campaigns.orgId],
    references: [organizations.id],
  }),
  runs: many(runs),
}));

export const runsRelations = relations(runs, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [runs.orgId],
    references: [organizations.id],
  }),
  campaign: one(campaigns, {
    fields: [runs.campaignId],
    references: [campaigns.id],
  }),
  rows: many(rows),
  calls: many(calls),
}));

export const patientsRelations = relations(patients, ({ many }) => ({
  organizationPatients: many(organizationPatients),
  rows: many(rows),
  calls: many(calls),
}));

export const organizationPatientsRelations = relations(
  organizationPatients,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationPatients.orgId],
      references: [organizations.id],
    }),
    patient: one(patients, {
      fields: [organizationPatients.patientId],
      references: [patients.id],
    }),
  })
);

export const rowsRelations = relations(rows, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [rows.orgId],
    references: [organizations.id],
  }),
  run: one(runs, {
    fields: [rows.runId],
    references: [runs.id],
  }),
  patient: one(patients, {
    fields: [rows.patientId],
    references: [patients.id],
  }),
  calls: many(calls),
}));

export const callsRelations = relations(calls, ({ one }) => ({
  organization: one(organizations, {
    fields: [calls.orgId],
    references: [organizations.id],
  }),
  run: one(runs, {
    fields: [calls.runId],
    references: [runs.id],
  }),
  row: one(rows, {
    fields: [calls.rowId],
    references: [rows.id],
  }),
  patient: one(patients, {
    fields: [calls.patientId],
    references: [patients.id],
  }),
}));
