import { lusitana } from "@/app/ui/utils/fonts";
import DashboardContent from "@/app/(admin)/dashboard/dashboard-content";

const DashboardPage = () => {
  return (
    <main className="space-y-6">
      <h1 className={`${lusitana.className} text-xl md:text-2xl mb-4 `}>
        Dashboard
      </h1>
      <DashboardContent />
    </main>
  );
};

export default DashboardPage;
