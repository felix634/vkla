import type { Metadata } from "next";
import { redirect } from "next/navigation";
import FiokOldal from "../../components/fiok/FiokOldal";
import BelepesForm from "../../components/fiok/BelepesForm";
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
    <FiokOldal
      cim="Belépés"
      alcim="A szülői fiókban a gyermeked (vagy gyermekeid) összes képzési díj számlája egy helyen látható."
      megjegyzes="Mindkét szülő külön fiókot hozhat létre a saját e-mail-címével. A fiókban azoknak a gyermekeknek a számlái jelennek meg, akikhez a klub a címedet hozzárendelte."
    >
      <BelepesForm enabled={fiokEnabled} />
    </FiokOldal>
  );
}
