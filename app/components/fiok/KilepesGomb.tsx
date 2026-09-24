"use client";

export default function KilepesGomb() {
  async function kilepes() {
    await fetch("/api/fiok/kilepes", { method: "POST" }).catch(() => null);
    window.location.href = "/belepes";
  }
  return (
    <button
      type="button"
      onClick={kilepes}
      className="border border-white/25 hover:bg-white/10 transition-colors text-white font-semibold px-4 py-2 rounded-md text-sm"
    >
      Kilépés
    </button>
  );
}
