"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      themes={["light", "dark"]}
      enableSystem
    >
      {children}
    </NextThemeProvider>
  );
};

export default ThemeProvider;
