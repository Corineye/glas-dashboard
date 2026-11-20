// ---------------------------------------------------------------------------
// glas-zuhause-card: das ganze Dashboard aus den zentralen Einstellungen.
// Kopf, Startseite der gewählten Person, Raumleiste und Raum-Blätter, mit Hintergrund.
// ---------------------------------------------------------------------------
const ZUHAUSE_CSS = `
:host{display:block;position:relative;min-height:100vh;min-height:100dvh}
.hg{position:fixed;inset:0;z-index:0;pointer-events:none}
.seite{position:relative;z-index:1;container-type:inline-size;max-width:1320px;margin:0 auto;
  padding:calc(var(--g-a5) + env(safe-area-inset-top)) var(--g-a4) calc(120px + env(safe-area-inset-bottom))}
.raster{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:var(--g-a3);margin-top:var(--g-a5);align-items:start}
.raster > *{grid-column:span 12;min-width:0}
@container (min-width:720px){.raster > .halb{grid-column:span 6}}
.abschnitt-titel{grid-column:span 12;margin:var(--g-a3) var(--g-a1) calc(-1 * var(--g-a1))}
.fav{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:var(--g-a2)}
.fav > *{min-width:0}
.leer{max-width:520px;margin:12vh auto 0;padding:var(--g-a5);border-radius:var(--g-r);text-align:center;color:var(--g-text)}
.leer h2{margin:0 0 var(--g-a2);font-size:var(--g-s-h2)}
.leer p{margin:0 0 var(--g-a4);color:var(--g-text2);font-size:var(--g-s-name);line-height:1.45}
.leer a{display:inline-flex;align-items:center;min-height:44px;padding:0 var(--g-a5);border-radius:var(--g-r-pille);background:var(--g-akzent-voll);color:#fff;font-weight:600;text-decoration:none}
.unsichtbar{display:none}
`;
const SPANNE = { klein: 3, breit: 6, gross: 6, ganz: 12 };

class GlasZuhauseCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._kinder = new Map(); // Schlüssel → Element (wird wiederverwendet, damit nichts flackert)
    this._hoerer = () => this.aufbauen();
  }
  setConfig(c) { this._config = c || {}; this.aufbauen(); }
  getCardSize() { return 12; }
  getGridOptions() { return { columns: 12, rows: "auto" }; }
  connectedCallback() {
    Glas.hoerer.add(this._hoerer);
    this._takt = setInterval(() => this.hintergrund(), 10 * 60e3);
    this.aufbauen();
  }
  disconnectedCallback() { Glas.hoerer.delete(this._hoerer); clearInterval(this._takt); }
  set hass(h) {
    const erst = !this._hass;
    this._hass = h;
    Glas.hassSetzen(h);
    if (erst) { Glas.einstLaden(h); this.aufbauen(); }
    this.hintergrund();
    this._kinder.forEach((el) => { el.hass = h; });
  }
  get hass() { return this._hass; }
  kind(schluessel, tag, cfg) {
    const k = `${schluessel}|${JSON.stringify(cfg)}`;
    let el = this._kinder.get(k);
    if (!el) {
      el = document.createElement(tag);
      try { el.setConfig(cfg); } catch (e) { el = document.createElement("div"); el.className = "leise"; el.textContent = e.message; }
      if (this._hass) el.hass = this._hass;
    }
    this._neu.set(k, el);
    return el;
  }
  hintergrund() {
    const hg = this.shadowRoot.querySelector(".hg");
    if (!hg || !this._hass) return;
    const d = istDunkel(this._hass);
    this.toggleAttribute("dunkel", d);
    const css = hintergrundCss(Glas.einst?.aussehen?.hintergrund || "aurora", d);
    if (hg._css !== css) { hg._css = css; hg.style.background = css; }
  }
  aufbauen() {
    if (!this._hass || !this.isConnected) return;
    const e = Glas.einst;
    if (!this.shadowRoot.firstChild) this.shadowRoot.innerHTML = `<style>${TOKENS}${ZUHAUSE_CSS}</style><div class="hg"></div><div class="seite"></div><div class="ebene"></div>`;
    this.hintergrund();
    const seite = this.shadowRoot.querySelector(".seite"), ebene = this.shadowRoot.querySelector(".ebene");
    if (!e) {
      const fehlt = Glas.einstFehler === "fehlt";
      seite.innerHTML = Glas.einstFehler || !Glas._einstVersprechen ? `<div class="leer glas"><h2>${fehlt ? "Integration fehlt" : "Einstellungen nicht erreichbar"}</h2>
        <p>${fehlt ? "Füge unter Einstellungen › Geräte & Dienste die Integration „Glas-Dashboard“ hinzu." : esc(Glas.einstFehler || "")}</p></div>` : "";
      return;
    }
    if (this._baut) { this._nochmal = true; return; }
    // Personen gleich hier setzen (wie die Kopf-Karte), damit die richtige Startseite kommt
    Glas.personenSetzen((e.personen || []).map((p, i) => ({ ...p, id: p.benutzer || p.name || `p${i}`, kurz: p.kurz || (p.tablet ? "" : (p.name || "?")[0].toUpperCase()) })));
    const person = Glas.aktuellePerson(this._hass);
    const schluessel = JSON.stringify([e, person?.id]);
    if (schluessel === this._schluessel) return;
    this._schluessel = schluessel;
    this._baut = true;
    try { this.bauen(e, person, seite, ebene); } finally { this._baut = false; }
    if (this._nochmal) { this._nochmal = false; queueMicrotask(() => this.aufbauen()); }
  }
  bauen(e, person, seite, ebene) {
    this._neu = new Map();
    if (!e.raeume?.length && !e.personen?.length && !(e.startseiten?.alle?.favoriten || []).length) {
      seite.innerHTML = `<div class="leer glas"><h2>Willkommen</h2><p>Richte zuerst Personen, Räume und deine Startseite ein. Danach baut sich dieses Dashboard von selbst auf.</p>
        <a href="/glas-einstellungen">Einstellungen öffnen</a></div>`;
      ebene.replaceChildren();
      this._kinder = this._neu;
      return;
    }
    const s = startseiteVon(e, person);
    const teile = [];
    teile.push(this.kind("kopf", "glas-kopf-card", { gruss_modus: e.gruss_modus || "name", gruss_text: e.gruss_text, untertitel: e.untertitel, personen: e.personen || [], chips: s.chips || [] }));
    const raster = document.createElement("div");
    raster.className = "raster";
    const b = e.bereiche || {};
    for (const a of s.abschnitte) {
      if (!a.an) continue;
      let el = null;
      if (a.id === "wetter" && b.wetter?.entity) el = this.kind("wetter", "glas-wetter-card", b.wetter);
      else if (a.id === "planer" && b.planer?.an !== false) el = this.kind("planer", "glas-planer-card", b.planer || {});
      else if (a.id === "sicherheit" && b.sicherheit && (b.sicherheit.alarm || b.sicherheit.fenster_auto !== false)) el = this.kind("sicherheit", "glas-sicherheit-card", { fenster_auto: true, ...(b.sicherheit || {}) });
      else if (a.id === "drucker" && (b.drucker?.geraet || b.drucker?.fortschritt)) el = this.kind("drucker", "glas-drucker-card", b.drucker);
      else if (a.id === "robi" && b.robi?.entity) el = this.kind("robi", "glas-robi-card", b.robi);
      else if (a.id === "gaeste" && (b.gaeste?.ssid || b.gaeste?.ssid_entity)) el = this.kind("gaeste", "glas-gaeste-card", b.gaeste);
      else if (a.id === "favoriten" && (s.favoriten || []).some((f) => f.an !== false)) {
        const wrap = document.createElement("div");
        wrap.innerHTML = `<h2 class="h2 abschnitt-titel">Favoriten</h2><div class="fav"></div>`;
        wrap.style.display = "contents";
        const fav = wrap.querySelector(".fav");
        s.favoriten.filter((f) => f.an !== false && f.entity).forEach((f, i) => {
          const k = this.kind(`fav${i}`, "glas-kachel-card", kachelCfg(f));
          const z = document.createElement("div");
          z.style.gridColumn = `span ${SPANNE[f.groesse || "breit"] || 6}`;
          z.appendChild(k);
          fav.appendChild(z);
        });
        fav.style.gridColumn = "span 12";
        raster.append(...wrap.childNodes);
        continue;
      }
      if (!el) continue;
      el.classList.toggle("halb", a.breite === "halb");
      raster.appendChild(el);
    }
    teile.push(raster);
    seite.replaceChildren(...teile);
    // Räume: Leiste + Blätter (leben unsichtbar, öffnen über #raum)
    const raeume = (e.raeume || []).filter((r) => r.hash);
    const unten = [];
    if (raeume.length) {
      unten.push(this.kind("leiste", "glas-raumleiste-card", { zuhause_zeigen: true, raeume: raeume.map((r) => ({ name: r.name, icon: r.icon, hash: r.hash, bereich: r.bereich })) }));
      raeume.forEach((r) => unten.push(this.kind(`raum-${r.hash}`, "glas-raum-card", raumCfg(this._hass, r))));
    }
    ebene.replaceChildren(...unten);
    this._kinder = this._neu;
  }
}
// Gerät aus den Einstellungen → Kachel-Konfiguration
function kachelCfg(g) {
  const { an, gruppe, ...rest } = g;
  return { groesse: "breit", zweite_zeile: "zustand", ...rest };
}
function raumCfg(hass, r) {
  const geraete = (r.geraete || raumGeraeteVorschlag(hass, r.bereich)).filter((g) => g.an !== false && g.entity);
  const cards = [];
  let gruppe = null;
  for (const g of geraete) {
    const gr = g.gruppe || gruppeVon(hass, g.entity);
    if (gr !== gruppe) { gruppe = gr; cards.push({ type: "heading", heading: (GRUPPEN.find(([id]) => id === gr) || [, "Sonstiges"])[1], heading_style: "subtitle" }); }
    cards.push({ type: "custom:glas-kachel-card", ...kachelCfg(g) });
  }
  return { hash: r.hash, name: r.name, icon: r.icon, bereich: r.bereich, temperatur: r.temperatur, feuchte: r.feuchte,
    fenster_auto: r.fenster_auto !== false, alles_aus: r.alles_aus !== false, chips: r.chips, cards };
}

class GlasZuhauseEditor extends GlasEditor {
  render() {
    if (!this._hass) return;
    this._gezeichnet = true;
    this.innerHTML = `<p style="line-height:1.45">Diese Karte baut alles aus den zentralen Einstellungen auf. Personen, Räume, Startseite und Aussehen stellst du in der Seitenleiste unter <a href="/glas-einstellungen">Glas</a> ein.</p>`;
  }
}
