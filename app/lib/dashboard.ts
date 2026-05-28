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

const normalizeNumber = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const normalizeRevenueOverview = (value: unknown): DashboardRevenuePoint[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const month =
        typeof (item as { month?: unknown }).month === "string"
          ? (item as { month: string }).month
          : "";
      const revenue = normalizeNumber((item as { revenue?: unknown }).revenue);

      return month ? { month, revenue } : null;
    })
    .filter((item): item is DashboardRevenuePoint => item !== null);
};

const normalizeDashboardResponse = (value: unknown): DashboardResponse => {
  const dashboard = (value ?? {}) as Partial<DashboardResponse>;

  return {
    availableCars: normalizeNumber(dashboard.availableCars),
    activeRentals: normalizeNumber(dashboard.activeRentals),
    totalBookings: normalizeNumber(dashboard.totalBookings),
    revenue: normalizeNumber(dashboard.revenue),
    revenueOverview: normalizeRevenueOverview(dashboard.revenueOverview),
    weeklyBookings: Array.isArray(dashboard.weeklyBookings)
      ? dashboard.weeklyBookings
          .map((item) => ({
            day: typeof item?.day === "string" ? item.day : "",
            count: normalizeNumber(item?.count),
          }))
          .filter((item) => item.day.length > 0)
      : [],
    fleetDistribution: Array.isArray(dashboard.fleetDistribution)
      ? dashboard.fleetDistribution
          .map((item) => ({
            type: typeof item?.type === "string" ? item.type : "",
            count: normalizeNumber(item?.count),
          }))
          .filter((item) => item.type.length > 0)
      : [],
    recentActivity: Array.isArray(dashboard.recentActivity)
      ? dashboard.recentActivity.map((item) => ({
          type:
            item &&
            typeof item === "object" &&
            (item as { type?: unknown }).type !== undefined &&
            ["booking", "user", "payment", "car"].includes(
              String((item as { type?: unknown }).type),
            )
              ? (item as { type: DashboardActivity["type"] }).type
              : "booking",
          message: typeof item?.message === "string" ? item.message : "",
          createdAt:
            typeof item?.createdAt === "string"
              ? item.createdAt
              : new Date().toISOString(),
        }))
      : [],
  };
};

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

  return normalizeDashboardResponse(await response.json());
};
