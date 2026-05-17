"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export default function Hero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-navy text-white min-h-[640px] flex items-center">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <motion.div
          initial={reduced ? { scale: 1 } : { scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="absolute inset-0"
        >
          <Image
            src="/images/focizzteis.jpeg"
            alt="Vasas Kubala Akadémia"
            fill
            priority
            className="object-cover opacity-30"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy/85 to-royal/40" />
        <div className="absolute inset-0 bg-grid opacity-50" />
      </div>

      {/* Diagonal red accent on left */}
      <div className="hidden lg:block absolute -left-32 top-0 bottom-0 w-96 -skew-x-12 bg-gradient-to-b from-vasasRed/30 to-transparent" />

      {/* Gold accent line on right */}
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-gold-gradient" />

      <div className="relative max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="inline-flex items-center gap-3 mb-6 bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-1.5 rounded-full"
          >
            <span className="h-2 w-2 rounded-full bg-vasasRed animate-pulse" />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase">2025/26 Bajnoki Szezon</span>
          </motion.div>

          <h1 className="heading-display text-5xl md:text-7xl lg:text-[5.5rem] mb-6">
            {["A jövő", "labdarúgói", "itt nőnek fel."].map((line, i) => (
              <motion.span
                key={line}
                initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.9,
                  delay: 0.3 + i * 0.12,
                  ease: [0.2, 0.8, 0.2, 1],
                }}
                className={
                  i === 0
                    ? "block text-white"
                    : i === 1
                      ? "block text-vasasRed"
                      : "block text-gold-light"
                }
              >
                {line}
              </motion.span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.85, ease: [0.2, 0.8, 0.2, 1] }}
            className="flex items-center gap-3 mb-8"
          >
            <span className="w-10 h-px bg-gold" />
            <span className="font-display italic text-lg md:text-xl text-gold-light tracking-wide">
              Akarni, küzdeni, játszani.
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.95, ease: [0.2, 0.8, 0.2, 1] }}
            className="text-lg md:text-xl text-white/80 max-w-xl mb-10 leading-relaxed"
          >
            A Vasas Kubala Akadémia 1911 óta a magyar labdarúgás meghatározó
            utánpótlás-bázisa. <span className="text-white font-semibold">U4-től U19-ig</span>{" "}
            képezzük a következő generáció játékosait.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
            className="flex flex-wrap gap-4"
          >
            <motion.button
              whileHover={reduced ? undefined : { y: -3, boxShadow: "0 20px 40px -15px rgba(225, 29, 46, 0.55)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              className="no-click bg-vasasRed hover:bg-vasasRedDark px-7 py-4 font-bold tracking-wide rounded-sm shadow-lg shadow-vasasRed/30 flex items-center gap-2 group"
            >
              Jelentkezz az akadémiára
              <motion.svg
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5"
                className="group-hover:translate-x-1 transition-transform"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </motion.svg>
            </motion.button>
            <motion.button
              whileHover={reduced ? undefined : { y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="no-click border-2 border-white/30 hover:border-gold hover:text-gold transition-colors px-7 py-4 font-bold tracking-wide rounded-sm backdrop-blur-sm"
            >
              Megnézem a programokat
            </motion.button>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="grid grid-cols-3 gap-6 mt-14 pt-10 border-t border-white/10 max-w-xl"
          >
            {[
              { n: "1911", label: "alapítás éve" },
              { n: "16", label: "korosztály" },
              { n: "450+", label: "aktív játékos" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 + i * 0.1 }}
              >
                <div className="text-3xl md:text-4xl font-display font-black text-gold">{s.n}</div>
                <div className="text-xs uppercase tracking-widest text-white/60 mt-1">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Crest visual */}
        <div className="lg:col-span-5 hidden lg:flex justify-center relative">
          <div className="absolute inset-0 bg-gradient-radial from-royal/40 to-transparent blur-3xl" />
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            whileHover={reduced ? undefined : { rotate: 4, scale: 1.04 }}
            className="relative cursor-default"
          >
            <motion.div
              className="absolute -inset-8 border border-gold/30 rounded-full"
              animate={reduced ? undefined : { rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute -inset-16 border border-white/10 rounded-full"
              animate={reduced ? undefined : { rotate: -360 }}
              transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              animate={
                reduced
                  ? undefined
                  : { y: [0, -10, 0] }
              }
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/images/logo.png"
                alt="VKLA címer"
                width={420}
                height={420}
                className="relative drop-shadow-[0_0_40px_rgba(184,152,92,0.4)]"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom scroll indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.6 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-[0.3em] uppercase flex flex-col items-center gap-2"
      >
        <span>Görgess</span>
        <motion.div
          className="w-px h-8 bg-gradient-to-b from-gold to-transparent"
          animate={reduced ? undefined : { scaleY: [1, 0.4, 1], originY: 0 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
