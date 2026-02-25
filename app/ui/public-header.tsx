import Link from "next/link";
import { Search, Car } from "lucide-react";
import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import { cn } from "./utils/utils";

// todo: remove this page

export default function PublicHeader({ className}: React.ComponentProps<"header">) {
  return (
    <header className={cn(`border-b border-gray-200 bg-white sticky top-0 z-50 ${className}`)} >
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="text-blue-600">
           <img src="/carIcon.png" alt="Car Icon" className="w-9 h-9" />
          </div>
          <span className="text-3xl font-bold text-gray-900 tracking-tight">
            CarR
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <Link href="/cars" className="hover:text-gray-900">
            Cars
          </Link>
          <Link href="/my-bookings" className="hover:text-gray-900">
            My Bookings
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <div className="relative hidden lg:block w-64">
            <Input
              type="text"
              placeholder="Search cars"
              className="pl-4 pr-10 rounded-full border-gray-200 bg-gray-50 h-10 focus:bg-white transition-colors"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          </div>
          <Link
            href="/dashboard"
            className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Admin
          </Link>
          <Link href="/login">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-6 shadow-sm shadow-blue-200">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
