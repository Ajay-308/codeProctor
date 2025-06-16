"use client";

import { TracingBeamDocs } from "@/components/tracingBeamDocs";
import { Header } from "./search";
import { Sidebar } from "./sidebar";
import { useAuth } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function DocsPage() {
  const { isLoaded, userId } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Top Navigation */}
      {isLoaded && userId ? (
        <Navbar />
      ) : (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="h-6 w-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
                <span className="font-bold text-xl">CodeProctor</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Home</span>
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/docs" className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Docs</span>
                </Link>
              </Button>
            </div>
          </div>
        </nav>
      )}

      <div className="flex min-h-[calc(100vh-3.5rem)]">
        {/* Sticky Sidebar */}
        <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <Header />
          <main className="relative">
            <TracingBeamDocs />
          </main>
        </div>
      </div>
    </div>
  );
}
