"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import PageHero from "../components/site/PageHero";
import SoonBadge from "../components/site/SoonBadge";

const CATEGORIES = ["Összes", "Mérkőzés", "Akadémia", "Program", "Sajtó"];

const CAT_COLOR: Record<string, string> = {
  Mérkőzés: "bg-vasasRed",
  Akadémia: "bg-royal",
  Program: "bg-gold",
  Sajtó: "bg-navy",
};

const IMAGES = ["/images/flag.jpg", "/images/team.jpg", "/images/player.jpg", "/images/focizzteis.jpeg", "/images/vasas.jpeg", "/images/vasassc.jpeg"];

const ARTICLES = Array.from({ length: 9 }, (_, i) => ({
  cat: ["Mérkőzés", "Akadémia", "Program", "Sajtó"][i % 4],
  title: "Hír címe ide kerül",
  excerpt: "Rövid bevezető szöveg a hírhez — két-három mondatos összefoglaló a kattintható tartalomról.",
  date: "Dátum",
  img: IMAGES[i % IMAGES.length],
}));

export default function HirekPage() {
  const [cat, setCat] = useState("Összes");
  const list = cat === "Összes" ? ARTICLES : ARTICLES.filter((a) => a.cat === cat);
  const [featured, ...rest] = list;

  return (
    <main className="min-h-screen">
      <PageHero
        breadcrumb="Hírek"
        eyebrow="Aktuális"
        title={
          <>
            Hírek és <span className="text-gold-light">események.</span>
          </>
        }
        subtitle="Közérdekű információk, mérkőzés-összefoglalók és akadémiai hírek egy helyen."
      />

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-14">
          {/* Kategória szűrő */}
          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                  cat === c
                    ? "bg-vasasRed text-white border-vasasRed"
                    : "bg-white text-navy/70 border-gray-200 hover:border-vasasRed/50 hover:text-vasasRed"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {list.length === 0 && (
            <div className="py-16 text-center text-navy/50">Nincs hír ebben a kategóriában.</div>
          )}

          {/* Kiemelt hír */}
          {featured && (
            <motion.div
              key={`f-${cat}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid lg:grid-cols-2 gap-8 mb-12 group cursor-pointer"
            >
              <div className="relative aspect-[16/10] rounded-md overflow-hidden bg-navy">
                <Image src={featured.img} alt={featured.title} fill className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
                <span className={`absolute top-4 left-4 ${CAT_COLOR[featured.cat]} text-white text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-sm`}>
                  {featured.cat}
                </span>
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-xs text-navy/50 mb-2 font-medium">{featured.date}</div>
                <h2 className="heading-display text-3xl md:text-4xl text-navy mb-4 group-hover:text-vasasRed transition-colors">
                  {featured.title}
                </h2>
                <p className="text-navy/65 leading-relaxed mb-5">{featured.excerpt}</p>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-navy">
                  Tovább olvasom
                  <span className="w-8 h-px bg-vasasRed" />
                </span>
              </div>
            </motion.div>
          )}

          {/* Rács */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((n, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-navy">
                  <Image src={n.img} alt={n.title} fill className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
                  <span className={`absolute top-4 left-4 ${CAT_COLOR[n.cat]} text-white text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-sm`}>
                    {n.cat}
                  </span>
                </div>
                <div className="pt-5">
                  <div className="text-xs text-navy/50 mb-2 font-medium">{n.date}</div>
                  <h3 className="font-display font-bold text-2xl text-navy leading-tight mb-3 group-hover:text-vasasRed transition-colors">
                    {n.title}
                  </h3>
                  <p className="text-sm text-navy/65 leading-relaxed">{n.excerpt}</p>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="no-click border-2 border-navy/15 hover:border-vasasRed hover:text-vasasRed transition-colors px-8 py-3 font-bold rounded-sm text-sm text-navy">
              További hírek betöltése
            </button>
            <div className="mt-3">
              <SoonBadge label="CMS hírek — hamarosan" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
