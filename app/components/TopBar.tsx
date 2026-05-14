export default function TopBar() {
  return (
    <div className="bg-navy-dark text-white/80 text-xs">
      <div className="max-w-7xl mx-auto px-6 h-9 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <span className="no-click hover:text-gold transition flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            +36 20 378 4880
          </span>
          <span className="no-click hidden md:flex items-center gap-1.5 hover:text-gold transition">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            iroda@vkla.hu
          </span>
          <span className="hidden lg:inline text-white/50">Budapest, Fáy utca 58.</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 pr-4 mr-1 border-r border-white/15">
            <span className="no-click hover:text-gold transition cursor-default">Vasas FC</span>
            <span className="text-white/30">|</span>
            <span className="no-click text-gold font-semibold">Kubala Akadémia</span>
          </div>
          <div className="flex items-center gap-3 text-white/60">
            <span className="no-click hover:text-white"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg></span>
            <span className="no-click hover:text-white"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.16c3.2 0 3.58 0 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58 0-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s0-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.18 8.8 2.16 12 2.16zm0 3.34a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zm0 10.72a4.22 4.22 0 1 1 0-8.44 4.22 4.22 0 0 1 0 8.44zm6.75-10.97a1.52 1.52 0 1 0 0 3.04 1.52 1.52 0 0 0 0-3.04z"/></svg></span>
            <span className="no-click hover:text-white"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8c.3 1 1.1 1.8 2.1 2.1C4.5 20.5 12 20.5 12 20.5s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.5v-7l6.3 3.5-6.3 3.5z"/></svg></span>
          </div>
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-white/15">
            <button className="no-click text-white/70 hover:text-white">Bejelentkezés</button>
            <span className="text-white/30">/</span>
            <button className="no-click bg-vasasRed text-white px-3 py-1 rounded-sm font-semibold hover:bg-vasasRedDark transition">Tagdíj fizetés</button>
          </div>
        </div>
      </div>
    </div>
  );
}
