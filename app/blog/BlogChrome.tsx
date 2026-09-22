import Link from "next/link";
import type { ReactNode } from "react";
import { Code, Menu, X, Bell, Settings } from "lucide-react";
import FooterSection from "@/components/footerSection";

export function BlogLayout({
  children,
  backHref = "/blog",
  title,
  eyebrow,
}: {
  children: ReactNode;
  backHref?: string;
  title?: string;
  eyebrow?: string;
}) {
  return (
    <>
      <div className="flex items-center gap-2 border-gray-200 bg-white mt-[1rem] ml-4 z-50">
        <Link href="/" className="flex items-center gap-2">
          <Code className="h-6 w-6 text-black" />
          <span className="text-xl font-bold">CodeProctor</span>
        </Link>
      </div>

      <div className="w-full border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            <span aria-hidden="true">←</span>
            Back to Blog
          </Link>
        </div>
      </div>

      {title || eyebrow ? (
        <header className="w-full border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            {eyebrow ? (
              <div className="mb-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                {eyebrow}
              </div>
            ) : null}
            {title ? (
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {title}
              </h1>
            ) : null}
          </div>
        </header>
      ) : null}

      <div className="w-full">{children}</div>

      <FooterSection />
    </>
  );
}
