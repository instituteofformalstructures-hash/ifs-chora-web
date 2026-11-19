(() => {
  "use strict";

  const translations = Array.from(document.querySelectorAll("[data-pl][data-en]"));
  const langButtons = Array.from(document.querySelectorAll("[data-lang]"));
  const nav = document.getElementById("main-nav");
  const menu = document.querySelector(".menu");
  const page = document.body.getAttribute("data-page");
  let manifest = null;
  let language = "pl";

  function labelForState(state, lang) {
    const labels = {
      MANUSCRIPT: {pl:"MANUSKRYPT", en:"MANUSCRIPT"},
      EVIDENCE: {pl:"ŚWIADECTWA", en:"EVIDENCE"},
      OPEN: {pl:"OTWARTE", en:"OPEN"},
      IN_PROGRESS: {pl:"W TOKU", en:"IN PROGRESS"},
      PARKED: {pl:"ODŁOŻONE", en:"PARKED"}
    };
    return (labels[state] || {pl:"STAN ROBOCZY", en:"WORKING STATUS"})[lang];
  }

  function node(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function renderCards(records) {
    const box = document.getElementById("research-cards");
    if (!box) return;
    box.replaceChildren();
    for (const rec of records) {
      const card = node("article", "project-card");
      const top = node("div", "project-card-top");
      top.append(node("span", "project-code", rec.id));
      top.append(node("span", "project-state", labelForState(rec.state, language)));
      card.append(top);
      card.append(node("h3", "", rec["title_" + language]));
      card.append(node("p", "", rec["description_" + language]));
      card.append(node("small", "", language === "pl" ? "Wpis: opis programu, nie zatwierdzenie dowodu." : "Overview: not a proof endorsement."));
      box.append(card);
    }
  }

  function renderStatus(records) {
    const box = document.getElementById("status-rows");
    if (!box) return;
    box.replaceChildren();
    for (const rec of records) {
      const row = node("article", "status-row");
      row.append(node("strong", "", rec.id));
      const copy = node("div", "");
      copy.append(node("h3", "", rec["title_" + language]));
      copy.append(node("p", "", language === "pl" ? "Publiczny opis · niezależny odbiór i pierwszeństwo: bez awansu" : "Public overview · independent review and priority: not promoted"));
      row.append(copy);
      row.append(node("span", "status-tag", labelForState(rec.state, language)));
      box.append(row);
    }
  }

  function updateLocale() {
    document.documentElement.lang = language;
    for (const el of translations) {
      el.textContent = el.getAttribute("data-" + language);
    }
    for (const btn of langButtons) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-lang") === language ? "true" : "false");
    }
    if (manifest) {
      renderCards(manifest.research_tracks);
      renderStatus(manifest.research_tracks);
    }
  }

  langButtons.forEach(btn => btn.addEventListener("click", () => {
    language = btn.getAttribute("data-lang") === "en" ? "en" : "pl";
    updateLocale();
  }));

  if (menu && nav) {
    menu.addEventListener("click", () => {
      const opening = !nav.classList.contains("open");
      nav.classList.toggle("open", opening);
      menu.setAttribute("aria-expanded", String(opening));
    });
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      nav.classList.remove("open");
      menu.setAttribute("aria-expanded", "false");
    }));
  }

  const manifestURL = document.body.getAttribute("data-manifest");
  if (manifestURL) {
    fetch(manifestURL, {cache:"no-store"})
      .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(data => {
        if (!data || data.schema !== "ifs-chora-public/v1" || !Array.isArray(data.research_tracks)) {
          throw new Error("Invalid public release schema");
        }
        if (data.release?.publication_authorization?.status !== "APPROVED") {
          throw new Error("Publication authorization absent");
        }
        manifest = data;
        const version = document.getElementById("release-version");
        const reviewDate = document.getElementById("last-public-reviewed");
        if (version) version.textContent = "v" + data.release.version;
        if (reviewDate) reviewDate.textContent = data.release.last_public_reviewed;
        updateLocale();
      })
      .catch(() => {
        for (const id of ["research-cards", "status-rows"]) {
          const box = document.getElementById(id);
          if (box) {
            box.replaceChildren();
            box.append(node("p", "loading", language === "pl" ? "Manifest publiczny jest niedostępny. Nie wyświetlam niezweryfikowanych wpisów." : "The public manifest is unavailable. Unverified records are not displayed."));
          }
        }
      });
  }

  updateLocale();
})();
