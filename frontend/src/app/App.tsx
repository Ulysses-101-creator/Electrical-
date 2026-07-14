import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { RouterProvider } from "react-router-dom";

import { ErrorBoundary } from "@/app/ErrorBoundary";
import { router } from "@/app/router";
import { useSessionBootstrap } from "@/hooks/useSessionBootstrap";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

function SessionGate({ children }: { children: ReactNode }) {
  useSessionBootstrap();
  return <>{children}</>;
}

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SessionGate>
          <RouterProvider router={router} />
        </SessionGate>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
