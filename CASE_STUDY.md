# BrickMatch — Case Study

A personal project building an AI-powered LEGO MOC matcher that understands what's in your inventory, suggests substitutions when you're missing parts, and is honest about what it can't do.

**Status:** Prototype complete. Production build in progress.
**Live prototype:** [brick-match.vercel.app](https://brick-match.vercel.app/)
**Source:** [github.com/chrisshkil33/BrickMatch](https://github.com/chrisshkil33/BrickMatch)

---

## TL;DR

BrickMatch matches a user's LEGO inventory against community-designed MOCs (My Own Creations), surfacing the most-buildable options, AI-suggested part substitutions for what's missing, and inventory-aware recolor variations. The prototype demonstrates four screens — inventory import, search results with empty states, build detail with substitution intelligence, and a saved-builds library — and centers on a thesis about how AI features earn their place in a product.

The project exists to answer one question: *can you build an AI feature that AFOLs would actually trust, or does it inevitably become another LLM-powered toy?*

The answer I'm betting on: yes, but only if the AI is constrained tightly to where it's strong (combinatorial reasoning, natural-language explanation) and explicitly excluded from where it's weak (counting, geometry, claiming confidence it doesn't have).

---

## The problem

I'm an adult LEGO builder. Like most AFOLs, I have nearly 100,000 parts across around 40 sets and a question that comes up whenever I want to build something new without buying another set — or add something to my LEGO city. *What can I actually make with what I already own?*

Rebrickable answers a version of this. Its existing "Build" feature shows which community MOCs are 100%-buildable from your inventory. But that's binary — can or can't — and in practice most "can't build" results are off by a handful of parts that have obvious substitutes the user already owns. A 2×4 brick can often be swapped for two 2×2s. A 1×2 plate can stand in for a 1×2 tile when the seam will be hidden. The user knows this intuitively; the existing tools don't.

There's a second problem the binary model ignores: not all inventory is available. A builder with a display-quality set isn't going to dismantle it for one slope piece. The ability to toggle individual sets in or out of the matching pool — "use everything except the sets I don't want to take apart" — is a real constraint that a strict inventory count doesn't address.

The gap is the *intelligence layer* between rigid inventory matching and creative-but-feasible building. That's where BrickMatch lives.

## Why this is an AI problem (and where it isn't)

The first instinct was the obvious one: "describe a build in natural language and get instructions." I scrapped that idea early. Generating physically valid LEGO build instructions is a genuinely hard CV/geometry problem that an LLM will fake but not solve.

The reframe: AI shouldn't *generate* the build. The build already exists in Rebrickable's MOC catalog. AI's job is to handle the parts of matching that require judgment:

1. **Translating natural-language intent to structured search.** "Something medieval-ish I can build with my kid in an hour" becomes filters plus ranking weighted by vibe match, not just part count.
2. **Proposing substitutions for missing parts.** For each missing part, given the user's inventory and the build context, suggest functionally equivalent alternatives and explain why each one works.
3. **Identifying inventory-aware recolor options.** Which color swaps are actually feasible given what's in the bin, and which would push the match percentage up?

These three are AI problems because they require *judgment under constraint*. They're the kind of work that's hard to specify with rules but easy to recognize when done well. That's the right shape for an LLM.

Other parts of the product are explicitly *not* AI: the parts-substitutability graph, the match-percentage math, the inventory diff that flags "your saved build is now more buildable." These are deterministic problems. Calling them AI would be a tell of someone who doesn't understand where LLMs belong.

## Design decisions

### Choosing a hero feature

The first version of the prototype gave three AI features equal visual weight. The demo felt scattered. I rebuilt with **substitution intelligence as the hero** — biggest visual real estate, most detailed UI, most prominent reasoning — and let recolor and "build coach" play supporting roles.

This was the most important product decision I made. The defensible wedge against Rebrickable is *trustworthy substitution reasoning that AFOLs would actually rely on*. Natural-language search is table stakes. Coaching is a future bet. Substitution is the present-day reason to switch.

### Constraining the AI's output

The substitution reasoning shown in the UI is *grounded reasoning, not freeform LLM output*. The intended architecture:

```
User picks a MOC
  ↓
For each missing part:
    LLM proposes 1-3 candidate substitutes with reasoning,
    constrained by a structured prompt containing:
      - the missing part's geometry/category
      - the user's inventory subset (relevant colors/sizes)
      - the build context (which step uses this part)
  ↓
Constraint solver validates each proposal against:
      - inventory count (do they have enough?)
      - geometric compatibility (does it physically fit?)
      - color match policy (exact, family, or substitutable)
  ↓
Confidence label assigned (High / Medium / Low / None)
  ↓
Low and None proposals labeled honestly, never hidden
```

The LLM is doing what it's good at: combinatorial proposal generation with natural-language reasoning. It is *not* doing math, counting, or geometric verification — those go to the solver. This split is the difference between an AI feature that earns user trust and one that hallucinates plausibly.

### Failure states as evidence of design maturity

This is the section I'd flag as the most differentiated thinking in the project, and the part I'd point to in interviews.

Most AI products are designed for the happy path. When the AI doesn't know the answer, they either hallucinate confidently or return a generic "no results." BrickMatch does neither.

**The "no confident substitute" state on the Build detail page** has its own visual treatment — dashed border, muted styling, an `AlertTriangle` icon instead of an arrow. When expanded, the reasoning header reads *"Why we won't guess"* instead of *"Why this works."* The product explicitly tells the user: this is a specialty part with no equivalent in your inventory, and rather than propose a bad swap, we recommend ordering it. The headline above the substitutions reads *"We can work around 14 of them — and we won't fake the rest."*

**The "no buildable matches" empty state** triggers when the user searches for something their inventory genuinely can't support. Instead of showing a 23% match and calling it a result, the product offers three concrete paths forward: lower the threshold and see near-misses with a parts-order breakdown, refine the search toward themes the inventory supports well, or save the search and get notified when new MOCs or new inventory make it buildable. There's a footer line that makes the design philosophy explicit: *"We could have shown you a low-confidence match and called it a day. We'd rather be useful than impressive."*

I built these states *into* the prototype rather than describing them in a doc because the demo moment matters: an interviewer who clicks through these screens experiences the product's honesty firsthand. Most portfolio prototypes can't do that.

### Inventory-aware recolor counts

When I added the recolor feature, the first instinct was to always surface 2-3 options. I changed this to be inventory-aware: a user with a big collection might see 5-7 options ("see 4 more your inventory supports"), while someone with a smaller collection sees 2-3. Big inventories get rewarded with creative freedom; small inventories don't get teased with options that don't work.

This is a small detail that signals understanding of how product responsiveness to user state actually matters. Static option counts are easier to build but feel ungenerous to power users and overwhelming to beginners.

### Designing for the second visit

Most prototypes only show acquisition flows. The Library screen exists to show I think about retention.

The single most important detail on that screen is the proactive callout — *"Your inventory grew since you saved this. Match jumped from 71% to 88%."* This demonstrates the product's natural engagement loop: as users collect more bricks over time, their saved-but-unbuildable wishlist becomes buildable, and the product surfaces that *without the user having to check*. It's the difference between a tool you open when you remember and one that pulls you back in.

The underlying mechanic is not AI — it's a background diff job on inventory changes. I included it deliberately because *knowing where AI is the wrong tool* is itself a senior PM signal.

### Visual direction

The visual direction went through one revision worth mentioning. The first version was "studio workshop" — restrained, monochrome, serif-heavy. It looked refined but lifeless; LEGO is play, even for adults. The current direction keeps the serif typography and structured layout (this is still a tool, not a toy) but pushes color confidently — true LEGO red as an accent, warm cream background, hard borders with offset drop shadows, hand-drawn underlines, blocky illustrations made of actual bricks. The intent: feel like a beautifully-made indie magazine about LEGO, not a tax software dashboard or a children's app.

The illustrations themselves are composed from a reusable `<Brick>` SVG primitive — top highlights, side shadows, dark outlines, real stud cylinders — which means recoloring the awning of the medieval market re-renders every brick in that element. Each MOC card has a hand-built scene (market stall, bakery, castle outpost) that reads as LEGO rather than generic flat illustration. The app logo is an isometric 2×4 brick rendered as a PNG, embedded directly in the component for self-contained deployment.

## What I deliberately didn't build (and why)

- **Photo recognition of brick piles.** Tempting "wow" feature, but it's a vision ML problem you can't fake convincingly in a prototype. Mocking it would have read as dishonest.
- **Mobile views.** Real users would build on mobile while sitting next to the pile. Worth doing in v1, but for a portfolio demo where someone clicks a link from a laptop, the surface area cost outweighs the demo value at this stage.
- **Full build coaching / step-by-step instructions.** Kept as a teaser callout. Building it out would have shifted the product story from "AI matching tool" to "AI tutor app" and diluted the pitch.
- **Social / sharing features.** Would have pulled focus from the AI thesis. Different project.

The rule I applied: a portfolio prototype should make *one* clear argument, not eight. Adding features makes the demo longer; subtracting features makes the demo sharper.

---

## Roadmap to production

I'm building this for real. The plan below assumes ~10 hours per week of focused work alongside a day job. Total estimated time to a deployed v1 with real users: 14-16 weeks.

### Phase 1: Foundation (weeks 1-4)

**Goal:** Deployed, usable v1 with real Rebrickable data and one mocked AI feature.

- Set up Next.js app, deployment pipeline (Vercel), basic auth (Clerk or similar)
- Integrate Rebrickable API: OAuth sign-in, inventory sync, MOC catalog read access
- Build the Matches screen with real data — actual match percentage calculation against real inventory, real MOC images
- Keep substitution intelligence mocked but visible: hand-curated substitutions for a small set of popular MOCs, so the UX is demonstrable without the real LLM pipeline yet
- Ship to a public URL

**Milestone:** A real AFOL could sign in, sync their inventory, and see real matches. The substitution feature looks complete but is hand-curated under the hood.

### Phase 2: The real AI pipeline (weeks 5-10)

**Goal:** Substitution intelligence works on real data via a real LLM call, validated by a real solver.

- Build the parts-substitutability graph for the 200 most-common parts. This is the hardest piece. Starts as a manually-curated dataset I build by hand (cross-referencing LDraw and Bricklink data), with structured fields for: footprint equivalence, geometric tolerance, color-substitution policy.
- Implement the LLM proposal layer: structured prompt template, schema-validated JSON output, retry logic for malformed responses, caching by `(missing_part_id, inventory_hash)` to avoid re-calling.
- Implement the constraint solver: a deterministic Python or TypeScript module that takes a proposed substitution and validates it against the user's actual inventory, the parts graph, and the build context.
- Build confidence scoring: combination of LLM-reported confidence, solver verification, and historical user acceptance rate (the third one comes online later).
- Replace the hand-curated substitutions from Phase 1 with the real pipeline, behind a feature flag for safe rollout.

**Milestone:** When a user picks a MOC, the substitutions shown are genuinely AI-proposed and solver-validated. The "No confident substitute" state actually fires when the system can't find a good answer, not just on hand-coded edge cases.

### Phase 3: Recolor and Library (weeks 11-13)

**Goal:** The remaining hero features work on real data.

- Recolor option generator: extends the substitution pipeline to ask "what colors could this element be, given the user's inventory in matching part shapes?" Same LLM-propose + solver-validate pattern.
- Live match recalculation when a recolor is picked. Solver re-runs the match against the modified MOC.
- Library: persist saved builds to a database. Implement the background inventory-diff job that re-evaluates saved builds when a user re-syncs their inventory and surfaces "match grew" notifications.

**Milestone:** Every feature in the prototype works on real data. The product is feature-complete for v1.

### Phase 4: Beta and iteration (weeks 14-16+)

**Goal:** 10-20 real AFOL users, real feedback, real iteration.

- Recruit beta users from r/lego, /r/AFOL, Eurobricks, and the Rebrickable Discord. Aim for a mix of inventory sizes and theme preferences.
- Instrument the product for usage analytics: which substitutions get accepted vs. rejected, which empty-state options get clicked, where users drop off.
- Use the substitution acceptance rate as ground-truth feedback to tune the confidence threshold. Substitutions that users reject 80%+ of the time get reclassified as Low confidence.
- Iterate based on what's actually wrong, not what I assumed would be wrong.

**Milestone:** The product is shipped, has real users, and is improving based on real signal.

### What I'm deliberately not committing to in this roadmap

- **Mobile apps.** A responsive web app is good enough for v1. Native apps wait until there's a reason.
- **Photo brick recognition.** Still the hardest piece. Wait for v2.
- **Step-by-step build coaching.** Still a v2 bet.
- **Monetization.** Free during beta. Pricing comes after I know what users actually pay for.
- **Anything that's not in the original thesis.** Scope creep is how personal projects die.

## What I'd flag to anyone reviewing this project

The parts-substitutability graph in Phase 2 is the highest-risk piece. It's possible it requires more than I estimate, or that the curated 200 parts isn't enough to feel useful. If that happens, the right call is to ship Phase 1 publicly with hand-curated substitutions, get user feedback on the UX, and let the demand for more coverage drive the parts-graph buildout. The roadmap above assumes ideal sequencing; reality will adjust.

The LLM cost-per-user is the second risk. With caching and request batching, I expect this to be small (cents per active user per month at LLM API rates as of early 2026), but it's worth measuring early in Phase 2 rather than late.

## What this project signals

For the role I'm targeting (Principal Growth PM in dev tools / AI products):

- **Scoping an AI feature** so it solves a real problem and respects the limits of what LLMs are good at
- **Choosing one hero feature** instead of building a feature buffet
- **Designing failure states** as first-class product surface, not afterthoughts
- **Designing for retention** with a proactive engagement mechanic, not just acquisition
- **Honesty about what's hard** — the case study and the prototype both call out what's mocked, what's risky, and what I'd do differently, rather than glossing over gaps
- **Shipping** — not just designing. Phases 1-4 are committed work, not theoretical

The work is the artifact. The thinking is the document. The roadmap is the commitment.

---

*Built as a personal project. Prototype data is mocked for demonstration. Real version under active development — track progress at [github.com/chrisshkil33/BrickMatch](https://github.com/chrisshkil33/BrickMatch).*
