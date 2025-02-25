"use client";

import { updateOrganization } from "@/server/actions/organizations";
import { Organization } from "@/server/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import PhoneInputWithCountrySelect from "react-phone-number-input";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  CountrySelect,
  FlagComponent,
  PhoneInput,
} from "../ui/phone-number-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const editOrgSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  timezone: z.string().min(1).optional(),
  officeHours: z.object({
    start: z.string().min(1).optional(),
    end: z.string().min(1).optional(),
    days: z.array(z.number()).optional(),
  }),
  concurrencyLimit: z.number().min(1).max(20).optional(),
});

export type EditOrgProps = {
  org: Organization;
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
};

export default function EditOrg({
  org,
  showModal,
  setShowModal,
}: EditOrgProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof editOrgSchema>>({
    resolver: zodResolver(editOrgSchema),
    defaultValues: {
      name: org.name,
      phone: org.phone,
      timezone: org.timezone,
      officeHours: {
        start: org.officeHours?.start,
        end: org.officeHours?.end,
        days: org.officeHours?.days,
      },
      concurrencyLimit: org.concurrentCallLimit ?? 10,
    },
  });

  async function onSubmit(values: z.infer<typeof editOrgSchema>) {
    try {
      setIsLoading(true);
      console.log("Editing organization in Clerk:", values);
      await updateOrganization(org.id, values);
      setShowModal(false);
      toast.success("Organization updated successfully");
    } catch (error) {
      toast.error("Failed to edit organization in Clerk");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full p-2"
      >
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} readOnly />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <PhoneInputWithCountrySelect
                    defaultCountry="US"
                    className="w-full flex"
                    inputComponent={PhoneInput}
                    flagComponent={FlagComponent}
                    countrySelectComponent={CountrySelect}
                    placeholder="Enter phone number"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a timezone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="America/New_York">
                      Eastern Time
                    </SelectItem>
                    <SelectItem value="America/Chicago">
                      Central Time
                    </SelectItem>
                    <SelectItem value="America/Denver">
                      Mountain Time
                    </SelectItem>
                    <SelectItem value="America/Los_Angeles">
                      Pacific Time
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="officeHours.start"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Office Hours Start</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="officeHours.end"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Office Hours End</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="officeHours.days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Office Hours Days</FormLabel>
                <FormControl>
                  <Checkbox
                    checked={field.value?.includes(1)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        field.onChange([1]);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="concurrencyLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Concurrency Limit (1-20)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    {...field}
                    onChange={(e) =>
                      field.onChange(Number.parseInt(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}
