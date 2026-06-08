"use client";

import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/app/lib/auth";

export type ReportType = "daily" | "monthly";

export interface ReportQuery {
  type: ReportType;
  startDate?: string;
  endDate?: string;
}

export interface ReportSummary {
  totalRevenue: number;
  totalBookings: number;
  avgDailyRevenue: number;
}

export interface TrendData {
  period: string;
  revenue: number;
  bookings: number;
  cars: number;
}

export interface CategoryData {
  category: string;
  revenue: number;
  bookings: number;
}

const buildQueryString = (query: ReportQuery) => {
  const params = new URLSearchParams();
  params.append("type", query.type);
  if (query.startDate) params.append("startDate", query.startDate);
  if (query.endDate) params.append("endDate", query.endDate);
  return params.toString();
};

export const fetchReportSummary = async (query: ReportQuery): Promise<ReportSummary> => {
  const qs = buildQueryString(query);
  const response = await authFetch(`/reports/summary?${qs}`);
  if (!response.ok) throw new Error("Failed to fetch report summary");
  return response.json();
};

export const fetchReportTrend = async (query: ReportQuery): Promise<TrendData[]> => {
  const qs = buildQueryString(query);
  const response = await authFetch(`/reports/trend?${qs}`);
  if (!response.ok) throw new Error("Failed to fetch report trend");
  return response.json();
};

export const fetchCategoryRevenue = async (query: ReportQuery): Promise<CategoryData[]> => {
  const qs = buildQueryString(query);
  const response = await authFetch(`/reports/category-revenue?${qs}`);
  if (!response.ok) throw new Error("Failed to fetch category revenue");
  return response.json();
};

export const useReportSummary = (query: ReportQuery, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["reportSummary", query],
    queryFn: () => fetchReportSummary(query),
    enabled,
  });
};

export const useReportTrend = (query: ReportQuery, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["reportTrend", query],
    queryFn: () => fetchReportTrend(query),
    enabled,
  });
};

export const useCategoryRevenue = (query: ReportQuery, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["categoryRevenue", query],
    queryFn: () => fetchCategoryRevenue(query),
    enabled,
  });
};
