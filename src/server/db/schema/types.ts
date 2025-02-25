// src/server/db/schema/types.ts
import { calls } from "./calls";
import { campaigns } from "./campaigns";
import { organizationPatients } from "./organization-patients";
import { organizations } from "./organizations";
import { patients } from "./patients";
import { rows } from "./rows";
import { runs } from "./runs";
import { users } from "./users";

// Export inferred types from all tables
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;

export type Run = typeof runs.$inferSelect;
export type NewRun = typeof runs.$inferInsert;

export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;

export type OrganizationPatient = typeof organizationPatients.$inferSelect;
export type NewOrganizationPatient = typeof organizationPatients.$inferInsert;

export type Row = typeof rows.$inferSelect;
export type NewRow = typeof rows.$inferInsert;

export type Call = typeof calls.$inferSelect;
export type NewCall = typeof calls.$inferInsert;
