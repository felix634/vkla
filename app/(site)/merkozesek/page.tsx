import type { Metadata } from "next";
import PageHero from "../../components/site/PageHero";
import MatchCenter from "../../components/MatchCenter";

export const metadata: Metadata = {
  title: "Mérkőzések — Vasas Kubala Akadémia",
};

export default function MerkozesekPage() {
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
        subtitle="A VKLA csapatainak mérkőzései, eredményei és tabellái — hamarosan automatikusan, az MLSZ adatbankból."
      />
      <div className="bg-cream">
        <MatchCenter />
      </div>
    </main>
  );
}
