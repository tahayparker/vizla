import type { Metadata, Viewport } from "next";
import { montserrat, qurovaFont } from "@/lib/fonts";
import "./globals.css";
import PlasmaBackground from "@/components/PlasmaBackground";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { TimetableProvider } from "@/context/TimetableContext";

export const metadata: Metadata = {
  title: {
    default: "vizla - UOWD Timetable Planner",
    template: "%s - vizla",
  },
  applicationName: "vizla",
  description:
    "Interactive course timetable planner, group constraint solver, and scheduling conflict detector for UOWD.",
  appleWebApp: {
    title: "vizla",
  },
};

export const viewport: Viewport = {
  themeColor: "#8b5cf6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${qurovaFont.variable}`}
      style={{ backgroundColor: "#000000" }}
    >
      <body className={`${montserrat.className} bg-black text-white min-h-screen flex flex-col antialiased relative`}>
        <PlasmaBackground />
        <TimetableProvider>
          <SiteHeader />
          <main className="flex-1 w-full max-w-[1850px] mx-auto px-3 sm:px-6 md:px-8 pt-20 pb-8">
            {children}
          </main>
          <SiteFooter />
        </TimetableProvider>
      </body>
    </html>
  );
}
