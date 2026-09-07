import Image from "next/image";
import Link from "next/link";
import { FOOTER_COLUMNS, type NavLink } from "../lib/nav";
import type { BeallitasokData } from "../lib/sanity/tartalom";

function FooterLink({ link, href }: { link: NavLink; href?: string }) {
  // `block py-1.5`: mobilon a puszta 17px-es sormagasság túl kicsi érintőfelület,
  // a függőleges belső margó ~29px-re növeli anélkül, hogy a lista szétesne.
  const cls = "block py-1.5 text-sm text-white/65 hover:text-white transition cursor-pointer";
  if (link.external) {
    return (
      <a href={href ?? link.href} target="_blank" rel="noopener noreferrer" className={cls}>
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} className={cls}>
      {link.label}
    </Link>
  );
}

// A CMS beállításaiból felülírható külső linkek (végleges URL-ek az ügyféltől).
function externalOverride(label: string, b?: BeallitasokData | null): string | undefined {
  if (!b) return undefined;
  if (label.startsWith("Webshop")) return b.webshopUrl ?? undefined;
  if (label.startsWith("Vasas FC II")) return b.vasasFcIIUrl ?? undefined;
  if (label.startsWith("Vasas FC")) return b.vasasFcUrl ?? undefined;
  return undefined;
}

export default function Footer({ b }: { b?: BeallitasokData | null }) {
  const socials = [
    { label: "FB", url: b?.facebook ?? null },
    { label: "IG", url: b?.instagram ?? null },
    { label: "YT", url: b?.youtubeChannel ?? null },
    { label: "X", url: b?.twitter ?? null },
    ...(b?.tiktok ? [{ label: "TT", url: b.tiktok }] : []),
  ];

  return (
    <footer className="bg-navy-dark text-white">
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-12 gap-10">
          {/* Brand block */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-3 mb-5 w-fit">
              <Image
                src="/images/logo.png"
                alt="VKLA"
                width={56}
                height={56}
                className="h-14 w-14 object-contain"
              />
              <div className="leading-tight">
                <div className="font-display font-black text-lg tracking-wide">VASAS KUBALA</div>
                <div className="font-display font-bold text-gold text-sm tracking-[0.3em]">AKADÉMIA</div>
              </div>
            </Link>
            <p className="text-white/65 text-sm leading-relaxed max-w-sm mb-6">
              A Vasas Kubala Akadémia 2007 óta a fiatal tehetségek otthona —
              a magyar utánpótlás-labdarúgás egyik meghatározó műhelye.
            </p>
            <div className="flex items-center gap-3">
              {socials.map((s) =>
                s.url ? (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-sm bg-white/5 hover:bg-vasasRed transition flex items-center justify-center text-xs font-bold border border-white/10"
                  >
                    {s.label}
                  </a>
                ) : (
                  <span
                    key={s.label}
                    className="no-click w-9 h-9 rounded-sm bg-white/5 hover:bg-vasasRed transition flex items-center justify-center text-xs font-bold border border-white/10"
                  >
                    {s.label}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Nav columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title} className="lg:col-span-2">
              <h4 className="font-display font-bold text-sm tracking-[0.2em] uppercase text-gold-light mb-5">
                {col.title}
              </h4>
              <ul className="space-y-0.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <FooterLink link={l} href={externalOverride(l.label, b)} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
        <div>© 2026 Vasas Kubala Akadémia. Minden jog fenntartva.</div>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <span className="no-click hover:text-white">Adatvédelem</span>
          <span className="no-click hover:text-white">ÁSZF</span>
          <span className="no-click hover:text-white">Impresszum</span>
          <span className="no-click hover:text-white">Süti beállítások</span>
        </div>
      </div>

      {/* Prometheus credit */}
      <div className="border-t border-white/5 py-4 text-center text-[11px] text-white/40">
        Készítette: <span className="text-gold">Prometheus Digital</span> · Látványterv
      </div>
    </footer>
  );
}
