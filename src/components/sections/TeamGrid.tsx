import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { departments, teamPage, type TeamDepartment, type TeamMember } from '../../data/team';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { accentLine, accentText, rotateAccent } from '../../lib/accents';
import { cn } from '../../lib/cn';
import { cssVars } from '../../lib/cssVars';
import Motif, { type MotifName } from '../ornaments/Motif';
import PortraitCrest from '../ornaments/PortraitCrest';

const MOTIFS: MotifName[] = ['sun', 'lotus', 'cloud', 'knot', 'lantern', 'blossom', 'mountains'];
const DEPARTMENT_IDS = departments.map((d) => d.id);
const pad = (n: number) => String(n).padStart(2, '0');

/** Arched window: a half circle on top (the box is 4:5), small rounded corners below. */
const ARCH = 'rounded-[50%_50%_14px_14px/40%_40%_14px_14px]';
const ARCH_INNER = 'rounded-[50%_50%_8px_8px/40%_40%_8px_8px]';

/** Heads in saffron, secretaries in royal blue, everyone else in gold. */
function designationTone(designation: string) {
  if (/\b(head|lead|convenor|coordinator|president|captain)\b/i.test(designation)) return 'text-saffron-ink';
  if (/\b(secretary|deputy|vice)\b/i.test(designation)) return 'text-royal';
  return 'text-gold-ink';
}

function onPortraitLoad(event: SyntheticEvent<HTMLImageElement>) {
  const img = event.currentTarget;
  img.dataset.loaded = 'true';
  if (import.meta.env.DEV && img.naturalWidth > 1000) {
    console.warn(`[team] ${img.src} is ${img.naturalWidth}px wide; 480×600 is plenty and keeps the page light.`);
  }
}

/** The department crossing a band 35–40% down the screen, i.e. the one being read. */
function useActiveDepartment() {
  const [active, setActive] = useState(DEPARTMENT_IDS[0]);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
        // back above the first department (e.g. after jumping to the top): highlight the first again
        const first = document.getElementById(DEPARTMENT_IDS[0]);
        if (first && first.getBoundingClientRect().top > window.innerHeight * 0.4) setActive(DEPARTMENT_IDS[0]);
      },
      { rootMargin: '-35% 0px -60% 0px' },
    );
    DEPARTMENT_IDS.forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);
  return active;
}

type TeamNavProps = {
  /** bar: sideways-scrolling chips (phones, tablets); rail: list beside the departments (desktop) */
  variant: 'bar' | 'rail';
  className?: string;
};

/** Links to every department; the one on screen is highlighted. */
function TeamNav({ variant, className }: TeamNavProps) {
  const active = useActiveDepartment();
  const reduce = useReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);

  // keep the current chip in view in the sideways-scrolling bar
  useEffect(() => {
    const list = listRef.current;
    if (variant !== 'bar' || !list || list.clientWidth === 0) return;
    const chip = list.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (chip) list.scrollTo({ left: chip.offsetLeft - (list.clientWidth - chip.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
  }, [active, variant, reduce]);

  if (variant === 'bar') {
    return (
      <nav aria-label={teamPage.navLabel} className={className}>
        <ol ref={listRef} className="no-scrollbar container-x relative flex gap-2 overflow-x-auto py-2.5">
          {departments.map((department, i) => {
            const current = department.id === active;
            return (
              <li key={department.id} className="shrink-0">
                <Link
                  to={{ hash: `#${department.id}` }}
                  data-id={department.id}
                  aria-current={current ? 'location' : undefined}
                  className={cn(
                    'inline-flex min-h-[40px] items-center gap-2 whitespace-nowrap rounded-full border px-3.5 text-[12.5px] font-medium transition-colors duration-200',
                    current ? 'border-navy bg-navy text-cream' : 'border-line bg-white text-navy hover:border-gold',
                  )}
                >
                  <span className={cn('font-display text-[15px] font-semibold leading-none lining-nums', current ? 'text-gold-soft' : 'text-gold-ink')}>{pad(i + 1)}</span>
                  {department.name}
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  return (
    <nav aria-label={teamPage.navLabel} className={className}>
      <p className="eyebrow text-[11px] text-gold-ink">{teamPage.navLabel}</p>
      <ol className="mt-3 border-l border-line">
        {departments.map((department, i) => {
          const current = department.id === active;
          return (
            <li key={department.id}>
              <Link
                to={{ hash: `#${department.id}` }}
                aria-current={current ? 'location' : undefined}
                className={cn(
                  '-ml-px flex items-baseline gap-3 border-l-2 py-[7px] pl-4 pr-1 text-[13.5px] leading-snug transition-colors duration-200',
                  current ? 'border-saffron font-semibold text-navy' : 'border-transparent text-ink-muted hover:border-gold hover:text-navy',
                )}
              >
                <span className="font-display text-[15px] font-semibold text-gold-ink lining-nums">{pad(i + 1)}</span>
                <span className="min-w-0 flex-1">{department.name}</span>
                <span className="text-[12px] font-normal text-ink-muted">{department.members.length}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Portrait in a gold-framed arched window, name and designation below. */
function MemberCard({ member, index }: { member: TeamMember; index: number }) {
  return (
    <li className="team-card group" style={cssVars({ '--i': index })}>
      <div
        className={cn(
          'relative aspect-[4/5] overflow-hidden bg-navy-deep shadow-card ring-1 ring-gold/40 transition-[transform,box-shadow] duration-500 ease-out group-hover:-translate-y-1.5 group-hover:shadow-lift',
          ARCH,
        )}
      >
        {member.picture ? (
          <img
            src={member.picture}
            alt=""
            width={480}
            height={600}
            loading="lazy"
            decoding="async"
            draggable={false}
            onLoad={onPortraitLoad}
            className="team-photo h-full w-full object-cover object-[50%_22%] group-hover:scale-[1.04]"
          />
        ) : (
          <PortraitCrest name={member.name} className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
        )}
        <span
          aria-hidden="true"
          className={cn('pointer-events-none absolute inset-[7px] border border-gold-soft/45 transition-colors duration-500 group-hover:border-gold-soft', ARCH_INNER)}
        />
      </div>
      <h3 className="mt-3.5 text-balance text-center text-[15px] font-semibold leading-snug text-navy">{member.name}</h3>
      {member.designation && (
        <p className={cn('mt-1 text-center text-[11px] font-medium uppercase tracking-[0.2em]', designationTone(member.designation))}>{member.designation}</p>
      )}
    </li>
  );
}

/** The cards rise in one after another every time the grid scrolls into view (CSS only, see .team-card). */
function MemberGrid({ members }: { members: TeamMember[] }) {
  const ref = useRef<HTMLUListElement>(null);
  const shown = useScrollReveal(ref);
  return (
    <ul
      ref={ref}
      role="list"
      data-shown={shown}
      className="mt-7 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4"
    >
      {members.map((member, i) => (
        <MemberCard key={member.id} member={member} index={i} />
      ))}
    </ul>
  );
}

function DepartmentSection({ department, index }: { department: TeamDepartment; index: number }) {
  const accent = rotateAccent(index);
  const titleId = `${department.id}-title`;
  const count = department.members.length;
  return (
    // phones: clear the sticky chip bar as well as the navbar when jumped to
    <section id={department.id} aria-labelledby={titleId} className="relative scroll-mt-[68px] border-t border-line py-10 first:border-t-0 first:pt-0 sm:py-12 lg:scroll-mt-2">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-4 select-none font-display text-[clamp(4.5rem,9vw,7rem)] font-semibold leading-none text-gold/[0.16] lining-nums"
      >
        {pad(index + 1)}
      </span>
      <header className="relative flex items-center gap-4">
        <span aria-hidden="true" className={cn('inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[1.5px] bg-cream', accentLine[accent])}>
          <Motif name={MOTIFS[index % MOTIFS.length]} strokeWidth={1.9} className="h-8 w-8" />
        </span>
        <div className="min-w-0">
          <p className={cn('eyebrow text-[11px]', accentText[accent])}>
            Team {pad(index + 1)} · {count} {count === 1 ? 'person' : 'people'}
          </p>
          <h2 id={titleId} className="mt-0.5 text-[clamp(1.2rem,2.4vw,1.55rem)] font-semibold uppercase leading-tight tracking-[0.1em] text-navy">
            {department.name}
          </h2>
        </div>
      </header>
      <MemberGrid members={department.members} />
    </section>
  );
}

/** Team page body: the department index (a sticky chip bar on phones, a rail on desktop) and a section per department. */
export default function TeamGrid() {
  return (
    <div className="relative bg-cream-2">
      <TeamNav variant="bar" className="sticky top-[var(--nav-h)] z-30 border-y border-line bg-cream-2 lg:hidden" />
      <div className="container-x pb-16 pt-10 sm:pb-20 lg:grid lg:grid-cols-[14.5rem_minmax(0,1fr)] lg:gap-12 lg:pt-14 xl:grid-cols-[16rem_minmax(0,1fr)] xl:gap-16">
        <aside className="hidden lg:block">
          <TeamNav variant="rail" className="sticky top-[calc(var(--nav-h)+28px)] max-h-[calc(100svh-var(--nav-h)-48px)] overflow-y-auto [scrollbar-width:thin]" />
        </aside>
        <div>
          {departments.map((department, i) => (
            <DepartmentSection key={department.id} department={department} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
