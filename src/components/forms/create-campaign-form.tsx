"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagInput } from "@/components/ui/tag-input";
import { getQueryClient } from "@/lib/query-client";
import { createCampaign } from "@/server/actions/campaigns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2Icon, Plus, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SheetFooter, SheetTitle } from "../ui/sheet";

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

interface CreateCampaignFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string; // Added orgId as a prop
}

const CreateCampaignForm = ({
  open,
  onOpenChange,
  orgId,
}: CreateCampaignFormProps) => {
  const [isOpen, setIsOpen] = useState(open);

  // Create mutation for campaign creation
  const createCampaignMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createCampaignSchema>) => {
      const result = await createCampaign(orgId, data);
      return result;
    },
    onSuccess: () => {
      // Invalidate campaigns query to refresh the list
      getQueryClient().invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign created successfully");
      setIsOpen(false);
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create campaign: ${error.message}`);
      console.error(error);
    },
  });

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
                key: "emr_id",
                label: "Patient ID",
                possibleColumns: ["Patient Number"],
                transform: "text",
                required: true,
              },
              {
                key: "first_name",
                label: "First Name",
                possibleColumns: [
                  "Patient First Name",
                  "first_name",
                  "firstName",
                  "Patient First Name",
                ],
                transform: "text",
                required: true,
              },
              {
                key: "last_name",
                label: "Last Name",
                possibleColumns: [
                  "Patient Last Name",
                  "last_name",
                  "lastName",
                  "Patient Last Name",
                ],
                transform: "text",
                required: true,
              },
              {
                key: "dob",
                label: "Date of Birth",
                possibleColumns: [
                  "Patient DOB",
                  "DOB",
                  "dateOfBirth",
                  "Patient DOB",
                ],
                transform: "date",
                required: true,
              },
              {
                key: "phone",
                label: "Phone Number",
                possibleColumns: [
                  "Cell Phone",
                  "Primary Phone",
                  "phone",
                  "Primary Phone",
                ],
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
  const {
    fields: campaignFields,
    append: appendCampaignField,
    remove: removeCampaignField,
  } = useFieldArray({
    control: form.control,
    name: "config.variables.campaign.fields",
  });

  const {
    fields: postCallFields,
    append: appendPostCallField,
    remove: removePostCallField,
  } = useFieldArray({
    control: form.control,
    name: "config.postCall.campaign.fields",
  });

  async function onSubmit(values: z.infer<typeof createCampaignSchema>) {
    // Submit using mutation
    createCampaignMutation.mutate(values);
  }

  // Determine if we're loading
  const { pending } = useFormStatus();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full px-2"
      >
        <div className="py-4 border-b rounded-t-lg">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold">
              Create Campaign
            </SheetTitle>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="py-4 space-y-8">
            {/* Campaign details */}
            <Card className="shadow-none lg:py-4 border-none px-2">
              <CardContent className="p-0">
                <div className="space-y-6">
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
              </CardContent>
            </Card>
            {/* Campaign variables */}
            <Card className="shadow-none lg:py-4 border-none">
              <CardContent className="p-0">
                <h2 className="text-lg font-semibold mb-4">
                  Campaign Variables
                </h2>
                <div className="space-y-4">
                  {campaignFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-md">
                      <div className="grid gap-4 mb-4">
                        <FormField
                          control={form.control}
                          name={`config.variables.campaign.fields.${index}.key`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Key</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="appointment_date"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`config.variables.campaign.fields.${index}.label`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Label</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Appointment Date"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`config.variables.campaign.fields.${index}.possibleColumns`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Possible Columns</FormLabel>
                              <FormControl>
                                <TagInput
                                  initialTags={field.value}
                                  onTagsChange={field.onChange}
                                  placeholder="Type column name and press Enter..."
                                  unique
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`config.variables.campaign.fields.${index}.transform`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Transform</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select transform" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="text">Text</SelectItem>
                                  <SelectItem value="date">Date</SelectItem>
                                  <SelectItem value="time">Time</SelectItem>
                                  <SelectItem value="phone">Phone</SelectItem>
                                  <SelectItem value="provider">
                                    Provider
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <FormField
                          control={form.control}
                          name={`config.variables.campaign.fields.${index}.required`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Required
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCampaignField(index)}
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      appendCampaignField({
                        key: "",
                        label: "",
                        possibleColumns: [],
                        required: true,
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Variable
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Post-call fields */}
            <Card className="shadow-none lg:py-4 border-none">
              <CardContent className="p-0">
                <h2 className="text-lg font-semibold mb-4">Post-Call Fields</h2>
                <div className="space-y-4">
                  {postCallFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-md">
                      <div className="grid gap-4 mb-4">
                        <FormField
                          control={form.control}
                          name={`config.postCall.campaign.fields.${index}.key`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Key</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="confirmed_appointment"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`config.postCall.campaign.fields.${index}.label`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Label</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Confirmed Appointment"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`config.postCall.campaign.fields.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="boolean">
                                    Boolean
                                  </SelectItem>
                                  <SelectItem value="string">String</SelectItem>
                                  <SelectItem value="date">Date</SelectItem>
                                  <SelectItem value="enum">Enum</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <FormField
                            control={form.control}
                            name={`config.postCall.campaign.fields.${index}.required`}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Required
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`config.postCall.campaign.fields.${index}.isMainKPI`}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Main KPI
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePostCallField(index)}
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      appendPostCallField({
                        key: "",
                        label: "",
                        type: "boolean",
                        required: true,
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Field
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <SheetFooter className="">
          <div className="flex justify-end gap-4 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              Create Campaign
            </Button>
          </div>
        </SheetFooter>

        {/* Error display from mutation */}
        {createCampaignMutation.isError && (
          <div className="p-2 mt-2 text-sm text-red-600 bg-red-50 rounded-md">
            {createCampaignMutation.error.message}
          </div>
        )}
      </form>
    </Form>
  );
};

export { CreateCampaignForm };
