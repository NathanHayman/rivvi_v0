"use client";

import { useOrganizationList } from "@clerk/nextjs";
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

const createClerkOrgSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
});

const createDbOrgSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  clerkId: z.string().min(1),
  phone: z.string().min(1),
  timezone: z.string().min(1),
  officeHours: z.object({
    start: z.string().min(1),
    end: z.string().min(1),
    days: z.array(z.number()),
  }),
  concurrencyLimit: z.number().min(1).max(20),
});

export type CreateOrgProps = {
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
};

export default function CreateOrg({ showModal, setShowModal }: CreateOrgProps) {
  const { isLoaded, createOrganization } = useOrganizationList();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [clerkOrgId, setClerkOrgId] = useState<string>("");

  const form = useForm<z.infer<typeof createDbOrgSchema>>({
    resolver: zodResolver(createDbOrgSchema),
    defaultValues: {
      name: "test org",
      slug: "test-org",
      clerkId: "",
      phone: "",
      timezone: "",
      officeHours: {
        start: "",
        end: "",
        days: [],
      },
      concurrencyLimit: 10,
    },
  });

  if (!isLoaded) return null;

  const handleCreateClerkOrg = async (
    values: z.infer<typeof createClerkOrgSchema>
  ) => {
    try {
      setIsLoading(true);
      const org = await createOrganization({
        name: values.name,
        slug: values.slug,
      });
      setClerkOrgId(org.id);
      form.setValue("clerkId", org.id);
      form.setValue("name", values.name);
      form.setValue("slug", values.slug);
      setStep(2);
    } catch (error) {
      toast.error("Failed to create organization in Clerk");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof createDbOrgSchema>) {
    console.log("onSubmit", values);
    try {
      setIsLoading(true);
      // Here you would typically send a request to your backend to create the organization in your database
      console.log("Creating organization in database:", values);
      toast.success("Organization created successfully");
      // setShowModal(false);
    } catch (error) {
      toast.error("Failed to create organization in database");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  console.log(step);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full p-2"
      >
        <div className="space-y-6">
          {step === 1 && (
            <>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Organization" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="my-org" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {step === 2 && (
            <>
              <FormField
                control={form.control}
                name="clerkId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clerk Organization ID</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                  </FormItem>
                )}
              />

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
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
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
                        checked={field.value.includes(1)}
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
            </>
          )}

          {step === 1 && (
            <Button
              onClick={() => handleCreateClerkOrg(form.getValues())}
              disabled={isLoading}
            >
              {isLoading && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Next
            </Button>
          )}
          {step === 2 && (
            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
