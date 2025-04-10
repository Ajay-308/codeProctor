"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { languages, codingQuestions } from "@/constants";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import { ScrollArea } from "./ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AlertCircleIcon, BookIcon, LightbulbIcon } from "lucide-react";
import Image from "next/image";

export default function CodeEditor() {
  const [selectedQuestion, setSelectedQuestion] = useState(codingQuestions[0]);
  const [selectedLanguage, setSelectedLanguage] = useState<
    "javascript" | "python" | "java" | "cpp" | "csharp" | "go" | "rust"
  >(languages[0].id);
  const [code, setCode] = useState(
    selectedQuestion.starterCode[selectedLanguage]
  );
  const handleQuestion = (questionId: string) => {
    const question = codingQuestions.find((q) => q.id === questionId)!;
    if (question) {
      setSelectedQuestion(question);
      setCode(question.starterCode[selectedLanguage]);
    }
  };
  const handleLanguageChange = (
    newLanguage:
      | "javascript"
      | "python"
      | "java"
      | "cpp"
      | "csharp"
      | "go"
      | "rust"
  ) => {
    setSelectedLanguage(newLanguage);
    setCode(selectedQuestion.starterCode[newLanguage]);
  };
  return (
    <ResizablePanelGroup
      direction="vertical"
      className="min-h-[calc-100vh-4rem-1px]"
    >
      <ResizablePanel>
        <ScrollArea className="h-full">
          <div className="p-6">
            <div className="mx-w-4xl mx-auto space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">
                      {selectedQuestion.title}
                    </h1>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    choose a question and language to start coding
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedQuestion.id}
                    onValueChange={handleQuestion}
                  >
                    <SelectTrigger className="w-[180px">
                      <SelectValue placeholder="select question" />
                    </SelectTrigger>
                    <SelectContent>
                      {codingQuestions.map((question) => (
                        <SelectItem key={question.id} value={question.id}>
                          <Card className="w-full">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <BookIcon className="w-4 h-4" />
                                {question.title}
                              </CardTitle>
                            </CardHeader>
                          </Card>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedLanguage}
                    onValueChange={handleLanguageChange}
                  >
                    <SelectTrigger className="w-[180px">
                      <SelectValue placeholder="select language">
                        <div className="flex items-center gap-2">
                          <Image
                            src={`/${selectedLanguage}.png`}
                            alt={selectedLanguage}
                            className="w-5 h-5 object-contain"
                          />
                          {
                            languages.find(
                              (lang) => lang.id === selectedLanguage
                            )?.name
                          }
                        </div>
                      </SelectValue>
                    </SelectTrigger>

                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.id} value={lang.id}>
                          <div className="flex items-center gap-2">
                            <Image
                              src={`/${lang.id}.png`}
                              alt={lang.id}
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
              <Card className="w-full">
                <CardHeader className="flex flex-row items-center gap-2">
                  <BookIcon className="w-4 h-4" />
                  <CardTitle className="h-5 w-5 text-primary/80">
                    problem Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-line">
                      {selectedQuestion.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/*coding problem */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <LightbulbIcon className="w-4 h-4 text-yellow-50/80" />
                  <CardTitle>Examples</CardTitle>
                </CardHeader>
                <CardContent className="h-full w-full rounded-md border">
                  <ScrollArea className="h-full w-full rounded-md border">
                    <div className="flex flex-col gap-2 p-4">
                      {selectedQuestion.examples.map((example, index) => (
                        <div key={index} className="flex flex-col gap-2">
                          <p className="font-medium text-sm">
                            Example{index + 1}:
                          </p>
                          <ScrollArea className="h-full w-full rounded-md">
                            <pre className="bg-gray-100 p-2 rounded-md">
                              <div>Input:{example.input}</div>
                              <div>output:{example.output}</div>
                              {example.explanation && (
                                <div className="pt-2 text-muted-foreground">
                                  <span className="font-medium">
                                    Explaination:{example.explanation}
                                  </span>
                                </div>
                              )}
                            </pre>
                          </ScrollArea>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/*constraints*/}
              {selectedQuestion.constraints && (
                <Card>
                  <CardHeader className="flex flex-row items-center gap-2">
                    <AlertCircleIcon className="w-4 h-4 text-red-50/80" />
                    <CardTitle>Constraints</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside">
                      {selectedQuestion.constraints.map((constraint, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground"
                        >
                          {constraint}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </ScrollArea>
      </ResizablePanel>
      <ResizableHandle withHandle />
      {/*editor*/}
      <ResizablePanel className="border-l">
        <div className="h-full w-full">
          <Editor
            height={"100%"}
            defaultLanguage={languages as unknown as string} // Assuming languages is a string array
            language={languages as unknown as string} // Assuming languages is a string array
            theme="vs-dark"
            value={code}
            onChange={(value: string | undefined) => setCode(value || "")}
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
