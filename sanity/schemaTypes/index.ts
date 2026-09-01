import youtube from "./objects/youtube";
import instagram from "./objects/instagram";
import hir from "./hir";
import edzo from "./edzo";
import korosztaly from "./korosztaly";
import szponzor from "./szponzor";
import letesitmeny from "./letesitmeny";
import dokumentum from "./dokumentum";
import allas from "./allas";
import galeria from "./galeria";
import video from "./video";
import hetirend from "./hetirend";
import beallitasok from "./beallitasok";

export const schemaTypes = [
  // dokumentumtípusok
  hir,
  edzo,
  korosztaly,
  szponzor,
  letesitmeny,
  dokumentum,
  allas,
  galeria,
  video,
  hetirend,
  beallitasok,
  // beágyazható objektumok
  youtube,
  instagram,
];
