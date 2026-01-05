# Applying Claude Code PM Course Techniques to Tournado Project

**Date:** January 2025

**Context:** Real-world application of course techniques to a football tournament registration and management project

---

## Overview

This document outlines how to apply the Claude Code PM Course techniques to the Tournado project - a real-world, halfway-through project for football tournament registration and management. Unlike the course materials which have pre-prepared context files, research, and templates, this project requires building context as you go.

---

## What You Can Do with Claude Code for Your Real Project

### 1. Create Your Own Context Files (Like TaskFlow's Company Context)

Since you don't have pre-prepared research, create your own context files:

**Create a `company-context.md` or `project-context.md`:**
- Your product vision and goals
- Target users (football clubs, tournament organizers, players)
- Current features and what's built
- Business model and revenue goals
- Competitive landscape (other tournament management tools)
- Key metrics you're tracking

**Create a `user-research.md` or `pain-points.md`:**
- Talk to your PM friend (the domain expert) - interview them!
- Document what they know about user pain points
- What problems are users facing with current solutions?
- What do tournament organizers struggle with?
- What do players/clubs need?

**Create a `product-overview.md`:**
- What you've built so far
- What's working, what's not
- Technical constraints
- Roadmap ideas

---

### 2. Use Your PM Friend as a "Research Source"

Since you have a PM friend who knows the domain:

**Option A: Interview them and document it**
- Ask them the Socratic questions about your feature ideas
- Record their answers in a doc
- Use that as your "user research" file
- @ mention it when writing PRDs

**Option B: Have them review PRDs directly**
- Write a PRD draft
- Share it with your PM friend
- Incorporate their feedback
- Or use Claude to help synthesize their feedback

---

### 3. Adapt the Workflow for a Real Project

**The Pattern:**
1. **Gather context** → Create context files (company, users, product)
2. **Define the problem** → Use Socratic questioning (with your PM friend or solo)
3. **Write the PRD** → Use templates, @ mention your context files
4. **Get feedback** → Your PM friend reviews, or use sub-agents for different perspectives
5. **Iterate** → Refine based on feedback

**For your halfway-through project:**
- Document what exists (current features, what's built)
- Document what's missing (gaps, user requests)
- Use PRDs for new features or improvements
- Use the techniques to prioritize what to build next

---

### 4. Specific Techniques You Can Use

**A. Competitive Research (No pre-prepared data needed)**
- Ask Claude: "Research competitors in football tournament management software"
- Claude will web search and synthesize findings
- Create a `competitive-analysis.md` file
- @ mention it in your PRDs

**B. User Interview Synthesis**
- Interview your PM friend (or actual users if you have them)
- Document the interviews
- Ask Claude: "Synthesize these interview notes and extract pain points"
- Create a `user-research.md` file

**C. Data Analysis (If you have usage data)**
- Export your app's analytics/data
- Ask Claude: "Analyze this data and identify patterns"
- Use insights to inform PRDs

**D. PRD Writing with Limited Context**
- Start with what you know (your vision, your PM friend's insights)
- Use Socratic questioning to fill gaps
- Generate multiple approaches
- Get feedback from your PM friend (or sub-agents)

---

### 5. Working Solo vs. With Your PM Friend

**Solo workflow:**
- Create context files yourself
- Use Socratic questioning to think through problems
- Use sub-agents for different perspectives (engineer, user researcher, executive)
- Generate multiple PRD versions and pick the best

**With PM friend workflow:**
- Interview them → document → create research files
- Share PRD drafts with them for feedback
- Use Claude to help synthesize their feedback
- Or: Have them answer Socratic questions, document answers, use in PRD

---

### 6. Practical Steps for Your Project

**Step 1: Set up your project context**
```text
Create:
- project-context.md (your product, goals, current state)
- domain-knowledge.md (what your PM friend knows)
- user-pain-points.md (from PM friend or users)
- competitive-landscape.md (Claude can help research this)
```

**Step 2: For each new feature or improvement**
- @ mention your context files
- Use Socratic questioning to refine the idea
- Write PRD using a template
- Get PM friend to review (or use sub-agents)
- Iterate

**Step 3: Build your knowledge base over time**
- As you learn more, update your context files
- Document user feedback
- Track what works and what doesn't
- These files become your "company memory"

---

### 7. Key Difference: Real Project vs. Course

**Course:** Pre-prepared context files, research, templates
**Real Project:** You create the context files, gather the research, use the same templates

**The techniques are the same:**
- @ mentions to provide context
- Socratic questioning to sharpen thinking
- Multiple strategic approaches
- Multi-perspective feedback
- Templates to structure thinking

**The difference:** You're building the context as you go, not starting with it.

---

### 8. Quick Start for Your Football Tournament Project

**Right now, you could:**
1. Create `football-tournament-context.md` with what you know
2. Interview your PM friend → create `domain-expert-insights.md`
3. Ask Claude to research competitors → create `competitive-analysis.md`
4. Pick a feature to work on
5. Use the PRD workflow with your context files

---

## Create Methods Library: Reusable Frameworks

A methods library is a collection of reusable frameworks, templates, and thinking tools stored as markdown files. You can @ mention them when writing PRDs to guide your thinking.

### What is a Methods Library?

**Example from the course:**
- `socratic-questioning.md` - Framework for sharpening feature thinking
- `prd-templates/` - Reusable PRD structures
- `frameworks/` - Strategic frameworks (SWOT, RICE, etc.)

### How to Build Your Methods Library

#### 1. Create a `methods/` or `frameworks/` folder

```text
tournado-project/
├── methods/
│   ├── socratic-questioning.md
│   ├── jobs-to-be-done.md
│   ├── rice-prioritization.md
│   ├── impact-effort-matrix.md
│   └── [other frameworks].md
```

#### 2. Structure Each Framework File

Each framework file should include:
- **What it is** - Brief description
- **When to use it** - When this framework is helpful
- **How to use it** - Step-by-step guide
- **Example questions or prompts** - Ready-to-use templates
- **Output format** - What you get from using it

#### 3. Example Frameworks to Include

**Socratic Questioning** (already in course - copy it!)
- Problem Clarity Questions
- Solution Validation Questions
- Success Criteria Questions
- Constraint & Trade-off Questions
- Strategic Fit Questions

**Jobs-to-Be-Done (JTBD)**
- Focuses on the outcome users want, not the feature
- Structure: "When [situation], I want to [motivation], so I can [expected outcome]"
- Key questions: What job is the user trying to get done? What are competing solutions?

**RICE Prioritization**
- Scoring system: (Reach × Impact × Confidence) / Effort
- Helps compare multiple feature ideas
- Justifies why one feature comes before another

**Impact-Effort Matrix**
- Simple 2x2 for quick prioritization
- High Impact / Low Effort = Quick wins
- Low Impact / High Effort = Avoid

**User Story Format**
- "As a [user], I want [goal], so that [benefit]"
- Ensures user-centric thinking

### How to Use Your Methods Library

**In PRD Writing:**

When writing a PRD, @ mention the frameworks you want to use:

```text
Please help me write a PRD for [feature].
Use @methods/socratic-questioning.md to guide the problem definition.
Use @methods/jobs-to-be-done.md to understand user needs.
Use @methods/rice-prioritization.md to justify why we're building this now.
```

Claude will:
1. Read the framework files
2. Apply the frameworks to your feature
3. Guide you through the questions
4. Structure the PRD using the frameworks

### Example Workflow:

**Step 1:** You say: "I want to build team registration for tournaments"

**Step 2:** You @ mention: `@methods/jobs-to-be-done.md @methods/socratic-questioning.md`

**Step 3:** Claude uses JTBD to help you understand the job:
- "What job is the tournament organizer trying to get done?"
- "What are they using now? (Excel? Email?)"
- "What would make them switch?"

**Step 4:** Claude uses Socratic questioning to sharpen:
- "What specific pain point does this solve?"
- "How do we know this is a real problem?"
- "What's the simplest version that solves the core problem?"

**Step 5:** You have a well-structured problem statement and solution approach

### Building Your Library Over Time

**Start with These Frameworks:**

1. **Socratic Questioning** - Already in the course, copy it!
2. **Jobs-to-Be-Done** - Great for understanding user needs
3. **RICE Prioritization** - Great for justifying what to build
4. **Impact-Effort Matrix** - Simple 2x2 for quick prioritization
5. **User Story Format** - "As a [user], I want [goal], so that [benefit]"

**Add More as You Learn:**

- **Kano Model** - Basic vs. Performance vs. Delight features
- **Pirate Metrics (AARRR)** - Acquisition, Activation, Retention, Revenue, Referral
- **North Star Framework** - Defining your key metric
- **OKR Framework** - Objectives and Key Results
- **Design Thinking** - Empathize, Define, Ideate, Prototype, Test

### Pro Tips

**1. Make Frameworks Actionable**
- Include ready-to-use questions
- Example calculations
- Template formats
- Common mistakes to avoid

**2. Include Examples**
- Show how the framework applies to your domain
- Tournament management examples
- Football-specific use cases
- Real scenarios from your project

**3. Link Frameworks Together**
- Show how frameworks complement each other
- "Use JTBD to understand the job, then Socratic questioning to refine the solution"
- "Use RICE to prioritize, then Impact-Effort to validate"

**4. Keep Them Updated**
- Update frameworks with new insights
- Add domain-specific questions
- Refine based on what helps you think better

### Example: Complete Methods Library Structure

```text
methods/
├── socratic-questioning.md          # Problem refinement
├── jobs-to-be-done.md               # User needs understanding
├── rice-prioritization.md           # Feature prioritization
├── impact-effort-matrix.md           # Quick prioritization
├── user-story-format.md             # User story writing
├── competitive-analysis.md          # How to analyze competitors
├── user-interview-guide.md          # How to conduct interviews
└── prd-section-templates.md        # Templates for PRD sections
```

### The Power of Reusable Frameworks

**Without a methods library:**
- You reinvent thinking frameworks each time
- Inconsistent approach across PRDs
- Hard to remember all the questions
- Takes longer to write PRDs

**With a methods library:**
- @ mention the framework, Claude applies it
- Consistent, structured thinking
- All questions and templates ready
- Faster, better PRDs

---

## Available Techniques from the Course

### PRD Writing Workflow
- **Templates:** Use Lenny's or Carl's PRD templates (or your own)
- **Socratic Questioning:** Use the framework to sharpen feature thinking
- **Multiple Approaches:** Generate 3 different strategic versions, pick the best
- **Multi-Perspective Feedback:** Use sub-agents (engineer, executive, user researcher) or your PM friend

### Context Management
- **@ Mentions:** Reference context files when writing PRDs
- **Company Context:** Document your product, users, business goals
- **User Research:** Document pain points, interviews, insights
- **Competitive Analysis:** Research and document competitors

### Advanced Techniques
- **Competitive Research:** Claude can web search and synthesize competitor approaches
- **User Interview Synthesis:** Claude can read interview transcripts and extract themes
- **Data Analysis:** Claude can analyze usage data to inform prioritization
- **Section-by-Section Drafting:** Iterate on PRD sections with Claude's help

---

## Recommended File Structure for Tournado Project

```text
tournado-project/
├── context/
│   ├── project-context.md          # Product vision, goals, current state
│   ├── domain-knowledge.md          # PM friend's domain expertise
│   ├── user-pain-points.md          # User research and pain points
│   ├── competitive-analysis.md      # Competitor research
│   └── product-overview.md          # What's built, what's working
├── methods/
│   ├── socratic-questioning.md       # Problem refinement framework
│   ├── jobs-to-be-done.md          # User needs framework
│   ├── rice-prioritization.md      # Prioritization framework
│   └── [other frameworks].md
├── prds/
│   └── [feature-name]-prd.md        # Individual PRDs
├── research/
│   ├── user-interviews/             # Interview transcripts
│   └── competitive-research/        # Competitor analysis
└── templates/
    └── [your-prd-template].md       # Your preferred PRD template
```

---

## Next Steps

1. **Create initial context files** with what you currently know
2. **Build your methods library** - start with Socratic questioning, JTBD, RICE
3. **Interview your PM friend** and document their insights
4. **Research competitors** (Claude can help with this)
5. **Pick a feature** to work on
6. **Use the PRD workflow** with your context files and methods library
7. **Iterate and build** your knowledge base over time

---

## Key Insight

**The course techniques work for real projects** - you just build the context yourself instead of having it pre-prepared. The pattern is always the same:
- **You think**
- **Claude augments**
- **You decide**

The context files and methods library become your "company memory" - they grow over time and make future PRDs easier to write.

---

**Remember:** As a solopreneur, you don't have a team to bounce ideas off of. But Claude Code + your PM friend + these techniques give you a structured way to think through product decisions, just like a PM at a larger company would.

