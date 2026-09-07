# Az aktuális (2026.09.02-i, weboldali) Házirend-szövegből hivatalos PDF
# generálása Word automatizálással. A szöveg forrása az import-letesitmenyek.mjs
# HAZIREND tömbje (azonos az oldalon megjelenő szöveggel).
import re, os
import win32com.client

SRC = os.path.join(os.path.dirname(__file__), "import-letesitmenyek.mjs")
OUT = r"C:\Users\local_user\Desktop\Prometheus Digital\Websites\Vasas\Drive-tartalom\VKLA - weboldal\Házirend\Házirend.pdf"

src = open(SRC, encoding="utf-8").read()
block = re.search(r"const HAZIREND = \[(.*?)\n\];", src, re.S).group(1)
items = []
for m in re.finditer(r'\{ (h: true, )?t: "(.*?)" \},?\s*$', block, re.M):
    items.append(("h" if m.group(1) else "p", m.group(2)))
assert len(items) > 20, f"csak {len(items)} elem — a kinyerés hibás"

word = win32com.client.Dispatch("Word.Application")
word.Visible = False
doc = word.Documents.Add()
sel = word.Selection

# Cím
sel.Style = doc.Styles(-63)  # wdStyleTitle
sel.TypeText("Házirend")
sel.TypeParagraph()
sel.Style = doc.Styles(-1)   # wdStyleNormal
sel.Font.Bold = True
sel.TypeText("Vasas Akadémia Kft.")
sel.Font.Bold = False
sel.TypeParagraph()

for kind, text in items:
    if kind == "h":
        sel.Style = doc.Styles(-3)  # wdStyleHeading2
        sel.TypeText(text)
    else:
        sel.Style = doc.Styles(-1)
        sel.ParagraphFormat.Alignment = 3  # sorkizárt
        sel.TypeText(text)
    sel.TypeParagraph()

doc.ExportAsFixedFormat(OUT, 17)  # wdExportFormatPDF
doc.Close(False)
word.Quit()
print("PDF kész:", OUT, os.path.getsize(OUT) // 1024, "KB,", len(items), "bekezdés")
