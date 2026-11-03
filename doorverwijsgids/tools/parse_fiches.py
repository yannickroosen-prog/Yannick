"""Zet de werkversie van de doorverwijsgids (markdown) om naar data/fiches.js."""
import json, re, sys

src, out = sys.argv[1], sys.argv[2]
text = open(src, encoding="utf-8").read()

# Metadata uit frontmatter
meta = {}
fm = re.search(r"^---\n(.*?)\n---", text, re.S)
for line in fm.group(1).splitlines():
    k, _, v = line.partition(":")
    meta[k.strip()] = v.strip().strip('"')

FIELDS = ["ID","Deel","Thema","Onderwerp","Soort","Status","Gecontroleerd op","Waarvoor","Voor wie",
          "Voor naasten","Regio en taal","Telefoon","Chat","Mail","Website","Uren","Kosten",
          "Anoniem","Let op","Gegevens uit de gids van 2023, niet nagekeken","Trefwoorden","Bron"]
KEY = {"ID":"ids","Deel":"deel","Thema":"thema","Onderwerp":"thema","Soort":"soort","Status":"status",
       "Gecontroleerd op":"gecontroleerd","Waarvoor":"waarvoor","Voor wie":"voorWie",
       "Voor naasten":"voorNaasten","Regio en taal":"regio","Telefoon":"telefoon","Chat":"chat",
       "Mail":"mail","Website":"website","Uren":"uren","Kosten":"kosten","Anoniem":"anoniem",
       "Let op":"letOp","Gegevens uit de gids van 2023, niet nagekeken":"oud",
       "Trefwoorden":"trefwoorden","Bron":"bron"}

fiches = []
cur = None
for line in text.splitlines():
    m = re.match(r"^### (.+?) \(((?:DG-\d{3}(?:, )?)+)\)\s*$", line)
    if m:
        cur = {"id": m.group(2).split(", ")[0], "naam": m.group(1).strip()}
        fiches.append(cur)
        continue
    if line.startswith("## "):
        cur = None
        continue
    if cur is None:
        continue
    m = re.match(r"^- ([^:]+): (.*)$", line)
    if m and m.group(1) in KEY:
        k = KEY[m.group(1)]
        v = m.group(2).strip()
        if k == "ids":
            cur["ids"] = [x.strip() for x in v.split(",")]
        elif k == "trefwoorden":
            cur[k] = [x.strip() for x in v.split(",") if x.strip()]
        elif k in ("bron",):
            cur[k] = [x.strip() for x in v.split(" ; ") if x.strip()]
        else:
            cur[k] = v

# Website-veld kan meerdere URL's bevatten, gescheiden door " ; "
for f in fiches:
    if "website" in f and " ; " in f["website"]:
        f["websites"] = [x.strip() for x in f["website"].split(" ; ")]
        f["website"] = f["websites"][0]

ids = [f["id"] for f in fiches]
assert len(ids) == len(set(ids)), "dubbele fiche-id's"

from collections import Counter
print(Counter(f["status"] for f in fiches))
print(len(fiches), "fiches")

header = ("// Gegenereerd uit %s (versiedatum %s).\n"
          "// Bewerk bij voorkeur de markdown-gids en genereer dit bestand opnieuw,\n"
          "// of pas de velden hieronder rechtstreeks aan.\n" % (src.split('/')[-1], meta.get("versiedatum")))
body = json.dumps({"meta": meta, "fiches": fiches}, ensure_ascii=False, indent=2)
open(out, "w", encoding="utf-8").write(header + "window.DG_FICHES = " + body + ";\n")
