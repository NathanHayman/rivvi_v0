import {
  AppBody,
  AppBreadcrumbs,
  AppContent,
  AppHeader,
  AppPage,
} from "@/components/layout/shell";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings - Rivvi",
  description:
    "Settings for Rivvi's human-like conversational AI for healthcare.",
};

export default function SettingsPage() {
  return (
    <AppPage>
      <AppBreadcrumbs breadcrumbs={[{ title: "Settings", href: "/" }]} />
      <AppBody>
        <AppHeader title="Settings" />
        <AppContent className="h-full">
          <div className="grid auto-rows-min gap-4 md:grid-cols-4 h-full">
            <div className="aspect-video rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800" />
            <div className="aspect-video rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800" />
            <div className="aspect-video rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800" />
            <div className="aspect-video rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800" />
            <div className="aspect-square rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 col-span-2 h-full" />
            <div className="aspect-square rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 col-span-2 h-full" />
          </div>
        </AppContent>
      </AppBody>
    </AppPage>
  );
}
