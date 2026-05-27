"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui/select";
import { Button } from "@/app/ui/button";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Calendar, DollarSign, TrendingUp, Download } from "lucide-react";
import { lusitana } from "@/app/ui/utils/fonts";
import { usePermissions } from "@/app/hooks/use-permissions";
import { Permissions } from "@/app/lib/permissions";

const dailyData = [
  { date: "2026-05-19", revenue: 4200, bookings: 18, cars: 13 },
  { date: "2026-05-20", revenue: 5100, bookings: 22, cars: 16 },
  { date: "2026-05-21", revenue: 3900, bookings: 14, cars: 11 },
  { date: "2026-05-22", revenue: 6100, bookings: 25, cars: 19 },
  { date: "2026-05-23", revenue: 6800, bookings: 27, cars: 21 },
  { date: "2026-05-24", revenue: 7300, bookings: 30, cars: 24 },
  { date: "2026-05-25", revenue: 5400, bookings: 19, cars: 15 },
];

const monthlyData = [
  { month: "Nov", revenue: 32000, bookings: 44, cars: 40 },
  { month: "Dec", revenue: 38000, bookings: 52, cars: 49 },
  { month: "Jan", revenue: 46000, bookings: 60, cars: 57 },
  { month: "Feb", revenue: 41000, bookings: 56, cars: 51 },
  { month: "Mar", revenue: 54000, bookings: 63, cars: 58 },
  { month: "Apr", revenue: 50000, bookings: 59, cars: 54 },
];

const categoryData = [
  { category: "SUV", revenue: 82000, bookings: 52 },
  { category: "Sedan", revenue: 64000, bookings: 61 },
  { category: "Luxury", revenue: 73000, bookings: 29 },
  { category: "Hatchback", revenue: 26000, bookings: 40 },
];

export default function Reports() {
  const { can: canAccess } = usePermissions();
  const canViewReports = canAccess(Permissions.VIEW_REPORT);
  const canManageReports = canAccess(Permissions.MANAGE_REPORT);
  const canAccessReports = canViewReports || canManageReports;

  const [reportType, setReportType] = useState<"daily" | "monthly">("daily");
  const [viewType, setViewType] = useState<"revenue" | "bookings" | "cars">(
    "revenue",
  );

  const data = reportType === "daily" ? dailyData : monthlyData;
  const xAxisKey = reportType === "daily" ? "date" : "month";

  const totalRevenue = data?.reduce((sum, item) => sum + item.revenue, 0);
  const totalBookings = data?.reduce((sum, item) => sum + item.bookings, 0);
  const avgDailyRevenue = Math.round(totalRevenue / data.length);

  const handleExport = () => {
    // Mock export functionality
    const csvContent = data
      .map(
        (row) =>
          `${row as Record<string, any>}[xAxisKey]${row.revenue},${row.bookings},${row.cars}`,
      )
      .join("\n");
    console.log("Exporting report:", csvContent);
    alert("Report exported successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`${lusitana.className} text-2xl mb-1`}>
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            View daily and monthly revenue reports
          </p>
        </div>
        <Button
          onClick={handleExport}
          className="bg-blue-600 hover:bg-blue-500 text-white"
          disabled={!canManageReports}
        >
          <Download className="size-4 mr-2" />
          Export Report
        </Button>
      </div>

      {!canAccessReports ? (
        <Card>
          <CardContent className="py-5 text-sm text-gray-600">
            You do not have permission to view report analytics yet. Ask an admin to grant View Report.
          </CardContent>
        </Card>
      ) : null}

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          value={reportType}
          onValueChange={(value) => setReportType(value as "daily" | "monthly")}
          disabled={!canAccessReports}
        >
          <SelectTrigger className="w-full sm:w-40 border-gray-300 outline-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-gray-300 bg-white">
            <SelectItem value="daily">Daily Report</SelectItem>
            <SelectItem value="monthly">Monthly Report</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={viewType}
          onValueChange={(value) =>
            setViewType(value as "revenue" | "bookings" | "cars")
          }
          disabled={!canAccessReports}
        >
          <SelectTrigger className="w-full sm:w-40 border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-gray-300 bg-white">
            <SelectItem value="revenue">Revenue</SelectItem>
            <SelectItem value="bookings">Bookings</SelectItem>
            <SelectItem value="cars">Cars Rented</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-blue-50 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              Total Revenue
            </CardTitle>
            <DollarSign className="size-5 text-blue-700" />
          </CardHeader>
          <CardContent className="text-blue-900">
            <div className="text-3xl font-semibold text-blue-900">
              ${totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-blue-700 mt-1">
              {reportType === "daily" ? "Last 9 days" : "Last 7 months"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">
              Total Bookings
            </CardTitle>
            <Calendar className="size-5 text-emerald-700" />
          </CardHeader>
          <CardContent className="text-emerald-900">
            <div className="text-3xl font-semibold text-emerald-900">
              {totalBookings.toLocaleString()}
            </div>
            <p className="text-xs text-emerald-700 mt-1">
              {reportType === "daily" ? "Last 9 days" : "Last 7 months"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">
              Avg {reportType === "daily" ? "Daily" : "Monthly"} Revenue
            </CardTitle>
            <TrendingUp className="size-5 text-amber-700" />
          </CardHeader>
          <CardContent className="text-amber-900">
            <div className="text-3xl font-semibold text-amber-900">
              ${avgDailyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-amber-700 mt-1">Average</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            {reportType === "daily" ? "Daily" : "Monthly"}{" "}
            {viewType.charAt(0).toUpperCase() + viewType.slice(1)} Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey={xAxisKey} stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey={viewType}
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Car Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="category" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...(categoryData || [])]
                .sort((a, b) => b.revenue - a.revenue)
                .map((category, index) => (
                  <div key={category.category}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {index + 1}. {category.category}
                        </span>
                      </div>
                      <span className="text-sm font-semibold">
                        ${category.revenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{
                          width: `${
                            (category.revenue /
                              Math.max(
                                ...(categoryData?.map((c) => c.revenue) || [0]),
                              )) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Booked Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...(categoryData || [])]
                .sort((a, b) => b.bookings - a.bookings)
                .map((category, index) => (
                  <div key={category.category}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {index + 1}. {category.category}
                        </span>
                      </div>
                      <span className="text-sm font-semibold">
                        {category.bookings} bookings
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600 rounded-full"
                        style={{
                          width: `${
                            (category.bookings /
                              Math.max(
                                ...(categoryData?.map((c) => c.bookings) || [
                                  0,
                                ]),
                              )) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
