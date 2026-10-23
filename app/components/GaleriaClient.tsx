"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import PageHero from "./site/PageHero";
import KepNezegeto from "./KepNezegeto";
import { sized } from "../lib/sanity/imageUrl";
import { formatDate } from "../lib/newsFormat";
import type { GaleriaAlbumData } from "../lib/sanity/tartalom";

// A galéria három szintje (Tóth Patrik, 2026.10.23., „akárcsak a Facebookon”):
// 1. két nagy album egymás mellett (Mérkőzések, Események) borítóképpel;
// 2. a kiválasztott kategória albumai;
// 3. az album képei, kattintásra nagyítva.
// A szintek URL-ből jönnek (?kategoria=…, ?album=…), így a Vissza gomb is működik.
export const KATEGORIAK = [
  { slug: "merkozesek", cms: "Mérkőzés", cim: "Mérkőzések", tartalek: "/images/flag.jpg" },
  { slug: "esemenyek", cms: "Esemény", cim: "Események", tartalek: "/images/team.jpg" },
] as const;

function Vissza({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm font-semibold text-navy/60 hover:text-vasasRed transition-colors mb-6"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
      {children}
    </Link>
  );
}

function Ures({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-gray-100 bg-cream px-6 py-12 text-center text-navy/50 text-sm">{children}</div>
  );
}

export default function GaleriaClient({
  albumok,
  kategoria,
  albumId,
}: {
  albumok?: GaleriaAlbumData[] | null;
  kategoria?: string;
  albumId?: string;
}) {
  const lista = (albumok ?? []).filter((a) => (a.imageUrls?.length ?? 0) > 0);
  const album = albumId ? lista.find((a) => a._id === albumId) ?? null : null;
  const kat = KATEGORIAK.find((k) => k.slug === kategoria) ?? (album ? KATEGORIAK.find((k) => k.cms === album.category) : undefined);
  const [index, setIndex] = useState<number | null>(null);

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
        subtitle="Mérkőzés- és eseményképek az akadémia életéből."
      />

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-14">
          {album ? (
            // 3. szint: az album képei
            <>
              <Vissza href={kat ? `/galeria?kategoria=${kat.slug}` : "/galeria"}>{kat?.cim ?? "Galéria"}</Vissza>
              <h2 className="heading-display text-3xl md:text-4xl text-navy">{album.title}</h2>
              <div className="text-sm text-navy/50 mt-2 mb-8">
                {[album.date ? formatDate(album.date) : null, `${album.imageUrls!.length} kép`].filter(Boolean).join(" · ")}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {album.imageUrls!.map((src, i) => (
                  <motion.button
                    key={src}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, delay: (i % 8) * 0.03 }}
                    onClick={() => setIndex(i)}
                    className="relative overflow-hidden rounded-md bg-navy group aspect-square"
                    aria-label={`${album.title} — ${i + 1}. kép`}
                  >
                    <Image
                      src={sized(src, 800) ?? src}
                      alt={album.title}
                      fill
                      className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
                    />
                  </motion.button>
                ))}
              </div>
              <KepNezegeto kepek={album.imageUrls!} index={index} setIndex={setIndex} alt={album.title} />
            </>
          ) : kat ? (
            // 2. szint: a kategória albumai
            <>
              <Vissza href="/galeria">Galéria</Vissza>
              <h2 className="heading-display text-3xl md:text-4xl text-navy mb-8">{kat.cim}</h2>
              {lista.filter((a) => a.category === kat.cms).length === 0 ? (
                <Ures>Ebben a kategóriában még nincs album.</Ures>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lista
                    .filter((a) => a.category === kat.cms)
                    .map((a) => (
                      <Link key={a._id} href={`/galeria?album=${a._id}`} className="group block">
                        <div className="relative aspect-[4/3] rounded-md overflow-hidden bg-navy">
                          <Image
                            src={sized(a.imageUrls![0], 800)!}
                            alt={a.title}
                            fill
                            className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                          />
                          <span className="absolute bottom-3 right-3 text-xs font-semibold bg-navy/70 text-white px-2.5 py-1 rounded-sm backdrop-blur-sm">
                            {a.imageUrls!.length} kép
                          </span>
                        </div>
                        <div className="pt-4">
                          <h3 className="font-display font-bold text-xl text-navy group-hover:text-vasasRed transition-colors">
                            {a.title}
                          </h3>
                          {a.date && <div className="text-xs text-navy/50 mt-1">{formatDate(a.date)}</div>}
                        </div>
                      </Link>
                    ))}
                </div>
              )}
            </>
          ) : (
            // 1. szint: a két nagy album
            <div className="grid md:grid-cols-2 gap-6">
              {KATEGORIAK.map((k) => {
                const sajat = lista.filter((a) => a.category === k.cms);
                const borito = sajat[0]?.imageUrls?.[0];
                return (
                  <Link
                    key={k.slug}
                    href={`/galeria?kategoria=${k.slug}`}
                    className="group relative block aspect-[4/3] rounded-lg overflow-hidden bg-navy"
                  >
                    <Image
                      src={borito ? sized(borito, 1400)! : k.tartalek}
                      alt={k.cim}
                      fill
                      className="object-cover opacity-85 transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-transparent" />
                    <div className="absolute left-0 right-0 bottom-0 p-8">
                      <h2 className="heading-display text-4xl md:text-5xl text-white">{k.cim}</h2>
                      <div className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-gold-light">
                        {sajat.length > 0 ? `${sajat.length} album` : "Hamarosan"}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-1 transition-transform">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
