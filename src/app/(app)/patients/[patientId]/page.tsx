import {
  AppBody,
  AppBreadcrumbs,
  AppContent,
  AppHeader,
  AppPage,
} from "@/components/layout/shell";
import { SummaryCards } from "@/components/summary-cards";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { db } from "@/server/db";
import { calls, patients } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ patientId: string }>;
};

export default async function PatientPage({ params }: PageProps) {
  const { patientId } = await params;

  const patient = await db.query.patients.findFirst({
    where: eq(patients.id, patientId),
  });

  if (!patient) {
    return notFound();
  }

  const patientCalls = await db.query.calls.findMany({
    where: eq(calls.patientId, patientId),
  });

  if (!patientCalls) {
    return notFound();
  }

  const completedCalls = patientCalls.filter(
    (call) => call.status === "completed"
  );
  const failedCalls = patientCalls.filter((call) => call.status === "failed");

  return (
    <AppPage>
      <AppBreadcrumbs
        breadcrumbs={[
          { title: "Patients", href: "/patients" },
          {
            title: `${patient.firstName} ${patient.lastName}`,
            href: `/patients/${patientId}`,
          },
        ]}
      />
      <AppBody>
        <AppHeader
          className=""
          title={`${patient.firstName} ${patient.lastName}`}
          buttons={
            <>
              <Link
                href={`/patients/${patientId}/calls`}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                View Calls
              </Link>
            </>
          }
        />
        <AppContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <div>Phone</div>
                  <div>{patient.primaryPhone}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {patientCalls.map((call) => (
                  <div
                    key={call.id}
                    className="flex justify-between border-b py-2"
                  >
                    <div>
                      <div className="font-medium">{call.direction}</div>
                      <div className="text-sm text-muted-foreground">
                        {call.status}
                      </div>
                    </div>
                    <div className="text-right">
                      <div>{call?.startTime?.toLocaleDateString()}</div>
                      <div className="text-sm text-muted-foreground">
                        {call?.startTime?.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <SummaryCards
              cards={[
                {
                  title: "Total Appointments",
                  value: patientCalls.length.toString(),
                },
                {
                  title: "Completed Calls",
                  value: completedCalls.length.toString(),
                },
                { title: "Failed Calls", value: failedCalls.length.toString() },
                { title: "Upcoming Calls", value: "0" },
              ]}
            />
          </div>
        </AppContent>
      </AppBody>
    </AppPage>
  );
}
