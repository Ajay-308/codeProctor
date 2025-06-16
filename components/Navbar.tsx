"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { Code, Menu, X, Bell, Settings } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <Link
              href="/home"
              className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/candidates"
              className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              Candidates
            </Link>
            <Link
              href="/templates"
              className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              Templates
            </Link>
            <Link
              href="/docs"
              className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              Docs
            </Link>
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
            </Button>
            <Link
              href="/setting"
              className="hidden md:flex items-center gap-2 text-gray-600 hover:text-black cursor-pointer"
            >
              <Button
                variant="ghost"
                size="icon"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Settings className="h-5 w-5 text-gray-600 cursor-pointer" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link
              href="/dashboard"
              className="block py-2 text-gray-600 hover:text-black"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/interviews"
              className="block py-2 text-gray-600 hover:text-black"
              onClick={() => setMobileMenuOpen(false)}
            >
              Interviews
            </Link>
            <Link
              href="/candidates"
              className="block py-2 text-gray-600 hover:text-black"
              onClick={() => setMobileMenuOpen(false)}
            >
              Candidates
            </Link>
            <Link
              href="/templates"
              className="block py-2 text-gray-600 hover:text-black"
              onClick={() => setMobileMenuOpen(false)}
            >
              Templates
            </Link>
            <Link
              href="/docs"
              className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              Docs
            </Link>
            <div className="pt-4 border-t border-gray-200 flex justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-black"
              >
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-black"
              >
                <Settings className="h-5 w-5 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
