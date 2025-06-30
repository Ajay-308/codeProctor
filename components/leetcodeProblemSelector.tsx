"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, Code, Hash, Star, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import leetcodeData from "@/cleaned_problems.json";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useVirtualizer } from "@tanstack/react-virtual";

// Sample LeetCode problems data structure
type LeetCodeProblem = {
  id: string;
  title: string;
  url: string;
  difficulty: "Easy" | "Medium" | "Hard";
  isPremium: boolean;
  topics: string[];
  description: string;
  exampleTestCases: string;
  sampleTestCase: string;
  codeSnippets: Array<{
    lang: string;
    code: string;
  }>;
};

const mockProblems: LeetCodeProblem[] = leetcodeData as LeetCodeProblem[];

interface LeetCodeProblemSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectProblem: (problem: LeetCodeProblem) => void;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "bg-emerald-500 text-white";
    case "medium":
      return "bg-amber-500 text-white";
    case "hard":
      return "bg-rose-500 text-white";
    default:
      return "bg-slate-500 text-white";
  }
};

const getDifficultyVariant = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "secondary";
    case "medium":
      return "outline";
    case "hard":
      return "destructive";
    default:
      return "secondary";
  }
};

export default function LeetCodeProblemSelector({
  open,
  onOpenChange,
  onSelectProblem,
}: LeetCodeProblemSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [selectedProblem, setSelectedProblem] =
    useState<LeetCodeProblem | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const allTopics = useMemo(() => {
    const topics = new Set<string>();
    mockProblems.forEach((problem) =>
      problem.topics.forEach((t) => topics.add(t))
    );
    return Array.from(topics).sort();
  }, []);

  const filteredProblems = useMemo(() => {
    return mockProblems.filter((problem) => {
      const matchesSearch =
        problem.title
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        problem.description
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        problem.topics.some((t) =>
          t.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );

      const matchesDifficulty =
        difficultyFilter === "all" ||
        problem.difficulty.toLowerCase() === difficultyFilter.toLowerCase();

      const matchesTopic =
        topicFilter === "all" || problem.topics.includes(topicFilter);

      return matchesSearch && matchesDifficulty && matchesTopic;
    });
  }, [debouncedSearchTerm, difficultyFilter, topicFilter]);

  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredProblems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 10,
  });

  const handleSelectProblem = (problem: LeetCodeProblem) => {
    onSelectProblem(problem);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Code className="h-6 w-6" />
            Select LeetCode Problem
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[calc(90vh-120px)]">
          {/* Filters */}
          <div className="flex flex-col gap-4 p-4 border-b bg-slate-50 dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search problems by title, description, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={difficultyFilter}
                  onValueChange={setDifficultyFilter}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={topicFilter} onValueChange={setTopicFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Topics</SelectItem>
                    {allTopics.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Found {filteredProblems.length} problems
            </div>
          </div>

          {/* Problems List */}
          <div ref={parentRef} className="flex-1 overflow-auto p-4 relative">
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const problem = filteredProblems[virtualRow.index];
                return (
                  <Card
                    key={problem.id}
                    className="absolute top-0 left-0 w-full cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-violet-200 dark:hover:border-violet-800"
                    style={{ transform: `translateY(${virtualRow.start}px)` }}
                    onClick={() => setSelectedProblem(problem)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-semibold line-clamp-2">
                            {problem.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant={getDifficultyVariant(problem.difficulty)}
                              className={cn(
                                "text-xs font-medium",
                                getDifficultyColor(problem.difficulty)
                              )}
                            >
                              {problem.difficulty}
                            </Badge>
                            {problem.isPremium && (
                              <Badge variant="outline" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Premium
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(problem.url, "_blank");
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-3">
                        {problem.description.substring(0, 200)}...
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {problem.topics.slice(0, 3).map((topic, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs font-normal px-2 py-0.5"
                          >
                            <Hash className="h-3 w-3 mr-1" />
                            {topic}
                          </Badge>
                        ))}
                        {problem.topics.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{problem.topics.length - 3} more
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Problem #{problem.id}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {problem.codeSnippets.length} languages
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lazy-loaded Preview Dialog */}
        {selectedProblem && (
          <Dialog open={true} onOpenChange={() => setSelectedProblem(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {selectedProblem.title}
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-col h-[calc(90vh-180px)]">
                <div className="flex items-center gap-4 mb-4">
                  <Badge
                    variant={getDifficultyVariant(selectedProblem.difficulty)}
                    className={cn(
                      "text-sm font-medium",
                      getDifficultyColor(selectedProblem.difficulty)
                    )}
                  >
                    {selectedProblem.difficulty}
                  </Badge>
                  {selectedProblem.isPremium && (
                    <Badge variant="outline">
                      <Star className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {selectedProblem.topics.map((topic, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-auto">
                  <div className="prose dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                      {selectedProblem.description}
                    </pre>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedProblem(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleSelectProblem(selectedProblem)}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    Use This Problem
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
