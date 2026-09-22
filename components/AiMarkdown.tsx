import { Fragment } from "react";

// Lightweight, safe renderer for the assistant's markdown-ish output. Handles
// the subset the model actually produces: headings (# / ## / bold-only lines),
// bullet lists (-, *, •), numbered lists, and inline **bold**. No HTML is ever
// injected, everything is built as React nodes, so it is safe against markup in
// the model output. Reused by the exhibition summary and the chat panel.

function renderInline(text: string, keyBase: string) {
  // Split on **bold** spans and render those as <strong>.
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyBase}-b-${i}`} className="font-semibold text-ink-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={`${keyBase}-t-${i}`}>{part}</Fragment>;
  });
}

type Block =
  | { kind: "heading"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "p"; text: string };

function parse(md: string): Block[] {
  const lines = md.replace(/\r/g, "").split("\n");
  const blocks: Block[] = [];
  let list: { kind: "ul" | "ol"; items: string[] } | null = null;

  const flush = () => {
    if (list) {
      blocks.push({ kind: list.kind, items: list.items });
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    // Heading: markdown # ... or a line that is entirely **bold**.
    const hHash = line.match(/^#{1,4}\s+(.*)$/);
    const hBold = line.match(/^\*\*(.+)\*\*:?$/);
    if (hHash || hBold) {
      flush();
      blocks.push({ kind: "heading", text: (hHash?.[1] ?? hBold?.[1] ?? "").trim() });
      continue;
    }
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    if (bullet) {
      if (!list || list.kind !== "ul") {
        flush();
        list = { kind: "ul", items: [] };
      }
      list.items.push(bullet[1]);
      continue;
    }
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    if (numbered) {
      if (!list || list.kind !== "ol") {
        flush();
        list = { kind: "ol", items: [] };
      }
      list.items.push(numbered[1]);
      continue;
    }
    flush();
    blocks.push({ kind: "p", text: line });
  }
  flush();
  return blocks;
}

export default function AiMarkdown({ text, className = "" }: { text: string; className?: string }) {
  const blocks = parse(text);
  return (
    <div className={`space-y-2.5 ${className}`}>
      {blocks.map((b, i) => {
        if (b.kind === "heading") {
          return (
            <p key={i} className="pt-1 text-sm font-bold text-emerald-700">
              {renderInline(b.text, `h-${i}`)}
            </p>
          );
        }
        if (b.kind === "ul") {
          return (
            <ul key={i} className="space-y-1.5">
              {b.items.map((it, j) => (
                <li key={j} className="flex gap-2 text-sm text-ink-700">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                  <span>{renderInline(it, `ul-${i}-${j}`)}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (b.kind === "ol") {
          return (
            <ol key={i} className="space-y-1.5">
              {b.items.map((it, j) => (
                <li key={j} className="flex gap-2 text-sm text-ink-700">
                  <span className="shrink-0 font-semibold text-emerald-600 tabular-nums">{j + 1}.</span>
                  <span>{renderInline(it, `ol-${i}-${j}`)}</span>
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={i} className="text-sm leading-relaxed text-ink-700">
            {renderInline(b.text, `p-${i}`)}
          </p>
        );
      })}
    </div>
  );
}
