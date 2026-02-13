import Link from "next/link";
import CarLogo from "@/app/ui/carLogo";
import NavLinks from "./nav-links";
import { PowerIcon } from "@heroicons/react/24/outline";

const Sidenav = () => {
    return <div className="flex flex-col h-full px-3 md:px-2 py-4">
        <Link href="/" className="mb-2 flex h-20 md:h-40 items-end justify-start rounded-md bg-blue-600">
        <div className="w-32 md:w-40 text-white" >
            <CarLogo />
        </div>
        </Link>
        <div className="flex grow flex-row md:flex-col justify-between space-x-2 md:space-x-0 md:space-y-2">
            <NavLinks />
             <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
             <form>
                <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium  hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
                    <PowerIcon className="w-6" />
                    <div className="hidden md:block">Sign Out</div>
                </button>
             </form>
        </div>
    </div>;
};

export default Sidenav;
