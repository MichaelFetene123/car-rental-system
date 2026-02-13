import { lusitana } from "@/app/ui/utils/fonts";
import { Suspense } from "react";
import { CardsSkeleton } from "@/app/ui/skeletons";
import Card from "@/app/ui/dashboard/cards";
import { cards, CardData } from "@/app/lib/data";
import { BookingChart, CarTypeDistribution, RecentActivity, RevenueChart } from "../ui/dashboard/Chart/charts";


const DashboardPage = () => {
  return <main className="space-y-6">
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
      <BookingChart/>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      {/* Car Type Distribution */}
      <CarTypeDistribution />
      {/* Recent Activity */}
      <RecentActivity />
    </div>
  </main>;
};

export default DashboardPage;
