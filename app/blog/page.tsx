import Link from 'next/link';
import { getAllBlogs } from '@/lib/mongodb';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/footerSection';

interface Blog {
  _id: string;
  topic: string;
  blog_title: string;
  blog_kind: string;
  audience: string;
  created_at: string;
}

export default async function BlogPage() {
  let blogs: Blog[] = [];

  try {
    const result = await getAllBlogs();
    blogs = result.map((blog: any) => ({
      _id: blog._id.toString(),
      topic: blog.topic,
      blog_title: blog.blog_title,
      blog_kind: blog.blog_kind,
      audience: blog.audience,
      created_at: blog.created_at,
    }));
  } catch (error) {
    console.error('Error fetching blogs:', error);
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Blog Grid */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        {blogs.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">No blogs available yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <Link
                key={blog._id}
                href={`/blog/${blog._id}`}
                className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-lg"
              >
                <div className="flex flex-col gap-4">
                  {/* Badge */}
                  <div className="inline-flex w-fit">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                      {blog.blog_kind}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <h2 className="line-clamp-2 text-xl font-bold text-foreground group-hover:text-primary">
                      {blog.blog_title}
                    </h2>
                  </div>

                  {/* Topic */}
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {blog.topic}
                  </p>

                  {/* Footer */}
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
        )}
      </section>

      <FooterSection />
    </main>
  );
}