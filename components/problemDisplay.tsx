"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

interface ProblemProps {
  id: string;
  title: string;
  url?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  isPremium?: boolean;
  topics: string[];
  description: string;
  exampleTestCases?: string;
  sampleTestCase?: string;
  codeSnippets: {
    lang: string;
    code: string;
  }[];
  inputFormat?: string;
  outputFormat?: string;
  sampleInput?: string;
  sampleOutput?: string;
  explanation?: string;
}

export default function ProblemDisplay({ problem }: { problem: ProblemProps }) {
  const [selectedLanguage, setSelectedLanguage] = useState(
    problem.codeSnippets[0]?.lang || "JavaScript"
  );
  const [code, setCode] = useState(
    problem.codeSnippets.find((snippet) => snippet.lang === selectedLanguage)
      ?.code || ""
  );

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    setCode(
      problem.codeSnippets.find((snippet) => snippet.lang === lang)?.code || ""
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-500 hover:bg-green-600";
      case "medium":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "hard":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Problem Header */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold">{problem.title}</h1>
            <Badge className={getDifficultyColor(problem.difficulty)}>
              {problem.difficulty}
            </Badge>
            {problem.isPremium && (
              <Badge
                variant="outline"
                className="border-yellow-500 text-yellow-500"
              >
                Premium
              </Badge>
            )}
          </div>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {problem.topics.map((topic) => (
            <Badge key={topic} variant="outline">
              {topic}
            </Badge>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 h-[calc(100vh-200px)]">
        {/* Problem Description */}
        <Card className="overflow-y-auto">
          <CardHeader className="pb-2">
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: problem.description.replace(/\n/g, "<br />"),
                }}
              />

              {/* Examples */}
              <h3 className="text-lg font-semibold mt-6">Examples</h3>
              {problem.description.includes("Example 1:") ? (
                <div>Content already includes examples</div>
              ) : (
                <>
                  <div className="bg-muted p-4 rounded-md my-4">
                    <p>
                      <strong>Input:</strong> {problem.sampleInput}
                    </p>
                    <p>
                      <strong>Output:</strong> {problem.sampleOutput}
                    </p>
                    {problem.explanation && (
                      <p>
                        <strong>Explanation:</strong> {problem.explanation}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Constraints */}
              {problem.description.includes("Constraints:") ? (
                <div>Content already includes constraints</div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mt-6">Constraints</h3>
                  <ul>
                    <li>1 ≤ nums.length ≤ 10^5</li>
                    <li>-10^9 ≤ nums[i] ≤ 10^9</li>
                  </ul>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Code Editor */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2 border-b">
            <div className="flex items-center justify-between">
              <Select
                value={selectedLanguage}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  {problem.codeSnippets.map((snippet) => (
                    <SelectItem key={snippet.lang} value={snippet.lang}>
                      {snippet.lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4 mr-2" /> Run
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-full font-mono text-sm p-4 resize-none border-0 rounded-none focus-visible:ring-0"
              style={{ minHeight: "400px" }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Test Cases */}
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle>Test Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="testcase1">
            <TabsList>
              <TabsTrigger value="testcase1">Test Case 1</TabsTrigger>
              <TabsTrigger value="testcase2">Test Case 2</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
            <TabsContent
              value="testcase1"
              className="p-4 bg-muted rounded-md mt-2"
            >
              {problem.sampleTestCase ||
                problem.exampleTestCases?.split(" ")[0] ||
                "[1,-2,3,4]"}
            </TabsContent>
            <TabsContent
              value="testcase2"
              className="p-4 bg-muted rounded-md mt-2"
            >
              {problem.exampleTestCases?.split(" ")[1] || "[1,-1,1,-1]"}
            </TabsContent>
            <TabsContent value="custom" className="mt-2">
              <Textarea
                placeholder="Enter custom test case..."
                className="font-mono"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
