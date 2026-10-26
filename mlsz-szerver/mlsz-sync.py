#!/usr/bin/env python3
# MLSZ adatbank → vkla.json. A vkla-mlsz szerveren (85.9.201.114) fut óránként
# (vkla-mlsz-sync.timer), mert az MLSZ Sportszervezeti API csak a whitelistes
# IP-ről szolgál ki. A weboldal a Caddy által kiszolgált JSON-t olvassa.
#
# Csak a VKLA saját versenyeit látja a kulcs (más versenyre 403). A szabadnapokat
# („SPORTSZERVEZET - NINCS”, státusz 5) kihagyja. Ha egy verseny lekérése hibázik,
# az előző futás adatát tartja meg rá; ha már a verseny-lista sem jön le, nem ír.
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

API = "https://ifa.mlsz.hu/api"  # a leírásban szereplő api.mlsz.hu nem létezik
KULCS_FAJL = "/opt/vkla/mlsz-kulcs"
KIMENET = os.environ.get("MLSZ_KIMENET", "/var/lib/vkla-mlsz/public/vkla.json")
VKLA = 28541  # Egyesulet.Id
SZABADNAP = 5
SZUNET = 0.25  # másodperc két hívás között


def kulcs():
    with open(KULCS_FAJL, encoding="utf-8") as f:
        return f.read().strip()


def lekeres(utvonal, **param):
    url = f"{API}/{utvonal}?" + urllib.parse.urlencode({**param, "key": KULCS})
    for proba in range(3):
        try:
            with urllib.request.urlopen(url, timeout=30) as r:
                time.sleep(SZUNET)
                return json.load(r)
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as e:
            if isinstance(e, urllib.error.HTTPError) and e.code in (400, 403):
                raise
            time.sleep(2 * (proba + 1))
    raise RuntimeError(f"{utvonal}: 3 próbálkozás után sem sikerült")


def merkozes_sor(x, verseny_id):
    return {
        "kod": x["MerkozesKod"],
        "verseny": verseny_id,
        "ido": x["MerkozesIdeje"],  # helyi (budapesti) idő, zóna nélkül
        "helyszin": x.get("MerkozesHelye") or "",
        "hazai": x["HazaiCsapat"],
        "vendeg": x["VendegCsapat"],
        "vklaHazai": x["HazaiEgyesuletId"] == VKLA,
        "hazaiGol": x.get("HazaiGol"),
        "vendegGol": x.get("VendegGol"),
        "statusz": x["MerkozesStatusz"],  # 1 kiírt, 2 lejátszott, 5 szabadnap
        "fordulo": x.get("Fordulo"),
    }


def tabella(evad_id, verseny_id):
    t = lekeres("tabella", evad=evad_id, szervezet=0, verseny=verseny_id, szakasz=0, csoport=0, fordulo=0)
    sorok = t.get("items") if isinstance(t, dict) else None
    if not sorok:
        return None
    return {
        "fordulo": t.get("fordulo"),
        "sorok": [
            {k: s.get(k) for k in ("hely", "m", "gy", "d", "v", "lg", "kg", "gk", "p")}
            | {"csapat": s.get("webnev") or s.get("csapat"), "vkla": "VASAS KUBALA" in (s.get("csapat") or "").upper()}
            for s in sorok
        ],
    }


def elozo_adat():
    try:
        with open(KIMENET, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, json.JSONDecodeError):
        return None


def main():
    evadok = sorted(lekeres("evad"), key=lambda e: e["evadId"], reverse=True)
    elozo = elozo_adat()
    for evad in evadok[:2]:  # nyári váltáskor az új évadnak még nincs meccse
        versenyek = lekeres("verseny", evad=evad["evadId"])
        kimenet_versenyek, merkozesek, hibak = [], [], []
        for v in versenyek:
            vid, nev = v["versenyId"], v["VersenyNev"]
            try:
                osszes = lekeres("merkozes", verseny=vid)
                sajat = [
                    x for x in osszes
                    if VKLA in (x["HazaiEgyesuletId"], x["VendegEgyesuletId"]) and x["MerkozesStatusz"] != SZABADNAP
                ]
                if not sajat:
                    continue  # gyűjtő-verseny, a csoportok külön szerepelnek
                # U11 alatt és egyes leány-versenyekben nincs eredményközlés (minden 0–0).
                eredmenyes = any(x["MerkozesStatusz"] == 2 and (x["HazaiGol"] or x["VendegGol"]) for x in osszes)
                tab = tabella(evad["evadId"], vid) if eredmenyes and "Kupa" not in nev else None
            except Exception as e:  # noqa: BLE001 — egy verseny hibája ne állítsa le a többit
                hibak.append(f"{nev}: {e}")
                regi = next((rv for rv in (elozo or {}).get("versenyek", []) if rv["id"] == vid), None)
                if regi:
                    kimenet_versenyek.append(regi)
                    merkozesek += [m for m in elozo.get("merkozesek", []) if m["verseny"] == vid]
                continue
            kimenet_versenyek.append({"id": vid, "nev": nev, "eredmenyes": eredmenyes, "tabella": tab})
            merkozesek += [merkozes_sor(x, vid) for x in sajat]
        # Az előző évadra csak akkor lép vissza, ha az újban hiba nélkül sincs meccs.
        if merkozesek or hibak:
            break
    if not merkozesek:
        print("Nincs VKLA-mérkőzés (vagy minden lekérés hibázott), nem írok.", file=sys.stderr)
        for h in hibak:
            print("HIBA:", h, file=sys.stderr)
        return 1

    adat = {
        "frissitve": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "evad": {"id": evad["evadId"], "nev": evad["evadNev"]},
        "versenyek": kimenet_versenyek,
        "merkozesek": sorted(merkozesek, key=lambda m: (m["ido"], m["kod"])),
    }
    os.makedirs(os.path.dirname(KIMENET), exist_ok=True)
    ideiglenes = KIMENET + ".uj"
    with open(ideiglenes, "w", encoding="utf-8") as f:
        json.dump(adat, f, ensure_ascii=False, separators=(",", ":"))
    os.chmod(ideiglenes, 0o644)
    os.replace(ideiglenes, KIMENET)
    print(f"{adat['evad']['nev']}: {len(kimenet_versenyek)} verseny, {len(merkozesek)} mérkőzés, "
          f"{sum(1 for v in kimenet_versenyek if v['tabella'])} tabella.")
    for h in hibak:
        print("HIBA (az előző adat maradt):", h, file=sys.stderr)
    return 0


if __name__ == "__main__":
    KULCS = kulcs()
    sys.exit(main())
