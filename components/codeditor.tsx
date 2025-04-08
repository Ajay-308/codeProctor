"use client";

import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";

interface CodeEditorProps {
  value: string;
  language?: string;
  onChange: (code: string) => void;
}

export default function CodeEditor({
  value,
  language = "javascript",
  onChange,
}: CodeEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const editor = monaco.editor.create(containerRef.current, {
      value,
      language,
      theme: "vs-dark",
      fontSize: 14,
      fontFamily: "monospace",
      minimap: { enabled: false },
      automaticLayout: true,
    });

    editorRef.current = editor;

    const model = editor.getModel();

    const changeDisposable = editor.onDidChangeModelContent(() => {
      const code = editor.getValue();
      onChange(code);
    });

    return () => {
      changeDisposable.dispose();
      model?.dispose();
      editor.dispose();
    };
  }, []);

  // Update value when it changes externally
  useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== value) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  // Update language when changed externally
  useEffect(() => {
    if (editorRef.current) {
      const oldModel = editorRef.current.getModel();
      const newModel = monaco.editor.createModel(value, language);
      editorRef.current.setModel(newModel);
      oldModel?.dispose();
    }
  }, [language]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[400px] border rounded-md overflow-hidden"
    />
  );
}
