import Providers from "@/components/providers/global-provider";
import { SuperAdminWidget } from "@/components/super-admin-widget";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

const display = DM_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Rivvi - Conversational AI for healthcare",
  description:
    "Rivvi's human-like conversational AI enhances patient care, streamlines workflows, and improves outcomes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/login" waitlistUrl="/waitlist">
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${sans.variable} ${display.variable} antialiased font-sans`}
        >
          <Providers>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <TooltipProvider>
                <NuqsAdapter>{children}</NuqsAdapter>
                <SuperAdminWidget />
              </TooltipProvider>
            </ThemeProvider>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
