"use client";

import { motion, useReducedMotion } from "framer-motion";

const UPCOMING = [
  {
    date: "MÁJ 11",
    time: "10:00",
    home: "Vasas Kubala U14",
    away: "MTK Budapest U14",
    venue: "Fáy utca, 1. pálya",
    league: "U14 Bajnokság",
  },
  {
    date: "MÁJ 11",
    time: "11:30",
    home: "Vasas Kubala U16",
    away: "Ferencváros U16",
    venue: "Fáy utca, főpálya",
    league: "U16 Bajnokság",
  },
  {
    date: "MÁJ 12",
    time: "16:00",
    home: "Honvéd U17",
    away: "Vasas Kubala U17",
    venue: "Bozsik Aréna",
    league: "U17 Bajnokság",
    away_game: true,
  },
];

const RECENT = [
  { home: "Vasas Kubala U15", away: "Újpest U15", score: "3-1", win: true },
  { home: "BKV Előre U13", away: "Vasas Kubala U13", score: "0-4", win: true },
  { home: "Vasas Kubala U18", away: "Diósgyőr U18", score: "2-2", win: null },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.2, 0.8, 0.2, 1] as const },
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
              <span className="text-sm text-navy/50">Hétvége</span>
            </motion.div>
            <motion.div
              className="space-y-3"
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              {UPCOMING.map((m, i) => (
                <motion.div
                  key={i}
                  variants={item}
                  whileHover={
                    reduced
                      ? undefined
                      : {
                          x: 4,
                          boxShadow: "0 18px 35px -22px rgba(12, 33, 67, 0.4)",
                          transition: { duration: 0.3, ease: [0.2, 0.8, 0.2, 1] },
                        }
                  }
                  className="no-click bg-cream border border-gray-100 rounded-md p-5 grid grid-cols-12 gap-4 items-center cursor-default"
                >
                  <div className="col-span-3 sm:col-span-2 text-center">
                    <div className="text-navy font-display font-black text-xl leading-none">{m.date}</div>
                    <div className="text-vasasRed text-sm font-bold mt-1">{m.time}</div>
                  </div>
                  <div className="col-span-9 sm:col-span-10">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="text-xs uppercase tracking-widest text-navy/40 mb-1.5">
                          {m.league}
                        </div>
                        <div className="flex items-center gap-3 font-display font-bold text-navy">
                          <span className={m.away_game ? "text-navy/60" : ""}>{m.home}</span>
                          <span className="text-navy/30 text-xs">VS</span>
                          <span className={!m.away_game ? "text-navy/60" : ""}>{m.away}</span>
                        </div>
                        <div className="text-xs text-navy/50 mt-1">📍 {m.venue}</div>
                      </div>
                      <motion.button
                        whileHover={reduced ? undefined : { scale: 1.04 }}
                        className="no-click hidden sm:block bg-white border border-navy/15 text-navy text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-sm hover:border-vasasRed hover:text-vasasRed transition-colors"
                      >
                        Részletek
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
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
            <div className="bg-navy text-white rounded-md p-5 space-y-3">
              {RECENT.map((r, i) => (
                <motion.div
                  key={i}
                  whileHover={reduced ? undefined : { x: 4 }}
                  transition={{ duration: 0.25 }}
                  className={`py-3 cursor-default ${i !== RECENT.length - 1 ? "border-b border-white/10" : ""}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm flex-1">
                      <div className="font-semibold truncate">{r.home}</div>
                      <div className="text-white/60 truncate">{r.away}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-xl text-gold-light">{r.score}</span>
                      {r.win === true && <span className="text-[10px] font-bold text-emerald-400">Ny</span>}
                      {r.win === false && <span className="text-[10px] font-bold text-vasasRed">V</span>}
                      {r.win === null && <span className="text-[10px] font-bold text-gold">D</span>}
                    </div>
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
