# Tool-results JSON fájlokból (Drive-letöltések) PDF-ek dekódolása a
# Drive-tartalom megfelelő mappáiba, majd a feldolgozott fájl törlése.
import base64, glob, json, os

TR = r"C:\Users\local_user\.claude\projects\C--Users-local-user-Desktop-Prometheus-Digital-Websites-Vasas\d9ec4dd9-6155-4179-82f3-540a76f2a48d\tool-results"
BASE = r"C:\Users\local_user\Desktop\Prometheus Digital\Websites\Vasas\Drive-tartalom\VKLA - weboldal"

DEST = {
    "Nyílt pályázati felhívás fapótlási projektre - 2026.09.03.pdf": "TAO-program",
}
os.makedirs(os.path.join(BASE, "Adatvédelem"), exist_ok=True)

for f in glob.glob(os.path.join(TR, "*download_file_content*.txt")):
    d = json.load(open(f, encoding="utf-8"))
    title = d.get("title") or "ismeretlen"
    raw = base64.b64decode(d["content"])
    if not raw.startswith(b"%PDF"):
        print(f"KIHAGYVA (nem PDF): {title}")
        continue
    sub = DEST.get(title, "Adatvédelem")
    dest = os.path.join(BASE, sub, title)
    with open(dest, "wb") as w:
        w.write(raw)
    os.remove(f)
    print(f"OK: {sub}/{title} ({len(raw)//1024} KB)")
