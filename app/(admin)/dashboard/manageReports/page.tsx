"use client";
import { useState } from "react";
import { toast } from "sonner";
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
import { ReportsSkeleton } from "@/app/ui/skeletons";


import {
  useReportSummary,
  useReportTrend,
  useCategoryRevenue,
  ReportType,
} from "@/app/lib/reports-api";
import { authFetch } from "@/app/lib/auth";

export default function Reports() {
  const { can: canAccess, isAdmin, isLoading: isPermissionsLoading, isLoaded: isPermissionsLoaded } = usePermissions();
  const canViewReports = canAccess(Permissions.VIEW_REPORT);
  const canManageReports = canAccess(Permissions.MANAGE_REPORT);
  const canAccessReports = canViewReports || canManageReports;

  // Admins are identified from the local token immediately — no need to wait for the query
  const permissionsReady = isAdmin || isPermissionsLoaded;

  const [reportType, setReportType] = useState<ReportType>("daily");
  const [viewType, setViewType] = useState<"revenue" | "bookings" | "cars">(
    "revenue",
  );
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf" | "xlsx">("csv");
  const [isExporting, setIsExporting] = useState(false);

  const { data: summary, isLoading: isLoadingSummary } = useReportSummary({ type: reportType }, canAccessReports);
  const { data: trendData, isLoading: isLoadingTrend } = useReportTrend({ type: reportType }, canAccessReports);
  const { data: categoryData, isLoading: isLoadingCategory } = useCategoryRevenue({ type: reportType }, canAccessReports);

  const xAxisKey = "period";

  const totalRevenue = summary?.totalRevenue || 0;
  const totalBookings = summary?.totalBookings || 0;
  const avgDailyRevenue = summary?.avgDailyRevenue || 0;

  const isLoading = !permissionsReady || isLoadingSummary || isLoadingTrend || isLoadingCategory;



  const handleExport = async () => {
    try {
      setIsExporting(true);
      toast.loading(`Exporting report to ${exportFormat.toUpperCase()}...`, { id: "export-toast" });
      const queryParams = new URLSearchParams();
      queryParams.append("type", reportType);
      queryParams.append("format", exportFormat);
      
      const res = await authFetch(`/reports/export?${queryParams.toString()}`);
      
      if (!res.ok) {
        throw new Error("Failed to export report");
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${reportType}-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Report exported successfully!", { id: "export-toast" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to export report.", { id: "export-toast" });
    } finally {
      setIsExporting(false);
    }
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
        <div className="flex gap-2">
          <Select
            value={exportFormat}
            onValueChange={(v) => setExportFormat(v as "csv" | "pdf" | "xlsx")}
            disabled={isLoading || isExporting || (permissionsReady && !canManageReports)}
          >
            <SelectTrigger className="w-36 bg-white border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-300">
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleExport}
            className="bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isLoading || isExporting || (permissionsReady && !canManageReports)}
          >
            <Download className="size-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>

      {permissionsReady && !canAccessReports ? (
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
          disabled={permissionsReady && !canAccessReports}
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
          disabled={permissionsReady && !canAccessReports}
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

      {isLoading ? (
        <ReportsSkeleton />
      ) : (
        <>
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
                  {reportType === "daily" ? "Selected Period" : "Selected Period"}
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
                  {reportType === "daily" ? "Selected Period" : "Selected Period"}
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
                <LineChart data={trendData || []}>
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
                <BarChart data={categoryData || []}>
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
        </>
      )}
    </div>
  );
}
