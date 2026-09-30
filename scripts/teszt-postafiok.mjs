// Helyi teszt-postafiók: SMTP-szerver a saját gépen, ami minden levelet
// elfogad és a .teszt-levelek/ mappába ment (.eml) — semmi nem megy ki az
// internetre. Fejlesztéshez a .env.local-ban:
//
//   SMTP_HOST=127.0.0.1
//   SMTP_PORT=2525
//   EMAIL_FROM=VKLA weboldal <teszt@vkla.hu>
//
// Futtatás:  node scripts/teszt-postafiok.mjs [--korlat N]
//   --korlat N  az N. levél után minden további levelet 451-es („korlát
//               betelt”) hibával utasít el — a szolgáltatói korlát tesztjéhez.

import { SMTPServer } from "smtp-server";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PORT = 2525;
const MAPPA = join(process.cwd(), ".teszt-levelek");
const ki = process.argv.indexOf("--korlat");
const KORLAT = ki > 0 ? Number(process.argv[ki + 1]) : Infinity;

mkdirSync(MAPPA, { recursive: true });
let fogadott = 0; // ebben a futásban
let sorszam = readdirSync(MAPPA).filter((f) => f.endsWith(".eml")).length; // a fájlnevekhez

// MIME encoded-word (=?UTF-8?B?...?= / =?UTF-8?Q?...?=) dekódolása a kiíráshoz.
function fejlecDekod(s) {
  return s.replace(/=\?([^?]+)\?([BQ])\?([^?]*)\?=\s*/gi, (_, _cs, mod, adat) =>
    mod.toUpperCase() === "B"
      ? Buffer.from(adat, "base64").toString("utf8")
      : Buffer.from(
          adat.replace(/_/g, " ").replace(/=([0-9A-F]{2})/gi, (_m, h) => String.fromCharCode(parseInt(h, 16))),
          "latin1"
        ).toString("utf8")
  );
}

function fejlec(nyers, nev) {
  const fej = nyers.split(/\r?\n\r?\n/)[0].replace(/\r?\n[ \t]+/g, " ");
  const m = fej.match(new RegExp(`^${nev}:\\s*(.*)$`, "im"));
  return m ? fejlecDekod(m[1]) : "";
}

const szerver = new SMTPServer({
  authOptional: true,
  disabledCommands: ["STARTTLS"],
  onAuth(_auth, _session, cb) {
    cb(null, { user: "teszt" });
  },
  onData(stream, session, cb) {
    const darabok = [];
    stream.on("data", (d) => darabok.push(d));
    stream.on("end", () => {
      if (fogadott >= KORLAT) {
        const hiba = new Error("4.7.1 Küldési korlát betelt (teszt)");
        hiba.responseCode = 451;
        console.log(`✗ elutasítva (korlát ${KORLAT}) → ${session.envelope.rcptTo.map((r) => r.address).join(", ")}`);
        return cb(hiba);
      }
      fogadott++;
      sorszam++;
      const nyers = Buffer.concat(darabok).toString("utf8");
      const fajl = join(MAPPA, `${String(sorszam).padStart(3, "0")}-${Date.now()}.eml`);
      writeFileSync(fajl, nyers);
      const csatolmany = /Content-Disposition:\s*attachment/i.test(nyers) ? " +csatolmány" : "";
      console.log(
        `✓ #${sorszam} → ${session.envelope.rcptTo.map((r) => r.address).join(", ")} | ${fejlec(nyers, "Subject")}` +
          ` | ${Math.round(nyers.length / 1024)} KB${csatolmany}`
      );
      cb();
    });
  },
});

szerver.listen(PORT, "127.0.0.1", () => {
  console.log(`Teszt-postafiók fut: 127.0.0.1:${PORT} → ${MAPPA}${KORLAT < Infinity ? ` (korlát: ${KORLAT})` : ""}`);
});
