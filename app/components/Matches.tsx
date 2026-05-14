"use client";

import { motion, useReducedMotion } from "framer-motion";

// 10 placeholder upcoming matches — content swapped from CMS later
const UPCOMING = Array.from({ length: 10 }, (_, i) => ({
  date: "—",
  time: "—:—",
  team: `Vasas Kubala U${[8, 10, 12, 13, 14, 15, 16, 17, 18, 19][i]}`,
  opponent: "Ellenfél neve",
  league: "Bajnokság",
  away: i % 3 === 2,
}));

const RECENT = [
  { team: "Vasas Kubala", opponent: "Ellenfél neve", score: "—" },
  { team: "Ellenfél neve", opponent: "Vasas Kubala", score: "—" },
  { team: "Vasas Kubala", opponent: "Ellenfél neve", score: "—" },
  { team: "Vasas Kubala", opponent: "Ellenfél neve", score: "—" },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] as const },
  },
};

export default function Matches() {
  const reduced = useReducedMotion();

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <span className="section-eyebrow">Mérkőzések</span>
          <h2 className="heading-display text-4xl md:text-5xl lg:text-6xl text-navy mt-3 mb-4">
            A pályán találkozunk.
          </h2>
          <div className="gold-divider mx-auto" />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upcoming - takes 2 cols */}
          <div className="lg:col-span-2">
            <motion.div
              className="flex items-center justify-between mb-5"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="font-display font-bold text-2xl text-navy flex items-center gap-3">
                <span className="w-1.5 h-6 bg-vasasRed rounded-sm" />
                Közelgő mérkőzések
              </h3>
              <span className="text-sm text-navy/50">Következő 10</span>
            </motion.div>

            <motion.div
              className="border border-gray-100 rounded-md overflow-hidden bg-white"
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.05 }}
            >
              {UPCOMING.map((m, i) => (
                <motion.div
                  key={i}
                  variants={item}
                  whileHover={
                    reduced
                      ? undefined
                      : {
                          backgroundColor: "rgba(247, 243, 236, 1)",
                          x: 3,
                          transition: { duration: 0.25, ease: [0.2, 0.8, 0.2, 1] },
                        }
                  }
                  className={`no-click flex items-center gap-4 px-4 py-3 cursor-default ${
                    i !== UPCOMING.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  {/* Date / time */}
                  <div className="flex-shrink-0 w-16 text-center">
                    <div className="text-navy font-display font-black text-sm leading-none">
                      {m.date}
                    </div>
                    <div className="text-vasasRed text-[11px] font-bold mt-1">{m.time}</div>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-9 bg-gray-200" />

                  {/* Match */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm font-display font-bold text-navy">
                      <span className={m.away ? "text-navy/55 truncate" : "truncate"}>
                        {m.team}
                      </span>
                      <span className="text-navy/30 text-[10px] font-sans">VS</span>
                      <span className={!m.away ? "text-navy/55 truncate" : "truncate"}>
                        {m.opponent}
                      </span>
                    </div>
                    <div className="text-[11px] uppercase tracking-widest text-navy/40 mt-0.5">
                      {m.league}
                    </div>
                  </div>

                  {/* Home / away indicator */}
                  <span
                    className={`hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm flex-shrink-0 ${
                      m.away
                        ? "bg-navy/5 text-navy/60"
                        : "bg-vasasRed/10 text-vasasRed"
                    }`}
                  >
                    {m.away ? "Idegen" : "Hazai"}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-4 text-right">
              <button className="no-click text-sm font-semibold text-navy hover:text-vasasRed transition-colors inline-flex items-center gap-2 group">
                Teljes mérkőzésnaptár
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-1 transition-transform">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>

          {/* Recent results */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-2xl text-navy flex items-center gap-3">
                <span className="w-1.5 h-6 bg-royal rounded-sm" />
                Eredmények
              </h3>
            </div>
            <div className="bg-navy text-white rounded-md p-5 space-y-1">
              {RECENT.map((r, i) => (
                <motion.div
                  key={i}
                  whileHover={reduced ? undefined : { x: 4 }}
                  transition={{ duration: 0.25 }}
                  className={`py-2.5 cursor-default ${i !== RECENT.length - 1 ? "border-b border-white/10" : ""}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm flex-1 min-w-0">
                      <div className="font-semibold truncate">{r.team}</div>
                      <div className="text-white/60 truncate">{r.opponent}</div>
                    </div>
                    <span className="font-display font-black text-lg text-gold-light flex-shrink-0">
                      {r.score}
                    </span>
                  </div>
                </motion.div>
              ))}
              <button className="no-click w-full mt-2 text-sm text-gold hover:text-gold-light font-semibold pt-3 border-t border-white/10 transition-colors">
                Teljes tabella →
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
