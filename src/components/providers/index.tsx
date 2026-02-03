"use client";
import QueryProvider from "./query.provider";
import ThemeProvider from "./theme.provider";
import NextTopLoader from "nextjs-toploader";
const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryProvider>
      <NextTopLoader crawlSpeed={100} speed={100} showSpinner={false} />
      <ThemeProvider>{children}</ThemeProvider>
    </QueryProvider>
  );
};

export default Providers;
