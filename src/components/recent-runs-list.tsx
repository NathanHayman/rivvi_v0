import { cn } from "@/lib/utils";
import { Run } from "@/server/db/schema";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { buttonVariants } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Progress } from "./ui/progress";

const RecentRunsList = ({
  runs,
  className,
}: {
  runs: Run[];
  className?: string;
}) => {
  if (runs.length === 0) {
    return <div>No runs found</div>;
  }

  const sortedRuns = runs
    .sort((a, b) => {
      const timeA = a.createdAt?.getTime() ?? 0;
      const timeB = b.createdAt?.getTime() ?? 0;
      return timeB - timeA;
    })
    .slice(0, 2);

  return (
    <div className={cn("space-y-4 flex flex-col", className)}>
      <h3 className="text-xl tracking-tight font-semibold">Recent Runs</h3>
      <div className="flex flex-col gap-4">
        {sortedRuns.map((run) => (
          <Link
            prefetch={false}
            href={`/campaigns/${run.campaignId}/runs/${run.id}`}
            key={run.id}
          >
            <Card className="rounded-xl bg-card dark:bg-zinc-900/60 border shadow-none relative">
              <Badge
                variant={
                  run.status === "completed"
                    ? "neutral_solid"
                    : run.status === "running"
                    ? "success_solid"
                    : run.status === "failed"
                    ? "failure_solid"
                    : "neutral_outline"
                }
                className="absolute top-2 right-2"
              >
                {run.status}
              </Badge>
              <CardHeader>
                <CardTitle>{run.name}</CardTitle>
                <CardDescription>
                  Created at {run.createdAt?.toLocaleDateString() ?? "N/A"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Progress Bar */}
                <Progress
                  value={
                    ((run.metadata?.calls?.completed ?? 0) /
                      (run.metadata?.calls?.total ?? 0)) *
                    100
                  }
                  className="h-2"
                />
                <p className="text-sm text-muted-foreground">
                  {run.metadata?.calls?.completed} /{" "}
                  {run.metadata?.calls?.total} patients
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
        {runs.length > 2 && (
          <Link
            prefetch={false}
            href={`/campaigns/${runs[0].campaignId}/runs`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            View all runs
          </Link>
        )}
      </div>
    </div>
  );
};

export default RecentRunsList;
