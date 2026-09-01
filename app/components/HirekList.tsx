"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import SoonBadge from "./site/SoonBadge";
import type { HirListItem } from "../lib/sanity/hirek";

const FO_KATEGORIAK = ["Összes", "VKLA", "VFC", "VFCII", "MLSZ", "KUPA", "SAJTÓ"];
const KOROSZTALY_KATEGORIAK = [
  "U5", "U6", "U7", "U8", "U9", "U10", "U11", "U12", "U13", "U14", "U15",
  "U16", "U17", "U18", "U19", "U10L", "U11L", "U12L", "U13L", "U14L", "U16L", "U19L", "Női",
];

function catColor(cat: string): string {
  if (/^U\d/.test(cat) || cat === "Női") return "bg-royal";
  if (cat === "VKLA") return "bg-vasasRed";
  if (cat === "VFC" || cat === "VFCII" || cat === "NBII") return "bg-navy";
  return "bg-gold";
}

function formatDate(iso: string | null): string {
  if (!iso) return "Dátum";
  return new Date(iso).toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function hrefFor(category: string, page = 1): string {
  const p = new URLSearchParams();
  if (category !== "Összes") p.set("kategoria", category);
  if (page > 1) p.set("oldal", String(page));
  const q = p.toString();
  return q ? `/hirek?${q}` : "/hirek";
}

// A kártya csak akkor kattintható, ha van valódi cikk mögötte (CMS-ből).
function CardWrap({
  slug,
  children,
  className,
}: {
  slug: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  if (slug) {
    return (
      <Link href={`/hirek/${slug}`} className={className}>
        {children}
      </Link>
    );
  }
  return <div className={`${className ?? ""} cursor-default`}>{children}</div>;
}

export default function HirekList({
  items,
  total,
  category,
  page,
  pageSize,
  cmsOn,
}: {
  items: HirListItem[];
  total: number;
  category: string;
  page: number;
  pageSize: number;
  cmsOn: boolean;
}) {
  const router = useRouter();
  const [featured, ...rest] = items;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const activeCat = category === "" ? "Összes" : category;
  const korosztalyActive = KOROSZTALY_KATEGORIAK.includes(activeCat);

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-14">
        {/* Kategória szűrő */}
        <div className="flex flex-wrap items-center gap-2 mb-10">
          {FO_KATEGORIAK.map((c) => (
            <Link
              key={c}
              href={hrefFor(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                activeCat === c
                  ? "bg-vasasRed text-white border-vasasRed"
                  : "bg-white text-navy/70 border-gray-200 hover:border-vasasRed/50 hover:text-vasasRed"
              }`}
            >
              {c}
            </Link>
          ))}
          <select
            value={korosztalyActive ? activeCat : ""}
            onChange={(e) => router.push(hrefFor(e.target.value || "Összes"))}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors focus:outline-none ${
              korosztalyActive
                ? "bg-vasasRed text-white border-vasasRed"
                : "bg-white text-navy/70 border-gray-200"
            }`}
            aria-label="Korosztály szűrő"
          >
            <option value="">Korosztályok…</option>
            {KOROSZTALY_KATEGORIAK.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {!cmsOn && (
            <span className="ml-auto">
              <SoonBadge label="CMS hírek — hamarosan" />
            </span>
          )}
        </div>

        {items.length === 0 && (
          <div className="py-16 text-center text-navy/50">
            Nincs hír ebben a kategóriában.
          </div>
        )}

        {/* Kiemelt hír */}
        {featured && (
          <motion.div
            key={`f-${activeCat}-${page}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardWrap slug={featured.slug} className="grid lg:grid-cols-2 gap-8 mb-12 group">
              <div className="relative aspect-[16/10] rounded-md overflow-hidden bg-navy">
                {featured.imageUrl && (
                  <Image
                    src={featured.imageUrl}
                    alt={featured.title}
                    fill
                    className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
                <span
                  className={`absolute top-4 left-4 ${catColor(featured.category)} text-white text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-sm`}
                >
                  {featured.category}
                </span>
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-xs text-navy/50 mb-2 font-medium">
                  {formatDate(featured.publishedAt)}
                </div>
                <h2 className="heading-display text-3xl md:text-4xl text-navy mb-4 group-hover:text-vasasRed transition-colors">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="text-navy/65 leading-relaxed mb-5">{featured.excerpt}</p>
                )}
                <span className="inline-flex items-center gap-2 text-sm font-bold text-navy">
                  Tovább olvasom
                  <span className="w-8 h-px bg-vasasRed" />
                </span>
              </div>
            </CardWrap>
          </motion.div>
        )}

        {/* Rács */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rest.map((n, i) => (
            <motion.article
              key={n._id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.4) }}
              className="group"
            >
              <CardWrap slug={n.slug} className="block">
                <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-navy">
                  {n.imageUrl && (
                    <Image
                      src={n.imageUrl}
                      alt={n.title}
                      fill
                      className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
                  <span
                    className={`absolute top-4 left-4 ${catColor(n.category)} text-white text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-sm`}
                  >
                    {n.category}
                  </span>
                </div>
                <div className="pt-5">
                  <div className="text-xs text-navy/50 mb-2 font-medium">
                    {formatDate(n.publishedAt)}
                  </div>
                  <h3 className="font-display font-bold text-2xl text-navy leading-tight mb-3 group-hover:text-vasasRed transition-colors">
                    {n.title}
                  </h3>
                  {n.excerpt && (
                    <p className="text-sm text-navy/65 leading-relaxed">{n.excerpt}</p>
                  )}
                </div>
              </CardWrap>
            </motion.article>
          ))}
        </div>

        {/* Lapozás */}
        {cmsOn && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            {page > 1 && (
              <Link
                href={hrefFor(activeCat, page - 1)}
                className="border-2 border-navy/15 hover:border-vasasRed hover:text-vasasRed transition-colors px-6 py-2.5 font-bold rounded-sm text-sm text-navy"
              >
                ← Újabb hírek
              </Link>
            )}
            <span className="text-sm text-navy/50">
              {page} / {totalPages} oldal
            </span>
            {page < totalPages && (
              <Link
                href={hrefFor(activeCat, page + 1)}
                className="border-2 border-navy/15 hover:border-vasasRed hover:text-vasasRed transition-colors px-6 py-2.5 font-bold rounded-sm text-sm text-navy"
              >
                Korábbi hírek →
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
