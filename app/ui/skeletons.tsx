// Loading animation
// const shimmer =
//   'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

import { TableCell, TableRow } from "@/app/ui/table";
import { Card, CardContent, CardHeader } from "@/app/ui/card";

type TableSkeletonRowsProps = {
  columns: number;
  rows?: number;
  dense?: boolean;
};

export function TableSkeletonRows({
  columns,
  rows = 5,
  dense = false,
}: TableSkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow
          key={`table-skeleton-row-${rowIndex}`}
          className="animate-pulse border-gray-200"
        >
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <TableCell
              key={`table-skeleton-cell-${rowIndex}-${columnIndex}`}
              className={dense ? "py-2" : "py-3"}
            >
              <div
                className="h-4 rounded-md bg-gray-200/90"
                style={{
                  width:
                    columnIndex === 0
                      ? "80%"
                      : columnIndex === columns - 1
                        ? "60%"
                        : "70%",
                }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-300 bg-white no-blur">
      <div className="flex items-center gap-2 px-6 pt-6 pb-2">
        <div className="h-5 w-5 rounded-md bg-gray-200" />
        <div className="h-4 w-20 rounded-md bg-gray-200" />
      </div>
      <div className="px-6 pb-6">
        <div className="h-7 w-24 rounded-md bg-gray-200" />
      </div>
    </div>
  );
}

export function CardsSkeleton() {
  return (
    <>
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </>
  );
}

export function CarSkeleton() {
  return (
    <div className="flex flex-row items-center justify-between border-b border-gray-100 py-4">
      <div className="flex items-center">
        <div className="mr-2 h-8 w-8 rounded-full bg-gray-200" />
        <div className="min-w-0">
          <div className="h-5 w-40 rounded-md bg-gray-200" />
          <div className="mt-2 h-4 w-12 rounded-md bg-gray-200" />
        </div>
      </div>
      <div className="mt-2 h-4 w-12 rounded-md bg-gray-200" />
    </div>
  );
}

export function TableCarsSkeleton() {
  return (
    <div
      className={`relative flex w-full flex-col overflow-hidden md:col-span-4`}
    >
      <div className="mb-4 h-8 w-36 rounded-md bg-gray-100" />
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-100 p-4">
        <div className="bg-white px-6">
          <CarSkeleton />
          <CarSkeleton />
          <CarSkeleton />
          <CarSkeleton />
          <CarSkeleton />
        </div>
        <div className="flex items-center pb-2 pt-6">
          <div className="h-5 w-5 rounded-full bg-gray-200" />
          <div className="ml-2 h-4 w-20 rounded-md bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export function HomeCarCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100">
      <div className="h-56 w-full animate-pulse bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export function HomeCarCardsSkeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <HomeCarCardSkeleton key={`home-car-skeleton-${index}`} />
      ))}
    </>
  );
}

export function CarDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="mb-6 h-10 w-40 rounded-md bg-gray-200" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-125 w-full rounded-xl bg-gray-200" />

            <div className="space-y-3">
              <div className="h-9 w-72 rounded-md bg-gray-200" />
              <div className="h-5 w-48 rounded-md bg-gray-200" />
            </div>

            <div className="rounded-xl border border-gray-200 p-6">
              <div className="mb-4 h-6 w-36 rounded-md bg-gray-200" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="h-24 rounded-lg bg-gray-100" />
                <div className="h-24 rounded-lg bg-gray-100" />
                <div className="h-24 rounded-lg bg-gray-100" />
                <div className="h-24 rounded-lg bg-gray-100" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="h-6 w-32 rounded-md bg-gray-200" />
              <div className="h-4 w-full rounded bg-gray-100" />
              <div className="h-4 w-11/12 rounded bg-gray-100" />
              <div className="h-4 w-9/12 rounded bg-gray-100" />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-gray-200 p-6 space-y-4">
              <div className="h-10 w-40 rounded-md bg-gray-200" />
              <div className="h-16 rounded-md bg-gray-100" />
              <div className="h-16 rounded-md bg-gray-100" />
              <div className="h-11 w-full rounded-md bg-gray-200" />
              <div className="h-4 w-44 mx-auto rounded bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MyBookingsSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-6 animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`my-bookings-skeleton-${index}`}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            <div className="h-64 md:h-full bg-gray-200" />
            <div className="md:col-span-2 p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-6 w-56 rounded bg-gray-200" />
                  <div className="h-4 w-32 rounded bg-gray-100" />
                </div>
                <div className="h-6 w-24 rounded bg-gray-100" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="h-4 w-36 rounded bg-gray-100" />
                  <div className="h-4 w-40 rounded bg-gray-100" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-36 rounded bg-gray-100" />
                  <div className="h-4 w-40 rounded bg-gray-100" />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="space-y-2">
                  <div className="h-3 w-20 rounded bg-gray-100" />
                  <div className="h-8 w-28 rounded bg-gray-200" />
                </div>
                <div className="flex gap-2">
                  <div className="h-9 w-24 rounded bg-gray-100" />
                  <div className="h-9 w-24 rounded bg-gray-100" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RoleCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gray-200">
              <div className="size-6" />
            </div>
            <div className="space-y-2">
              <div className="h-5 w-40 rounded-md bg-gray-200" />
              <div className="h-4 w-16 rounded-md bg-gray-200" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-14 rounded-full bg-gray-200" />
            <div className="size-8 rounded-md bg-gray-200" />
            <div className="size-8 rounded-md bg-gray-200" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="h-4 w-32 rounded-md bg-gray-200" />
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-20 rounded-full bg-gray-200" />
            <div className="h-6 w-24 rounded-full bg-gray-200" />
            <div className="h-6 w-16 rounded-full bg-gray-200" />
            <div className="h-6 w-28 rounded-full bg-gray-200" />
            <div className="h-6 w-20 rounded-full bg-gray-200" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RoleCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <RoleCardSkeleton key={`role-card-skeleton-${index}`} />
      ))}
    </div>
  );
}

export function PaymentBookingsSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`payment-bookings-skeleton-${index}`}
          className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row gap-4"
        >
          <div className="w-full sm:w-40 h-28 shrink-0 overflow-hidden rounded-md bg-gray-200" />

          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-5 w-48 rounded bg-gray-200" />
            <div className="h-4 w-32 rounded bg-gray-100" />
            <div className="h-4 w-56 rounded bg-gray-100" />
            <div className="h-4 w-44 rounded bg-gray-100" />
          </div>

          <div className="sm:text-right space-y-2">
            <div className="h-3 w-12 rounded bg-gray-100 ml-auto" />
            <div className="h-4 w-20 rounded bg-gray-200 ml-auto" />
            <div className="h-3 w-10 rounded bg-gray-100 ml-auto" />
            <div className="h-6 w-24 rounded bg-gray-200 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Reports Page Skeletons ───────────────────────────────────────────────────

export function ReportsSummaryCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="h-5 w-32 rounded-md bg-gray-200" />
        <div className="size-5 rounded-full bg-gray-200" />
      </CardHeader>
      <CardContent>
        <div className="h-9 w-24 rounded-md bg-gray-200" />
        <div className="h-4 w-28 rounded-md bg-gray-200 mt-2" />
      </CardContent>
    </Card>
  );
}

export function ReportsChartSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-6 w-48 rounded-md bg-gray-200" />
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full rounded-md bg-gray-200" />
      </CardContent>
    </Card>
  );
}

export function ReportsBarChartSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-6 w-56 rounded-md bg-gray-200" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full rounded-md bg-gray-200" />
      </CardContent>
    </Card>
  );
}

export function ReportsListSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-6 w-56 rounded-md bg-gray-200" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`report-list-item-${i}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="h-5 w-32 rounded-md bg-gray-200" />
                <div className="h-5 w-24 rounded-md bg-gray-200" />
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <ReportsSummaryCardSkeleton />
        <ReportsSummaryCardSkeleton />
        <ReportsSummaryCardSkeleton />
      </div>
      <ReportsChartSkeleton />
      <ReportsBarChartSkeleton />
      <div className="grid gap-4 md:grid-cols-2">
        <ReportsListSkeleton />
        <ReportsListSkeleton />
      </div>
    </div>
  );
}
