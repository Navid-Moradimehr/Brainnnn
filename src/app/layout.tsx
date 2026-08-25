import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/context/Providers";
import { AppShell } from "@/components/shell/AppShell";
import { Toaster } from "@/components/ui/sonner";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Meridian — RT Planning Research Workspace",
    template: "%s · Meridian",
  },
  description:
    "Research clinical-decision-support prototype for brain-tumour radiotherapy treatment planning review. Not a treatment planning system; not clinically approved.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex h-full min-h-full flex-col">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
