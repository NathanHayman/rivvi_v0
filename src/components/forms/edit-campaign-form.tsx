"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createCampaign } from "@/server/actions/campaigns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Field configuration schema
const fieldConfigSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  possibleColumns: z.array(z.string()).min(1),
  transform: z.enum(["date", "time", "phone", "text", "provider"]).optional(),
  required: z.boolean().default(true),
  description: z.string().optional(),
});

// Post-call field schema
const postCallFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["boolean", "string", "date", "enum"]),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(true),
  description: z.string().optional(),
  isMainKPI: z.boolean().optional(),
});

// Complete campaign schema
const createCampaignSchema = z.object({
  name: z.string().min(1, "Name is required"),
  agentId: z.string().min(1, "Agent ID is required"),
  type: z.string().min(1, "Campaign type is required"),
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

const EditCampaignForm = ({ orgId }: { orgId: string }) => {
  const form = useForm<z.infer<typeof createCampaignSchema>>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      name: "",
      agentId: "",
      type: "confirmations",
      config: {
        variables: {
          patient: {
            fields: [
              {
                key: "firstName",
                label: "First Name",
                possibleColumns: [
                  "Patient First Name",
                  "first_name",
                  "firstName",
                ],
                transform: "text",
                required: true,
              },
              {
                key: "lastName",
                label: "Last Name",
                possibleColumns: ["Patient Last Name", "last_name", "lastName"],
                transform: "text",
                required: true,
              },
              {
                key: "dob",
                label: "Date of Birth",
                possibleColumns: ["Patient DOB", "DOB", "dateOfBirth"],
                transform: "date",
                required: true,
              },
              {
                key: "phone",
                label: "Phone Number",
                possibleColumns: ["Cell Phone", "Primary Phone", "phone"],
                transform: "phone",
                required: true,
              },
            ],
            validation: {
              requireValidPhone: true,
              requireValidDOB: true,
              requireName: true,
            },
          },
          campaign: {
            fields: [],
          },
        },
        postCall: {
          standard: {
            fields: [
              {
                key: "patient_reached",
                label: "Patient Reached",
                type: "boolean",
                required: true,
              },
              {
                key: "in_voicemail",
                label: "Left Voicemail",
                type: "boolean",
                required: true,
              },
              {
                key: "callback_requested",
                label: "Callback Requested",
                type: "boolean",
                required: true,
              },
              {
                key: "callback_date_time",
                label: "Callback Date/Time",
                type: "date",
                required: false,
              },
            ],
          },
          campaign: {
            fields: [],
          },
        },
      },
    },
  });

  // Field arrays for dynamic fields
  const { fields: campaignFields, append: appendCampaignField } = useFieldArray(
    {
      control: form.control,
      name: "config.variables.campaign.fields",
    }
  );

  const { fields: postCallFields, append: appendPostCallField } = useFieldArray(
    {
      control: form.control,
      name: "config.postCall.campaign.fields",
    }
  );

  async function onSubmit(values: z.infer<typeof createCampaignSchema>) {
    try {
      await createCampaign(orgId, values);
      toast.success("Campaign created successfully");
    } catch (error) {
      toast.error("Failed to create campaign");
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Campaign Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="January Appointment Confirmations"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="agentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Retell Agent ID</FormLabel>
                <FormControl>
                  <Input placeholder="agent_abc123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Tabs defaultValue="variables" className="w-full">
          <TabsList>
            <TabsTrigger value="variables">Variables</TabsTrigger>
            <TabsTrigger value="postCall">Post-Call Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="variables">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Variables</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Campaign-specific field configuration */}
                <div className="space-y-4">
                  {campaignFields.map((field, index) => (
                    <div key={field.id} className="grid gap-4">
                      {/* Render campaign field configuration */}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      appendCampaignField({
                        key: "",
                        label: "",
                        possibleColumns: [],
                        required: true,
                      })
                    }
                  >
                    Add Campaign Variable
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="postCall">
            <Card>
              <CardHeader>
                <CardTitle>Post-Call Analysis Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Post-call field configuration */}
                <div className="space-y-4">
                  {postCallFields.map((field, index) => (
                    <div key={field.id} className="grid gap-4">
                      {/* Render post-call field configuration */}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      appendPostCallField({
                        key: "",
                        label: "",
                        type: "boolean",
                        required: true,
                      })
                    }
                  >
                    Add Post-Call Field
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Button type="submit">Update Campaign</Button>
      </form>
    </Form>
  );
};

export { EditCampaignForm };
