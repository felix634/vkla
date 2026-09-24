import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageHero from "../../components/site/PageHero";
import BelepesForm from "../../components/fiok/BelepesForm";
import { emailEnabled } from "../../lib/email";
import { fiokEnabled } from "../../lib/fiok/db";
import { aktualisEmail } from "../../lib/fiok/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Belépés a szülői fiókba — Vasas Kubala Akadémia",
  robots: { index: false },
};

export default async function BelepesPage() {
  if (fiokEnabled && (await aktualisEmail())) redirect("/fiok");

  return (
    <main className="min-h-screen">
      <PageHero
        breadcrumb="Szülői fiók"
        eyebrow="Képzési díj"
        title={
          <>
            Szülői <span className="text-gold-light">fiók.</span>
          </>
        }
        subtitle="Belépés jelszó nélkül: add meg az e-mail-címed, amelyre a képzési díj számláit kapod, és küldünk egy belépési linket."
      />

      <section className="bg-cream">
        <div className="max-w-xl mx-auto px-6 py-16">
          <div className="bg-white rounded-lg border border-gray-100 p-6 md:p-8">
            <h2 className="font-display font-bold text-xl text-navy mb-5">Belépés</h2>
            <BelepesForm enabled={fiokEnabled && emailEnabled} />
          </div>
          <p className="text-sm text-navy/55 leading-relaxed mt-6">
            A fiókban a gyermeked (vagy gyermekeid) összes képzési díj számlája egy helyen
            látható. Külön regisztráció nem kell: az a cím a belépési azonosítód, amelyre a
            számlákat kapod. Ha több e-mail-címet használsz, próbáld azzal, amelyet a
            képzési szerződésben megadtál.
          </p>
        </div>
      </section>
    </main>
  );
}
