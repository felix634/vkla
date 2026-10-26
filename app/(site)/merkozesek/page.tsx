import type { Metadata } from "next";
import PageHero from "../../components/site/PageHero";
import MatchCenter from "../../components/MatchCenter";
import { getMlszAdat, merkozesNezet } from "../../lib/mlsz";
import { getBeallitasok } from "../../lib/sanity/tartalom";
import { HIR_KOROSZTALYOK_ALAP } from "@/sanity/constants";

export const metadata: Metadata = {
  title: "Mérkőzések — Vasas Kubala Akadémia",
};

// Az MLSZ-adat óránként frissül a szerveren; az oldal 10 percenként újrarenderel.
export const revalidate = 600;

const BUDAPEST = { timeZone: "Europe/Budapest" } as const;

export default async function MerkozesekPage() {
  const [adat, b] = await Promise.all([getMlszAdat(), getBeallitasok()]);
  // A korosztály-sorrend a Hírek szűrőjével azonos (Oldal beállítások).
  const sorrend = b?.hirKorosztalyok?.length ? b.hirKorosztalyok : HIR_KOROSZTALYOK_ALAP;
  const most = new Intl.DateTimeFormat("sv-SE", {
    ...BUDAPEST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  })
    .format(new Date())
    .replace(" ", "T");
  const frissitve = adat
    ? new Intl.DateTimeFormat("hu-HU", { ...BUDAPEST, month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(
        new Date(adat.frissitve)
      )
    : undefined;

  return (
    <main className="min-h-screen">
      <PageHero
        breadcrumb="Mérkőzések"
        eyebrow="Mérkőzések"
        title={
          <>
            Menetrend és <span className="text-gold-light">eredmények.</span>
          </>
        }
        subtitle="A VKLA csapatainak mérkőzései, eredményei és tabellái, automatikusan frissülve az MLSZ adatbankjából."
      />
      <div className="bg-cream">
        <MatchCenter
          nezet={adat ? merkozesNezet(adat, sorrend, most) : null}
          frissitve={frissitve}
          evad={adat?.evad.nev}
          most={most}
        />
      </div>
    </main>
  );
}
