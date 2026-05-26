import React, { useState } from 'react';
import { Search, ArrowRight, Sparkles, Check, AlertCircle, ArrowLeft, Lightbulb, Package, Clock, Layers, ChevronRight, Wand2, BookMarked, TrendingUp, CircleDashed, SearchX, Inbox, AlertTriangle } from 'lucide-react';

// --- Mock data -------------------------------------------------------------

const MOCK_INVENTORY_STATS = {
  totalParts: 4827,
  uniqueParts: 312,
  setsOwned: 14,
  lastSync: '2 hours ago',
};

const MOCK_RESULTS = [
  {
    id: 'moc-1',
    title: 'Medieval Trading Post',
    designer: 'BrickwrightMOCs',
    pieces: 287,
    timeEst: '2–3 hrs',
    difficulty: 'Intermediate',
    matchPct: 94,
    ownedParts: 270,
    missingParts: 17,
    substitutable: 14,
    truly_missing: 3,
    vibeMatch: 'Strong match for "medieval market" — timber framing, red awning, period-appropriate palette.',
    illustration: 'market',
    // Element key on the illustration that gets recolored
    recolorElement: 'awning',
    recolorElementLabel: 'Awning',
    originalColor: '#C8102E',
    // 5 options total — featured 3 + 2 behind "more"
    recolorOptions: [
      { id: 'r1', color: '#C8102E', label: 'Red', reason: 'Original design', matchDelta: 0, isOriginal: true },
      { id: 'r2', color: '#1E5A3C', label: 'Dark Green', reason: 'You have 94 dark green 1×2s — full coverage', matchDelta: +4, featured: true },
      { id: 'r3', color: '#2D5F8B', label: 'Dark Blue', reason: '76 dark blue 1×2s in inventory, exact match', matchDelta: +3, featured: true },
      { id: 'r4', color: '#4A2C4A', label: 'Dark Purple', reason: '52 dark purple plates — close substitute needed for 2 bricks', matchDelta: +1 },
      { id: 'r5', color: '#3D2817', label: 'Reddish Brown', reason: 'Plenty in inventory but reads less awning-like', matchDelta: +2 },
    ],
  },
  {
    id: 'moc-2',
    title: 'Village Bakery Stall',
    designer: 'CastleFan_92',
    pieces: 198,
    timeEst: '1–2 hrs',
    difficulty: 'Beginner',
    matchPct: 88,
    ownedParts: 175,
    missingParts: 23,
    substitutable: 19,
    truly_missing: 4,
    vibeMatch: 'Simpler scope, family-build friendly. Striped awning, bread on the counter.',
    illustration: 'bakery',
    recolorElement: 'awning',
    recolorElementLabel: 'Awning stripes',
    originalColor: '#F2A900',
    recolorOptions: [
      { id: 'r1', color: '#F2A900', label: 'Yellow', reason: 'Original design', matchDelta: 0, isOriginal: true },
      { id: 'r2', color: '#C8102E', label: 'Red', reason: 'You have 38 red 1×1s — exact match', matchDelta: +6, featured: true },
      { id: 'r3', color: '#1E5A3C', label: 'Green', reason: 'Inventory-rich, full coverage available', matchDelta: +5, featured: true },
    ],
  },
  {
    id: 'moc-3',
    title: "Knight's Market Outpost",
    designer: 'OldGuardBricks',
    pieces: 412,
    timeEst: '4–5 hrs',
    difficulty: 'Advanced',
    matchPct: 76,
    ownedParts: 313,
    missingParts: 99,
    substitutable: 71,
    truly_missing: 28,
    vibeMatch: 'Largest scope. Crenellated walls, watchtower, banner. Substitution-heavy.',
    illustration: 'outpost',
    recolorElement: 'stone',
    recolorElementLabel: 'Stone walls',
    originalColor: '#9B9690',
    // Smaller inventory match here — only 2 options
    recolorOptions: [
      { id: 'r1', color: '#9B9690', label: 'Light Bluish Grey', reason: 'Original design', matchDelta: 0, isOriginal: true },
      { id: 'r2', color: '#6B6660', label: 'Dark Bluish Grey', reason: 'Heavy inventory — could push match up', matchDelta: +8, featured: true },
    ],
  },
];

const MOCK_SUBSTITUTIONS = [
  {
    missing: { id: '3001', name: 'Brick 2 × 4', color: 'Reddish Brown', qty: 4 },
    suggestion: [{ id: '3003', name: 'Brick 2 × 2', color: 'Reddish Brown', qty: 8 }],
    reasoning: 'Two 2×2s lock together to span the same footprint. Used in the back wall (steps 8–11) where the seam will be hidden behind the awning support.',
    confidence: 'High',
  },
  {
    missing: { id: '3023', name: 'Plate 1 × 2', color: 'Dark Tan', qty: 6 },
    suggestion: [{ id: '3024', name: 'Plate 1 × 1', color: 'Dark Tan', qty: 12 }],
    reasoning: 'Visual seam is acceptable on the cobblestone path. Structurally identical.',
    confidence: 'High',
  },
  {
    missing: { id: '4865', name: 'Panel 1 × 2 × 1', color: 'Red', qty: 2 },
    suggestion: [
      { id: '3023', name: 'Plate 1 × 2', color: 'Red', qty: 2 },
      { id: '3024', name: 'Plate 1 × 1', color: 'Red', qty: 4 },
    ],
    reasoning: 'Stacked plates approximate the panel height. Slightly thicker silhouette but readable as the awning trim.',
    confidence: 'Medium',
  },
  {
    missing: { id: '30374', name: 'Bar 4L (Lightsaber Blade)', color: 'Pearl Gold', qty: 1 },
    suggestion: null,
    reasoning: 'No close substitute. This is a specialty element with no functional equivalent in your inventory — the bar diameter is non-standard. Best to order this one.',
    confidence: 'None',
  },
];

const SUGGESTED_PROMPTS = [
  '🏰 medieval with a red roof',
  '🚀 spaceship I could build in an hour',
  '🏙️ modular city, AFOL difficulty',
  '👨‍👧 something to build with my kid',
  '🌊 underwater dragon cathedral',
];

// --- Saved builds (Library) -----------------------------------------------

const MOCK_LIBRARY = [
  {
    id: 'lib-1',
    mocId: 'moc-1',
    title: 'Medieval Trading Post',
    designer: 'BrickwrightMOCs',
    illustration: 'market',
    recolor: '#1E5A3C', // dark green awning — user picked this earlier
    recolorLabel: 'Dark Green',
    status: 'completed',
    statusLabel: 'Completed',
    savedDate: 'Built 3 weeks ago',
    matchAtSave: 98,
    matchNow: 98,
    note: 'Substitution on the back wall worked great. Awning came out slightly thicker than expected.',
  },
  {
    id: 'lib-2',
    mocId: 'moc-3',
    title: "Knight's Market Outpost",
    designer: 'OldGuardBricks',
    illustration: 'outpost',
    recolor: '#9B9690', // original stone
    recolorLabel: 'Original',
    status: 'in_progress',
    statusLabel: 'In progress',
    savedDate: 'Started 5 days ago',
    matchAtSave: 76,
    matchNow: 76,
    note: 'Walls done. Tower next weekend.',
  },
  {
    id: 'lib-3',
    mocId: 'moc-2',
    title: 'Village Bakery Stall',
    designer: 'CastleFan_92',
    illustration: 'bakery',
    recolor: '#F2A900',
    recolorLabel: 'Original',
    status: 'saved',
    statusLabel: 'Saved for later',
    savedDate: 'Saved 2 months ago',
    matchAtSave: 71,
    matchNow: 88, // inventory has grown
    note: null,
    inventoryGrew: true,
  },
];

// --- Brick primitive -------------------------------------------------------
// A single LEGO brick rendered with top highlight, side shadow, dark edges,
// and stud(s) on top. The grid unit is 16px wide × 12px tall (roughly the
// proportion of a real 1x1 brick viewed straight on).

const U = 16; // brick width unit (1 stud)
const H = 12; // brick height unit (1 brick row)

// Shade helpers — darken / lighten a hex color
const shade = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt;
  let g = ((n >> 8) & 0xff) + amt;
  let b = (n & 0xff) + amt;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
};

// Single brick: gx,gy = grid coords; w = studs wide; color
const Brick = ({ gx, gy, w = 1, color, noStuds = false, plate = false }) => {
  const x = gx * U;
  const h = plate ? H / 3 : H;
  const y = gy * H;
  const bw = w * U;
  const dark = shade(color, -35);
  const darker = shade(color, -55);
  const light = shade(color, 18);
  return (
    <g>
      {/* main body */}
      <rect x={x} y={y} width={bw} height={h} fill={color} />
      {/* top highlight (1px) */}
      <rect x={x} y={y} width={bw} height={1} fill={light} />
      {/* bottom shadow */}
      <rect x={x} y={y + h - 1} width={bw} height={1} fill={dark} />
      {/* right edge shadow */}
      <rect x={x + bw - 1} y={y} width={1} height={h} fill={dark} />
      {/* dark outline */}
      <rect x={x} y={y} width={bw} height={h} fill="none" stroke={darker} strokeWidth="0.5" />
      {/* studs */}
      {!noStuds && !plate && [...Array(w)].map((_, i) => {
        const cx = x + i * U + U / 2;
        const cy = y - 1.5;
        return (
          <g key={i}>
            {/* stud cylinder side */}
            <rect x={cx - 4} y={cy} width="8" height="3" fill={dark} />
            {/* stud top */}
            <ellipse cx={cx} cy={cy} rx="4" ry="1.6" fill={color} />
            <ellipse cx={cx} cy={cy - 0.3} rx="3.2" ry="1.3" fill={light} />
          </g>
        );
      })}
    </g>
  );
};

// --- Build illustrations (composed from grids of bricks) -------------------
// Grid coords: 1 unit = 1 stud wide, 1 brick tall. Canvas ~20 studs × 18 rows.

const MarketIllustration = ({ awningColor = '#C8102E' }) => {
  const wood = '#E8D4A8';
  const beam = '#5A3A1F';
  const red = awningColor;
  const counter = '#A0826D';
  const ground = '#8B6F47';
  const gold = '#F2A900';
  return (
    <svg viewBox="0 0 320 240" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="sky-m" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D8E0E8" />
          <stop offset="100%" stopColor="#B8C5D0" />
        </linearGradient>
      </defs>
      <rect width="320" height="240" fill="url(#sky-m)" />

      {/* Ground row (baseplate) */}
      <Brick gx={0} gy={17} w={20} color={ground} plate />

      {/* Back wall — wood-and-beam pattern, rows 6-15 */}
      {/* Row 6: top of wall + horizontal beam */}
      <Brick gx={5} gy={6} w={1} color={beam} />
      <Brick gx={6} gy={6} w={2} color={wood} />
      <Brick gx={8} gy={6} w={1} color={beam} />
      <Brick gx={9} gy={6} w={2} color={wood} />
      <Brick gx={11} gy={6} w={1} color={beam} />
      <Brick gx={12} gy={6} w={2} color={wood} />
      <Brick gx={14} gy={6} w={1} color={beam} />
      {/* Rows 7-9: wood with vertical beams */}
      {[7, 8, 9].map((r) => (
        <g key={r}>
          <Brick gx={5} gy={r} w={1} color={beam} noStuds />
          <Brick gx={6} gy={r} w={2} color={wood} noStuds />
          <Brick gx={8} gy={r} w={1} color={beam} noStuds />
          <Brick gx={9} gy={r} w={2} color={wood} noStuds />
          <Brick gx={11} gy={r} w={1} color={beam} noStuds />
          <Brick gx={12} gy={r} w={2} color={wood} noStuds />
          <Brick gx={14} gy={r} w={1} color={beam} noStuds />
        </g>
      ))}
      {/* Row 10: horizontal beam */}
      <Brick gx={5} gy={10} w={10} color={beam} noStuds />
      {/* Rows 11-13: lower wall */}
      {[11, 12, 13].map((r) => (
        <g key={r}>
          <Brick gx={5} gy={r} w={1} color={beam} noStuds />
          <Brick gx={6} gy={r} w={3} color={wood} noStuds />
          <Brick gx={9} gy={r} w={2} color={wood} noStuds />
          <Brick gx={11} gy={r} w={3} color={wood} noStuds />
          <Brick gx={14} gy={r} w={1} color={beam} noStuds />
        </g>
      ))}

      {/* Red awning — stepped scallop, rows 4-5 */}
      <Brick gx={4} gy={4} w={12} color={red} />
      <Brick gx={3} gy={5} w={1} color={red} noStuds />
      <Brick gx={4} gy={5} w={1} color={red} noStuds />
      <Brick gx={5} gy={5} w={1} color={red} noStuds />
      <Brick gx={6} gy={5} w={1} color={red} noStuds />
      <Brick gx={7} gy={5} w={1} color={red} noStuds />
      <Brick gx={8} gy={5} w={1} color={red} noStuds />
      <Brick gx={9} gy={5} w={1} color={red} noStuds />
      <Brick gx={10} gy={5} w={1} color={red} noStuds />
      <Brick gx={11} gy={5} w={1} color={red} noStuds />
      <Brick gx={12} gy={5} w={1} color={red} noStuds />
      <Brick gx={13} gy={5} w={1} color={red} noStuds />
      <Brick gx={14} gy={5} w={1} color={red} noStuds />
      <Brick gx={15} gy={5} w={1} color={red} noStuds />
      <Brick gx={16} gy={5} w={1} color={red} noStuds />
      {/* awning support posts */}
      <Brick gx={3} gy={6} w={1} color={beam} noStuds />
      <Brick gx={3} gy={7} w={1} color={beam} noStuds />
      <Brick gx={3} gy={8} w={1} color={beam} noStuds />
      <Brick gx={3} gy={9} w={1} color={beam} noStuds />
      <Brick gx={3} gy={10} w={1} color={beam} noStuds />
      <Brick gx={3} gy={11} w={1} color={beam} noStuds />
      <Brick gx={3} gy={12} w={1} color={beam} noStuds />
      <Brick gx={3} gy={13} w={1} color={beam} noStuds />
      <Brick gx={16} gy={6} w={1} color={beam} noStuds />
      <Brick gx={16} gy={7} w={1} color={beam} noStuds />
      <Brick gx={16} gy={8} w={1} color={beam} noStuds />
      <Brick gx={16} gy={9} w={1} color={beam} noStuds />
      <Brick gx={16} gy={10} w={1} color={beam} noStuds />
      <Brick gx={16} gy={11} w={1} color={beam} noStuds />
      <Brick gx={16} gy={12} w={1} color={beam} noStuds />
      <Brick gx={16} gy={13} w={1} color={beam} noStuds />

      {/* Counter — rows 14-15 */}
      <Brick gx={5} gy={14} w={10} color={counter} />
      <Brick gx={5} gy={15} w={10} color={counter} />

      {/* Goods on counter — small 1x1 plates */}
      {/* bread */}
      <Brick gx={6} gy={13} w={1} color="#D4A373" plate />
      <Brick gx={7} gy={13} w={1} color="#C8956A" plate />
      {/* apples (red plates) */}
      <Brick gx={9} gy={13} w={1} color={red} plate />
      <Brick gx={10} gy={13} w={1} color={red} plate />
      {/* yellow item */}
      <Brick gx={12} gy={13} w={1} color={gold} plate />
      <Brick gx={13} gy={13} w={1} color="#D4A373" plate />

      {/* Flag pole */}
      <rect x={9.5 * U} y={H} width="2" height={3 * H} fill={beam} />
      {/* flag */}
      <polygon points={`${9.5 * U + 2},${H + 2} ${9.5 * U + 24},${H + 6} ${9.5 * U + 2},${H + 12}`} fill={gold} />

      {/* Minifig customer (blue shirt) — far right */}
      <g transform={`translate(${17.2 * U}, ${13 * H})`}>
        <rect x="0" y="6" width="11" height="14" fill="#2D5F8B" />
        <rect x="0" y="6" width="11" height="1" fill={shade('#2D5F8B', 18)} />
        <rect x="0" y="19" width="11" height="1" fill={shade('#2D5F8B', -35)} />
        {/* head */}
        <rect x="1" y="-2" width="9" height="8" fill="#F2C896" />
        <rect x="1" y="-2" width="9" height="1" fill={shade('#F2C896', 18)} />
        {/* hair */}
        <rect x="1" y="-3" width="9" height="2" fill="#3D2817" />
      </g>
    </svg>
  );
};

const BakeryIllustration = ({ awningColor = '#F2A900' }) => {
  const wall = '#F4E4C1';
  const beam = '#8B6F47';
  const yellow = awningColor;
  const cream = '#FFF4D6';
  const window_blue = '#A8C8DC';
  const ground = '#A0826D';
  return (
    <svg viewBox="0 0 320 240" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="sky-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C5D4DE" />
          <stop offset="100%" stopColor="#9BB0BF" />
        </linearGradient>
      </defs>
      <rect width="320" height="240" fill="url(#sky-b)" />

      {/* Ground */}
      <Brick gx={0} gy={17} w={20} color={ground} plate />

      {/* Sign above shop — rows 4-5 */}
      <Brick gx={7} gy={4} w={6} color={cream} />
      <Brick gx={7} gy={5} w={6} color={cream} noStuds />
      <text x="160" y="68" fontFamily="Georgia, serif" fontSize="11" fontStyle="italic" fill="#3D2817" textAnchor="middle" fontWeight="bold">BAKERY</text>

      {/* Striped awning — rows 6-7 (yellow & cream alternating) */}
      <Brick gx={4} gy={6} w={1} color={yellow} />
      <Brick gx={5} gy={6} w={1} color={cream} />
      <Brick gx={6} gy={6} w={1} color={yellow} />
      <Brick gx={7} gy={6} w={1} color={cream} />
      <Brick gx={8} gy={6} w={1} color={yellow} />
      <Brick gx={9} gy={6} w={1} color={cream} />
      <Brick gx={10} gy={6} w={1} color={yellow} />
      <Brick gx={11} gy={6} w={1} color={cream} />
      <Brick gx={12} gy={6} w={1} color={yellow} />
      <Brick gx={13} gy={6} w={1} color={cream} />
      <Brick gx={14} gy={6} w={1} color={yellow} />
      <Brick gx={15} gy={6} w={1} color={cream} />
      {/* scalloped lower edge */}
      <Brick gx={4} gy={7} w={1} color={yellow} noStuds />
      <Brick gx={6} gy={7} w={1} color={yellow} noStuds />
      <Brick gx={8} gy={7} w={1} color={yellow} noStuds />
      <Brick gx={10} gy={7} w={1} color={yellow} noStuds />
      <Brick gx={12} gy={7} w={1} color={yellow} noStuds />
      <Brick gx={14} gy={7} w={1} color={yellow} noStuds />

      {/* Wall — rows 8-15 */}
      {[8, 9, 10, 11, 12, 13, 14, 15].map((r) => (
        <Brick key={r} gx={5} gy={r} w={10} color={wall} noStuds />
      ))}
      {/* Wall studs visible on top row */}
      <Brick gx={5} gy={8} w={10} color={wall} />

      {/* Window (right side) — rows 10-12 */}
      <Brick gx={11} gy={10} w={3} color={beam} noStuds />
      <rect x={11 * U + 2} y={10 * H + 2} width={3 * U - 4} height={2 * H - 4} fill={window_blue} />
      {/* window frame cross */}
      <rect x={11 * U + 2} y={11 * H} width={3 * U - 4} height={1} fill={beam} />
      <rect x={12.5 * U - 0.5} y={10 * H + 2} width={1} height={2 * H - 4} fill={beam} />
      <Brick gx={11} gy={11} w={3} color={beam} noStuds />
      <rect x={11 * U + 2} y={11 * H + 2} width={3 * U - 4} height={H - 4} fill={window_blue} />

      {/* Counter — rows 13-14 */}
      <Brick gx={6} gy={13} w={5} color={beam} />
      <Brick gx={6} gy={14} w={5} color={beam} noStuds />

      {/* Pastries on counter (rows 12 — 1x1 plates) */}
      <Brick gx={6} gy={12} w={1} color="#D4A373" plate />
      <Brick gx={7} gy={12} w={1} color="#C8956A" plate />
      <Brick gx={8} gy={12} w={1} color="#E8C39E" plate />
      <Brick gx={9} gy={12} w={1} color="#D4A373" plate />
      <Brick gx={10} gy={12} w={1} color="#C8956A" plate />

      {/* Chef minifig (white) */}
      <g transform={`translate(${12.5 * U}, ${13 * H})`}>
        <rect x="0" y="6" width="11" height="14" fill="#FFFFFF" />
        <rect x="0" y="6" width="11" height="1" fill="#E5E5E5" />
        <rect x="0" y="19" width="11" height="1" fill="#B5B5B5" />
        {/* head */}
        <rect x="1" y="-2" width="9" height="8" fill="#F2C896" />
        <rect x="1" y="-2" width="9" height="1" fill={shade('#F2C896', 18)} />
        {/* chef hat */}
        <rect x="0" y="-6" width="11" height="3" fill="#FFFFFF" />
        <ellipse cx="5.5" cy="-7" rx="6" ry="2" fill="#FFFFFF" />
      </g>
    </svg>
  );
};

const OutpostIllustration = ({ stoneColor = '#9B9690' }) => {
  const stone = stoneColor;
  const dark_stone = shade(stoneColor, -35);
  const door = '#5A3A1F';
  const grass = '#5C6B5C';
  const red = '#C8102E';
  const gold = '#F2A900';
  const pine = '#4A5F4A';
  const pine_light = '#5A6F5A';
  return (
    <svg viewBox="0 0 320 240" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="sky-o" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8C896" />
          <stop offset="100%" stopColor="#C8956A" />
        </linearGradient>
      </defs>
      <rect width="320" height="240" fill="url(#sky-o)" />

      {/* Ground / grass */}
      <Brick gx={0} gy={17} w={20} color={grass} plate />

      {/* Watchtower — rows 4-9, columns 11-14 */}
      {/* Crenellations on tower (row 4) */}
      <Brick gx={11} gy={4} w={1} color={stone} />
      <Brick gx={13} gy={4} w={1} color={stone} />
      {/* Tower body rows 5-9 */}
      {[5, 6, 7, 8, 9].map((r) => (
        <Brick key={r} gx={11} gy={r} w={4} color={stone} noStuds />
      ))}
      {/* Arrow slit on tower */}
      <rect x={12.7 * U} y={6 * H + 2} width="3" height={2 * H - 4} fill="#2A2520" />

      {/* Main wall — rows 9-15, columns 3-17 */}
      {/* Crenellations on top (row 9) */}
      <Brick gx={3} gy={9} w={1} color={stone} />
      <Brick gx={5} gy={9} w={1} color={stone} />
      <Brick gx={7} gy={9} w={1} color={stone} />
      <Brick gx={9} gy={9} w={1} color={stone} />
      <Brick gx={15} gy={9} w={1} color={stone} />
      <Brick gx={17} gy={9} w={1} color={stone} />
      {/* Wall body rows 10-15 (skip gate area 9-11 in lower rows) */}
      {[10, 11].map((r) => (
        <g key={r}>
          <Brick gx={3} gy={r} w={6} color={stone} noStuds />
          <Brick gx={15} gy={r} w={3} color={stone} noStuds />
        </g>
      ))}
      {[12, 13, 14, 15].map((r) => (
        <g key={r}>
          <Brick gx={3} gy={r} w={6} color={stone} noStuds />
          {/* gate opening 9-11 */}
          <Brick gx={15} gy={r} w={3} color={stone} noStuds />
        </g>
      ))}
      {/* Stone block dividers (subtle horizontal mortar lines) */}
      <line x1={3 * U} y1={12 * H} x2={9 * U} y2={12 * H} stroke={dark_stone} strokeWidth="0.5" opacity="0.5" />
      <line x1={3 * U} y1={14 * H} x2={9 * U} y2={14 * H} stroke={dark_stone} strokeWidth="0.5" opacity="0.5" />
      <line x1={15 * U} y1={12 * H} x2={18 * U} y2={12 * H} stroke={dark_stone} strokeWidth="0.5" opacity="0.5" />
      <line x1={15 * U} y1={14 * H} x2={18 * U} y2={14 * H} stroke={dark_stone} strokeWidth="0.5" opacity="0.5" />

      {/* Gate — arched door, columns 9-11 */}
      <Brick gx={9} gy={10} w={1} color={stone} noStuds />
      <Brick gx={11} gy={10} w={1} color={stone} noStuds />
      <Brick gx={10} gy={10} w={1} color={door} noStuds />
      {[11, 12, 13, 14, 15].map((r) => (
        <Brick key={r} gx={9} gy={r} w={3} color={door} noStuds />
      ))}
      {/* gate vertical planks */}
      <line x1={10 * U} y1={11 * H} x2={10 * U} y2={16 * H} stroke="#2A1B0F" strokeWidth="0.5" />
      <line x1={11 * U} y1={11 * H} x2={11 * U} y2={16 * H} stroke="#2A1B0F" strokeWidth="0.5" />

      {/* Banner on tower */}
      <rect x={13 * U - 1} y={2 * H} width="2" height={2.5 * H} fill={door} />
      <polygon points={`${13 * U + 1},${2.2 * H} ${15 * U},${2.5 * H} ${14.6 * U},${3.2 * H} ${15 * U},${4 * H} ${13 * U + 1},${3.7 * H}`} fill={red} />
      <circle cx={14 * U} cy={3.1 * H} r="2.5" fill={gold} />

      {/* Knight minifig */}
      <g transform={`translate(${5.5 * U}, ${13 * H})`}>
        <rect x="0" y="6" width="11" height="14" fill={stone} />
        <rect x="0" y="6" width="11" height="1" fill={shade(stone, 18)} />
        <rect x="0" y="19" width="11" height="1" fill={shade(stone, -35)} />
        {/* head */}
        <rect x="1" y="-2" width="9" height="8" fill="#F2C896" />
        {/* helmet */}
        <rect x="0" y="-3" width="11" height="4" fill={stone} />
        <rect x="0" y="-3" width="11" height="1" fill={shade(stone, 18)} />
        {/* spear */}
        <line x1="-4" y1="-8" x2="-4" y2="20" stroke={door} strokeWidth="1.5" />
        <polygon points="-7,-8 -1,-8 -4,-13" fill={stone} />
      </g>

      {/* Pine trees — left */}
      <Brick gx={1} gy={15} w={1} color={door} plate />
      <Brick gx={1} gy={16} w={1} color={door} plate />
      <polygon points={`${1.5 * U},${15 * H} ${0.5 * U},${15.5 * H} ${2.5 * U},${15.5 * H}`} fill={pine} />
      <polygon points={`${1.5 * U},${14 * H} ${0.7 * U},${15 * H} ${2.3 * U},${15 * H}`} fill={pine_light} />
      <polygon points={`${1.5 * U},${13 * H} ${0.9 * U},${14 * H} ${2.1 * U},${14 * H}`} fill={pine} />

      {/* Pine — right */}
      <Brick gx={18} gy={15} w={1} color={door} plate />
      <Brick gx={18} gy={16} w={1} color={door} plate />
      <polygon points={`${18.5 * U},${15 * H} ${17.5 * U},${15.5 * H} ${19.5 * U},${15.5 * H}`} fill={pine} />
      <polygon points={`${18.5 * U},${14 * H} ${17.7 * U},${15 * H} ${19.3 * U},${15 * H}`} fill={pine_light} />
      <polygon points={`${18.5 * U},${13 * H} ${17.9 * U},${14 * H} ${19.1 * U},${14 * H}`} fill={pine} />
    </svg>
  );
};

const BuildIllustration = ({ kind, recolor }) => {
  if (kind === 'market') return <MarketIllustration awningColor={recolor} />;
  if (kind === 'bakery') return <BakeryIllustration awningColor={recolor} />;
  if (kind === 'outpost') return <OutpostIllustration stoneColor={recolor} />;
  return null;
};

// --- Logo ------------------------------------------------------------------

const Logo = () => (
  <div className="flex items-center gap-3 group">
    <img
      src="data:image/png;base64,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"
      alt="BrickMatch logo"
      className="w-10 h-10 transition-transform group-hover:rotate-6 flex-shrink-0"
      style={{ imageRendering: 'crisp-edges' }}
    />
    <div>
      <div className="font-serif text-xl leading-none text-stone-900 tracking-tight">BrickMatch</div>
      <div className="text-[9px] tracking-[0.25em] text-stone-500 uppercase mt-1">Build with what you have</div>
    </div>
  </div>
);

// --- Screens ---------------------------------------------------------------

const ImportScreen = ({ onContinue, inventoryLoaded, setInventoryLoaded, query, setQuery }) => (
  <div className="max-w-4xl mx-auto px-8 py-16 relative">
    <svg className="absolute top-12 right-8 opacity-20 -rotate-12" width="80" height="80" viewBox="0 0 36 36">
      <rect x="4" y="10" width="28" height="22" fill="#F2A900" />
      <ellipse cx="11" cy="9" rx="4" ry="2" fill="#F2A900" />
      <ellipse cx="25" cy="9" rx="4" ry="2" fill="#F2A900" />
    </svg>

    <div className="mb-12 relative">
      <div className="flex items-center gap-2 text-xs tracking-[0.3em] text-red-800 uppercase mb-4">
        <span className="w-8 h-px bg-red-800" />
        Step 01 — Inventory
      </div>
      <h2 className="font-serif text-6xl text-stone-900 leading-[1.05] mb-5 tracking-tight">
        Start with what's<br />
        <span className="italic text-red-800">already in your bin.</span>
      </h2>
      <p className="text-stone-700 text-lg max-w-xl leading-relaxed">
        Sync your Rebrickable inventory. We'll match it against thousands of MOCs and figure out the substitutions for anything you're missing. <span className="italic">No new bricks required.</span>
      </p>
    </div>

    {!inventoryLoaded ? (
      <div className="space-y-3">
        <button
          onClick={() => setInventoryLoaded(true)}
          className="w-full bg-stone-900 text-stone-50 px-8 py-5 flex items-center justify-between hover:bg-red-800 transition-all duration-300 group shadow-[4px_4px_0_0_#1c1917] hover:shadow-[6px_6px_0_0_#7f1d1d] hover:-translate-x-0.5 hover:-translate-y-0.5"
        >
          <span className="flex items-center gap-3">
            <Package size={18} />
            <span className="font-medium">Connect Rebrickable account</span>
          </span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
        <button
          onClick={() => setInventoryLoaded(true)}
          className="w-full border-2 border-stone-900 text-stone-900 px-8 py-5 flex items-center justify-between hover:bg-stone-900 hover:text-stone-50 transition-all shadow-[4px_4px_0_0_#1c1917] hover:shadow-[2px_2px_0_0_#1c1917] hover:translate-x-0.5 hover:translate-y-0.5"
        >
          <span className="font-medium">Paste set list / inventory CSV</span>
          <ArrowRight size={18} />
        </button>
        <button
          onClick={() => setInventoryLoaded(true)}
          className="text-sm text-stone-600 hover:text-red-800 underline underline-offset-4 decoration-2 pt-3 font-medium"
        >
          ✨ Use demo inventory →
        </button>
      </div>
    ) : (
      <div className="bg-white border-2 border-stone-900 shadow-[8px_8px_0_0_#1c1917]">
        <div className="px-6 py-4 border-b-2 border-stone-900 flex items-center justify-between bg-amber-50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full" />
              <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-600 rounded-full animate-ping opacity-75" />
            </div>
            <span className="text-sm font-semibold text-stone-900">Inventory synced</span>
          </div>
          <span className="text-xs text-stone-600 italic">{MOCK_INVENTORY_STATS.lastSync}</span>
        </div>
        <div className="grid grid-cols-3 divide-x-2 divide-stone-900">
          <div className="px-6 py-5">
            <div className="font-mono text-3xl text-stone-900 font-medium">{MOCK_INVENTORY_STATS.totalParts.toLocaleString()}</div>
            <div className="text-xs text-stone-600 uppercase tracking-wider mt-1 font-medium">Total parts</div>
          </div>
          <div className="px-6 py-5">
            <div className="font-mono text-3xl text-stone-900 font-medium">{MOCK_INVENTORY_STATS.uniqueParts}</div>
            <div className="text-xs text-stone-600 uppercase tracking-wider mt-1 font-medium">Unique parts</div>
          </div>
          <div className="px-6 py-5">
            <div className="font-mono text-3xl text-stone-900 font-medium">{MOCK_INVENTORY_STATS.setsOwned}</div>
            <div className="text-xs text-stone-600 uppercase tracking-wider mt-1 font-medium">Sets owned</div>
          </div>
        </div>

        <div className="border-t-2 border-stone-900 px-6 py-7 bg-stone-50">
          <div className="flex items-center gap-2 text-xs tracking-[0.25em] text-red-800 uppercase mb-4">
            <span className="w-6 h-px bg-red-800" />
            Step 02 — Tell us what you want to build
          </div>
          <div className="flex items-center border-2 border-stone-900 bg-white focus-within:shadow-[4px_4px_0_0_#C8102E] transition-shadow">
            <Wand2 size={18} className="ml-4 text-red-800" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="a medieval market stall with a red awning…"
              className="flex-1 px-4 py-4 bg-transparent outline-none text-stone-900 placeholder:text-stone-400 placeholder:italic"
            />
            <button
              onClick={onContinue}
              disabled={!query.trim()}
              className="bg-red-800 text-stone-50 px-6 py-4 disabled:bg-stone-300 hover:bg-stone-900 transition-colors flex items-center gap-2 font-medium"
            >
              Find matches <ArrowRight size={16} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-5">
            <span className="text-xs text-stone-500 italic self-center mr-1">or try:</span>
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => setQuery(p.replace(/^[^\s]+\s/, ''))}
                className="text-xs text-stone-700 bg-white border border-stone-300 px-3 py-1.5 hover:border-red-800 hover:text-red-800 hover:bg-amber-50 transition-all"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
);

const ResultsScreen = ({ query, onSelect, onBack }) => {
  // Per-card preview color, keyed by moc.id
  const [previews, setPreviews] = useState({});

  // Trigger empty state on deliberately unmatchable demo queries
  const isEmptyDemo = /underwater|cathedral|dragon castle|sprawling|atlantis/i.test(query);

  if (isEmptyDemo) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-12">
        <button onClick={onBack} className="flex items-center gap-2 text-stone-500 hover:text-red-800 mb-8 text-sm transition-colors">
          <ArrowLeft size={16} /> Refine search
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs tracking-[0.3em] text-stone-600 uppercase mb-4">
            <span className="w-8 h-px bg-stone-600" />
            No buildable matches
          </div>
          <h2 className="font-serif text-5xl text-stone-900 mb-4 tracking-tight leading-tight">
            Nothing in your inventory<br />
            <span className="italic text-stone-600">comes close to "{query}".</span>
          </h2>
          <p className="text-stone-700 max-w-2xl">
            We searched 12,400 MOCs and couldn't find anything you could realistically build with what you own. Rather than show you a 23% match and call it a result, here's what we'd suggest.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-8">
          {/* Option 1: closest near-misses */}
          <div className="bg-white border-2 border-stone-900 p-6 shadow-[4px_4px_0_0_#1c1917]">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-red-800" />
              <span className="text-[10px] tracking-[0.3em] text-red-800 uppercase font-semibold">Option 1 — Lower the bar</span>
            </div>
            <h3 className="font-serif text-2xl text-stone-900 mb-2 tracking-tight">Show me what's close, even if it needs more parts</h3>
            <p className="text-stone-700 text-sm mb-4">
              We found 4 builds in the 40–60% match range. You'd need to buy roughly 80–150 parts to complete one. We can break down the order for you.
            </p>
            <button className="text-sm text-red-800 font-semibold underline underline-offset-4 decoration-2">
              See lower-match builds →
            </button>
          </div>

          {/* Option 2: refine the search */}
          <div className="bg-white border-2 border-stone-900 p-6 shadow-[4px_4px_0_0_#1c1917]">
            <div className="flex items-center gap-2 mb-3">
              <Wand2 size={14} className="text-red-800" />
              <span className="text-[10px] tracking-[0.3em] text-red-800 uppercase font-semibold">Option 2 — Refine the search</span>
            </div>
            <h3 className="font-serif text-2xl text-stone-900 mb-2 tracking-tight">Your inventory is strongest in these themes</h3>
            <p className="text-stone-700 text-sm mb-4">
              Based on what you own, you have great coverage for medieval, modular city, and pirate themes. Browsing one of those gets you to 85%+ matches immediately.
            </p>
            <div className="flex gap-2 flex-wrap">
              {['🏰 Medieval (94% avg)', '🏙️ Modular city (87% avg)', '🏴‍☠️ Pirate (82% avg)'].map((t) => (
                <button key={t} className="text-xs text-stone-700 bg-amber-50 border border-stone-300 px-3 py-1.5 hover:border-red-800 hover:text-red-800 transition-all">
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Option 3: notify when buildable */}
          <div className="bg-amber-50 border-2 border-stone-900 p-6 shadow-[4px_4px_0_0_#F2A900]">
            <div className="flex items-center gap-2 mb-3">
              <BookMarked size={14} className="text-amber-700" />
              <span className="text-[10px] tracking-[0.3em] text-stone-900 uppercase font-semibold">Option 3 — Save and wait</span>
            </div>
            <h3 className="font-serif text-2xl text-stone-900 mb-2 tracking-tight">Tell us when this becomes buildable</h3>
            <p className="text-stone-700 text-sm mb-4">
              We'll keep matching "{query}" against new MOCs as they're added, and against your inventory as it grows. You'll get a notification when something hits 80%+.
            </p>
            <button className="text-sm text-red-800 font-semibold underline underline-offset-4 decoration-2">
              Save this search →
            </button>
          </div>
        </div>

        <div className="border-t-2 border-stone-900 pt-5">
          <div className="flex items-start gap-2 text-xs text-stone-500 italic">
            <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
            <span>We could have shown you a low-confidence match and called it a day. We'd rather be useful than impressive.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      <button onClick={onBack} className="flex items-center gap-2 text-stone-500 hover:text-red-800 mb-8 text-sm transition-colors">
        <ArrowLeft size={16} /> Refine search
      </button>

      <div className="mb-10 relative">
        <div className="flex items-center gap-2 text-xs tracking-[0.3em] text-red-800 uppercase mb-4">
          <span className="w-8 h-px bg-red-800" />
          Step 03 — Your matches
        </div>
        <h2 className="font-serif text-5xl text-stone-900 mb-4 tracking-tight leading-tight">
          Three builds for{' '}
          <span className="italic text-red-800 relative">
            "{query}"
            <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 200 6" preserveAspectRatio="none">
              <path d="M 0 3 Q 50 0, 100 3 T 200 3" stroke="#F2A900" strokeWidth="2" fill="none" />
            </svg>
          </span>
        </h2>
        <p className="text-stone-700 max-w-2xl">
          Ranked by part match. Tap any build for substitution reasoning, or try a color variation right here.
        </p>
      </div>

      <div className="space-y-5">
        {MOCK_RESULTS.map((moc) => {
          const previewOption = previews[moc.id]
            ? moc.recolorOptions.find((o) => o.id === previews[moc.id])
            : moc.recolorOptions.find((o) => o.isOriginal);
          const currentColor = previewOption?.color || moc.originalColor;
          const currentMatch = moc.matchPct + (previewOption?.matchDelta || 0);
          const featuredOptions = moc.recolorOptions.filter((o) => o.featured || o.isOriginal);

          return (
            <div
              key={moc.id}
              className="w-full bg-white border-2 border-stone-900 hover:shadow-[8px_8px_0_0_#1c1917] shadow-[4px_4px_0_0_#1c1917] hover:-translate-x-1 hover:-translate-y-1 transition-all block cursor-pointer"
              onClick={() => onSelect(moc)}
            >
              <div className="grid grid-cols-12 gap-0 items-stretch">
                <div className="col-span-4 aspect-[4/3] overflow-hidden border-r-2 border-stone-900 bg-amber-50">
                  <BuildIllustration kind={moc.illustration} recolor={currentColor} />
                </div>
                <div className="col-span-5 py-6 px-6">
                  <h3 className="font-serif text-3xl text-stone-900 leading-none tracking-tight mb-2">{moc.title}</h3>
                  <p className="text-xs text-stone-500 italic mb-4">designed by {moc.designer}</p>
                  <p className="text-stone-700 text-sm mb-4 leading-relaxed">{moc.vibeMatch}</p>
                  <div className="flex gap-2 flex-wrap mb-4">
                    <span className="flex items-center gap-1.5 text-xs bg-stone-100 px-2.5 py-1 border border-stone-300">
                      <Layers size={11} /> {moc.pieces} pcs
                    </span>
                    <span className="flex items-center gap-1.5 text-xs bg-stone-100 px-2.5 py-1 border border-stone-300">
                      <Clock size={11} /> {moc.timeEst}
                    </span>
                    <span className="text-xs bg-stone-100 px-2.5 py-1 border border-stone-300">{moc.difficulty}</span>
                  </div>
                  {/* Recolor quick-swatches */}
                  <div
                    className="flex items-center gap-2 pt-3 border-t border-stone-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-[10px] tracking-[0.2em] text-stone-500 uppercase font-semibold mr-1">
                      {moc.recolorElementLabel}:
                    </span>
                    {featuredOptions.map((opt) => {
                      const isActive = (previews[moc.id] || moc.recolorOptions.find((o) => o.isOriginal)?.id) === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setPreviews((p) => ({ ...p, [moc.id]: opt.id }))}
                          title={`${opt.label} — ${opt.reason}`}
                          className={`w-6 h-6 border-2 transition-all ${
                            isActive ? 'border-stone-900 scale-110 shadow-[2px_2px_0_0_#1c1917]' : 'border-stone-400 hover:border-stone-900'
                          }`}
                          style={{ backgroundColor: opt.color }}
                        />
                      );
                    })}
                    {moc.recolorOptions.length > featuredOptions.length && (
                      <span className="text-[10px] text-stone-500 italic ml-1">
                        +{moc.recolorOptions.length - featuredOptions.length} more on build page
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-span-3 border-l-2 border-stone-900 py-6 px-5 flex flex-col justify-between bg-gradient-to-br from-amber-50 to-stone-50">
                  <div className="text-center">
                    <div className="font-serif text-6xl text-red-800 leading-none font-medium transition-all">
                      {currentMatch}<span className="text-2xl text-stone-400">%</span>
                    </div>
                    <div className="text-[10px] text-stone-600 uppercase tracking-[0.2em] mt-2 font-medium">
                      Match
                      {previewOption?.matchDelta > 0 && (
                        <span className="text-emerald-700 ml-1 not-italic">+{previewOption.matchDelta}</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs mt-4">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <Check size={12} /> {moc.ownedParts} owned
                    </div>
                    {moc.substitutable > 0 && (
                      <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                        <Sparkles size={12} /> {moc.substitutable} substitutable
                      </div>
                    )}
                    {moc.truly_missing > 0 && (
                      <div className="flex items-center gap-1.5 text-stone-500">
                        <AlertCircle size={12} /> {moc.truly_missing} to buy
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BuildDetailScreen = ({ moc, onBack }) => {
  const [expandedSub, setExpandedSub] = useState(0);
  const originalOption = moc.recolorOptions.find((o) => o.isOriginal);
  const [selectedRecolor, setSelectedRecolor] = useState(originalOption?.id);
  const [showAllOptions, setShowAllOptions] = useState(false);

  const currentOption = moc.recolorOptions.find((o) => o.id === selectedRecolor) || originalOption;
  const currentColor = currentOption?.color || moc.originalColor;
  const currentMatch = moc.matchPct + (currentOption?.matchDelta || 0);
  const isRecolored = !currentOption?.isOriginal;

  const featuredOptions = moc.recolorOptions.filter((o) => o.featured || o.isOriginal);
  const hiddenOptions = moc.recolorOptions.filter((o) => !o.featured && !o.isOriginal);
  const visibleOptions = showAllOptions ? moc.recolorOptions : featuredOptions;

  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      <button onClick={onBack} className="flex items-center gap-2 text-stone-500 hover:text-red-800 mb-8 text-sm transition-colors">
        <ArrowLeft size={16} /> Back to matches
      </button>

      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-5">
          <div className="aspect-[4/3] mb-6 overflow-hidden border-2 border-stone-900 shadow-[6px_6px_0_0_#1c1917] relative">
            <BuildIllustration kind={moc.illustration} recolor={currentColor} />
            {isRecolored && (
              <div className="absolute top-2 left-2 bg-stone-900 text-amber-300 text-[10px] px-2 py-1 uppercase tracking-wider font-semibold">
                Recolored
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs tracking-[0.25em] text-red-800 uppercase mb-3">
            <span className="w-6 h-px bg-red-800" />
            {moc.difficulty}
          </div>
          <h2 className="font-serif text-4xl text-stone-900 leading-tight mb-2 tracking-tight">{moc.title}</h2>
          <p className="text-sm text-stone-500 italic mb-6">designed by {moc.designer}</p>

          <div className="grid grid-cols-3 border-y-2 border-stone-900 divide-x-2 divide-stone-900 mb-8">
            <div className="py-4 px-3">
              <div className="font-mono text-xl text-stone-900 font-medium">{moc.pieces}</div>
              <div className="text-[10px] text-stone-600 uppercase tracking-wider mt-1 font-medium">Pieces</div>
            </div>
            <div className="py-4 px-3">
              <div className="font-mono text-xl text-stone-900 font-medium">{moc.timeEst}</div>
              <div className="text-[10px] text-stone-600 uppercase tracking-wider mt-1 font-medium">Build time</div>
            </div>
            <div className="py-4 px-3">
              <div className="font-mono text-xl text-red-800 font-medium transition-all">
                {currentMatch}%
                {isRecolored && currentOption.matchDelta > 0 && (
                  <span className="text-[10px] text-emerald-700 ml-1">+{currentOption.matchDelta}</span>
                )}
              </div>
              <div className="text-[10px] text-stone-600 uppercase tracking-wider mt-1 font-medium">Match</div>
            </div>
          </div>

          <div className="border-2 border-stone-900 bg-amber-50 p-5 shadow-[4px_4px_0_0_#F2A900]">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={14} className="text-amber-700" />
              <span className="text-xs tracking-[0.25em] text-stone-900 uppercase font-semibold">Build coach preview</span>
            </div>
            <p className="text-sm text-stone-800 leading-relaxed mb-4 italic">
              "Step 14 is the tricky one — the awning supports use a SNOT technique that's easy to get backwards. I'll walk you through it, and warn you if your substitution affects the angle."
            </p>
            <button className="text-xs text-red-800 font-semibold hover:underline underline-offset-4">
              Start guided build →
            </button>
          </div>
        </div>

        <div className="col-span-7">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-red-800" />
            <span className="text-xs tracking-[0.3em] text-red-800 uppercase font-semibold">Substitution intelligence</span>
          </div>
          <h3 className="font-serif text-4xl text-stone-900 mb-4 leading-tight tracking-tight">
            You're missing 17 parts.<br />
            <span className="italic text-red-800">We can work around 14 of them — and we won't fake the rest.</span>
          </h3>
          <p className="text-stone-700 mb-8 max-w-xl">
            Each substitution comes with our reasoning and a confidence score. Where we can't find a confident match, we'll say so rather than guess.
          </p>

          <div className="space-y-3 mb-12">
            {MOCK_SUBSTITUTIONS.map((sub, i) => {
              const noSub = !sub.suggestion;
              return (
                <div
                  key={i}
                  className={`border-2 transition-all bg-white ${
                    noSub
                      ? 'border-stone-400 border-dashed shadow-none'
                      : expandedSub === i
                      ? 'border-red-800 shadow-[4px_4px_0_0_#C8102E]'
                      : 'border-stone-900 shadow-[3px_3px_0_0_#1c1917] hover:shadow-[5px_5px_0_0_#1c1917] hover:-translate-x-0.5 hover:-translate-y-0.5'
                  }`}
                >
                  <button
                    onClick={() => setExpandedSub(expandedSub === i ? -1 : i)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-mono text-[10px] text-stone-400">#{sub.missing.id}</span>
                          <span className={`text-sm font-semibold ${noSub ? 'text-stone-600' : 'text-stone-900'}`}>{sub.missing.name}</span>
                        </div>
                        <div className="text-xs text-stone-500 mt-0.5">{sub.missing.color} × {sub.missing.qty}</div>
                      </div>
                      {noSub ? (
                        <>
                          <AlertTriangle size={14} className="text-stone-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-stone-600 italic">No confident substitute</div>
                            <div className="text-xs text-stone-500 mt-0.5">Order from Bricklink</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <ArrowRight size={14} className="text-red-800 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            {sub.suggestion.map((s, j) => (
                              <div key={j}>
                                <div className="flex items-baseline gap-2 flex-wrap">
                                  <span className="font-mono text-[10px] text-stone-400">#{s.id}</span>
                                  <span className="text-sm font-semibold text-stone-900">{s.name}</span>
                                </div>
                                <div className="text-xs text-stone-500 mt-0.5">{s.color} × {s.qty}</div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="ml-4 flex items-center gap-3 flex-shrink-0">
                      <span className={`text-[10px] px-2 py-1 font-semibold tracking-wider uppercase border ${
                        sub.confidence === 'High' ? 'bg-emerald-100 text-emerald-900 border-emerald-700' :
                        sub.confidence === 'Medium' ? 'bg-amber-100 text-amber-900 border-amber-700' :
                        'bg-stone-100 text-stone-600 border-stone-400'
                      }`}>
                        {sub.confidence === 'None' ? 'No match' : sub.confidence}
                      </span>
                      <ChevronRight size={14} className={`text-stone-600 transition-transform ${expandedSub === i ? 'rotate-90' : ''}`} />
                    </div>
                  </button>
                  {expandedSub === i && (
                    <div className={`px-5 pb-5 border-t-2 pt-4 ${noSub ? 'border-stone-200 bg-stone-50' : 'border-red-800/20 bg-amber-50/50'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {noSub ? (
                          <>
                            <AlertTriangle size={11} className="text-stone-500" />
                            <span className="text-[10px] tracking-[0.25em] text-stone-700 uppercase font-semibold">Why we won't guess</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={11} className="text-red-800" />
                            <span className="text-[10px] tracking-[0.25em] text-stone-700 uppercase font-semibold">Why this works</span>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-stone-800 leading-relaxed italic">{sub.reasoning}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* --- Recolor section ---------------------------------------- */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <Wand2 size={14} className="text-red-800" />
              <span className="text-[10px] tracking-[0.3em] text-red-800 uppercase font-semibold">Recolor this build</span>
            </div>
            <h3 className="font-serif text-3xl text-stone-900 mb-3 leading-tight tracking-tight">
              Try a different{' '}
              <span className="italic text-red-800">{moc.recolorElementLabel.toLowerCase()}</span>.
            </h3>
            <p className="text-stone-700 mb-6 max-w-xl text-sm">
              We checked your inventory for color swaps that work. Match % updates live.
            </p>

            <div className="grid grid-cols-1 gap-2 mb-4">
              {visibleOptions.map((opt) => {
                const isActive = selectedRecolor === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedRecolor(opt.id)}
                    className={`flex items-center gap-4 p-3 border-2 transition-all text-left ${
                      isActive
                        ? 'border-red-800 bg-amber-50 shadow-[3px_3px_0_0_#C8102E]'
                        : 'border-stone-300 bg-white hover:border-stone-900'
                    }`}
                  >
                    <div
                      className="w-12 h-12 border-2 border-stone-900 flex-shrink-0 relative"
                      style={{ backgroundColor: opt.color }}
                    >
                      {/* tiny stud */}
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-1.5 rounded-full opacity-40" style={{ backgroundColor: shade(opt.color, 30) }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-semibold text-stone-900 text-sm">{opt.label}</span>
                        {opt.isOriginal && (
                          <span className="text-[10px] tracking-wider text-stone-500 uppercase">Original</span>
                        )}
                      </div>
                      <div className="text-xs text-stone-600 italic mt-0.5">{opt.reason}</div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {opt.matchDelta > 0 && (
                        <div className="font-mono text-sm text-emerald-700 font-semibold">+{opt.matchDelta}%</div>
                      )}
                      {opt.matchDelta === 0 && !opt.isOriginal && (
                        <div className="font-mono text-sm text-stone-400">±0</div>
                      )}
                      {opt.matchDelta < 0 && (
                        <div className="font-mono text-sm text-stone-500">{opt.matchDelta}%</div>
                      )}
                      <div className="text-[10px] text-stone-500 uppercase tracking-wider">match</div>
                    </div>
                    {isActive && (
                      <Check size={16} className="text-red-800 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {hiddenOptions.length > 0 && !showAllOptions && (
              <button
                onClick={() => setShowAllOptions(true)}
                className="text-xs text-stone-700 hover:text-red-800 font-semibold underline underline-offset-4 decoration-2 decoration-amber-500"
              >
                See {hiddenOptions.length} more options your inventory supports →
              </button>
            )}
            {showAllOptions && hiddenOptions.length > 0 && (
              <button
                onClick={() => setShowAllOptions(false)}
                className="text-xs text-stone-500 hover:text-stone-900"
              >
                ← Show fewer
              </button>
            )}
          </div>

          <div className="border-t-2 border-stone-900 pt-6">
            <div className="text-xs tracking-[0.25em] text-stone-600 uppercase mb-3 font-semibold">Still need to buy</div>
            <div className="flex items-center justify-between bg-stone-900 text-stone-50 px-5 py-4">
              <div>
                <div className="text-sm font-medium">3 parts unavailable in your inventory</div>
                <div className="text-xs text-stone-400 mt-1 italic">No close substitute — best ordered from Bricklink.</div>
              </div>
              <button className="text-sm text-amber-300 underline underline-offset-4 hover:text-amber-200 font-medium">View list →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Library screen --------------------------------------------------------

const LibraryScreen = ({ onSelect }) => {
  const statusStyles = {
    completed: 'bg-emerald-100 text-emerald-900 border-emerald-700',
    in_progress: 'bg-amber-100 text-amber-900 border-amber-700',
    saved: 'bg-stone-100 text-stone-700 border-stone-400',
  };
  const StatusIcon = ({ status }) => {
    if (status === 'completed') return <Check size={11} />;
    if (status === 'in_progress') return <CircleDashed size={11} />;
    return <BookMarked size={11} />;
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      <div className="mb-10 relative">
        <div className="flex items-center gap-2 text-xs tracking-[0.3em] text-red-800 uppercase mb-4">
          <span className="w-8 h-px bg-red-800" />
          Your library
        </div>
        <h2 className="font-serif text-5xl text-stone-900 mb-4 tracking-tight leading-tight">
          Builds you've{' '}
          <span className="italic text-red-800">started, saved, and finished.</span>
        </h2>
        <p className="text-stone-700 max-w-2xl">
          We keep an eye on your inventory. When you collect new parts, saved builds that were out of reach become buildable.
        </p>
      </div>

      <div className="space-y-5">
        {MOCK_LIBRARY.map((entry) => (
          <div
            key={entry.id}
            className="w-full bg-white border-2 border-stone-900 hover:shadow-[8px_8px_0_0_#1c1917] shadow-[4px_4px_0_0_#1c1917] hover:-translate-x-1 hover:-translate-y-1 transition-all cursor-pointer"
            onClick={() => onSelect(entry.mocId)}
          >
            <div className="grid grid-cols-12 gap-0 items-stretch">
              <div className="col-span-3 aspect-[4/3] overflow-hidden border-r-2 border-stone-900 bg-amber-50">
                <BuildIllustration kind={entry.illustration} recolor={entry.recolor} />
              </div>
              <div className="col-span-6 py-5 px-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] px-2 py-1 font-semibold tracking-wider uppercase border ${statusStyles[entry.status]} flex items-center gap-1.5`}>
                    <StatusIcon status={entry.status} />
                    {entry.statusLabel}
                  </span>
                  <span className="text-xs text-stone-500 italic">{entry.savedDate}</span>
                </div>
                <h3 className="font-serif text-2xl text-stone-900 leading-tight tracking-tight mb-1">{entry.title}</h3>
                <p className="text-xs text-stone-500 italic mb-3">designed by {entry.designer}</p>
                <div className="flex items-center gap-2 text-xs text-stone-600 mb-3">
                  <div className="w-3 h-3 border border-stone-900" style={{ backgroundColor: entry.recolor }} />
                  <span>Awning: <span className="font-semibold">{entry.recolorLabel}</span></span>
                </div>
                {entry.note && (
                  <p className="text-sm text-stone-700 leading-relaxed italic border-l-2 border-amber-400 pl-3 mt-2">
                    "{entry.note}"
                  </p>
                )}
                {entry.inventoryGrew && (
                  <div className="flex items-start gap-2 mt-3 bg-amber-50 border border-amber-300 px-3 py-2">
                    <TrendingUp size={14} className="text-amber-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-stone-900">Your inventory grew since you saved this</div>
                      <div className="text-xs text-stone-700 mt-0.5">
                        Match jumped from {entry.matchAtSave}% to <span className="font-semibold text-emerald-700">{entry.matchNow}%</span>. Worth another look.
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="col-span-3 border-l-2 border-stone-900 py-5 px-5 flex flex-col justify-between bg-gradient-to-br from-amber-50 to-stone-50">
                <div className="text-center">
                  <div className="font-serif text-5xl text-red-800 leading-none font-medium">
                    {entry.matchNow}<span className="text-xl text-stone-400">%</span>
                  </div>
                  <div className="text-[10px] text-stone-600 uppercase tracking-[0.2em] mt-2 font-medium">
                    Current match
                  </div>
                  {entry.inventoryGrew && (
                    <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                      +{entry.matchNow - entry.matchAtSave} since saved
                    </div>
                  )}
                </div>
                <button className="text-xs text-stone-900 font-semibold underline underline-offset-4 decoration-2 hover:text-red-800">
                  Open build →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 border-t-2 border-stone-900 pt-6 flex items-center justify-between">
        <div className="text-xs tracking-[0.25em] text-stone-600 uppercase font-semibold">
          3 saved · 1 in progress · 1 completed
        </div>
        <div className="text-xs text-stone-500 italic">
          Inventory synced 2 hours ago — we'll notify you when more saved builds become buildable.
        </div>
      </div>
    </div>
  );
};

// --- App shell -------------------------------------------------------------

export default function BrickMatch() {
  const [screen, setScreen] = useState('import');
  const [inventoryLoaded, setInventoryLoaded] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedMoc, setSelectedMoc] = useState(null);

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: '#FBF7EE' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');
        .font-serif { font-family: 'Fraunces', Georgia, serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .font-sans { font-family: 'Inter', -apple-system, sans-serif; }
      `}</style>

      <header className="border-b-2 border-stone-900 sticky top-0 z-10 relative" style={{ background: 'rgba(251, 247, 238, 0.95)', backdropFilter: 'blur(8px)' }}>
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <button onClick={() => setScreen('import')} className="text-left">
            <Logo />
          </button>
          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => setScreen('import')}
              className={`transition-colors hover:text-red-800 ${screen === 'import' ? 'text-red-800 font-semibold' : 'text-stone-500'}`}
            >
              Inventory
            </button>
            <span className="text-stone-300">/</span>
            <button
              onClick={() => setScreen('results')}
              className={`transition-colors hover:text-red-800 ${screen === 'results' ? 'text-red-800 font-semibold' : 'text-stone-500'}`}
              disabled={!query}
              style={!query ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
            >
              Matches
            </button>
            <span className="text-stone-300">/</span>
            <button
              onClick={() => setScreen('detail')}
              className={`transition-colors hover:text-red-800 ${screen === 'detail' ? 'text-red-800 font-semibold' : 'text-stone-500'}`}
              disabled={!selectedMoc}
              style={!selectedMoc ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
            >
              Build
            </button>
            <span className="text-stone-300">/</span>
            <button
              onClick={() => setScreen('library')}
              className={`transition-colors hover:text-red-800 flex items-center gap-1.5 ${screen === 'library' ? 'text-red-800 font-semibold' : 'text-stone-500'}`}
            >
              <BookMarked size={12} /> Library
              <span className="bg-amber-400 text-stone-900 text-[9px] px-1.5 py-0.5 font-bold tracking-wider">3</span>
            </button>
          </div>
        </div>
      </header>

      <div className="relative">
        {screen === 'import' && (
          <ImportScreen
            inventoryLoaded={inventoryLoaded}
            setInventoryLoaded={setInventoryLoaded}
            query={query}
            setQuery={setQuery}
            onContinue={() => setScreen('results')}
          />
        )}
        {screen === 'results' && (
          <ResultsScreen
            query={query}
            onSelect={(moc) => { setSelectedMoc(moc); setScreen('detail'); }}
            onBack={() => setScreen('import')}
          />
        )}
        {screen === 'detail' && selectedMoc && (
          <BuildDetailScreen moc={selectedMoc} onBack={() => setScreen('results')} />
        )}
        {screen === 'library' && (
          <LibraryScreen
            onSelect={(mocId) => {
              const moc = MOCK_RESULTS.find((m) => m.id === mocId);
              if (moc) {
                setSelectedMoc(moc);
                setScreen('detail');
              }
            }}
          />
        )}
      </div>

      <footer className="border-t-2 border-stone-900 mt-20 py-6 text-center relative">
        <div className="text-[10px] text-stone-500 tracking-[0.3em] uppercase font-medium">Prototype — Inventory & Substitutions Are Mock Data</div>
      </footer>
    </div>
  );
}
