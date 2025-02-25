"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon, MessageSquare, PhoneCall } from "lucide-react";

interface CallDetailsProps {
  call: {
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
      first_name: string;
      last_name: string;
      phone: string;
      dob: string;
    };
  };
}

export async function CallDetails({ call }: CallDetailsProps) {
  console.log(call);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-primary/10 rounded-full">
          <PhoneCall className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Call Details</h2>
          <p className="text-muted-foreground">
            {call.direction === "inbound" ? "Inbound" : "Outbound"} call on{" "}
            {new Date(call.startTime).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {/* <InfoCard
          icon={User}
          title="Patient"
          value={`${call.patient.first_name} ${call.patient.last_name}`}
          subValue={call.patient.phone}
        /> */}
        {/* // <InfoCard
        //   icon={Clock}
        //   title="Duration"
        //   value={`${durationMinutes}:${durationSeconds
        //     .toString()
        //     .padStart(2, "0")}`}
        //   subValue={`${new Date(call.startTime).toLocaleTimeString()}`}
        // />
        // <InfoCard
        //   icon={call.callLog.is_voicemail ? XCircle : CheckCircle2}
        //   title="Outcome"
        //   value={call.callLog.is_voicemail ? "Voicemail" : "Connected"}
        //   subValue={call.status}
        // /> */}
      </div>

      {call.callLog.call_summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Call Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{call.callLog.call_summary}</p>
          </CardContent>
        </Card>
      )}

      {call.callLog.post_call_data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Call Outcomes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {Object.entries(call.callLog.post_call_data).map(
                ([key, value]) => (
                  <div key={key} className="flex justify-between py-1 border-b">
                    <span className="text-sm text-muted-foreground">
                      {key
                        .split("_")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </span>
                    <span className="text-sm font-medium">{String(value)}</span>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {call.callLog.transcription && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Transcription
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {call.callLog.transcription}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  value,
  subValue,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  subValue: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{title}</span>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm text-muted-foreground">{subValue}</div>
        </div>
      </CardContent>
    </Card>
  );
}
