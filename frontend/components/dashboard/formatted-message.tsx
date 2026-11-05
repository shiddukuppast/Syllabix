'use client'

import React, { useState } from 'react'
import { Copy, Check, FileText } from 'lucide-react'

interface FormattedMessageProps {
  content: string
}

type Block =
  | { type: 'h1'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'h4'; text: string }
  | { type: 'code'; code: string; language: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'quote'; text: string }
  | { type: 'ordered_list'; items: { num: string; text: string }[] }
  | { type: 'unordered_list'; items: string[] }
  | { type: 'source_note'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'space' }

export function FormattedMessage({ content }: FormattedMessageProps) {
  const blocks = parseMarkdownBlocks(content)

  return (
    <div className="space-y-3.5 leading-relaxed text-[#362f50]">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'h1':
            return (
              <h1
                key={idx}
                className="mt-4 mb-2 text-lg sm:text-xl font-bold tracking-tight text-[#282344] first:mt-0"
              >
                {block.text}
              </h1>
            )

          case 'h2':
            return (
              <h2
                key={idx}
                className="mt-4 mb-1.5 text-base sm:text-lg font-bold tracking-tight text-[#2d274c] first:mt-0"
              >
                {block.text}
              </h2>
            )

          case 'h3':
            return (
              <h3
                key={idx}
                className="mt-3.5 mb-1 text-sm sm:text-base font-bold text-[#3d365d] first:mt-0"
              >
                {block.text}
              </h3>
            )

          case 'h4':
            return (
              <h4
                key={idx}
                className="mt-2.5 mb-0.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#635a82]"
              >
                {block.text}
              </h4>
            )

          case 'code':
            return (
              <CodeBlock
                key={idx}
                code={block.code}
                language={block.language}
              />
            )

          case 'table':
            return (
              <TableBlock
                key={idx}
                headers={block.headers}
                rows={block.rows}
              />
            )

          case 'quote':
            return (
              <blockquote
                key={idx}
                className="my-3 rounded-r-xl border-l-4 border-[#7763d9] bg-[#f8f6fd] px-4 py-2.5 text-xs sm:text-sm italic text-[#4a4267] leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: formatInlineMarkdown(block.text),
                }}
              />
            )

          case 'ordered_list':
            return (
              <ol key={idx} className="my-2.5 space-y-2 pl-0.5">
                {block.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#f1edfe] text-[11px] font-bold text-[#7763d9] mt-0.5 shadow-2xs">
                      {item.num}
                    </span>
                    <div
                      className="flex-1"
                      dangerouslySetInnerHTML={{
                        __html: formatInlineMarkdown(item.text),
                      }}
                    />
                  </li>
                ))}
              </ol>
            )

          case 'unordered_list':
            return (
              <ul key={idx} className="my-2.5 space-y-2 pl-0.5">
                {block.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed"
                  >
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#7763d9]" />
                    <div
                      className="flex-1"
                      dangerouslySetInnerHTML={{
                        __html: formatInlineMarkdown(item),
                      }}
                    />
                  </li>
                ))}
              </ul>
            )

          case 'source_note':
            return (
              <div
                key={idx}
                className="my-2 inline-flex items-center gap-1.5 rounded-lg border border-[#e5dcfa] bg-[#faf8fe] px-2.5 py-1 text-[11px] font-semibold text-[#6853cc]"
              >
                <FileText className="size-3 text-[#7763d9]" />
                <span>{block.text}</span>
              </div>
            )

          case 'space':
            return <div key={idx} className="h-1" />

          case 'paragraph':
          default:
            return (
              <p
                key={idx}
                className="text-xs sm:text-sm leading-relaxed text-[#362f50]"
                dangerouslySetInnerHTML={{
                  __html: formatInlineMarkdown(block.text),
                }}
              />
            )
        }
      })}
    </div>
  )
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="my-3.5 overflow-hidden rounded-xl border border-[#352d54] bg-[#1e1933] shadow-sm">
      <div className="flex items-center justify-between border-b border-[#2e264a] bg-[#171329] px-4 py-2 text-xs text-[#a59bc8]">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#b7a8ee]">
          {language || 'CODE'}
        </span>
        <button
          onClick={handleCopyCode}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold text-[#d4ccf5] transition hover:bg-[#2e264a] hover:text-white"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-[#3ec995]" />
              <span className="text-[#3ec995]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-[#ede8ff]">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function TableBlock({
  headers,
  rows,
}: {
  headers: string[]
  rows: string[][]
}) {
  return (
    <div className="my-3.5 overflow-x-auto rounded-xl border border-[#ebe5f7] bg-white shadow-2xs">
      <table className="w-full min-w-[360px] text-left text-xs border-collapse">
        <thead className="bg-[#f7f4fc] border-b border-[#ebe5f7] text-[#282344]">
          <tr>
            {headers.map((h, idx) => (
              <th
                key={idx}
                className="px-4 py-2.5 font-bold text-[#302752] tracking-wide"
                dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(h) }}
              />
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f2edf9]">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="transition-colors hover:bg-[#faf8fe]">
              {row.map((cell, cIdx) => (
                <td
                  key={cIdx}
                  className={`px-4 py-2.5 leading-relaxed ${
                    cIdx === 0
                      ? 'font-semibold text-[#282344]'
                      : 'text-[#484065]'
                  }`}
                  dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cell) }}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function parseMarkdownBlocks(text: string): Block[] {
  const lines = text.split('\n')
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const rawLine = lines[i]
    const trimmed = rawLine.trim()

    // 1. Fenced Code Block: ```lang ... ```
    if (trimmed.startsWith('```')) {
      const language = trimmed.replace('```', '').trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // Skip closing ```
      blocks.push({
        type: 'code',
        language,
        code: codeLines.join('\n'),
      })
      continue
    }

    // 2. Table Block: consecutive lines starting and ending with |
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim())
        i++
      }
      const parsedTable = parseTableLines(tableLines)
      if (parsedTable) {
        blocks.push(parsedTable)
      }
      continue
    }

    // 3. Headings
    if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'h1', text: trimmed.replace('# ', '') })
      i++
      continue
    }
    if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'h2', text: trimmed.replace('## ', '') })
      i++
      continue
    }
    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', text: trimmed.replace('### ', '') })
      i++
      continue
    }
    if (trimmed.startsWith('#### ')) {
      blocks.push({ type: 'h4', text: trimmed.replace('#### ', '') })
      i++
      continue
    }

    // 4. Blockquotes
    if (trimmed.startsWith('> ')) {
      blocks.push({ type: 'quote', text: trimmed.replace(/^>\s*/, '') })
      i++
      continue
    }

    // 5. Ordered List: 1. 2. 3.
    if (/^\d+\.\s/.test(trimmed)) {
      const listItems: { num: string; text: string }[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        const itemLine = lines[i].trim()
        const numMatch = itemLine.match(/^(\d+)\./)
        const num = numMatch ? numMatch[1] : '1'
        const itemText = itemLine.replace(/^\d+\.\s*/, '')
        listItems.push({ num, text: itemText })
        i++
      }
      blocks.push({ type: 'ordered_list', items: listItems })
      continue
    }

    // 6. Unordered List: * or -
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const listItems: string[] = []
      while (
        i < lines.length &&
        (lines[i].trim().startsWith('* ') || lines[i].trim().startsWith('- '))
      ) {
        listItems.push(lines[i].trim().substring(2))
        i++
      }
      blocks.push({ type: 'unordered_list', items: listItems })
      continue
    }

    // 7. Source Note line: Source: ...
    if (/^Source:\s+/i.test(trimmed)) {
      blocks.push({ type: 'source_note', text: trimmed })
      i++
      continue
    }

    // 8. Empty line
    if (!trimmed) {
      blocks.push({ type: 'space' })
      i++
      continue
    }

    // 9. Standard Paragraph
    blocks.push({ type: 'paragraph', text: rawLine })
    i++
  }

  return blocks
}

function parseTableLines(
  lines: string[]
): { type: 'table'; headers: string[]; rows: string[][] } | null {
  if (lines.length < 2) return null

  const parseCells = (line: string): string[] => {
    return line
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim())
  }

  const rawHeaders = parseCells(lines[0])
  const dataRows: string[][] = []

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i]
    if (row.includes('---')) continue // Skip markdown divider
    const cells = parseCells(row)
    if (cells.length > 0) {
      dataRows.push(cells)
    }
  }

  return {
    type: 'table',
    headers: rawHeaders,
    rows: dataRows,
  }
}

function formatInlineMarkdown(text: string): string {
  return text
    // Bold with colon or key academic term: **Term:**
    .replace(
      /\*\*(.*?):\*\*/g,
      '<strong class="font-bold text-[#201b38] bg-[#f8f5fd] px-1 py-0.5 rounded">$1:</strong>'
    )
    // Standard bold: **text**
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#201b38]">$1</strong>')
    // Italic: *text*
    .replace(/\*(.*?)\*/g, '<em class="italic text-[#463f63]">$1</em>')
    // Inline code: `code`
    .replace(
      /`(.*?)`/g,
      '<code class="rounded-md bg-[#eee9ff] px-1.5 py-0.5 font-mono text-xs font-semibold text-[#6853cc]">$1</code>'
    )
    // Math formulas: $math$
    .replace(
      /\$(.*?)\$/g,
      '<span class="inline-flex items-center rounded-md border border-[#e5dcfa] bg-[#f4effe] px-1.5 py-0.5 font-mono text-xs font-semibold text-[#5e4cb8]">$1</span>'
    )
}

