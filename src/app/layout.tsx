import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/src/components/providers";
import { Toaster } from "../components/ui/sonner";
import { Shell } from "../components/layout/shell";

export const metadata: Metadata = {
  title: {
    template: "%s | ברכת הנחל",
    default: "ברכת הנחל",
  },
  description: "מערכת ניהול לתרומות ברכת הנחל",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className="p-0" suppressHydrationWarning>
      <body className="relative">
        {/* --- רקע ריבועים עדין (Grid Pattern) --- */}
        <div
          className="fixed inset-0 -z-10 h-full w-full bg-white dark:bg-slate-950 
          bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] 
          bg-[size:40px_40px] 
          [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"
        ></div>
        {/* --- סוף רקע --- */}

        <Providers>
          <Shell>{children}</Shell>
        </Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
