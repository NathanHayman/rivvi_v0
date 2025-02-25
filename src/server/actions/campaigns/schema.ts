import { z } from "zod";

// Field configuration schemas
export const fieldConfigSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  possibleColumns: z.array(z.string()).min(1),
  transform: z.enum(["date", "time", "phone", "text", "provider"]).optional(),
  required: z.boolean().default(true),
  description: z.string().optional(),
});

export const postCallFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["boolean", "string", "date", "enum"]),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(true),
  description: z.string().optional(),
  isMainKPI: z.boolean().optional(),
});

// Complete campaign schema
export const createCampaignSchema = z.object({
  name: z.string().min(1),
  agentId: z.string().min(1),
  type: z.string().min(1),
  config: z.object({
    variables: z.object({
      patient: z.object({
        fields: z.array(fieldConfigSchema),
        validation: z.object({
          requireValidPhone: z.boolean(),
          requireValidDOB: z.boolean(),
          requireName: z.boolean(),
        }),
      }),
      campaign: z.object({
        fields: z.array(fieldConfigSchema),
      }),
    }),
    postCall: z.object({
      standard: z.object({
        fields: z.array(postCallFieldSchema),
      }),
      campaign: z.object({
        fields: z.array(postCallFieldSchema),
      }),
    }),
  }),
});

export const updateCampaignSchema = z.object({
  name: z.string().min(1).optional(),
  agentId: z.string().min(1).optional(),
  enabled: z.boolean().optional(),
  config: z
    .object({
      variables: z
        .object({
          patient: z
            .object({
              fields: z.array(fieldConfigSchema),
              validation: z.object({
                requireValidPhone: z.boolean(),
                requireValidDOB: z.boolean(),
                requireName: z.boolean(),
              }),
            })
            .optional(),
          campaign: z
            .object({
              fields: z.array(fieldConfigSchema),
            })
            .optional(),
        })
        .optional(),
      postCall: z
        .object({
          standard: z
            .object({
              fields: z.array(postCallFieldSchema),
            })
            .optional(),
          campaign: z
            .object({
              fields: z.array(postCallFieldSchema),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),
});

// // schemas/campaign.ts
// import { z } from "zod";

// // Define the structure for mapping incoming columns to standardized fields
// export const columnMappingSchema = z.record(z.array(z.string()));

// // Define schema for base patient fields required in every campaign
// export const basePatientFieldsSchema = z.object({
//   firstName: columnMappingSchema,
//   lastName: columnMappingSchema,
//   dob: columnMappingSchema,
//   phone: columnMappingSchema,
// });

// // Define schema for campaign-specific field configuration
// export const campaignFieldSchema = z.object({
//   key: z.string(),
//   possibleColumns: z.array(z.string()),
//   transform: z.enum(["date", "time", "phone", "text", "provider"]).optional(),
//   required: z.boolean().default(true),
// });

// // Schema for the full campaign configuration
// export const createCampaignSchema = z.object({
//   name: z.string().min(1),
//   agentId: z.string(),
//   type: z.enum(["confirmations", "no_shows", "recalls"]),
//   // Base configuration that applies to all campaigns
//   baseConfig: z.object({
//     patientFields: basePatientFieldsSchema,
//     validation: z.object({
//       requireValidPhone: z.boolean().default(true),
//       requireValidDOB: z.boolean().default(true),
//       requireName: z.boolean().default(true),
//     }),
//   }),
//   // Campaign-specific field configurations
//   campaignFields: z.array(campaignFieldSchema),
// });

// export const updateCampaignSchema = createCampaignSchema.partial();

// // Example campaign configuration for Confirmations
// export const confirmationsCampaignConfig = {
//   name: "Appointment Confirmations",
//   agentId: "your-agent-id",
//   type: "confirmations",
//   baseConfig: {
//     patientFields: {
//       firstName: ["Patient First Name", "first_name", "firstName"],
//       lastName: ["Patient Last Name", "last_name", "lastName"],
//       dob: ["Patient DOB", "DOB", "dateOfBirth"],
//       phone: ["Cell Phone", "Primary Phone", "phone", "contactNumber"],
//     },
//     validation: {
//       requireValidPhone: true,
//       requireValidDOB: true,
//       requireName: true,
//     },
//   },
//   campaignFields: [
//     {
//       key: "appt_location",
//       possibleColumns: ["APPT LOCATION", "Location", "Facility"],
//       transform: "text",
//       required: true,
//     },
//     {
//       key: "appt_date",
//       possibleColumns: ["APPT DATE", "Appointment Date"],
//       transform: "date",
//       required: true,
//     },
//     {
//       key: "appt_time",
//       possibleColumns: ["APPT TIME", "Appointment Time"],
//       transform: "time",
//       required: true,
//     },
//     {
//       key: "appt_type",
//       possibleColumns: ["APPT TYPE", "Appointment Type", "Visit Type"],
//       transform: "text",
//       required: true,
//     },
//     {
//       key: "appt_provider",
//       possibleColumns: ["Provider LFI", "Provider", "Doctor"],
//       transform: "provider",
//       required: true,
//     },
//   ],
// } as const;
