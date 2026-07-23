// Finom "hamarosan" jelölés az API-/backend-függő részekhez
// (MLSZ adatbank, talentX mérkőzésadatok, Big Mac könyvelés, fizetési kapu).

export default function SoonBadge({ label = "Hamarosan" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-gold/15 text-gold-dark px-2 py-0.5 rounded-sm align-middle">
      <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
      {label}
    </span>
  );
}
