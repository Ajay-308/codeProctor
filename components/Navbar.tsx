"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Code, Menu, X, Bell, Settings, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
              href="/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/interviews"
              className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              Interviews
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-600 hover:text-black"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
