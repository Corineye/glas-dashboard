// ---------------------------------------------------------------------------
// Glas-Dashboard · Grundbausteine (Design-Tokens, Helfer, Personen, Portale)
// ---------------------------------------------------------------------------
const VERSION = "0.9.0";

// Ein einziges Maßsystem für alle Karten (Ergebnis der Grafikprüfung):
// Abstände 4 / 8 / 12 / 16 / 20, Radien 14 / 22 / 32 / rund, Schrift 11 / 13 / 15 / 17 / 20 / 28
const TOKENS = `
:host{
  --g-a1:4px; --g-a2:8px; --g-a3:12px; --g-a4:16px; --g-a5:20px;
  --g-r-klein:14px; --g-r:22px; --g-r-blatt:32px; --g-r-pille:999px;
  --g-s-mini:11px; --g-s-klein:13px; --g-s-name:15px; --g-s-text:17px; --g-s-h2:20px; --g-s-titel:28px;
  --g-kachel-h:72px;
  --g-text:#1c1c1e; --g-text2:#5b5b62; --g-text-an:#1c1c1e; --g-text2-an:#48484a;
  --g-glas:rgba(255,255,255,.55); --g-glas-rand:rgba(255,255,255,.7);
  --g-an:rgba(255,255,255,.97); --g-an-gedimmt:rgba(255,255,255,.68);
  --g-fuell:rgba(120,120,128,.16); --g-fuell-text:#3a3a3c;
  --g-blatt:rgba(246,246,250,.82); --g-kopf:rgba(246,246,250,.9);
  --g-schatten:0 2px 10px rgba(0,0,0,.08); --g-schatten-gross:0 -10px 40px rgba(0,0,0,.18);
  --g-aktiv:#1c1c1e; --g-aktiv-text:#ffffff;
  --g-akzent:#0a84ff; --g-rot:#ff3b30; --g-orange:#ff9f0a; --g-gruen:#34c759; --g-lila:#5e5ce6;
  --g-rot-text:#c4261d;
  /* kräftigere Töne für weiße Schrift (Kontrast mind. 4,5:1) */
  --g-gruen-voll:#1f7a35; --g-rot-voll:#d70015; --g-akzent-voll:#0067d6; --g-lila-voll:#4a48c9;
  --g-trenn:rgba(60,60,67,.14);
  --g-blur:blur(20px) saturate(160%);
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",Inter,system-ui,sans-serif;
  -webkit-font-smoothing:antialiased;
}
:host([dunkel]){
  --g-text:#f2f2f7; --g-text2:#a8a8b0;
  --g-glas:rgba(44,44,52,.55); --g-glas-rand:rgba(255,255,255,.08);
  --g-an:rgba(255,255,255,.95); --g-an-gedimmt:rgba(255,255,255,.6);
  --g-fuell:rgba(255,255,255,.12); --g-fuell-text:#d1d1d6;
  --g-blatt:rgba(22,22,28,.84); --g-kopf:rgba(22,22,28,.9);
  --g-schatten:none;
  --g-aktiv:#f2f2f7; --g-aktiv-text:#1c1c1e;
  --g-rot-text:#ff8a80;
  --g-trenn:rgba(255,255,255,.09);
}
*{box-sizing:border-box}
button{font:inherit;color:inherit;border:0;margin:0;padding:0;background:none;cursor:pointer;touch-action:manipulation;
  -webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
button:focus-visible,[tabindex]:focus-visible{outline:2px solid var(--g-akzent);outline-offset:2px}
.glas{background:var(--g-glas);border:1px solid var(--g-glas-rand);-webkit-backdrop-filter:var(--g-blur);backdrop-filter:var(--g-blur)}
.karte{border-radius:var(--g-r);padding:var(--g-a4)}
.pille{display:inline-flex;align-items:center;gap:6px;min-height:32px;padding:6px 12px;border-radius:var(--g-r-pille);
  font-size:var(--g-s-klein);font-weight:600;white-space:nowrap;color:var(--g-text)}
.pille.fuell{background:var(--g-fuell);border:0}
.pille.aktiv{background:var(--g-aktiv);color:var(--g-aktiv-text)}
.punkt{width:8px;height:8px;border-radius:50%;flex:none}
.rund{flex:none;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--g-fuell);color:var(--g-text)}
.leise{font-size:var(--g-s-klein);color:var(--g-text2)}
.h2{margin:0;font-size:var(--g-s-h2);font-weight:700;color:var(--g-text)}
.link{display:inline-flex;align-items:center;gap:2px;min-height:44px;padding:0 var(--g-a1);font-size:var(--g-s-name);font-weight:600;color:var(--g-akzent)}
.pfeil-r{--mdc-icon-size:18px;flex:none;margin-right:-4px}
.k{transition:transform .16s cubic-bezier(.23,1,.32,1),background-color .2s ease}
.k:active{transform:scale(.97)}
button:not(.k):active:not(:disabled){opacity:.7}
ha-icon,ha-state-icon{--mdc-icon-size:20px;display:flex}
@media (prefers-reduced-motion:reduce){*{transition-property:opacity,background-color,color!important;animation:none!important}}
`;

const FARBEN = {
  auto: null, gelb: "#ffcc00", orange: "#ff9f0a", rot: "#ff3b30", pink: "#ff2d55", lila: "#5e5ce6",
  blau: "#0a84ff", tuerkis: "#30b0c7", gruen: "#34c759", grau: "#8e8e93",
};
const FARB_OPTIONEN = [
  ["auto", "Automatisch (nach Gerätetyp)"], ["gelb", "Gelb"], ["orange", "Orange"], ["rot", "Rot"], ["pink", "Pink"],
  ["lila", "Lila"], ["blau", "Blau"], ["tuerkis", "Türkis"], ["gruen", "Grün"], ["grau", "Grau"],
];

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const fire = (node, type, detail = {}) => node.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
const domainVon = (id) => String(id || "").split(".")[0];
const klemmen = (v, a, b) => Math.max(a, Math.min(b, v));
const heuteIso = (plus = 0) => { const d = new Date(); d.setDate(d.getDate() + plus); return isoTag(d); };
const isoTag = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const uhr = (d) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

// Farbe einer Konfiguration: Name aus der Liste oder eigener Hex-Wert
const farbeAus = (wert, fallback) => (wert && FARBEN[wert]) || (/^#[0-9a-f]{6}$/i.test(wert || "") ? wert : fallback);

// HA-Aktion auslösen (tap/hold/icon). HA wertet "hass-action" selbst aus: more-info, toggle, navigate, perform-action …
function aktion(el, config, art) {
  fire(el, "hass-action", { config, action: art });
}
function mehrInfo(el, entityId) {
  if (entityId) fire(el, "hass-more-info", { entityId });
}
function navigieren(pfad, ersetzen = false) {
  history[ersetzen ? "replaceState" : "pushState"](null, "", pfad);
  fire(window, "location-changed", { replace: ersetzen });
}
const istBearbeiten = () => new URLSearchParams(location.search).get("edit") === "1";

// Zustandstext in der Sprache von HA (mit Fallback für ältere Versionen)
function zustandText(hass, st) {
  if (!st) return "Nicht verfügbar";
  try { if (hass.formatEntityState) return hass.formatEntityState(st); } catch (_) { /* ältere HA */ }
  return st.state;
}
function attributText(hass, st, attr) {
  if (!st || !attr) return "";
  try { if (hass.formatEntityAttributeValue) return hass.formatEntityAttributeValue(st, attr); } catch (_) { /* */ }
  return String(st.attributes[attr] ?? "");
}
function relativeZeit(iso) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "gerade eben";
  if (s < 3600) return `vor ${Math.round(s / 60)} Min.`;
  if (s < 86400) return `vor ${Math.round(s / 3600)} Std.`;
  const t = Math.round(s / 86400);
  return t === 1 ? "gestern" : `vor ${t} Tagen`;
}

// Bereich (Raum) einer Entität: direkt oder über ihr Gerät
function bereichVon(hass, eid) {
  const e = hass.entities?.[eid];
  if (!e) return null;
  return e.area_id || (e.device_id && hass.devices?.[e.device_id]?.area_id) || null;
}
function entitaetenImBereich(hass, area, domains) {
  return Object.keys(hass.states).filter((eid) => (!domains || domains.includes(domainVon(eid))) && bereichVon(hass, eid) === area
    && !hass.entities?.[eid]?.hidden && !hass.entities?.[eid]?.entity_category);
}

// ---------------------------------------------------------------------------
// Gemeinsamer Zustand aller Karten: wer schaut gerade (Person), aktuelles hass
// ---------------------------------------------------------------------------
const Glas = (window.__glasDashboard = window.__glasDashboard || {
  personen: [], person: null, hass: null, hoerer: new Set(),
});
// hoerer = Personenwechsel (selten), hassHoerer = jede neue hass-Version (nur offene Steuerungen)
Glas.hassHoerer = Glas.hassHoerer || new Set();
Glas.melden = function () { this.hoerer.forEach((f) => { try { f(); } catch (e) { console.error(e); } }); };
Glas.hassSetzen = function (h) {
  if (!h || h === this.hass) return;
  this.hass = h;
  this.hassHoerer.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
};
Glas.personenSetzen = function (liste) {
  const neu = JSON.stringify(liste);
  if (neu === JSON.stringify(this.personen)) return;
  this.personen = liste;
  this.melden();
};
// Gewählte Person: pro Gerät gemerkt (Tablet bleibt Tablet), sonst die angemeldete Person
Glas.aktuellePerson = function (hass) {
  const liste = this.personen;
  let id = this.person;
  if (!id) { try { id = localStorage.getItem("glas-person"); } catch (_) { /* privat */ } }
  let p = liste.find((x) => x.id === id);
  if (!p && hass?.user) p = liste.find((x) => x.benutzer && x.benutzer === hass.user.id);
  if (!p) p = liste[0];
  if (p) return p;
  return hass?.user ? { id: hass.user.id, name: hass.user.name, kurz: (hass.user.name || "?")[0], benutzer: hass.user.id } : null;
};
Glas.personWaehlen = function (id) {
  this.person = id;
  try { localStorage.setItem("glas-person", id); } catch (_) { /* privat */ }
  this.melden();
};

// ---------------------------------------------------------------------------
// Basisklasse aller Karten
// ---------------------------------------------------------------------------
class GlasKarte extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = null;
    this._hass = null;
    this._sperre = false; // während Ziehen kein Neuzeichnen
    this._hoerer = () => { if (this._hass) this.toggleAttribute("dunkel", istDunkel(this._hass)); if (this._config && this._hass) this.render(); };
  }
  connectedCallback() { Glas.hoerer.add(this._hoerer); if (this._config && this._hass) this.render(); }
  disconnectedCallback() { Glas.hoerer.delete(this._hoerer); }
  static standard() { return {}; }
  setConfig(c) {
    if (!c) throw new Error("Keine Konfiguration");
    this.pruefen?.(c);
    this._config = { ...this.constructor.standard(), ...c };
    if (this._hass) this.render();
  }
  set hass(h) {
    const alt = this._hass;
    this._hass = h;
    Glas.hassSetzen(h);
    this.toggleAttribute("dunkel", istDunkel(h));
    if (!this._config || this._sperre) return;
    if (!alt || istDunkel(alt) !== istDunkel(h) || this.entitaeten().some((e) => alt.states[e] !== h.states[e])) this.render();
  }
  get hass() { return this._hass; }
  entitaeten() { return []; }
  getCardSize() { return 2; }
  render() {
    // Nur neu aufbauen, wenn sich wirklich etwas geändert hat (spart Neuaufbau, Icons und Unschärfe)
    const html = `<style>${TOKENS}${this.css()}</style>${this.html()}`;
    if (html === this._letztesHtml && this.shadowRoot.firstChild) return;
    this._letztesHtml = html;
    this.shadowRoot.innerHTML = html;
    this.binden?.();
  }
  css() { return ""; }
  html() { return ""; }
  $(s) { return this.shadowRoot.querySelector(s); }
  $$(s) { return [...this.shadowRoot.querySelectorAll(s)]; }
  // Icons: ha-state-icon kennt Zustände (Fenster offen/zu …), ha-icon nimmt ein festes mdi-Icon
  iconsSetzen() {
    this.$$("ha-state-icon[data-e]").forEach((el) => {
      el.hass = this._hass; el.stateObj = this._hass.states[el.dataset.e];
      if (el.dataset.i) el.icon = el.dataset.i;
    });
    this.$$("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
  }
  dienst(domain, service, data) { return this._hass.callService(domain, service, data); }
}

// ---------------------------------------------------------------------------
// Portal: Blätter und Steuerungen liegen über allem, aber innerhalb von HA,
// damit Ereignisse (Mehr-Info, Aktionen) bei Home Assistant ankommen
// ---------------------------------------------------------------------------
function portalWurzel() {
  const ha = document.querySelector("home-assistant");
  return ha?.shadowRoot || document.body;
}

// ---------------------------------------------------------------------------
// Editor-Basis: ha-form mit deutschen Beschriftungen + Listen-Editor
// ---------------------------------------------------------------------------
class GlasEditor extends HTMLElement {
  constructor() { super(); this._config = {}; this._hass = null; }
  setConfig(c) { this._config = { ...c }; this.render(); }
  set hass(h) {
    this._hass = h;
    this.querySelectorAll("ha-form").forEach((f) => { f.hass = h; });
    if (!this._gezeichnet) this.render();
  }
  schema() { return []; }
  labels() { return {}; }
  hilfen() { return {}; }
  listen() { return []; } // [{key, titel, schema, neu:()=>({}), name:(item)=>string}]
  aendern(neu) {
    this._config = neu;
    fire(this, "config-changed", { config: neu });
  }
  render() {
    if (!this._hass) return;
    this._gezeichnet = true;
    this.innerHTML = `<style>
      .ge-liste{margin-top:16px;border-top:1px solid var(--divider-color);padding-top:12px}
      .ge-kopf{display:flex;align-items:center;justify-content:space-between;font-weight:600;font-size:15px;margin:4px 0 8px}
      .ge-eintrag{border:1px solid var(--divider-color);border-radius:12px;padding:8px 12px 12px;margin-bottom:10px}
      .ge-eintrag-kopf{display:flex;align-items:center;gap:6px;margin-bottom:6px;font-weight:600}
      .ge-eintrag-kopf span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .ge-knopf{border:0;background:var(--secondary-background-color);color:var(--primary-text-color);border-radius:8px;min-width:32px;height:32px;cursor:pointer;font:inherit}
      .ge-neu{border:1px dashed var(--primary-color);color:var(--primary-color);background:none;border-radius:10px;padding:8px 12px;cursor:pointer;font:inherit;font-weight:600}
      .ge-hinweis{font-size:13px;color:var(--secondary-text-color);margin:4px 0 8px;line-height:1.4}
    </style><div class="ge-haupt"></div><div class="ge-listen"></div><div class="ge-extra"></div>`;
    const f = document.createElement("ha-form");
    f.hass = this._hass;
    f.data = this._config;
    f.schema = this.schema();
    f.computeLabel = (s) => this.labels()[s.name] ?? s.title ?? s.name;
    f.computeHelper = (s) => this.hilfen()[s.name];
    f.addEventListener("value-changed", (e) => {
      e.stopPropagation();
      const neu = { ...this._config, ...e.detail.value };
      Object.keys(neu).forEach((k) => { if (neu[k] === "" || neu[k] === undefined) delete neu[k]; });
      const strukturNeu = JSON.stringify(this.schemaSchluessel(neu)) !== JSON.stringify(this.schemaSchluessel(this._config));
      this.aendern(neu);
      if (strukturNeu) { f.data = neu; f.schema = this.schema(); } else f.data = neu;
    });
    this.querySelector(".ge-haupt").appendChild(f);
    this.listen().forEach((l) => this.listeZeichnen(l));
    this.extra?.(this.querySelector(".ge-extra"));
  }
  // Wenn sich ein Wert ändert, der das Schema verändert (z. B. Entität), Formular neu aufbauen
  schemaSchluessel(c) { return [c.entity, c.zweite_zeile, c.typ, c.gruss_modus]; }
  listeZeichnen(l) {
    const box = document.createElement("div");
    box.className = "ge-liste";
    this.querySelector(".ge-listen").appendChild(box);
    const zeichnen = () => {
      const items = this._config[l.key] || [];
      box.innerHTML = `<div class="ge-kopf">${esc(l.titel)}</div>${l.hinweis ? `<div class="ge-hinweis">${esc(l.hinweis)}</div>` : ""}`;
      items.forEach((item, i) => {
        const e = document.createElement("div");
        e.className = "ge-eintrag";
        e.innerHTML = `<div class="ge-eintrag-kopf"><span>${esc(l.name(item, i))}</span>
          <button class="ge-knopf" data-a="hoch" title="Nach oben" aria-label="Nach oben" ${i === 0 ? "disabled" : ""}><ha-icon icon="mdi:chevron-up"></ha-icon></button>
          <button class="ge-knopf" data-a="runter" title="Nach unten" aria-label="Nach unten" ${i === items.length - 1 ? "disabled" : ""}><ha-icon icon="mdi:chevron-down"></ha-icon></button>
          <button class="ge-knopf" data-a="weg" title="Entfernen" aria-label="Entfernen"><ha-icon icon="mdi:close"></ha-icon></button></div>`;
        const f = document.createElement("ha-form");
        f.hass = this._hass; f.data = item; f.schema = l.schema(item);
        f.computeLabel = (s) => l.labels?.[s.name] ?? s.name;
        f.computeHelper = (s) => l.hilfen?.[s.name];
        f.addEventListener("value-changed", (ev) => {
          ev.stopPropagation();
          const liste = [...(this._config[l.key] || [])];
          liste[i] = { ...ev.detail.value };
          Object.keys(liste[i]).forEach((k) => { if (liste[i][k] === "" || liste[i][k] === undefined) delete liste[i][k]; });
          this.aendern({ ...this._config, [l.key]: liste });
          f.data = liste[i];
          e.querySelector(".ge-eintrag-kopf span").textContent = l.name(liste[i], i);
          const sNeu = l.schema(liste[i]);
          if (JSON.stringify(sNeu.map((x) => x.name)) !== JSON.stringify(f.schema.map((x) => x.name))) f.schema = sNeu;
        });
        e.appendChild(f);
        e.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => {
          const liste = [...(this._config[l.key] || [])];
          const a = b.dataset.a;
          if (a === "weg") liste.splice(i, 1);
          if (a === "hoch" && i > 0) [liste[i - 1], liste[i]] = [liste[i], liste[i - 1]];
          if (a === "runter" && i < liste.length - 1) [liste[i + 1], liste[i]] = [liste[i], liste[i + 1]];
          this.aendern({ ...this._config, [l.key]: liste });
          zeichnen();
        }));
        box.appendChild(e);
      });
      const neu = document.createElement("button");
      neu.className = "ge-neu";
      neu.textContent = `+ ${l.neuText || "Hinzufügen"}`;
      neu.addEventListener("click", () => {
        this.aendern({ ...this._config, [l.key]: [...(this._config[l.key] || []), l.neu()] });
        zeichnen();
      });
      box.appendChild(neu);
    };
    zeichnen();
  }
}

// Schema-Bausteine für Aktionen (wie bei Tile/Bubble)
const AKTIONEN_SCHEMA = [
  { name: "tap_action", selector: { ui_action: {} } },
  { name: "icon_tap_action", selector: { ui_action: {} } },
  { name: "hold_action", selector: { ui_action: {} } },
  { name: "double_tap_action", selector: { ui_action: {} } },
];
const AKTIONEN_LABELS = {
  tap_action: "Tippen auf die Kachel", icon_tap_action: "Tippen auf das Symbol",
  hold_action: "Gedrückt halten", double_tap_action: "Doppelt tippen",
};
