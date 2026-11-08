import { useRef } from 'react';
import { teamCounts, teamPage } from '../../data/team';
import { usePauseOffscreen } from '../../hooks/usePauseOffscreen';
import CircuitTraces from '../ornaments/CircuitTraces';
import GoldCloud from '../ornaments/GoldCloud';
import MandalaWatermark from '../ornaments/MandalaWatermark';
import { GoldDust } from '../ornaments/Particles';
import PrayerFlags from '../ornaments/PrayerFlags';
import Ridge from '../ornaments/Ridge';
import Seigaiha from '../ornaments/Seigaiha';
import { Diamond } from '../ui/DividerLabel';
import Reveal from '../ui/Reveal';
import Seal from '../ui/Seal';
import SectionHeading from '../ui/SectionHeading';
import StatCounter from './StatCounter';

/** Team page opening: prayer flags over a turning mandala, the heading and its seal, and how many people and teams there are. */
export default function TeamHero() {
  const ref = useRef<HTMLElement>(null);
  usePauseOffscreen(ref);

  return (
    <section ref={ref} aria-labelledby="team-heading" className="relative overflow-hidden bg-cream">
      <Seigaiha background="#FAF6EE" className="opacity-25" />
      <PrayerFlags count={24} sag={26} className="relative" />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[56%] w-[min(130vw,44rem)] -translate-x-1/2 -translate-y-1/2">
        <div className="motion-safe:animate-spin-slower">
          <MandalaWatermark className="block w-full" opacity={0.12} />
        </div>
      </div>
      <GoldCloud variant="a" eager className="-left-24 top-20 w-60 opacity-80 sm:-left-16 sm:w-80" />
      <GoldCloud variant="b" eager flip className="-right-20 top-[48%] w-52 opacity-90 sm:-right-12 sm:w-72" />
      <CircuitTraces animated={false} density="light" flip="y" terminalFill="#FAF6EE" className="absolute -left-3 bottom-8 hidden w-28 opacity-40 lg:block" />
      <CircuitTraces animated={false} density="light" flip="xy" terminalFill="#FAF6EE" className="absolute -right-3 bottom-8 hidden w-28 opacity-40 lg:block" />
      <GoldDust count={10} seed={41} className="opacity-70" />

      <div className="container-x relative pb-24 pt-4 text-center sm:pb-28 lg:pb-32">
        <Reveal>
          <p className="eyebrow text-[11px] text-saffron-ink sm:text-[12px]">{teamPage.eyebrow}</p>
        </Reveal>
        <div className="mt-4 flex items-end justify-center gap-4 sm:gap-5">
          <SectionHeading as="h1" id="team-heading" align="center" reveal line1={teamPage.heading.line1} line2={teamPage.heading.line2} />
          <Seal motif="knot" meaning="Together" size="md" className="mb-1 hidden xs:inline-flex" />
        </div>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-ink-muted sm:text-[17px]">{teamPage.intro}</p>
        </Reveal>
        <dl className="mt-9 flex items-center justify-center gap-8 sm:gap-12">
          <div className="flex flex-col-reverse items-center gap-2">
            <dt className="eyebrow text-[11px] text-navy">{teamPage.stats.people}</dt>
            <dd>
              <StatCounter value={teamCounts.people} display={String(teamCounts.people)} accent="saffron" />
            </dd>
          </div>
          <Diamond className="bg-gold" />
          <div className="flex flex-col-reverse items-center gap-2">
            <dt className="eyebrow text-[11px] text-navy">{teamPage.stats.departments}</dt>
            <dd>
              <StatCounter value={teamCounts.departments} display={String(teamCounts.departments)} accent="royal" />
            </dd>
          </div>
        </dl>
      </div>

      {/* the hills the directory below sits on */}
      <Ridge seed={11} from="#E9DCC4" to="#F4EDE0" rough={0.5} className="absolute inset-x-0 bottom-0 h-12 sm:h-16 lg:h-20" />
    </section>
  );
}
