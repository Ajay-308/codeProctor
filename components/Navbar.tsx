"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { Code, Menu, X, Bell, Settings } from "lucide-react";
import useUserRole from "@/hooks/useUserRole";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isInterviewer, isCandidate } = useUserRole();

  // Define navigation items with role restrictions
  const navigationItems = [
    {
      href: "/home",
      label: "Home",
      allowedRoles: ["interviewer", "candidate"], // Both can access
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      allowedRoles: ["interviewer"], // Only interviewers
    },
    {
      href: "/candidates",
      label: "Candidates",
      allowedRoles: ["interviewer"], // Only interviewers
    },
    {
      href: "/templates",
      label: "Templates",
      allowedRoles: ["interviewer"], // Only interviewers
    },
    {
      href: "/docs",
      label: "Docs",
      allowedRoles: ["interviewer", "candidate"], // Both can access
    },
  ];

  // Filter navigation items based on user role
  const getVisibleNavItems = () => {
    return navigationItems.filter((item) => {
      if (isInterviewer) return item.allowedRoles.includes("interviewer");
      if (isCandidate) return item.allowedRoles.includes("candidate");
      return false;
    });
  };

  const visibleNavItems = getVisibleNavItems();

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Code className="h-6 w-6 text-black" />
              <span className="text-xl font-bold">CodeProctor</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-black"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <Link href="/setting">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-black"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: {
                      width: "2.7rem",
                      height: "2.7rem",
                    },
                  },
                }}
              />
            </div>
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-gray-600 hover:text-black"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>{" "}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-2 text-gray-600 hover:text-black"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            <div className="pt-4 border-t border-gray-200 space-y-2">
              <div className="px-2 py-2">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      rootBox: "flex",
                      userButtonBox: "w-full",
                    },
                  }}
                />
              </div>

              <Button
                variant="ghost"
                className="w-full justify-start text-gray-600 hover:text-black"
              >
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </Button>
              <Link
                href="/setting"
                className="flex items-center w-full gap-2 p-2 text-gray-600 hover:text-black rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
