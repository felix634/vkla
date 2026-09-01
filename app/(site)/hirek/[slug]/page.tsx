import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getHir } from "../../../lib/sanity/hirek";
import PortableBody from "../../../components/PortableBody";

export const revalidate = 300;

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const hir = await getHir(params.slug);
  if (!hir) return { title: "Hír — Vasas Kubala Akadémia" };
  return {
    title: `${hir.title} — Vasas Kubala Akadémia`,
    description: hir.excerpt ?? undefined,
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
            <span className="text-sm text-white/60">{formatDate(hir.publishedAt)}</span>
          </div>
          <h1 className="heading-display text-3xl md:text-5xl">{hir.title}</h1>
        </div>
      </section>

      {/* Indexkép */}
      {hir.imageUrl && (
        <div className="max-w-3xl mx-auto px-6 -mt-0 pt-10">
          <div className="relative aspect-[16/9] rounded-md overflow-hidden bg-navy/5">
            <Image
              src={hir.imageUrl}
              alt={hir.title}
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Törzs */}
      <article className="max-w-3xl mx-auto px-6 py-10">
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
