import type { Metadata } from "next";
import { redirect } from "next/navigation";
import FiokOldal from "../../components/fiok/FiokOldal";
import RegisztracioForm from "../../components/fiok/RegisztracioForm";
import { emailEnabled } from "../../lib/email";
import { fiokEnabled } from "../../lib/fiok/db";
import { aktualisEmail } from "../../lib/fiok/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Regisztráció — Szülői fiók — Vasas Kubala Akadémia",
  robots: { index: false },
};

export default async function RegisztracioPage() {
  if (fiokEnabled && (await aktualisEmail())) redirect("/fiok");
  return (
    <FiokOldal
      cim="Regisztráció"
      alcim="Add meg a neved és azt az e-mail-címed, amelyet a klubnál megadtál — küldünk egy levelet, amelyben beállíthatod a jelszavad."
      megjegyzes="A fiókban azoknak a gyermekeknek a számlái jelennek meg, akikhez a klub a címedet hozzárendelte. Ha regisztráció után nem látod a gyermeked, keresd a klub pénzügyi ügyintézőjét."
    >
      <RegisztracioForm enabled={fiokEnabled && emailEnabled} />
    </FiokOldal>
  );
}
