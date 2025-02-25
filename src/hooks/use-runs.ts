import { getRun, getRunRows } from "@/server/actions/runs/queries";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

interface PaginationParams {
  page: number;
  pageSize: number;
}

// Run Queries
export function useRun(runId: string) {
  return useQuery({
    queryKey: ["run", runId],
    queryFn: () => getRun(runId),
  });
}

export function useRunRows(
  runId: string,
  { page, pageSize }: PaginationParams
) {
  return useInfiniteQuery({
    queryKey: ["runRows", runId],
    queryFn: ({ pageParam = page }) => getRunRows(runId, pageParam, pageSize),
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined;
    },
    initialPageParam: page,
  });
}
