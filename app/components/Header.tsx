"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const MENU = [
  { label: "Hírek", sub: ["Kiemelt hírek", "Sajtószemle", "Hírarchívum"] },
  { label: "Akadémia", sub: ["Bemutatkozás", "Kubala László", "Edzői stáb", "Etikai kódex", "Házirend"] },
  { label: "Csapatok", sub: ["U5–U9", "U10–U13", "U14–U19", "Női csapat", "Vasas FC II"] },
  { label: "Mérkőzések", sub: ["Naptár", "Eredmények", "Bajnoki tabella"] },
  { label: "Programok", sub: ["Heti edzésterv", "Edukációs előadások", "Karitatív programok"] },
  { label: "Média", sub: ["Galéria", "Videók", "Vasas TV"] },
  { label: "Oktatás", sub: ["Videós tananyagok", "Egyéni fejlesztés", "Szülőknek"] },
  { label: "TAO" },
  { label: "Karrier" },
  { label: "Webshop" },
  { label: "Kapcsolat" },
];

export default function Header() {
  const reduced = useReducedMotion();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <motion.div
          className="flex items-center gap-3 no-click cursor-default"
          whileHover={reduced ? undefined : { x: -1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            whileHover={reduced ? undefined : { rotate: -8, scale: 1.05 }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <Image
              src="/images/logo.png"
              alt="Vasas Kubala Akadémia"
              width={56}
              height={56}
              className="h-14 w-14 object-contain"
            />
          </motion.div>
          <div className="leading-tight">
            <div className="font-display font-black text-navy text-lg tracking-wide">VASAS KUBALA</div>
            <div className="font-display font-bold text-vasasRed text-sm tracking-[0.3em]">AKADÉMIA</div>
          </div>
        </motion.div>

        <nav className="hidden xl:flex items-center gap-1">
          {MENU.map((item) => (
            <div key={item.label} className="relative group">
              <motion.button
                whileHover={reduced ? undefined : { y: -1 }}
                transition={{ duration: 0.2 }}
                className="no-click px-3 py-2 text-sm font-semibold text-navy hover:text-vasasRed transition-colors flex items-center gap-1"
              >
                {item.label}
                {item.sub && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:rotate-180 transition-transform duration-300">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                )}
              </motion.button>
              {item.sub && (
                <div className="absolute left-0 top-full pt-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                  <motion.div
                    initial={{ y: -8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white border border-gray-100 shadow-xl rounded-md py-2 min-w-[200px]"
                  >
                    {item.sub.map((s) => (
                      <div key={s} className="px-4 py-2 text-sm text-navy/80 hover:bg-cream transition-colors">
                        {s}
                      </div>
                    ))}
                  </motion.div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={reduced ? undefined : { scale: 1.08, backgroundColor: "rgb(248 250 252)" }}
            whileTap={{ scale: 0.92 }}
            className="no-click hidden md:flex h-10 w-10 items-center justify-center rounded-full text-navy"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </motion.button>
          <motion.button
            whileHover={
              reduced
                ? undefined
                : { y: -2, backgroundColor: "#0046B6", boxShadow: "0 12px 28px -12px rgba(0, 70, 182, 0.55)" }
            }
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="no-click bg-navy text-white px-5 py-2.5 rounded-sm font-semibold text-sm"
          >
            Jelentkezés
          </motion.button>
        </div>
      </div>
    </header>
  );
}
