// Renders a Notes or Summary field. Recognises the dated entry headers
// ("Summary 1 · 5 Sep 2026, 10:35 PM" / "Note 1 · ...") and bolds them, renders
// a "Next steps:" line in emerald, and indents bullet lines. Everything else is
// plain text. No markdown dependency; the text is stored plainly.
export default function RichNotes({ text, empty }: { text: string | null; empty?: string }) {
  const value = (text ?? "").trim();
  if (!value) {
    return <p className="text-sm text-ink-400">{empty ?? "Nothing here yet."}</p>;
  }
  const lines = value.split(/\r?\n/);
  return (
    <div className="text-sm leading-relaxed text-ink-700">
      {lines.map((line, i) => {
        if (/^(Summary|Note) \d+ ·/.test(line)) {
          return <p key={i} className="mt-4 first:mt-0 font-bold text-ink-900">{line}</p>;
        }
        if (/^next steps:/i.test(line.trim())) {
          return <p key={i} className="mt-2 font-semibold text-emerald-700">{line}</p>;
        }
        if (/^\s*•/.test(line)) {
          return <p key={i} className="pl-3">{line}</p>;
        }
        if (line.trim() === "") {
          return <div key={i} className="h-2" />;
        }
        return <p key={i} className="mt-0.5">{line}</p>;
      })}
    </div>
  );
}
