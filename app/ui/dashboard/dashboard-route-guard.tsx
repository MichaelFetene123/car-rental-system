"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { usePermissions } from "@/app/hooks/use-permissions";

function DashboardContentSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-3">
        <div className="h-7 w-40 rounded-md bg-gray-200" />
        <div className="h-4 w-72 rounded-md bg-gray-100" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`dashboard-skeleton-card-${index}`}
            className="h-28 rounded-xl bg-gray-100"
          />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 rounded-xl bg-gray-100" />
        <div className="h-72 rounded-xl bg-gray-100" />
      </div>
    </div>
  );
}

export function DashboardRouteGuard({ children }: { children: ReactNode }) {
  const { can, isAdmin, isLoading, isLoaded } = usePermissions();

  if (isLoading || !isLoaded) return <DashboardContentSkeleton />;

  return <>{children}</>;
}
