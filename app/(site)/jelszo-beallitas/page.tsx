import type { Metadata } from "next";
import Link from "next/link";
import FiokOldal from "../../components/fiok/FiokOldal";
import JelszoForm from "../../components/fiok/JelszoForm";
import { JELSZO_MIN } from "../../lib/fiok/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Jelszó beállítása — Szülői fiók — Vasas Kubala Akadémia",
  robots: { index: false },
  // A token ne kerüljön Referer fejlécbe.
  referrer: "no-referrer",
};

export default function JelszoBeallitasPage({ searchParams }: { searchParams: { t?: string } }) {
  const token = searchParams.t ?? "";
  return (
    <FiokOldal cim="Jelszó beállítása">
      {token ? (
        <JelszoForm token={token} min={JELSZO_MIN} />
      ) : (
        <p className="text-sm text-navy/60">
          A link hiányos. Nyisd meg újra a levélből, vagy{" "}
          <Link href="/elfelejtett-jelszo" className="font-semibold text-royal underline">
            kérj újat
          </Link>
          .
        </p>
      )}
    </FiokOldal>
  );
}
