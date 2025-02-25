"use client";

import { getUserOrg } from "@/server/actions/get-user-org";
import { OrgStore, useOrgStore } from "@/stores/org-store";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function OrgProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: org } = useQuery({
    queryKey: ["userOrg"],
    queryFn: getUserOrg,
  });
  const setOrganization = useOrgStore(
    (state: OrgStore) => state.setOrganization
  );

  useEffect(() => {
    if (org) setOrganization(org);
  }, [org, setOrganization]);

  return <>{children}</>;
}
