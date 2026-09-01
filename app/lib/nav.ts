// Központi navigációs konfiguráció — egyetlen forrás a Header, a mobil menü,
// a Footer és a kereszt-linkek számára. A látványterv böngészhető prototípus:
// a belső linkek navigálnak, a külső linkek (↗) új tabon nyílnak.

export type NavLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type NavItem = NavLink & {
  children?: NavLink[];
};

// Külső célok (végleges URL-ek egyeztetés alatt az ügyféllel).
export const EXTERNAL = {
  webshop: "https://vasasfcshop.hu/",
  vasasFc: "https://www.vasasfc.hu/",
  vasasFcII: "https://www.vasasfc.hu/",
} as const;

// Elsődleges, vízszintes menü (xl felett). Alattuk mobil menü.
export const PRIMARY_NAV: NavItem[] = [
  { label: "Hírek", href: "/hirek" },
  {
    label: "Akadémia",
    href: "/akademia",
    children: [
      { label: "Bemutatkozás", href: "/akademia#bemutatkozas" },
      { label: "Kubala László", href: "/akademia#kubala" },
      { label: "Edzői stáb", href: "/akademia#stab" },
      { label: "Szervezeti struktúra", href: "/akademia#struktura" },
      { label: "Képzési modell", href: "/akademia#kepzesi-modell" },
      { label: "Együttműködések", href: "/akademia#egyuttmukodes" },
      { label: "Etikai kódex", href: "/akademia#etika" },
      { label: "Házirend", href: "/akademia#hazirend" },
    ],
  },
  {
    label: "Csapatok",
    href: "/csapatok",
    children: [
      { label: "Felső szekció (U14–U19)", href: "/csapatok#felso" },
      { label: "Alsó szekció (U5–U13)", href: "/csapatok#also" },
      { label: "Női szakág", href: "/csapatok#noi" },
      { label: "Vasas FC II ↗", href: EXTERNAL.vasasFcII, external: true },
    ],
  },
  {
    label: "Mérkőzések",
    href: "/merkozesek",
    children: [
      { label: "Naptár", href: "/merkozesek#naptar" },
      { label: "Eredmények", href: "/merkozesek#eredmenyek" },
      { label: "Bajnoki tabella", href: "/merkozesek#tabella" },
    ],
  },
  { label: "Programok", href: "/programok" },
  { label: "Galéria", href: "/galeria" },
  { label: "Létesítmények", href: "/letesitmenyek" },
  { label: "Szponzorok", href: "/szponzoracio" },
  { label: "Kapcsolat", href: "/kapcsolat" },
];

// Másodlagos menü ("Továbbiak ▾" lenyíló + mobil menü vége).
export const MORE_NAV: NavLink[] = [
  { label: "TAO", href: "/tao" },
  { label: "Karrier", href: "/karrier" },
  { label: "Dokumentumok", href: "/dokumentumok" },
  { label: "Webshop ↗", href: EXTERNAL.webshop, external: true },
];

// Footer oszlopok.
export const FOOTER_COLUMNS: { title: string; links: NavLink[] }[] = [
  {
    title: "Akadémia",
    links: [
      { label: "Bemutatkozás", href: "/akademia" },
      { label: "Edzői stáb", href: "/akademia#stab" },
      { label: "Csapatok", href: "/csapatok" },
      { label: "Létesítmények", href: "/letesitmenyek" },
      { label: "Karrier", href: "/karrier" },
    ],
  },
  {
    title: "Sport",
    links: [
      { label: "Hírek", href: "/hirek" },
      { label: "Mérkőzések", href: "/merkozesek" },
      { label: "Programok", href: "/programok" },
      { label: "Galéria", href: "/galeria" },
    ],
  },
  {
    title: "Ügyintézés",
    links: [
      { label: "Tagdíj fizetés", href: "/tagdij" },
      { label: "Próbaedzés", href: "/kapcsolat#probaedzes" },
      { label: "TAO", href: "/tao" },
      { label: "Dokumentumok", href: "/dokumentumok" },
      { label: "Kapcsolat", href: "/kapcsolat" },
    ],
  },
  {
    title: "Partnerek",
    links: [
      { label: "Szponzoráció", href: "/szponzoracio" },
      { label: "Webshop ↗", href: EXTERNAL.webshop, external: true },
      { label: "Vasas FC ↗", href: EXTERNAL.vasasFc, external: true },
      { label: "Vasas FC II ↗", href: EXTERNAL.vasasFcII, external: true },
    ],
  },
];
