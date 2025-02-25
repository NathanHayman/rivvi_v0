import {
  AppBody,
  AppBreadcrumbs,
  AppContent,
  AppHeader,
  AppPage,
} from "@/components/layout/shell";
import { CreateOrgSheetButton } from "@/components/modals/create-org-sheet-button";
import { EditOrgSheetButton } from "@/components/modals/edit-org-sheet-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isSuperAdmin } from "@/lib/super-admin";
import { db } from "@/server/db";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function OrganizationsPage() {
  const superAdmin = await isSuperAdmin();

  if (!superAdmin) {
    redirect("/");
  }

  const organizations = await db.query.organizations.findMany();

  return (
    <AppPage>
      <AppBreadcrumbs breadcrumbs={[{ title: "Overview", href: "/" }]} />
      <AppBody>
        <AppHeader title="Organizations" buttons={<CreateOrgSheetButton />} />
        <AppContent className="h-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((organization) => (
                <TableRow key={organization.id}>
                  <TableCell>
                    <Link href={`/admin/orgs/${organization.id}`}>
                      {organization.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {organization.createdAt?.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <EditOrgSheetButton org={organization} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AppContent>
      </AppBody>
    </AppPage>
  );
}
