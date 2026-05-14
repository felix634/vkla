"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export default function JoinCTA() {
  const reduced = useReducedMotion();

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="absolute inset-0">
        <motion.div
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 2, ease: [0.2, 0.8, 0.2, 1] }}
          className="absolute inset-0"
        >
          <Image
            src="/images/focizzteis.jpeg"
            alt=""
            fill
            className="object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/95 to-navy/80" />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      {/* Diagonal red accent */}
      <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-1/3 skew-x-12 origin-top-right bg-gradient-to-l from-vasasRed/20 to-transparent" />

      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
        <motion.div
          className="lg:col-span-8 text-white"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <span className="section-eyebrow">Focizz Te is</span>
          <h2 className="heading-display text-4xl md:text-5xl lg:text-6xl mt-3 mb-5">
            Csatlakozz a Vasas
            <br />
            <span className="text-gold-light">Kubala Akadémiához!</span>
          </h2>
          <div className="gold-divider mb-6" />
          <p className="text-lg text-white/80 max-w-xl mb-8 leading-relaxed">
            U4-től U9-ig folyamatosan várjuk a focit szerető gyerekeket.
            Próbaedzés előzetes regisztrációval — teljesen ingyenesen.
          </p>
          <div className="flex flex-wrap gap-4">
            <motion.button
              whileHover={
                reduced
                  ? undefined
                  : { y: -3, boxShadow: "0 22px 45px -18px rgba(225,29,46,0.6)" }
              }
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="no-click bg-vasasRed hover:bg-vasasRedDark px-8 py-4 font-bold rounded-sm shadow-lg shadow-vasasRed/30 flex items-center gap-2 group"
            >
              Próbaedzésre jelentkezem
              <motion.svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="group-hover:translate-x-1 transition-transform"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </motion.svg>
            </motion.button>
            <motion.button
              whileHover={reduced ? undefined : { y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="no-click border-2 border-white/30 hover:border-gold hover:text-gold transition-colors px-8 py-4 font-bold rounded-sm"
            >
              Letöltöm a brosúrát
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          className="lg:col-span-4 hidden lg:block"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <motion.div
            whileHover={reduced ? undefined : { y: -6 }}
            transition={{ duration: 0.4 }}
            className="bg-white/5 backdrop-blur-sm border border-white/15 rounded-md p-8 text-white"
          >
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Kapcsolat</div>
            <div className="space-y-5">
              <div>
                <div className="text-xs text-white/50 uppercase tracking-widest mb-1">Cím</div>
                <div className="text-white/95 font-medium">Budapest, Fáy utca 58.</div>
              </div>
              <div>
                <div className="text-xs text-white/50 uppercase tracking-widest mb-1">Telefon</div>
                <div className="text-white/95 font-medium">+36 20 378 4880</div>
              </div>
              <div>
                <div className="text-xs text-white/50 uppercase tracking-widest mb-1">E-mail</div>
                <div className="text-white/95 font-medium">iroda@vkla.hu</div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <div className="text-xs text-white/50 uppercase tracking-widest mb-1">Iroda</div>
                <div className="text-white/95 font-medium">H-P: 9:00–17:00</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
