"use client";
import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  id: string;
  title: string;
  badge: string;
  snippet: string;
  section: string;
}

const searchableContent = [
  {
    id: "getting-started",
    title: "Getting Started with CodeProctor",
    badge: "Introduction",
    content:
      "CodeProctor is a comprehensive coding interview platform that combines advanced proctoring capabilities with powerful development tools. Our platform enables organizations to conduct secure, efficient, and insightful technical interviews while maintaining the highest standards of integrity.",
    section: "getting-started",
  },
  {
    id: "split-screen-interface",
    title: "Split-Screen Interface",
    badge: "Interface",
    content:
      "Experience seamless interview management with our intuitive split-screen interface. View code and video side by side for a complete interview experience. Simultaneous code and video monitoring, customizable layout options, real-time synchronization.",
    section: "split-screen-interface",
  },
  {
    id: "live-video-proctoring",
    title: "Live Video Proctoring",
    badge: "Proctoring",
    content:
      "Ensure interview integrity with real-time video monitoring and recording capabilities. HD video recording with cloud storage, real-time monitoring alerts, automated suspicious activity detection, screen sharing prevention, browser lockdown capabilities.",
    section: "live-video-proctoring",
  },
  {
    id: "advanced-code-editor",
    title: "Advanced Code Editor",
    badge: "Editor",
    content:
      "Provide candidates with a full-featured code editor that supports syntax highlighting and multiple programming languages. Support for 50+ programming languages, intelligent syntax highlighting, auto-completion and IntelliSense, code formatting and linting.",
    section: "advanced-code-editor",
  },
  {
    id: "automated-assessment",
    title: "Automated Assessment",
    badge: "Assessment",
    content:
      "Instantly evaluate code submissions with our powerful testing engine. Custom test case creation, performance benchmarking, code quality analysis, plagiarism detection, automated scoring algorithms, detailed feedback generation.",
    section: "automated-assessment",
  },
  {
    id: "collaborative-interviews",
    title: "Collaborative Interviews",
    badge: "Collaboration",
    content:
      "Enable multiple interviewers to join sessions and provide feedback in real-time. Multi-interviewer support, role-based permissions, real-time note sharing, private interviewer chat, synchronized evaluation forms.",
    section: "collaborative-interviews",
  },
  {
    id: "playback-analysis",
    title: "Playback & Analysis",
    badge: "Analysis",
    content:
      "Review interviews with synchronized code and video playback for deeper insights. Synchronized video and code playback, keystroke analysis and timing, problem-solving pattern recognition, performance trend analysis.",
    section: "playback-analysis",
  },
  {
    id: "getting-started-guide",
    title: "Quick Start Guide",
    badge: "Quick Start",
    content:
      "Get started with CodeProctor in just a few simple steps. Create your account, set up your organization, create your first interview, invite candidates with automated scheduling.",
    section: "getting-started-guide",
  },
  {
    id: "integration-api",
    title: "Integration & API",
    badge: "Integration",
    content:
      "Integrate CodeProctor with your existing hiring workflow using our comprehensive API. REST API with comprehensive documentation, webhook support, ATS integrations, calendar integrations, SSO support.",
    section: "integration-api",
  },
];

export function SearchComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (event.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }

    const searchResults = searchableContent
      .filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.content.toLowerCase().includes(query.toLowerCase()) ||
          item.badge.toLowerCase().includes(query.toLowerCase())
      )
      .map((item) => ({
        id: item.id,
        title: item.title,
        badge: item.badge,
        snippet: getSnippet(item.content, query),
        section: item.section,
      }))
      .slice(0, 5);

    setResults(searchResults);
  }, [query]);

  const getSnippet = (content: string, query: string): string => {
    const index = content.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return content.substring(0, 100) + "...";

    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 50);
    return "..." + content.substring(start, end) + "...";
  };

  const handleResultClick = (section: string) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div className="relative" ref={searchRef}>
      <Button
        variant="outline"
        className="relative h-8 w-full justify-start rounded-[0.5rem] text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setIsOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Search docs...
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2">
          <Card className="w-full shadow-lg">
            <CardContent className="p-0">
              <div className="flex items-center border-b px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Input
                  ref={inputRef}
                  className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none border-0 focus-visible:ring-0 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Search documentation..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {results.length > 0 && (
                <div className="max-h-80 overflow-y-auto">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className="flex cursor-pointer items-start gap-3 p-3 hover:bg-muted/50 border-b last:border-b-0"
                      onClick={() => handleResultClick(result.section)}
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {result.badge}
                          </Badge>
                          <h4 className="text-sm font-medium">
                            {result.title}
                          </h4>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {result.snippet}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {query && results.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No results found for &quot;{query}&quot;
                </div>
              )}

              {!query && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Start typing to search documentation...
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
