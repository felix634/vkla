"use client";

import { motion, useReducedMotion } from "framer-motion";

const AGE_GROUPS = [
  { name: "U5" },
  { name: "U6" },
  { name: "U7" },
  { name: "U8" },
  { name: "U9" },
  { name: "U10" },
  { name: "U11" },
  { name: "U12" },
  { name: "U13" },
  { name: "U14" },
  { name: "U15" },
  { name: "U16" },
  { name: "U17" },
  { name: "U18" },
  { name: "U19" },
  { name: "Női", highlight: true },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03 } },
};

const item = {
  hidden: { opacity: 0, y: 18, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] as const },
  },
};

export default function Teams() {
  const reduced = useReducedMotion();

  return (
    <section className="py-24 px-6 bg-navy text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gold-gradient" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div>
            <span className="section-eyebrow">Csapataink</span>
            <h2 className="heading-display text-4xl md:text-5xl lg:text-6xl mt-3 mb-3">
              16 korosztály.
              <br />
              <span className="text-gold-light">Egy közös cél.</span>
            </h2>
            <div className="gold-divider" />
          </div>
          <p className="text-white/70 max-w-md text-base leading-relaxed">
            U4-től U19-ig képezzük a következő generáció labdarúgóit. Minden
            korosztály profi edzői stábbal és személyre szabott fejlesztési
            tervvel dolgozik.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {AGE_GROUPS.map((t) => (
            <motion.div
              key={t.name}
              variants={item}
              whileHover={
                reduced
                  ? undefined
                  : {
                      y: -6,
                      scale: 1.04,
                      backgroundColor: t.highlight
                        ? "rgba(225, 29, 46, 0.18)"
                        : "rgba(255, 255, 255, 0.10)",
                      borderColor: t.highlight
                        ? "rgba(225, 29, 46, 0.9)"
                        : "rgba(184, 152, 92, 0.7)",
                      transition: { duration: 0.3, ease: [0.2, 0.8, 0.2, 1] },
                    }
              }
              className={`no-click relative p-4 rounded-md border cursor-default ${
                t.highlight
                  ? "border-vasasRed/60 bg-vasasRed/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="font-display font-black text-2xl text-gold-light">
                {t.name}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">
                X játékos
              </div>
              <div className="text-[11px] text-white/70 mt-2 truncate">Edző neve</div>
              {t.highlight && (
                <div className="absolute -top-2 -right-2 text-[9px] uppercase tracking-wider font-bold bg-vasasRed text-white px-2 py-0.5 rounded-sm">
                  Új
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-12 flex flex-wrap gap-4 items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.button
            whileHover={reduced ? undefined : { y: -3, boxShadow: "0 18px 36px -16px rgba(225,29,46,0.55)" }}
            whileTap={{ scale: 0.97 }}
            className="no-click bg-vasasRed hover:bg-vasasRedDark px-7 py-3.5 font-bold rounded-sm text-sm"
          >
            Csatlakozz egy csapathoz
          </motion.button>
          <motion.button
            whileHover={reduced ? undefined : { y: -3 }}
            whileTap={{ scale: 0.97 }}
            className="no-click border-2 border-white/20 hover:border-gold hover:text-gold transition-colors px-7 py-3.5 font-bold rounded-sm text-sm"
          >
            Megnézem a Vasas FC II oldalát
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
