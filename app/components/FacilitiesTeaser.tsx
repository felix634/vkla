"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const FACILITIES = [
  {
    name: "Fáy utcai Sportkomplexum",
    meta: "Fő létesítmény · 3 pálya",
    img: "/images/focizzteis.jpeg",
  },
  {
    name: "II. számú Létesítmény",
    meta: "Edzőpályák · bérelhető",
    img: "/images/vasassc.jpeg",
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] as const },
  },
};

// A régi "Oktatás" szekció helyén — a jegyzőkönyv kérése szerint a
// létesítmények és a bérlési lehetőség kerül a főoldalra.
export default function FacilitiesTeaser() {
  const reduced = useReducedMotion();

  return (
    <section className="py-24 px-6 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <span className="section-eyebrow">Létesítmények</span>
            <h2 className="heading-display text-4xl md:text-5xl lg:text-6xl text-navy mt-3 mb-5">
              Ahol a jövő <span className="text-royal">pályára lép.</span>
            </h2>
            <div className="gold-divider mb-7" />
            <p className="text-lg text-navy/75 leading-relaxed mb-6">
              Két korszerű létesítményben edzenek csapataink. A pályák és öltözők
              szabad időpontokban <span className="font-semibold text-navy">bérelhetők</span> is —
              csapatoknak, iskoláknak, rendezvényekre.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Két helyszín, több nagypálya és műfüves pálya",
                "Öltözők, kiszolgáló helyiségek, parkolás",
                "Bérlési lehetőség mindkét létesítményben",
                "Sporttelep-térképek és megközelítés",
              ].map((f, i) => (
                <motion.li
                  key={f}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                  className="flex items-center gap-3 text-navy/80"
                >
                  <span className="w-6 h-6 rounded-full bg-royal/10 text-royal flex items-center justify-center flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span className="text-sm font-medium">{f}</span>
                </motion.li>
              ))}
            </ul>
            <Link href="/letesitmenyek">
              <motion.span
                whileHover={reduced ? undefined : { y: -3, backgroundColor: "#0046B6" }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.3 }}
                className="inline-block bg-navy px-7 py-3.5 font-bold rounded-sm text-white text-sm"
              >
                Létesítmények és bérlés →
              </motion.span>
            </Link>
          </motion.div>

          <motion.div
            className="lg:col-span-7"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              {FACILITIES.map((f) => (
                <motion.div
                  key={f.name}
                  variants={item}
                  whileHover={
                    reduced
                      ? undefined
                      : {
                          y: -6,
                          boxShadow: "0 25px 50px -25px rgba(12, 33, 67, 0.45)",
                          transition: { duration: 0.35, ease: [0.2, 0.8, 0.2, 1] },
                        }
                  }
                  className="rounded-md overflow-hidden border border-gray-100 bg-white group"
                >
                  <div className="relative aspect-[4/3] bg-navy overflow-hidden">
                    <Image src={f.img} alt={f.name} fill className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
                    <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-gold text-navy px-2 py-0.5 rounded-sm">
                      Bérelhető
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-bold text-xl text-navy mb-1">{f.name}</h3>
                    <div className="text-sm text-navy/55">{f.meta}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
