import Search from "@/app/ui/search";
import { CreateCarButton } from "@/app/ui/manageCars/button";
import { lusitana } from "@/app/ui/utils/fonts";
import { Suspense } from "react";
import { Car, initialCars } from "@/app/lib/data";
import CarsTable from "@/app/ui/manageCars/table";
import { TableCarsSkeleton} from "@/app/ui/skeletons";


const Page = async (props: {
  searchParams: Promise<{ 
    query: string; 
    currentPage: string 
  }>;
}) => {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.currentPage) || 1;
  
  // Calculate total pages based on the cars array
  const allCars = initialCars;
  const carsPerPage = 5; // Assuming 5 cars per page
  const totalPages = Math.ceil(allCars.length / carsPerPage);
  
  return (
    <div className="w-full">
    <div className=" w-full flex items-center justify-between ">
      <h1 className={`${lusitana.className} text-2xl`}>Manage Cars</h1>
       </div>
       <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search cars..." />
        <CreateCarButton />
       </div>
       <Suspense key={query + currentPage} fallback={<TableCarsSkeleton />}>
        <CarsTable query={query} currentPage={currentPage} />
      </Suspense>
        <div className="mt-5 flex w-full justify-center">
        {/* Simple pagination - replace with actual Pagination component when available */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <div 
              key={i+1}
              className={`px-3 py-1 rounded-md ${currentPage === i+1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {i+1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Page;
