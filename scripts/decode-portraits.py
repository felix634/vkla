# Tool-results JSON fájlokból (Drive-letöltések) dekódolja a portré PNG-ket
# a Drive-tartalom/Portrék/Edzők mappába, majd törli a feldolgozott fájlt.
import base64, glob, json, os, sys

TR = r"C:\Users\local_user\.claude\projects\C--Users-local-user-Desktop-Prometheus-Digital-Websites-Vasas\d9ec4dd9-6155-4179-82f3-540a76f2a48d\tool-results"
OUT = r"C:\Users\local_user\Desktop\Prometheus Digital\Websites\Vasas\Drive-tartalom\VKLA - weboldal\Portrék\Edzők"
os.makedirs(OUT, exist_ok=True)

ok = 0
for f in glob.glob(os.path.join(TR, "*download_file_content*.txt")):
    try:
        d = json.load(open(f, encoding="utf-8"))
    except Exception as e:
        print(f"HIBA (json): {os.path.basename(f)} — {e}")
        continue
    title = d.get("title") or "ismeretlen.png"
    raw = base64.b64decode(d["content"])
    if not raw.startswith(b"\x89PNG"):
        print(f"HIBA (nem PNG): {title} — {raw[:8]!r}")
        continue
    dest = os.path.join(OUT, title)
    with open(dest, "wb") as w:
        w.write(raw)
    os.remove(f)
    print(f"OK: {title} ({len(raw)//1024} KB)")
    ok += 1
print(f"kész: {ok} fájl")
