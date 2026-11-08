import { useId, useMemo } from 'react';
import { cn } from '../../lib/cn';
import { mulberry32 } from '../../lib/random';

const W = 400;
const H = 500;
const CX = 200;
const CY = 224;

/** Deep grounds in the brochure colours; line art in `line`, initials in `ink`. */
const PALETTES = [
  { sky: ['#0A1230', '#24356F'], glow: '#5E7BD8', line: '#E6CF94', ink: '#FAF6EE' }, // navy
  { sky: ['#140D33', '#4A2C8F'], glow: '#A27BE6', line: '#E6CF94', ink: '#FAF6EE' }, // night
  { sky: ['#36060F', '#A8132A'], glow: '#F07A52', line: '#F6C76B', ink: '#FFF4DC' }, // lacquer
  { sky: ['#04221C', '#1F7A6A'], glow: '#63CDB3', line: '#E6CF94', ink: '#FAF6EE' }, // jade
  { sky: ['#3F1006', '#CC5C26'], glow: '#F8C873', line: '#FFE6AE', ink: '#FFF8EA' }, // ember
  { sky: ['#0E1A3D', '#3B5BB5'], glow: '#9DB3F2', line: '#F6E7C1', ink: '#FAF6EE' }, // royal
] as const;

type Petals = 'lotus' | 'shippo' | 'rays' | 'leaf';
type Sky = 'rays' | 'stars' | 'clouds';

/** Mixed into every seed; picked so the 2027 team's crests spread evenly over the colours, with no two neighbours alike. */
const SEED_SALT = '16236';

/** FNV-1a, so the same name always draws the same crest. */
function hash(text: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** First letter of the first and last names: "Dibya Sundar Banerjee" → "DB", "Anjali" → "A". */
export function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = Array.from(words[0] ?? '')[0] ?? '';
  const last = words.length > 1 ? Array.from(words[words.length - 1])[0] : '';
  return (first + last).toUpperCase();
}

const f = (n: number) => n.toFixed(1);
/** A point in a petal's own frame (x outwards from the centre, y across), turned to angle `a`. */
const at = (x: number, y: number, a: number) => `${f(CX + x * Math.cos(a) - y * Math.sin(a))} ${f(CY + x * Math.sin(a) + y * Math.cos(a))}`;
const circle = (x: number, y: number, r: number) => `M${f(x + r)} ${f(y)}A${r} ${r} 0 1 0 ${f(x - r)} ${f(y)}A${r} ${r} 0 1 0 ${f(x + r)} ${f(y)}Z`;

/** The ring of petals between the inner disc (r 62) and the outer rings (r 127). */
function petalRing(kind: Petals, count: number, turn: number) {
  const step = (Math.PI * 2) / count;
  let shapes = '';
  let detail = '';
  for (let i = 0; i < count; i++) {
    const a = turn + i * step;
    if (kind === 'lotus') {
      shapes += `M${at(66, 0, a)}Q${at(92, 19, a)} ${at(123, 0, a)}Q${at(92, -19, a)} ${at(66, 0, a)}Z`;
      detail += `M${at(74, 0, a)}Q${at(90, 7, a)} ${at(106, 0, a)}Q${at(90, -7, a)} ${at(74, 0, a)}Z`;
    } else if (kind === 'leaf') {
      shapes += `M${at(66, 0, a)}C${at(84, -19, a)} ${at(107, -16, a)} ${at(124, 0, a)}C${at(107, 16, a)} ${at(84, 19, a)} ${at(66, 0, a)}Z`;
      detail += `M${at(72, 0, a)}L${at(116, 0, a)}`;
    } else if (kind === 'rays') {
      const long = i % 2 === 0;
      shapes += `M${at(66, long ? -8 : -5.5, a)}L${at(long ? 125 : 104, 0, a)}L${at(66, long ? 8 : 5.5, a)}Z`;
    } else {
      // shippo, the "seven treasures": a ring of overlapping circles
      const [x, y] = [CX + 95 * Math.cos(a), CY + 95 * Math.sin(a)];
      shapes += circle(x, y, (95 * Math.PI) / count + 1.5);
    }
    // beads between the petals
    if (kind !== 'shippo') detail += circle(CX + 113 * Math.cos(a + step / 2), CY + 113 * Math.sin(a + step / 2), 2.4);
  }
  return { shapes, detail };
}

/** Rolling hills along the bottom: a smooth curve through points `top` to `top + depth` down. */
function hills(rand: () => number, top: number, depth: number) {
  const xs = [-40, 50, 140, 230, 320, 410, 470];
  const ys = xs.map(() => top + rand() * depth);
  let d = `M-40 ${H}L${xs[0]} ${f(ys[0])}`;
  for (let i = 0; i < xs.length - 1; i++) {
    d += `Q${xs[i]} ${f(ys[i])} ${f((xs[i] + xs[i + 1]) / 2)} ${f((ys[i] + ys[i + 1]) / 2)}`;
  }
  return `${d}L${W + 70} ${H}Z`;
}

const CLOUD = 'M8 34H38A6 6 0 0 0 38 22A7 7 0 0 0 25 18A6 6 0 0 0 14 21A6.5 6.5 0 0 0 8 34ZM38 28.5A2.6 2.6 0 1 0 35.4 25.9M27 23.5A3 3 0 1 0 24 20.5M4 40H20M24 40H44';

function design(name: string) {
  const rand = mulberry32(hash(`${SEED_SALT}${name.trim().toLowerCase()}`));
  const pick = <T,>(list: readonly T[]) => list[Math.floor(rand() * list.length)];

  const palette = pick(PALETTES);
  const kind = pick<Petals>(['lotus', 'shippo', 'rays', 'leaf']);
  const count = kind === 'rays' ? pick([16, 20, 24]) : kind === 'shippo' ? pick([9, 10, 12]) : pick([8, 10, 12]);
  const turn = rand() * Math.PI;
  const sky = pick<Sky>(['rays', 'stars', 'clouds']);
  const waves = rand() < 0.35;

  let backdrop = '';
  const stars: { d: string; o: number }[] = [];
  if (sky === 'rays') {
    const n = 36;
    for (let i = 0; i < n; i++) {
      const a = turn + (i * Math.PI * 2) / n;
      backdrop += `M${at(152, 0, a)}L${at(470, 0, a)}`;
    }
  } else if (sky === 'stars') {
    for (let i = 0; i < 46; i++) {
      const x = 10 + rand() * (W - 20);
      const y = 10 + rand() * 400;
      if (Math.hypot(x - CX, y - CY) < 158) continue;
      const big = rand() < 0.14;
      stars.push({ d: circle(x, y, big ? 1.9 : 0.7 + rand() * 0.8), o: big ? 0.95 : 0.35 + rand() * 0.45 });
    }
  }
  const clouds =
    sky === 'clouds'
      ? [
          { x: -14 + rand() * 30, y: 20 + rand() * 40, s: 2.1 + rand() * 0.5, flip: false },
          { x: 300 + rand() * 20, y: 300 + rand() * 50, s: 1.7 + rand() * 0.4, flip: true },
        ]
      : [];

  return {
    palette,
    ring: petalRing(kind, count, turn),
    kind,
    dash: pick(['none', '4 5', '14 5 2 5']),
    backdrop,
    stars,
    clouds,
    waves,
    farHills: hills(rand, 392, 46),
    nearHills: hills(rand, 428, 40),
  };
}

type PortraitCrestProps = {
  /** Seeds the design and gives the initials */
  name: string;
  className?: string;
};

/**
 * Stand-in portrait for someone without a photo: their initials in a kamon-style crest
 * (Japanese family crest, Buddhist lotus) rising over the Meghalaya hills. The name seeds
 * the colours, petals, sky and hills, so everyone's crest is their own and never changes.
 */
export default function PortraitCrest({ name, className }: PortraitCrestProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const art = useMemo(() => design(name), [name]);
  const initials = initialsOf(name);
  const { sky, glow, line, ink } = art.palette;
  const [skyId, glowId, waveId] = [`crest-sky-${uid}`, `crest-glow-${uid}`, `crest-wave-${uid}`];

  return (
    <svg aria-hidden="true" focusable="false" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={cn('block', className)}>
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="1" stopColor={sky[1]} />
        </linearGradient>
        <radialGradient id={glowId} cx={CX} cy={CY} r="250" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={glow} stopOpacity="0.55" />
          <stop offset="0.55" stopColor={glow} stopOpacity="0.12" />
          <stop offset="1" stopColor={glow} stopOpacity="0" />
        </radialGradient>
        {art.waves && (
          // seigaiha, the blue-ocean waves
          <pattern id={waveId} width="40" height="20" patternUnits="userSpaceOnUse">
            {[
              [0, 10],
              [40, 10],
              [20, 20],
              [0, 30],
              [40, 30],
            ].map(([x, y]) => (
              <g key={`${x}-${y}`}>
                <path d={`M${x - 20} ${y}A20 20 0 0 1 ${x + 20} ${y}Z`} fill={sky[0]} />
                <path
                  d={[20, 14, 8].map((r) => `M${x - r} ${y}A${r} ${r} 0 0 1 ${x + r} ${y}`).join('')}
                  fill="none"
                  stroke={line}
                  strokeOpacity="0.45"
                  strokeWidth="1.2"
                />
              </g>
            ))}
          </pattern>
        )}
      </defs>

      <rect width={W} height={H} fill={`url(#${skyId})`} />
      <rect width={W} height={H} fill={`url(#${glowId})`} />

      {art.backdrop && <path d={art.backdrop} fill="none" stroke={line} strokeOpacity="0.1" strokeWidth="1.6" />}
      {art.stars.map((star, i) => (
        <path key={i} d={star.d} fill={ink} opacity={star.o} />
      ))}
      {art.clouds.map((cloud, i) => (
        <path
          key={i}
          d={CLOUD}
          transform={`translate(${f(cloud.x)} ${f(cloud.y)}) scale(${cloud.flip ? -cloud.s : cloud.s} ${cloud.s})${cloud.flip ? ' translate(-48 0)' : ''}`}
          fill="none"
          stroke={line}
          strokeOpacity="0.32"
          strokeWidth={f(1.6 / cloud.s)}
          strokeLinecap="round"
        />
      ))}

      {/* the crest */}
      <g fill="none" stroke={line} strokeLinecap="round" strokeLinejoin="round">
        <circle cx={CX} cy={CY} r="147" strokeOpacity="0.5" strokeWidth="2.6" strokeDasharray="0.01 9.24" />
        <circle cx={CX} cy={CY} r="134" strokeWidth="2.4" />
        <circle cx={CX} cy={CY} r="127" strokeWidth="1" strokeDasharray={art.dash === 'none' ? undefined : art.dash} />
        <path d={art.ring.shapes} fill={line} fillOpacity={art.kind === 'shippo' ? 0.06 : 0.16} strokeWidth="1.7" />
        {art.ring.detail && <path d={art.ring.detail} strokeOpacity="0.75" strokeWidth="1.2" fill={art.kind === 'leaf' ? 'none' : line} fillOpacity="0.5" />}
        <circle cx={CX} cy={CY} r="62" strokeWidth="2.2" />
        <circle cx={CX} cy={CY} r="56" fill={sky[0]} strokeOpacity="0.55" strokeWidth="1" />
      </g>
      <text
        x={CX}
        y={CY}
        dy="0.35em"
        textAnchor="middle"
        fill={ink}
        fontFamily="Poppins, ui-sans-serif, system-ui, sans-serif"
        fontWeight={600}
        fontSize={initials.length > 1 ? 44 : 54}
        letterSpacing="0.04em"
      >
        {initials}
      </text>

      {/* the hills, or the sea */}
      {art.waves ? (
        <rect y="420" width={W} height={H - 420} fill={`url(#${waveId})`} />
      ) : (
        <>
          <path d={art.farHills} fill={sky[0]} fillOpacity="0.45" />
          <path d={art.nearHills} fill={sky[0]} fillOpacity="0.85" />
        </>
      )}
    </svg>
  );
}
