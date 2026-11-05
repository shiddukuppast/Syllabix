'use client'

import React, { useState } from 'react'
import { Copy, Check, FileText } from 'lucide-react'

interface FormattedMessageProps {
  content: string
  variant?: 'default' | 'insights'
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
  | { type: 'hr' }
  | { type: 'paragraph'; text: string }
  | { type: 'space' }

export function FormattedMessage({
  content,
  variant = 'default',
}: FormattedMessageProps) {
  const blocks = parseMarkdownBlocks(content)
  const isInsights = variant === 'insights'

  return (
    <div
      className={`leading-relaxed ${
        isInsights
          ? 'space-y-2.5 text-[#473e65]'
          : 'space-y-3.5 text-[#342d4d]'
      }`}
    >
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'h1':
            return (
              <h1
                key={idx}
                className="mt-4 mb-2 text-lg sm:text-xl font-bold tracking-tight text-[#221c38] first:mt-0"
              >
                {block.text}
              </h1>
            )

          case 'h2':
            return (
              <h2
                key={idx}
                className="mt-4 mb-1.5 text-base sm:text-lg font-bold tracking-tight text-[#2b2447] first:mt-0"
              >
                {block.text}
              </h2>
            )

          case 'h3':
            return (
              <h3
                key={idx}
                className="mt-3.5 mb-1 text-sm sm:text-base font-bold text-[#382f5b] first:mt-0"
              >
                {block.text}
              </h3>
            )

          case 'h4':
            return (
              <h4
                key={idx}
                className="mt-2.5 mb-0.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#635887]"
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
                isInsights={isInsights}
              />
            )

          case 'quote':
            return (
              <blockquote
                key={idx}
                className={`my-3 rounded-r-xl border-l-4 px-4 py-2.5 text-xs sm:text-sm italic leading-relaxed ${
                  isInsights
                    ? 'border-[#8e7ae8] bg-[#f4effc] text-[#483d6e]'
                    : 'border-[#7763d9] bg-[#f8f6fd] text-[#4a4267]'
                }`}
                dangerouslySetInnerHTML={{
                  __html: formatInlineMarkdown(block.text, isInsights),
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
                        __html: formatInlineMarkdown(item.text, isInsights),
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
                    <span
                      className={`mt-2 size-1.5 shrink-0 rounded-full ${
                        isInsights ? 'bg-[#8c79e6]' : 'bg-[#7763d9]'
                      }`}
                    />
                    <div
                      className="flex-1"
                      dangerouslySetInnerHTML={{
                        __html: formatInlineMarkdown(item, isInsights),
                      }}
                    />
                  </li>
                ))}
              </ul>
            )

          case 'hr':
            return <hr key={idx} className="my-4 border-[#eee7f9]" />

          case 'source_note':
            // Suppress inline rendering of source citations; sources are displayed on-demand
            return null

          case 'space':
            return <div key={idx} className="h-1.5" />

          case 'paragraph':
          default:
            return (
              <p
                key={idx}
                className={`text-xs sm:text-sm leading-relaxed ${
                  isInsights ? 'text-[#473e65]' : 'text-[#342d4d]'
                }`}
                dangerouslySetInnerHTML={{
                  __html: formatInlineMarkdown(block.text, isInsights),
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
  isInsights = false,
}: {
  headers: string[]
  rows: string[][]
  isInsights?: boolean
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
                dangerouslySetInnerHTML={{
                  __html: formatInlineMarkdown(h, isInsights),
                }}
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
                  dangerouslySetInnerHTML={{
                    __html: formatInlineMarkdown(cell, isInsights),
                  }}
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
  if (!text) return []

  const lines = text.split('\n')
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const rawLine = lines[i]
    const trimmed = rawLine.trim()

    // 1. Fenced Code Block: ```lang ... ```
    if (trimmed.startsWith('```')) {
      const language = trimmed.replace(/^```\s*/, '').trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      if (i < lines.length) {
        i++ // Skip closing ```
      }
      blocks.push({
        type: 'code',
        language,
        code: codeLines.join('\n'),
      })
      continue
    }

    // 2. Table Block: consecutive lines starting and ending with |
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && lines.length > i + 1) {
      const tableLines: string[] = []
      while (
        i < lines.length &&
        lines[i].trim().startsWith('|') &&
        lines[i].trim().endsWith('|')
      ) {
        tableLines.push(lines[i].trim())
        i++
      }
      const parsedTable = parseTableLines(tableLines)
      if (parsedTable) {
        blocks.push(parsedTable)
        continue
      }
    }

    // 3. Horizontal Rule: ---, ***, ___
    if (/^(---|___|\*\*\*)$/.test(trimmed)) {
      blocks.push({ type: 'hr' })
      i++
      continue
    }

    // 4. Headings: #, ##, ###, ####
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const headingText = headingMatch[2].trim()
      if (level === 1) blocks.push({ type: 'h1', text: headingText })
      else if (level === 2) blocks.push({ type: 'h2', text: headingText })
      else if (level === 3) blocks.push({ type: 'h3', text: headingText })
      else blocks.push({ type: 'h4', text: headingText })
      i++
      continue
    }

    // 5. Blockquotes: > ...
    if (trimmed.startsWith('> ') || trimmed === '>') {
      const quoteLines: string[] = []
      while (
        i < lines.length &&
        (lines[i].trim().startsWith('>') ||
          (lines[i].trim() &&
            quoteLines.length > 0 &&
            !lines[i].trim().startsWith('#') &&
            !lines[i].trim().startsWith('```')))
      ) {
        if (lines[i].trim().startsWith('>')) {
          quoteLines.push(lines[i].trim().replace(/^>\s*/, ''))
        } else {
          quoteLines.push(lines[i].trim())
        }
        i++
      }
      blocks.push({ type: 'quote', text: quoteLines.join(' ') })
      continue
    }

    // 6. Ordered List: 1. or 1)
    if (/^\d+[\.\)]\s/.test(trimmed)) {
      const listItems: { num: string; text: string }[] = []
      while (i < lines.length && /^\d+[\.\)]\s/.test(lines[i].trim())) {
        const itemLine = lines[i].trim()
        const match = itemLine.match(/^(\d+)[\.\)]\s*(.*)$/)
        const num = match ? match[1] : '1'
        let itemText = match ? match[2] : itemLine
        i++

        // Handle continuation lines for this item
        while (
          i < lines.length &&
          lines[i].trim() &&
          !/^\d+[\.\)]\s/.test(lines[i].trim()) &&
          !/^[\*\-\+\•]\s/.test(lines[i].trim()) &&
          !lines[i].trim().startsWith('#') &&
          !lines[i].trim().startsWith('```') &&
          !lines[i].trim().startsWith('|')
        ) {
          itemText += ' ' + lines[i].trim()
          i++
        }

        listItems.push({ num, text: itemText })
      }
      blocks.push({ type: 'ordered_list', items: listItems })
      continue
    }

    // 7. Unordered List: *, -, +, •
    if (/^[\*\-\+\•]\s/.test(trimmed)) {
      const listItems: string[] = []
      while (i < lines.length && /^[\*\-\+\•]\s/.test(lines[i].trim())) {
        const itemLine = lines[i].trim()
        let itemText = itemLine.replace(/^[\*\-\+\•]\s*/, '')
        i++

        // Handle continuation lines for this item
        while (
          i < lines.length &&
          lines[i].trim() &&
          !/^[\*\-\+\•]\s/.test(lines[i].trim()) &&
          !/^\d+[\.\)]\s/.test(lines[i].trim()) &&
          !lines[i].trim().startsWith('#') &&
          !lines[i].trim().startsWith('```') &&
          !lines[i].trim().startsWith('|')
        ) {
          itemText += ' ' + lines[i].trim()
          i++
        }

        listItems.push(itemText)
      }
      blocks.push({ type: 'unordered_list', items: listItems })
      continue
    }

    // 8. Source Note line: Source: ... (handled on-demand via View Sources button)
    if (/^\s*[*_([\]]*\s*Sources?:\s*/i.test(trimmed)) {
      blocks.push({ type: 'source_note', text: trimmed })
      i++
      continue
    }

    // 9. Empty line
    if (!trimmed) {
      blocks.push({ type: 'space' })
      i++
      continue
    }

    // 10. Standard Paragraph (collect consecutive lines that form a paragraph)
    const paraLines: string[] = [rawLine.trim()]
    i++
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('|') &&
      !/^(#{1,4})\s+/.test(lines[i].trim()) &&
      !/^(---|___|\*\*\*)$/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith('>') &&
      !/^\d+[\.\)]\s/.test(lines[i].trim()) &&
      !/^[\*\-\+\•]\s/.test(lines[i].trim()) &&
      !/^Source:\s+/i.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim())
      i++
    }
    blocks.push({ type: 'paragraph', text: paraLines.join(' ') })
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
    if (/^\|?\s*[-:]+[-| :]*\|?$/.test(row) || row.includes('---')) continue
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatInlineMarkdown(text: string, isInsights = false): string {
  if (!text) return ''

  let formatted = escapeHtml(text)

  // 1. Protect inline code: `code`
  const codePlaceholders: string[] = []
  formatted = formatted.replace(/`([^`]+)`/g, (_, codeContent) => {
    const idx = codePlaceholders.length
    codePlaceholders.push(
      `<code class="rounded-md bg-[#eee9ff] px-1.5 py-0.5 font-mono text-xs font-semibold text-[#6853cc]">${codeContent}</code>`
    )
    return `@@CODE_TOKEN_${idx}@@`
  })

  // 2. Protect inline math: $formula$
  const mathPlaceholders: string[] = []
  formatted = formatted.replace(/\$([^$]+)\$/g, (_, mathContent) => {
    const idx = mathPlaceholders.length
    mathPlaceholders.push(
      `<span class="inline-flex items-center rounded-md border border-[#e5dcfa] bg-[#f4effe] px-1.5 py-0.5 font-mono text-xs font-semibold text-[#5e4cb8]">${mathContent}</span>`
    )
    return `@@MATH_TOKEN_${idx}@@`
  })

  // 3. Academic Term / Key concept with colon:
  // Case A: **Term:** (colon inside asterisks)
  // Case B: **Term**: (colon outside asterisks)
  const termHighlightClass = isInsights
    ? 'font-bold text-[#1e1737] bg-[#ede8fc] text-[#5540b0] px-1.5 py-0.5 rounded-md border border-[#ded5f5] text-xs sm:text-[13px] mr-1'
    : 'font-bold text-[#1f1837] bg-[#f4effe] text-[#634ec2] px-1.5 py-0.5 rounded-md border border-[#e8dff8] text-xs sm:text-[13px] mr-1'

  formatted = formatted.replace(
    /\*\*([^*]+?):\*\*/g,
    `<strong class="${termHighlightClass}">$1:</strong>`
  )
  formatted = formatted.replace(
    /\*\*([^*]+?)\*\*:/g,
    `<strong class="${termHighlightClass}">$1:</strong>`
  )

  // 4. Triple asterisks (bold + italic): ***text***
  formatted = formatted.replace(
    /\*\*\*([^*]+?)\*\*\*/g,
    '<strong class="font-bold text-[#1f1938]"><em class="italic text-[#463f63]">$1</em></strong>'
  )

  // 5. Standard Bold: **text** or __text__
  formatted = formatted.replace(
    /\*\*([^*]+?)\*\*/g,
    '<strong class="font-bold text-[#1f1938]">$1</strong>'
  )
  formatted = formatted.replace(
    /__([^_]+?)__/g,
    '<strong class="font-bold text-[#1f1938]">$1</strong>'
  )

  // 6. Standard Italic: *text* or _text_
  formatted = formatted.replace(
    /\*([^*]+?)\*/g,
    '<em class="italic text-[#463f63]">$1</em>'
  )
  formatted = formatted.replace(
    /(?:^|\s)_([^_]+?)_(?:$|\s)/g,
    ' <em class="italic text-[#463f63]">$1</em> '
  )

  // 7. Markdown Links: [label](url)
  formatted = formatted.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#7763d9] underline underline-offset-2 hover:text-[#5e4cb8] transition-colors">$1</a>'
  )

  // 8. Restore protected tokens
  formatted = formatted.replace(
    /@@CODE_TOKEN_(\d+)@@/g,
    (_, idx) => codePlaceholders[Number(idx)]
  )
  formatted = formatted.replace(
    /@@MATH_TOKEN_(\d+)@@/g,
    (_, idx) => mathPlaceholders[Number(idx)]
  )

  return formatted
}
