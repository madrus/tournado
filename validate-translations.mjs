#!/usr/bin/env node

/**
 * Translation Key Validator
 *
 * This script validates that all translation keys used in the codebase
 * exist in all translation files.
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Extract all translation keys from code
function extractKeysFromCode() {
  // Exclude test files and get all production code
  const cmd =
    `grep -rh "t(" app ` +
    `--include="*.tsx" --include="*.ts" ` +
    `--exclude-dir="__tests__" --exclude-dir="tests" ` +
    `--exclude="*.test.ts" --exclude="*.test.tsx" --exclude="*.spec.ts" --exclude="*.spec.tsx" ` +
    `2>/dev/null || true`
  const output = execSync(cmd, { encoding: 'utf-8', shell: '/bin/bash' })

  // Match both: t('a.b') and t('a.b', {...})
  const keyPattern = /\bt\s*\(\s*(['"])([^'"\\]+)\1\s*(?:,|\))/g
  const keys = new Set()

  let match = keyPattern.exec(output)
  while (match !== null) {
    const key = match[2]
    // Filter out non-translation patterns:
    // - Must contain at least one dot (nested key)
    // - No file paths (starts with ./ or ~/)
    // - No URLs (contains ://)
    // - No special chars except dots and underscores
    // - Not a single word without dots
    if (
      key.includes('.') &&
      key !== '.' &&
      !key.startsWith('./') &&
      !key.startsWith('~/') &&
      !key.includes('://') &&
      !key.includes('/') &&
      !/^[A-Z\s]+$/.test(key) && // Not all caps (like constant names)
      !/^\d+$/.test(key) && // Not just numbers
      key.length < 100 // Reasonable length
    ) {
      keys.add(key)
    }
    match = keyPattern.exec(output)
  }

  return Array.from(keys).sort()
}

// Get nested value from object using dot notation
function getNestedValue(obj, keyPath) {
  return keyPath.split('.').reduce((current, key) => {
    return current?.[key]
  }, obj)
}

// Load all translation files
function loadTranslationFiles() {
  const localesDir = path.resolve(process.cwd(), 'app/i18n/locales')
  const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'))

  const translations = {}
  for (const file of files) {
    const lang = path.basename(file, '.json')
    const content = fs.readFileSync(path.join(localesDir, file), 'utf-8')
    translations[lang] = JSON.parse(content)
  }

  return translations
}

// Main validation
function validateTranslations() {
  console.log('🔍 Extracting translation keys from code...\n')
  const usedKeys = extractKeysFromCode()
  console.log(`Found ${usedKeys.length} unique translation keys in code\n`)

  console.log('📚 Loading translation files...\n')
  const translations = loadTranslationFiles()
  const languages = Object.keys(translations).sort()
  console.log(`Languages: ${languages.join(', ')}\n`)

  console.log('🔎 Validating keys across all languages...\n')

  const missingByLang = {}
  languages.forEach(lang => {
    missingByLang[lang] = []
  })

  for (const key of usedKeys) {
    for (const lang of languages) {
      const value = getNestedValue(translations[lang], key)
      if (value === undefined) {
        missingByLang[lang].push(key)
      }
    }
  }

  // Report results
  console.log('='.repeat(80))
  console.log('VALIDATION RESULTS')
  console.log('='.repeat(80))
  console.log()

  let hasIssues = false

  for (const lang of languages) {
    const missing = missingByLang[lang]
    if (missing.length > 0) {
      hasIssues = true
      console.log(`❌ ${lang.toUpperCase()}: ${missing.length} missing translations`)
      console.log('─'.repeat(80))
      missing.forEach(key => {
        console.log(`   - ${key}`)
      })
      console.log()
    } else {
      console.log(`✅ ${lang.toUpperCase()}: All translations present`)
      console.log()
    }
  }

  if (!hasIssues) {
    console.log('🎉 All translation keys are present in all languages!')
  } else {
    console.log('⚠️  Translation issues found. Please add the missing keys.')
  }

  console.log()
  console.log('='.repeat(80))
  console.log(`Total keys checked: ${usedKeys.length}`)
  console.log(`Total languages: ${languages.length}`)
  console.log('='.repeat(80))

  return hasIssues ? 1 : 0
}

// Run validation
const exitCode = validateTranslations()
process.exit(exitCode)
