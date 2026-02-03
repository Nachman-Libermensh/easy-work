"use client";
import React from "react";
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools";

import { TanStackDevtools } from "@tanstack/react-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <ReactQueryDevtools /> */}
      {/* <TanStackDevtools
        plugins={[formDevtoolsPlugin()]}
        eventBusConfig={{ debug: true }}
      /> */}
    </QueryClientProvider>
  );
};

export default QueryProvider;
