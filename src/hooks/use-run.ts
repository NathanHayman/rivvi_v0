import { Campaign, Row, Run } from "@/server/db/schema";
import { useQuery } from "@tanstack/react-query";

export type RunWithRelations = Required<
  Run & {
    campaign: Campaign;
    rows: Row[];
  }
>;

async function fetchRun(runId: string): Promise<RunWithRelations | null> {
  const response = await fetch(`/api/runs/${runId}`);
  if (!response.ok) return null;
  return response.json();
}

export function useRun(runId: string) {
  return useQuery({
    queryKey: ["run", runId],
    queryFn: () => fetchRun(runId),
    staleTime: 0, // Always fetch fresh data since we're using real-time updates
    refetchInterval: false, // No polling needed since we're using Pusher
  });
}

async function fetchRows(runId: string): Promise<Row[]> {
  const response = await fetch(`/api/runs/${runId}/rows`);
  if (!response.ok) throw new Error("Failed to fetch rows");
  return response.json();
}

export function useRows(runId: string) {
  return useQuery({
    queryKey: ["rows", runId],
    queryFn: () => fetchRows(runId),
    staleTime: 0,
    refetchInterval: false,
  });
}
