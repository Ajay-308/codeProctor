import { codingQuestions, languages } from "@/constants";
import { useState, useEffect, useRef } from "react";
import type * as monaco from "monaco-editor";
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
import { AlertCircleIcon, BookIcon, LightbulbIcon, Users } from "lucide-react";
import Editor from "@monaco-editor/react";
import Image from "next/image";
import io, { Socket } from "socket.io-client";
import cpp from "@/app/assest/cpp.png";
import csharp from "@/app/assest/cshapr.png";
import go from "@/app/assest/go.png";
import java from "@/app/assest/java.png";
import rust from "@/app/assest/rust.png";
import javascript from "@/app/assest/Javascript.png";
import python from "@/app/assest/python.png";

const languageImages = {
  cpp,
  python,
  javascript,
  java,
  csharp,
  go,
  rust,
};

interface CollaborativeUser {
  id: string;
  name: string;
  color: string;
  cursor?: {
    line: number;
    column: number;
  };
}

interface CodeSyncData {
  code: string;
  language: string;
  questionId: string;
  userId: string;
  timestamp: number;
}

function CodeEditor({
  roomId,
  userId,
  userName,
}: {
  roomId: string;
  userId: string;
  userName: string;
}) {
  const [selectedQuestion, setSelectedQuestion] = useState(codingQuestions[0]);
  const [language, setLanguage] = useState<"javascript" | "python" | "java">(
    languages[0].id
  );
  const [code, setCode] = useState(selectedQuestion.starterCode[language]);
  const [connectedUsers, setConnectedUsers] = useState<CollaborativeUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const isRemoteChange = useRef(false);

  useEffect(() => {
    socketRef.current = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "ws://localhost:3001",
      {
        transports: ["websocket"],
      }
    );

    const socket = socketRef.current;

    // Join the room
    socket.emit("join-room", {
      roomId,
      userId,
      userName,
    });

    // Socket event listeners
    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to collaboration server");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from collaboration server");
    });

    socket.on("user-joined", (users: CollaborativeUser[]) => {
      setConnectedUsers(users);
    });

    socket.on("user-left", (users: CollaborativeUser[]) => {
      setConnectedUsers(users);
    });

    socket.on("code-change", (data: CodeSyncData) => {
      if (data.userId !== userId) {
        isRemoteChange.current = true;
        setCode(data.code);

        // Update question and language if they changed
        if (data.questionId !== selectedQuestion.id) {
          const question = codingQuestions.find(
            (q) => q.id === data.questionId
          )!;
          setSelectedQuestion(question);
        }

        if (data.language !== language) {
          setLanguage(data.language as "javascript" | "python" | "java");
        }
      }
    });

    socket.on(
      "question-change",
      (data: { questionId: string; userId: string }) => {
        if (data.userId !== userId) {
          const question = codingQuestions.find(
            (q) => q.id === data.questionId
          )!;
          setSelectedQuestion(question);
          setCode(question.starterCode[language]);
        }
      }
    );

    socket.on(
      "language-change",
      (data: { language: string; userId: string }) => {
        if (data.userId !== userId) {
          setLanguage(data.language as "javascript" | "python" | "java");
          setCode(
            selectedQuestion.starterCode[
              data.language as "javascript" | "python" | "java"
            ]
          );
        }
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [
    roomId,
    userId,
    userName,
    language,
    selectedQuestion.id,
    selectedQuestion.starterCode,
  ]);

  // Handle code changes
  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || "";
    setCode(newCode);

    // Don't emit if this is a remote change
    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }

    // Emit code change to other users
    if (socketRef.current && isConnected) {
      socketRef.current.emit("code-change", {
        roomId,
        code: newCode,
        language,
        questionId: selectedQuestion.id,
        userId,
        timestamp: Date.now(),
      });
    }
  };

  const handleQuestionChange = (questionId: string) => {
    const question = codingQuestions.find((q) => q.id === questionId)!;
    setSelectedQuestion(question);
    setCode(question.starterCode[language]);

    // Emit question change to other users
    if (socketRef.current && isConnected) {
      socketRef.current.emit("question-change", {
        roomId,
        questionId,
        userId,
      });
    }
  };

  const handleLanguageChange = (
    newLanguage: "javascript" | "python" | "java"
  ) => {
    setLanguage(newLanguage);
    const newCode = selectedQuestion.starterCode[newLanguage];
    setCode(newCode);

    // Emit language change to other users
    if (socketRef.current && isConnected) {
      socketRef.current.emit("language-change", {
        roomId,
        language: newLanguage,
        userId,
      });
    }
  };

  // Handle editor mounting

  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor
  ) => {
    editorRef.current = editor;
  };

  return (
    <ResizablePanelGroup
      direction="vertical"
      className="min-h-[calc-100vh-4rem-1px]"
    >
      {/* QUESTION SECTION */}
      <ResizablePanel>
        <ScrollArea className="h-full">
          <div className="p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-semibold tracking-tight">
                      {selectedQuestion.title}
                    </h2>
                    {/* Connection Status */}
                    <Badge variant={isConnected ? "default" : "destructive"}>
                      {isConnected ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Choose your language and solve the problem collaboratively
                  </p>
                </div>

                {/* Collaboration Info */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {connectedUsers.length} online
                    </span>
                  </div>

                  <Select
                    value={selectedQuestion.id}
                    onValueChange={handleQuestionChange}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select question" />
                    </SelectTrigger>
                    <SelectContent>
                      {codingQuestions.map((q) => (
                        <SelectItem key={q.id} value={q.id}>
                          {q.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <Image
                            src={languageImages[language]}
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
                              src={`/${lang.id}.png`}
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

              {/* Active Users */}
              {connectedUsers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Active Collaborators
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {connectedUsers.map((user) => (
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

              {/* PROBLEM DESC. */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <BookIcon className="h-5 w-5 text-primary/80" />
                  <CardTitle>Problem Description</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-line">
                      {selectedQuestion.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* PROBLEM EXAMPLES */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <LightbulbIcon className="h-5 w-5 text-yellow-500" />
                  <CardTitle>Examples</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-full w-full rounded-md border">
                    <div className="p-4 space-y-4">
                      {selectedQuestion.examples.map((example, index) => (
                        <div key={index} className="space-y-2">
                          <p className="font-medium text-sm">
                            Example {index + 1}:
                          </p>
                          <ScrollArea className="h-full w-full rounded-md">
                            <pre className="bg-muted/50 p-3 rounded-lg text-sm font-mono">
                              <div>Input: {example.input}</div>
                              <div>Output: {example.output}</div>
                              {example.explanation && (
                                <div className="pt-2 text-muted-foreground">
                                  Explanation: {example.explanation}
                                </div>
                              )}
                            </pre>
                            <ScrollBar orientation="horizontal" />
                          </ScrollArea>
                        </div>
                      ))}
                    </div>
                    <ScrollBar />
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* CONSTRAINTS */}
              {selectedQuestion.constraints && (
                <Card>
                  <CardHeader className="flex flex-row items-center gap-2">
                    <AlertCircleIcon className="h-5 w-5 text-blue-500" />
                    <CardTitle>Constraints</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1.5 text-sm marker:text-muted-foreground">
                      {selectedQuestion.constraints.map((constraint, index) => (
                        <li key={index} className="text-muted-foreground">
                          {constraint}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          <ScrollBar />
        </ScrollArea>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* CODE EDITOR */}
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
            }}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default CodeEditor;
