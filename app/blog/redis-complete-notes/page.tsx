import { redisNotesMarkup, redisNotesStyle } from "./redisNotesContent";
import { BlogLayout } from "../BlogChrome";

export const dynamic = "force-static";

export const metadata = {
  title: "Redis Complete Notes | CodeProctor",
  description: "Complete interview-ready Redis notes.",
};

const codeProctorOverrides = `
  body { display: block; padding: 0; background: #fff; }

  .redis-notes-shell {
    background: #fff;
    padding: 70px 24px 100px;
    margin: 0 auto;
    width: 100%;
    max-width: 100%;
    overflow-x: clip;
    color: #151515;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .redis-notes-shell h1,
  .redis-notes-shell h2,
  .redis-notes-shell h3,
  .redis-notes-shell p,
  .redis-notes-shell li,
  .redis-notes-shell table {
    font-family: inherit;
  }

  .redis-notes-shell h1,
  .redis-notes-shell h2,
  .redis-notes-shell h3 {
    font-weight: 700;
    letter-spacing: -0.035em;
  }

  .redis-notes-shell p,
  .redis-notes-shell li,
  .redis-notes-shell td,
  .redis-notes-shell th {
    line-height: 1.75;
  }

  .redis-notes-shell .page {
    font-family: inherit !important;
    width: min(100%, 980px);
    max-width: calc(100vw - 32px);
    margin: 0 auto 28px;
    padding: 76px 0 92px;
    background: transparent;
    border-radius: 0;
    box-shadow: none;
    transform: none;
    border-bottom: 1px solid #ececec;
    box-sizing: border-box;
  }

  .redis-notes-shell .page:first-child {
    padding-top: 20px;
  }

  .redis-notes-shell .page:last-child {
    border-bottom: 0;
  }

  .redis-notes-shell .page::before,
  .redis-notes-shell .page::after {
    display: none;
  }

  .redis-notes-shell .title-block,
  .redis-notes-shell .topic,
  .redis-notes-shell ul,
  .redis-notes-shell p,
  .redis-notes-shell .grid,
  .redis-notes-shell table {
    max-width: 820px;
    margin-left: auto;
    margin-right: auto;
  }

  .redis-notes-shell .title-block {
    padding: 0 12px;
  }

  .redis-notes-shell .title-block h1 {
    letter-spacing: -0.04em;
  }

  .redis-notes-shell .washi {
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  }

  .redis-notes-shell .divider {
    color: #8b8b8b;
  }

  @media (max-width: 480px) {
    .redis-notes-shell {
      padding: 18px 10px 36px;
    }

    .redis-notes-shell .page {
      padding: 30px 12px 36px;
      max-width: calc(100vw - 12px);
    }

    .redis-notes-shell .title-block {
      padding: 0 4px;
    }

    .redis-notes-shell ul,
    .redis-notes-shell ol {
      padding-left: 1rem;
    }
  }
`;

export default function RedisCompleteNotesPage() {
  return (
    <BlogLayout>
      <style
        dangerouslySetInnerHTML={{
          __html: redisNotesStyle + codeProctorOverrides,
        }}
      />

      <section className="redis-notes-shell" aria-label="Redis interview notes">
        <div dangerouslySetInnerHTML={{ __html: redisNotesMarkup }} />
      </section>
    </BlogLayout>
  );
}
