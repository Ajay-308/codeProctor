import Link from 'next/link';
import { getBlogById } from '@/lib/mongodb';
import { CopyButton } from '@/components/copy-button';
import { ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { fixMathDelimiters } from '@/lib/fixMath';

interface Section {
  subtopic: string;
  sub_content: string;
  code: string | null;
}

interface Blog {
  _id: string;
  topic: string;
  blog_title: string;
  blog_kind: string;
  audience: string;
  tone: string;
  created_at: string;
  sections: Section[];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const blog = await getBlogById(id);
  if (!blog) return { title: 'Blog not found' };
  return { title: blog.blog_title, description: blog.topic };
}

export const dynamic = "force-dynamic";

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let blog: Blog | null = null;

  try {
    const result = await getBlogById(id);
    if (result) {
      blog = {
        _id: result._id.toString(),
        topic: result.topic,
        blog_title: result.blog_title,
        blog_kind: result.blog_kind,
        audience: result.audience,
        tone: result.tone,
        created_at: result.created_at,
        sections: result.sections || [],
      };
    }
  } catch (error) {
    console.error('Error fetching blog:', error);
  }

  if (!blog) notFound();

  return (
    <main className="min-h-screen bg-background">
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
      />

      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Back to Blogs
          </Link>
          <div className="space-y-4">
            <div className="inline-flex">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {blog!.blog_kind}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-foreground">{blog!.blog_title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <span>Audience: {blog!.audience}</span>
              <span>Tone: {blog!.tone}</span>
              <span>
                {new Date(blog!.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-12 rounded-lg border border-border bg-card p-6">
          <p className="text-lg font-semibold text-foreground">Topic: {blog!.topic}</p>
        </div>

        <div className="space-y-12">
          {blog!.sections.map((section, index) => (
            <section key={index} className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                {section.subtopic}
              </h2>

              <div className="max-w-none space-y-4 text-foreground/90">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[[rehypeKatex, { strict: false, trust: true }]]}
                  components={{
                    h3: ({ children }) => (
                      <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">{children}</h3>
                    ),
                    h4: ({ children }) => (
                      <h4 className="text-lg font-semibold text-foreground mt-4 mb-1">{children}</h4>
                    ),
                    p: ({ children }) => (
                      <p className="text-foreground/90 leading-7 mb-4">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-foreground">{children}</strong>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-outside ml-6 space-y-2 mb-4">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-outside ml-6 space-y-2 mb-4">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-foreground/90 leading-7">{children}</li>
                    ),
                    code: ({ children }) => (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary">
                        {children}
                      </code>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {fixMathDelimiters(section.sub_content)}
                </ReactMarkdown>
              </div>

              {section.code && (
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                  <div className="flex items-center justify-between border-b border-border px-6 py-3">
                    <p className="font-semibold text-foreground">Code Example</p>
                    <CopyButton text={section.code} />
                  </div>
                  <pre className="overflow-x-auto px-6 py-4">
                    <code className="text-sm text-muted-foreground font-mono leading-6">
                      {section.code}
                    </code>
                  </pre>
                </div>
              )}
            </section>
          ))}
        </div>

        <div className="mt-16 border-t border-border pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <ChevronLeft className="size-4" />
            Back to All Blogs
          </Link>
        </div>
      </article>
    </main>
  );
}