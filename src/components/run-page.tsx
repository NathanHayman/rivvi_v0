"use client";

import {
  AppBody,
  AppBreadcrumbs,
  AppContent,
  AppHeader,
  AppPage,
} from "@/components/layout/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRows, useRun } from "@/hooks/use-run";
import { useRunUpdates } from "@/hooks/use-run-updates";
import { cn } from "@/lib/utils";
import { pauseRun, startRun } from "@/server/actions/runs";
import { PostCallData } from "@/types/zod";
import {
  Clock,
  Download,
  Eye,
  Frown,
  Pause,
  PhoneCall,
  Play,
  Search,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface RunPageClientProps {
  runId: string;
}

// patient variables
// campaign variables

// patient variables will always be "emr id, first name, last name, dob, phone, secondary phone"
// campaign variables will always be different depending on the campaign type (must be dynamic)

function formatDuration(
  startTime: string | undefined | null,
  endTime: string | undefined | null
): string {
  if (!startTime) return "Not started";
  if (!endTime) return "In progress";

  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMinutes = Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60)
  );
  return `${durationMinutes} minutes`;
}

export function RunPageClient({ runId }: RunPageClientProps) {
  const { data: run, isLoading: isLoadingRun } = useRun(runId);
  const { data: rows, isLoading: isLoadingRows } = useRows(runId);

  // Subscribe to real-time updates
  useRunUpdates(runId);

  if (!run || !rows || isLoadingRun || isLoadingRows) {
    return <div>Loading...</div>; // TODO: Add proper loading skeleton
  }

  const { config } = run.campaign;

  const patientVariables = config?.variables?.patient;
  const campaignVariables = config?.variables?.campaign;

  return (
    <AppPage>
      <AppBreadcrumbs
        breadcrumbs={[
          { title: "Campaigns", href: "/campaigns" },
          { title: run.campaign.name, href: `/campaigns/${run.campaign.id}` },
          { title: "Runs", href: `/campaigns/${run.campaign.id}/runs` },
          {
            title: run.name,
            href: `/campaigns/${run.campaign.id}/runs/${run.id}`,
          },
        ]}
      />
      <AppBody>
        <AppHeader
          title={run.name}
          buttons={[
            run.status === "running" ? (
              <Button
                key="pause"
                variant="default"
                size="sm"
                onClick={() => pauseRun({ id: run.id })}
              >
                Pause Run
                <Pause className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                key="start"
                variant="default"
                size="sm"
                onClick={() => startRun({ id: run.id })}
              >
                Start Run
                <Play className="h-4 w-4" />
              </Button>
            ),
          ]}
        />
        <AppContent>
          <div className="space-y-6">
            {/* Run Progress */}
            <Card className="rounded-xl bg-card dark:bg-zinc-900/60 border shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between relative">
                  <div>
                    <CardTitle>Run Progress</CardTitle>
                    <CardDescription>
                      {run.status === "running" && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                          <Clock className="h-4 w-4" />
                          <span>Total Rows: {run.metadata?.rows?.total}</span>
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "capitalize",
                      run.status === "running" &&
                        "bg-green-600/20 text-green-600 hover:bg-green-600/30",
                      run.status === "paused" &&
                        "bg-yellow-600/20 text-yellow-600 hover:bg-yellow-600/30",
                      run.status === "completed" &&
                        "bg-blue-600/20 text-blue-600 hover:bg-blue-600/30",
                      run.status === "failed" &&
                        "bg-red-600/20 text-red-600 hover:bg-red-600/30"
                    )}
                  >
                    {run.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Overall Progress
                    </span>
                    <span className="font-medium">
                      {run.metadata?.calls?.completed} /{" "}
                      {run.metadata?.calls?.total}
                    </span>
                  </div>
                  <Progress
                    value={
                      ((run.metadata?.calls?.completed ?? 0) /
                        (run.metadata?.calls?.total ?? 0)) *
                      100
                    }
                    className="h-2"
                  />
                  <div className="flex justify-end text-sm text-muted-foreground">
                    <span>
                      {run.metadata?.calls?.completed} /{" "}
                      {run.metadata?.calls?.total} rows
                    </span>
                  </div>
                </div>

                {/* Run Details */}
                <div className="grid gap-4 md:grid-cols-4 bg-card border dark:bg-zinc-900/60 rounded-2xl p-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Clock className="h-4 w-4" />
                      Started
                    </div>
                    <div className="mt-1">
                      {run.metadata?.run?.startTime
                        ? new Date(run.metadata.run.startTime).toLocaleString()
                        : "Not started"}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Clock className="h-4 w-4" />
                      Duration
                    </div>
                    <div className="mt-1">
                      {formatDuration(
                        run.metadata?.run?.startTime,
                        run.metadata?.run?.endTime
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Clock className="h-4 w-4" />
                      Completed Calls
                    </div>
                    <div className="mt-1">{run.metadata?.calls?.completed}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rows Table */}
            <div className="p-2 pt-6">
              <div className="flex items-center justify-between mb-4">
                <CardTitle>Rows</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search rows..." className="pl-8" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
              <Table className="">
                <TableHeader className="px-4">
                  <TableRow className="px-4">
                    <TableHead>Status</TableHead>
                    {patientVariables?.fields.map((field) => (
                      <TableHead key={field.key}>{field.label}</TableHead>
                    ))}
                    <TableHead>Campaign Variables</TableHead>
                    <TableHead>Last Call</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id} className="[&_td]:h-16">
                      {/* status */}
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "capitalize",
                            row.status === "completed" &&
                              "bg-green-600/20 text-green-600 hover:bg-green-600/30",
                            row.status === "failed" &&
                              "bg-red-600/20 text-red-600 hover:bg-red-600/30",
                            row.status === "pending" &&
                              "bg-blue-600/20 text-blue-600 hover:bg-blue-600/30"
                          )}
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                      {/* patient variables */}
                      <TableCell>{row.variables?.emrId}</TableCell>
                      <TableCell>{row.variables?.firstName}</TableCell>
                      <TableCell>{row.variables?.lastName}</TableCell>
                      <TableCell>{row.variables?.dob}</TableCell>
                      <TableCell>{row.variables?.phone}</TableCell>
                      {/* campaign variables */}
                      <TableCell>
                        {/* render a tooltip with the variables and the values */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                              {campaignVariables?.fields.length} variables
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[400px] border rounded-md">
                            <div className="grid grid-cols-2 gap-2">
                              {campaignVariables?.fields.map((variable) => (
                                <div
                                  key={variable.key}
                                  className="flex items-start gap-2 text-sm rounded-md relative px-2 py-1"
                                >
                                  <span className="font-medium text-[0.65rem] absolute top-1 left-2">
                                    {variable.label}
                                  </span>
                                  <span className="text-muted-foreground mt-6">
                                    {row.variables?.[variable.key]}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>

                      {/* last call */}
                      <TableCell>
                        <PostCallDetails call={row.postCallData ?? null} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </AppContent>
      </AppBody>
    </AppPage>
  );
}

function PostCallDetails({ call }: { call: PostCallData | null }) {
  console.log(call);

  if (!call)
    return (
      <Button variant="outline" size="sm" disabled>
        <Frown className="h-4 w-4" />
        No call data yet
      </Button>
    );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4" />
          View call data
        </Button>
      </SheetTrigger>
      <SheetContent className="p-4">
        <SheetTitle className="mb-2 flex items-center gap-2">
          <PhoneCall className="h-4 w-4" />
          Call Details
        </SheetTitle>
        <SheetContent className="space-y-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Summary</p>
            <p className="text-sm text-muted-foreground">
              {call.analysis.callSummary}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Transcript</p>
            <p className="text-sm text-muted-foreground">
              {call.analysis.transcript}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">User Sentiment</p>
            <p className="text-sm text-muted-foreground">
              {call.analysis.userSentiment}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Call Successful</p>
            <p className="text-sm text-muted-foreground">
              {call.analysis.callSuccessful ? "Yes" : "No"}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Callback Requested</p>
            <p className="text-sm text-muted-foreground">
              {call.analysis.callbackRequested ? "Yes" : "No"}
            </p>
          </div>
        </SheetContent>
      </SheetContent>
    </Sheet>
  );
}
