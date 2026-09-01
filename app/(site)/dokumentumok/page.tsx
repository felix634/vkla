import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "../../components/site/PageHero";
import SoonBadge from "../../components/site/SoonBadge";
import { getDokumentumok, type DokumentumData } from "../../lib/sanity/tartalom";

export const metadata: Metadata = {
  title: "Dokumentumok — Vasas Kubala Akadémia",
};

export const revalidate = 300;

const CATEGORY_ORDER = ["Szabályzatok", "Nyomtatványok", "Adatvédelem", "Egyéb"];

function DocRow({ title, url }: { title: string; url: string | null }) {
  const inner = (
    <>
      <span className="w-9 h-9 rounded-md bg-navy/5 text-navy flex items-center justify-center flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-navy text-sm truncate">{title}</div>
      </div>
      <span className="inline-flex items-center gap-2 text-sm font-bold text-royal flex-shrink-0">
        Letöltés
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </span>
    </>
  );
  const cls =
    "flex items-center gap-4 px-4 py-3.5 border-b border-gray-100 last:border-0 hover:bg-cream transition-colors";
  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  return <div className={`${cls} cursor-default`}>{inner}</div>;
}

export default async function DokumentumokPage() {
  const all = await getDokumentumok();
  const docs = all?.filter((d) => d.category !== "TAO") ?? null;

  let groups: { label: string; docs: DokumentumData[] }[] = [];
  if (docs) {
    groups = CATEGORY_ORDER.map((cat) => ({
      label: cat,
      docs: docs.filter((d) => d.category === cat),
    })).filter((g) => g.docs.length > 0);
  }

  return (
    <main className="min-h-screen">
      <PageHero
        breadcrumb="Dokumentumok"
        eyebrow="Letöltések"
        title={
          <>
            Dokumentumok <span className="text-gold-light">és nyomtatványok.</span>
          </>
        }
        subtitle="Szabályzatok, nyomtatványok és egyéb hasznos dokumentumok — kategóriákba rendezve, letölthető formában."
      />

      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-16 space-y-10">
          {groups.length > 0 ? (
            groups.map((g) => (
              <div key={g.label}>
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="font-display font-bold text-xl text-navy">{g.label}</h2>
                  <span className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-navy/45">{g.docs.length} dokumentum</span>
                </div>
                <div className="border border-gray-100 rounded-md overflow-hidden bg-white">
                  {g.docs.map((d) => (
                    <DocRow key={d._id} title={d.title} url={d.url} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <SoonBadge label="Dokumentumok feltöltés alatt" />
            </div>
          )}

          <div className="rounded-md bg-cream border border-gray-100 p-5 text-sm text-navy/70">
            A TAO-elszámolásokhoz kapcsolódó dokumentumok a{" "}
            <Link href="/tao" className="font-bold text-royal hover:underline">
              TAO oldalon
            </Link>{" "}
            találhatók.
          </div>
        </div>
      </section>
    </main>
  );
}
