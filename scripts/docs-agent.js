#!/usr/bin/env node

/**
 * Documentation Agent
 * 
 * Automatically analyzes code changes in pull requests and updates relevant documentation.
 * This script runs in CI to keep documentation in sync with code changes.
 */

import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join, dirname, basename, extname } from 'path'
import { fileURLToPath } from 'url'
import { DOCS_AGENT_CONFIG as CONFIG } from './docs-agent.config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

class DocumentationAgent {
  constructor(options) {
    this.baseSha = options.baseSha
    this.headSha = options.headSha
    this.prNumber = options.prNumber
    this.prTitle = options.prTitle
    this.prBody = options.prBody
    this.docsUpdated = false
    this.updateSummary = []
    this.existsSync = existsSync // Allow overriding for testing
  }

  /**
   * Main execution method
   */
  async run() {
    console.log('🔍 Starting documentation analysis...')
    
    try {
      // Get changed files
      const changedFiles = this.getChangedFiles()
      console.log(`📝 Found ${changedFiles.length} changed files`)
      
      if (changedFiles.length === 0) {
        console.log('✅ No files changed, skipping documentation update')
        return
      }

      // Analyze changes and determine what documentation needs updating
      const docUpdates = this.analyzeChanges(changedFiles)
      
      if (docUpdates.length === 0) {
        console.log('✅ No documentation updates needed')
        return
      }

      // Update documentation files
      await this.updateDocumentation(docUpdates)
      
      // Update changelog if needed
      this.updateChangelog(changedFiles)
      
      // Update README if needed
      this.updateReadme(changedFiles)
      
      // Write update summary
      this.writeUpdateSummary()
      
      console.log('✅ Documentation update completed')
      console.log(`::set-output name=docs_updated::true`)
      
    } catch (error) {
      console.error('❌ Error updating documentation:', error)
      process.exit(1)
    }
  }

  /**
   * Get list of changed files between base and head commits
   */
  getChangedFiles() {
    try {
      const output = execSync(`git diff --name-only ${this.baseSha}..${this.headSha}`, { 
        encoding: 'utf8',
        cwd: process.cwd()
      })
      return output.trim().split('\n').filter(file => file.length > 0)
    } catch (error) {
      console.error('Error getting changed files:', error.message)
      return []
    }
  }

  /**
   * Analyze changed files and determine what documentation needs updating
   */
  analyzeChanges(changedFiles) {
    const docUpdates = []
    
    for (const file of changedFiles) {
      // Skip if it's already a documentation file
      if (this.isDocumentationFile(file)) {
        continue
      }
      
      // Find relevant documentation files
      const relevantDocs = this.findRelevantDocumentation(file)
      
      if (relevantDocs.length > 0) {
        docUpdates.push({
          sourceFile: file,
          documentationFiles: relevantDocs,
          changeType: this.getChangeType(file)
        })
      }
    }
    
    return docUpdates
  }

  /**
   * Check if a file is a documentation file
   */
  isDocumentationFile(file) {
    return file.startsWith(CONFIG.directories.docs + '/') || 
           file.startsWith(CONFIG.directories.templates + '/') || 
           file.startsWith(CONFIG.directories.rules + '/') ||
           file === 'README.md' ||
           file === 'CHANGELOG.md'
  }

  /**
   * Find relevant documentation files for a given source file
   */
  findRelevantDocumentation(file) {
    const relevantDocs = []
    
    // Check direct mappings
    for (const [pattern, docs] of Object.entries(CONFIG.directMapping)) {
      if (file.includes(pattern) || file.startsWith(pattern)) {
        relevantDocs.push(...docs)
      }
    }
    
    // Check pattern-based mappings
    for (const [category, patterns] of Object.entries(CONFIG.patterns)) {
      for (const pattern of patterns) {
        if (this.matchesPattern(file, pattern)) {
          const categoryDocs = this.getCategoryDocumentation(category)
          relevantDocs.push(...categoryDocs)
        }
      }
    }
    
    // Remove duplicates and filter existing files
    return [...new Set(relevantDocs)].filter(doc => this.existsSync(doc))
  }

  /**
   * Check if a file matches a pattern
   */
  matchesPattern(file, pattern) {
    // Simple pattern matching - can be enhanced with glob patterns
    if (pattern.includes('**')) {
      const basePattern = pattern.replace('/**', '')
      return file.startsWith(basePattern)
    }
    return file.includes(pattern)
  }

  /**
   * Get documentation files for a category
   */
  getCategoryDocumentation(category) {
    return CONFIG.categoryMapping[category] || []
  }

  /**
   * Determine the type of change
   */
  getChangeType(file) {
    if (file.includes('schema.prisma')) return 'database-schema'
    if (file.includes('routes/')) return 'api-endpoint'
    if (file.includes('components/')) return 'ui-component'
    if (file.includes('utils/')) return 'utility-function'
    if (file.includes('styles/')) return 'styling'
    if (file.includes('package.json')) return 'dependency'
    if (file.includes('.config.')) return 'configuration'
    if (file.includes('.test.')) return 'test'
    return 'general'
  }

  /**
   * Update documentation files
   */
  async updateDocumentation(docUpdates) {
    for (const update of docUpdates) {
      for (const docFile of update.documentationFiles) {
        await this.updateDocumentationFile(docFile, update)
      }
    }
  }

  /**
   * Update a specific documentation file
   */
  async updateDocumentationFile(docFile, update) {
    try {
      if (!this.existsSync(docFile)) {
        console.log(`⚠️  Documentation file ${docFile} does not exist, skipping`)
        return
      }

      const content = readFileSync(docFile, 'utf8')
      const updatedContent = this.updateDocumentationContent(content, docFile, update)
      
      if (updatedContent !== content) {
        writeFileSync(docFile, updatedContent)
        this.docsUpdated = true
        this.updateSummary.push({
          file: docFile,
          sourceFile: update.sourceFile,
          changeType: update.changeType
        })
        console.log(`📝 Updated ${docFile} based on ${update.sourceFile}`)
      }
    } catch (error) {
      console.error(`❌ Error updating ${docFile}:`, error.message)
    }
  }

  /**
   * Update documentation content based on changes
   */
  updateDocumentationContent(content, docFile, update) {
    // Add a note about recent changes if not already present
    const changeNote = this.generateChangeNote(update)
    const lastUpdatedPattern = /<!-- Last updated: .* -->/
    
    if (lastUpdatedPattern.test(content)) {
      // Update existing note
      return content.replace(lastUpdatedPattern, changeNote)
    } else {
      // Add new note at the top
      return `${changeNote}\n\n${content}`
    }
  }

  /**
   * Generate a change note for documentation
   */
  generateChangeNote(update) {
    const date = new Date().toISOString().split('T')[0]
    const changeTypeMap = {
      'database-schema': 'Database schema',
      'api-endpoint': 'API endpoint',
      'ui-component': 'UI component',
      'utility-function': 'Utility function',
      'styling': 'Styling',
      'dependency': 'Dependency',
      'configuration': 'Configuration',
      'test': 'Test',
      'general': 'Code'
    }
    
    const changeType = changeTypeMap[update.changeType] || 'Code'
    return `<!-- Last updated: ${date} - ${changeType} changes in ${update.sourceFile} (PR #${this.prNumber}) -->`
  }

  /**
   * Update changelog if significant changes are detected
   */
  updateChangelog(changedFiles) {
    const significantChanges = changedFiles.some(file => 
      file.includes('schema.prisma') || 
      file.includes('package.json') ||
      file.includes('routes/') ||
      file.includes('components/')
    )
    
    if (significantChanges && this.existsSync('CHANGELOG.md')) {
      try {
        const changelog = readFileSync('CHANGELOG.md', 'utf8')
        const today = new Date().toISOString().split('T')[0]
        
        // Add entry if not already present
        if (!changelog.includes(`## [Unreleased]`)) {
          const unreleasedEntry = `## [Unreleased]

### Changed
- Documentation updated based on PR #${this.prNumber} changes

`
          const updatedChangelog = changelog.replace(/^# /, `${unreleasedEntry}# `)
          writeFileSync('CHANGELOG.md', updatedChangelog)
          this.docsUpdated = true
          console.log('📝 Updated CHANGELOG.md')
        }
      } catch (error) {
        console.error('❌ Error updating changelog:', error.message)
      }
    }
  }

  /**
   * Update README if package.json or significant config changes
   */
  updateReadme(changedFiles) {
    const readmeChanges = changedFiles.some(file => 
      file === 'package.json' || 
      file.includes('vite.config') ||
      file.includes('vitest.config') ||
      file.includes('playwright.config')
    )
    
    if (readmeChanges && this.existsSync('README.md')) {
      try {
        const readme = readFileSync('README.md', 'utf8')
        const changeNote = this.generateChangeNote({
          sourceFile: 'configuration files',
          changeType: 'configuration'
        })
        
        if (!readme.includes('<!-- Last updated:')) {
          const updatedReadme = `${changeNote}\n\n${readme}`
          writeFileSync('README.md', updatedReadme)
          this.docsUpdated = true
          console.log('📝 Updated README.md')
        }
      } catch (error) {
        console.error('❌ Error updating README:', error.message)
      }
    }
  }

  /**
   * Write update summary to file
   */
  writeUpdateSummary() {
    if (this.updateSummary.length === 0) return
    
    const summary = `# Documentation Update Summary

## Changes Made
${this.updateSummary.map(update => 
  `- **${update.file}**: Updated based on ${update.changeType} changes in \`${update.sourceFile}\``
).join('\n')}

## PR Information
- **PR Number**: #${this.prNumber}
- **PR Title**: ${this.prTitle}
- **Date**: ${new Date().toISOString()}

## Files Updated
${this.updateSummary.map(update => `- \`${update.file}\``).join('\n')}
`
    
    writeFileSync('docs-update-summary.md', summary)
  }
}

// CLI interface
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {}
  
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '')
    const value = args[i + 1]
    options[key] = value
  }
  
  return options
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const options = parseArgs()
  
  if (!options.baseSha || !options.headSha) {
    console.error('❌ Missing required arguments: --base-sha and --head-sha')
    process.exit(1)
  }
  
  const agent = new DocumentationAgent(options)
  agent.run().catch(error => {
    console.error('❌ Documentation agent failed:', error)
    process.exit(1)
  })
}

export default DocumentationAgent