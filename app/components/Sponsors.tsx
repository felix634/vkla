"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { sized } from "../lib/sanity/imageUrl";
import type { SzponzorData } from "../lib/sanity/tartalom";

// Fő támogatók — kiemelten a főoldalon (jegyzőkönyv kérése).
const MAIN_SPONSORS = ["Fő támogató 1", "Fő támogató 2", "Fő támogató 3"];

// További partnerek rácsban.
const SPONSORS = [
  "Partner 1",
  "Partner 2",
  "Partner 3",
  "Partner 4",
  "Partner 5",
  "Partner 6",
  "Partner 7",
  "Partner 8",
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

export default function Sponsors({ szponzorok }: { szponzorok?: SzponzorData[] | null }) {
  const reduced = useReducedMotion();
  const fo = szponzorok?.filter((x) => x.tier === "fo") ?? [];
  const partnerek = szponzorok?.filter((x) => x.tier === "partner") ?? [];
  const cmsOn = !!(szponzorok && szponzorok.length > 0);

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

        {/* Fő támogatók — kiemelt sor */}
        {(cmsOn ? fo.length > 0 : true) && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {(cmsOn ? fo.map((x) => x.name) : MAIN_SPONSORS).map((s) => (
            <motion.div
              key={s}
              variants={item}
              whileHover={reduced ? undefined : { y: -4, transition: { duration: 0.3 } }}
              className="relative rounded-md border border-gold/40 bg-gradient-to-br from-white/[0.07] to-transparent p-8 flex flex-col items-center justify-center min-h-[130px]"
            >
              <span className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-[0.2em] text-gold-light/80">
                Fő támogató
              </span>
              <span className="font-display font-black text-2xl tracking-wider text-white/80">{s}</span>
            </motion.div>
          ))}
        </motion.div>
        )}

        {/* További partnerek */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 border border-white/10 rounded-md overflow-hidden"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {cmsOn
            ? partnerek.map((x) => (
                <motion.div
                  key={x._id}
                  variants={item}
                  className="bg-white p-6 flex items-center justify-center min-h-[110px] group"
                >
                  {x.logoUrl ? (
                    <motion.div
                      whileHover={reduced ? undefined : { scale: 1.06 }}
                      transition={{ duration: 0.3 }}
                      className="relative h-14 w-full"
                    >
                      <Image src={sized(x.logoUrl, 400)!} alt={x.name} fill className="object-contain" />
                    </motion.div>
                  ) : (
                    <motion.span
                      whileHover={reduced ? undefined : { scale: 1.06 }}
                      transition={{ duration: 0.3 }}
                      className="font-display font-bold text-xl tracking-wider text-navy/60"
                    >
                      {x.name}
                    </motion.span>
                  )}
                </motion.div>
              ))
            : SPONSORS.map((s) => (
                <motion.div
                  key={s}
                  variants={item}
                  whileHover={
                    reduced ? undefined : { backgroundColor: "rgba(12, 33, 67, 1)", transition: { duration: 0.3 } }
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
          <Link href="/szponzoracio">
            <motion.span
              whileHover={reduced ? undefined : { y: -3, backgroundColor: "#B8985C", color: "#0c2143" }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="inline-block border-2 border-gold/50 text-gold px-7 py-3 font-bold rounded-sm text-sm"
            >
              Szponzorációs lehetőségek →
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
