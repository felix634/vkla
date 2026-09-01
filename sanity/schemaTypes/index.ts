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
import oldalszekcio from "./oldalszekcio";

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
  oldalszekcio,
  // beágyazható objektumok
  youtube,
  instagram,
];
