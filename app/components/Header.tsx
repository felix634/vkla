"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { PRIMARY_NAV, MORE_NAV, type NavLink } from "../lib/nav";

function useActive() {
  const pathname = usePathname();
  return (href: string) => {
    const base = href.split("#")[0];
    if (base === "/") return pathname === "/";
    return pathname === base || pathname.startsWith(base + "/");
  };
}

// Belső link → next/link, külső → sima <a> új tabon.
function NavAnchor({
  item,
  className,
  onClick,
  children,
}: {
  item: NavLink;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link href={item.href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

const Chevron = ({ className = "" }: { className?: string }) => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={className}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

function Dropdown({ links }: { links: NavLink[] }) {
  return (
    <div className="absolute left-0 top-full pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200">
      <div className="bg-white border border-gray-100 shadow-xl rounded-md py-2 min-w-[210px]">
        {links.map((c) => (
          <NavAnchor
            key={c.label}
            item={c}
            className="block px-4 py-2 text-sm text-navy/80 hover:bg-cream hover:text-vasasRed transition-colors"
          >
            {c.label}
          </NavAnchor>
        ))}
      </div>
    </div>
  );
}

export default function Header() {
  const reduced = useReducedMotion();
  const active = useActive();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
        <Link href="/" className="flex-shrink-0" aria-label="Vasas Kubala Akadémia — Főoldal">
          <motion.span
            className="block"
            whileHover={reduced ? undefined : { scale: 1.04 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <Image
              src="/images/logo.png"
              alt="Vasas Kubala Akadémia"
              width={64}
              height={64}
              priority
              className="block h-16 w-16 object-contain"
            />
          </motion.span>
        </Link>

        {/* Asztali menü */}
        <nav className="hidden xl:flex items-center gap-0.5">
          {PRIMARY_NAV.map((item) => (
            <div key={item.label} className="relative group">
              <NavAnchor
                item={item}
                className={`px-3 py-2 text-sm font-semibold transition-colors flex items-center gap-1 ${
                  active(item.href) ? "text-vasasRed" : "text-navy hover:text-vasasRed"
                }`}
              >
                {item.label}
                {item.children && <Chevron className="group-hover:rotate-180 transition-transform duration-300" />}
              </NavAnchor>
              {item.children && <Dropdown links={item.children} />}
            </div>
          ))}

          {/* Továbbiak */}
          <div className="relative group">
            <button className="px-3 py-2 text-sm font-semibold text-navy hover:text-vasasRed transition-colors flex items-center gap-1">
              Továbbiak
              <Chevron className="group-hover:rotate-180 transition-transform duration-300" />
            </button>
            <Dropdown links={MORE_NAV} />
          </div>
        </nav>

        {/* Jobb oldali gombok */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={reduced ? undefined : { scale: 1.08, backgroundColor: "rgb(248 250 252)" }}
            whileTap={{ scale: 0.92 }}
            className="no-click hidden md:flex h-10 w-10 items-center justify-center rounded-full text-navy"
            aria-label="Keresés"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </motion.button>

          <Link href="/kapcsolat#probaedzes" className="hidden md:block">
            <motion.span
              className="block bg-navy text-white px-5 py-2.5 rounded-sm font-semibold text-sm"
              whileHover={
                reduced
                  ? undefined
                  : { y: -2, backgroundColor: "#0046B6", boxShadow: "0 12px 28px -12px rgba(0, 70, 182, 0.55)" }
              }
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.25 }}
            >
              Jelentkezés
            </motion.span>
          </Link>

          {/* Hamburger (mobil) */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="xl:hidden h-10 w-10 flex items-center justify-center rounded-md text-navy hover:bg-cream transition-colors"
            aria-label="Menü"
            aria-expanded={open}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              {open ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobil menü */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="xl:hidden overflow-hidden border-t border-gray-100 bg-white"
          >
            <nav className="max-h-[70vh] overflow-y-auto px-6 py-4 flex flex-col gap-1">
              {PRIMARY_NAV.map((item) => (
                <div key={item.label} className="py-1">
                  <NavAnchor
                    item={item}
                    onClick={() => setOpen(false)}
                    className={`block py-1.5 font-display font-bold text-lg ${
                      active(item.href) ? "text-vasasRed" : "text-navy"
                    }`}
                  >
                    {item.label}
                  </NavAnchor>
                  {/* py-1.5: a 20px-es sormagasság mobilon túl kicsi érintőfelület */}
                  {item.children && (
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 pl-3 pb-1">
                      {item.children.map((c) => (
                        <NavAnchor
                          key={c.label}
                          item={c}
                          onClick={() => setOpen(false)}
                          className="py-1.5 text-sm text-navy/60 hover:text-vasasRed transition-colors"
                        >
                          {c.label}
                        </NavAnchor>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="border-t border-gray-100 mt-2 pt-2 flex flex-wrap gap-x-5 gap-y-1">
                {MORE_NAV.map((c) => (
                  <NavAnchor
                    key={c.label}
                    item={c}
                    onClick={() => setOpen(false)}
                    className="py-1.5 text-sm font-semibold text-navy/70 hover:text-vasasRed transition-colors"
                  >
                    {c.label}
                  </NavAnchor>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <Link
                  href="/tagdij"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center bg-vasasRed text-white px-4 py-2.5 rounded-sm font-semibold text-sm"
                >
                  Tagdíj fizetés
                </Link>
                <Link
                  href="/kapcsolat#probaedzes"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center bg-navy text-white px-4 py-2.5 rounded-sm font-semibold text-sm"
                >
                  Jelentkezés
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
