#!/usr/bin/env node

/**
 * Test script for the Documentation Agent
 * 
 * This script simulates the documentation agent with sample changes
 * to verify it works correctly before deploying to CI.
 */

import DocumentationAgent from './docs-agent.js'
import { execSync } from 'child_process'

// Test scenarios
const testScenarios = [
  {
    name: 'Database Schema Change',
    description: 'Test updating documentation when schema.prisma changes',
    mockChanges: ['prisma/schema.prisma'],
    expectedUpdates: [
      'docs/development/database.md',
      'docs/development/database-schema-changes.md'
    ]
  },
  {
    name: 'Component Change',
    description: 'Test updating documentation when UI components change',
    mockChanges: ['app/components/TeamForm.tsx', 'app/components/TournamentForm.tsx'],
    expectedUpdates: [
      'docs/development/ui-components.md',
      'docs/development/design-system.md'
    ]
  },
  {
    name: 'Package.json Change',
    description: 'Test updating documentation when dependencies change',
    mockChanges: ['package.json'],
    expectedUpdates: [
      'docs/getting-started.md',
      'README.md'
    ]
  },
  {
    name: 'Test Configuration Change',
    description: 'Test updating documentation when test config changes',
    mockChanges: ['vitest.config.ts', 'playwright.config.ts'],
    expectedUpdates: [
      'docs/testing/testing-guide.md',
      'docs/testing/vitest-mcp.md',
      'docs/testing/playwright-guide.md'
    ]
  },
  {
    name: 'Multiple Changes',
    description: 'Test updating documentation with multiple file changes',
    mockChanges: [
      'app/routes/teams/teams._index.tsx',
      'app/components/TeamForm.tsx',
      'app/utils/teamCreation.server.ts'
    ],
    expectedUpdates: [
      'docs/development/routing.md',
      'docs/development/ui-components.md',
      'docs/development/overview.md'
    ]
  }
]

class DocsAgentTester {
  constructor() {
    this.testResults = []
  }

  async runTests() {
    console.log('🧪 Starting Documentation Agent Tests\n')
    
    for (const scenario of testScenarios) {
      console.log(`📋 Testing: ${scenario.name}`)
      console.log(`   ${scenario.description}`)
      
      try {
        const result = await this.runTestScenario(scenario)
        this.testResults.push({
          scenario: scenario.name,
          success: result.success,
          message: result.message,
          details: result.details
        })
        
        if (result.success) {
          console.log(`   ✅ ${result.message}\n`)
        } else {
          console.log(`   ❌ ${result.message}\n`)
        }
      } catch (error) {
        console.log(`   ❌ Test failed: ${error.message}\n`)
        this.testResults.push({
          scenario: scenario.name,
          success: false,
          message: `Test failed: ${error.message}`,
          details: null
        })
      }
    }
    
    this.printTestSummary()
  }

  async runTestScenario(scenario) {
    // Mock the agent with test data
    const mockAgent = new DocumentationAgent({
      baseSha: 'test-base-sha',
      headSha: 'test-head-sha',
      prNumber: '999',
      prTitle: `Test: ${scenario.name}`,
      prBody: scenario.description
    })

    // Override the getChangedFiles method to return our test changes
    mockAgent.getChangedFiles = () => scenario.mockChanges

    // Mock the file existence checks by overriding the method in the agent
    const originalExistsSync = (await import('fs')).existsSync
    const mockExistsSync = (path) => {
      // Always return true for expected documentation files
      if (scenario.expectedUpdates.includes(path)) {
        return true
      }
      // Use original function for other files
      return originalExistsSync(path)
    }

    // Override the existsSync method in the agent's context
    mockAgent.existsSync = mockExistsSync

    try {
      // Run the analysis
      const changedFiles = mockAgent.getChangedFiles()
      const docUpdates = mockAgent.analyzeChanges(changedFiles)
      
      // Check if we got the expected updates
      const actualUpdates = docUpdates.flatMap(update => update.documentationFiles)
      const expectedUpdates = scenario.expectedUpdates
      
      const foundExpected = expectedUpdates.every(expected => 
        actualUpdates.includes(expected)
      )
      
      const unexpectedUpdates = actualUpdates.filter(actual => 
        !expectedUpdates.includes(actual)
      )

      // Consider it successful if we found all expected updates, even if there are additional ones
      // This is because the agent might find more relevant documentation than we initially expected
      const success = foundExpected

      return {
        success: success,
        message: success 
          ? `Found all expected documentation updates (${actualUpdates.length} total files)`
          : `Missing expected updates: ${expectedUpdates.filter(e => !actualUpdates.includes(e)).join(', ')}`,
        details: {
          expected: expectedUpdates,
          actual: actualUpdates,
          unexpected: unexpectedUpdates
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Test execution failed: ${error.message}`,
        details: null
      }
    }
  }

  printTestSummary() {
    console.log('📊 Test Summary')
    console.log('='.repeat(50))
    
    const passed = this.testResults.filter(r => r.success).length
    const total = this.testResults.length
    
    console.log(`Total Tests: ${total}`)
    console.log(`Passed: ${passed}`)
    console.log(`Failed: ${total - passed}`)
    console.log(`Success Rate: ${Math.round((passed / total) * 100)}%\n`)
    
    if (passed === total) {
      console.log('🎉 All tests passed! The Documentation Agent is ready for deployment.')
    } else {
      console.log('⚠️  Some tests failed. Please review the issues before deploying.')
      
      console.log('\nFailed Tests:')
      this.testResults
        .filter(r => !r.success)
        .forEach(result => {
          console.log(`- ${result.scenario}: ${result.message}`)
        })
    }
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new DocsAgentTester()
  tester.runTests().catch(error => {
    console.error('❌ Test runner failed:', error)
    process.exit(1)
  })
}

export default DocsAgentTester