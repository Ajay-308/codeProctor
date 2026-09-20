import Link from "next/link";

export const dynamic = "force-static";

export default function RedisCompleteNotesPage() {
  return (
    <main className="fixed inset-0 overflow-hidden bg-[#e9e2d0]">
      <Link
        href="/blog"
        className="fixed left-4 top-4 z-20 rounded-md border border-slate-300 bg-white/95 px-3 py-2 text-sm font-medium text-slate-700 shadow-md transition hover:bg-white"
      >
        Back to Blog
      </Link>

      <iframe
        title="Redis Complete Notes"
        src="/redis-notes/index.html"
        className="h-screen w-screen border-0"
        style={{ display: "block" }}
      />
    </main>
  );
}
