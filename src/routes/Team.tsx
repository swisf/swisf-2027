import { useRef } from 'react';
import rayPortrait from '../assets/images/mascots/ray-portrait.webp';
import sunPortrait from '../assets/images/mascots/sun-portrait.webp';
import PageShell from '../components/layout/PageShell';
import { GoldDust } from '../components/ornaments/Particles';
import StarField from '../components/ornaments/StarField';
import TeamGrid from '../components/sections/TeamGrid';
import TeamHero from '../components/sections/TeamHero';
import Button from '../components/ui/Button';
import { InstagramIcon } from '../components/ui/icons';
import Reveal from '../components/ui/Reveal';
import { seo, site } from '../data/site';
import { teamPage } from '../data/team';
import { usePauseOffscreen } from '../hooks/usePauseOffscreen';
import { cn } from '../lib/cn';

/** Closing banner: join E-Cell, with Sun and Ray waving from the corner. */
function JoinBanner() {
  const ref = useRef<HTMLElement>(null);
  usePauseOffscreen(ref);
  return (
    <section ref={ref} aria-labelledby="join-heading" className="bg-cream-2 pb-20 sm:pb-24">
      <div className="container-x">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-2xl bg-navy-deep px-6 py-10 text-cream ring-1 ring-gold/40 sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:py-12">
            <StarField count={40} seed={21} className="absolute inset-0 -z-10 h-full w-full opacity-50" />
            <GoldDust count={8} seed={5} className="-z-10" />
            <span aria-hidden="true" className="absolute -right-24 -top-24 -z-10 h-64 w-64 rounded-full border border-gold/20" />
            <span aria-hidden="true" className="absolute -right-10 -top-10 -z-10 h-36 w-36 rounded-full border border-gold/20" />
            <div className="relative max-w-xl">
              <p className="eyebrow text-saffron-bright">E-Cell, NIT Meghalaya</p>
              <h2 id="join-heading" className="mt-3 text-2xl font-medium text-cream sm:text-3xl">
                {teamPage.join.title}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-cream/75">{teamPage.join.text}</p>
              <Button
                href={site.socials.instagram.url}
                target="_blank"
                variant="sun"
                icon={InstagramIcon}
                iconPosition="left"
                className="mt-7"
                aria-label={`${teamPage.join.linkLabel} (@${site.socials.instagram.handle}, opens in a new tab)`}
              >
                {teamPage.join.linkLabel}
              </Button>
            </div>
            <div aria-hidden="true" className="relative mt-10 flex justify-center lg:mt-0 lg:shrink-0 lg:pr-4">
              {[sunPortrait, rayPortrait].map((src, i) => (
                <span
                  key={src}
                  className={cn(
                    'block h-28 w-28 overflow-hidden rounded-full bg-cream shadow-lift ring-2 ring-gold-soft motion-safe:animate-bob sm:h-32 sm:w-32',
                    i === 1 && '-ml-5 mt-8',
                  )}
                  style={{ animationDelay: `${i * -2}s` }}
                >
                  <img src={src} alt="" width={360} height={360} loading="lazy" decoding="async" draggable={false} className="h-full w-full object-cover" />
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** /team: the organising team, department by department, read from src/data/organising-team.json. */
export default function Team() {
  return (
    <PageShell title={seo.team.title} description={seo.team.description}>
      <TeamHero />
      <TeamGrid />
      <JoinBanner />
    </PageShell>
  );
}
