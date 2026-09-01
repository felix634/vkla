import Image from "next/image";
import PortableBody from "./PortableBody";
import { sized } from "../lib/sanity/imageUrl";
import type { SzekcioData } from "../lib/sanity/tartalom";

// CMS-ből töltött szöveges szekció: cím + (opcionális) fejléc-banner +
// szöveg + (opcionális) fotórács. Az Akadémia és a Programok oldal használja.
export default function SzekcioBlock({
  szekcio,
  id,
  eyebrow,
  tone = "light",
}: {
  szekcio: SzekcioData;
  id: string;
  eyebrow?: string;
  tone?: "light" | "cream";
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-28 ${tone === "cream" ? "bg-cream" : "bg-white"}`}
    >
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-8">
          {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
          <h2 className="heading-display text-3xl md:text-4xl text-navy mt-3">
            {szekcio.title}
          </h2>
          <div className="gold-divider mt-4" />
        </div>

        {szekcio.headerImageUrl && (
          <div className="relative w-full rounded-md overflow-hidden bg-navy/5 mb-8">
            {/* A fejléc-bannerek eredeti (széles) arányukban jelennek meg */}
            <Image
              src={sized(szekcio.headerImageUrl, 1600)!}
              alt={szekcio.title}
              width={1140}
              height={400}
              className="w-full h-auto"
            />
          </div>
        )}

        {szekcio.body && szekcio.body.length > 0 && (
          <PortableBody value={szekcio.body} />
        )}

        {szekcio.imageUrls && szekcio.imageUrls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-8">
            {szekcio.imageUrls.map((u, i) => (
              <div key={i} className="relative aspect-[3/2] rounded-md overflow-hidden bg-navy/5">
                <Image
                  src={sized(u, 700)!}
                  alt={`${szekcio.title} — fotó ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
