"use client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  Rocket,
  Settings,
  Code,
  Shield,
  Users,
  BarChart3,
  HelpCircle,
  Zap,
} from "lucide-react";

const sidebarItems = [
  { title: "Getting Started", icon: Rocket, href: "#getting-started" },
  {
    title: "Split-Screen Interface",
    icon: BookOpen,
    href: "#split-screen-interface",
  },
  {
    title: "Live Video Proctoring",
    icon: Shield,
    href: "#live-video-proctoring",
  },
  { title: "Advanced Code Editor", icon: Code, href: "#advanced-code-editor" },
  { title: "Automated Assessment", icon: Zap, href: "#automated-assessment" },
  {
    title: "Collaborative Interviews",
    icon: Users,
    href: "#collaborative-interviews",
  },
  { title: "Playback & Analysis", icon: BarChart3, href: "#playback-analysis" },
  {
    title: "Quick Start Guide",
    icon: Settings,
    href: "#getting-started-guide",
  },
  { title: "Integration & API", icon: HelpCircle, href: "#integration-api" },
];

export function Sidebar() {
  return (
    <div className="w-64 border-r bg-background/50 backdrop-blur">
      <ScrollArea className="h-[calc(100vh-3.5rem)] py-6 pl-6 pr-6">
        <div className="space-y-2">
          {sidebarItems.map((item) => (
            <Button
              key={item.title}
              variant="ghost"
              className="w-full justify-start"
              asChild
            >
              <a href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </a>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
