# MLSZ-szinkron szerver (vkla-mlsz)

Az MLSZ Sportszervezeti API csak whitelistes IP-ről szolgál ki, ezért a mérkőzésadatokat
egy fix IP-jű szerver kéri le, és a weboldal (`app/lib/mlsz.ts`) az ott előálló JSON-t olvassa.

- **Szerver:** UpCloud `vkla-mlsz`, DE-FRA1, IPv4 **85.9.201.114** (ez van az MLSZ-nél whitelistre téve —
  a szervert törölni nem szabad, az IP-vel együtt elveszne). Ubuntu, SSH csak kulccsal.
- **API:** `https://ifa.mlsz.hu/api/{evad|verseny|merkozes|tabella}?key=…` (a leírásban szereplő
  `api.mlsz.hu` nem létezik). A tabellához `szervezet=0`. A kulcs csak a VKLA saját versenyeit látja.
- **Kulcs:** `/opt/vkla/mlsz-kulcs` (vkla, 600). Nincs a repóban, és ide sem kerülhet.
- **Szinkron:** `/opt/vkla/mlsz-sync.py` ← `mlsz-sync.py`, `vkla` felhasználóként, óránként
  (`vkla-mlsz-sync.timer`, :07-kor). Kimenet: `/var/lib/vkla-mlsz/public/vkla.json`.
- **Kiszolgálás:** Caddy (`Caddyfile` → `/etc/caddy/Caddyfile`), automatikus HTTPS:
  `https://85-9-201-114.sslip.io/vkla.json`. Élesítés előtt saját aldomainre cserélendő
  (Caddyfile + `MLSZ_ADAT_URL`).

Telepítés / frissítés (rootként a szerveren, a fájlok bemásolása után):

```
systemctl daemon-reload
systemctl enable --now vkla-mlsz-sync.timer caddy
systemctl start vkla-mlsz-sync.service && journalctl -u vkla-mlsz-sync -n 5 --no-pager
```
