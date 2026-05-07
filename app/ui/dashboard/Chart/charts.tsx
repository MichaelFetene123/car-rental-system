"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../../card";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Calendar, Car, DollarSign, Users } from "lucide-react";
import type {
  DashboardActivity,
  DashboardFleetDistribution,
  DashboardRevenuePoint,
  DashboardWeeklyBooking,
} from "@/app/lib/dashboard";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

const formatRelativeTime = (dateValue: string) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Just now";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
};

const LoadingPlaceholder = ({ height }: { height: number }) => (
  <div
    className="w-full rounded-lg bg-gray-100 animate-pulse"
    style={{ height }}
  />
);

const EmptyPlaceholder = ({ height }: { height: number }) => (
  <div
    className="flex w-full items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-muted-foreground"
    style={{ height }}
  >
    No data available yet
  </div>
);

export const RevenueChart = ({
  data,
  isLoading,
}: {
  data: DashboardRevenuePoint[];
  isLoading: boolean;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingPlaceholder height={300} />
        ) : data.length === 0 ? (
          <EmptyPlaceholder height={300} />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export const BookingChart = ({
  data,
  isLoading,
}: {
  data: DashboardWeeklyBooking[];
  isLoading: boolean;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingPlaceholder height={300} />
        ) : data.length === 0 ? (
          <EmptyPlaceholder height={300} />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export const CarTypeDistribution = ({
  data,
  isLoading,
}: {
  data: DashboardFleetDistribution[];
  isLoading: boolean;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fleet Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingPlaceholder height={250} />
        ) : data.length === 0 ? (
          <EmptyPlaceholder height={250} />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                nameKey="type"
                label={({ name, percent }) =>
                  `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.type}-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

const activityStyles = {
  booking: {
    icon: Calendar,
    wrapper: "bg-green-100",
    iconColor: "text-green-600",
  },
  car: {
    icon: Car,
    wrapper: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  user: {
    icon: Users,
    wrapper: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  payment: {
    icon: DollarSign,
    wrapper: "bg-orange-100",
    iconColor: "text-orange-600",
  },
} as const;

export const RecentActivity = ({
  data,
  isLoading,
}: {
  data: DashboardActivity[];
  isLoading: boolean;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingPlaceholder height={250} />
        ) : data.length === 0 ? (
          <EmptyPlaceholder height={250} />
        ) : (
          <div className="space-y-4">
            {data.map((item, index) => {
              const style = activityStyles[item.type];
              const Icon = style.icon;

              return (
                <div key={`${item.type}-${index}`} className="flex items-start gap-3">
                  <div className={`${style.wrapper} rounded-full p-2`}>
                    <Icon className={`size-4 ${style.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{item.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(item.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
