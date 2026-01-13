import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { glob } from 'glob'

const codeLanguages = new Set(['ts', 'tsx', 'typescript', 'js', 'jsx', 'javascript'])

const ignoredGlobs = [
  '**/node_modules/**',
  '**/.git/**',
  '**/build/**',
  '**/dist/**',
  '**/.next/**',
]

type Issue =
  | {
      kind: 'semicolon'
      file: string
      line: number
      content: string
    }
  | {
      kind: 'heading-trailing-blank'
      file: string
      line: number
      content: string
    }
  | {
      kind: 'heading-leading-blank'
      file: string
      line: number
      content: string
    }
  | {
      kind: 'fence-leading-blank'
      file: string
      line: number
      content: string
    }
  | {
      kind: 'fence-trailing-blank'
      file: string
      line: number
      content: string
    }
  | {
      kind: 'duplicate-blank-line'
      file: string
      line: number
      content: string
    }
  | {
      kind: 'missing-language'
      file: string
      line: number
      content: string
    }
  | {
      kind: 'tab'
      file: string
      line: number
      content: string
    }

/**
 * Returns the normalized fence language if the line starts a code fence.
 * @param line - Line to inspect for a fenced code block start.
 * @returns Normalized language string or null if not a fence start.
 */
function isFenceStart(line: string): string | null {
  const match = line.match(/^\s*```(\S*)/)
  if (!match) {
    return null
  }

  return match[1]?.trim().toLowerCase() ?? ''
}

/**
 * Inserts the given language into a code fence line while preserving indentation.
 * @param line - Fence line to update.
 * @param language - Language identifier to insert.
 * @returns Updated fence line with the language applied.
 */
function addFenceLanguage(line: string, language: string): string {
  const match = line.match(/^(\s*)```/)
  if (!match) {
    return line
  }

  return `${match[1]}\`\`\`${language}`
}

/**
 * Determines whether the line ends a fenced code block.
 * @param line - Line to test for a closing fence.
 * @returns True when the line is a fence end marker.
 */
function isFenceEnd(line: string): boolean {
  return /^\s*```/.test(line)
}

/**
 * Checks whether a line ends with a trailing semicolon after trimming.
 * @param line - Line content to inspect.
 * @returns True if the trimmed line ends with ';'.
 */
function hasTrailingSemicolon(line: string): boolean {
  const trimmed = line.trimEnd()
  return trimmed.endsWith(';')
}

function isHeading(line: string): boolean {
  return /^\s*#{1,6}\s+/.test(line)
}

type CheckResult = {
  issues: Issue[]
  updatedContent: string | null
}

type NonCodeLineResult = {
  inCodeBlock: boolean
  checkBlock: boolean
  lang: string | null
  issue: Issue | null
  updatedLine: string | null
}

type CodeBlockLineResult = {
  isEnd: boolean
  issue: Issue | null
  updatedLine: string | null
}

const tabReplacementByLanguage = new Map<string, string>([
  ['python', '    '],
  ['py', '    '],
])

function getTabReplacement(language: string | null): string {
  if (!language) {
    return '  '
  }
  return tabReplacementByLanguage.get(language) ?? '  '
}

function processNonCodeLine(
  line: string,
  index: number,
  filePath: string,
  fix: boolean,
): NonCodeLineResult {
  const lang = isFenceStart(line)
  if (lang === null) {
    return {
      inCodeBlock: false,
      checkBlock: false,
      lang: null,
      issue: null,
      updatedLine: null,
    }
  }

  const issue: Issue | null =
    lang === ''
      ? {
          file: filePath,
          line: index + 1,
          content: line.trim(),
          kind: 'missing-language',
        }
      : null
  const updatedLine = lang === '' && fix ? addFenceLanguage(line, 'text') : null

  if (updatedLine !== null) {
    console.log(`${filePath} missing-language`)
  }

  return {
    inCodeBlock: true,
    checkBlock: codeLanguages.has(lang),
    lang,
    issue,
    updatedLine,
  }
}

function processCodeBlockLine(
  line: string,
  index: number,
  filePath: string,
  checkBlock: boolean,
  fix: boolean,
): CodeBlockLineResult {
  if (isFenceEnd(line)) {
    return { isEnd: true, issue: null, updatedLine: null }
  }

  if (!checkBlock) {
    return { isEnd: false, issue: null, updatedLine: null }
  }

  if (!hasTrailingSemicolon(line)) {
    return { isEnd: false, issue: null, updatedLine: null }
  }

  const issue: Issue = {
    file: filePath,
    line: index + 1,
    content: line.trim(),
    kind: 'semicolon',
  }
  const updatedLine = fix ? line.replace(/;\s*$/, '') : null

  if (updatedLine !== null) {
    console.log(`${filePath} semicolon`)
  }

  return { isEnd: false, issue, updatedLine }
}

async function checkFile(filePath: string, fix: boolean): Promise<CheckResult> {
  const contents = await readFile(filePath, 'utf-8')
  const lines = contents.split('\n')
  const issues: Issue[] = []
  const updatedLines: string[] = []
  let inCodeBlock = false
  let checkBlock = false
  let currentLang: string | null = null

  for (let index = 0; index < lines.length; index++) {
    let line = lines[index]

    if (line.includes('\t')) {
      issues.push({
        file: filePath,
        line: index + 1,
        content: line.trim(),
        kind: 'tab',
      })
      if (fix) {
        const replacement = getTabReplacement(inCodeBlock ? currentLang : null)
        line = line.replace(/\t/g, replacement)
        console.log(`${filePath} tab`)
      }
    }

    if (!inCodeBlock) {
      const result = processNonCodeLine(line, index, filePath, fix)
      inCodeBlock = result.inCodeBlock
      checkBlock = result.checkBlock
      currentLang = result.inCodeBlock ? result.lang : null
      if (result.issue) {
        issues.push(result.issue)
      }
      if (result.updatedLine !== null) {
        line = result.updatedLine
      }

      if (line.trim() === '') {
        const previousLine = updatedLines[updatedLines.length - 1] ?? ''
        if (previousLine.trim() === '') {
          issues.push({
            file: filePath,
            line: index + 1,
            content: line.trim(),
            kind: 'duplicate-blank-line',
          })
          if (fix) {
            console.log(`${filePath} duplicate-blank-line`)
            continue
          }
        }
      }

      if (isFenceStart(line) !== null && updatedLines.length > 0) {
        const previousLine = updatedLines[updatedLines.length - 1] ?? ''
        if (previousLine.trim() !== '') {
          issues.push({
            file: filePath,
            line: index + 1,
            content: line.trim(),
            kind: 'fence-leading-blank',
          })
          if (fix) {
            updatedLines.push('')
            console.log(`${filePath} fence-leading-blank`)
          }
        }
      }

      updatedLines.push(line)
      if (isHeading(line)) {
        const previousLine = updatedLines[updatedLines.length - 2] ?? ''
        if (updatedLines.length > 1 && previousLine.trim() !== '') {
          issues.push({
            file: filePath,
            line: index + 1,
            content: line.trim(),
            kind: 'heading-leading-blank',
          })
          if (fix) {
            updatedLines.splice(updatedLines.length - 1, 0, '')
            console.log(`${filePath} heading-leading-blank`)
          }
        }

        const nextLine = lines[index + 1]
        if (typeof nextLine !== 'undefined' && nextLine.trim() !== '') {
          issues.push({
            file: filePath,
            line: index + 1,
            content: line.trim(),
            kind: 'heading-trailing-blank',
          })
          if (fix) {
            updatedLines.push('')
            console.log(`${filePath} heading-trailing-blank`)
          }
        }
      }
      continue
    }

    const result = processCodeBlockLine(line, index, filePath, checkBlock, fix)
    if (result.issue) {
      issues.push(result.issue)
    }
    if (result.updatedLine !== null) {
      line = result.updatedLine
    }

    updatedLines.push(line)
    if (result.isEnd) {
      inCodeBlock = false
      checkBlock = false
      currentLang = null
      const nextLine = lines[index + 1]
      if (typeof nextLine !== 'undefined' && nextLine.trim() !== '') {
        issues.push({
          file: filePath,
          line: index + 1,
          content: line.trim(),
          kind: 'fence-trailing-blank',
        })
        if (fix) {
          updatedLines.push('')
          console.log(`${filePath} fence-trailing-blank`)
        }
      }
    }
  }

  if (!fix || updatedLines.join('\n') === contents) {
    return { issues, updatedContent: null }
  }

  return { issues, updatedContent: updatedLines.join('\n') }
}

async function main(): Promise<void> {
  const fix = process.argv.includes('--fix')
  const files = await glob('**/*.{md,mdc}', { ignore: ignoredGlobs, dot: true })
  const issues: Issue[] = []

  for (const file of files) {
    const normalizedPath = path.normalize(file)
    const { issues: fileIssues, updatedContent } = await checkFile(normalizedPath, fix)
    issues.push(...fileIssues)
    if (fix && updatedContent !== null) {
      await writeFile(normalizedPath, updatedContent, 'utf-8')
    }
  }

  if (issues.length > 0) {
    if (fix) {
      const semicolonCount = issues.filter(issue => issue.kind === 'semicolon').length
      const missingLanguageCount = issues.filter(
        issue => issue.kind === 'missing-language',
      ).length
      const headingTrailingBlankCount = issues.filter(
        issue => issue.kind === 'heading-trailing-blank',
      ).length
      const headingLeadingBlankCount = issues.filter(
        issue => issue.kind === 'heading-leading-blank',
      ).length
      const fenceLeadingBlankCount = issues.filter(
        issue => issue.kind === 'fence-leading-blank',
      ).length
      const fenceTrailingBlankCount = issues.filter(
        issue => issue.kind === 'fence-trailing-blank',
      ).length
      const duplicateBlankLineCount = issues.filter(
        issue => issue.kind === 'duplicate-blank-line',
      ).length
      const tabCount = issues.filter(issue => issue.kind === 'tab').length
      const parts = []

      if (semicolonCount > 0) {
        parts.push(`${semicolonCount} semicolon issue(s)`)
      }

      if (missingLanguageCount > 0) {
        parts.push(`${missingLanguageCount} missing language fence(s)`)
      }

      if (headingTrailingBlankCount > 0) {
        parts.push(`${headingTrailingBlankCount} heading trailing blank issue(s)`)
      }

      if (headingLeadingBlankCount > 0) {
        parts.push(`${headingLeadingBlankCount} heading leading blank issue(s)`)
      }

      if (fenceLeadingBlankCount > 0) {
        parts.push(`${fenceLeadingBlankCount} fence leading blank issue(s)`)
      }

      if (fenceTrailingBlankCount > 0) {
        parts.push(`${fenceTrailingBlankCount} fence trailing blank issue(s)`)
      }

      if (duplicateBlankLineCount > 0) {
        parts.push(`${duplicateBlankLineCount} duplicate blank line issue(s)`)
      }

      if (tabCount > 0) {
        parts.push(`${tabCount} tab issue(s)`)
      }

      console.log(`Fixed ${parts.join(' and ')}`)
      return
    }

    console.error('Markdown code block issues found:')
    for (const issue of issues) {
      console.error(`${issue.file}:${issue.line} ${issue.kind} ${issue.content}`)
    }
    process.exit(1)
  }
}

await main()
