import {
  AppBody,
  AppBreadcrumbs,
  AppContent,
  AppHeader,
  AppPage,
} from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/server/db";
import { organizations } from "@/server/db/schema";
import { getPatientsByOrgId } from "@/server/queries/patients";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Patients - Rivvi",
  description:
    "Patients for Rivvi's human-like conversational AI for healthcare.",
};

async function getOrgByClerkId(clerkId: string) {
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.clerkId, clerkId),
  });

  return org;
}

export default async function PatientsPage() {
  const { orgId } = await auth();
  console.log("orgId", orgId);

  if (!orgId) {
    return redirect("/");
  }

  const org = await getOrgByClerkId(orgId);

  if (!org) {
    return redirect("/org-selection");
  }

  const patients = await getPatientsByOrgId({ orgId: org.id });

  return (
    <AppPage>
      <AppBreadcrumbs
        breadcrumbs={[{ title: "Patients", href: "/patients" }]}
      />
      <AppBody>
        <AppHeader title="Patients" />
        <AppContent className="h-full">
          <div className="rounded-xl bg-card dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>EMR ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      {patient.firstName} {patient.lastName}
                    </TableCell>
                    <TableCell>{patient.primaryPhone}</TableCell>
                    <TableCell>{patient.emrId || "N/A"}</TableCell>
                    <TableCell>{patient.isMinor ? "Minor" : "Adult"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/patients/${patient.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </AppContent>
      </AppBody>
    </AppPage>
  );
}
