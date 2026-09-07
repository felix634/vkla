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
    { label: "Facebook", url: b?.facebook ?? null, path: "M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" },
    { label: "Instagram", url: b?.instagram ?? null, path: "M12 2.16c3.2 0 3.58 0 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58 0-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s0-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.18 8.8 2.16 12 2.16zm0 3.34a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zm0 10.72a4.22 4.22 0 1 1 0-8.44 4.22 4.22 0 0 1 0 8.44zm6.75-10.97a1.52 1.52 0 1 0 0 3.04 1.52 1.52 0 0 0 0-3.04z" },
    { label: "YouTube", url: b?.youtubeChannel ?? null, path: "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8c.3 1 1.1 1.8 2.1 2.1C4.5 20.5 12 20.5 12 20.5s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.5v-7l6.3 3.5-6.3 3.5z" },
    { label: "X", url: b?.twitter ?? null, path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
    ...(b?.tiktok
      ? [{ label: "TikTok", url: b.tiktok as string | null, path: "M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" }]
      : []),
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
              {socials.map((s) => {
                const icon = (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                );
                return s.url ? (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="w-9 h-9 rounded-sm bg-white/5 hover:bg-vasasRed transition flex items-center justify-center border border-white/10"
                  >
                    {icon}
                  </a>
                ) : (
                  <span
                    key={s.label}
                    title={s.label}
                    className="no-click w-9 h-9 rounded-sm bg-white/5 hover:bg-vasasRed transition flex items-center justify-center border border-white/10"
                  >
                    {icon}
                  </span>
                );
              })}
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
          <Link href="/dokumentumok" className="hover:text-white">Adatvédelem</Link>
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
