"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { HirListItem } from "../lib/sanity/hirek";
import { fokusz, sized } from "../lib/sanity/imageUrl";
import LogoHelyettes from "./site/LogoHelyettes";
import { catColor, formatDate } from "../lib/newsFormat";

// A főoldal nyitóblokkja (Tóth Patrik, 2026.10.23.): balra nagyban a kiemelt
// hír („Kiemelt hír” felirattal), jobbra kicsiben az 5 legfrissebb. A kiemelt
// hírt a Studióban a hír „Kiemelt hír a főoldalon” kapcsolója rögzíti.
export default function KiemeltHirek({ kiemelt, tovabbi }: { kiemelt: HirListItem | null; tovabbi: HirListItem[] }) {
  const reduced = useReducedMotion();
  if (!kiemelt) return null;
  const href = (h: HirListItem) => (h.slug ? `/hirek/${h.slug}` : "/hirek");

  return (
    <section className="bg-navy text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-14 relative grid lg:grid-cols-12 gap-8">
        {/* Kiemelt hír */}
        <motion.div
          className="lg:col-span-7"
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <span className="inline-block bg-vasasRed text-white text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm mb-4">
            Kiemelt hír
          </span>
          <Link href={href(kiemelt)} className="group block">
            <div className="relative aspect-[16/10] rounded-md overflow-hidden bg-navy-dark">
              {kiemelt.imageUrl ? (
                <Image
                  src={sized(kiemelt.imageUrl, 1400)!}
                  alt={kiemelt.title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                  style={{ objectPosition: fokusz(kiemelt.imagePos) }}
                />
              ) : (
                // A cím alul ráúszik a képre, ezért a logó feljebb ül.
                <LogoHelyettes meret="h-[42%]" className="pb-[16%]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-transparent" />
              <div className="absolute left-0 right-0 bottom-0 p-5 md:p-8">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`${catColor(kiemelt.category)} text-white text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-sm`}
                  >
                    {kiemelt.category}
                  </span>
                  <span className="text-xs text-white/70">{formatDate(kiemelt.publishedAt)}</span>
                </div>
                <h1 className="heading-display text-2xl md:text-4xl leading-tight group-hover:text-gold-light transition-colors line-clamp-3">
                  {kiemelt.title}
                </h1>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Legfrissebb hírek */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="flex items-end justify-between mb-4 lg:mt-1">
            <span className="section-eyebrow">Legfrissebb hírek</span>
            <Link href="/hirek" className="text-sm font-semibold text-white/70 hover:text-gold-light transition-colors">
              Összes hír →
            </Link>
          </div>
          <ul className="flex-1 flex flex-col justify-between gap-3">
            {tovabbi.map((h, i) => (
              <motion.li
                key={h._id}
                initial={reduced ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <Link href={href(h)} className="group flex gap-4 items-center rounded-md p-2 -m-2 hover:bg-white/5 transition-colors">
                  <div className="relative w-28 sm:w-32 aspect-[16/10] flex-shrink-0 rounded overflow-hidden bg-navy-dark">
                    {h.imageUrl ? (
                      <Image
                        src={sized(h.imageUrl, 320)!}
                        alt={h.title}
                        fill
                        sizes="128px"
                        className="object-cover opacity-90"
                        style={{ objectPosition: fokusz(h.imagePos) }}
                      />
                    ) : (
                      <LogoHelyettes meret="h-3/4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-white/50 mb-1">
                      <span className="font-bold text-gold-light">{h.category}</span> · {formatDate(h.publishedAt)}
                    </div>
                    <h3 className="font-display font-bold text-base leading-snug line-clamp-2 group-hover:text-gold-light transition-colors">
                      {h.title}
                    </h3>
                  </div>
                </Link>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
