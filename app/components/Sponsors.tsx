"use client";

import { motion, useReducedMotion } from "framer-motion";

const SPONSORS = [
  "Szponzor 1",
  "Szponzor 2",
  "Szponzor 3",
  "Szponzor 4",
  "Szponzor 5",
  "Szponzor 6",
  "Szponzor 7",
  "Szponzor 8",
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] as const },
  },
};

export default function Sponsors() {
  const reduced = useReducedMotion();

  return (
    <section className="py-20 px-6 bg-navy-dark text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-stripes opacity-50 pointer-events-none" />
      <div className="max-w-7xl mx-auto relative">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-eyebrow">Partnereink</span>
          <h2 className="heading-display text-3xl md:text-4xl mt-3">
            Együtt építjük <span className="text-gold-light">a jövőt.</span>
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 border border-white/10 rounded-md overflow-hidden"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {SPONSORS.map((s) => (
            <motion.div
              key={s}
              variants={item}
              whileHover={
                reduced
                  ? undefined
                  : {
                      backgroundColor: "rgba(12, 33, 67, 1)",
                      transition: { duration: 0.3 },
                    }
              }
              className="no-click bg-navy-dark p-8 flex items-center justify-center min-h-[100px] cursor-default group"
            >
              <motion.span
                whileHover={reduced ? undefined : { scale: 1.1, color: "#ffffff" }}
                transition={{ duration: 0.3 }}
                className="font-display font-bold text-xl tracking-wider text-white/50"
              >
                {s}
              </motion.span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-white/60 text-sm mb-4">Csatlakozz Te is támogatóink köréhez</p>
          <motion.button
            whileHover={reduced ? undefined : { y: -3, backgroundColor: "#B8985C", color: "#0c2143" }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.3 }}
            className="no-click border-2 border-gold/50 text-gold px-7 py-3 font-bold rounded-sm text-sm"
          >
            Szponzorációs lehetőségek →
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
