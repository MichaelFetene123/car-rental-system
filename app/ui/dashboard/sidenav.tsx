"use client";

import Link from "next/link";
import CarLogo from "@/app/ui/carLogo";
import NavLinks from "./nav-links";
import {
  PowerIcon,
  Cog6ToothIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { logoutUser } from "@/app/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const Sidenav = () => {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement | null>(null);

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    await logoutUser();
    setIsSigningOut(false);
    router.push("/");
  };

  const handleProfile = () => {
    setIsSettingsOpen(false);
    router.push("/dashboard/profile");
  };

  useEffect(() => {
    if (!isSettingsOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!settingsRef.current) return;
      if (!settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isSettingsOpen]);

  return (
    <div className="flex flex-col h-full px-3 md:px-2 py-4 overflow-y-auto overflow-x-hidden">
      <Link
        href="/"
        className="mb-2 flex md:min-h-30 md:h-40 items-end justify-start rounded-md bg-blue-600"
      >
        <div className="w-32 md:w-40 text-white">
          <CarLogo />
        </div>
      </Link>
      <div className="flex grow flex-row md:flex-col justify-between space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto md:overflow-x-hidden ">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block border-b border-gray-300"></div>
        <div className="relative" ref={settingsRef}>
          <button
            type="button"
            onClick={() => setIsSettingsOpen((prev) => !prev)}
            className="flex h-12 w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3"
          >
            <Cog6ToothIcon className="w-6" />
            <div className="hidden md:block">Settings</div>
          </button>

          {isSettingsOpen ? (
            <div className="absolute left-0 bottom-14 z-50 w-56 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
              <button
                type="button"
                onClick={handleProfile}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <UserCircleIcon className="w-5" />
                <span>Profile</span>
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <PowerIcon className="w-5" />
                <span>{isSigningOut ? "Signing Out..." : "Logout"}</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Sidenav;
