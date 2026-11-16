import KiemeltHirek from "../components/KiemeltHirek";
import Academy from "../components/Academy";
import Sponsors from "../components/Sponsors";
import JoinCTA from "../components/JoinCTA";
import { getFooldalHirek } from "../lib/sanity/hirek";
import { getBeallitasok, getSzponzorok } from "../lib/sanity/tartalom";

export const revalidate = 300;

// A chrome (banner, TopBar, Header, Footer) a layout.tsx-ben van — minden aloldal osztozik rajta.
// Új elrendezés (Tóth Patrik, 2026.10.23.): kiemelt hír + 5 friss hír, alatta a
// „Több, mint egy klub” bemutatkozás, majd a partnerek. A korábbi blokkok
// (Hero, gyorslinkek, Csapatok, Mérkőzések, Programok, Létesítmények) kikerültek,
// mert a menüből mind elérhetők — a főoldal így nem duplikálja őket.
// A „Focizz Te is” blokk a partnerek elé került (Tóth Patrik, 2. kör, 2026.11.16.).
export default async function Home() {
  const [{ kiemelt, tovabbi }, szponzorok, b] = await Promise.all([
    getFooldalHirek(),
    getSzponzorok(),
    getBeallitasok(),
  ]);

  return (
    <main className="min-h-screen">
      <KiemeltHirek kiemelt={kiemelt} tovabbi={tovabbi} />
      <Academy />
      <JoinCTA b={b} />
      <Sponsors szponzorok={szponzorok} />
    </main>
  );
}
