import Search from "@/app/ui/search";
import CreateCarButton from "@/app/ui/manageCars/button";
import { lusitana } from "@/app/ui/utils/fonts";
import { Suspense } from "react";
import { initialCars } from "@/app/lib/data";


const Page = async (props: {
  searchParams: Promise<{ 
    query: string; 
    currentPage: string 
  }>;
}) => {
  const searchParams = await props.searchParams;
  const query = searchParams?.currentPage || "";
  const currentPage = Number(searchParams?.currentPage) || 1;
  const totalPages = await initialCars(query);
  return (
    <div className="w-full">
    <div className=" w-full flex items-center justify-between ">
      <h1 className={`${lusitana.className} text-2xl`}>Manage Cars</h1>
       </div>
       <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search cars..." />
        <CreateCarButton />
       </div>
       <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
        <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
};
export default Page;
