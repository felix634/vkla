import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getHir } from "../../../lib/sanity/hirek";
import PortableBody from "../../../components/PortableBody";
import { sized } from "../../../lib/sanity/imageUrl";

export const revalidate = 300;

// A megnyitott cikknél a dátum mellett az időpont is látszik, pl. „2026. november 16. 14:05”
// (a klub kérése, 2026.11.24.; a listákban továbbra is csak a dátum). Budapesti idő szerint,
// mert a szerver UTC-ben fut.
function formatDatumIdo(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const datum = d.toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Europe/Budapest",
  });
  const ido = d.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Budapest" });
  return `${datum} ${ido}`;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const hir = await getHir(params.slug);
  if (!hir) return { title: "Hír – Vasas Kubala Akadémia" };
  return {
    title: `${hir.title} – Vasas Kubala Akadémia`,
    description: hir.excerpt ?? undefined,
    openGraph: {
      title: hir.title,
      description: hir.excerpt ?? undefined,
      type: "article",
      ...(hir.imageUrl ? { images: [`${hir.imageUrl}?w=1200&auto=format`] } : {}),
    },
  };
}

export default async function HirPage({ params }: { params: { slug: string } }) {
  const hir = await getHir(params.slug);
  if (!hir) notFound();

  return (
    <main className="min-h-screen bg-white">
      {/* Cikk-fejléc */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy to-royal/25 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gold-gradient" />
        <div className="relative max-w-3xl mx-auto px-6 py-14 md:py-16">
          <nav aria-label="Morzsamenü" className="flex items-center gap-2 text-xs text-white/60 mb-6">
            <Link href="/" className="hover:text-gold transition-colors">
              Főoldal
            </Link>
            <span className="text-white/30">/</span>
            <Link href="/hirek" className="hover:text-gold transition-colors">
              Hírek
            </Link>
          </nav>
          <div className="flex items-center gap-3 mb-4">
            <Link
              href={`/hirek?kategoria=${encodeURIComponent(hir.category)}`}
              className="bg-vasasRed text-white text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-sm hover:bg-vasasRedDark transition-colors"
            >
              {hir.category}
            </Link>
            {hir.publishedAt && (
              <time dateTime={hir.publishedAt} className="text-sm text-white/60">
                {formatDatumIdo(hir.publishedAt)}
              </time>
            )}
          </div>
          <h1 className="heading-display text-3xl md:text-5xl">{hir.title}</h1>
        </div>
      </section>

      {/* Indexkép: a saját arányában, vágás nélkül (a klub kérése, 2026.11.24.: a 16:9-es
          keret a 3:2-es képek tetejét-alját levágta). Álló képnél a magasság korlátos. */}
      {hir.imageUrl && (
        <div className="max-w-3xl mx-auto px-6 -mt-0 pt-10">
          {hir.imageMeret ? (
            <Image
              src={sized(hir.imageUrl, 1600)!}
              alt={hir.title}
              width={hir.imageMeret.width}
              height={hir.imageMeret.height}
              priority
              sizes="(max-width: 768px) 100vw, 720px"
              className="w-full h-auto max-h-[80vh] object-contain rounded-md bg-navy/5"
            />
          ) : (
            <div className="relative aspect-[3/2] rounded-md overflow-hidden bg-navy/5">
              <Image src={sized(hir.imageUrl, 1600)!} alt={hir.title} fill priority className="object-contain" />
            </div>
          )}
        </div>
      )}

      {/* Törzs */}
      <article className="max-w-3xl mx-auto px-6 py-10">
        {/* Lead: külön szövegdoboz a kép alatt (Tóth Patrik kérdése, 10.23.). */}
        {hir.lead && (
          <p className="text-lg md:text-xl font-semibold text-navy leading-relaxed border-l-4 border-vasasRed pl-5 mb-8">
            {hir.lead}
          </p>
        )}
        {hir.body && hir.body.length > 0 ? (
          <PortableBody value={hir.body} />
        ) : (
          hir.excerpt && <p className="text-navy/80 leading-relaxed">{hir.excerpt}</p>
        )}

        <div className="mt-12 pt-8 border-t border-gray-100">
          <Link
            href="/hirek"
            className="inline-flex items-center gap-2 text-sm font-bold text-navy hover:text-vasasRed transition-colors group"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="group-hover:-translate-x-1 transition-transform"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Vissza a hírekhez
          </Link>
        </div>
      </article>
    </main>
  );
}
