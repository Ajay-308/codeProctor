import Link from "next/link";
import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-static";

export default async function RedisCompleteNotesPage() {
  let notesBody = "<div>Unable to load Redis notes.</div>";
  let notesStyles = "";

  try {
    const notesPath = path.join(process.cwd(), "public", "redis-notes", "index.html");
    const notesHtml = await fs.readFile(notesPath, "utf8");

    const styleMatches = [...notesHtml.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
    notesStyles = styleMatches.map((match) => match[1]).join("\n");

    const bodyMatch = notesHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    notesBody = bodyMatch ? bodyMatch[1] : notesHtml;
  } catch (error) {
    console.error("Redis notes file could not be loaded:", error);
  }

  return (
    <main className="fixed inset-0 overflow-auto bg-[#e9e2d0]">
      <Link
        href="/blog"
        className="fixed left-4 top-4 z-20 rounded-md border border-slate-300 bg-white/95 px-3 py-2 text-sm font-medium text-slate-700 shadow-md transition hover:bg-white"
      >
        Back to Blog
      </Link>

      <style>{notesStyles}</style>

      <div
        className="redis-notes-root"
        dangerouslySetInnerHTML={{ __html: notesBody }}
      />
    </main>
  );
}
