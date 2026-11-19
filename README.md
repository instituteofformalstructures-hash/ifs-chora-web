# IFS + CHORA — integrated public website

Role: public display only; not the research canon, not the IFS Sentinel app, and not a scientific proof.

Files:
- IFS home: docs/index.html
- CHORA: docs/chora/index.html
- Publication register: docs/aktualizacje/index.html
- Public manifest: docs/data/publication.json
- Disclosure validator: scripts/verify_public.py
- Deployment: GitHub Pages with validation before deployment.

## Trust boundary

A CHORA report, SHA, GitHub PR or CI PASS does not automatically become a public result. The authorized_results list remains empty until a separate, recorded author decision permits an exact source/version/claim to be disclosed and the verifier is extended accordingly.

Private research sources stay in instituteofformalstructures-hash/CHORA_RESEARCH; no workflow checks out that repo. The governance policy is IFS–TRIADA v1.0 (18 November 2026). The author requested a new integrated IFS/CHORA site on 19 November 2026; the initial scope covers programme overview only.

## Publishing a future update

1. Read the actual versioned source and manifest.
2. Draft the minimum authorized public text, leaving private staging separate.
3. Record an explicit author publication decision for that specific version and content.
4. Edit only the public manifest, then run python3 scripts/verify_public.py.
5. Commit the reviewed change. The workflow validates and deploys.
6. Record URL, commit and deployment receipt. CI is not a mathematical proof.

## Preview

From the project directory run: python3 -m http.server 8765 --directory docs
Then visit http://127.0.0.1:8765/.

The frontend has no cookies, tracking, remote fonts, databases or external runtime dependencies.

## Desktop

IFS Control Center may consume public release metadata via an independent, read-only adapter. Native IFS Sentinel GUI changes or allowlist modifications require an explicit, separately tested patch.
