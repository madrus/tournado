# RICE Prioritization Questioning Framework for PRDs

This framework helps estimate and justify feature prioritization using the RICE scoring system. Use this to move from "this seems important" to "here's why this should be #1 priority" with quantitative backing.

---

## Core Philosophy

**The goal is to make prioritization decisions transparent and data-driven, not based on gut feel or loudest voice.**

Good RICE questioning:

- ✅ Forces specificity about assumptions
- ✅ Makes trade-offs explicit and comparable
- ✅ Acknowledges uncertainty with confidence levels
- ✅ Creates defensible prioritization decisions

Bad RICE questioning:

- ❌ Uses vague estimates ("a lot of users", "big impact")
- ❌ Ignores effort (only thinks about value)
- ❌ Overconfident estimates (100% confidence on everything)
- ❌ Single-point estimates (hides uncertainty)

---

## The RICE Formula

**RICE Score = (Reach × Impact × Confidence) / Effort**

**Higher score = Higher priority**

Each component requires specific questioning to estimate accurately.

---

## The Four RICE Components

Use questions from each component to build a complete RICE estimate.

### 1. Reach Questions

**Purpose:** Estimate how many users will be affected by this feature

**Questions to ask:**

**"How many users will be exposed to this feature?"**

- Not always 100% - might be gradual rollout, specific segments, or voluntary adoption
- Good: "5,000 new signups/month × 70% see guided onboarding = 3,500/month"
- Bad: "All users"

**"Over what time period?"**

- Per month? Per quarter? Per year?
- Be consistent across features you're comparing

**"What percentage of users will actually use it?"**

- Not all users who see it will use it
- Consider adoption rates, opt-in rates, segment-specific usage

**"Are there any rollout constraints?"**

- Gradual rollout? A/B test? Specific user segments only?
- These reduce reach in the short term

---

### 2. Impact Questions

**Purpose:** Estimate how much this feature will impact each affected user

**Questions to ask:**

**"How much will this improve the desired outcome for each user?"**

- Use the scale: 0.25 (minimal), 0.5 (low), 1 (medium), 2 (high), 3 (massive)
- Good: "2 (high) - saves 15 minutes daily per user"
- Bad: "It's important"

**"What's the baseline we're improving from?"**

- Current activation rate? Current time to complete?
- Need to know starting point to estimate improvement

**"What's a realistic improvement we can expect?"**

- Be conservative - most features have smaller impact than expected
- Look at similar features you've shipped
- Consider competitor benchmarks

**"Are there secondary impacts we should consider?"**

- Retention improvements? Viral growth? Upsell opportunities?
- These can multiply the impact

---

### 3. Confidence Questions

**Purpose:** Acknowledge uncertainty in our estimates

**Questions to ask:**

**"How confident are we in our Reach estimate?"**

- 50% (low - guessing), 80% (medium - have some data), 100% (high - we know exactly)
- Good: "80% - we have historical adoption data for similar features"
- Bad: "100% - we just know"

**"How confident are we in our Impact estimate?"**

- Do we have user research? Similar features? Competitor data?
- Lower confidence = more risk = might want to validate first

**"What evidence supports our estimates?"**

- User interviews? Analytics data? A/B test results? Expert judgment?
- Push for evidence, not assumptions

**"What would increase our confidence?"**

- User research? Prototype testing? Small experiment?
- Helps identify what validation work to do first

---

### 4. Effort Questions

**Purpose:** Estimate the work required (person-months)

**Questions to ask:**

**"How many person-months will this take?"**

- Include design, engineering, QA, launch
- Good: "4 person-months (2 engineers × 2 months)"
- Bad: "A few weeks"

**"What's included in this effort estimate?"**

- Just development? Or also design, research, marketing?
- Be clear about scope

**"What are the dependencies or risks?"**

- Blocking dependencies? Technical risks? Unknown complexity?
- These can increase effort significantly

**"What's the simplest version (MVP) vs full vision?"**

- MVP effort vs full feature effort
- Helps prioritize: build MVP first, iterate later

---

## Conversation Flow Tips

### Start with Reach, Then Impact, Then Effort, Finally Confidence

**First:** Reach (how many users?)
**Second:** Impact (how much improvement?)
**Third:** Effort (how much work?)
**Last:** Confidence (how sure are we?)

This order helps build the estimate logically and surfaces assumptions early.

### Always Create Three Scenarios

**Pessimistic (20th percentile):** What if things go poorly?
**Realistic (50th percentile):** Expected case
**Optimistic (80th percentile):** What if things go great?

This acknowledges uncertainty and helps leadership understand risk.

### Listen for Red Flags

**Vague estimates:**

- "A lot of users" → How many specifically?
- "Big impact" → Use the 0.25-3 scale
- "Should be quick" → How many person-months?

**Overconfidence:**

- 100% confidence on everything → Unrealistic
- No acknowledgment of uncertainty → Risky

**Ignoring effort:**

- Only talking about value, not cost
- "This is important" without considering if it's worth the investment

**Single-point estimates:**

- One number instead of range
- Hides uncertainty and risk

---

## Example Question Sequence

**For Guided Onboarding Feature:**

1. **Reach:** "How many users will see guided onboarding?"
   - "5,000 new signups/month × 70% adoption (gradual rollout) = 3,500/month"
   - "Over 3 months: 10,500 users"

2. **Impact:** "How much will this improve activation rate?"
   - "Current: 45%. Expected: 58% (+13 percentage points)"
   - "Impact score: 2 (high) - significant improvement in key metric"

3. **Effort:** "How much work is this?"
   - "4 person-months: 2 engineers × 2 months"
   - "Includes: design (2 weeks), development (6 weeks), QA (2 weeks)"

4. **Confidence:** "How confident are we?"
   - "Reach: 80% (we have historical adoption data)"
   - "Impact: 70% (user research supports this, but haven't tested)"
   - "Effort: 90% (engineering has done similar work)"
   - "Overall: 80% confidence"

5. **Calculation:**
   - RICE = (3,500 × 2 × 0.8) / 4 = 1,400
   - Compare to other features to prioritize

---

## RICE Calculation Examples

### Example 1: Guided Onboarding

- **Reach:** 3,500 users/month
- **Impact:** 2 (high)
- **Confidence:** 80% (0.8)
- **Effort:** 4 person-months

**RICE Score = (3,500 × 2 × 0.8) / 4 = 1,400**

### Example 2: Dark Mode

- **Reach:** 10,000 users/month (everyone sees it)
- **Impact:** 0.5 (low - nice to have)
- **Confidence:** 100% (0.1) - straightforward
- **Effort:** 1 person-month

**RICE Score = (10,000 × 0.5 × 1.0) / 1 = 5,000**

Dark mode scores higher, but guided onboarding might be more strategic...

### Example 3: Enterprise SSO

- **Reach:** 500 users/month (enterprise segment only)
- **Impact:** 3 (massive - required for enterprise deals)
- **Confidence:** 90% (0.9) - we know enterprise needs this
- **Effort:** 6 person-months

**RICE Score = (500 × 3 × 0.9) / 6 = 225**

Lower score, but strategic importance might override RICE...

---

## Three Scenarios Approach

**Always create three scenarios to show range of outcomes:**

### Pessimistic Scenario (20th percentile)

- Lower reach (slow adoption)
- Lower impact (smaller improvement)
- Higher effort (complexity discovered)
- Lower confidence
- **Result:** Lower RICE score, but still positive

### Realistic Scenario (50th percentile)

- Expected reach, impact, effort, confidence
- **Result:** Most likely RICE score

### Optimistic Scenario (80th percentile)

- Higher reach (fast adoption)
- Higher impact (bigger improvement)
- Lower effort (goes smoothly)
- Higher confidence
- **Result:** Best-case RICE score

**Present all three to leadership** - shows you've thought through uncertainty.

---

## Coaching Notes

**If PM gives vague estimates:**

- Push for specificity: "How many users specifically?"
- Use the Impact scale: "Is that 0.5, 1, or 2?"
- Ask for evidence: "What data supports that estimate?"

**If PM is overconfident:**

- Challenge: "What if adoption is only 30% instead of 70%?"
- Ask: "What evidence gives you 100% confidence?"
- Suggest: "Maybe 80% confidence is more realistic?"

**If PM ignores effort:**

- Remind: "RICE includes effort in the denominator - high effort reduces score"
- Ask: "What's the simplest version we could build first?"
- Compare: "Is this worth 4 months when Feature X takes 1 month?"

**If PM gives great RICE estimate:**

- Acknowledge it!
- Help them create the three scenarios
- Show how to compare against other features

---

## Output Goal

After RICE questioning, PM should have:

✅ Specific Reach estimate (users/time period)
✅ Specific Impact estimate (0.25-3 scale)
✅ Specific Effort estimate (person-months)
✅ Confidence level for each component (50%, 80%, 100%)
✅ Calculated RICE score
✅ Three scenarios (pessimistic/realistic/optimistic)
✅ Comparison to other features

These answers form a defensible prioritization decision backed by data.

---

## Using RICE in PRDs

**In the Problem section:**

- Show why this feature is high priority using RICE score
- Compare RICE scores to other features on roadmap

**In the Solution section:**

- Reference effort estimate to set expectations
- Show MVP vs full vision if effort is high

**In Success Metrics:**

- Use Reach estimate to set adoption targets
- Use Impact estimate to set improvement targets
- Track actual vs estimated to improve future RICE estimates

**In Executive Summary:**

- Lead with RICE score and comparison
- Show three scenarios to acknowledge uncertainty
- Justify prioritization with quantitative backing

---

## Common Pitfalls

**Pitfall 1: Gaming the numbers**

- Inflating Reach or Impact to get higher score
- **Solution:** Require evidence for every estimate

**Pitfall 2: Ignoring strategic value**

- RICE is quantitative, but strategic importance matters too
- **Solution:** Use RICE as input, not the only factor

**Pitfall 3: Comparing apples to oranges**

- Different time periods, different user segments
- **Solution:** Standardize Reach (same time period), segment consistently

**Pitfall 4: Overconfidence**

- 100% confidence on everything
- **Solution:** Force acknowledgment of uncertainty, use three scenarios

---

**Remember:** RICE is a tool to make prioritization transparent and data-driven. It's not the only factor (strategic importance, dependencies, etc. also matter), but it helps make trade-offs explicit and defensible. Use judgment - don't blindly follow the highest RICE score.
