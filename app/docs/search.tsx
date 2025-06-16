"use client";
import { SearchComponent } from "./searchComponent";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

export function Header() {
  const { isLoaded, userId } = useAuth();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link className="mr-6 flex items-center space-x-2" href="/">
          {!isLoaded && !userId && (
            <>
              <div className="h-6 w-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
              <span className="font-bold text-xl">CodeProctor</span>
            </>
          )}
        </Link>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <SearchComponent />
          </div>
        </div>
      </div>
    </header>
  );
}
