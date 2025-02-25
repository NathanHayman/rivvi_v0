import { pusherClient } from "@/lib/pusher-client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

type CallCompletedEvent = {
  rowId: string;
  callId: string;
};

type CallStartedEvent = {
  rowId: string;
  retellCallId: string;
};

type RunStatusChangedEvent = {
  status: "running" | "paused" | "completed" | "failed";
};

export function useRunUpdates(runId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = pusherClient.subscribe(`run-${runId}`);

    // Handle call completed events
    channel.bind("call-completed", (data: CallCompletedEvent) => {
      queryClient.invalidateQueries({ queryKey: ["run", runId] });
      queryClient.invalidateQueries({ queryKey: ["rows", runId] });
      queryClient.invalidateQueries({ queryKey: ["call", data.callId] });
    });

    // Handle call started events
    channel.bind("call-started", (data: CallStartedEvent) => {
      queryClient.invalidateQueries({ queryKey: ["rows", runId] });
      queryClient.invalidateQueries({ queryKey: ["row", data.rowId] });
    });

    // Handle run status changes
    channel.bind("run-status-changed", (data: RunStatusChangedEvent) => {
      queryClient.invalidateQueries({ queryKey: ["run", runId] });

      // If run is completed, invalidate all related queries
      if (data.status === "completed") {
        queryClient.invalidateQueries({ queryKey: ["rows", runId] });
        queryClient.invalidateQueries({ queryKey: ["campaign"] });
      }
    });

    // Cleanup subscription on unmount
    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`run-${runId}`);
    };
  }, [runId, queryClient]);
}
