import type { Metadata } from "next";
import PageHero from "../../components/site/PageHero";
import SoonBadge from "../../components/site/SoonBadge";
import { getDokumentumok, type DokumentumData } from "../../lib/sanity/tartalom";

export const metadata: Metadata = {
  title: "TAO — Vasas Kubala Akadémia",
};

export const revalidate = 300;

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
        <div className="text-xs text-navy/45">PDF</div>
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

export default async function TaoPage() {
  const all = await getDokumentumok();
  const tao = all?.filter((d) => d.category === "TAO") ?? null;

  // Évek szerint csoportosítva (legfrissebb elöl), az év nélküliek a végén.
  let groups: { label: string; docs: DokumentumData[] }[] = [];
  if (tao) {
    const byYear = new Map<string, DokumentumData[]>();
    for (const d of tao) {
      const key = d.year ?? "Általános dokumentumok";
      if (!byYear.has(key)) byYear.set(key, []);
      byYear.get(key)!.push(d);
    }
    groups = [...byYear.entries()]
      .sort((a, b) => {
        if (a[0] === "Általános dokumentumok") return 1;
        if (b[0] === "Általános dokumentumok") return -1;
        return b[0].localeCompare(a[0]);
      })
      .map(([label, docs]) => ({
        label: /^\d{4}$/.test(label) ? `${label}. évi dokumentumok` : label,
        docs,
      }));
  }

  return (
    <main className="min-h-screen">
      <PageHero
        breadcrumb="TAO"
        eyebrow="Társasági adó"
        title={
          <>
            TAO <span className="text-gold-light">elszámolások.</span>
          </>
        }
        subtitle="A 107/2011. Kormányrendelet alapján itt tölthetők le a Vasas Akadémia Kft. sportfejlesztési programját jóváhagyó határozatok és a kapcsolódó dokumentumok."
      />

      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          {groups.length > 0 ? (
            groups.map((g) => (
              <div key={g.label} className="mb-8">
                <h2 className="font-display font-bold text-xl text-navy mb-3">{g.label}</h2>
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
        </div>
      </section>
    </main>
  );
}
