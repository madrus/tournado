/**
 * Group Assignment Dirty State E2E Tests
 *
 * Test Scenarios:
 * - Dirty state detection when making changes (drag team to slot)
 * - Save button and cancel button enabled when dirty
 * - Unsaved changes warning displayed when dirty
 * - Dirty state reset after successful save
 * - Navigation blocker active when dirty
 * - Navigation blocker inactive after save
 *
 * Authentication: Uses global auth from admin-auth.json (ADMIN role)
 * Viewport: Desktop (1920x1080)
 *
 * Test Data Setup:
 * Creates a tournament with group stage and teams for testing
 *
 * Run with: pnpm test:e2e:ui --grep "Group Assignment Dirty State"
 */
import { expect, test } from '@playwright/test'
import {
  createTestGroupStage,
  createTestTeam,
  createTestTournament,
  deleteTestGroupStage,
  deleteTestTeam,
  deleteTestTournament,
} from '../helpers/database'
import { GroupAssignmentPage } from '../pages/GroupAssignmentPage'

// Test data variables - will be populated in beforeAll
let TEST_TOURNAMENT_ID: string
let TEST_GROUP_STAGE_ID: string
let TEST_GROUP_ID: string
let TEST_TEAM_ID: string
const TEST_SLOT_INDEX = 0

test.describe('Group Assignment Dirty State', () => {
  let groupAssignmentPage: GroupAssignmentPage

  // Create test data before all tests
  test.beforeAll(async () => {
    // Create tournament
    const tournament = await createTestTournament(
      'Dirty State Test Tournament',
      'Test Location',
    )
    TEST_TOURNAMENT_ID = tournament.id

    // Create group stage with 2 groups
    const groupStage = await createTestGroupStage({
      tournamentId: TEST_TOURNAMENT_ID,
      name: 'Test Group Stage',
      groupCount: 2,
      slotsPerGroup: 4,
      categories: ['JO10'],
    })
    TEST_GROUP_STAGE_ID = groupStage.groupStageId
    TEST_GROUP_ID = groupStage.groupIds[0] // Use first group for tests
  })

  // Clean up test data after all tests
  test.afterAll(async () => {
    if (TEST_GROUP_STAGE_ID) {
      await deleteTestGroupStage(TEST_GROUP_STAGE_ID)
    }
    if (TEST_TOURNAMENT_ID) {
      await deleteTestTournament({ id: TEST_TOURNAMENT_ID })
    }
  })

  test.beforeEach(async ({ page }) => {
    // Use desktop viewport for better drag-and-drop testing
    await page.setViewportSize({ width: 1920, height: 1080 })
    const team = await createTestTeam({
      tournamentId: TEST_TOURNAMENT_ID,
      name: 'Test Team Alpha',
      division: 'FIRST_DIVISION',
      category: 'JO10',
    })
    TEST_TEAM_ID = team.id
    groupAssignmentPage = new GroupAssignmentPage(page)
  })

  test.afterEach(async () => {
    if (TEST_TEAM_ID) {
      await deleteTestTeam({ id: TEST_TEAM_ID })
    }
  })

  test('should show clean state on initial load', async () => {
    // Navigate to group assignment page
    await groupAssignmentPage.goto(TEST_GROUP_STAGE_ID)

    // Initial state should be clean
    await groupAssignmentPage.expectCleanState()
  })

  test('should set dirty state when dragging team to slot', async () => {
    await groupAssignmentPage.goto(TEST_GROUP_STAGE_ID)

    // Verify clean state initially
    await groupAssignmentPage.expectCleanState()

    // Drag a team from confirmed pool to a group slot
    await groupAssignmentPage.dragTeamToSlot(
      TEST_TEAM_ID,
      TEST_GROUP_ID,
      TEST_SLOT_INDEX,
    )

    // Should now be in dirty state
    await groupAssignmentPage.expectDirtyState()
  })

  test('should reset dirty state after successful save', async () => {
    await groupAssignmentPage.goto(TEST_GROUP_STAGE_ID)

    // Make a change
    await groupAssignmentPage.dragTeamToSlot(
      TEST_TEAM_ID,
      TEST_GROUP_ID,
      TEST_SLOT_INDEX,
    )

    // Verify dirty state
    await groupAssignmentPage.expectDirtyState()

    // Save changes
    await groupAssignmentPage.save()

    // Dirty state should be reset
    await groupAssignmentPage.expectCleanState()
  })

  test('should reset dirty state after cancel', async () => {
    await groupAssignmentPage.goto(TEST_GROUP_STAGE_ID)

    // Make a change
    await groupAssignmentPage.dragTeamToSlot(
      TEST_TEAM_ID,
      TEST_GROUP_ID,
      TEST_SLOT_INDEX,
    )

    // Verify dirty state
    await groupAssignmentPage.expectDirtyState()

    // Cancel changes
    await groupAssignmentPage.cancel()

    // Dirty state should be reset
    await groupAssignmentPage.expectCleanState()

    // Team should be back in confirmed pool
    await groupAssignmentPage.expectTeamInConfirmedPool(TEST_TEAM_ID)
  })

  test('should block navigation when dirty', async ({ page }) => {
    await groupAssignmentPage.goto(TEST_GROUP_STAGE_ID)

    // Make a change
    await groupAssignmentPage.dragTeamToSlot(
      TEST_TEAM_ID,
      TEST_GROUP_ID,
      TEST_SLOT_INDEX,
    )

    // Verify dirty state
    await groupAssignmentPage.expectDirtyState()

    // Attempt to navigate away
    const homeLink = page.getByRole('link', { name: /tournado/i }).first()
    await homeLink.click()

    // Navigation blocker should appear
    await groupAssignmentPage.expectNavigationBlockerVisible()

    // Stay on page
    await groupAssignmentPage.stayOnPageButton.click()

    // Should still be on group assignment page and dirty
    expect(page.url()).toContain(`/groups/${TEST_GROUP_STAGE_ID}`)
    await groupAssignmentPage.expectDirtyState()
  })

  test('should not block navigation after save', async ({ page }) => {
    await groupAssignmentPage.goto(TEST_GROUP_STAGE_ID)

    // Make a change
    await groupAssignmentPage.dragTeamToSlot(
      TEST_TEAM_ID,
      TEST_GROUP_ID,
      TEST_SLOT_INDEX,
    )

    // Save changes
    await groupAssignmentPage.save()

    // Verify clean state
    await groupAssignmentPage.expectCleanState()

    // Attempt to navigate away
    const homeLink = page.getByRole('link', { name: /tournado/i }).first()
    const homeHref = await homeLink.getAttribute('href')
    if (!homeHref) {
      throw new Error('Home link is missing href')
    }
    const homePathname = new URL(homeHref, page.url()).pathname
    await homeLink.click()

    // Navigation blocker should NOT appear
    await expect(groupAssignmentPage.navigationBlockerDialog).not.toBeVisible({
      timeout: 500,
    })

    // Should navigate away successfully
    await page.waitForURL(url => url.pathname === homePathname)
  })

  test('should persist team assignment after save and reload', async ({ page }) => {
    await groupAssignmentPage.goto(TEST_GROUP_STAGE_ID)

    // Make a change
    await groupAssignmentPage.dragTeamToSlot(
      TEST_TEAM_ID,
      TEST_GROUP_ID,
      TEST_SLOT_INDEX,
    )

    // Save changes
    await groupAssignmentPage.save()

    // Reload page
    await page.reload()
    await groupAssignmentPage.saveButton.waitFor({ state: 'visible', timeout: 10000 })

    // State should be clean after reload
    await groupAssignmentPage.expectCleanState()

    // Team should still be in the slot
    await groupAssignmentPage.expectTeamInSlot(
      TEST_TEAM_ID,
      TEST_GROUP_ID,
      TEST_SLOT_INDEX,
    )
  })

  test('should maintain clean state after save cycle', async () => {
    await groupAssignmentPage.goto(TEST_GROUP_STAGE_ID)

    // First change
    await groupAssignmentPage.dragTeamToSlot(
      TEST_TEAM_ID,
      TEST_GROUP_ID,
      TEST_SLOT_INDEX,
    )
    await groupAssignmentPage.expectDirtyState()

    // Save
    await groupAssignmentPage.save()
    await groupAssignmentPage.expectCleanState()
  })
})
