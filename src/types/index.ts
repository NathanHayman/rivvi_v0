import {
  calls,
  campaigns,
  organizationPatients,
  organizations,
  patients,
  rows,
  runs,
  users,
} from "@/server/db/schema";

export type TCampaign = typeof campaigns.$inferSelect;
export type TRun = typeof runs.$inferSelect;
export type TRow = typeof rows.$inferSelect;
export type TPatient = typeof patients.$inferSelect;
export type TCall = typeof calls.$inferSelect;
export type TOrg = typeof organizations.$inferSelect;
export type TUser = typeof users.$inferSelect;
export type TOrganizationPatient = typeof organizationPatients.$inferSelect;
