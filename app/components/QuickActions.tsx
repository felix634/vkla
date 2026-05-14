"use client";

import { motion, useReducedMotion } from "framer-motion";

const ACTIONS = [
  {
    title: "Tagdíj fizetés",
    desc: "Havi tagdíj kényelmes online befizetése bankkártyával.",
    badge: "Új",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    accent: "bg-vasasRed",
  },
  {
    title: "Oktatási anyagok",
    desc: "Videós tananyagok és edzéstervek otthoni gyakorláshoz.",
    badge: "Új",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
    ),
    accent: "bg-royal",
  },
  {
    title: "Heti programok",
    desc: "Edzések, mérkőzések és események minden korosztálynak.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    accent: "bg-gold",
  },
  {
    title: "Webshop",
    desc: "Hivatalos szurkolói termékek és akadémiai felszerelés.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
    accent: "bg-navy",
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] as const },
  },
};

export default function QuickActions() {
  const reduced = useReducedMotion();

  return (
    <section className="relative -mt-20 z-10 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {ACTIONS.map((a) => (
            <motion.div
              key={a.title}
              variants={item}
              whileHover={
                reduced
                  ? undefined
                  : {
                      y: -8,
                      boxShadow:
                        "0 30px 60px -25px rgba(12, 33, 67, 0.45)",
                      transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] },
                    }
              }
              className="no-click bg-white rounded-md p-6 lg:p-7 shadow-xl shadow-navy/10 border border-gray-100 relative overflow-hidden group cursor-default"
            >
              <motion.div
                className={`absolute top-0 left-0 h-1 w-full ${a.accent}`}
                initial={{ scaleX: 0, originX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1], delay: 0.1 }}
              />
              <motion.div
                className={`w-12 h-12 ${a.accent} text-white rounded-md flex items-center justify-center mb-4`}
                whileHover={reduced ? undefined : { rotate: -6, scale: 1.08 }}
                transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
              >
                {a.icon}
              </motion.div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-display font-bold text-navy text-xl">{a.title}</h3>
                {a.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-gold/15 text-gold-dark uppercase tracking-wider">
                    {a.badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-navy/65 leading-relaxed">{a.desc}</p>
              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-navy/80 group-hover:text-vasasRed transition-colors">
                Megnyitás
                <motion.svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  animate={{ x: 0 }}
                  whileHover={{ x: 4 }}
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </motion.svg>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
