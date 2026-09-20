import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/footerSection";

const blogs = [
  {
    _id: "redis-complete-notes",
    topic: "Redis, TCP, RESP, event loops, and interview-ready notes",
    blog_title: "Redis Complete Handwritten Notes — Phase 1 to 3",
    blog_kind: "Redis",
    audience: "Interview Prep",
    created_at: new Date().toISOString(),
  },
];

export const dynamic = "force-static";

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <Link
              key={blog._id}
              href="/blog/redis-complete-notes"
              className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-lg"
            >
              <div className="flex flex-col gap-4">
                <div className="inline-flex w-fit">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    {blog.blog_kind}
                  </span>
                </div>
                <div>
                  <h2 className="line-clamp-2 text-xl font-bold text-foreground group-hover:text-primary">
                    {blog.blog_title}
                  </h2>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {blog.topic}
                </p>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-xs text-muted-foreground">
                    {blog.audience}
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
