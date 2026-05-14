"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const NEWS = [
  {
    cat: "Mérkőzés",
    catColor: "bg-vasasRed",
    title: "Hétvégi eredmények – 19. forduló",
    excerpt:
      "Az U17-es csapatunk magabiztos hazai győzelmet aratott, az U14 idegenben szerzett három pontot.",
    date: "2026. május 4.",
    img: "/images/vasas.jpeg",
  },
  {
    cat: "Akadémia",
    catColor: "bg-royal",
    title: "Új edzői stáb az U10-es korosztálynál",
    excerpt:
      "Bemutatjuk a 2026/27-es szezon új vezetőedzőjét, aki a klub saját nevelésű szakembere.",
    date: "2026. május 2.",
    img: "/images/vasassc.jpeg",
  },
  {
    cat: "Program",
    catColor: "bg-gold",
    title: "Nyári táborok – jelentkezés megnyitva",
    excerpt:
      "Június 16. és augusztus 22. között hat turnusban várjuk a 6–12 éves gyerekeket.",
    date: "2026. április 28.",
    img: "/images/focizzteis.jpeg",
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] as const },
  },
};

export default function News() {
  const reduced = useReducedMotion();

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div>
            <span className="section-eyebrow">Aktuális</span>
            <h2 className="heading-display text-4xl md:text-5xl text-navy mt-3 mb-3">Hírek és események</h2>
            <div className="gold-divider" />
          </div>
          <button className="no-click self-start md:self-end flex items-center gap-2 font-semibold text-sm text-navy hover:text-vasasRed transition group">
            Összes hír megtekintése
            <motion.svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="group-hover:translate-x-1 transition-transform"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </motion.svg>
          </button>
        </motion.div>

        <motion.div
          className="grid lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {NEWS.map((n) => (
            <motion.article
              key={n.title}
              variants={item}
              whileHover={
                reduced
                  ? undefined
                  : {
                      y: -10,
                      transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] },
                    }
              }
              className="no-click group cursor-default"
              initial="rest"
              animate="rest"
            >
              <motion.div
                className="relative aspect-[16/10] overflow-hidden rounded-md bg-navy"
                whileHover="hover"
                initial="rest"
                animate="rest"
              >
                <motion.div
                  variants={{
                    rest: { scale: 1 },
                    hover: reduced ? { scale: 1 } : { scale: 1.1 },
                  }}
                  transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={n.img}
                    alt={n.title}
                    fill
                    className="object-cover opacity-90"
                  />
                </motion.div>
                <motion.div
                  variants={{
                    rest: { opacity: 0.55 },
                    hover: { opacity: 0.85 },
                  }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-transparent"
                />
                <motion.span
                  className={`absolute top-4 left-4 ${n.catColor} text-white text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-sm`}
                  variants={{
                    rest: { y: 0 },
                    hover: reduced ? { y: 0 } : { y: -2 },
                  }}
                >
                  {n.cat}
                </motion.span>
              </motion.div>
              <div className="pt-5">
                <div className="text-xs text-navy/50 mb-2 font-medium">{n.date}</div>
                <h3 className="font-display font-bold text-2xl text-navy leading-tight mb-3 group-hover:text-vasasRed transition-colors duration-300">
                  {n.title}
                </h3>
                <p className="text-sm text-navy/65 leading-relaxed">{n.excerpt}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-navy">
                  Tovább olvasom
                  <motion.span
                    className="w-6 h-px bg-vasasRed origin-left"
                    initial={{ scaleX: 1 }}
                    whileHover={{ scaleX: 1.8 }}
                  />
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
