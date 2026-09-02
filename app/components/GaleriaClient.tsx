"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import PageHero from "./site/PageHero";
import SoonBadge from "./site/SoonBadge";
import YouTubeEmbed from "./YouTubeEmbed";
import { sized } from "../lib/sanity/imageUrl";
import type { GaleriaAlbumData, VideoData } from "../lib/sanity/tartalom";
import { GALERIA_ALBUMOK } from "@/sanity/constants";

const PLACEHOLDER_ALBUMS = ["Összes", "Mérkőzés", "Esemény", "Edzés"];
// Csak valódi fotók — a kampánybannerek (focizzteis*, vasas*, vasassc*) szélesvásznúak,
// négyzetes csempébe vágva olvashatatlan szövegtöredék látszana belőlük.
const PLACEHOLDER_IMAGES = ["/images/flag.jpg", "/images/team.jpg", "/images/player.jpg"];

const PLACEHOLDER_PHOTOS = Array.from({ length: 12 }, (_, i) => ({
  album: ["Mérkőzés", "Esemény", "Edzés"][i % 3],
  src: PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length],
  title: "Galéria kép",
}));

type Photo = { album: string; src: string; title: string };

export default function GaleriaClient({
  albumok,
  videok,
}: {
  albumok?: GaleriaAlbumData[] | null;
  videok?: VideoData[] | null;
}) {
  const cmsOn = !!(albumok && albumok.length > 0);
  const photos: Photo[] = cmsOn
    ? albumok!.flatMap((a) =>
        (a.imageUrls ?? []).map((u) => ({ album: a.category, src: u, title: a.title }))
      )
    : PLACEHOLDER_PHOTOS;
  const chips = cmsOn ? ["Összes", ...GALERIA_ALBUMOK] : PLACEHOLDER_ALBUMS;
  const hasVideos = !!(videok && videok.length > 0);

  const [album, setAlbum] = useState("Összes");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const filtered = album === "Összes" ? photos : photos.filter((p) => p.album === album);

  useEffect(() => {
    if (!lightbox) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLightbox(null);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox]);

  return (
    <main className="min-h-screen">
      <PageHero
        breadcrumb="Galéria"
        eyebrow="Média"
        title={
          <>
            Pillanatok a <span className="text-gold-light">pályáról.</span>
          </>
        }
        subtitle={
          cmsOn
            ? "Mérkőzés- és eseményképek, valamint videós tartalmaink."
            : "Mérkőzés- és eseményképek, valamint videós tartalmaink. A galéria a tartalomfeltöltés során telik meg."
        }
      />

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {chips.map((a) => (
              <button
                key={a}
                onClick={() => setAlbum(a)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                  album === a
                    ? "bg-vasasRed text-white border-vasasRed"
                    : "bg-white text-navy/70 border-gray-200 hover:border-vasasRed/50 hover:text-vasasRed"
                }`}
              >
                {a}
              </button>
            ))}
            {!cmsOn && (
              <span className="sm:ml-auto">
                <SoonBadge label="CMS feltöltés — hamarosan" />
              </span>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-md border border-gray-100 bg-cream px-6 py-12 text-center text-navy/50 text-sm">
              Ebben a kategóriában még nincsenek képek.
            </div>
          ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((p, i) => (
              <motion.button
                key={`${album}-${i}`}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: (i % 8) * 0.03 }}
                onClick={() => setLightbox(p.src)}
                className={`relative overflow-hidden rounded-md bg-navy group ${
                  i % 5 === 0 ? "col-span-2 aspect-[16/9]" : "aspect-square"
                }`}
              >
                <Image
                  src={sized(p.src, 800) ?? p.src}
                  alt={p.title}
                  fill
                  className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/30 transition-colors flex items-center justify-center">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
              </motion.button>
            ))}
          </div>
          )}

          {/* Videók */}
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-display font-black text-2xl text-navy">Videók</h2>
              <span className="text-xs font-bold uppercase tracking-wider bg-vasasRed/10 text-vasasRed px-2 py-1 rounded-sm">Vasas TV</span>
            </div>
            {hasVideos ? (
              <div className="grid md:grid-cols-3 gap-5">
                {videok!.map((v) => (
                  <div key={v._id} className="rounded-md overflow-hidden border border-gray-100 bg-white">
                    <div className="[&>div]:my-0 [&>div]:rounded-none">
                      <YouTubeEmbed url={v.url} />
                    </div>
                    <div className="p-4">
                      <div className="font-display font-bold text-navy">{v.title}</div>
                      <div className="text-xs uppercase tracking-widest text-navy/50 mt-1">Vasas TV</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-5">
                {PLACEHOLDER_IMAGES.map((img, i) => (
                  <div key={i} className="rounded-md overflow-hidden border border-gray-100 bg-white group cursor-pointer">
                    <div className="relative aspect-video bg-navy">
                      <Image src={img} alt="Videó címe" fill className="object-cover opacity-70" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="h-14 w-14 rounded-full bg-vasasRed/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="6 4 20 12 6 20 6 4" /></svg>
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="font-display font-bold text-navy">Videó címe</div>
                      <div className="text-xs uppercase tracking-widest text-navy/50 mt-1">Vasas TV</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-navy-deep/90 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-5 right-5 h-10 w-10 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Bezárás"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative w-full max-w-4xl aspect-[16/10] rounded-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={sized(lightbox, 1600) ?? lightbox} alt="Nagyított kép" fill className="object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
