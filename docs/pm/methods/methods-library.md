# Create Methods Library: Reusable Frameworks

A methods library is a collection of reusable frameworks, templates, and thinking tools stored as markdown files. You can @ mention them when writing PRDs to guide your thinking.

## What is a Methods Library?

**Example from the course:**

- `socratic-questioning.md` - Framework for sharpening feature thinking
- `prd-templates/` - Reusable PRD structures
- `frameworks/` - Strategic frameworks (SWOT, RICE, etc.)

## How to Build Your Methods Library

### 1. Create a `methods/` or `frameworks/` folder

```text
tournado-project/
├── methods/
│   ├── socratic-questioning.md
│   ├── jobs-to-be-done.md
│   ├── rice-prioritization.md
│   ├── impact-effort-matrix.md
│   └── [other frameworks].md
```

### 2. Structure Each Framework File

Each framework file should include:

- **What it is** - Brief description
- **When to use it** - When this framework is helpful
- **How to use it** - Step-by-step guide
- **Example questions or prompts** - Ready-to-use templates
- **Output format** - What you get from using it

### 3. Example: Socratic Questioning Framework

The course already has one! Here's the structure:

```markdown
# Socratic Questioning Framework for PRDs

## Core Philosophy

[What it is and why it works]

## The Five Question Categories

1. Problem Clarity Questions
2. Solution Validation Questions
3. Success Criteria Questions
4. Constraint & Trade-off Questions
5. Strategic Fit Questions

## Example Question Sequence

[Ready-to-use questions for different scenarios]
```

### 4. Example: Jobs-to-Be-Done (JTBD) Framework

You could create `methods/jobs-to-be-done.md`:

```markdown
# Jobs-to-Be-Done Framework

## What It Is

A framework for understanding what "job" users are hiring your product to do. Focuses on the outcome users want, not the feature.

## When to Use It

- Defining user problems
- Understanding why users choose your product
- Prioritizing features based on job importance
- Writing problem statements in PRDs

## The JTBD Structure

**When [situation], I want to [motivation], so I can [expected outcome].**

## Key Questions to Ask

1. **What job is the user trying to get done?**
   - What outcome are they seeking?
   - What progress are they trying to make?

2. **What are the functional, emotional, and social aspects?**
   - Functional: What does it need to do?
   - Emotional: How should it make them feel?
   - Social: How does it affect their status/relationships?

3. **What are the competing solutions?**
   - What else are they using to get this job done?
   - Why do they switch between solutions?

4. **What are the success criteria?**
   - How do they know the job is done well?
   - What would make them switch to a better solution?

## Example for Tournament Management

**Job:** "When I'm organizing a tournament, I want to register teams quickly, so I can focus on the actual event planning instead of administrative work."

**Competing Solutions:**

- Excel spreadsheets
- Email chains
- Paper forms
- Other tournament software

**Success Criteria:**

- Registration takes <5 minutes per team
- No duplicate entries
- Payment is handled automatically
- I can see who's registered at a glance
```

### 5. Example: RICE Prioritization Framework

You could create `methods/rice-prioritization.md`:

```markdown
# RICE Prioritization Framework

## What It Is

A scoring system for prioritizing features based on:

- **Reach** - How many users will this affect?
- **Impact** - How much will it impact each user? (0.25, 0.5, 1, 2, 3)
- **Confidence** - How confident are we? (50%, 80%, 100%)
- **Effort** - How much work is it? (person-months)

**Formula:** RICE Score = (Reach × Impact × Confidence) / Effort

## When to Use It

- Comparing multiple feature ideas
- Prioritizing roadmap items
- Making trade-off decisions
- Justifying why one feature comes before another

## How to Use It

1. **Estimate Reach** - How many users per quarter?
2. **Estimate Impact** - 0.25 (minimal), 0.5 (low), 1 (medium), 2 (high), 3 (massive)
3. **Estimate Confidence** - 50% (low), 80% (medium), 100% (high)
4. **Estimate Effort** - Person-months of work
5. **Calculate Score** - Higher is better

## Example Calculation

**Feature: Voice task creation**

- Reach: 500 users/quarter
- Impact: 2 (high - saves significant time)
- Confidence: 80% (we have user research)
- Effort: 2 person-months

**RICE Score = (500 × 2 × 0.8) / 2 = 400**

**Feature: Dark mode**

- Reach: 1000 users/quarter
- Impact: 0.5 (low - nice to have)
- Confidence: 100% (straightforward)
- Effort: 1 person-month

**RICE Score = (1000 × 0.5 × 1.0) / 1 = 500**

Dark mode scores higher, but voice creation might be more strategic...

## Using RICE in PRDs

Include RICE score in your PRD to justify prioritization:

- "This feature scores 400 on RICE, making it our #2 priority"
- "Compared to alternatives, this has highest RICE score"
```

## How to Use Your Methods Library

### **In PRD Writing:**

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

### **Example Workflow:**

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

## Building Your Library Over Time

### **Start with These Frameworks:**

1. **Socratic Questioning** - Already in the course, copy it!
2. **Jobs-to-Be-Done** - Great for understanding user needs
3. **RICE Prioritization** - Great for justifying what to build
4. **Impact-Effort Matrix** - Simple 2x2 for quick prioritization
5. **User Story Format** - "As a [user], I want [goal], so that [benefit]"

### **Add More as You Learn:**

- **Kano Model** - Basic vs. Performance vs. Delight features
- **Pirate Metrics (AARRR)** - Acquisition, Activation, Retention, Revenue, Referral
- **North Star Framework** - Defining your key metric
- **OKR Framework** - Objectives and Key Results
- **Design Thinking** - Empathize, Define, Ideate, Prototype, Test

## Pro Tips

### **1. Make Frameworks Actionable**

Don't just describe the framework - include:

- Ready-to-use questions
- Example calculations
- Template formats
- Common mistakes to avoid

### **2. Include Examples**

Show how the framework applies to your domain:

- Tournament management examples
- Football-specific use cases
- Real scenarios from your project

### **3. Link Frameworks Together**

Show how frameworks complement each other:

- "Use JTBD to understand the job, then Socratic questioning to refine the solution"
- "Use RICE to prioritize, then Impact-Effort to validate"

### **4. Keep Them Updated**

As you learn what works:

- Update frameworks with new insights
- Add domain-specific questions
- Refine based on what helps you think better

## Example: Complete Methods Library Structure

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

## The Power of Reusable Frameworks

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

## Additional Framework Examples

### Impact-Effort Matrix

**What It Is:**
A simple 2x2 matrix for quick prioritization:

- **High Impact / Low Effort** = Quick wins (do these first!)
- **High Impact / High Effort** = Major projects (plan carefully)
- **Low Impact / Low Effort** = Fill-ins (do when you have time)
- **Low Impact / High Effort** = Avoid (don't do these)

**When to Use It:**

- Quick prioritization when you have many ideas
- Sprint planning
- Validating RICE scores (if RICE says high priority but effort is huge, reconsider)

### User Story Format

**What It Is:**
"As a [user type], I want [goal], so that [benefit]"

**When to Use It:**

- Writing user stories for engineering
- Ensuring features are user-centric
- Breaking down features into smaller pieces

**Example:**
"As a tournament organizer, I want to register teams via voice input, so that I can capture registrations while walking around the field without stopping to type."

### Competitive Analysis Framework

**What It Is:**
A structured way to analyze competitors and identify opportunities

**When to Use It:**

- Before building a feature (see how competitors do it)
- Positioning your product
- Finding differentiation opportunities

**Structure:**

- Competitor overview
- Feature comparison matrix
- Strengths and weaknesses
- Market gaps and opportunities
- Your differentiation strategy

---

## Getting Started

1. **Copy the Socratic Questioning framework** from the course materials
2. **Create your first custom framework** (JTBD or RICE are good starting points)
3. **Use them in your next PRD** by @ mentioning the files
4. **Build your library over time** - add frameworks as you learn them

Remember: The goal is to make your thinking more structured and consistent. Start simple, add complexity as you need it.
