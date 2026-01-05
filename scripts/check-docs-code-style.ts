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

type SemicolonIssue = {
	file: string
	line: number
	content: string
}

function isFenceStart(line: string): string | null {
	const match = line.match(/^\s*```(\S*)/)
	if (!match) {
		return null
	}

	return match[1]?.trim().toLowerCase() ?? ''
}

function isFenceEnd(line: string): boolean {
	return /^\s*```/.test(line)
}

function hasTrailingSemicolon(line: string): boolean {
	const trimmed = line.trimEnd()
	return trimmed.endsWith(';')
}

type CheckResult = {
	issues: SemicolonIssue[]
	updatedContent: string | null
}

async function checkFile(filePath: string, fix: boolean): Promise<CheckResult> {
	const contents = await readFile(filePath, 'utf-8')
	const lines = contents.split('\n')
	const issues: SemicolonIssue[] = []
	const updatedLines = [...lines]
	let inCodeBlock = false
	let checkBlock = false

	lines.forEach((line, index) => {
		if (!inCodeBlock) {
			const lang = isFenceStart(line)
			if (lang !== null) {
				inCodeBlock = true
				checkBlock = codeLanguages.has(lang)
			}
			return
		}

		if (isFenceEnd(line)) {
			inCodeBlock = false
			checkBlock = false
			return
		}

		if (!checkBlock) {
			return
		}

		if (hasTrailingSemicolon(line)) {
			issues.push({
				file: filePath,
				line: index + 1,
				content: line.trim(),
			})
			if (fix) {
				updatedLines[index] = line.replace(/;\s*$/, '')
			}
		}
	})

	if (!fix || updatedLines.join('\n') === contents) {
		return { issues, updatedContent: null }
	}

	return { issues, updatedContent: updatedLines.join('\n') }
}

async function main(): Promise<void> {
	const fix = process.argv.includes('--fix')
	const files = await glob('**/*.{md,mdc}', { ignore: ignoredGlobs })
	const issues: SemicolonIssue[] = []

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
			console.log(`Fixed ${issues.length} semicolon issue(s)`)
			return
		}

		console.error('Semicolons found in markdown code blocks:')
		for (const issue of issues) {
			console.error(`${issue.file}:${issue.line} ${issue.content}`)
		}
		process.exit(1)
	}
}

await main()
