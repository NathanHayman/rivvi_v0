import {
  AppBody,
  AppBreadcrumbs,
  AppContent,
  AppHeader,
  AppPage,
} from "@/components/layout/shell";
import { TestAreaChart } from "@/components/test-charts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics - Rivvi",
  description:
    "Analytics for Rivvi's human-like conversational AI for healthcare.",
};

export default function AnalyticsPage() {
  return (
    <AppPage>
      <AppBreadcrumbs breadcrumbs={[{ title: "Analytics", href: "/" }]} />
      <AppBody>
        <AppHeader title="Analytics" />
        <AppContent className="h-full">
          <div className="grid auto-rows-min gap-4 md:grid-cols-4 h-full">
            <TestAreaChart />
            <TestAreaChart />
            <TestAreaChart />
            <TestAreaChart />
            <TestAreaChart className="col-span-2" />
            <TestAreaChart className="col-span-2" />
          </div>
        </AppContent>
      </AppBody>
    </AppPage>
  );
}
