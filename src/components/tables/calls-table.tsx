"use client";

import { getCallsByOrgId } from "@/server/queries/calls";
// use tanstack react query to fetch the calls
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
/**
 * 
 * @param param0 [
    {
        "id": "0b938285-c385-43b1-aa39-047c95a17e21",
        "orgId": "b4607d1d-3be8-45a7-be02-a2e88d12ef66",
        "runId": "01cd8d5f-71d0-4c92-a90a-69125f223e18",
        "rowId": "4724eaf8-e050-400a-b0fe-12edef0b2b24",
        "agentId": "agent_a988db1adeafc27e1352327b30",
        "patientId": "36f1eef3-6b5f-4bb5-82f2-15922f296fbc",
        "direction": "outbound",
        "status": "completed",
        "retellCallId": "call_3833910e83961781b6a2e99f346",
        "recordingUrl": "https://dxc03zgurdly9.cloudfront.net/call_3833910e83961781b6a2e99f346/recording.wav",
        "toNumber": "+18303588259",
        "fromNumber": "+14707409623",
        "metadata": {
            "orgId": "b4607d1d-3be8-45a7-be02-a2e88d12ef66",
            "runId": "01cd8d5f-71d0-4c92-a90a-69125f223e18",
            "rowsId": "4724eaf8-e050-400a-b0fe-12edef0b2b24",
            "campaignId": "b52b5432-41c3-4e70-8435-9d031ae9a68a"
        },
        "startTime": "2025-02-19T01:55:16.705Z",
        "endTime": "2025-02-19T01:55:20.964Z",
        "duration": 4,
        "analysis": {
            "0": {
                "appt_confirmed": null
            },
            "1": {
                "in_voicemail": false
            },
            "2": {
                "callback_requested": null
            },
            "3": {
                "callback_date_time": null
            }
        },
        "error": null,
        "createdAt": "2025-02-19T01:55:23.047Z",
        "updatedAt": "2025-02-19T01:55:23.047Z"
    }
]
 * @returns 
 */

export function CallsTable({ orgId }: { orgId: string }) {
  const { data: calls, isLoading } = useQuery({
    queryKey: ["calls"],
    queryFn: () => getCallsByOrgId(orgId),
    refetchInterval: 10000,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead>Call ID</TableHead>
          <TableHead>Patient ID</TableHead>
          <TableHead>Direction</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Updated At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {calls?.map((call) => (
          <TableRow key={call.id}>
            <TableCell>{call.id}</TableCell>
            <TableCell>{call.patientId}</TableCell>
            <TableCell>{call.direction}</TableCell>
            <TableCell>{call.status}</TableCell>
            <TableCell>{call.duration}</TableCell>
            <TableCell>{call.createdAt?.toLocaleString()}</TableCell>
            <TableCell>{call.updatedAt?.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
