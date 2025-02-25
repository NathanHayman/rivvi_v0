import { Badge } from "./ui/badge";

import { cn } from "@/lib/utils";
import { Run } from "@/server/db/schema";
import Link from "next/link";
import { DeleteRunButton } from "./delete-run-button";
import { buttonVariants } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

const RunsTable = ({ runs }: { runs: Run[] }) => {
  if (runs.length === 0) {
    return <div>No runs found</div>;
  }

  return (
    <Table className="w-full mx-auto">
      <TableHeader className="">
        <TableRow className="px-4">
          <TableHead className="px-4">Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Total Patients</TableHead>
          <TableHead>Total Calls</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="w-full">
        {runs.map((run) => {
          return (
            <TableRow key={run.id} className="[&>td]:py-4">
              <TableCell>{run.name}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    run.status === "running"
                      ? "success_solid_outline"
                      : "neutral_solid"
                  }
                >
                  {run.status}
                </Badge>
              </TableCell>
              <TableCell>{run.metadata?.calls?.total}</TableCell>
              <TableCell>{run.metadata?.calls?.completed}</TableCell>
              <TableCell>
                <Link
                  prefetch={false}
                  href={`/campaigns/${run.campaignId}/runs/${run.id}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" })
                  )}
                >
                  View Run
                </Link>
                <DeleteRunButton run={run} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default RunsTable;
