import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-static";

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (id !== "redis-complete-notes") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to Blog
          </Link>
          <div className="space-y-4">
            <div className="inline-flex">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                Redis
              </span>
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Redis Complete Handwritten Notes Phase 1 to 3
            </h1>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-lg font-semibold text-foreground">
            This route is intentionally static and does not depend on MongoDB.
          </p>
        </div>
      </article>
    </main>
  );
}
