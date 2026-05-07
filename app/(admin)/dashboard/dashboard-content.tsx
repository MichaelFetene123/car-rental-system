"use client";

import type { ElementType } from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, Activity, ClipboardList, Car } from "lucide-react";
import Card from "@/app/ui/dashboard/cards";
import { CardsSkeleton } from "@/app/ui/skeletons";
import {
  BookingChart,
  CarTypeDistribution,
  RecentActivity,
  RevenueChart,
} from "@/app/ui/dashboard/Chart/charts";
import {
  DASHBOARD_QUERY_KEY,
  fetchDashboardData,
  type DashboardResponse,
} from "@/app/lib/dashboard";

const currencyCode = process.env.NEXT_PUBLIC_CURRENCY_CODE ?? "ETB";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);

const emptyDashboard: DashboardResponse = {
  availableCars: 0,
  activeRentals: 0,
  totalBookings: 0,
  revenue: 0,
  revenueOverview: [],
  weeklyBookings: [],
  fleetDistribution: [],
  recentActivity: [],
};

type CardMetricKey =
  | "availableCars"
  | "activeRentals"
  | "totalBookings"
  | "revenue";

const cardConfig: Array<{
  key: CardMetricKey;
  title: string;
  icon: ElementType;
  tone: "blue" | "emerald" | "amber" | "rose";
  format: (value: number) => string;
}> = [
  {
    key: "availableCars",
    title: "Available cars",
    icon: Car,
    tone: "blue" as const,
    format: formatNumber,
  },
  {
    key: "activeRentals",
    title: "Active rentals",
    icon: Activity,
    tone: "emerald" as const,
    format: formatNumber,
  },
  {
    key: "totalBookings",
    title: "Total booking",
    icon: ClipboardList,
    tone: "amber" as const,
    format: formatNumber,
  },
  {
    key: "revenue",
    title: "Revenue",
    icon: DollarSign,
    tone: "rose" as const,
    format: formatCurrency,
  },
];

export default function DashboardContent() {
  const { data, isPending, error } = useQuery<DashboardResponse, Error>({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: ({ signal }) => fetchDashboardData(signal),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    staleTime: 30 * 1000,
  });

  const dashboard = data ?? emptyDashboard;

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isPending ? (
          <CardsSkeleton />
        ) : (
          cardConfig.map((card) => (
            <Card
              key={card.key}
              title={card.title}
              value={card.format(dashboard[card.key])}
              Icon={card.icon}
              tone={card.tone}
            />
          ))
        )}
      </div>

      {error ? (
        <p className="text-sm text-rose-600">
          Unable to load dashboard data. Please try again.
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <RevenueChart data={dashboard.revenueOverview} isLoading={isPending} />
        <BookingChart data={dashboard.weeklyBookings} isLoading={isPending} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <CarTypeDistribution
          data={dashboard.fleetDistribution}
          isLoading={isPending}
        />
        <RecentActivity data={dashboard.recentActivity} isLoading={isPending} />
      </div>
    </>
  );
}
