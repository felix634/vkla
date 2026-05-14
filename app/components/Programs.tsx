"use client";

import { motion, useReducedMotion } from "framer-motion";

const PROGRAMS = [
  {
    tag: "Edukáció",
    title: "Edukációs előadások",
    desc: "Sportpszichológiai, táplálkozási és sportorvosi előadások szülőknek és játékosoknak.",
    cta: "Aktuális előadások",
    color: "from-royal to-navy",
  },
  {
    tag: "Karitatív",
    title: "Hajrá Vasas — Karitatív program",
    desc: "Hátrányos helyzetű gyermekek bevonása a labdarúgásba, ingyenes edzésekkel és felszereléssel.",
    cta: "Csatlakozom",
    color: "from-vasasRed to-vasasRedDark",
  },
  {
    tag: "Nyári tábor",
    title: "Vasas Kubala Nyári Tábor",
    desc: "6 turnusban, 6–12 éves korig — labdarúgás, közösség, élmény. Limitált létszám.",
    cta: "Jelentkezem",
    color: "from-gold-dark to-gold",
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] as const },
  },
};

export default function Programs() {
  const reduced = useReducedMotion();

  return (
    <section className="py-24 px-6 bg-cream relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <span className="section-eyebrow">Programok</span>
          <h2 className="heading-display text-4xl md:text-5xl lg:text-6xl text-navy mt-3 mb-4">
            Több, mint <span className="text-vasasRed">edzés.</span>
          </h2>
          <div className="gold-divider mx-auto" />
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {PROGRAMS.map((p) => (
            <motion.div
              key={p.title}
              variants={item}
              whileHover={
                reduced
                  ? undefined
                  : {
                      y: -10,
                      boxShadow: "0 30px 60px -25px rgba(12, 33, 67, 0.55)",
                      transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] },
                    }
              }
              className={`no-click relative overflow-hidden rounded-md p-8 text-white bg-gradient-to-br ${p.color} min-h-[340px] flex flex-col cursor-default`}
              initial="rest"
              animate="rest"
            >
              <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
              <motion.div
                className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-white/5"
                whileHover={reduced ? undefined : { scale: 1.4 }}
                transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
              />
              <div className="relative z-10">
                <span className="inline-block text-[10px] font-bold tracking-[0.25em] uppercase bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-sm">
                  {p.tag}
                </span>
                <h3 className="heading-display text-3xl mt-6 mb-4 leading-tight">{p.title}</h3>
                <p className="text-white/85 text-sm leading-relaxed">{p.desc}</p>
              </div>
              <div className="relative z-10 mt-auto pt-8">
                <button className="no-click flex items-center gap-2 font-bold text-sm border-b-2 border-white/40 hover:border-white pb-1 transition-colors group/btn">
                  {p.cta}
                  <motion.svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="group-hover/btn:translate-x-1 transition-transform"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </motion.svg>
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
