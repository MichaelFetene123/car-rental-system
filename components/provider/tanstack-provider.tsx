"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getValidAccessToken } from "@/app/lib/auth";

interface TanstackProviderProps {
  children: React.ReactNode;
}

export function TanstackProvider({ children }: TanstackProviderProps) {
  const [queryClient] = useState(() => new QueryClient());
  const pathname = usePathname();

  useEffect(() => {
    const isPublicPath =
      pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/signup");

    if (isPublicPath) return;

    void getValidAccessToken();
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
