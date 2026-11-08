/**
 * Organising team page data.
 *
 * The people live in `organising-team.json`, grouped by department:
 *
 *   "Design": {
 *     "Alfred": { "designation": "Head", "picture": "organising-team/alfred.webp" }
 *   }
 *
 * Departments and people appear on the page in the order they are written; an empty department is skipped.
 * `picture` is where the image is inside src/assets/images/ (the full path from the project root, e.g.
 * src/assets/images/organising-team/alfred.webp, works too). Portraits are 4:5, ideally 480×600 WebP.
 * Without a picture, or if the file isn't there, the card draws the person's crest instead.
 */
import rawTeam from './organising-team.json';

type RawPerson = { designation?: string; picture?: string };

export interface TeamMember {
  /** Unique on the page, e.g. "design-alfred" */
  id: string;
  name: string;
  designation?: string;
  /** Image URL; undefined draws the person's crest */
  picture?: string;
}

export interface TeamDepartment {
  /** Section id, so /team#design opens at that department */
  id: string;
  name: string;
  members: TeamMember[];
}

const IMAGES_DIR = '../assets/images/';

/** Every portrait in src/assets/images/organising-team/, keyed by its lower-case path inside src/assets/images/. */
const PICTURES: Record<string, string> = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>('../assets/images/organising-team/**/*.{webp,avif,png,jpg,jpeg,WEBP,AVIF,PNG,JPG,JPEG}', {
      eager: true,
      import: 'default',
    }),
  ).map(([path, url]) => [path.slice(IMAGES_DIR.length).toLowerCase(), url]),
);

/** Accepts "organising-team/x.webp", "src/assets/images/organising-team/x.webp", "./…" and Windows backslashes. */
function pictureUrl(path: string | undefined): string | undefined {
  const clean = path?.trim().replace(/\\/g, '/').replace(/^\.?\//, '').replace(/^src\/assets\/images\//i, '');
  return clean ? PICTURES[clean.toLowerCase()] : undefined;
}

const slugify = (text: string) =>
  text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'team';

// ids already used on every page
const usedIds = new Set(['main', 'root', 'mobile-menu']);
function uniqueId(base: string) {
  let id = base;
  for (let n = 2; usedIds.has(id); n++) id = `${base}-${n}`;
  usedIds.add(id);
  return id;
}

/** Departments with at least one person, in the order of the JSON file. */
export const departments: TeamDepartment[] = Object.entries(rawTeam as Record<string, Record<string, RawPerson>>)
  .map(([department, people]) => {
    const id = uniqueId(slugify(department));
    const members = Object.entries(people ?? {}).map(([person, info]) => {
      const picture = pictureUrl(info?.picture);
      if (import.meta.env.DEV && info?.picture && !picture) {
        console.warn(`[team] ${person} (${department}): no picture at src/assets/images/${info.picture}, drawing a crest instead.`);
      }
      return { id: `${id}-${slugify(person)}`, name: person.trim(), designation: info?.designation?.trim() || undefined, picture };
    });
    return { id, name: department.trim(), members };
  })
  .filter((department) => department.members.length > 0);

/** Someone in two departments counts once. */
export const teamCounts = {
  people: new Set(departments.flatMap((d) => d.members.map((m) => m.name.toLowerCase()))).size,
  departments: departments.length,
};

export const teamPage = {
  eyebrow: 'SWISF 2027 · E-Cell, NIT Meghalaya',
  heading: { line1: 'The organising', line2: 'team' },
  intro: 'The students of E-Cell, NIT Meghalaya who are putting SWISF 2027 together, team by team.',
  stats: { people: 'People', departments: 'Teams' },
  navLabel: 'Teams',
  join: {
    title: 'Want to join E-Cell?',
    text: 'Follow E-Cell NIT Meghalaya on Instagram for recruitment calls, events and Project Sunray updates.',
    linkLabel: 'Follow on Instagram',
  },
};
