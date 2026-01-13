---
name: summarize-chat
description: Make a summary of the chat - key decisions made, code patterns established, next steps identified. This saves a ton of tokens and thus AI-costs.
---

# Chat Summary Skill

Create a concise summary (<=300 words) of our conversation to use as context for the next chat session.

## Format Requirements

Structure the summary as a system prompt with these sections:

### 1. Context

- What we were working on
- Why this work matters to the project

### 2. Key Decisions Made

- Technical decisions and their rationale
- Design choices (patterns, colors, components)
- Architecture changes

### 3. Code Patterns Established

- Component patterns used
- Styling approaches (variants, utilities)
- Important conventions followed

### 4. Files Modified

- List files changed with brief description of changes
- Include specific line numbers if relevant
- Note any refactoring (e.g., Panel → custom variants)

### 5. Technical Context

- Important types, utilities, or APIs referenced
- Relevant libraries or tools used
- Key configuration or settings

### 6. Next Steps / Pending Tasks

- Explicit tasks still to do
- Implicit follow-up work identified
- Testing or validation needed

## Output Style

- Be concise and technical
- Focus on information needed to continue work seamlessly
- Use bullet points for clarity
- Include file paths and line numbers for quick reference
- Emphasize **decisions and rationale**, not just what changed
- Format as a system message that provides context without requiring re-reading the entire chat
- **Include word count at the end** in format: `[Word count: X/300]`

## Example Structure

```text
Previous session context: We standardized title colors across the competition UI and implemented semi-transparent group panels using sky gradients.

Key decisions:
- Chose text-title class for darker primary color in titles
- Used sky-500/15 via-5 opacity pattern matching confirmed pool
- Refactored from Panel component to groupCardVariants for consistency

Files modified:
- CompetitionGroupsTab.tsx:29,52 - Updated titles to text-title
- GroupCard.tsx - Replaced Panel with section + groupCardVariants
- groupAssignment.variants.ts:37-70 - Sky gradient with dark mode

Current state: All changes implemented and passing typecheck and lint. Group panels now semi-transparent with sky color matching design system.

[Word count: 93/300]
```
