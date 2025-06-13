"use client";

import { useState, useMemo } from "react";
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
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [selectedProblem, setSelectedProblem] =
    useState<LeetCodeProblem | null>(null);

  // Get unique topics for filter
  const allTopics = useMemo(() => {
    const topics = new Set<string>();
    mockProblems.forEach((problem) => {
      problem.topics.forEach((topic) => topics.add(topic));
    });
    return Array.from(topics).sort();
  }, []);

  // Filter problems based on search and filters
  const filteredProblems = useMemo(() => {
    return mockProblems.filter((problem) => {
      const matchesSearch =
        problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.topics.some((topic) =>
          topic.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesDifficulty =
        difficultyFilter === "all" ||
        problem.difficulty.toLowerCase() === difficultyFilter.toLowerCase();

      const matchesTopic =
        topicFilter === "all" || problem.topics.includes(topicFilter);

      return matchesSearch && matchesDifficulty && matchesTopic;
    });
  }, [searchTerm, difficultyFilter, topicFilter]);

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
          <div className="flex-1 overflow-auto p-4">
            {filteredProblems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  No problems found
                </h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
                  Try adjusting your search criteria or filters to find more
                  problems.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredProblems.map((problem) => (
                  <Card
                    key={problem.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-violet-200 dark:hover:border-violet-800"
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
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Problem Preview Modal */}
        <Dialog
          open={!!selectedProblem}
          onOpenChange={() => setSelectedProblem(null)}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {selectedProblem?.title}
              </DialogTitle>
            </DialogHeader>

            {selectedProblem && (
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
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
