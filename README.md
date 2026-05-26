# BrickMatch

> An inventory-aware LEGO MOC matching tool. Tell it what you want to build; it figures out what you can build with what you already own — including smart part substitutions and recolor options.

**[→ Live prototype](https://brick-match.vercel.app/)** · **[Case study](./CASE_STUDY.md)**

## What it does

You sync your Rebrickable inventory and describe a build in natural language ("a medieval market stall with a red awning"). BrickMatch returns ranked MOC matches from a community library, showing:

- **Match percentage** — what share of the required parts you already own
- **Substitution intelligence** — for parts you're missing, AI-suggested swaps using parts you do have, with reasoning for each
- **Inventory-aware recolor options** — color variations the system has verified are buildable from your collection, with live match recalculation
- **A library of saved builds** that re-evaluates itself when your inventory grows

## Why it exists

Rebrickable can already tell you which MOCs you can build from your inventory, but the answer is binary: can or can't. In practice, most "can't build" results are off by a handful of parts that have obvious substitutes the user owns. BrickMatch closes that gap, and adds creative flexibility (recoloring) without losing build feasibility.

This is a portfolio prototype, not a production product. Substitution logic and inventory data are mocked. See [`CASE_STUDY.md`](./CASE_STUDY.md) for the design reasoning, scoping decisions, and what a v1 would actually require.

## Stack

- React (single-file artifact prototype)
- Tailwind CSS for styling
- Lucide React for icons
- Custom SVG brick illustrations for build cards, composed from a reusable `<Brick>` primitive and dynamically recolored
- Isometric 2×4 LEGO brick logo (PNG, base64 embedded for self-contained deployment)

## Running locally

```bash
# The prototype is a single .jsx file designed to render in claude.ai/artifacts
# or any React 18+ environment with Tailwind configured.

# To embed in a Vite/CRA app:
npm install lucide-react
# Drop brickmatch.jsx into src/, import and render <BrickMatch />
```

The illustrations, logo, and mock data are all self-contained — no API keys or external services required.

## What's mocked vs. real

| Component | Status |
|---|---|
| UI / interaction flow | Fully functional |
| Brick illustrations | Hand-built SVG, dynamically recolored per user selection |
| App logo | Isometric 2×4 brick PNG, base64 embedded |
| Empty / failure states | Fully designed — "no confident substitute" and "no buildable matches" |
| Inventory data | Mocked |
| Rebrickable API integration | Not implemented |
| LLM substitution reasoning | Pre-written, demonstrates intended output shape |
| Recolor feasibility solver | Logic stubbed; UI shows intended behavior |
| Match % calculation | Mock values; live delta math works |

## What a v1 would actually need

See the case study for full reasoning. Briefly:

1. Rebrickable API integration for inventory + MOC catalog
2. Parts substitutability graph (which parts are functionally interchangeable, accounting for color, geometry, clutch power)
3. LLM-based substitution proposer, constrained to a real parts catalog with schema-validated output
4. Constraint solver to verify proposed substitutions and recolors are physically achievable from the user's inventory
5. Background re-evaluation job for library entries when inventory changes

## License

MIT
