'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyButtonProps {
  text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <button
      onClick={copyToClipboard}
      className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 active:scale-95"
      title={isCopied ? 'Copied!' : 'Copy to clipboard'}
    >
      {isCopied ? (
        <>
          <Check className="size-4" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy className="size-4" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}
