# Jobs-to-Be-Done (JTBD) Questioning Framework for PRDs

This framework helps understand what "job" users are hiring your product to do. Use this to move from feature-focused thinking to outcome-focused thinking, ensuring you're solving the right problem.

---

## Core Philosophy

**The goal is to understand the OUTCOME users want, not just the FEATURE they're asking for.**

Good JTBD questioning:
- ✅ Focuses on the job users are trying to get done
- ✅ Identifies functional, emotional, and social dimensions
- ✅ Reveals competing solutions (not just competitors)
- ✅ Clarifies success criteria from the user's perspective

Bad JTBD questioning:
- ❌ Gets stuck on features instead of outcomes
- ❌ Ignores emotional and social aspects
- ❌ Only thinks about direct competitors
- ❌ Assumes we know what users want

---

## The Four Question Categories

Use 3-5 questions total. Pick the most relevant from each category based on the feature.

### 1. Job Identification Questions

**Purpose:** Understand what job the user is trying to get done

**Questions to ask:**

**"What job is the user trying to get done?"**
- Focus on the outcome, not the feature
- Good: "Help tournament organizers register teams quickly so they can focus on event planning"
- Bad: "Users want a registration form"

**"What progress is the user trying to make?"**
- What situation are they moving from? To where?
- What does success look like from their perspective?

**"When does this job arise?"**
- What triggers the need?
- What situation causes them to "hire" a solution?

**"What happens if the job doesn't get done well?"**
- What are the consequences?
- Helps understand the importance of the job

---

### 2. Job Dimensions Questions

**Purpose:** Understand the functional, emotional, and social aspects of the job

**Questions to ask:**

**"What are the functional requirements?"**
- What does the solution need to DO?
- What capabilities are required?
- Good: "Must handle 50+ teams, process payments, send confirmations"
- Bad: "Must be fast"

**"What are the emotional requirements?"**
- How should using this make the user FEEL?
- What emotions are they trying to avoid? (anxiety, frustration, embarrassment)
- What emotions are they trying to achieve? (confidence, relief, pride)

**"What are the social requirements?"**
- How does this affect their status or relationships?
- Do they need to look competent to others?
- Is this about collaboration or individual work?

**"Which dimension matters most for this job?"**
- Functional, emotional, or social?
- Helps prioritize what to optimize for

---

### 3. Competing Solutions Questions

**Purpose:** Understand all the ways users currently get this job done (not just direct competitors)

**Questions to ask:**

**"What are users currently using to get this job done?"**
- Could be: Excel, email, paper forms, other software, manual processes
- Don't just think about direct competitors
- Good: "They use Excel spreadsheets, email chains, and WhatsApp groups"
- Bad: "They use our competitor's product"

**"Why do users switch between solutions?"**
- What makes them use one solution vs another?
- What are the trade-offs they're making?

**"What are the limitations of current solutions?"**
- What's frustrating about how they do it now?
- What forces them to use multiple tools?

**"What would make them switch to a better solution?"**
- What's the threshold for change?
- What would make the switch worth the effort?

---

### 4. Success Criteria Questions

**Purpose:** Understand how users measure if the job is done well

**Questions to ask:**

**"How do users know the job is done well?"**
- What are their success criteria?
- What does "good enough" look like?
- What does "excellent" look like?

**"What are the constraints on getting the job done?"**
- Time constraints? Budget? Skills required?
- What limits their ability to do the job well?

**"What would make them switch to a better solution?"**
- What improvement would justify the switch?
- How much better does it need to be?

**"What are the non-negotiables?"**
- What MUST work for the job to be done?
- What would cause them to abandon the solution?

---

## Conversation Flow Tips

### Start with the Job, Then the Solution

**First questions:** Job identification (what are they trying to accomplish?)
**Middle questions:** Job dimensions (functional, emotional, social)
**Last questions:** Competing solutions and success criteria

This helps PMs understand the WHY before jumping to the HOW.

### Listen for Red Flags

**Feature-first thinking:**
- "Users want a dashboard" → What job would that dashboard do?
- "We need to add X feature" → Why? What job does it serve?

**Ignoring emotional/social dimensions:**
- Only talking about functional requirements
- Missing that users want to feel confident, not just complete tasks

**Only thinking about direct competitors:**
- "Our competitor has this" → But what job are users hiring it for?
- Missing that users might use Excel, email, or manual processes

**Unclear success criteria:**
- Can't articulate how users measure success
- No understanding of what "good enough" means

---

## Example Question Sequence

**For Team Registration Feature:**

1. **Job Identification:** "What job is the tournament organizer trying to get done when they register teams?"
   - Focus on the outcome: "Register teams quickly so they can focus on event planning"

2. **Job Dimensions:** "What are the functional, emotional, and social aspects of this job?"
   - Functional: Handle 50+ teams, process payments, send confirmations
   - Emotional: Feel organized and in control, not overwhelmed
   - Social: Look professional to teams and sponsors

3. **Competing Solutions:** "What are organizers currently using to register teams?"
   - Excel spreadsheets, email chains, paper forms, other software
   - Why do they switch between these?

4. **Success Criteria:** "How do organizers know registration is going well?"
   - All teams registered by deadline
   - No duplicate entries
   - Payment confirmed
   - Can see status at a glance

5. **Switch Criteria:** "What would make them switch from Excel/email to our solution?"
   - Saves 2+ hours per tournament
   - Fewer errors than manual entry
   - Professional appearance to teams

---

## The JTBD Statement Format

After questioning, you should be able to write a clear JTBD statement:

**"When [situation], I want to [motivation], so I can [expected outcome]."**

**Example:**
"When I'm organizing a tournament, I want to register teams quickly and accurately, so I can focus on the actual event planning instead of administrative work."

---

## Coaching Notes

**If PM struggles with job identification:**
- Ask: "What are they trying to accomplish? What outcome do they want?"
- Give examples: "Is it about speed? Accuracy? Looking professional?"
- Help them move from feature to outcome

**If PM only thinks functionally:**
- Probe: "How do they want to FEEL when using this?"
- Ask: "What does this say about them to others?"
- Help them see emotional and social dimensions

**If PM only thinks about direct competitors:**
- Expand: "What else could they use? Excel? Email? Paper?"
- Ask: "Why might they use multiple tools?"
- Help them see the full competitive landscape

**If PM gives great JTBD statement:**
- Acknowledge it!
- Use it to guide solution design
- Show how it clarifies what features matter most

---

## Output Goal

After JTBD questioning, PM should have:

✅ Clear JTBD statement: "When [situation], I want [motivation], so I can [outcome]"
✅ Understanding of functional, emotional, and social job dimensions
✅ List of competing solutions (not just direct competitors)
✅ Clear success criteria from user's perspective
✅ Understanding of what would make users switch

These answers form the foundation for a user-centric PRD that solves the right problem.

---

## Using JTBD in PRDs

**In the Problem section:**
- Start with the JTBD statement
- Explain the competing solutions and their limitations
- Show why current solutions don't do the job well

**In the Solution section:**
- Connect features to job dimensions (functional, emotional, social)
- Show how your solution does the job better than alternatives
- Address all three dimensions, not just functional

**In Success Metrics:**
- Measure job completion, not just feature usage
- Track if users can accomplish the outcome they want
- Monitor if they switch from competing solutions

---

**Remember:** This is not a checklist. Use judgment. Pick the 3-5 most important questions for THIS feature. The goal is to understand the job users are hiring your product to do, not to build a feature they asked for.

