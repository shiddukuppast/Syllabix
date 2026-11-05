import { SourceReference } from '@/components/dashboard/types'

export interface UniquePageReference {
  label: string
  pageNum: number
  primarySource: SourceReference
  allSources: SourceReference[]
}

export interface GroupedDocumentSources {
  docName: string
  uniquePages: UniquePageReference[]
  allSources: SourceReference[]
}

/**
 * Normalizes page labels and fixes duplicated prefixes such as "Page Page 8".
 */
export function cleanPageLabel(rawPage: string | number | undefined | null): string {
  const str = String(rawPage ?? '').trim()
  if (!str || str.toLowerCase() === 'undefined' || str.toLowerCase() === 'null') {
    return 'Page 1'
  }
  // Strip duplicate "Page Page" or "page page"
  let cleaned = str.replace(/^page\s+page\s+/i, 'Page ')
  if (/^page\s+/i.test(cleaned)) {
    return cleaned.replace(/^page\s+/i, 'Page ')
  }
  if (/^slide\s+/i.test(cleaned)) {
    return cleaned.replace(/^slide\s+/i, 'Slide ')
  }
  if (/^\d+$/.test(cleaned)) {
    return `Page ${cleaned}`
  }
  if (/^\d+\s*-\s*\d+$/.test(cleaned)) {
    return `Pages ${cleaned}`
  }
  return `Page ${cleaned}`
}

/**
 * Extracts a numeric sort key from a page label (e.g. "Page 8" -> 8).
 */
export function getPageSortKey(label: string): number {
  const match = label.match(/\d+/)
  return match ? parseInt(match[0], 10) : 999999
}

/**
 * Expands comma-separated page strings (e.g. "8, 9" or "Page 8, 12") into individual clean labels.
 */
export function expandPageLabels(rawPage: string | number | undefined | null): string[] {
  const str = String(rawPage ?? '').trim()
  if (str.includes(',')) {
    return str
      .split(',')
      .map((p) => cleanPageLabel(p.trim()))
      .filter(Boolean)
  }
  return [cleanPageLabel(str)]
}

/**
 * Groups sources by document, removes duplicate pages, and sorts pages in ascending order.
 */
export function groupAndDeduplicateSources(sources: SourceReference[]): GroupedDocumentSources[] {
  const docMap: Record<string, SourceReference[]> = {}

  sources.forEach((src) => {
    const docName = src.docName?.trim() || 'Document'
    if (!docMap[docName]) {
      docMap[docName] = []
    }
    docMap[docName].push(src)
  })

  return Object.entries(docMap).map(([docName, docSources]) => {
    const pageMap: Record<string, SourceReference[]> = {}

    docSources.forEach((src) => {
      const labels = expandPageLabels(src.page)
      labels.forEach((label) => {
        if (!pageMap[label]) {
          pageMap[label] = []
        }
        pageMap[label].push(src)
      })
    })

    const uniquePages: UniquePageReference[] = Object.entries(pageMap)
      .map(([label, pageSources]) => ({
        label,
        pageNum: getPageSortKey(label),
        primarySource:
          pageSources.find((s) => s.snippet && s.snippet.trim().length > 0) ||
          pageSources[0],
        allSources: pageSources,
      }))
      .sort((a, b) => a.pageNum - b.pageNum)

    return {
      docName,
      uniquePages,
      allSources: docSources,
    }
  })
}

/**
 * Strips inline citation references (e.g. "Source: CN-UNIT1_Notes.pdf, Page 12")
 * from academic answer or note text, while extracting them into structured SourceReference objects.
 * This guarantees clean academic text presentation while preserving citation metadata internally.
 */
export function stripInlineSources(content: string): {
  cleanText: string
  extractedSources: SourceReference[]
} {
  if (!content) return { cleanText: '', extractedSources: [] }

  const extractedSources: SourceReference[] = []
  const lines = content.split('\n')
  const cleanLines: string[] = []

  // Regex for standalone source line:
  // Examples:
  // Source: doc.pdf, Page 12
  // *Source: doc.pdf, Page 12*
  // **Source: doc.pdf, Page 12**
  // (Source: doc.pdf, Page 12)
  // [Source: doc.pdf, Page 12]
  const standaloneSourceRegex = /^\s*[*_([\]]*\s*Sources?:\s*([^\n\r,()[\]*:]+?)(?:,\s*(?:Pages?|p\.|pp\.|Slide)\s*([0-9\-\,\s]+))?[*_()[\]\s]*$/i

  // Regex for inline trailing sources at the end of a line:
  // "(Source: doc.pdf, Page 12)" or "[Source: doc.pdf, Page 12]"
  const inlineTrailingBracketedRegex = /\s*[\(\[]\s*Sources?:\s*([^\n\r,()[\]*:]+?)(?:,\s*(?:Pages?|p\.|pp\.|Slide)\s*([0-9\-\,\s]+))?\s*[\)\]]\s*$/i

  // "*Source: doc.pdf, Page 12*" or "**Source: doc.pdf, Page 12**"
  const inlineTrailingFormattedRegex = /\s*[*_]{1,2}\s*Sources?:\s*([^\n\r,()[\]*:]+?)(?:,\s*(?:Pages?|p\.|pp\.|Slide)\s*([0-9\-\,\s]+))?\s*[*_]{1,2}\s*$/i

  // "Some text. Source: doc.pdf, Page 12"
  const inlineUnbracketedRegex = /\s+Sources?:\s*([^\n\r,()[\]*:]+?\.(?:pdf|docx|pptx|txt))(?:,\s*(?:Pages?|p\.|pp\.|Slide)\s*([0-9\-\,\s]+))?\s*$/i

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // 1. Check standalone source line
    const matchStandalone = line.match(standaloneSourceRegex)
    if (matchStandalone) {
      const docName = matchStandalone[1].trim()
      const rawPage = matchStandalone[2] ? matchStandalone[2].trim() : '1'
      const prevLine = cleanLines.filter((l) => l.trim().length > 0).pop() || ''
      if (docName) {
        extractedSources.push({
          docName,
          page: cleanPageLabel(rawPage),
          snippet: prevLine.trim(),
        })
      }
      continue // Omit this line completely from cleanLines
    }

    // 2. Check bracketed inline trailing source: "text... (Source: doc.pdf, Page 12)"
    const matchTrailing = line.match(inlineTrailingBracketedRegex)
    if (matchTrailing) {
      const docName = matchTrailing[1].trim()
      const rawPage = matchTrailing[2] ? matchTrailing[2].trim() : '1'
      const cleanedLine = line.replace(inlineTrailingBracketedRegex, '').trimEnd()
      if (docName) {
        extractedSources.push({
          docName,
          page: cleanPageLabel(rawPage),
          snippet: cleanedLine,
        })
      }
      cleanLines.push(cleanedLine)
      continue
    }

    // 3. Check italic/bold formatted inline trailing source: "text... *Source: doc.pdf, Page 12*"
    const matchFormatted = line.match(inlineTrailingFormattedRegex)
    if (matchFormatted) {
      const docName = matchFormatted[1].trim()
      const rawPage = matchFormatted[2] ? matchFormatted[2].trim() : '1'
      const cleanedLine = line.replace(inlineTrailingFormattedRegex, '').trimEnd()
      if (docName) {
        extractedSources.push({
          docName,
          page: cleanPageLabel(rawPage),
          snippet: cleanedLine,
        })
      }
      cleanLines.push(cleanedLine)
      continue
    }

    // 4. Check unbracketed inline trailing source with file extension: "text... Source: doc.pdf, Page 12"
    const matchUnbracketed = line.match(inlineUnbracketedRegex)
    if (matchUnbracketed) {
      const docName = matchUnbracketed[1].trim()
      const rawPage = matchUnbracketed[2] ? matchUnbracketed[2].trim() : '1'
      const cleanedLine = line.replace(inlineUnbracketedRegex, '').trimEnd()
      if (docName) {
        extractedSources.push({
          docName,
          page: cleanPageLabel(rawPage),
          snippet: cleanedLine,
        })
      }
      cleanLines.push(cleanedLine)
      continue
    }

    cleanLines.push(line)
  }

  // Remove excess blank lines
  const cleanText = cleanLines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return { cleanText, extractedSources }
}

/**
 * Combines existing API response sources with any sources parsed from legacy inline text,
 * eliminating duplicate document + page combinations.
 */
export function mergeSources(
  primarySources?: SourceReference[],
  fallbackSources?: SourceReference[]
): SourceReference[] {
  const merged: SourceReference[] = [...(primarySources || [])]
  const seen = new Set(
    merged.map((s) => `${s.docName?.toLowerCase()}:::${cleanPageLabel(s.page)}`)
  )

  if (fallbackSources) {
    fallbackSources.forEach((s) => {
      const key = `${s.docName?.toLowerCase()}:::${cleanPageLabel(s.page)}`
      if (!seen.has(key)) {
        seen.add(key)
        merged.push(s)
      }
    })
  }

  return merged
}

