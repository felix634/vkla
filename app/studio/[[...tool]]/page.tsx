import { sanityEnabled } from "../../../sanity/env";
import Studio from "./Studio";

export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

// Amíg nincs Sanity-projekt beállítva (env), útmutatót mutatunk Studio helyett.
export default function StudioPage() {
  if (!sanityEnabled) {
    return (
      <main className="min-h-screen bg-navy text-white flex items-center justify-center p-8">
        <div className="max-w-lg">
          <h1 className="font-display font-black text-3xl mb-4 text-gold">
            Sanity Studio — beállítás szükséges
          </h1>
          <p className="text-white/75 leading-relaxed mb-4">
            A tartalomkezelő még nincs összekötve Sanity-projekttel. A
            bekötéshez hozd létre a projektet, majd add meg a környezeti
            változókat a <code className="text-gold-light">.env.local</code>{" "}
            fájlban (minta: <code className="text-gold-light">.env.local.example</code>).
          </p>
          <p className="text-white/50 text-sm">
            Amíg ez nincs meg, a weboldal helykitöltő tartalommal működik.
          </p>
        </div>
      </main>
    );
  }
  return <Studio />;
}
