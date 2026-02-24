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
import { categoryData, dailyData, monthlyData } from "@/app/lib/data";
import { lusitana } from "@/app/ui/utils/fonts";

export default function Reports() {
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
        <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-500 text-white">
          <Download className="size-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          value={reportType}
          onValueChange={(value) => setReportType(value as "daily" | "monthly")}
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
        >
          <SelectTrigger className="w-full sm:w-40 border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-gray-300 bg-white"   >
            <SelectItem value="revenue">Revenue</SelectItem>
            <SelectItem value="bookings">Bookings</SelectItem>
            <SelectItem value="cars">Cars Rented</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gray-50 border-none shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="size-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              ${totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {reportType === "daily" ? "Last 9 days" : "Last 7 months"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 border-none shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bookings
            </CardTitle>
            <Calendar className="size-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {totalBookings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {reportType === "daily" ? "Last 9 days" : "Last 7 months"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 border-none shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg {reportType === "daily" ? "Daily" : "Monthly"} Revenue
            </CardTitle>
            <TrendingUp className="size-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              ${avgDailyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average</p>
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
