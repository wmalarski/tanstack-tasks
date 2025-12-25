import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { ConvexProvider } from "convex/react";

import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;

  if (!CONVEX_URL) {
    console.error("missing envar VITE_CONVEX_URL");
  }

  const convexQueryClient = new ConvexQueryClient(CONVEX_URL);

  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryFn: convexQueryClient.queryFn(),
        queryKeyHashFn: convexQueryClient.hashFn(),
      },
    },
  });

  convexQueryClient.connect(queryClient);

  const router = routerWithQueryClient(
    createRouter({
      context: { queryClient },
      defaultPreload: "intent",
      routeTree,
      scrollRestoration: true,
      Wrap: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <ConvexProvider client={convexQueryClient.convexClient}>
            <ConvexAuthProvider client={convexQueryClient.convexClient}>
              {children}
            </ConvexAuthProvider>
          </ConvexProvider>
        </QueryClientProvider>
      ),
    }),
    queryClient,
  );

  return router;
};
