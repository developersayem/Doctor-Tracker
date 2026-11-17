'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Keep list/detail queries cached for 60s to avoid redundant fetches while
            // navigating within the same page — analytics queries override this to 0.
            staleTime: 1000 * 60,       // 1 minute default
            gcTime: 1000 * 60 * 15,     // 15 minutes garbage collection
            refetchOnWindowFocus: true,  // Refetch when user returns to the tab
            refetchOnMount: true,        // Refetch when a component mounts
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
