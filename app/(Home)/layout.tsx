'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Car } from "lucide-react";
import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-blue-50 shadow-sm shadow-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <span className="text-3xl  font-bold text-blue-600">CarR</span>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-semibold">
              <Link
                href="/"
                className={` transition-colors ${
                  isActive("/")
                    ? "text-blue-700"
                    : "text-gray-600 hover:text-blue-700"
                }`}
              >
                Home
              </Link>
              <Link
                href="/cars"
                className={` transition-colors ${
                  isActive("/cars")
                    ? "text-blue-700"
                    : "text-gray-600 hover:text-blue-700"
                }`}
              >
                Cars
              </Link>
              <Link
                href="/my-bookings"
                className={` transition-colors ${
                  isActive("/my-bookings")
                    ? "text-blue-700"
                    : "text-gray-600 hover:text-blue-700"
                }`}
              >
                My Bookings
              </Link>
              <span className=" text-gray-600">About</span>
            </nav>

            {/* Search and Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-64 border-none hover:border hover:border-blue-300 ">
                <Search className="w-4 h-4 text-gray-400 " />
                <Input
                  type="text"
                  placeholder="Search cars"
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                asChild
                className=" border-blue-500 py-2 px-4"
              >
                <Link href="/dashboard">Admin</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300"
              >
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold">CarR</span>
              </div>
              <p className="text-sm text-gray-600">
                Your trusted partner for premium car rentals
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>About Us</li>
                <li>Careers</li>
                <li>Press</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Help Center</li>
                <li>Safety</li>
                <li>Contact Us</li>
                <li>Terms</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Facebook</li>
                <li>Twitter</li>
                <li>Instagram</li>
                <li>LinkedIn</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
            © 2026 CarRental. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
