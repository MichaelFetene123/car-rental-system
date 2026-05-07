import { authFetch } from "@/app/lib/auth";

export type DashboardRevenuePoint = {
  month: string;
  revenue: number;
};

export type DashboardWeeklyBooking = {
  day: string;
  count: number;
};

export type DashboardFleetDistribution = {
  type: string;
  count: number;
};

export type DashboardActivity = {
  type: "booking" | "user" | "payment" | "car";
  message: string;
  createdAt: string;
};

export type DashboardResponse = {
  availableCars: number;
  activeRentals: number;
  totalBookings: number;
  revenue: number;
  revenueOverview: DashboardRevenuePoint[];
  weeklyBookings: DashboardWeeklyBooking[];
  fleetDistribution: DashboardFleetDistribution[];
  recentActivity: DashboardActivity[];
};

export const DASHBOARD_QUERY_KEY = ["dashboard"] as const;

export const fetchDashboardData = async (
  signal?: AbortSignal,
): Promise<DashboardResponse> => {
  const response = await authFetch("/dashboard", {
    method: "GET",
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Unable to load dashboard data (${response.status}). ${errorText}`,
    );
  }

  return (await response.json()) as DashboardResponse;
};
