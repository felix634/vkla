// Fejléc feletti sáv: jelzi, hogy ez böngészhető látványterv (prototípus).
// A menü és az aloldal-linkek navigálnak; a tartalom (szövegek, képek,
// űrlapok, fizetés, backend) a következő fázisokban kerül fel.
export default function MockupBanner() {
  return (
    <div className="bg-gold text-navy text-center text-[11px] md:text-xs py-1.5 px-4 font-bold tracking-[0.15em] uppercase">
      Interaktív látványterv — az aloldalak böngészhetők · a végleges tartalom később kerül fel
    </div>
  );
}
