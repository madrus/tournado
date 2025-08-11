## ✅ **Added Symmetric Delete Helpers for Test Cleanup!**

### **🔧 What I've Implemented:**

**New functions in `playwright/helpers/database.ts`:**

1. **`deleteTournamentById(id: string)`** - Deletes tournament and all dependent records:
   - Deletes matches referencing the tournament
   - Deletes teams referencing the tournament
   - Deletes the tournament itself

2. **`deleteTeamById(id: string)`** - Deletes team and all dependent records:
   - Deletes matches where team is home or away
   - Deletes team leader records
   - Deletes the team itself

### ** Key Features:**

- **✅ Proper Order**: Deletes children before parents (respects foreign key constraints)
- **✅ Error Handling**: Logs cleanup failures but doesn't break tests
- **✅ Async/Await**: Properly handles database operations
- **✅ Comprehensive**: Covers all related records that might exist

### ** Usage Pattern:**

```typescript
test('should create team with tournament', async ({ page }) => {
   let tournamentId: string | undefined
   let teamId: string | undefined

   try {
      // Test logic here...
      const tournament = await createTestTournament('Test', 'Location')
      tournamentId = tournament.id

      // ... more test logic ...
   } finally {
      // Cleanup in reverse order
      if (teamId) {
         const { deleteTeamById } = await import('../helpers/database')
         try {
            await deleteTeamById(teamId)
         } catch (e) {
            console.error('Cleanup failed:', e)
         }
      }
      if (tournamentId) {
         const { deleteTournamentById } = await import('../helpers/database')
         try {
            await deleteTournamentById(tournamentId)
         } catch (e) {
            console.error('Cleanup failed:', e)
         }
      }
   }
})
```

### ** Benefits:**

1. **Cleaner Tests**: Database stays clean between test runs
2. **Better Isolation**: Tests don't interfere with each other
3. **More Reliable CI**: Consistent test environment
4. **Easier Debugging**: No leftover test data to confuse results

### **📝 Next Steps:**

Would you like me to:

1. **Wire these helpers into the existing tests** with try/finally blocks?
2. **Test the cleanup functions** to ensure they work correctly?
3. **Add cleanup to other tests** that create data?

The helpers are ready to use - just say the word and I'll integrate them into your tests! 🎯
