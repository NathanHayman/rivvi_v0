"use client";
import { CallDetails } from "@/components/call-details";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useRunUpdates } from "@/hooks/use-run-updates";
import { useRun, useRunRows } from "@/hooks/use-runs";
import { pauseRun, startRun } from "@/server/actions/runs";
import { Pause, Phone, Play } from "lucide-react";

export function RunDetails({ runId }: { runId: string }) {
  const { data: run } = useRun(runId);
  const {
    data: runData,
    hasNextPage,
    fetchNextPage,
  } = useRunRows(runId, { page: 1, pageSize: 50 });

  // Subscribe to real-time updates
  useRunUpdates(runId);

  if (!run || !runData) return null;

  const isComplete = run.status === "completed";
  const isRunning = run.status === "running";
  const progress = Math.round(
    ((run.metadata?.calls?.completed ?? 0) /
      (run.metadata?.calls?.total ?? 0)) *
      100
  );

  const columns = [
    {
      accessorKey: "processedData.firstName",
      header: "First Name",
    },
    {
      accessorKey: "processedData.lastName",
      header: "Last Name",
    },
    {
      accessorKey: "processedData.phone",
      header: "Phone",
    },
    // Dynamic columns based on campaign variables
    ...Object.keys(run.campaign?.config?.variables ?? {}).map((key) => ({
      accessorKey: `processedData.${key}`,
      header:
        key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
    })),
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
        const status = row.getValue("status");
        return <div className={getStatusClassName(status)}>{status}</div>;
      },
    },
    {
      id: "actions",
      cell: ({
        row,
      }: {
        row: { original: { calls: { [x: string]: any }[] } };
      }) => {
        const hasCall = row.original.calls?.[0] as
          | {
              direction: string;
              status: string;
              startTime: string;
              endTime: string;
              callLog: {
                call_summary?: string;
                post_call_data?: Record<string, any>;
                is_voicemail?: boolean;
                transcription?: string;
              };
              patient: {
                dob: string;
                phone: string;
                last_name: string;
                first_name: string;
              };
              runDataId: string;
              retellCallId: string;
            }
          | undefined;

        if (!hasCall) return null;

        return (
          <Dialog>
            <DialogTitle>Call Details</DialogTitle>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Phone className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <CallDetails call={hasCall} />
            </DialogContent>
          </Dialog>
        );
      },
    },
  ];

  // Flatten the data from all pages
  const allRunData = runData.pages.flatMap((page) => page.data);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{run.name}</h1>
          <p className="text-muted-foreground">
            {run.campaign?.name} • Created{" "}
            {new Date(run.createdAt ?? "").toLocaleDateString()}
          </p>
        </div>
        <div className="space-x-2">
          {!isComplete &&
            (isRunning ? (
              <Button onClick={() => pauseRun({ id: runId })}>
                <Pause className="h-4 w-4 mr-2" />
                Pause Run
              </Button>
            ) : (
              <Button onClick={() => startRun({ id: runId })}>
                <Play className="h-4 w-4 mr-2" />
                {run.status === "draft" ? "Start Run" : "Resume Run"}
              </Button>
            ))}
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <StatsCard
          title="Total Records"
          value={run.metadata?.calls?.total ?? 0}
          description="Total records in dataset"
        />
        <StatsCard
          title="Valid Records"
          value={run.metadata?.calls?.completed ?? 0}
          description="Records passing validation"
        />
        <StatsCard
          title="Progress"
          value={`${progress}%`}
          description="Calls completed"
        >
          <Progress value={progress} className="mt-2" />
        </StatsCard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Call Records</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={allRunData}
            pagination={{
              hasNextPage,
              onNextPage: fetchNextPage,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({
  title,
  value,
  description,
  children,
}: {
  title: string;
  value: string | number;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-2xl font-bold">{value}</div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}

function getStatusClassName(status: string) {
  const baseClass = "px-2 py-1 rounded-full text-xs font-medium";
  const statusClasses = {
    pending: "bg-yellow-100 text-yellow-800",
    calling: "bg-blue-100 text-blue-800 animate-pulse",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  };
  return `${baseClass} ${
    statusClasses[status as keyof typeof statusClasses] || ""
  }`;
}

export function RunDetailsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4" />
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-8 bg-gray-200 rounded w-1/3 mt-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3 mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
