import { RunDetails, RunDetailsSkeleton } from "@/components/run-details";
import { Suspense } from "react";

export default function RunPage() {
  const id = "1";
  return (
    <div className="container mx-auto py-10">
      <Suspense fallback={<RunDetailsSkeleton />}>
        <RunDetails runId={id} />
      </Suspense>
    </div>
  );
}
