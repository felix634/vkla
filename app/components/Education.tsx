"use client";

import { motion, useReducedMotion } from "framer-motion";

const COURSES = [
  { title: "Labdás technikai gyakorlatok", level: "U7–U10", price: "4 990 Ft", lessons: "12 videós lecke" },
  { title: "Otthoni cselezőgyakorlatok", level: "U10–U13", price: "5 990 Ft", lessons: "18 videós lecke" },
  { title: "Mentális felkészítés szülőknek", level: "Minden korosztály", price: "3 490 Ft", lessons: "8 előadás", featured: true },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] as const },
  },
};

export default function Education() {
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
            <span className="section-eyebrow">Oktatási Felület</span>
            <h2 className="heading-display text-4xl md:text-5xl lg:text-6xl text-navy mt-3 mb-5">
              Otthon is folytatódik <span className="text-royal">a fejlődés.</span>
            </h2>
            <div className="gold-divider mb-7" />
            <p className="text-lg text-navy/75 leading-relaxed mb-6">
              Saját videós tananyagaink lehetővé teszik, hogy gyermeke az
              edzéseken kívül is gyakorolhasson — szakképzett edzőink által
              összeállított programokkal.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Korosztály-specifikus tananyagok",
                "Egyszeri vásárlás, korlátlan hozzáférés",
                "Mobil- és tablet-barát lejátszó",
                "Heti új tartalmak",
              ].map((f, i) => (
                <motion.li
                  key={f}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                  className="flex items-center gap-3 text-navy/80"
                >
                  <span className="w-6 h-6 rounded-full bg-royal/10 text-royal flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span className="text-sm font-medium">{f}</span>
                </motion.li>
              ))}
            </ul>
            <motion.button
              whileHover={reduced ? undefined : { y: -3, backgroundColor: "#0046B6" }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="no-click bg-navy px-7 py-3.5 font-bold rounded-sm text-white text-sm"
            >
              Webshop megnyitása →
            </motion.button>
          </motion.div>

          <motion.div
            className="lg:col-span-7"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="grid gap-4">
              {COURSES.map((c) => (
                <motion.div
                  key={c.title}
                  variants={item}
                  whileHover={
                    reduced
                      ? undefined
                      : {
                          x: 6,
                          boxShadow: "0 20px 40px -20px rgba(12, 33, 67, 0.4)",
                          transition: { duration: 0.35, ease: [0.2, 0.8, 0.2, 1] },
                        }
                  }
                  className={`no-click relative rounded-md p-6 flex items-center gap-6 border cursor-default ${
                    c.featured
                      ? "bg-navy text-white border-gold/40 shadow-xl shadow-navy/20"
                      : "bg-cream border-gray-100"
                  }`}
                >
                  <motion.div
                    whileHover={reduced ? undefined : { rotate: -8, scale: 1.08 }}
                    transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
                    className={`flex-shrink-0 w-20 h-20 rounded-md flex items-center justify-center ${
                      c.featured ? "bg-gold text-navy" : "bg-navy/5 text-navy"
                    }`}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" />
                    </svg>
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[10px] uppercase tracking-widest mb-1 ${c.featured ? "text-gold-light" : "text-navy/50"}`}>
                      {c.level}
                    </div>
                    <h4 className={`font-display font-bold text-xl mb-1 ${c.featured ? "text-white" : "text-navy"}`}>
                      {c.title}
                    </h4>
                    <div className={`text-sm ${c.featured ? "text-white/70" : "text-navy/60"}`}>{c.lessons}</div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className={`font-display font-black text-2xl ${c.featured ? "text-gold-light" : "text-navy"}`}>
                      {c.price}
                    </div>
                    <div className={`text-xs ${c.featured ? "text-white/60" : "text-navy/40"} mt-1`}>egyszeri</div>
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
