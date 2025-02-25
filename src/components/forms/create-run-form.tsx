"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { processRows } from "@/server/actions/process-rows";
import { createRun } from "@/server/actions/runs";
import { Campaign, CampaignConfig } from "@/server/db/schema/campaigns";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const createRunSchema = z.object({
  name: z.string().min(1, "Name is required"),
  scheduledTime: z.date().optional(),
  file: z.instanceof(File).optional(),
});

interface CreateRunFormProps {
  campaign: Campaign;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateRunForm = ({
  campaign,
  open,
  onOpenChange,
}: CreateRunFormProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(open);
  const form = useForm<z.infer<typeof createRunSchema>>({
    resolver: zodResolver(createRunSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(values: z.infer<typeof createRunSchema>) {
    setIsProcessing(true);
    try {
      // Create the run first
      const run = await createRun({
        name: values.name,
        campaignId: campaign.id,
        scheduledTime: values.scheduledTime?.toISOString(),
      });

      // If a file was uploaded, process it
      if (values.file) {
        console.log("Processing file", values.file);
        await processRows({
          runId: run.id,
          file: values.file,
          config: campaign.config as CampaignConfig,
        });
      }

      toast.success("Run created successfully");
      setIsOpen(false);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create run");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full"
      >
        <div className="px-6 py-4 border-b bg-accent/60 rounded-t-lg">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold">
              Create Run
            </SheetTitle>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-6 py-8 space-y-8">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Run Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="January Week 1 Calls"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="scheduledTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Schedule Start (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="file"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel>Upload Data File</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                onChange(file);
                              }
                            }}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <div className="border-t p-6">
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isProcessing}>
              {isProcessing && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Run
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export { CreateRunForm };
