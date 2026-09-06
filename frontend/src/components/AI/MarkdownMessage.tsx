import React from 'react';

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split lines into blocks
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  const parseInline = (text: string): React.ReactNode => {
    // Regex matches bold (**bold**), inline code (`code`), italic (*italic*), and links ([text](url))
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      // Bold: **text**
      const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)/s);
      // Code: `text`
      const codeMatch = remaining.match(/^(.*?)`([^`]+)`(.*)/s);
      // Link: [text](url)
      const linkMatch = remaining.match(/^(.*?)\[([^\]]+)\]\(([^)]+)\)(.*)/s);

      // Find which comes first
      const matches = [
        boldMatch ? { type: 'bold', index: boldMatch[1].length, match: boldMatch } : null,
        codeMatch ? { type: 'code', index: codeMatch[1].length, match: codeMatch } : null,
        linkMatch ? { type: 'link', index: linkMatch[1].length, match: linkMatch } : null,
      ].filter(Boolean).sort((a, b) => (a!.index - b!.index));

      if (matches.length === 0) {
        parts.push(remaining);
        break;
      }

      const first = matches[0]!;
      if (first.type === 'bold') {
        const m = first.match;
        if (m[1]) parts.push(m[1]);
        parts.push(<strong key={`b-${keyIdx++}`} className="font-bold text-[#0B1220]">{m[2]}</strong>);
        remaining = m[3];
      } else if (first.type === 'code') {
        const m = first.match;
        if (m[1]) parts.push(m[1]);
        parts.push(
          <code key={`c-${keyIdx++}`} className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono text-[11px]">
            {m[2]}
          </code>
        );
        remaining = m[3];
      } else if (first.type === 'link') {
        const m = first.match;
        if (m[1]) parts.push(m[1]);
        parts.push(
          <a
            key={`a-${keyIdx++}`}
            href={m[3]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline font-semibold hover:text-blue-800"
          >
            {m[2]}
          </a>
        );
        remaining = m[4];
      }
    }

    return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : <>{parts}</>;
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      const headerRow = tableRows[0];
      const bodyRows = tableRows.slice(1).filter((r) => !r.every((c) => c.trim().startsWith('---') || c.trim() === ''));

      blocks.push(
        <div key={`table-${blocks.length}`} className="my-2 overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
            <thead className="bg-slate-50 font-bold text-slate-800">
              <tr>
                {headerRow.map((cell, idx) => (
                  <th key={idx} className="px-3 py-2 border-r border-slate-200 last:border-r-0">
                    {parseInline(cell.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/50">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 text-slate-700 border-r border-slate-100 last:border-r-0">
                      {parseInline(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code block toggle
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        blocks.push(
          <pre key={`code-${blocks.length}`} className="p-3 my-2 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        flushTable();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Markdown Table Detection: line contains '|'
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      // Skip separator lines like |---|---|
      if (cells.every((c) => /^[-:]+$/.test(c))) {
        continue;
      }
      tableRows.push(cells);
      inTable = true;
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Blank lines
    if (!trimmed) {
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      blocks.push(
        <h4 key={`h3-${blocks.length}`} className="font-bold text-sm text-[#0B1220] mt-3 mb-1">
          {parseInline(trimmed.slice(4))}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      blocks.push(
        <h3 key={`h2-${blocks.length}`} className="font-bold text-base text-[#0B1220] mt-3 mb-1">
          {parseInline(trimmed.slice(3))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      blocks.push(
        <h2 key={`h1-${blocks.length}`} className="font-editorial text-lg font-bold text-[#0B1220] mt-3 mb-1">
          {parseInline(trimmed.slice(2))}
        </h2>
      );
      continue;
    }

    // Bullet points
    if (/^[-*•]\s+/.test(trimmed)) {
      const bulletContent = trimmed.replace(/^[-*•]\s+/, '');
      blocks.push(
        <div key={`bullet-${blocks.length}`} className="flex items-start gap-2 my-1 text-slate-800 pl-1">
          <span className="text-[#C8A96B] font-bold text-xs mt-0.5">•</span>
          <span className="flex-1 leading-relaxed">{parseInline(bulletContent)}</span>
        </div>
      );
      continue;
    }

    // Numbered lists
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      blocks.push(
        <div key={`num-${blocks.length}`} className="flex items-start gap-2 my-1 text-slate-800 pl-1">
          <span className="text-[#C8A96B] font-bold text-xs mt-0.5 min-w-[16px]">{numMatch[1]}.</span>
          <span className="flex-1 leading-relaxed">{parseInline(numMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Regular paragraphs
    blocks.push(
      <p key={`p-${blocks.length}`} className="my-1.5 leading-relaxed text-slate-800">
        {parseInline(trimmed)}
      </p>
    );
  }

  flushTable();

  return <div className={`space-y-1 text-xs leading-relaxed ${className}`}>{blocks}</div>;
};
