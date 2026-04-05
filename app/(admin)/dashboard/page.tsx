import { lusitana } from "@/app/ui/utils/fonts";
import { Suspense } from "react";
import Link from "next/link";
import { CardsSkeleton } from "@/app/ui/skeletons";
import Card from "@/app/ui/dashboard/cards";
import { cards, CardData } from "@/app/lib/data";
import {
  Card as UiCard,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/ui/card";
import { Button } from "@/app/ui/button";
import { Badge } from "@/app/ui/badge";
import { FolderTree, Plus } from "lucide-react";
import {
  BookingChart,
  CarTypeDistribution,
  RecentActivity,
  RevenueChart,
} from "../../ui/dashboard/Chart/charts";

const DashboardPage = () => {
  return (
    <main className="space-y-6">
      <h1 className={`${lusitana.className} text-xl md:text-2xl mb-4 `}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton />}>
          {cards.map((card: CardData, index: number) => (
            <Card
              key={index}
              title={card.title}
              value={card.value}
              Icon={card.icon}
            />
          ))}
        </Suspense>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Chart */}
        <RevenueChart />
        {/* Booking Chart */}
        <BookingChart />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {/* Car Type Distribution */}
        <CarTypeDistribution />
        {/* Recent Activity */}
        <RecentActivity />
      </div>

      <UiCard className="border-blue-100 bg-linear-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <FolderTree className="size-5" />
                Category Management
              </CardTitle>
              <CardDescription className="mt-1 text-blue-700/90">
                Organize your fleet with clear category groups and keep listings
                consistent.
              </CardDescription>
            </div>
            <Badge className="w-fit bg-blue-100 text-blue-700 hover:bg-blue-100">
              Admin Tools
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-blue-800">
              Create, edit, activate, and archive car categories in one place.
            </p>
            <Button
              asChild
              className="bg-blue-600 text-white hover:bg-blue-500"
            >
              <Link href="/dashboard/manageCategories">
                <Plus className="size-4" />
                Open Category Manager
              </Link>
            </Button>
          </div>
        </CardContent>
      </UiCard>
    </main>
  );
};

export default DashboardPage;
