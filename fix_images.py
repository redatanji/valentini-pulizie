import re

replacements = [
    {
        "file": "servizi/pulizie-uffici.html",
        "search": '<div class="servizio-visual-box servizio-visual-box--uff">',
        "img": '<img src="../img/pulizia-ufficio.jpg" alt="Pulizie uffici" style="width:100%;height:200px;object-fit:cover;border-radius:12px;margin-bottom:12px;">',
    },
    {
        "file": "servizi/pulizie-post-cantiere.html",
        "search": '<div class="servizio-visual-box servizio-visual-box--cant">',
        "img": '<img src="../img/pulizia-cantiere.jpg" alt="Pulizie post cantiere" style="width:100%;height:200px;object-fit:cover;border-radius:12px;margin-bottom:12px;">',
    },
]

for r in replacements:
    with open(r["file"], "r", encoding="utf-8") as f:
        content = f.read()

    new_div = r["search"] + "\n              " + r["img"]
    if r["search"] not in content:
        print(f"SKIP: {r['file']} — pattern non trovato")
        continue
    if r["img"] in content:
        print(f"SKIP: {r['file']} — img già presente")
        continue

    content = content.replace(r["search"], new_div, 1)

    with open(r["file"], "w", encoding="utf-8") as f:
        f.write(content)

    print(f"OK: {r['file']}")
