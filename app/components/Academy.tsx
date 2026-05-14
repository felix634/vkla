"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const PILLARS = [
  {
    title: "Szakmai program",
    desc: "Egységes nemzetközi módszertan a legkisebbektől a felnőtt csapatig.",
  },
  {
    title: "Etikai kódex",
    desc: "Tisztelet, fegyelem és sportszerűség – ezek az értékek vezérelnek minket.",
  },
  {
    title: "Egyéni fejlődés",
    desc: "Minden játékos saját fejlődési tervvel és visszajelzésekkel halad előre.",
  },
  {
    title: "Család az első",
    desc: "Szoros együttműködés a szülőkkel, mert a háttér nélkül nincs eredmény.",
  },
];

const pillarContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const pillarItem = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.2, 0.8, 0.2, 1] as const },
  },
};

export default function Academy() {
  const reduced = useReducedMotion();

  return (
    <section className="py-24 px-6 bg-cream relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 w-1/2 bg-stripes opacity-30 pointer-events-none" />
      <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <motion.div
            className="lg:col-span-5 relative"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <motion.div
              className="relative aspect-[4/5] rounded-md overflow-hidden"
              whileHover="hover"
              initial="rest"
              animate="rest"
            >
              <motion.div
                variants={{
                  rest: { scale: 1 },
                  hover: reduced ? { scale: 1 } : { scale: 1.08 },
                }}
                transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src="/images/vasas.jpeg"
                  alt="Vasas Kubala Akadémia"
                  fill
                  className="object-cover"
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-navy/40 to-transparent pointer-events-none" />
            </motion.div>
            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, y: 24, x: 24 }}
              whileInView={{ opacity: 1, y: 0, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
              whileHover={reduced ? undefined : { y: -4 }}
              className="absolute -bottom-6 -right-6 bg-navy text-white p-6 rounded-md shadow-2xl shadow-navy/30 max-w-[220px] cursor-default"
            >
              <div className="text-gold text-4xl font-display font-black mb-1">1911</div>
              <div className="text-xs uppercase tracking-widest text-white/70">A klub alapításának éve</div>
            </motion.div>
            {/* Floating red square */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="absolute -top-6 -left-6 w-24 h-24 bg-vasasRed -z-10 rounded-sm"
            />
          </motion.div>

          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <span className="section-eyebrow">Az Akadémiáról</span>
            <h2 className="heading-display text-4xl md:text-5xl lg:text-6xl text-navy mt-3 mb-5">
              Több, mint <span className="text-vasasRed">egy klub.</span>
              <br />
              Egy hagyomány.
            </h2>
            <div className="gold-divider mb-7" />

            <p className="text-lg text-navy/75 leading-relaxed mb-6">
              A Vasas Kubala Akadémia névadója Kubala László, minden idők egyik
              legnagyobb magyar labdarúgója. Hagyatékát hűségesen ápoljuk: gyermekeink
              technikai, taktikai és emberi fejlődése egyformán fontos számunkra.
            </p>
            <p className="text-base text-navy/65 leading-relaxed mb-10">
              Évente több mint 450 fiatal sportoló edz a Fáy utcai sportkomplexumban,
              16 korosztályban. A Vasas FC és Vasas SC szoros együttműködésében
              biztosítjuk az utánpótlástól a profi pályáig vezető utat.
            </p>

            <motion.div
              className="grid sm:grid-cols-2 gap-5"
              variants={pillarContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {PILLARS.map((p) => (
                <motion.div
                  key={p.title}
                  variants={pillarItem}
                  whileHover={reduced ? undefined : { x: 4 }}
                  transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                  className="flex gap-4 items-start cursor-default"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-sm bg-navy text-gold flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-navy text-lg mb-1">{p.title}</h4>
                    <p className="text-sm text-navy/60 leading-relaxed">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
