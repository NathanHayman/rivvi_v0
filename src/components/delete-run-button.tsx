"use client";

import { Button } from "@/components/ui/button";
import { deleteRun } from "@/server/actions/runs";
import { Run } from "@/server/db/schema";

export function DeleteRunButton({ run }: { run: Run }) {
  return (
    <Button
      variant="link"
      size="sm"
      onClick={() => {
        deleteRun(run.id);
      }}
    >
      Delete
    </Button>
  );
}
