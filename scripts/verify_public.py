#!/usr/bin/env python3
"""IFS/CHORA website disclosure gate. NOT a scientific proof check."""
from pathlib import Path
import json, re, sys
ROOT=Path(__file__).resolve().parents[1]
DOCS=ROOT/"docs"
DATA=DOCS/"data"/"publication.json"
errors=[]
def require(condition,message):
    if not condition:errors.append(message)
try: manifest=json.loads(DATA.read_text(encoding="utf-8"))
except Exception as exc:
    print("PUBLIC_GATE_FAILED: cannot parse manifest",exc);sys.exit(1)
require(manifest.get("schema")=="ifs-chora-public/v1","schema mismatch")
release=manifest.get("release") or {}
auth=release.get("publication_authorization") or {}
require(auth.get("status")=="APPROVED","missing site publication authorization")
require(auth.get("decision_owner")=="author","decision owner mismatch")
require(release.get("nature")=="PUBLIC_OVERVIEW_ONLY","public-only scope not declared")
require(bool(auth.get("basis")) and bool(auth.get("scope")),"approval basis or scope missing")
require((manifest.get("governance") or {}).get("canon_effect")=="NONE","site cannot modify research canon")
require((manifest.get("governance") or {}).get("scientific_promotion")=="NONE","site cannot promote mathematical statuses")
records=manifest.get("research_tracks")
require(isinstance(records,list) and len(records)>0,"missing public research overview")
if isinstance(records,list):
    seen=set()
    for x in records:
        key=x.get("id","")
        require(bool(re.fullmatch(r"[A-Z0-9-]{1,20}",key)),"invalid public project ID")
        require(key not in seen,"duplicate research track "+key);seen.add(key)
        require(x.get("state") in {"OPEN","MANUSCRIPT","EVIDENCE","IN_PROGRESS","PARKED"},"unapproved claim status "+key)
        require(x.get("claim_authorization")=="PUBLIC_OVERVIEW_ONLY","unauthorized research text "+key)
        for field in ("title_pl","title_en","description_pl","description_en","source_basis"):
            require(bool(isinstance(x.get(field),str) and x[field].strip()),"missing field "+field+" / "+key)
require(manifest.get("authorized_results")==[],"individual results require separate author publication decision")
for html in ("index.html","chora/index.html","aktualizacje/index.html"):
    p=DOCS/html;require(p.is_file(),"missing "+html)
    if p.is_file():
        txt=p.read_text(encoding="utf-8")
        require("<html" in txt and "</html>" in txt,"invalid HTML "+html)
        require('data-lang="pl"' in txt and 'data-lang="en"' in txt,"missing PL/EN "+html)
        require("noindex" not in txt.lower(),"indexing blocked "+html)
for name in ("assets/site.css","assets/site.js","assets/ifs-logo.jpg","data/publication.json",".nojekyll"):
    require((DOCS/name).is_file(),"missing published asset "+name)
for p in DOCS.rglob("*"):
    if not p.is_file() or p.suffix.lower() in {".jpg",".jpeg",".png",".webp"}:continue
    txt=p.read_text(encoding="utf-8",errors="ignore")
    for pattern in (r"gh[pousr]_[A-Za-z0-9]{18,}",r"/Users/[A-Za-z0-9_.-]+/",r"~/Desktop/",r"-----BEGIN (?:RSA |OPENSSH )?PRIVATE KEY-----",r"(?i)Bearer\s+[a-z0-9._-]{16,}"):
        require(re.search(pattern,txt) is None,"potentially private material "+str(p.relative_to(DOCS)))
    require("https://github.com/instituteofformalstructures-hash/CHORA_RESEARCH" not in txt,"private repo link published")
if errors:
    print("PUBLIC_GATE_FAILED")
    for e in errors:print(" -",e)
    sys.exit(1)
print("PUBLIC_GATE_PASS: schema, authorization, bilingual pages, disclosure checks")
print("RESEARCH_RECORDS",len(records or []),"AUTHORIZED_RESULTS",len(manifest.get("authorized_results") or []))
