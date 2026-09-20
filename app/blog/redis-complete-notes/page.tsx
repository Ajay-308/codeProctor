import Link from "next/link";
import { redisNotesStyle, redisNotesMarkup } from "./redisNotesContent";

export const dynamic = "force-static";

export default function RedisCompleteNotesPage() {
  return (
    <main className="min-h-screen bg-[#e9e2d0]">
      <Link
        href="/blog"
        className="fixed left-4 top-4 z-20 rounded-md border border-slate-300 bg-white/95 px-3 py-2 text-sm font-medium text-slate-700 shadow-md transition hover:bg-white"
      >
        Back to Blog
      </Link>

      <style>{redisNotesStyle}</style>
      <div dangerouslySetInnerHTML={{ __html: redisNotesMarkup }} />
    </main>
  );
}
