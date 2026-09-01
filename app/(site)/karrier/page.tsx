import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "../../components/site/PageHero";
import SoonBadge from "../../components/site/SoonBadge";
import { getAllasok } from "../../lib/sanity/tartalom";

export const metadata: Metadata = {
  title: "Karrier — Vasas Kubala Akadémia",
};

export const revalidate = 300;

export default async function KarrierPage() {
  const allasok = await getAllasok();

  return (
    <main className="min-h-screen">
      <PageHero
        breadcrumb="Karrier"
        eyebrow="Karrier"
        title={
          <>
            Csatlakozz a <span className="text-gold-light">stábhoz.</span>
          </>
        }
        subtitle="Nyitott pozícióink egy helyen. Ha nem találsz megfelelőt, küldd el önéletrajzod — nyilvántartásba vesszük."
      />

      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          {allasok && allasok.length > 0 ? (
            <div className="space-y-4">
              {allasok.map((j) => (
                <div
                  key={j._id}
                  className="rounded-md border border-gray-100 bg-cream p-6 hover:border-vasasRed/40 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {j.area && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-navy text-white px-2 py-1 rounded-sm">
                            {j.area}
                          </span>
                        )}
                        {j.jobType && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-vasasRed/10 text-vasasRed px-2 py-1 rounded-sm">
                            {j.jobType}
                          </span>
                        )}
                      </div>
                      <h2 className="font-display font-bold text-xl text-navy">{j.title}</h2>
                      {j.location && (
                        <div className="flex items-center gap-1.5 text-sm text-navy/55 mt-1">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-vasasRed flex-shrink-0">
                            <path d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10z" />
                            <circle cx="12" cy="11" r="2" />
                          </svg>
                          {j.location}
                        </div>
                      )}
                    </div>
                    <Link
                      href="/kapcsolat"
                      className="inline-flex items-center gap-2 bg-navy hover:bg-royal transition-colors text-white px-6 py-3 font-bold rounded-sm text-sm flex-shrink-0 self-start md:self-auto"
                    >
                      Jelentkezem
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </Link>
                  </div>
                  {j.description && (
                    <details className="mt-4 group">
                      <summary className="cursor-pointer text-sm font-bold text-royal list-none inline-flex items-center gap-2">
                        Részletek megtekintése
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-open:rotate-180 transition-transform">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </summary>
                      <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-navy/75 leading-relaxed whitespace-pre-line">
                        {j.description}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <SoonBadge label="Álláshirdetések feltöltés alatt" />
            </div>
          )}

          <div className="mt-10 rounded-md bg-navy text-white p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-20" />
            <div className="relative">
              <h3 className="font-display font-bold text-2xl mb-2">Nem találod a megfelelő pozíciót?</h3>
              <p className="text-white/70 text-sm mb-5 max-w-xl mx-auto">
                Küldd el önéletrajzod és motivációs leveled a központi e-mail címünkre — ha nyílik lehetőség, keresünk.
              </p>
              <Link href="/kapcsolat" className="inline-block bg-vasasRed hover:bg-vasasRedDark transition-colors text-white px-6 py-3 font-bold rounded-sm text-sm">
                Önéletrajz küldése
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
