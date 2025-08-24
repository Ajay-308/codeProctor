"use client";

import { useState, useRef, useEffect } from "react";
import type * as monaco from "monaco-editor";
import { useSocket } from "@/hooks/useSocket";
import { useRoomSync } from "@/hooks/useRoomSync";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  BookIcon,
  LightbulbIcon,
  Users,
  Code,
  AlertCircleIcon,
  Loader2,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import Image from "next/image";
import LeetCodeProblemSelector from "@/components/leetcodeProblemSelector";
import {
  parseExamplesFromDescription,
  parseConstraints,
  cleanDescription,
} from "@/components/problem-parser";
import { Socket } from "socket.io-client";

// Your language configs
const languages = [
  { id: "javascript", name: "JavaScript" },
  { id: "python", name: "Python" },
  { id: "java", name: "Java" },
  { id: "cpp", name: "C++" },
  { id: "csharp", name: "C#" },
  { id: "go", name: "Go" },
  { id: "rust", name: "Rust" },
];

const languageImages = {
  cpp:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#00599C"/>
      <path d="M2 17L12 22L22 17" stroke="#00599C" strokeWidth="2" fill="none"/>
      <path d="M2 12L12 17L22 12" stroke="#00599C" strokeWidth="2" fill="none"/>
      <text x="12" y="15" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">C++</text>
    </svg>
  `),
  python:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.5 2 7 3.5 7 6V8H12V9H5C3 9 2 10.5 2 12.5S3 16 5 16H7V14C7 12 8.5 11 10.5 11H13.5C15.5 11 17 9.5 17 7.5V6C17 3.5 15.5 2 12 2Z" fill="#3776AB"/>
      <path d="M12 22C15.5 22 17 20.5 17 18V16H12V15H19C21 15 22 13.5 22 11.5S21 8 19 8H17V10C17 12 15.5 13 13.5 13H10.5C8.5 13 7 14.5 7 16.5V18C7 20.5 8.5 22 12 22Z" fill="#FFD43B"/>
      <circle cx="9.5" cy="5.5" r="1" fill="white"/>
      <circle cx="14.5" cy="18.5" r="1" fill="white"/>
    </svg>
  `),
  javascript:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="3" fill="#F7DF1E"/>
      <path d="M7.5 18.5C7.5 19.5 8.2 20 9.2 20C10.1 20 10.8 19.6 10.8 18.4V12H9.2V18.2C9.2 18.7 9 18.8 8.7 18.8C8.4 18.8 8.2 18.6 8.2 18.2H7.5V18.5Z" fill="#000"/>
      <path d="M12.5 20C13.8 20 14.8 19.3 14.8 18.1C14.8 16.8 14 16.4 12.9 16L12.4 15.8C11.8 15.6 11.5 15.4 11.5 15C11.5 14.7 11.7 14.5 12.1 14.5C12.5 14.5 12.8 14.7 12.8 15H14.2C14.2 13.9 13.4 13.2 12.1 13.2C10.9 13.2 10.1 13.9 10.1 15C10.1 16.2 10.8 16.6 11.8 17L12.3 17.2C12.9 17.4 13.3 17.6 13.3 18.1C13.3 18.5 13 18.7 12.5 18.7C11.9 18.7 11.6 18.4 11.6 17.9H10.2C10.2 19.2 11.1 20 12.5 20Z" fill="#000"/>
    </svg>
  `),
  java:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.5 17.5C8.5 17.5 7.5 18 9 18C10.8 18 11.5 17.8 13 17.5C13 17.5 13.5 17.8 14 18C11.5 19 7.5 18.5 8.5 17.5Z" fill="#ED8B00"/>
      <path d="M9 15.5C9 15.5 8 16 9.5 16C11.3 16 12 15.8 13.5 15.5C13.5 15.5 14 15.8 14.5 16C12 17 8 16.5 9 15.5Z" fill="#ED8B00"/>
      <path d="M12.5 13.5C14 13.5 15.5 12.5 15.5 11.5C15.5 10.5 14.5 10 13 10C11.5 10 10 10.5 10 11.5C10 12.5 11.5 13.5 12.5 13.5Z" fill="#5382A1"/>
      <path d="M16.5 19.5C16.5 19.5 17.5 20 16 20C14.2 20 13.5 19.8 12 19.5C12 19.5 11.5 19.8 11 20C13.5 21 17.5 20.5 16.5 19.5Z" fill="#ED8B00"/>
      <path d="M18 8C18 8 16 6 12 6C8 6 6 8 6 8C6 8 8 7 12 7C16 7 18 8 18 8Z" fill="#5382A1"/>
    </svg>
  `),
  csharp:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="3" fill="#239120"/>
      <path d="M12 4C8.5 4 6 6.5 6 10V14C6 17.5 8.5 20 12 20C15.5 20 18 17.5 18 14V10C18 6.5 15.5 4 12 4ZM12 18C9.5 18 8 16.5 8 14V10C8 7.5 9.5 6 12 6C14.5 6 16 7.5 16 10V14C16 16.5 14.5 18 12 18Z" fill="white"/>
      <text x="12" y="15" textAnchor="middle" fill="#239120" fontSize="8" fontWeight="bold">C#</text>
    </svg>
  `),
  go:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="3" fill="#00ADD8"/>
      <path d="M4 9H8V10H4V9ZM4 11H9V12H4V11ZM4 13H7V14H4V13Z" fill="white"/>
      <path d="M16 8C18.5 8 20 9.5 20 12C20 14.5 18.5 16 16 16C13.5 16 12 14.5 12 12C12 9.5 13.5 8 16 8ZM16 14.5C17.5 14.5 18.5 13.5 18.5 12C18.5 10.5 17.5 9.5 16 9.5C14.5 9.5 13.5 10.5 13.5 12C13.5 13.5 14.5 14.5 16 14.5Z" fill="white"/>
    </svg>
  `),
  rust:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="3" fill="#CE422B"/>
      <path d="M12 4L14 8H18L15 11L16 15L12 13L8 15L9 11L6 8H10L12 4Z" fill="white"/>
      <circle cx="12" cy="12" r="3" fill="#CE422B"/>
      <circle cx="12" cy="12" r="1.5" fill="white"/>
    </svg>
  `),
};

type ExtendedProblem = {
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
  parsedExamples?: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  parsedConstraints?: string[];
  cleanedDescription?: string;
  processed?: boolean;
};

interface CodeEditorProps {
  socket: Socket | null;
  roomId: string;
  userId: string;
  userName: string;
}

function CodeEditor({ roomId, userId, userName }: CodeEditorProps) {
  const [showProblemSelector, setShowProblemSelector] = useState(false);
  const [isLoadingProblem, setIsLoadingProblem] = useState(false);
  const [processedProblem, setProcessedProblem] =
    useState<ExtendedProblem | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const isRemoteChange = useRef(false);

  const socket = useSocket();

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    setIsConnected(socket.connected);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket]);

  const roomSync = useRoomSync({
    socket,
    userId,
    userName,
    roomId,
  });

  const code = roomSync ? roomSync.code : "";
  const setCode = roomSync ? roomSync.setCode : () => {};
  const language = roomSync ? roomSync.language : "javascript";
  const setLanguage = roomSync ? roomSync.setLanguage : () => {};
  const problem = roomSync ? roomSync.problem : null;
  const setProblem = roomSync ? roomSync.setProblem : () => {};
  const users = roomSync ? roomSync.users : [];

  const getStarterCode = (problem: ExtendedProblem, lang: string): string => {
    const snippet = problem.codeSnippets.find(
      (s) =>
        s.lang.toLowerCase() === lang.toLowerCase() ||
        (lang === "javascript" && s.lang.toLowerCase() === "js") ||
        (lang === "cpp" && s.lang.toLowerCase() === "c++") ||
        (lang === "csharp" && s.lang.toLowerCase() === "c#")
    );
    return snippet?.code || `// No starter code available for ${lang}`;
  };

  const processProblem = async (
    problem: ExtendedProblem
  ): Promise<ExtendedProblem> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const examples = parseExamplesFromDescription(problem.description);
        const constraints = parseConstraints(problem.description);
        const cleanedDescription = cleanDescription(problem.description);

        resolve({
          ...problem,
          parsedExamples: examples,
          parsedConstraints: constraints,
          cleanedDescription,
          processed: true,
        });
      }, 100);
    });
  };

  useEffect(() => {
    if (problem) {
      processProblem(problem as ExtendedProblem).then(setProcessedProblem);
    }
  }, [problem]);

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || "";
    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }
    setCode(newCode);
  };

  const handleProblemSelect = async (selectedProblem: ExtendedProblem) => {
    setIsLoadingProblem(true);
    try {
      const processed = await processProblem(selectedProblem);
      setProcessedProblem(processed);
      setProblem(processed);
      const starterCode = getStarterCode(processed, language);
      setCode(starterCode);
    } catch (error) {
      console.error("Error processing problem:", error);
      setProcessedProblem(selectedProblem);
      setProblem(selectedProblem);
    } finally {
      setIsLoadingProblem(false);
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    if (processedProblem) {
      const newCode = getStarterCode(processedProblem, newLang);
      setCode(newCode);
    }
  };

  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monacoInstance: typeof monaco
  ) => {
    editorRef.current = editor;

    const keysToBlock = [
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyC,
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyV,
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyX,
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyA,
    ];
    keysToBlock.forEach((key) => {
      editor.addCommand(key, () => {});
    });

    editor.onContextMenu((e) => {
      e.event.preventDefault();
      e.event.stopPropagation();
    });

    const editorDOM = editor.getDomNode();
    if (editorDOM) {
      const prevent = (e: Event) => {
        e.preventDefault();
        alert("Copy, paste, and cut are disabled.");
      };

      editorDOM.addEventListener("copy", prevent);
      editorDOM.addEventListener("paste", prevent);
      editorDOM.addEventListener("cut", prevent);
      editorDOM.addEventListener("contextmenu", prevent);
    }
  };

  useEffect(() => {
    if (code !== editorRef.current?.getValue()) {
      isRemoteChange.current = true;
    }
  }, [code]);

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

  const displayProblem = processedProblem || (problem as ExtendedProblem);

  if (!socket || !roomSync) {
    return (
      <div className="flex justify-center items-center h-screen text-muted-foreground">
        Connecting to room...
      </div>
    );
  }

  return (
    <>
      <ResizablePanelGroup
        direction="vertical"
        className="min-h-[calc(100vh-4rem-1px)]"
      >
        <ResizablePanel>
          <ScrollArea className="h-full">
            <div className="p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-semibold tracking-tight">
                        {isLoadingProblem ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Loading Problem...
                          </div>
                        ) : displayProblem ? (
                          displayProblem.title
                        ) : (
                          "Select a Problem"
                        )}
                      </h2>
                      <Badge variant={isConnected ? "default" : "destructive"}>
                        {isConnected ? "Connected" : "Disconnected"}
                      </Badge>
                      {displayProblem && !isLoadingProblem && (
                        <Badge
                          className={getDifficultyColor(
                            displayProblem.difficulty
                          )}
                        >
                          {displayProblem.difficulty}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Choose a LeetCode problem and solve it collaboratively
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {users.length} online
                      </span>
                    </div>

                    <Button
                      onClick={() => setShowProblemSelector(true)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Code className="h-4 w-4" />
                      {displayProblem ? "Change Problem" : "Select Problem"}
                    </Button>

                    <Select
                      value={language}
                      onValueChange={handleLanguageChange}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            <Image
                              src={
                                languageImages[
                                  language as keyof typeof languageImages
                                ] || "/placeholder.svg"
                              }
                              alt={language}
                              width={20}
                              height={20}
                              className="object-contain"
                            />
                            {languages.find((l) => l.id === language)?.name}
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.id} value={lang.id}>
                            <div className="flex items-center gap-2">
                              <Image
                                width={20}
                                height={20}
                                src={
                                  languageImages[
                                    lang.id as keyof typeof languageImages
                                  ] || "/placeholder.svg"
                                }
                                alt={lang.name}
                                className="w-5 h-5 object-contain"
                              />
                              {lang.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {users.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Active Collaborators
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {users.map((user) => (
                          <Badge
                            key={user.id}
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: user.color }}
                            />
                            {user.name}
                            {user.id === userId && " (You)"}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {displayProblem || isLoadingProblem ? (
                  <div className="relative">
                    {isLoadingProblem && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          <p className="text-sm text-muted-foreground">
                            Processing problem...
                          </p>
                        </div>
                      </div>
                    )}

                    {displayProblem && (
                      <>
                        <Card className={isLoadingProblem ? "opacity-50" : ""}>
                          <CardContent className="pt-6">
                            <div className="flex flex-wrap gap-2">
                              {displayProblem.topics?.map((topic, index) => (
                                <Badge key={index} variant="secondary">
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        <Card className={isLoadingProblem ? "opacity-50" : ""}>
                          <CardHeader className="flex flex-row items-center gap-2">
                            <BookIcon className="h-5 w-5 text-primary/80" />
                            <CardTitle>Problem Description</CardTitle>
                          </CardHeader>
                          <CardContent className="text-sm leading-relaxed">
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-lg">
                                {displayProblem.cleanedDescription ||
                                  displayProblem.description}
                              </pre>
                            </div>
                          </CardContent>
                        </Card>

                        {displayProblem.parsedExamples &&
                          displayProblem.parsedExamples.length > 0 && (
                            <Card
                              className={isLoadingProblem ? "opacity-50" : ""}
                            >
                              <CardHeader className="flex flex-row items-center gap-2">
                                <LightbulbIcon className="h-5 w-5 text-yellow-500" />
                                <CardTitle>Examples</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ScrollArea className="h-full w-full rounded-md border">
                                  <div className="p-4 space-y-4">
                                    {displayProblem.parsedExamples.map(
                                      (example, index) => (
                                        <div key={index} className="space-y-2">
                                          <p className="font-medium text-sm">
                                            Example {index + 1}:
                                          </p>
                                          <ScrollArea className="h-full w-full rounded-md">
                                            <pre className="bg-muted/50 p-3 rounded-lg text-sm font-mono">
                                              <div>Input: {example.input}</div>
                                              <div>
                                                Output: {example.output}
                                              </div>
                                              {example.explanation && (
                                                <div className="pt-2 text-muted-foreground">
                                                  Explanation:{" "}
                                                  {example.explanation}
                                                </div>
                                              )}
                                            </pre>
                                            <ScrollBar orientation="horizontal" />
                                          </ScrollArea>
                                        </div>
                                      )
                                    )}
                                  </div>
                                  <ScrollBar />
                                </ScrollArea>
                              </CardContent>
                            </Card>
                          )}

                        {displayProblem.parsedConstraints &&
                          displayProblem.parsedConstraints.length > 0 && (
                            <Card
                              className={isLoadingProblem ? "opacity-50" : ""}
                            >
                              <CardHeader className="flex flex-row items-center gap-2">
                                <AlertCircleIcon className="h-5 w-5 text-blue-500" />
                                <CardTitle>Constraints</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ul className="list-disc list-inside space-y-1.5 text-sm marker:text-muted-foreground">
                                  {displayProblem.parsedConstraints.map(
                                    (constraint, index) => (
                                      <li
                                        key={index}
                                        className="text-muted-foreground"
                                      >
                                        {constraint}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </CardContent>
                            </Card>
                          )}
                      </>
                    )}
                  </div>
                ) : (
                  // No problem selected state
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Code className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">
                        No Problem Selected
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground max-w-md">
                        Click &quot;Select Problem&quot; to choose a LeetCode
                        problem to work on.
                      </p>
                      <Button
                        onClick={() => setShowProblemSelector(true)}
                        className="mt-4"
                      >
                        Select Problem
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
            <ScrollBar />
          </ScrollArea>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={60} maxSize={100}>
          <div className="h-full relative">
            <Editor
              height={"100%"}
              defaultLanguage={language}
              language={language}
              theme="vs-dark"
              value={code}
              onChange={handleCodeChange}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 18,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                wordWrap: "on",
                wrappingIndent: "indent",
                contextmenu: false,
              }}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Problem Selector Modal */}
      <LeetCodeProblemSelector
        open={showProblemSelector}
        onOpenChange={setShowProblemSelector}
        onSelectProblem={handleProblemSelect}
      />
    </>
  );
}

export default CodeEditor;
