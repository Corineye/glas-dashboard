/* Glas-Dashboard – Karten im Glas-Look für Home Assistant. Gebaut aus src/, nicht direkt bearbeiten. */
(() => {
// ---------------------------------------------------------------------------
// Glas-Dashboard · Grundbausteine (Design-Tokens, Helfer, Personen, Portale)
// ---------------------------------------------------------------------------
const VERSION = "0.3.0";

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
.link{min-height:44px;padding:0 var(--g-a1);font-size:var(--g-s-name);font-weight:600;color:var(--g-akzent)}
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
          <button class="ge-knopf" data-a="hoch" title="Nach oben" ${i === 0 ? "disabled" : ""}>↑</button>
          <button class="ge-knopf" data-a="runter" title="Nach unten" ${i === items.length - 1 ? "disabled" : ""}>↓</button>
          <button class="ge-knopf" data-a="weg" title="Entfernen">✕</button></div>`;
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
// ---------------------------------------------------------------------------
// Zentrale Einstellungen (Integration „Glas-Dashboard“, gespeichert auf dem Pi)
// Personen · Räume mit Geräten · Startseite pro Person · Bereiche · Aussehen
// ---------------------------------------------------------------------------
const ABSCHNITTE = [
  ["wetter", "Wetter", "mdi:weather-partly-cloudy", "ganz"], ["planer", "Planer heute", "mdi:calendar-check", "ganz"],
  ["favoriten", "Favoriten", "mdi:star-outline", "ganz"], ["sicherheit", "Sicherheit", "mdi:shield-home-outline", "ganz"],
  ["drucker", "Drucker & Werkstatt", "mdi:printer-3d-nozzle", "halb"], ["robi", "Robi", "mdi:robot-vacuum", "halb"],
  ["gaeste", "Gäste", "mdi:qrcode", "ganz"],
];
// Ganze Karten, die man wie ein Gerät in Räume und Favoriten legen kann (eingestellt unter Bereiche)
const LISTEN_KARTEN = [["drucker", "3D-Drucker", "mdi:printer-3d-nozzle", "glas-drucker-card"], ["robi", "Robi", "mdi:robot-vacuum", "glas-robi-card"]];
const listenKarte = (id) => LISTEN_KARTEN.find(([k]) => k === id);
function listenKarteCfg(x) {
  const k = listenKarte(x.karte);
  return k ? { type: `custom:${k[3]}`, ...((Glas.einst?.bereiche || {})[x.karte] || {}) } : null;
}
const GRUPPEN = [
  ["licht", "Licht"], ["klima", "Klima"], ["rollos", "Rollos"], ["schalter", "Steckdosen & Schalter"],
  ["medien", "Medien"], ["fenster", "Fenster & Türen"], ["sensoren", "Sensoren"], ["sonstiges", "Sonstiges"],
];
const gruppeVon = (hass, eid) => {
  const d = domainVon(eid), dc = hass.states[eid]?.attributes.device_class;
  if (d === "light") return "licht";
  if (["climate", "fan", "humidifier", "water_heater"].includes(d) || (d === "sensor" && ["temperature", "humidity"].includes(dc))) return "klima";
  if (d === "cover") return "rollos";
  if (["switch", "input_boolean"].includes(d)) return "schalter";
  if (d === "media_player") return "medien";
  if (d === "binary_sensor" && ["window", "door", "garage_door", "opening"].includes(dc)) return "fenster";
  if (["sensor", "binary_sensor"].includes(d)) return "sensoren";
  return "sonstiges";
};
// Was ein Raum anfangs zeigt: alles Steuerbare + Temperatur/Feuchte, aber kein Kleinkram
const RAUM_DOMAINS = ["light", "switch", "input_boolean", "fan", "cover", "climate", "media_player", "vacuum", "lock", "humidifier", "scene", "script", "button", "sensor", "binary_sensor", "camera", "select", "input_select", "number"];
function geraetVorschlag(hass, eid) {
  const d = domainVon(eid), dc = hass.states[eid]?.attributes.device_class;
  const wichtig = ["light", "switch", "fan", "cover", "climate", "media_player", "lock", "humidifier", "input_boolean"].includes(d)
    || (d === "sensor" && ["temperature", "humidity"].includes(dc)) || (d === "binary_sensor" && ["window", "door"].includes(dc));
  return { entity: eid, an: wichtig, gruppe: gruppeVon(hass, eid),
    groesse: d === "climate" ? "ganz" : d === "sensor" ? "klein" : "breit", zweite_zeile: "zustand" };
}
function raumGeraeteVorschlag(hass, bereich) {
  if (!bereich) return [];
  const reihen = GRUPPEN.map(([g]) => g);
  return entitaetenImBereich(hass, bereich, RAUM_DOMAINS).map((e) => geraetVorschlag(hass, e))
    .sort((a, b) => reihen.indexOf(a.gruppe) - reihen.indexOf(b.gruppe));
}
function einstStandard() {
  return { version: 1, personen: [], gruss_modus: "name", raeume: [], startseiten: { alle: startseiteStandard() }, bereiche: {},
    aussehen: { modus: "auto", hintergrund: "klassisch" } };
}
function startseiteStandard() {
  return { abschnitte: ABSCHNITTE.map(([id, , , breite]) => ({ id, an: true, breite })), favoriten: [], chips: [] };
}
// Startseite der gerade gewählten Person (eigene, sonst „Für alle“)
function startseiteVon(einst, person) {
  const s = einst?.startseiten || {};
  const eigen = person && s[person.id];
  const basis = eigen && eigen.eigen !== false ? eigen : s.alle || startseiteStandard();
  const bekannt = new Set((basis.abschnitte || []).map((a) => a.id));
  // neue Abschnitte aus späteren Versionen hinten anhängen
  return { ...startseiteStandard(), ...basis, abschnitte: [...(basis.abschnitte || []), ...startseiteStandard().abschnitte.filter((a) => !bekannt.has(a.id)).map((a) => ({ ...a, an: false }))] };
}

Glas.einst = Glas.einst || null;
Glas.einstFehler = null;
Glas.einstLaden = function (hass) {
  if (this._einstVersprechen || !hass?.connection) return this._einstVersprechen;
  this._einstVersprechen = hass.callWS({ type: "glas_dashboard/lesen" }).then((r) => {
    this.einst = { ...einstStandard(), ...(r.daten || {}) };
    this.timer = r.timer || {};
    this.einstFehler = null;
    hass.connection.subscribeMessage((m) => {
      if (m.timer) { this.timer = m.timer; this.hassHoerer.forEach((f) => { try { f(); } catch (e) { console.error(e); } }); }
      if (m.daten) { this.einst = { ...einstStandard(), ...m.daten }; this.melden(); }
    }, { type: "glas_dashboard/abonnieren" }).catch(() => {});
    this.melden();
    return this.einst;
  }).catch((e) => {
    this.einstFehler = e?.code === "unknown_command" ? "fehlt" : (e?.message || "Fehler");
    this._einstVersprechen = null;
    this.melden();
    return null;
  });
  return this._einstVersprechen;
};
Glas.einstSpeichern = function (hass, daten) {
  this.einst = daten;
  this.melden();
  return hass.callWS({ type: "glas_dashboard/speichern", daten });
};
// Ausschalt-Timer (läuft in der Integration, übersteht Neustarts)
Glas.timer = Glas.timer || {};
Glas.timerSetzen = function (hass, entity_id, minuten) {
  return hass.callWS({ type: "glas_dashboard/timer", entity_id, minuten }).then((r) => { this.timer = r.timer || {}; this.hassHoerer.forEach((f) => f()); });
};
function timerRest(eid) {
  const t = Glas.timer?.[eid];
  if (!t) return null;
  const min = Math.max(0, Math.round((new Date(t).getTime() - Date.now()) / 60000));
  return min >= 60 ? `${Math.floor(min / 60)} Std. ${min % 60 ? `${min % 60} Min.` : ""}`.trim() : `${min} Min.`;
}
// Hell/Dunkel: folgt HA bzw. dem Handy, außer in den Einstellungen fest gewählt
function istDunkel(h) {
  const m = Glas.einst?.aussehen?.modus;
  if (m === "hell") return false;
  if (m === "dunkel") return true;
  return !!h?.themes?.darkMode;
}

// ---------------------------------------------------------------------------
// Hintergründe: weiche Farbflächen hinter dem Glas (ruhig, ohne Bewegung)
// ---------------------------------------------------------------------------
const HINTERGRUENDE = {
  klassisch: { name: "Glas (wie bisher)", verlauf: true, hell: ["#dfe9f7", "#eee3f1", "#f8eadb"], dunkel: ["#1b2742", "#0d111c", "#271c33"] },
  aurora: { name: "Aurora", hell: ["#eef1f8", "#bcd6ff", "#e2d3ff", "#ffdcc4", "#c9efe2"], dunkel: ["#0b0d14", "#1b3566", "#36225a", "#4a2a1c", "#0f3b37"] },
  morgen: { name: "Morgenrot", hell: ["#fbf1ec", "#ffd3c2", "#ffe6b3", "#f6c9de", "#e4dcff"], dunkel: ["#120c0e", "#4a1f1b", "#4a3510", "#45193a", "#26204a"] },
  see: { name: "See", hell: ["#ecf4f6", "#b9e3ef", "#cfe7ff", "#d5f2e6", "#e6e0fa"], dunkel: ["#081114", "#0f3a48", "#132f57", "#0f3d2f", "#262150"] },
  wald: { name: "Wald", hell: ["#eff4ee", "#cfe8c8", "#e4efc0", "#c7e6dc", "#f0e3cc"], dunkel: ["#0b100c", "#1d3a1f", "#36391a", "#123832", "#3a2e18"] },
  ruhig: { name: "Ruhig", hell: ["#f1f1f4", "#e3e5ec", "#ecebf0", "#e8e6e3", "#e5e9ea"], dunkel: ["#111114", "#1f2129", "#23222a", "#24221f", "#1e2326"] },
};
// „Nach Tageszeit“: morgens warm, tagsüber Aurora, abends See, nachts ruhig
const tageszeitHg = () => { const s = new Date().getHours(); return s < 6 ? "ruhig" : s < 10 ? "morgen" : s < 17 ? "klassisch" : s < 21 ? "see" : "ruhig"; };
function hintergrundCss(id, dunkel) {
  const wahl = id === "tageszeit" ? tageszeitHg() : id;
  const h = HINTERGRUENDE[wahl];
  if (!h) return "var(--primary-background-color)";
  if (h.verlauf) { const [a, b, c] = h[dunkel ? "dunkel" : "hell"]; return `linear-gradient(160deg, ${a} 0%, ${b} 55%, ${c} 100%)`; }
  const [b, c1, c2, c3, c4] = h[dunkel ? "dunkel" : "hell"];
  const a = dunkel ? "cc" : "ff";
  return `radial-gradient(70% 55% at 8% 0%, ${c1}${a} 0%, transparent 70%),radial-gradient(55% 50% at 100% 12%, ${c2}${a} 0%, transparent 70%),`
    + `radial-gradient(65% 55% at 85% 100%, ${c3}${a} 0%, transparent 72%),radial-gradient(60% 50% at 0% 92%, ${c4}${a} 0%, transparent 70%),${b}`;
}
// QR-Code-Erzeugung: qrcode-generator 1.4.4 von Kazuhiko Arase, MIT-Lizenz (https://github.com/kazuhikoarase/qrcode-generator)
//---------------------------------------------------------------------
//
// QR Code Generator for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//  http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------

var qrcode = function() {

  //---------------------------------------------------------------------
  // qrcode
  //---------------------------------------------------------------------

  /**
   * qrcode
   * @param typeNumber 1 to 40
   * @param errorCorrectionLevel 'L','M','Q','H'
   */
  var qrcode = function(typeNumber, errorCorrectionLevel) {

    var PAD0 = 0xEC;
    var PAD1 = 0x11;

    var _typeNumber = typeNumber;
    var _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
    var _modules = null;
    var _moduleCount = 0;
    var _dataCache = null;
    var _dataList = [];

    var _this = {};

    var makeImpl = function(test, maskPattern) {

      _moduleCount = _typeNumber * 4 + 17;
      _modules = function(moduleCount) {
        var modules = new Array(moduleCount);
        for (var row = 0; row < moduleCount; row += 1) {
          modules[row] = new Array(moduleCount);
          for (var col = 0; col < moduleCount; col += 1) {
            modules[row][col] = null;
          }
        }
        return modules;
      }(_moduleCount);

      setupPositionProbePattern(0, 0);
      setupPositionProbePattern(_moduleCount - 7, 0);
      setupPositionProbePattern(0, _moduleCount - 7);
      setupPositionAdjustPattern();
      setupTimingPattern();
      setupTypeInfo(test, maskPattern);

      if (_typeNumber >= 7) {
        setupTypeNumber(test);
      }

      if (_dataCache == null) {
        _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
      }

      mapData(_dataCache, maskPattern);
    };

    var setupPositionProbePattern = function(row, col) {

      for (var r = -1; r <= 7; r += 1) {

        if (row + r <= -1 || _moduleCount <= row + r) continue;

        for (var c = -1; c <= 7; c += 1) {

          if (col + c <= -1 || _moduleCount <= col + c) continue;

          if ( (0 <= r && r <= 6 && (c == 0 || c == 6) )
              || (0 <= c && c <= 6 && (r == 0 || r == 6) )
              || (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
            _modules[row + r][col + c] = true;
          } else {
            _modules[row + r][col + c] = false;
          }
        }
      }
    };

    var getBestMaskPattern = function() {

      var minLostPoint = 0;
      var pattern = 0;

      for (var i = 0; i < 8; i += 1) {

        makeImpl(true, i);

        var lostPoint = QRUtil.getLostPoint(_this);

        if (i == 0 || minLostPoint > lostPoint) {
          minLostPoint = lostPoint;
          pattern = i;
        }
      }

      return pattern;
    };

    var setupTimingPattern = function() {

      for (var r = 8; r < _moduleCount - 8; r += 1) {
        if (_modules[r][6] != null) {
          continue;
        }
        _modules[r][6] = (r % 2 == 0);
      }

      for (var c = 8; c < _moduleCount - 8; c += 1) {
        if (_modules[6][c] != null) {
          continue;
        }
        _modules[6][c] = (c % 2 == 0);
      }
    };

    var setupPositionAdjustPattern = function() {

      var pos = QRUtil.getPatternPosition(_typeNumber);

      for (var i = 0; i < pos.length; i += 1) {

        for (var j = 0; j < pos.length; j += 1) {

          var row = pos[i];
          var col = pos[j];

          if (_modules[row][col] != null) {
            continue;
          }

          for (var r = -2; r <= 2; r += 1) {

            for (var c = -2; c <= 2; c += 1) {

              if (r == -2 || r == 2 || c == -2 || c == 2
                  || (r == 0 && c == 0) ) {
                _modules[row + r][col + c] = true;
              } else {
                _modules[row + r][col + c] = false;
              }
            }
          }
        }
      }
    };

    var setupTypeNumber = function(test) {

      var bits = QRUtil.getBCHTypeNumber(_typeNumber);

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
      }

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
      }
    };

    var setupTypeInfo = function(test, maskPattern) {

      var data = (_errorCorrectionLevel << 3) | maskPattern;
      var bits = QRUtil.getBCHTypeInfo(data);

      // vertical
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 6) {
          _modules[i][8] = mod;
        } else if (i < 8) {
          _modules[i + 1][8] = mod;
        } else {
          _modules[_moduleCount - 15 + i][8] = mod;
        }
      }

      // horizontal
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 8) {
          _modules[8][_moduleCount - i - 1] = mod;
        } else if (i < 9) {
          _modules[8][15 - i - 1 + 1] = mod;
        } else {
          _modules[8][15 - i - 1] = mod;
        }
      }

      // fixed module
      _modules[_moduleCount - 8][8] = (!test);
    };

    var mapData = function(data, maskPattern) {

      var inc = -1;
      var row = _moduleCount - 1;
      var bitIndex = 7;
      var byteIndex = 0;
      var maskFunc = QRUtil.getMaskFunction(maskPattern);

      for (var col = _moduleCount - 1; col > 0; col -= 2) {

        if (col == 6) col -= 1;

        while (true) {

          for (var c = 0; c < 2; c += 1) {

            if (_modules[row][col - c] == null) {

              var dark = false;

              if (byteIndex < data.length) {
                dark = ( ( (data[byteIndex] >>> bitIndex) & 1) == 1);
              }

              var mask = maskFunc(row, col - c);

              if (mask) {
                dark = !dark;
              }

              _modules[row][col - c] = dark;
              bitIndex -= 1;

              if (bitIndex == -1) {
                byteIndex += 1;
                bitIndex = 7;
              }
            }
          }

          row += inc;

          if (row < 0 || _moduleCount <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    };

    var createBytes = function(buffer, rsBlocks) {

      var offset = 0;

      var maxDcCount = 0;
      var maxEcCount = 0;

      var dcdata = new Array(rsBlocks.length);
      var ecdata = new Array(rsBlocks.length);

      for (var r = 0; r < rsBlocks.length; r += 1) {

        var dcCount = rsBlocks[r].dataCount;
        var ecCount = rsBlocks[r].totalCount - dcCount;

        maxDcCount = Math.max(maxDcCount, dcCount);
        maxEcCount = Math.max(maxEcCount, ecCount);

        dcdata[r] = new Array(dcCount);

        for (var i = 0; i < dcdata[r].length; i += 1) {
          dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
        }
        offset += dcCount;

        var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
        var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

        var modPoly = rawPoly.mod(rsPoly);
        ecdata[r] = new Array(rsPoly.getLength() - 1);
        for (var i = 0; i < ecdata[r].length; i += 1) {
          var modIndex = i + modPoly.getLength() - ecdata[r].length;
          ecdata[r][i] = (modIndex >= 0)? modPoly.getAt(modIndex) : 0;
        }
      }

      var totalCodeCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalCodeCount += rsBlocks[i].totalCount;
      }

      var data = new Array(totalCodeCount);
      var index = 0;

      for (var i = 0; i < maxDcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < dcdata[r].length) {
            data[index] = dcdata[r][i];
            index += 1;
          }
        }
      }

      for (var i = 0; i < maxEcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < ecdata[r].length) {
            data[index] = ecdata[r][i];
            index += 1;
          }
        }
      }

      return data;
    };

    var createData = function(typeNumber, errorCorrectionLevel, dataList) {

      var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel);

      var buffer = qrBitBuffer();

      for (var i = 0; i < dataList.length; i += 1) {
        var data = dataList[i];
        buffer.put(data.getMode(), 4);
        buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
        data.write(buffer);
      }

      // calc num max data.
      var totalDataCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalDataCount += rsBlocks[i].dataCount;
      }

      if (buffer.getLengthInBits() > totalDataCount * 8) {
        throw 'code length overflow. ('
          + buffer.getLengthInBits()
          + '>'
          + totalDataCount * 8
          + ')';
      }

      // end code
      if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
        buffer.put(0, 4);
      }

      // padding
      while (buffer.getLengthInBits() % 8 != 0) {
        buffer.putBit(false);
      }

      // padding
      while (true) {

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD0, 8);

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD1, 8);
      }

      return createBytes(buffer, rsBlocks);
    };

    _this.addData = function(data, mode) {

      mode = mode || 'Byte';

      var newData = null;

      switch(mode) {
      case 'Numeric' :
        newData = qrNumber(data);
        break;
      case 'Alphanumeric' :
        newData = qrAlphaNum(data);
        break;
      case 'Byte' :
        newData = qr8BitByte(data);
        break;
      case 'Kanji' :
        newData = qrKanji(data);
        break;
      default :
        throw 'mode:' + mode;
      }

      _dataList.push(newData);
      _dataCache = null;
    };

    _this.isDark = function(row, col) {
      if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
        throw row + ',' + col;
      }
      return _modules[row][col];
    };

    _this.getModuleCount = function() {
      return _moduleCount;
    };

    _this.make = function() {
      if (_typeNumber < 1) {
        var typeNumber = 1;

        for (; typeNumber < 40; typeNumber++) {
          var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, _errorCorrectionLevel);
          var buffer = qrBitBuffer();

          for (var i = 0; i < _dataList.length; i++) {
            var data = _dataList[i];
            buffer.put(data.getMode(), 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
            data.write(buffer);
          }

          var totalDataCount = 0;
          for (var i = 0; i < rsBlocks.length; i++) {
            totalDataCount += rsBlocks[i].dataCount;
          }

          if (buffer.getLengthInBits() <= totalDataCount * 8) {
            break;
          }
        }

        _typeNumber = typeNumber;
      }

      makeImpl(false, getBestMaskPattern() );
    };

    _this.createTableTag = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var qrHtml = '';

      qrHtml += '<table style="';
      qrHtml += ' border-width: 0px; border-style: none;';
      qrHtml += ' border-collapse: collapse;';
      qrHtml += ' padding: 0px; margin: ' + margin + 'px;';
      qrHtml += '">';
      qrHtml += '<tbody>';

      for (var r = 0; r < _this.getModuleCount(); r += 1) {

        qrHtml += '<tr>';

        for (var c = 0; c < _this.getModuleCount(); c += 1) {
          qrHtml += '<td style="';
          qrHtml += ' border-width: 0px; border-style: none;';
          qrHtml += ' border-collapse: collapse;';
          qrHtml += ' padding: 0px; margin: 0px;';
          qrHtml += ' width: ' + cellSize + 'px;';
          qrHtml += ' height: ' + cellSize + 'px;';
          qrHtml += ' background-color: ';
          qrHtml += _this.isDark(r, c)? '#000000' : '#ffffff';
          qrHtml += ';';
          qrHtml += '"/>';
        }

        qrHtml += '</tr>';
      }

      qrHtml += '</tbody>';
      qrHtml += '</table>';

      return qrHtml;
    };

    _this.createSvgTag = function(cellSize, margin, alt, title) {

      var opts = {};
      if (typeof arguments[0] == 'object') {
        // Called by options.
        opts = arguments[0];
        // overwrite cellSize and margin.
        cellSize = opts.cellSize;
        margin = opts.margin;
        alt = opts.alt;
        title = opts.title;
      }

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      // Compose alt property surrogate
      alt = (typeof alt === 'string') ? {text: alt} : alt || {};
      alt.text = alt.text || null;
      alt.id = (alt.text) ? alt.id || 'qrcode-description' : null;

      // Compose title property surrogate
      title = (typeof title === 'string') ? {text: title} : title || {};
      title.text = title.text || null;
      title.id = (title.text) ? title.id || 'qrcode-title' : null;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var c, mc, r, mr, qrSvg='', rect;

      rect = 'l' + cellSize + ',0 0,' + cellSize +
        ' -' + cellSize + ',0 0,-' + cellSize + 'z ';

      qrSvg += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
      qrSvg += !opts.scalable ? ' width="' + size + 'px" height="' + size + 'px"' : '';
      qrSvg += ' viewBox="0 0 ' + size + ' ' + size + '" ';
      qrSvg += ' preserveAspectRatio="xMinYMin meet"';
      qrSvg += (title.text || alt.text) ? ' role="img" aria-labelledby="' +
          escapeXml([title.id, alt.id].join(' ').trim() ) + '"' : '';
      qrSvg += '>';
      qrSvg += (title.text) ? '<title id="' + escapeXml(title.id) + '">' +
          escapeXml(title.text) + '</title>' : '';
      qrSvg += (alt.text) ? '<description id="' + escapeXml(alt.id) + '">' +
          escapeXml(alt.text) + '</description>' : '';
      qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
      qrSvg += '<path d="';

      for (r = 0; r < _this.getModuleCount(); r += 1) {
        mr = r * cellSize + margin;
        for (c = 0; c < _this.getModuleCount(); c += 1) {
          if (_this.isDark(r, c) ) {
            mc = c*cellSize+margin;
            qrSvg += 'M' + mc + ',' + mr + rect;
          }
        }
      }

      qrSvg += '" stroke="transparent" fill="black"/>';
      qrSvg += '</svg>';

      return qrSvg;
    };

    _this.createDataURL = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      return createDataURL(size, size, function(x, y) {
        if (min <= x && x < max && min <= y && y < max) {
          var c = Math.floor( (x - min) / cellSize);
          var r = Math.floor( (y - min) / cellSize);
          return _this.isDark(r, c)? 0 : 1;
        } else {
          return 1;
        }
      } );
    };

    _this.createImgTag = function(cellSize, margin, alt) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;

      var img = '';
      img += '<img';
      img += '\u0020src="';
      img += _this.createDataURL(cellSize, margin);
      img += '"';
      img += '\u0020width="';
      img += size;
      img += '"';
      img += '\u0020height="';
      img += size;
      img += '"';
      if (alt) {
        img += '\u0020alt="';
        img += escapeXml(alt);
        img += '"';
      }
      img += '/>';

      return img;
    };

    var escapeXml = function(s) {
      var escaped = '';
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charAt(i);
        switch(c) {
        case '<': escaped += '&lt;'; break;
        case '>': escaped += '&gt;'; break;
        case '&': escaped += '&amp;'; break;
        case '"': escaped += '&quot;'; break;
        default : escaped += c; break;
        }
      }
      return escaped;
    };

    var _createHalfASCII = function(margin) {
      var cellSize = 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r1, r2, p;

      var blocks = {
        '██': '█',
        '█ ': '▀',
        ' █': '▄',
        '  ': ' '
      };

      var blocksLastLineNoMargin = {
        '██': '▀',
        '█ ': '▀',
        ' █': ' ',
        '  ': ' '
      };

      var ascii = '';
      for (y = 0; y < size; y += 2) {
        r1 = Math.floor((y - min) / cellSize);
        r2 = Math.floor((y + 1 - min) / cellSize);
        for (x = 0; x < size; x += 1) {
          p = '█';

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r1, Math.floor((x - min) / cellSize))) {
            p = ' ';
          }

          if (min <= x && x < max && min <= y+1 && y+1 < max && _this.isDark(r2, Math.floor((x - min) / cellSize))) {
            p += ' ';
          }
          else {
            p += '█';
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          ascii += (margin < 1 && y+1 >= max) ? blocksLastLineNoMargin[p] : blocks[p];
        }

        ascii += '\n';
      }

      if (size % 2 && margin > 0) {
        return ascii.substring(0, ascii.length - size - 1) + Array(size+1).join('▀');
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.createASCII = function(cellSize, margin) {
      cellSize = cellSize || 1;

      if (cellSize < 2) {
        return _createHalfASCII(margin);
      }

      cellSize -= 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r, p;

      var white = Array(cellSize+1).join('██');
      var black = Array(cellSize+1).join('  ');

      var ascii = '';
      var line = '';
      for (y = 0; y < size; y += 1) {
        r = Math.floor( (y - min) / cellSize);
        line = '';
        for (x = 0; x < size; x += 1) {
          p = 1;

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r, Math.floor((x - min) / cellSize))) {
            p = 0;
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          line += p ? white : black;
        }

        for (r = 0; r < cellSize; r += 1) {
          ascii += line + '\n';
        }
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.renderTo2dContext = function(context, cellSize) {
      cellSize = cellSize || 2;
      var length = _this.getModuleCount();
      for (var row = 0; row < length; row++) {
        for (var col = 0; col < length; col++) {
          context.fillStyle = _this.isDark(row, col) ? 'black' : 'white';
          context.fillRect(row * cellSize, col * cellSize, cellSize, cellSize);
        }
      }
    }

    return _this;
  };

  //---------------------------------------------------------------------
  // qrcode.stringToBytes
  //---------------------------------------------------------------------

  qrcode.stringToBytesFuncs = {
    'default' : function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        bytes.push(c & 0xff);
      }
      return bytes;
    }
  };

  qrcode.stringToBytes = qrcode.stringToBytesFuncs['default'];

  //---------------------------------------------------------------------
  // qrcode.createStringToBytes
  //---------------------------------------------------------------------

  /**
   * @param unicodeData base64 string of byte array.
   * [16bit Unicode],[16bit Bytes], ...
   * @param numChars
   */
  qrcode.createStringToBytes = function(unicodeData, numChars) {

    // create conversion map.

    var unicodeMap = function() {

      var bin = base64DecodeInputStream(unicodeData);
      var read = function() {
        var b = bin.read();
        if (b == -1) throw 'eof';
        return b;
      };

      var count = 0;
      var unicodeMap = {};
      while (true) {
        var b0 = bin.read();
        if (b0 == -1) break;
        var b1 = read();
        var b2 = read();
        var b3 = read();
        var k = String.fromCharCode( (b0 << 8) | b1);
        var v = (b2 << 8) | b3;
        unicodeMap[k] = v;
        count += 1;
      }
      if (count != numChars) {
        throw count + ' != ' + numChars;
      }

      return unicodeMap;
    }();

    var unknownChar = '?'.charCodeAt(0);

    return function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        if (c < 128) {
          bytes.push(c);
        } else {
          var b = unicodeMap[s.charAt(i)];
          if (typeof b == 'number') {
            if ( (b & 0xff) == b) {
              // 1byte
              bytes.push(b);
            } else {
              // 2bytes
              bytes.push(b >>> 8);
              bytes.push(b & 0xff);
            }
          } else {
            bytes.push(unknownChar);
          }
        }
      }
      return bytes;
    };
  };

  //---------------------------------------------------------------------
  // QRMode
  //---------------------------------------------------------------------

  var QRMode = {
    MODE_NUMBER :    1 << 0,
    MODE_ALPHA_NUM : 1 << 1,
    MODE_8BIT_BYTE : 1 << 2,
    MODE_KANJI :     1 << 3
  };

  //---------------------------------------------------------------------
  // QRErrorCorrectionLevel
  //---------------------------------------------------------------------

  var QRErrorCorrectionLevel = {
    L : 1,
    M : 0,
    Q : 3,
    H : 2
  };

  //---------------------------------------------------------------------
  // QRMaskPattern
  //---------------------------------------------------------------------

  var QRMaskPattern = {
    PATTERN000 : 0,
    PATTERN001 : 1,
    PATTERN010 : 2,
    PATTERN011 : 3,
    PATTERN100 : 4,
    PATTERN101 : 5,
    PATTERN110 : 6,
    PATTERN111 : 7
  };

  //---------------------------------------------------------------------
  // QRUtil
  //---------------------------------------------------------------------

  var QRUtil = function() {

    var PATTERN_POSITION_TABLE = [
      [],
      [6, 18],
      [6, 22],
      [6, 26],
      [6, 30],
      [6, 34],
      [6, 22, 38],
      [6, 24, 42],
      [6, 26, 46],
      [6, 28, 50],
      [6, 30, 54],
      [6, 32, 58],
      [6, 34, 62],
      [6, 26, 46, 66],
      [6, 26, 48, 70],
      [6, 26, 50, 74],
      [6, 30, 54, 78],
      [6, 30, 56, 82],
      [6, 30, 58, 86],
      [6, 34, 62, 90],
      [6, 28, 50, 72, 94],
      [6, 26, 50, 74, 98],
      [6, 30, 54, 78, 102],
      [6, 28, 54, 80, 106],
      [6, 32, 58, 84, 110],
      [6, 30, 58, 86, 114],
      [6, 34, 62, 90, 118],
      [6, 26, 50, 74, 98, 122],
      [6, 30, 54, 78, 102, 126],
      [6, 26, 52, 78, 104, 130],
      [6, 30, 56, 82, 108, 134],
      [6, 34, 60, 86, 112, 138],
      [6, 30, 58, 86, 114, 142],
      [6, 34, 62, 90, 118, 146],
      [6, 30, 54, 78, 102, 126, 150],
      [6, 24, 50, 76, 102, 128, 154],
      [6, 28, 54, 80, 106, 132, 158],
      [6, 32, 58, 84, 110, 136, 162],
      [6, 26, 54, 82, 110, 138, 166],
      [6, 30, 58, 86, 114, 142, 170]
    ];
    var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
    var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

    var _this = {};

    var getBCHDigit = function(data) {
      var digit = 0;
      while (data != 0) {
        digit += 1;
        data >>>= 1;
      }
      return digit;
    };

    _this.getBCHTypeInfo = function(data) {
      var d = data << 10;
      while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
        d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15) ) );
      }
      return ( (data << 10) | d) ^ G15_MASK;
    };

    _this.getBCHTypeNumber = function(data) {
      var d = data << 12;
      while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
        d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18) ) );
      }
      return (data << 12) | d;
    };

    _this.getPatternPosition = function(typeNumber) {
      return PATTERN_POSITION_TABLE[typeNumber - 1];
    };

    _this.getMaskFunction = function(maskPattern) {

      switch (maskPattern) {

      case QRMaskPattern.PATTERN000 :
        return function(i, j) { return (i + j) % 2 == 0; };
      case QRMaskPattern.PATTERN001 :
        return function(i, j) { return i % 2 == 0; };
      case QRMaskPattern.PATTERN010 :
        return function(i, j) { return j % 3 == 0; };
      case QRMaskPattern.PATTERN011 :
        return function(i, j) { return (i + j) % 3 == 0; };
      case QRMaskPattern.PATTERN100 :
        return function(i, j) { return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0; };
      case QRMaskPattern.PATTERN101 :
        return function(i, j) { return (i * j) % 2 + (i * j) % 3 == 0; };
      case QRMaskPattern.PATTERN110 :
        return function(i, j) { return ( (i * j) % 2 + (i * j) % 3) % 2 == 0; };
      case QRMaskPattern.PATTERN111 :
        return function(i, j) { return ( (i * j) % 3 + (i + j) % 2) % 2 == 0; };

      default :
        throw 'bad maskPattern:' + maskPattern;
      }
    };

    _this.getErrorCorrectPolynomial = function(errorCorrectLength) {
      var a = qrPolynomial([1], 0);
      for (var i = 0; i < errorCorrectLength; i += 1) {
        a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0) );
      }
      return a;
    };

    _this.getLengthInBits = function(mode, type) {

      if (1 <= type && type < 10) {

        // 1 - 9

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 10;
        case QRMode.MODE_ALPHA_NUM : return 9;
        case QRMode.MODE_8BIT_BYTE : return 8;
        case QRMode.MODE_KANJI     : return 8;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 27) {

        // 10 - 26

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 12;
        case QRMode.MODE_ALPHA_NUM : return 11;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 10;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 41) {

        // 27 - 40

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 14;
        case QRMode.MODE_ALPHA_NUM : return 13;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 12;
        default :
          throw 'mode:' + mode;
        }

      } else {
        throw 'type:' + type;
      }
    };

    _this.getLostPoint = function(qrcode) {

      var moduleCount = qrcode.getModuleCount();

      var lostPoint = 0;

      // LEVEL1

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount; col += 1) {

          var sameCount = 0;
          var dark = qrcode.isDark(row, col);

          for (var r = -1; r <= 1; r += 1) {

            if (row + r < 0 || moduleCount <= row + r) {
              continue;
            }

            for (var c = -1; c <= 1; c += 1) {

              if (col + c < 0 || moduleCount <= col + c) {
                continue;
              }

              if (r == 0 && c == 0) {
                continue;
              }

              if (dark == qrcode.isDark(row + r, col + c) ) {
                sameCount += 1;
              }
            }
          }

          if (sameCount > 5) {
            lostPoint += (3 + sameCount - 5);
          }
        }
      };

      // LEVEL2

      for (var row = 0; row < moduleCount - 1; row += 1) {
        for (var col = 0; col < moduleCount - 1; col += 1) {
          var count = 0;
          if (qrcode.isDark(row, col) ) count += 1;
          if (qrcode.isDark(row + 1, col) ) count += 1;
          if (qrcode.isDark(row, col + 1) ) count += 1;
          if (qrcode.isDark(row + 1, col + 1) ) count += 1;
          if (count == 0 || count == 4) {
            lostPoint += 3;
          }
        }
      }

      // LEVEL3

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount - 6; col += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row, col + 1)
              &&  qrcode.isDark(row, col + 2)
              &&  qrcode.isDark(row, col + 3)
              &&  qrcode.isDark(row, col + 4)
              && !qrcode.isDark(row, col + 5)
              &&  qrcode.isDark(row, col + 6) ) {
            lostPoint += 40;
          }
        }
      }

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount - 6; row += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row + 1, col)
              &&  qrcode.isDark(row + 2, col)
              &&  qrcode.isDark(row + 3, col)
              &&  qrcode.isDark(row + 4, col)
              && !qrcode.isDark(row + 5, col)
              &&  qrcode.isDark(row + 6, col) ) {
            lostPoint += 40;
          }
        }
      }

      // LEVEL4

      var darkCount = 0;

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount; row += 1) {
          if (qrcode.isDark(row, col) ) {
            darkCount += 1;
          }
        }
      }

      var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
      lostPoint += ratio * 10;

      return lostPoint;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // QRMath
  //---------------------------------------------------------------------

  var QRMath = function() {

    var EXP_TABLE = new Array(256);
    var LOG_TABLE = new Array(256);

    // initialize tables
    for (var i = 0; i < 8; i += 1) {
      EXP_TABLE[i] = 1 << i;
    }
    for (var i = 8; i < 256; i += 1) {
      EXP_TABLE[i] = EXP_TABLE[i - 4]
        ^ EXP_TABLE[i - 5]
        ^ EXP_TABLE[i - 6]
        ^ EXP_TABLE[i - 8];
    }
    for (var i = 0; i < 255; i += 1) {
      LOG_TABLE[EXP_TABLE[i] ] = i;
    }

    var _this = {};

    _this.glog = function(n) {

      if (n < 1) {
        throw 'glog(' + n + ')';
      }

      return LOG_TABLE[n];
    };

    _this.gexp = function(n) {

      while (n < 0) {
        n += 255;
      }

      while (n >= 256) {
        n -= 255;
      }

      return EXP_TABLE[n];
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrPolynomial
  //---------------------------------------------------------------------

  function qrPolynomial(num, shift) {

    if (typeof num.length == 'undefined') {
      throw num.length + '/' + shift;
    }

    var _num = function() {
      var offset = 0;
      while (offset < num.length && num[offset] == 0) {
        offset += 1;
      }
      var _num = new Array(num.length - offset + shift);
      for (var i = 0; i < num.length - offset; i += 1) {
        _num[i] = num[i + offset];
      }
      return _num;
    }();

    var _this = {};

    _this.getAt = function(index) {
      return _num[index];
    };

    _this.getLength = function() {
      return _num.length;
    };

    _this.multiply = function(e) {

      var num = new Array(_this.getLength() + e.getLength() - 1);

      for (var i = 0; i < _this.getLength(); i += 1) {
        for (var j = 0; j < e.getLength(); j += 1) {
          num[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i) ) + QRMath.glog(e.getAt(j) ) );
        }
      }

      return qrPolynomial(num, 0);
    };

    _this.mod = function(e) {

      if (_this.getLength() - e.getLength() < 0) {
        return _this;
      }

      var ratio = QRMath.glog(_this.getAt(0) ) - QRMath.glog(e.getAt(0) );

      var num = new Array(_this.getLength() );
      for (var i = 0; i < _this.getLength(); i += 1) {
        num[i] = _this.getAt(i);
      }

      for (var i = 0; i < e.getLength(); i += 1) {
        num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i) ) + ratio);
      }

      // recursive call
      return qrPolynomial(num, 0).mod(e);
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // QRRSBlock
  //---------------------------------------------------------------------

  var QRRSBlock = function() {

    var RS_BLOCK_TABLE = [

      // L
      // M
      // Q
      // H

      // 1
      [1, 26, 19],
      [1, 26, 16],
      [1, 26, 13],
      [1, 26, 9],

      // 2
      [1, 44, 34],
      [1, 44, 28],
      [1, 44, 22],
      [1, 44, 16],

      // 3
      [1, 70, 55],
      [1, 70, 44],
      [2, 35, 17],
      [2, 35, 13],

      // 4
      [1, 100, 80],
      [2, 50, 32],
      [2, 50, 24],
      [4, 25, 9],

      // 5
      [1, 134, 108],
      [2, 67, 43],
      [2, 33, 15, 2, 34, 16],
      [2, 33, 11, 2, 34, 12],

      // 6
      [2, 86, 68],
      [4, 43, 27],
      [4, 43, 19],
      [4, 43, 15],

      // 7
      [2, 98, 78],
      [4, 49, 31],
      [2, 32, 14, 4, 33, 15],
      [4, 39, 13, 1, 40, 14],

      // 8
      [2, 121, 97],
      [2, 60, 38, 2, 61, 39],
      [4, 40, 18, 2, 41, 19],
      [4, 40, 14, 2, 41, 15],

      // 9
      [2, 146, 116],
      [3, 58, 36, 2, 59, 37],
      [4, 36, 16, 4, 37, 17],
      [4, 36, 12, 4, 37, 13],

      // 10
      [2, 86, 68, 2, 87, 69],
      [4, 69, 43, 1, 70, 44],
      [6, 43, 19, 2, 44, 20],
      [6, 43, 15, 2, 44, 16],

      // 11
      [4, 101, 81],
      [1, 80, 50, 4, 81, 51],
      [4, 50, 22, 4, 51, 23],
      [3, 36, 12, 8, 37, 13],

      // 12
      [2, 116, 92, 2, 117, 93],
      [6, 58, 36, 2, 59, 37],
      [4, 46, 20, 6, 47, 21],
      [7, 42, 14, 4, 43, 15],

      // 13
      [4, 133, 107],
      [8, 59, 37, 1, 60, 38],
      [8, 44, 20, 4, 45, 21],
      [12, 33, 11, 4, 34, 12],

      // 14
      [3, 145, 115, 1, 146, 116],
      [4, 64, 40, 5, 65, 41],
      [11, 36, 16, 5, 37, 17],
      [11, 36, 12, 5, 37, 13],

      // 15
      [5, 109, 87, 1, 110, 88],
      [5, 65, 41, 5, 66, 42],
      [5, 54, 24, 7, 55, 25],
      [11, 36, 12, 7, 37, 13],

      // 16
      [5, 122, 98, 1, 123, 99],
      [7, 73, 45, 3, 74, 46],
      [15, 43, 19, 2, 44, 20],
      [3, 45, 15, 13, 46, 16],

      // 17
      [1, 135, 107, 5, 136, 108],
      [10, 74, 46, 1, 75, 47],
      [1, 50, 22, 15, 51, 23],
      [2, 42, 14, 17, 43, 15],

      // 18
      [5, 150, 120, 1, 151, 121],
      [9, 69, 43, 4, 70, 44],
      [17, 50, 22, 1, 51, 23],
      [2, 42, 14, 19, 43, 15],

      // 19
      [3, 141, 113, 4, 142, 114],
      [3, 70, 44, 11, 71, 45],
      [17, 47, 21, 4, 48, 22],
      [9, 39, 13, 16, 40, 14],

      // 20
      [3, 135, 107, 5, 136, 108],
      [3, 67, 41, 13, 68, 42],
      [15, 54, 24, 5, 55, 25],
      [15, 43, 15, 10, 44, 16],

      // 21
      [4, 144, 116, 4, 145, 117],
      [17, 68, 42],
      [17, 50, 22, 6, 51, 23],
      [19, 46, 16, 6, 47, 17],

      // 22
      [2, 139, 111, 7, 140, 112],
      [17, 74, 46],
      [7, 54, 24, 16, 55, 25],
      [34, 37, 13],

      // 23
      [4, 151, 121, 5, 152, 122],
      [4, 75, 47, 14, 76, 48],
      [11, 54, 24, 14, 55, 25],
      [16, 45, 15, 14, 46, 16],

      // 24
      [6, 147, 117, 4, 148, 118],
      [6, 73, 45, 14, 74, 46],
      [11, 54, 24, 16, 55, 25],
      [30, 46, 16, 2, 47, 17],

      // 25
      [8, 132, 106, 4, 133, 107],
      [8, 75, 47, 13, 76, 48],
      [7, 54, 24, 22, 55, 25],
      [22, 45, 15, 13, 46, 16],

      // 26
      [10, 142, 114, 2, 143, 115],
      [19, 74, 46, 4, 75, 47],
      [28, 50, 22, 6, 51, 23],
      [33, 46, 16, 4, 47, 17],

      // 27
      [8, 152, 122, 4, 153, 123],
      [22, 73, 45, 3, 74, 46],
      [8, 53, 23, 26, 54, 24],
      [12, 45, 15, 28, 46, 16],

      // 28
      [3, 147, 117, 10, 148, 118],
      [3, 73, 45, 23, 74, 46],
      [4, 54, 24, 31, 55, 25],
      [11, 45, 15, 31, 46, 16],

      // 29
      [7, 146, 116, 7, 147, 117],
      [21, 73, 45, 7, 74, 46],
      [1, 53, 23, 37, 54, 24],
      [19, 45, 15, 26, 46, 16],

      // 30
      [5, 145, 115, 10, 146, 116],
      [19, 75, 47, 10, 76, 48],
      [15, 54, 24, 25, 55, 25],
      [23, 45, 15, 25, 46, 16],

      // 31
      [13, 145, 115, 3, 146, 116],
      [2, 74, 46, 29, 75, 47],
      [42, 54, 24, 1, 55, 25],
      [23, 45, 15, 28, 46, 16],

      // 32
      [17, 145, 115],
      [10, 74, 46, 23, 75, 47],
      [10, 54, 24, 35, 55, 25],
      [19, 45, 15, 35, 46, 16],

      // 33
      [17, 145, 115, 1, 146, 116],
      [14, 74, 46, 21, 75, 47],
      [29, 54, 24, 19, 55, 25],
      [11, 45, 15, 46, 46, 16],

      // 34
      [13, 145, 115, 6, 146, 116],
      [14, 74, 46, 23, 75, 47],
      [44, 54, 24, 7, 55, 25],
      [59, 46, 16, 1, 47, 17],

      // 35
      [12, 151, 121, 7, 152, 122],
      [12, 75, 47, 26, 76, 48],
      [39, 54, 24, 14, 55, 25],
      [22, 45, 15, 41, 46, 16],

      // 36
      [6, 151, 121, 14, 152, 122],
      [6, 75, 47, 34, 76, 48],
      [46, 54, 24, 10, 55, 25],
      [2, 45, 15, 64, 46, 16],

      // 37
      [17, 152, 122, 4, 153, 123],
      [29, 74, 46, 14, 75, 47],
      [49, 54, 24, 10, 55, 25],
      [24, 45, 15, 46, 46, 16],

      // 38
      [4, 152, 122, 18, 153, 123],
      [13, 74, 46, 32, 75, 47],
      [48, 54, 24, 14, 55, 25],
      [42, 45, 15, 32, 46, 16],

      // 39
      [20, 147, 117, 4, 148, 118],
      [40, 75, 47, 7, 76, 48],
      [43, 54, 24, 22, 55, 25],
      [10, 45, 15, 67, 46, 16],

      // 40
      [19, 148, 118, 6, 149, 119],
      [18, 75, 47, 31, 76, 48],
      [34, 54, 24, 34, 55, 25],
      [20, 45, 15, 61, 46, 16]
    ];

    var qrRSBlock = function(totalCount, dataCount) {
      var _this = {};
      _this.totalCount = totalCount;
      _this.dataCount = dataCount;
      return _this;
    };

    var _this = {};

    var getRsBlockTable = function(typeNumber, errorCorrectionLevel) {

      switch(errorCorrectionLevel) {
      case QRErrorCorrectionLevel.L :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
      case QRErrorCorrectionLevel.M :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
      case QRErrorCorrectionLevel.Q :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
      case QRErrorCorrectionLevel.H :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
      default :
        return undefined;
      }
    };

    _this.getRSBlocks = function(typeNumber, errorCorrectionLevel) {

      var rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);

      if (typeof rsBlock == 'undefined') {
        throw 'bad rs block @ typeNumber:' + typeNumber +
            '/errorCorrectionLevel:' + errorCorrectionLevel;
      }

      var length = rsBlock.length / 3;

      var list = [];

      for (var i = 0; i < length; i += 1) {

        var count = rsBlock[i * 3 + 0];
        var totalCount = rsBlock[i * 3 + 1];
        var dataCount = rsBlock[i * 3 + 2];

        for (var j = 0; j < count; j += 1) {
          list.push(qrRSBlock(totalCount, dataCount) );
        }
      }

      return list;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrBitBuffer
  //---------------------------------------------------------------------

  var qrBitBuffer = function() {

    var _buffer = [];
    var _length = 0;

    var _this = {};

    _this.getBuffer = function() {
      return _buffer;
    };

    _this.getAt = function(index) {
      var bufIndex = Math.floor(index / 8);
      return ( (_buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
    };

    _this.put = function(num, length) {
      for (var i = 0; i < length; i += 1) {
        _this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
      }
    };

    _this.getLengthInBits = function() {
      return _length;
    };

    _this.putBit = function(bit) {

      var bufIndex = Math.floor(_length / 8);
      if (_buffer.length <= bufIndex) {
        _buffer.push(0);
      }

      if (bit) {
        _buffer[bufIndex] |= (0x80 >>> (_length % 8) );
      }

      _length += 1;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrNumber
  //---------------------------------------------------------------------

  var qrNumber = function(data) {

    var _mode = QRMode.MODE_NUMBER;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var data = _data;

      var i = 0;

      while (i + 2 < data.length) {
        buffer.put(strToNum(data.substring(i, i + 3) ), 10);
        i += 3;
      }

      if (i < data.length) {
        if (data.length - i == 1) {
          buffer.put(strToNum(data.substring(i, i + 1) ), 4);
        } else if (data.length - i == 2) {
          buffer.put(strToNum(data.substring(i, i + 2) ), 7);
        }
      }
    };

    var strToNum = function(s) {
      var num = 0;
      for (var i = 0; i < s.length; i += 1) {
        num = num * 10 + chatToNum(s.charAt(i) );
      }
      return num;
    };

    var chatToNum = function(c) {
      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      }
      throw 'illegal char :' + c;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrAlphaNum
  //---------------------------------------------------------------------

  var qrAlphaNum = function(data) {

    var _mode = QRMode.MODE_ALPHA_NUM;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var s = _data;

      var i = 0;

      while (i + 1 < s.length) {
        buffer.put(
          getCode(s.charAt(i) ) * 45 +
          getCode(s.charAt(i + 1) ), 11);
        i += 2;
      }

      if (i < s.length) {
        buffer.put(getCode(s.charAt(i) ), 6);
      }
    };

    var getCode = function(c) {

      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      } else if ('A' <= c && c <= 'Z') {
        return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
      } else {
        switch (c) {
        case ' ' : return 36;
        case '$' : return 37;
        case '%' : return 38;
        case '*' : return 39;
        case '+' : return 40;
        case '-' : return 41;
        case '.' : return 42;
        case '/' : return 43;
        case ':' : return 44;
        default :
          throw 'illegal char :' + c;
        }
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qr8BitByte
  //---------------------------------------------------------------------

  var qr8BitByte = function(data) {

    var _mode = QRMode.MODE_8BIT_BYTE;
    var _data = data;
    var _bytes = qrcode.stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _bytes.length;
    };

    _this.write = function(buffer) {
      for (var i = 0; i < _bytes.length; i += 1) {
        buffer.put(_bytes[i], 8);
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrKanji
  //---------------------------------------------------------------------

  var qrKanji = function(data) {

    var _mode = QRMode.MODE_KANJI;
    var _data = data;

    var stringToBytes = qrcode.stringToBytesFuncs['SJIS'];
    if (!stringToBytes) {
      throw 'sjis not supported.';
    }
    !function(c, code) {
      // self test for sjis support.
      var test = stringToBytes(c);
      if (test.length != 2 || ( (test[0] << 8) | test[1]) != code) {
        throw 'sjis not supported.';
      }
    }('\u53cb', 0x9746);

    var _bytes = stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return ~~(_bytes.length / 2);
    };

    _this.write = function(buffer) {

      var data = _bytes;

      var i = 0;

      while (i + 1 < data.length) {

        var c = ( (0xff & data[i]) << 8) | (0xff & data[i + 1]);

        if (0x8140 <= c && c <= 0x9FFC) {
          c -= 0x8140;
        } else if (0xE040 <= c && c <= 0xEBBF) {
          c -= 0xC140;
        } else {
          throw 'illegal char at ' + (i + 1) + '/' + c;
        }

        c = ( (c >>> 8) & 0xff) * 0xC0 + (c & 0xff);

        buffer.put(c, 13);

        i += 2;
      }

      if (i < data.length) {
        throw 'illegal char at ' + (i + 1);
      }
    };

    return _this;
  };

  //=====================================================================
  // GIF Support etc.
  //

  //---------------------------------------------------------------------
  // byteArrayOutputStream
  //---------------------------------------------------------------------

  var byteArrayOutputStream = function() {

    var _bytes = [];

    var _this = {};

    _this.writeByte = function(b) {
      _bytes.push(b & 0xff);
    };

    _this.writeShort = function(i) {
      _this.writeByte(i);
      _this.writeByte(i >>> 8);
    };

    _this.writeBytes = function(b, off, len) {
      off = off || 0;
      len = len || b.length;
      for (var i = 0; i < len; i += 1) {
        _this.writeByte(b[i + off]);
      }
    };

    _this.writeString = function(s) {
      for (var i = 0; i < s.length; i += 1) {
        _this.writeByte(s.charCodeAt(i) );
      }
    };

    _this.toByteArray = function() {
      return _bytes;
    };

    _this.toString = function() {
      var s = '';
      s += '[';
      for (var i = 0; i < _bytes.length; i += 1) {
        if (i > 0) {
          s += ',';
        }
        s += _bytes[i];
      }
      s += ']';
      return s;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64EncodeOutputStream
  //---------------------------------------------------------------------

  var base64EncodeOutputStream = function() {

    var _buffer = 0;
    var _buflen = 0;
    var _length = 0;
    var _base64 = '';

    var _this = {};

    var writeEncoded = function(b) {
      _base64 += String.fromCharCode(encode(b & 0x3f) );
    };

    var encode = function(n) {
      if (n < 0) {
        // error.
      } else if (n < 26) {
        return 0x41 + n;
      } else if (n < 52) {
        return 0x61 + (n - 26);
      } else if (n < 62) {
        return 0x30 + (n - 52);
      } else if (n == 62) {
        return 0x2b;
      } else if (n == 63) {
        return 0x2f;
      }
      throw 'n:' + n;
    };

    _this.writeByte = function(n) {

      _buffer = (_buffer << 8) | (n & 0xff);
      _buflen += 8;
      _length += 1;

      while (_buflen >= 6) {
        writeEncoded(_buffer >>> (_buflen - 6) );
        _buflen -= 6;
      }
    };

    _this.flush = function() {

      if (_buflen > 0) {
        writeEncoded(_buffer << (6 - _buflen) );
        _buffer = 0;
        _buflen = 0;
      }

      if (_length % 3 != 0) {
        // padding
        var padlen = 3 - _length % 3;
        for (var i = 0; i < padlen; i += 1) {
          _base64 += '=';
        }
      }
    };

    _this.toString = function() {
      return _base64;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64DecodeInputStream
  //---------------------------------------------------------------------

  var base64DecodeInputStream = function(str) {

    var _str = str;
    var _pos = 0;
    var _buffer = 0;
    var _buflen = 0;

    var _this = {};

    _this.read = function() {

      while (_buflen < 8) {

        if (_pos >= _str.length) {
          if (_buflen == 0) {
            return -1;
          }
          throw 'unexpected end of file./' + _buflen;
        }

        var c = _str.charAt(_pos);
        _pos += 1;

        if (c == '=') {
          _buflen = 0;
          return -1;
        } else if (c.match(/^\s$/) ) {
          // ignore if whitespace.
          continue;
        }

        _buffer = (_buffer << 6) | decode(c.charCodeAt(0) );
        _buflen += 6;
      }

      var n = (_buffer >>> (_buflen - 8) ) & 0xff;
      _buflen -= 8;
      return n;
    };

    var decode = function(c) {
      if (0x41 <= c && c <= 0x5a) {
        return c - 0x41;
      } else if (0x61 <= c && c <= 0x7a) {
        return c - 0x61 + 26;
      } else if (0x30 <= c && c <= 0x39) {
        return c - 0x30 + 52;
      } else if (c == 0x2b) {
        return 62;
      } else if (c == 0x2f) {
        return 63;
      } else {
        throw 'c:' + c;
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // gifImage (B/W)
  //---------------------------------------------------------------------

  var gifImage = function(width, height) {

    var _width = width;
    var _height = height;
    var _data = new Array(width * height);

    var _this = {};

    _this.setPixel = function(x, y, pixel) {
      _data[y * _width + x] = pixel;
    };

    _this.write = function(out) {

      //---------------------------------
      // GIF Signature

      out.writeString('GIF87a');

      //---------------------------------
      // Screen Descriptor

      out.writeShort(_width);
      out.writeShort(_height);

      out.writeByte(0x80); // 2bit
      out.writeByte(0);
      out.writeByte(0);

      //---------------------------------
      // Global Color Map

      // black
      out.writeByte(0x00);
      out.writeByte(0x00);
      out.writeByte(0x00);

      // white
      out.writeByte(0xff);
      out.writeByte(0xff);
      out.writeByte(0xff);

      //---------------------------------
      // Image Descriptor

      out.writeString(',');
      out.writeShort(0);
      out.writeShort(0);
      out.writeShort(_width);
      out.writeShort(_height);
      out.writeByte(0);

      //---------------------------------
      // Local Color Map

      //---------------------------------
      // Raster Data

      var lzwMinCodeSize = 2;
      var raster = getLZWRaster(lzwMinCodeSize);

      out.writeByte(lzwMinCodeSize);

      var offset = 0;

      while (raster.length - offset > 255) {
        out.writeByte(255);
        out.writeBytes(raster, offset, 255);
        offset += 255;
      }

      out.writeByte(raster.length - offset);
      out.writeBytes(raster, offset, raster.length - offset);
      out.writeByte(0x00);

      //---------------------------------
      // GIF Terminator
      out.writeString(';');
    };

    var bitOutputStream = function(out) {

      var _out = out;
      var _bitLength = 0;
      var _bitBuffer = 0;

      var _this = {};

      _this.write = function(data, length) {

        if ( (data >>> length) != 0) {
          throw 'length over';
        }

        while (_bitLength + length >= 8) {
          _out.writeByte(0xff & ( (data << _bitLength) | _bitBuffer) );
          length -= (8 - _bitLength);
          data >>>= (8 - _bitLength);
          _bitBuffer = 0;
          _bitLength = 0;
        }

        _bitBuffer = (data << _bitLength) | _bitBuffer;
        _bitLength = _bitLength + length;
      };

      _this.flush = function() {
        if (_bitLength > 0) {
          _out.writeByte(_bitBuffer);
        }
      };

      return _this;
    };

    var getLZWRaster = function(lzwMinCodeSize) {

      var clearCode = 1 << lzwMinCodeSize;
      var endCode = (1 << lzwMinCodeSize) + 1;
      var bitLength = lzwMinCodeSize + 1;

      // Setup LZWTable
      var table = lzwTable();

      for (var i = 0; i < clearCode; i += 1) {
        table.add(String.fromCharCode(i) );
      }
      table.add(String.fromCharCode(clearCode) );
      table.add(String.fromCharCode(endCode) );

      var byteOut = byteArrayOutputStream();
      var bitOut = bitOutputStream(byteOut);

      // clear code
      bitOut.write(clearCode, bitLength);

      var dataIndex = 0;

      var s = String.fromCharCode(_data[dataIndex]);
      dataIndex += 1;

      while (dataIndex < _data.length) {

        var c = String.fromCharCode(_data[dataIndex]);
        dataIndex += 1;

        if (table.contains(s + c) ) {

          s = s + c;

        } else {

          bitOut.write(table.indexOf(s), bitLength);

          if (table.size() < 0xfff) {

            if (table.size() == (1 << bitLength) ) {
              bitLength += 1;
            }

            table.add(s + c);
          }

          s = c;
        }
      }

      bitOut.write(table.indexOf(s), bitLength);

      // end code
      bitOut.write(endCode, bitLength);

      bitOut.flush();

      return byteOut.toByteArray();
    };

    var lzwTable = function() {

      var _map = {};
      var _size = 0;

      var _this = {};

      _this.add = function(key) {
        if (_this.contains(key) ) {
          throw 'dup key:' + key;
        }
        _map[key] = _size;
        _size += 1;
      };

      _this.size = function() {
        return _size;
      };

      _this.indexOf = function(key) {
        return _map[key];
      };

      _this.contains = function(key) {
        return typeof _map[key] != 'undefined';
      };

      return _this;
    };

    return _this;
  };

  var createDataURL = function(width, height, getPixel) {
    var gif = gifImage(width, height);
    for (var y = 0; y < height; y += 1) {
      for (var x = 0; x < width; x += 1) {
        gif.setPixel(x, y, getPixel(x, y) );
      }
    }

    var b = byteArrayOutputStream();
    gif.write(b);

    var base64 = base64EncodeOutputStream();
    var bytes = b.toByteArray();
    for (var i = 0; i < bytes.length; i += 1) {
      base64.writeByte(bytes[i]);
    }
    base64.flush();

    return 'data:image/gif;base64,' + base64;
  };

  //---------------------------------------------------------------------
  // returns qrcode function.

  return qrcode;
}();

// multibyte support
!function() {

  qrcode.stringToBytesFuncs['UTF-8'] = function(s) {
    // http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
    function toUTF8Array(str) {
      var utf8 = [];
      for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6),
              0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
          i++;
          // UTF-16 encodes 0x10000-0x10FFFF by
          // subtracting 0x10000 and splitting the
          // 20 bits of 0x0-0xFFFFF into two halves
          charcode = 0x10000 + (((charcode & 0x3ff)<<10)
            | (str.charCodeAt(i) & 0x3ff));
          utf8.push(0xf0 | (charcode >>18),
              0x80 | ((charcode>>12) & 0x3f),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
      }
      return utf8;
    }
    return toUTF8Array(s);
  };

}();

qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];
// ---------------------------------------------------------------------------
// Gerätewissen: was ist "an", was lässt sich dimmen, wie schaltet man es
// Eine Stelle für alle Karten, damit sich jede Entität überall gleich verhält
// ---------------------------------------------------------------------------
const AN_ZUSTAENDE = ["on", "open", "opening", "closing", "playing", "paused", "buffering", "cleaning", "returning", "home",
  "unlocked", "unlocking", "open", "heat", "cool", "auto", "heat_cool", "dry", "fan_only", "armed_home", "armed_away",
  "armed_night", "armed_vacation", "armed_custom_bypass", "triggered", "active"];
const WARN_KLASSEN = { door: "orange", window: "orange", opening: "orange", garage_door: "orange", lock: "orange",
  moisture: "rot", smoke: "rot", gas: "rot", carbon_monoxide: "rot", problem: "rot", safety: "rot", tamper: "rot", heat: "rot", cold: "blau" };
const SCHALTBAR = ["light", "switch", "input_boolean", "fan", "cover", "climate", "media_player", "lock", "vacuum",
  "automation", "humidifier", "valve", "siren", "water_heater", "remote", "group"];
const AUSLOESBAR = ["scene", "script", "button", "input_button"];

const Geraet = {
  istAn(st) {
    if (!st) return false;
    const d = domainVon(st.entity_id);
    if (d === "lock") return st.state === "unlocked" || st.state === "open";
    if (d === "climate") return st.state !== "off" && st.state !== "unavailable";
    if (d === "media_player") return ["playing", "paused", "on", "buffering"].includes(st.state);
    if (d === "sensor" || d === "weather" || d === "input_number" || d === "number") return false;
    return AN_ZUSTAENDE.includes(st.state);
  },
  istWarnung(st) {
    if (!st || domainVon(st.entity_id) !== "binary_sensor" || st.state !== "on") return null;
    return WARN_KLASSEN[st.attributes.device_class] || null;
  },
  verfuegbar(st) { return st && st.state !== "unavailable" && st.state !== "unknown"; },
  schaltbar(st) { return st && SCHALTBAR.includes(domainVon(st.entity_id)); },
  ausloesbar(st) { return st && AUSLOESBAR.includes(domainVon(st.entity_id)); },

  // Regler: Wert 0–100 und wie man ihn setzt. null = nicht regelbar
  regler(st) {
    if (!st) return null;
    const d = domainVon(st.entity_id), a = st.attributes, f = Number(a.supported_features || 0);
    if (d === "light") {
      const modes = a.supported_color_modes || [];
      if (!modes.length || (modes.length === 1 && modes[0] === "onoff")) return null;
      const pct = st.state === "on" ? Math.round(((a.brightness ?? 255) / 255) * 100) : 0;
      return { pct, text: (p) => (p > 0 ? `${Math.round(p)} %` : "Aus"),
        setzen: (h, p) => (p <= 0 ? h.callService("light", "turn_off", { entity_id: st.entity_id })
          : h.callService("light", "turn_on", { entity_id: st.entity_id, brightness_pct: Math.max(1, Math.round(p)) })) };
    }
    if (d === "fan" && f & 1) {
      const pct = st.state === "on" ? Number(a.percentage ?? 100) : 0;
      return { pct, text: (p) => (p > 0 ? `${Math.round(p)} %` : "Aus"),
        setzen: (h, p) => h.callService("fan", "set_percentage", { entity_id: st.entity_id, percentage: Math.round(p) }) };
    }
    if (d === "cover" && f & 4) {
      const pct = Number(a.current_position ?? (st.state === "open" ? 100 : 0));
      return { pct, text: (p) => (p <= 0 ? "Geschlossen" : `Offen ${Math.round(p)} %`),
        setzen: (h, p) => h.callService("cover", "set_cover_position", { entity_id: st.entity_id, position: Math.round(p) }) };
    }
    if (d === "climate" && a.temperature != null) {
      const min = Number(a.min_temp ?? 7), max = Number(a.max_temp ?? 30), schritt = Number(a.target_temp_step || 0.5);
      const zuT = (p) => Math.round((min + (p / 100) * (max - min)) / schritt) * schritt;
      return { pct: ((Number(a.temperature) - min) / (max - min)) * 100, text: (p) => `${String(zuT(p)).replace(".", ",")}°`,
        setzen: (h, p) => h.callService("climate", "set_temperature", { entity_id: st.entity_id, temperature: zuT(p) }) };
    }
    if (d === "media_player" && f & 4) {
      return { pct: Math.round(Number(a.volume_level ?? 0) * 100), text: (p) => `Lautstärke ${Math.round(p)} %`,
        setzen: (h, p) => h.callService("media_player", "volume_set", { entity_id: st.entity_id, volume_level: Math.round(p) / 100 }) };
    }
    if (d === "input_number" || d === "number") {
      const min = Number(a.min ?? 0), max = Number(a.max ?? 100), schritt = Number(a.step || 1);
      const zuW = (p) => Math.round((min + (p / 100) * (max - min)) / schritt) * schritt;
      return { pct: ((Number(st.state) - min) / (max - min)) * 100, text: (p) => `${zuW(p)} ${a.unit_of_measurement || ""}`.trim(),
        setzen: (h, p) => h.callService(d, "set_value", { entity_id: st.entity_id, value: zuW(p) }) };
    }
    return null;
  },

  schalten(h, st) {
    const d = domainVon(st.entity_id), id = st.entity_id;
    if (d === "lock") return h.callService("lock", st.state === "locked" ? "unlock" : "lock", { entity_id: id });
    if (d === "cover") return h.callService("cover", "toggle", { entity_id: id });
    if (d === "vacuum") return h.callService("vacuum", st.state === "cleaning" ? "return_to_base" : "start", { entity_id: id });
    if (d === "media_player") return h.callService("media_player", "media_play_pause", { entity_id: id });
    if (d === "scene" || d === "script") return h.callService(d, "turn_on", { entity_id: id });
    if (d === "button" || d === "input_button") return h.callService(d, "press", { entity_id: id });
    if (d === "climate") return h.callService("climate", st.state === "off" ? "turn_on" : "turn_off", { entity_id: id });
    if (d === "light" && st.state !== "on") return h.callService("light", "turn_on", { entity_id: id }); // HA merkt sich die letzte Helligkeit
    return h.callService("homeassistant", "toggle", { entity_id: id });
  },

  // Akzentfarbe des Symbols, wenn aktiv
  farbe(st) {
    if (!st) return "#8e8e93";
    const d = domainVon(st.entity_id), a = st.attributes;
    if (d === "light") {
      if (a.rgb_color && a.color_mode && !["color_temp", "brightness", "onoff"].includes(a.color_mode)) return `rgb(${a.rgb_color.join(",")})`;
      return "#ff9f0a";
    }
    if (d === "climate") return st.state === "cool" ? "#30b0c7" : "#ff6b3d";
    if (d === "cover") return "#0a84ff";
    if (d === "fan" || d === "humidifier") return "#30b0c7";
    if (d === "media_player" || d === "vacuum") return "#5e5ce6";
    if (d === "lock") return "#ff9f0a";
    if (d === "person" || d === "device_tracker") return "#0a84ff";
    if (d === "alarm_control_panel") return st.state === "disarmed" ? "#34c759" : "#ff3b30";
    const w = this.istWarnung(st);
    if (w) return FARBEN[w];
    return "#34c759";
  },

  // Kurzer Zustand für Kacheln
  zustand(h, st, reg) {
    if (!st) return "Nicht gefunden";
    if (!this.verfuegbar(st)) return st.state === "unknown" ? "Unbekannt" : "Nicht erreichbar";
    const d = domainVon(st.entity_id), a = st.attributes;
    if (d === "light" && reg && st.state === "on") return `${reg.pct} %`;
    if (d === "cover" && a.current_position != null) return reg ? reg.text(reg.pct) : zustandText(h, st);
    if (d === "climate") {
      const ist = a.current_temperature != null ? ` · ${String(a.current_temperature).replace(".", ",")}°` : "";
      if (st.state === "off") return `Aus${ist}`;
      const soll = a.temperature != null ? `${String(a.temperature).replace(".", ",")}°` : zustandText(h, st);
      const was = a.hvac_action === "heating" ? "Heizt " : a.hvac_action === "cooling" ? "Kühlt " : "";
      return was + soll + ist;
    }
    if (d === "fan" && st.state === "on" && a.percentage != null) return `${a.percentage} %`;
    if (d === "media_player" && a.media_title && st.state === "playing") return a.media_title;
    if (d === "scene" || d === "script" || d === "button" || d === "input_button") return "Antippen zum Starten";
    return zustandText(h, st);
  },
};
// ---------------------------------------------------------------------------
// Blatt von unten (wie iOS): eine Ebene über dem Dashboard
// – folgt dem Finger am Griff, schließt bei Wischen nach unten, Escape, Tippen daneben
// ---------------------------------------------------------------------------
const SCHICHT_CSS = `
.dimm{position:fixed;inset:0;z-index:7;background:rgba(0,0,0,.28);opacity:0;transition:opacity .38s cubic-bezier(.32,.72,0,1);touch-action:none}
.dimm.auf{opacity:1}
.blatt{position:fixed;left:0;right:0;bottom:0;z-index:8;margin:0 auto;max-width:560px;max-height:calc(100% - 48px);
  display:flex;flex-direction:column;border-radius:var(--g-r-blatt) var(--g-r-blatt) 0 0;background:var(--g-blatt);
  border-top:1px solid var(--g-glas-rand);-webkit-backdrop-filter:var(--g-blur);backdrop-filter:var(--g-blur);
  box-shadow:var(--g-schatten-gross);transform:translateY(105%);transition:transform .38s cubic-bezier(.32,.72,0,1);
  padding-bottom:env(safe-area-inset-bottom)}
.blatt.auf{transform:translateY(0)}
.blatt.hoch{height:calc(100% - 48px)}
@media (min-width:900px){.blatt{bottom:auto;top:50%;border-radius:var(--g-r-blatt);transform:translateY(-40%) scale(.96);opacity:0;
  transition:transform .3s cubic-bezier(.32,.72,0,1),opacity .2s ease}.blatt.auf{transform:translateY(-50%);opacity:1}
  .blatt.hoch{height:auto;max-height:min(86vh,900px);min-height:320px}.griff{height:16px;visibility:hidden}}
.griff{flex:none;height:32px;display:flex;align-items:center;justify-content:center;touch-action:none;cursor:grab}
.griff span{width:38px;height:5px;border-radius:3px;background:var(--g-text2);opacity:.45}
.inhalt{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:0 var(--g-a4) var(--g-a5);display:flex;flex-direction:column;gap:var(--g-a4);scrollbar-width:none}
.inhalt::-webkit-scrollbar{display:none}
.kopf{position:sticky;top:0;z-index:2;touch-action:none;margin:0 calc(-1 * var(--g-a4));padding:var(--g-a1) var(--g-a5) var(--g-a2);display:flex;align-items:center;
  justify-content:space-between;gap:var(--g-a3);transition:background-color .2s ease,box-shadow .2s ease}
.kopf.kompakt{background:var(--g-kopf);-webkit-backdrop-filter:var(--g-blur);backdrop-filter:var(--g-blur);box-shadow:0 1px 0 var(--g-glas-rand)}
.kopf-text{display:flex;flex-direction:column;gap:2px;min-width:0}
.titel{margin:0;font-size:var(--g-s-titel);font-weight:800;letter-spacing:-.4px;color:var(--g-text);white-space:nowrap;overflow:hidden;
  text-overflow:ellipsis}
.kopf.kompakt .titel{font-size:var(--g-s-h2)}
.unter{font-size:var(--g-s-name);font-weight:500;color:var(--g-text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.kopf.kompakt .unter{font-size:var(--g-s-klein)}
.kopf-knoepfe{display:flex;gap:var(--g-a2);flex:none}
`;

class GlasSchicht {
  constructor({ quelle, hoch = false, titel = "", zu }) {
    this.quelle = quelle; // Karte, von der Ereignisse an HA weitergehen
    this.zu = zu;
    this.host = document.createElement("div");
    this.host.style.cssText = "position:relative;z-index:7";
    this.root = this.host.attachShadow({ mode: "open" });
    this.root.innerHTML = `<style>${TOKENS.replace(":host{", ".wurzel{").replace(":host([dunkel]){", ".wurzel.dunkel{")}${SCHICHT_CSS}</style>
      <div class="wurzel"><div class="dimm"></div><div class="blatt ${hoch ? "hoch" : ""}" role="dialog" aria-modal="true" aria-label="${esc(titel)}">
      <div class="griff" aria-hidden="true"><span></span></div><div class="inhalt"></div></div></div>`;
    this.wurzel = this.root.querySelector(".wurzel");
    this.blatt = this.root.querySelector(".blatt");
    this.inhalt = this.root.querySelector(".inhalt");
    this.root.querySelector(".dimm").addEventListener("click", () => this.schliessen());
    this._taste = (e) => { if (e.key === "Escape") this.schliessen(); };
    this.ziehen();
    this.host.addEventListener("focusout", () => setTimeout(() => {
      if (!this._weg && this.host.isConnected && !this.host.matches(":focus-within")) this.blatt.querySelector("[data-zu]")?.focus({ preventScroll: true });
    }, 0));
    // Ereignisse aus Karten im Blatt an HA weiterreichen (Mehr-Info, Aktionen, Dialoge)
    ["hass-more-info", "hass-action", "show-dialog", "hass-notification", "ll-custom"].forEach((t) =>
      this.host.addEventListener(t, (e) => {
        if (e.__glas) return;
        e.stopPropagation();
        const neu = new CustomEvent(t, { detail: e.detail, bubbles: true, composed: true });
        neu.__glas = true;
        if (t === "hass-more-info" || t === "show-dialog") this.schliessen();
        (this.quelle?.isConnected ? this.quelle : document.querySelector("home-assistant"))?.dispatchEvent(neu);
      }));
  }
  dunkel(an) { this.wurzel.classList.toggle("dunkel", !!an); }
  oeffnen() {
    portalWurzel().appendChild(this.host);
    this._vorher = document.activeElement;
    document.addEventListener("keydown", this._taste);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      this.root.querySelector(".dimm").classList.add("auf");
      this.blatt.classList.add("auf");
      this.blatt.querySelector("[data-zu]")?.focus({ preventScroll: true, focusVisible: false });
    }));
  }
  schliessen() {
    if (this._weg) return;
    this._weg = true;
    document.removeEventListener("keydown", this._taste);
    this.root.querySelector(".dimm").classList.remove("auf");
    this.blatt.style.transform = "";
    this.blatt.classList.remove("auf");
    setTimeout(() => { this.host.remove(); this.zu?.(); }, 340);
    try { this._vorher?.focus?.({ preventScroll: true }); } catch (_) { /* */ }
  }
  // Am Griff ziehen: Blatt folgt dem Finger, ab 120 px oder schnellem Wischen zu
  ziehen() {
    const griff = this.root.querySelector(".griff"), dimm = this.root.querySelector(".dimm");
    let start = null;
    const bewegen = (e) => {
      if (!start) return;
      const roh = e.clientY - start.y;
      if (!start.aktiv) { if (Math.abs(roh) < 6) return; start.aktiv = true; this.blatt.style.transition = "none"; dimm.style.transition = "none"; }
      const dy = roh < 0 ? roh * 0.2 : roh; // nach oben nur mit Widerstand
      const now = performance.now();
      start.v = (roh - (start.letzt || 0)) / Math.max(1, now - (start.t2 || start.t)); // Geschwindigkeit der letzten Bewegung
      start.letzt = roh; start.t2 = now;
      this.blatt.style.transform = `translateY(${dy}px)`;
      dimm.style.opacity = String(klemmen(1 - Math.max(0, dy) / Math.max(1, this.blatt.offsetHeight), 0, 1));
    };
    const los = () => {
      if (!start) return;
      const s = start; start = null;
      this.blatt.style.transition = ""; dimm.style.transition = ""; dimm.style.opacity = "";
      if (!s.aktiv) return;
      this._gezogen = performance.now();
      if ((s.letzt || 0) > this.blatt.offsetHeight * 0.3 || (s.v || 0) > 0.5) this.schliessen();
      else this.blatt.style.transform = "";
    };
    const runter = (e) => {
      if (e.button > 0) return;
      if (e.currentTarget !== griff && (this.inhalt.scrollTop > 0 || e.target.closest("button,input,select,textarea,a"))) return;
      start = { y: e.clientY, t: performance.now() };
      e.currentTarget.setPointerCapture(e.pointerId);
    };
    for (const el of [griff, this.inhalt]) {
      el.addEventListener("pointerdown", (e) => { if (el === griff || e.target.closest(".kopf")) runter(e); });
      el.addEventListener("pointermove", bewegen);
      el.addEventListener("pointerup", los);
      el.addEventListener("pointercancel", los);
    }
  }
  // Kopf mit Titel, Untertitel, Knöpfen; wird beim Scrollen kompakt (bleibt oben stehen)
  kopfHtml(titel, unter, knoepfe = "") {
    return `<div class="kopf"><div class="kopf-text"><h2 class="titel">${esc(titel)}</h2>${unter ? `<div class="unter">${esc(unter)}</div>` : ""}</div>
      <div class="kopf-knoepfe">${knoepfe}<button class="rund" data-zu aria-label="Schließen"><ha-icon data-i="mdi:close"></ha-icon></button></div></div>`;
  }
  kopfBinden() {
    this.inhalt.querySelector("[data-zu]")?.addEventListener("click", () => this.schliessen());
    const kopf = this.inhalt.querySelector(".kopf");
    this.inhalt.onscroll = () => kopf?.classList.toggle("kompakt", this.inhalt.scrollTop > 12);
    this.inhalt.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
  }
}
// ---------------------------------------------------------------------------
// Große Steuerung: öffnet beim Tippen aufs Symbol oder langem Drücken
// Regler-Säule, Farben, Temperatur, Rollo, Medien – je nach Gerätetyp
// ---------------------------------------------------------------------------
const STEUER_CSS = `
.mitte{display:flex;gap:var(--g-a5);align-items:center;justify-content:center;padding:var(--g-a2) 0}
.saeule{position:relative;flex:none;width:96px;height:250px;border-radius:28px;overflow:hidden;touch-action:none;cursor:ns-resize;background:var(--g-fuell)}
.saeule .fuell{position:absolute;inset:0;background:var(--f,#ff9f0a);transform-origin:bottom;will-change:transform}
.wert{font-size:44px;font-weight:300;line-height:1;color:var(--g-text);text-align:center;font-variant-numeric:tabular-nums}
.reihe{display:flex;gap:var(--g-a2);justify-content:center;flex-wrap:wrap}
.farbe{width:40px;height:40px;border-radius:50%;border:3px solid transparent}
.farbe[aria-pressed="true"]{border-color:var(--g-text)}
.schalter{position:relative;width:96px;height:58px;border-radius:29px;background:var(--g-fuell);transition:background-color .25s ease}
.schalter[aria-pressed="true"]{background:var(--g-gruen)}
.schalter span{position:absolute;top:4px;left:4px;width:50px;height:50px;border-radius:50%;background:#fff;box-shadow:0 3px 8px rgba(0,0,0,.25);
  transition:transform .25s cubic-bezier(.32,.72,0,1)}
.schalter[aria-pressed="true"] span{transform:translateX(38px)}
.gross-rund{width:56px;height:56px;border-radius:50%;font-size:28px;background:var(--g-fuell);color:var(--g-text);display:flex;align-items:center;justify-content:center}
.zeile-knopf{min-height:48px;padding:0 var(--g-a4);border-radius:var(--g-r-klein);font-size:var(--g-s-name);font-weight:600;color:var(--g-text)}
.abschnitt{display:flex;flex-direction:column;gap:var(--g-a2)}
.abschnitt-titel{font-size:var(--g-s-klein);font-weight:600;color:var(--g-text2);padding:0 var(--g-a1)}
.werte{display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:var(--g-a2)}
.wertbox{display:flex;flex-direction:column;gap:2px;padding:10px var(--g-a3);border-radius:var(--g-r-klein)}
.wertbox b{font-size:var(--g-s-text);color:var(--g-text)}
.rad{position:relative;flex:none;width:170px;height:170px;border-radius:50%;touch-action:none;cursor:crosshair;
  background:radial-gradient(circle closest-side,#fff,rgba(255,255,255,0)),conic-gradient(hsl(0,100%,50%),hsl(60,100%,50%),hsl(120,100%,50%),hsl(180,100%,50%),hsl(240,100%,50%),hsl(300,100%,50%),hsl(360,100%,50%))}
.rad .marke,.rad .lupe{position:absolute;border-radius:50%;border:3px solid #fff;pointer-events:none;transform:translate(-50%,-50%)}
.rad .marke{width:26px;height:26px;box-shadow:0 2px 6px rgba(0,0,0,.35)}
.rad .lupe{width:64px;height:64px;border-width:4px;box-shadow:0 6px 18px rgba(0,0,0,.35);transform:translate(-50%,-125%);opacity:0;transition:opacity .15s ease}
.rad.zieht .lupe{opacity:1}
.karte-s{display:flex;flex-direction:column;gap:var(--g-a2);padding:var(--g-a3) var(--g-a4) var(--g-a4);border-radius:var(--g-r)}
.karte-s .kopfz{display:flex;justify-content:space-between;align-items:baseline;gap:var(--g-a2)}
.karte-s h3{margin:0;font-size:var(--g-s-name);font-weight:600;color:var(--g-text)}
.reihe.links{justify-content:flex-start}
@media (max-width:420px){.mitte{flex-wrap:wrap}}
`;

const LICHT_FARBEN = [["Warmweiß", { color_temp_kelvin: 2700 }, "#ffb35c"], ["Neutral", { color_temp_kelvin: 4000 }, "#ffe2b8"],
  ["Kaltweiß", { color_temp_kelvin: 6000 }, "#e6f0ff"], ["Rot", { rgb_color: [255, 59, 48] }, "#ff3b30"], ["Orange", { rgb_color: [255, 159, 10] }, "#ff9f0a"],
  ["Grün", { rgb_color: [52, 199, 89] }, "#34c759"], ["Blau", { rgb_color: [10, 132, 255] }, "#0a84ff"], ["Lila", { rgb_color: [94, 92, 230] }, "#5e5ce6"],
  ["Pink", { rgb_color: [255, 45, 85] }, "#ff2d55"]];
const HVAC = { off: "Aus", heat: "Heizen", cool: "Kühlen", auto: "Auto", heat_cool: "Heizen/Kühlen", dry: "Trocknen", fan_only: "Lüften" };

function steuerungOeffnen(quelle, entityId, cfg = {}) {
  const s = new GlasSchicht({ quelle, titel: cfg.name || entityId, zu: () => { Glas.hassHoerer.delete(neu); clearInterval(takt); } });
  let letzter = null;
  // nur neu zeichnen, wenn sich diese Entität geändert hat
  let letzterTimer = null;
  const neu = () => { const st = Glas.hass?.states[entityId]; if (st !== letzter || Glas.timer?.[entityId] !== letzterTimer) zeichnen(); };
  const takt = setInterval(() => { letzterTimer = undefined; neu(); }, 30e3);
  let ziehen = false;
  const zeichnen = () => {
    if (ziehen) return;
    const h = Glas.hass, st = h?.states[entityId];
    if (!st) return;
    letzter = st;
    letzterTimer = Glas.timer?.[entityId];
    s.dunkel(istDunkel(h));
    const d = domainVon(entityId), a = st.attributes, reg = Geraet.regler(st), an = Geraet.istAn(st);
    const bereich = bereichVon(h, entityId);
    const raum = (bereich && h.areas?.[bereich]?.name) || "";
    const name = cfg.name || a.friendly_name || entityId;
    let mitte = "";
    if (reg && d !== "climate") {
      mitte = `<div class="saeule" role="slider" tabindex="0" aria-label="${esc(name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(reg.pct)}"
        aria-valuetext="${esc(reg.text(reg.pct))}" style="--f:${Geraet.farbe(st)}"><div class="fuell" style="transform:scaleY(${klemmen(reg.pct, 0, 100) / 100})"></div></div>`;
      if (d === "light" && (a.supported_color_modes || []).some((m) => ["hs", "rgb", "rgbw", "rgbww", "xy"].includes(m))) {
        const [hu, sa] = a.hs_color || [30, 0];
        const w = (hu - 90) * Math.PI / 180, r = klemmen(sa, 0, 100) / 2;
        const farbeJetzt = a.hs_color ? `hsl(${hu},100%,${100 - sa / 2}%)` : "#fff";
        const pos = `left:${50 + Math.cos(w) * r}%;top:${50 + Math.sin(w) * r}%;background:${farbeJetzt}`;
        mitte += `<div class="rad" aria-label="Farbe wählen" role="img"><span class="marke" style="${pos}"></span><span class="lupe" style="${pos}"></span></div>`;
      }
    } else if (d === "climate") {
      const soll = a.temperature != null ? String(a.temperature).replace(".", ",") + "°" : "–";
      mitte = `<button class="gross-rund" data-t="-" aria-label="Kälter">−</button><div style="text-align:center"><div class="wert">${st.state === "off" ? "Aus" : soll}</div>
        <div class="leise">Raum jetzt ${a.current_temperature != null ? String(a.current_temperature).replace(".", ",") + " °" : "–"}</div></div>
        <button class="gross-rund" data-t="+" aria-label="Wärmer">+</button>`;
    } else if (Geraet.schaltbar(st) || Geraet.ausloesbar(st)) {
      mitte = `<button class="schalter" data-schalten aria-pressed="${an}" aria-label="${esc(name)} ${an ? "ausschalten" : "einschalten"}"><span></span></button>`;
    } else {
      mitte = `<div class="wert">${esc(zustandText(h, st))}</div>`;
    }
    let extra = "";
    if (d === "light" && st.state === "on") {
      const modes = a.supported_color_modes || [];
      const farbig = modes.some((m) => ["hs", "rgb", "rgbw", "rgbww", "xy"].includes(m));
      const temp = modes.includes("color_temp");
      const liste = LICHT_FARBEN.filter(([, w]) => (w.rgb_color ? farbig : temp));
      if (liste.length) extra += `<div class="reihe">${liste.map(([n, , c], i) =>
        `<button class="farbe" data-farbe="${i}" style="background:${c}" aria-label="${n}" title="${n}"></button>`).join("")}</div>`;
      if (bereich && entitaetenImBereich(h, bereich, ["light"]).length > 1) extra += `<button class="zeile-knopf glas" data-raumfarbe>Diese Farbe für alle Lichter im Raum</button>`;
    }
    if (d === "climate" && a.hvac_modes?.length) {
      const eco = st.state !== "off" && Number(a.temperature) === 17;
      extra += `<div class="abschnitt"><div class="abschnitt-titel">Modus</div><div class="reihe">${a.hvac_modes.map((m) => {
        const akt = st.state === m && !(eco && m === "heat");
        return `<button class="pille fuell ${akt ? "aktiv" : ""}" data-hvac="${m}" aria-pressed="${akt}">${HVAC[m] || m}</button>`;
      }).join("")}${a.hvac_modes.includes("heat") ? `<button class="pille fuell ${eco ? "aktiv" : ""}" data-eco aria-pressed="${eco}">Eco 17°</button>` : ""}</div></div>`;
      if (a.preset_modes?.length) extra += `<div class="abschnitt"><div class="abschnitt-titel">Voreinstellung</div><div class="reihe">${a.preset_modes.map((m) =>
        `<button class="pille fuell ${a.preset_mode === m ? "aktiv" : ""}" data-preset="${esc(m)}">${esc(attributText(h, { ...st, attributes: { ...a, preset_mode: m } }, "preset_mode") || m)}</button>`).join("")}</div></div>`;
    }
    if (d === "cover") extra += `<div class="reihe"><button class="zeile-knopf glas" data-c="open_cover">Öffnen</button><button class="zeile-knopf glas" data-c="stop_cover">Stopp</button><button class="zeile-knopf glas" data-c="close_cover">Schließen</button></div>`;
    if (d === "media_player") extra += `<div class="reihe"><button class="gross-rund" data-m="media_previous_track" aria-label="Zurück"><ha-icon data-i="mdi:skip-previous"></ha-icon></button>
      <button class="gross-rund" data-m="media_play_pause" aria-label="Wiedergabe/Pause"><ha-icon data-i="${st.state === "playing" ? "mdi:pause" : "mdi:play"}"></ha-icon></button>
      <button class="gross-rund" data-m="media_next_track" aria-label="Weiter"><ha-icon data-i="mdi:skip-next"></ha-icon></button></div>`;
    if (d === "vacuum") extra += `<div class="reihe"><button class="zeile-knopf glas" data-v="start">Starten</button><button class="zeile-knopf glas" data-v="pause">Pause</button><button class="zeile-knopf glas" data-v="return_to_base">Zur Station</button></div>`;
    if (reg && d !== "climate" && (Geraet.schaltbar(st))) extra = `<div class="reihe"><button class="zeile-knopf glas" data-schalten>${an ? "Ausschalten" : "Einschalten"}</button></div>` + extra;
    // Ausschalten in … (Timer läuft in der Integration)
    if (Glas.einst && ["light", "switch", "fan", "media_player", "climate", "input_boolean", "humidifier"].includes(d)) {
      const rest = timerRest(entityId), aktiv = Glas.timer?.[entityId], gewaehlt = Number(Glas._timerWahl?.[entityId] || 0);
      extra += `<div class="karte-s glas"><div class="kopfz"><h3>Ausschalten in</h3><span class="leise">${rest ? `Aus in ${rest}` : "Kein Timer"}</span></div>
        <div class="reihe links">${[[15, "15 min"], [30, "30 min"], [60, "1 h"], [120, "2 h"]].map(([m, n]) => {
          const an2 = !!aktiv && gewaehlt === m;
          return `<button class="pille fuell ${an2 ? "aktiv" : ""}" data-timer="${m}" aria-pressed="${an2}">${n}</button>`;
        }).join("")}${aktiv ? `<button class="pille fuell" data-timer="0">Abbrechen</button>` : ""}</div></div>`;
    }
    // Zusatzwerte (Attribute, die Menschen interessieren)
    const zusatz = (cfg.zusatz || []).map((z) => h.states[z]).filter(Boolean);
    if (zusatz.length) extra += `<div class="werte">${zusatz.map((z) => `<div class="wertbox glas"><span class="leise">${esc(z.attributes.friendly_name)}</span><b>${esc(zustandText(h, z))}</b></div>`).join("")}</div>`;
    extra += `<button class="zeile-knopf glas" data-ha>Verlauf und Einstellungen ›</button>`;
    s.inhalt.innerHTML = `<style>${STEUER_CSS}</style>${s.kopfHtml(name, [raum, Geraet.zustand(h, st, reg)].filter(Boolean).join(" · "))}
      <div class="mitte">${mitte}</div>${extra}`;
    s.kopfBinden();
    const $ = (q) => s.inhalt.querySelector(q), $$ = (q) => [...s.inhalt.querySelectorAll(q)];
    $$("[data-schalten]").forEach((b) => b.addEventListener("click", () => Geraet.schalten(h, st)));
    $("[data-ha]").addEventListener("click", () => { s.schliessen(); mehrInfo(quelle, entityId); });
    $$("[data-farbe]").forEach((b) => b.addEventListener("click", () => h.callService("light", "turn_on", { entity_id: entityId, ...LICHT_FARBEN[b.dataset.farbe][1] })));
    $$("[data-hvac]").forEach((b) => b.addEventListener("click", () => h.callService("climate", "set_hvac_mode", { entity_id: entityId, hvac_mode: b.dataset.hvac })));
    $("[data-eco]")?.addEventListener("click", () => h.callService("climate", "set_temperature", { entity_id: entityId, temperature: 17, hvac_mode: "heat" }));
    $$("[data-timer]").forEach((b) => b.addEventListener("click", () => {
      const m = Number(b.dataset.timer), vorher = Number(Glas._timerWahl?.[entityId] || 0);
      const neuM = m && vorher === m && Glas.timer?.[entityId] ? 0 : m; // gleicher Knopf nochmal = Timer aus
      Glas._timerWahl = { ...(Glas._timerWahl || {}), [entityId]: neuM };
      if (neuM && !an) Geraet.schalten(h, st);
      Glas.timerSetzen(h, entityId, neuM).catch(() => {});
    }));
    $("[data-raumfarbe]")?.addEventListener("click", () => {
      const ziel = entitaetenImBereich(h, bereich, ["light"]);
      const farbe = a.hs_color && a.color_mode !== "color_temp" ? { hs_color: a.hs_color } : a.color_temp_kelvin ? { color_temp_kelvin: a.color_temp_kelvin } : {};
      h.callService("light", "turn_on", { entity_id: ziel, ...farbe });
    });
    const rad = $(".rad");
    if (rad) {
      const marke = rad.querySelector(".marke"), lupe = rad.querySelector(".lupe");
      let hs = null;
      const setzeFarbe = (e) => {
        const r = rad.getBoundingClientRect(), vx = e.clientX - (r.left + r.width / 2), vy = e.clientY - (r.top + r.height / 2);
        const R = r.width / 2, abstand = Math.min(Math.hypot(vx, vy), R), w = Math.atan2(vy, vx);
        const hu = Math.round((w * 180 / Math.PI + 90 + 360) % 360), sa = Math.round(abstand / R * 100);
        const c = `hsl(${hu},100%,${100 - sa / 2}%)`;
        [marke, lupe].forEach((el) => { el.style.left = `${50 + Math.cos(w) * abstand / R * 50}%`; el.style.top = `${50 + Math.sin(w) * abstand / R * 50}%`; el.style.background = c; });
        hs = [hu, sa];
      };
      rad.addEventListener("pointerdown", (e) => { ziehen = true; rad.setPointerCapture(e.pointerId); rad.classList.add("zieht"); setzeFarbe(e); });
      rad.addEventListener("pointermove", (e) => { if (ziehen) setzeFarbe(e); });
      const radLos = () => { if (!ziehen) return; ziehen = false; rad.classList.remove("zieht"); if (hs) h.callService("light", "turn_on", { entity_id: entityId, hs_color: hs }); };
      rad.addEventListener("pointerup", radLos); rad.addEventListener("pointercancel", radLos);
    }
    $$("[data-preset]").forEach((b) => b.addEventListener("click", () => h.callService("climate", "set_preset_mode", { entity_id: entityId, preset_mode: b.dataset.preset })));
    $$("[data-t]").forEach((b) => b.addEventListener("click", () => {
      const schritt = Number(a.target_temp_step || 0.5) * (b.dataset.t === "+" ? 1 : -1);
      h.callService("climate", "set_temperature", { entity_id: entityId, temperature: klemmen(Number(a.temperature ?? 20) + schritt, a.min_temp ?? 7, a.max_temp ?? 30) });
    }));
    $$("[data-c]").forEach((b) => b.addEventListener("click", () => h.callService("cover", b.dataset.c, { entity_id: entityId })));
    $$("[data-m]").forEach((b) => b.addEventListener("click", () => h.callService("media_player", b.dataset.m, { entity_id: entityId })));
    $$("[data-v]").forEach((b) => b.addEventListener("click", () => h.callService("vacuum", b.dataset.v, { entity_id: entityId })));
    s.inhalt.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
    const saeule = $(".saeule");
    if (saeule && reg) {
      let p = reg.pct;
      const setze = (e) => {
        const r = saeule.getBoundingClientRect();
        p = klemmen(((r.bottom - e.clientY) / r.height) * 100, 0, 100);
        saeule.firstElementChild.style.transform = `scaleY(${p / 100})`;
        saeule.setAttribute("aria-valuenow", Math.round(p)); saeule.setAttribute("aria-valuetext", reg.text(p));
        s.inhalt.querySelector(".unter").textContent = [raum, reg.text(p)].filter(Boolean).join(" · ");
      };
      saeule.addEventListener("pointerdown", (e) => { ziehen = true; saeule.setPointerCapture(e.pointerId); setze(e); });
      saeule.addEventListener("pointermove", (e) => { if (ziehen) setze(e); });
      const los = () => { if (!ziehen) return; ziehen = false; reg.setzen(h, p); };
      saeule.addEventListener("pointerup", los);
      saeule.addEventListener("pointercancel", los);
      saeule.addEventListener("keydown", (e) => {
        const d2 = { ArrowUp: 5, ArrowRight: 5, ArrowDown: -5, ArrowLeft: -5 }[e.key];
        if (d2) { e.preventDefault(); reg.setzen(h, klemmen(reg.pct + d2, 0, 100)); }
      });
    }
  };
  Glas.hassHoerer.add(neu);
  zeichnen();
  s.oeffnen();
  return s;
}

// ---------------------------------------------------------------------------
// glas-kachel-card: eine Karte für jede Entität, passt sich dem Typ an
// ---------------------------------------------------------------------------
const KACHEL_CSS = `
:host{display:block;height:100%}
.kachel{position:relative;height:100%;min-height:var(--g-kachel-h);display:flex;align-items:center;gap:var(--g-a3);padding:var(--g-a3);
  border-radius:var(--g-r);cursor:pointer;overflow:hidden;touch-action:pan-y;outline:none}
.kachel.an{background:var(--g-an);border:1px solid transparent;box-shadow:var(--g-schatten)}
.kachel.warn{box-shadow:inset 0 0 0 2px var(--warn)}
.kachel.weg{opacity:.5}
.kachel.gross{flex-direction:column;align-items:flex-start;justify-content:space-between;min-height:calc(var(--g-kachel-h) * 2 + var(--g-a2))}
.kachel.klein{flex-direction:column;justify-content:center;gap:4px;padding:var(--g-a1) 6px}
.kachel.klein .symbol{width:36px;height:36px}
.kname{position:relative;max-width:100%;font-size:var(--g-s-mini);font-weight:600;line-height:1.2;color:var(--g-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none}
.an .kname{color:var(--g-text-an)}
.kachel.ganz .text{flex:1}
.fuell{position:absolute;inset:0;background:var(--g-an);pointer-events:none;transform-origin:left;transition:transform .2s cubic-bezier(.23,1,.32,1)}
.kachel.an .fuell{background:var(--g-an)}
.kachel.an.regelbar{background:var(--g-an-gedimmt)}
.symbol{position:relative;flex:none;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  background:var(--g-fuell);color:var(--g-fuell-text);transition:background-color .2s ease}
.an .symbol{background:var(--sf);color:#fff}
.warn .symbol{background:var(--warn);color:#fff}
.text{position:relative;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:2px;flex:1;align-self:stretch;text-align:left;border-radius:var(--g-r-klein)}
.gross .text{flex:none;width:100%;align-self:auto}
.name{font-size:var(--g-s-name);font-weight:600;color:var(--g-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.zustand{font-size:var(--g-s-klein);color:var(--g-text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-variant-numeric:tabular-nums}
.an .name{color:var(--g-text-an)} .an .zustand{color:var(--g-text2-an)}
.grosswert{position:relative;font-size:var(--g-s-titel);font-weight:300;color:var(--g-text);line-height:1}
.an .grosswert{color:var(--g-text-an)}
.zusatz{position:relative;display:flex;gap:var(--g-a1);flex-wrap:wrap;margin-top:var(--g-a1)}
.zusatz span{display:inline-flex;align-items:center;gap:var(--g-a1);padding:2px 8px;border-radius:var(--g-r-pille);font-size:var(--g-s-mini);font-weight:600;
  background:var(--g-fuell);color:var(--g-text)}
.an .zusatz span{color:var(--g-text-an);background:rgba(120,120,128,.14)}
.zusatz ha-state-icon{--mdc-icon-size:14px}
`;

class GlasKachelCard extends GlasKarte {
  static standard() { return { groesse: "breit", typ: "auto", zweite_zeile: "zustand" }; }
  static getConfigElement() { return document.createElement("glas-kachel-card-editor"); }
  static getStubConfig(hass) {
    const e = Object.keys(hass.states).find((x) => x.startsWith("light.")) || Object.keys(hass.states)[0];
    return { entity: e };
  }
  pruefen(c) { if (!c.entity) throw new Error("Bitte eine Entität wählen"); }
  entitaeten() { return [this._config.entity, ...(this._config.zusatz || [])]; }
  getCardSize() { return this._config?.groesse === "gross" ? 3 : 1; }
  getGridOptions() {
    const g = this._config?.groesse;
    if (g === "klein") return { columns: 3, rows: "auto", min_columns: 2 };
    if (g === "gross") return { columns: 6, rows: 3, min_columns: 6, min_rows: 3 };
    if (g === "ganz") return { columns: 12, rows: "auto", min_columns: 6 };
    return { columns: 6, rows: "auto", min_columns: 4 };
  }
  css() { return KACHEL_CSS; }
  verhalten(st) {
    const t = this._config.typ;
    const reg = Geraet.regler(st);
    return {
      regler: t === "auto" || t === "regler" ? reg : null,
      schalten: t === "auto" ? Geraet.schaltbar(st) || Geraet.ausloesbar(st) : t === "schalter" || t === "regler",
      anzeige: t === "anzeige" || (t === "auto" && !Geraet.schaltbar(st) && !Geraet.ausloesbar(st) && !reg),
    };
  }
  html() {
    const h = this._hass, c = this._config, st = h.states[c.entity];
    const v = this.verhalten(st);
    const reg = Geraet.regler(st);
    const an = Geraet.istAn(st), warn = Geraet.istWarnung(st);
    const g = c.groesse;
    const name = c.name || st?.attributes.friendly_name || c.entity;
    let zweite = "";
    if (c.zweite_zeile === "zustand") zweite = Geraet.zustand(h, st, reg);
    else if (c.zweite_zeile === "zuletzt") zweite = st ? relativeZeit(st.last_changed) : "";
    else if (c.zweite_zeile === "attribut") zweite = attributText(h, st, c.attribut);
    else if (c.zweite_zeile === "text") zweite = c.text || "";
    else if (c.zweite_zeile === "zustand_zuletzt") zweite = st ? `${Geraet.zustand(h, st, reg)} · ${relativeZeit(st.last_changed)}` : "";
    // Neue Anzeige-Auswahl (Häkchen): Name, Symbol, Zustand, Zuletzt geändert, Raum
    const liste = Array.isArray(c.anzeige) ? c.anzeige : null;
    if (liste) {
      const raumId = bereichVon(h, c.entity), raum = raumId ? h.areas?.[raumId]?.name : "";
      zweite = [liste.includes("zustand") && st ? Geraet.zustand(h, st, reg) : "", liste.includes("zuletzt") && st ? relativeZeit(st.last_changed) : "",
        liste.includes("raum") ? raum : ""].filter(Boolean).join(" · ");
    }
    const nameZeigen = liste ? liste.includes("name") : c.name_zeigen !== false;
    const symbolZeigen = liste ? liste.includes("symbol") : c.icon_zeigen !== false;
    const farbe = farbeAus(c.farbe, Geraet.farbe(st));
    const pct = v.regler && an ? klemmen(v.regler.pct, 0, 100) : 0;
    const hell = an && c.hell_wenn_an !== false;
    const fuellen = v.regler && hell && g !== "klein";
    const grossWert = g === "gross" && v.anzeige && st ? zustandText(h, st) : "";
    const zusatz = (c.zusatz || []).map((z) => h.states[z]).filter(Boolean);
    const klassen = ["kachel", "k", g, hell ? "an" : "glas", fuellen ? "regelbar" : "", warn ? "warn" : "", Geraet.verfuegbar(st) ? "" : "weg"].join(" ");
    const icon = c.icon ? `data-i="${esc(c.icon)}"` : "";
    const klein = g === "klein" || !nameZeigen && !zweite;
    const druck = v.schalten && !v.anzeige ? `aria-pressed="${an}"` : "";
    return `<div class="${klassen}" style="--sf:${farbe};--warn:${warn ? FARBEN[warn] : "transparent"}">
      ${fuellen ? `<div class="fuell" style="transform:scaleX(${pct / 100})"></div>` : ""}
      ${!symbolZeigen && g !== "klein" ? "" : `<button class="symbol" data-zone="${klein ? "tap" : "icon"}" ${klein ? druck : ""} aria-label="${klein ? `${esc(name)}: ${esc(zweite)}` : `Steuerung ${esc(name)}`}"><ha-state-icon data-e="${esc(c.entity)}" ${icon}></ha-state-icon></button>`}
      ${g === "klein" ? (nameZeigen ? `<span class="kname" aria-hidden="true">${esc(name)}</span>` : "") : `<button class="text" data-zone="tap" ${druck} aria-label="${esc(name)}: ${esc(zweite)}">
        ${grossWert ? `<div class="grosswert">${esc(grossWert)}</div>` : ""}
        ${nameZeigen ? `<div class="name">${esc(name)}</div>` : ""}
        ${zweite && !grossWert ? `<div class="zustand">${esc(zweite)}</div>` : ""}
        ${zusatz.length ? `<div class="zusatz" aria-hidden="true">${zusatz.map((z) => `<span><ha-state-icon data-e="${esc(z.entity_id)}"></ha-state-icon>${esc(zustandText(h, z))}</span>`).join("")}</div>` : ""}
      </button>`}
    </div>`;
  }
  binden() {
    this.iconsSetzen();
    const el = this.$(".kachel"), c = this._config;
    let ges = null, timer = null, letzterTipp = 0, tippTimer = null;
    const st = () => this._hass.states[c.entity];
    const ausfuehren = (art) => {
      const s = st(); if (!s) return;
      const v = this.verhalten(s);
      const eigene = { tap: c.tap_action, icon: c.icon_tap_action, hold: c.hold_action, double: c.double_tap_action }[art];
      if (eigene && eigene.action) { aktion(this, { entity: c.entity, tap_action: eigene }, "tap"); return; }
      if (art === "tap" && v.schalten && !v.anzeige) { if (navigator.vibrate) navigator.vibrate(8); Geraet.schalten(this._hass, s); return; }
      if (art === "tap" && v.anzeige) { mehrInfo(this, c.entity); return; }
      steuerungOeffnen(this, c.entity, c); // Symbol / Halten: große Steuerung
    };
    el.addEventListener("contextmenu", (e) => e.preventDefault());
    // Tastatur (Klick ohne Zeiger, detail 0): gleiche Aktionen wie Tippen; Zeiger-Klicks erledigen die Pointer-Ereignisse
    this.$$("button[data-zone]").forEach((b) => b.addEventListener("click", (e) => { if (e.detail === 0) ausfuehren(b.dataset.zone === "icon" ? "icon" : "tap"); }));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.altKey) { e.preventDefault(); ausfuehren("hold"); }
      const r = this.verhalten(st()).regler;
      const d = { ArrowRight: 10, ArrowLeft: -10 }[e.key];
      if (d && r) { e.preventDefault(); r.setzen(this._hass, klemmen(r.pct + d, 0, 100)); }
    });
    el.addEventListener("pointerdown", (e) => {
      if (e.button > 0) return;
      const r = el.getBoundingClientRect();
      const s = st();
      const regler = s && this.verhalten(s).regler;
      ges = { x: e.clientX, y: e.clientY, w: r.width, zone: e.target.closest("[data-zone=icon]") ? "icon" : "tap",
        start: regler && Geraet.istAn(s) ? regler.pct : 0, regler, zieh: false, lang: false, weg: false };
      try { el.setPointerCapture(e.pointerId); } catch (_) { /* */ }
      clearTimeout(timer);
      timer = setTimeout(() => { if (ges && !ges.zieh && !ges.weg) { ges.lang = true; if (navigator.vibrate) navigator.vibrate(12); ausfuehren("hold"); } }, 480);
    });
    el.addEventListener("pointermove", (e) => {
      if (!ges || ges.lang) return;
      const dx = e.clientX - ges.x, dy = e.clientY - ges.y;
      if (!ges.zieh && !ges.weg) {
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) && ges.regler && c.wischen !== false && c.groesse !== "klein") { ges.zieh = true; clearTimeout(timer); this._sperre = true; }
        else if (Math.abs(dx) > 8 || Math.abs(dy) > 8) { ges.weg = true; clearTimeout(timer); }
      }
      if (ges.zieh) {
        ges.p = klemmen(ges.start + (dx / ges.w) * 100, 0, 100);
        el.classList.toggle("an", ges.p > 0); el.classList.toggle("regelbar", ges.p > 0); el.classList.toggle("glas", ges.p <= 0);
        let f = this.$(".fuell");
        if (!f) { f = document.createElement("div"); f.className = "fuell"; el.prepend(f); }
        f.style.transition = "none"; f.style.transform = `scaleX(${ges.p / 100})`;
        const z = this.$(".zustand"); if (z) z.textContent = ges.regler.text(ges.p);
      }
    });
    const los = (abbruch) => {
      clearTimeout(timer);
      const g = ges; ges = null;
      if (!g) return;
      if (g.zieh) { this._sperre = false; if (!abbruch) g.regler.setzen(this._hass, g.p ?? g.start); else this.render(); return; }
      if (abbruch || g.lang || g.weg) return;
      const art = g.zone === "icon" ? "icon" : "tap";
      if (c.double_tap_action?.action && art === "tap") {
        const jetzt = Date.now();
        if (jetzt - letzterTipp < 280) { clearTimeout(tippTimer); letzterTipp = 0; ausfuehren("double"); return; }
        letzterTipp = jetzt; tippTimer = setTimeout(() => ausfuehren("tap"), 280); return;
      }
      ausfuehren(art);
    };
    el.addEventListener("pointerup", () => los(false));
    el.addEventListener("pointercancel", () => los(true));
  }
}

class GlasKachelEditor extends GlasEditor {
  schema() {
    const c = this._config;
    return [
      { name: "entity", selector: { entity: {} } },
      { type: "grid", name: "", schema: [
        { name: "name", selector: { text: {} } },
        { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
      ] },
      { type: "grid", name: "", schema: [
        { name: "groesse", selector: { select: { mode: "dropdown", options: [
          { value: "klein", label: "Klein (nur Symbol, 1×1)" }, { value: "breit", label: "Breit (2×1)" },
          { value: "gross", label: "Groß (2×2)" }, { value: "ganz", label: "Ganze Breite" }] } } },
        { name: "typ", selector: { select: { mode: "dropdown", options: [
          { value: "auto", label: "Automatisch" }, { value: "schalter", label: "Schalter (Tippen schaltet)" },
          { value: "regler", label: "Regler (seitlich wischen)" }, { value: "anzeige", label: "Nur anzeigen" }] } } },
      ] },
      { type: "expandable", flatten: true, name: "gruppe1", title: "Aussehen", icon: "mdi:palette-outline", schema: [
        { name: "zweite_zeile", selector: { select: { mode: "dropdown", options: [
          { value: "zustand", label: "Zustand" }, { value: "zustand_zuletzt", label: "Zustand + zuletzt geändert" },
          { value: "zuletzt", label: "Zuletzt geändert" }, { value: "attribut", label: "Ein Attribut" },
          { value: "text", label: "Eigener Text" }, { value: "aus", label: "Nichts" }] } } },
        ...(c.zweite_zeile === "attribut" ? [{ name: "attribut", selector: { attribute: {} }, context: { filter_entity: "entity" } }] : []),
        ...(c.zweite_zeile === "text" ? [{ name: "text", selector: { text: {} } }] : []),
        { name: "farbe", selector: { select: { mode: "dropdown", options: FARB_OPTIONEN.map(([value, label]) => ({ value, label })) } } },
        { type: "grid", name: "", schema: [
          { name: "name_zeigen", selector: { boolean: {} } },
          { name: "icon_zeigen", selector: { boolean: {} } },
          { name: "hell_wenn_an", selector: { boolean: {} } },
          { name: "wischen", selector: { boolean: {} } },
        ] },
      ] },
      { type: "expandable", flatten: true, name: "gruppe2", title: "Zusatzinfos in der Kachel", icon: "mdi:information-outline", schema: [
        { name: "zusatz", selector: { entity: { multiple: true } } },
      ] },
      { type: "expandable", flatten: true, name: "gruppe3", title: "Aktionen", icon: "mdi:gesture-tap", schema: AKTIONEN_SCHEMA },
    ];
  }
  render() {
    // Standardwerte für Schalter sichtbar machen (nicht gesetzt = an)
    for (const k of ["name_zeigen", "icon_zeigen", "hell_wenn_an", "wischen"]) if (this._config[k] === undefined) this._config[k] = true;
    super.render();
  }
  labels() {
    return { entity: "Entität", name: "Name (leer = aus HA)", icon: "Symbol (leer = automatisch)", groesse: "Größe", typ: "Verhalten",
      zweite_zeile: "Zweite Zeile", attribut: "Attribut", text: "Text", farbe: "Farbe, wenn aktiv",
      name_zeigen: "Name zeigen", icon_zeigen: "Symbol zeigen", hell_wenn_an: "Kachel hell, wenn an", wischen: "Seitlich wischen regelt",
      zusatz: "Weitere Entitäten (kleine Chips)", ...AKTIONEN_LABELS };
  }
  hilfen() {
    return { typ: "Automatisch: Lampen, Rollos, Heizungen lassen sich wischen; Sensoren zeigen nur an.",
      tap_action: "Leer lassen = Standard: schalten bzw. Details", icon_tap_action: "Leer lassen = große Steuerung",
      hold_action: "Leer lassen = große Steuerung" };
  }
}
// ---------------------------------------------------------------------------
// glas-kopf-card: „Hallo Corin“, Personenwahl (C · L · Tablet), Schnellzugriff-Chips
// ---------------------------------------------------------------------------
const KOPF_CSS = `
:host{display:block}
.oben{display:flex;align-items:center;justify-content:space-between;gap:var(--g-a3);padding:0 var(--g-a1)}
.gruss{display:flex;flex-direction:column;gap:2px;min-width:0}
h1{margin:0;font-size:var(--g-s-titel);font-weight:800;letter-spacing:-.4px;color:var(--g-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.personen{flex:none;display:flex;gap:2px;padding:3px;border-radius:var(--g-r-pille)}
.person{position:relative;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-size:var(--g-s-klein);font-weight:700;color:var(--g-text);transition:background-color .2s ease}
.person[aria-pressed="true"]{background:var(--g-aktiv);color:var(--g-aktiv-text)}
.haus{position:absolute;right:-2px;bottom:-2px;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  background:var(--g-akzent);color:#fff;box-shadow:0 0 0 2px var(--g-ring,#fff)}
:host([dunkel]) .haus{--g-ring:#1c1c1e}
.haus ha-icon{--mdc-icon-size:10px}
.chips{display:flex;flex-wrap:wrap;gap:var(--g-a2);margin-top:var(--g-a3)}
.chip{min-height:36px}
.chip ha-state-icon,.chip ha-icon{--mdc-icon-size:16px;color:var(--cf)}
`;

class GlasKopfCard extends GlasKarte {
  static standard() { return { gruss_modus: "name", personen: [], chips: [] }; }
  static getConfigElement() { return document.createElement("glas-kopf-card-editor"); }
  static getStubConfig(hass) { return { personen: [{ name: hass.user?.name || "Ich", kurz: (hass.user?.name || "I")[0], benutzer: hass.user?.id }], chips: [] }; }
  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }
  entitaeten() { return [...(this._config.personen || []).map((p) => p.entity), ...(this._config.chips || []).map((c) => c.entity)].filter(Boolean); }
  personen() {
    return (this._config.personen || []).map((p, i) => ({ ...p, id: p.benutzer || p.name || `p${i}`, kurz: p.kurz || (p.tablet ? "" : (p.name || "?")[0].toUpperCase()) }));
  }
  render() { Glas.personenSetzen(this.personen()); super.render(); }
  css() { return KOPF_CSS; }
  chipSichtbar(ch, st) {
    const z = ch.zeigen || "immer";
    if (z === "immer") return true;
    if (!st) return false;
    if (z === "an") return Geraet.istAn(st) || !!Geraet.istWarnung(st);
    if (z === "aus") return !Geraet.istAn(st);
    if (z === "wert") return String(st.state) === String(ch.wert ?? "");
    return true;
  }
  html() {
    const h = this._hass, c = this._config;
    const ich = Glas.aktuellePerson(h);
    const ps = this.personen();
    const std = new Date().getHours();
    const tz = std < 11 ? "Guten Morgen" : std < 18 ? "Hallo" : "Guten Abend";
    const vorname = ich?.tablet ? "" : (ich?.name || "").split(" ")[0];
    const gruss = c.gruss_modus === "text" ? (c.gruss_text || "Zuhause") : `${c.gruss_modus === "tageszeit" ? tz : "Hallo"}${vorname ? ", " + vorname : ""}`.replace("Hallo, ", "Hallo ");
    const chips = (c.chips || []).map((ch, i) => ({ ch, i, st: h.states[ch.entity] })).filter((x) => this.chipSichtbar(x.ch, x.st));
    return `<div class="oben"><div class="gruss"><h1>${esc(gruss)}</h1>${c.untertitel ? `<div class="leise">${esc(c.untertitel)}</div>` : ""}</div>
      ${ps.length > 1 ? `<div class="personen glas" role="group" aria-label="Wer schaut gerade?">${ps.map((p) => {
        const da = p.entity && h.states[p.entity]?.state === "home";
        return `<button class="person" data-p="${esc(p.id)}" aria-pressed="${ich?.id === p.id}" aria-label="${esc(p.name || "Tablet")}${da ? ", zu Hause" : ""}">
          ${p.tablet ? `<ha-icon data-i="mdi:tablet"></ha-icon>` : esc(p.kurz)}${da ? `<span class="haus" aria-hidden="true"><ha-icon data-i="mdi:home"></ha-icon></span>` : ""}</button>`;
      }).join("")}</div>` : ""}</div>
      ${chips.length ? `<div class="chips">${chips.map(({ ch, i, st }) => {
        const farbe = farbeAus(ch.farbe, st ? Geraet.farbe(st) : "#8e8e93");
        const text = [ch.name || st?.attributes.friendly_name || ch.entity, ch.zustand_zeigen === false || !st ? "" : Geraet.zustand(h, st, Geraet.regler(st))].filter(Boolean).join(" ");
        const sym = ch.icon ? `<ha-icon data-i="${esc(ch.icon)}"></ha-icon>` : st ? `<ha-state-icon data-e="${esc(ch.entity)}"></ha-state-icon>` : `<span class="punkt" style="background:${farbe}"></span>`;
        return `<button class="pille glas chip k" data-c="${i}" style="--cf:${farbe}">${sym}${esc(text)}</button>`;
      }).join("")}</div>` : ""}`;
  }
  binden() {
    this.iconsSetzen();
    this.$$("[data-p]").forEach((b) => b.addEventListener("click", () => Glas.personWaehlen(b.dataset.p)));
    this.$$("[data-c]").forEach((b) => b.addEventListener("click", () => {
      const ch = this._config.chips[b.dataset.c], st = this._hass.states[ch.entity];
      if (ch.tap_action?.action) return aktion(this, { entity: ch.entity, tap_action: ch.tap_action }, "tap");
      if (!st) return;
      const d = domainVon(ch.entity);
      if (d === "input_select" || d === "select") return this.dienst(d, "select_next", { entity_id: ch.entity, cycle: true });
      if (Geraet.schaltbar(st) || Geraet.ausloesbar(st)) return Geraet.schalten(this._hass, st);
      mehrInfo(this, ch.entity);
    }));
  }
}

class GlasKopfEditor extends GlasEditor {
  async render() {
    if (this._hass && !this._benutzer) {
      this._benutzer = [];
      try {
        const l = await this._hass.callWS({ type: "config/auth/list" });
        this._benutzer = l.filter((u) => !u.system_generated && u.is_active).map((u) => ({ value: u.id, label: u.name }));
      } catch (_) { this._benutzer = this._hass.user ? [{ value: this._hass.user.id, label: this._hass.user.name }] : []; }
    }
    super.render();
  }
  schema() {
    return [
      { name: "gruss_modus", selector: { select: { mode: "dropdown", options: [
        { value: "name", label: "Hallo + Vorname" }, { value: "tageszeit", label: "Guten Morgen/Abend + Vorname" }, { value: "text", label: "Eigener Text" }] } } },
      ...(this._config.gruss_modus === "text" ? [{ name: "gruss_text", selector: { text: {} } }] : []),
      { name: "untertitel", selector: { text: {} } },
    ];
  }
  labels() { return { gruss_modus: "Begrüßung", gruss_text: "Text", untertitel: "Untertitel (optional)" }; }
  listen() {
    return [
      { key: "personen", titel: "Personen", neuText: "Person", hinweis: "Wer am Dashboard wählbar ist. Die Planer-Karte zeigt die Aufgaben und Termine der gewählten Person. Ein Tablet bekommt keine eigene Person.",
        neu: () => ({ name: "" }), name: (p) => (p.tablet ? "Tablet" : p.name || "Neue Person"),
        labels: { name: "Name", kurz: "Kürzel (z. B. C)", benutzer: "Home-Assistant-Benutzer", entity: "Personen-Entität (für „zu Hause“)", tablet: "Ist ein Tablet (keine Person)", kalender: "Kalender (leer = wie im Planer)" },
        schema: (p) => [
          { name: "tablet", selector: { boolean: {} } },
          ...(p.tablet ? [] : [
            { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "kurz", selector: { text: {} } }] },
            { name: "benutzer", selector: { select: { mode: "dropdown", options: this._benutzer || [] } } },
            { name: "entity", selector: { entity: { filter: { domain: ["person", "device_tracker"] } } } },
            { name: "kalender", selector: { entity: { multiple: true, filter: { domain: "calendar" } } } },
          ]),
        ] },
      { key: "chips", titel: "Schnellzugriff", neuText: "Chip", hinweis: "Kleine Knöpfe unter der Begrüßung. Tippen schaltet, Auswahllisten (z. B. Heizung Tag/Nacht) springen weiter.",
        neu: () => ({ zeigen: "immer" }), name: (c) => c.name || c.entity || "Neuer Chip",
        labels: { entity: "Entität", name: "Text (leer = Name aus HA)", icon: "Symbol", zeigen: "Wann zeigen", wert: "Zustand", zustand_zeigen: "Zustand anhängen", farbe: "Farbe", tap_action: "Tippen" },
        schema: (c) => [
          { name: "entity", selector: { entity: {} } },
          { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "icon", selector: { icon: {} } }] },
          { type: "grid", name: "", schema: [
            { name: "zeigen", selector: { select: { mode: "dropdown", options: [
              { value: "immer", label: "Immer" }, { value: "an", label: "Nur wenn an/aktiv" }, { value: "aus", label: "Nur wenn aus" }, { value: "wert", label: "Bei bestimmtem Zustand" }] } } },
            { name: "farbe", selector: { select: { mode: "dropdown", options: FARB_OPTIONEN.map(([value, label]) => ({ value, label })) } } },
          ] },
          ...(c.zeigen === "wert" ? [{ name: "wert", selector: { text: {} } }] : []),
          { name: "zustand_zeigen", selector: { boolean: {} } },
          { name: "tap_action", selector: { ui_action: {} } },
        ] },
    ];
  }
}
// ---------------------------------------------------------------------------
// glas-planer-card: Heute aus dem Planer – für die Person, die gerade schaut
// C zeigt Corins Planer, L Lindas (Aufgaben, Schicht, Termine aus ihren Kalendern)
// ---------------------------------------------------------------------------
const PLANER_CSS = `
:host{display:block}
.karte{display:flex;flex-direction:column;gap:var(--g-a3)}
.oben{display:flex;align-items:center;justify-content:space-between;gap:var(--g-a3)}
.datum{margin:0;font-size:var(--g-s-h2);font-weight:800;letter-spacing:-.3px;color:var(--g-akzent)}
.schicht{align-self:flex-start;display:inline-flex;align-items:center;gap:var(--g-a2);min-height:32px;padding:4px 12px 4px 4px;border-radius:var(--g-r-pille);
  font-size:var(--g-s-name);color:var(--g-text);background:color-mix(in srgb,var(--sc) 16%,transparent);border:1.5px solid color-mix(in srgb,var(--sc) 45%,transparent)}
.schicht b{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:var(--g-s-klein);color:#fff;background:var(--sc)}
.zeile{display:flex;align-items:center;gap:var(--g-a3);min-height:56px;padding:var(--g-a2) var(--g-a2) var(--g-a2) var(--g-a3);border-radius:var(--g-r-klein);
  background:var(--g-zeile);box-shadow:inset 4px 0 0 var(--bf,#8e8e93);transition:opacity .25s ease}
:host{--g-zeile:rgba(255,255,255,.85)} :host([dunkel]){--g-zeile:rgba(255,255,255,.08)}
.zeile.fertig{opacity:.55}
.zeile.vorbei{opacity:.6;background:var(--g-fuell)}
.kreis{flex:none;width:28px;height:28px;border-radius:50%;border:2.5px solid var(--g-text2);display:flex;align-items:center;justify-content:center;transition:background-color .2s ease}
.kreis.rot{border-color:var(--g-rot)}
.kreis[aria-pressed="true"]{background:var(--g-akzent);border-color:var(--g-akzent);color:#fff}
.kreis ha-icon{--mdc-icon-size:16px}
.mitte{flex:1;min-width:0;display:flex;flex-direction:column;gap:var(--g-a1)}
.titel{font-size:var(--g-s-text);color:var(--g-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.termin .titel{font-weight:600}
.fertig .titel{text-decoration:line-through}
.chips{display:flex;gap:var(--g-a1);flex-wrap:wrap}
.mini{display:inline-flex;align-items:center;gap:var(--g-a1);padding:2px 8px;border-radius:var(--g-r-pille);font-size:var(--g-s-klein);color:var(--g-text2);background:var(--g-fuell)}
.mini.rot{color:var(--g-rot-text);background:rgba(255,59,48,.14)}
.zeit{flex:none;width:92px;font-size:var(--g-s-klein);color:var(--g-text2);font-variant-numeric:tabular-nums}
.morgen{flex:none;min-height:36px;padding:0 var(--g-a3);border-radius:var(--g-r-pille);font-size:var(--g-s-klein);font-weight:600;color:var(--g-text);background:var(--g-fuell)}
.jetzt{display:flex;align-items:center;gap:var(--g-a2)}
.jetzt i{display:block;height:2px;background:var(--g-rot)}
.jetzt span{font-size:var(--g-s-klein);font-weight:700;color:var(--g-rot-text)}
.unten{display:flex;justify-content:space-between;align-items:center;gap:var(--g-a2);flex-wrap:wrap}
.klapp{min-height:44px;padding:0 var(--g-a1);font-size:var(--g-s-name);font-weight:600;color:var(--g-text)}
.leer{padding:var(--g-a2) var(--g-a1)}
.feld{width:100%;min-height:48px;padding:10px 14px;border-radius:var(--g-r-klein);font:inherit;font-size:var(--g-s-text);color:var(--g-text);
  background:var(--g-fuell);border:1px solid var(--g-glas-rand);outline-color:var(--g-akzent)}
.gruppe{display:flex;flex-direction:column;gap:var(--g-a2)}
.haupt{min-height:52px;border-radius:var(--g-r-klein);font-size:var(--g-s-text);font-weight:600;color:#fff;background:var(--g-akzent-voll)}
.haupt:disabled{opacity:.45}
`;
const MONATE = ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sept.", "Okt.", "Nov.", "Dez."];

class GlasPlanerCard extends GlasKarte {
  static standard() { return { titel: "", ohne_datum: true, planer_pfad: "/planer", max_aufgaben: 6 }; }
  static getConfigElement() { return document.createElement("glas-planer-card-editor"); }
  static getStubConfig() { return {}; }
  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }
  getCardSize() { return 4; }
  css() { return PLANER_CSS; }
  connectedCallback() {
    super.connectedCallback();
    this._takt = setInterval(() => { this._termineZeit = 0; this.laden(); }, 5 * 60 * 1000);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this._takt);
    this._abo?.then((f) => f()).catch(() => {});
    this._abo = null;
  }
  set hass(h) {
    const erst = !this._hass;
    super.hass = h;
    if (erst || !this._abo) this.laden();
  }
  get hass() { return this._hass; }
  async laden() {
    const h = this._hass;
    if (!h || this._laedt) return;
    this._laedt = true;
    try {
      this._daten = await h.callWS({ type: "planer/lesen" });
      this._fehler = null;
      if (!this._abo) {
        this._abo = h.connection.subscribeMessage(() => { clearTimeout(this._neuT); this._neuT = setTimeout(() => this.neuLesen(), 400); }, { type: "planer/abonnieren" });
        this._abo.catch(() => { this._abo = null; });
      }
    } catch (e) { this._fehler = e?.code === "unknown_command" ? "Die Planer-Integration ist nicht installiert." : (e?.message || "Planer nicht erreichbar"); }
    this._laedt = false;
    await this.termineLaden();
    this.render();
  }
  async neuLesen() { try { this._daten = await this._hass.callWS({ type: "planer/lesen" }); this.render(); } catch (_) { /* */ } }
  person() { return Glas.aktuellePerson(this._hass); }
  kalenderFuer(p) {
    const d = this._daten || {}, h = this._hass;
    if (!p) return [];
    if (p.tablet) {
      const alle = new Set();
      Glas.personen.filter((x) => !x.tablet).forEach((x) => this.kalenderFuer(x).forEach((k) => alle.add(k)));
      return [...alle];
    }
    if (p.kalender?.length) return p.kalender;
    const pid = p.benutzer;
    const e = d.einstellungen?.[pid];
    if (e) {
      return Object.keys(h.states).filter((x) => x.startsWith("calendar.") && (e.kalender_sehen == null || e.kalender_sehen.includes(x)) && !(e.kalender_aus || []).includes(x));
    }
    return (d.kalender || []).filter((k) => k.angezeigt).map((k) => k.id);
  }
  async termineLaden() {
    const p = this.person();
    const ids = this.kalenderFuer(p);
    const schluessel = heuteIso() + ids.join(",");
    if (schluessel === this._termineSchl && Date.now() - (this._termineZeit || 0) < 5 * 60 * 1000) return;
    this._termineSchl = schluessel; this._termineZeit = Date.now();
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const ende = new Date(start); ende.setDate(ende.getDate() + 1);
    const q = `?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(ende.toISOString())}`;
    const listen = await Promise.all(ids.map((id) => this._hass.callApi("GET", `calendars/${id}${q}`).then((l) => l.map((t) => ({ ...t, kalender: id }))).catch(() => [])));
    const gesehen = new Set();
    this._termine = listen.flat()
      .filter((t) => !String(t.description || "").includes("planer-schicht"))
      .filter((t) => { const k = `${t.summary}|${t.start.dateTime || t.start.date}`; if (gesehen.has(k)) return false; gesehen.add(k); return true; })
      .map((t) => ({ titel: t.summary, ganztag: !t.start.dateTime, start: new Date(t.start.dateTime || t.start.date + "T00:00"), ende: new Date(t.end.dateTime || t.end.date + "T00:00"),
        kalender: t.kalender, ort: t.location || "" }))
      .sort((a, b) => (b.ganztag - a.ganztag) || (a.start - b.start));
  }
  render() {
    const p = this.person();
    if (p && this._personVorher !== p.id) { this._personVorher = p.id; this._termineZeit = 0; this.termineLaden().then(() => super.render()); }
    super.render();
  }
  aufgaben(p) {
    const d = this._daten;
    if (!d || !p) return [];
    const heute = heuteIso();
    const wer = p.tablet ? ["gemeinsam"] : [p.benutzer, "gemeinsam"];
    return (d.aufgaben || [])
      .filter((a) => a.status === "offen" || this._erledigt?.has(a.id))
      .filter((a) => wer.includes(a.person))
      .filter((a) => (a.datum ? a.datum <= heute : this._config.ohne_datum))
      .sort((a, b) => (a.datum || "9") .localeCompare(b.datum || "9") || (a.uhrzeit || "99").localeCompare(b.uhrzeit || "99"));
  }
  html() {
    const c = this._config;
    const jetzt = new Date();
    const titel = c.titel || `Heute, ${jetzt.getDate()}. ${MONATE[jetzt.getMonth()]}`;
    if (this._fehler) return `<div class="karte glas"><div class="oben"><h2 class="datum">${esc(titel)}</h2></div><div class="leise leer">${esc(this._fehler)}</div></div>`;
    if (!this._daten) return `<div class="karte glas"><div class="oben"><h2 class="datum">${esc(titel)}</h2></div><div class="leise leer">Lade Planer …</div></div>`;
    const p = this.person();
    const d = this._daten, heute = heuteIso();
    const farben = d.farben || {};
    const auf = this.aufgaben(p);
    const offen = auf.filter((a) => a.status === "offen");
    const termine = this._termine || [];
    // Schicht der Person heute
    let schicht = "";
    const plan = p && !p.tablet ? d.schichten?.[p.benutzer] : null;
    const art = plan && plan.arten?.find((x) => x.id === plan.tage?.[heute]);
    if (art) schicht = `<div class="schicht" style="--sc:${art.farbe}"><b aria-hidden="true">${esc(art.kurz)}</b><span>${esc(art.name)}${art.von ? ` ${art.von}–${art.bis}` : ""}</span></div>`;
    const tageSeit = (iso) => Math.round((new Date(heute) - new Date(iso)) / 86400000);
    const aufgabeHtml = (a) => {
      const fertig = a.status !== "offen";
      const seit = a.datum && a.datum < heute ? tageSeit(a.datum) : 0;
      const bf = farben[a.bereich] || (a.bereich ? "#8e8e93" : "var(--g-akzent)");
      return `<div class="zeile ${fertig ? "fertig" : ""}" style="--bf:${bf}">
        <button class="kreis ${seit ? "rot" : ""}" data-fertig="${esc(a.id)}" aria-pressed="${fertig}" aria-label="${esc(a.titel)} abhaken">${fertig ? `<ha-icon data-i="mdi:check-bold"></ha-icon>` : ""}</button>
        <div class="mitte"><span class="titel">${esc(a.titel)}</span><span class="chips">
          ${seit && !fertig ? `<span class="mini rot">${seit === 1 ? "seit gestern" : `seit ${seit} Tagen`}</span>` : ""}
          ${a.uhrzeit ? `<span class="mini">${esc(a.uhrzeit)} Uhr</span>` : ""}
          ${a.bereich ? `<span class="mini"><span class="punkt" style="background:${bf}"></span>${esc(a.bereich)}</span>` : ""}
          ${a.person === "gemeinsam" && !p?.tablet ? `<span class="mini">Gemeinsam</span>` : ""}</span></div>
        ${fertig ? "" : `<button class="morgen k" data-morgen="${esc(a.id)}">Morgen</button>`}</div>`;
    };
    const terminHtml = (t) => {
      const vorbei = !t.ganztag && t.ende < jetzt;
      const zeit = t.ganztag ? "Ganztägig" : `${uhr(t.start)}–${uhr(t.ende)}`;
      return `<div class="zeile termin ${vorbei ? "vorbei" : ""}" style="--bf:var(--g-orange)"><span class="zeit">${zeit}</span>
        <div class="mitte"><span class="titel">${esc(t.titel)}</span>${t.ort ? `<span class="leise">${esc(t.ort)}</span>` : ""}</div></div>`;
    };
    let koerper = "";
    if (this._auf) {
      const liste = auf.slice(0, c.max_aufgaben === 0 ? 999 : Math.max(c.max_aufgaben, offen.length)).map(aufgabeHtml);
      const zeitlinie = [];
      let jetztGesetzt = false;
      termine.forEach((t) => {
        if (!jetztGesetzt && !t.ganztag && t.start > jetzt) { zeitlinie.push(`<div class="jetzt"><i style="width:14px"></i><span>Jetzt ${uhr(jetzt)}</span><i style="flex:1"></i></div>`); jetztGesetzt = true; }
        zeitlinie.push(terminHtml(t));
      });
      koerper = liste.join("") + zeitlinie.join("") || `<div class="leise leer">Heute steht nichts an.</div>`;
    } else {
      const naechster = termine.find((t) => !t.ganztag && t.ende > jetzt);
      if (naechster) {
        const min = Math.round((naechster.start - jetzt) / 60000);
        const bis = min > 0 ? (min >= 60 ? ` · in ${Math.floor(min / 60)} Std. ${min % 60} Min.` : ` · in ${min} Min.`) : " · läuft gerade";
        koerper = terminHtml(naechster).replace(/<\/div><\/div>$/, `<span class="leise">${bis.slice(3)}</span></div></div>`);
      } else if (offen.length) koerper = aufgabeHtml(offen[0]);
      else koerper = `<div class="leise leer">Heute steht nichts mehr an.</div>`;
    }
    const anz = offen.length + termine.filter((t) => t.ganztag || t.ende > jetzt).length;
    return `<div class="karte glas">
      <div class="oben"><h2 class="datum">${esc(titel)}</h2><button class="rund" data-neu aria-label="Aufgabe hinzufügen"><ha-icon data-i="mdi:plus"></ha-icon></button></div>
      ${schicht}${koerper}
      <div class="unten"><button class="klapp" data-klapp aria-expanded="${!!this._auf}">${this._auf ? "Weniger ⌃" : `Ganzer Tag · ${anz} ${anz === 1 ? "Eintrag" : "Einträge"} ⌄`}</button>
      <button class="link" data-oeffnen>Planer öffnen ›</button></div></div>`;
  }
  binden() {
    this.iconsSetzen();
    const h = this._hass;
    this.$("[data-klapp]")?.addEventListener("click", () => { this._auf = !this._auf; this.render(); });
    this.$("[data-oeffnen]")?.addEventListener("click", () => navigieren(this._config.planer_pfad || "/planer"));
    this.$("[data-neu]")?.addEventListener("click", () => this.neu());
    this.$$("[data-fertig]").forEach((b) => b.addEventListener("click", async () => {
      const id = b.dataset.fertig, a = this._daten.aufgaben.find((x) => x.id === id);
      const erledigt = a.status === "offen";
      this._erledigt = this._erledigt || new Set();
      erledigt ? this._erledigt.add(id) : this._erledigt.delete(id);
      a.status = erledigt ? "erledigt" : "offen"; // sofort zeigen, Planer bestätigt per Abo
      this.render();
      try { await h.callWS({ type: "planer/erledigen", aufgabe_id: id, erledigt }); } catch (e) { this.neuLesen(); }
    }));
    this.$$("[data-morgen]").forEach((b) => b.addEventListener("click", async () => {
      try { await h.callWS({ type: "planer/speichern", aufgabe: { id: b.dataset.morgen, datum: heuteIso(1) } }); } catch (_) { /* */ }
      this.neuLesen();
    }));
  }
  neu() {
    const p = this.person();
    const st = { text: "", wann: "heute", fuer: p?.tablet ? "gemeinsam" : p?.benutzer || "gemeinsam" };
    const s = new GlasSchicht({ quelle: this, titel: "Neue Aufgabe" });
    s.dunkel(istDunkel(this._hass));
    const fuerOpt = [...Glas.personen.filter((x) => !x.tablet && x.benutzer).map((x) => [x.benutzer, x.name]), ["gemeinsam", "Gemeinsam"]];
    const zeichnen = () => {
      s.inhalt.innerHTML = `<style>${PLANER_CSS.replace(":host{display:block}", "")}</style>${s.kopfHtml("Neue Aufgabe", "")}
        <label class="gruppe"><span class="leise">Was ist zu tun?</span><input class="feld" placeholder="z. B. Filament bestellen" value="${esc(st.text)}" enterkeyhint="done"></label>
        <div class="gruppe"><span class="leise">Wann</span><div class="chips">${[["heute", "Heute"], ["morgen", "Morgen"], ["ohne", "Ohne Datum"]].map(([k, n]) =>
          `<button class="pille fuell ${st.wann === k ? "aktiv" : ""}" data-w="${k}" aria-pressed="${st.wann === k}">${n}</button>`).join("")}</div></div>
        <div class="gruppe"><span class="leise">Für</span><div class="chips">${fuerOpt.map(([k, n]) =>
          `<button class="pille fuell ${st.fuer === k ? "aktiv" : ""}" data-f="${esc(k)}" aria-pressed="${st.fuer === k}">${esc(n)}</button>`).join("")}</div></div>
        <button class="haupt" data-ok ${st.text.trim() ? "" : "disabled"}>Hinzufügen</button>`;
      s.kopfBinden();
      const feld = s.inhalt.querySelector("input");
      feld.addEventListener("input", () => { st.text = feld.value; s.inhalt.querySelector("[data-ok]").disabled = !st.text.trim(); });
      feld.addEventListener("keydown", (e) => { if (e.key === "Enter") speichern(); });
      s.inhalt.querySelectorAll("[data-w]").forEach((b) => b.addEventListener("click", () => { st.wann = b.dataset.w; zeichnen(); }));
      s.inhalt.querySelectorAll("[data-f]").forEach((b) => b.addEventListener("click", () => { st.fuer = b.dataset.f; zeichnen(); }));
      s.inhalt.querySelector("[data-ok]").addEventListener("click", () => speichern());
      return feld;
    };
    const speichern = async () => {
      if (!st.text.trim()) return;
      const datum = st.wann === "heute" ? heuteIso() : st.wann === "morgen" ? heuteIso(1) : null;
      try { await this._hass.callWS({ type: "planer/speichern", aufgabe: { titel: st.text.trim(), datum, person: st.fuer } }); } catch (_) { /* */ }
      s.schliessen(); this.neuLesen();
    };
    zeichnen();
    s.oeffnen();
    setTimeout(() => s.inhalt.querySelector("input")?.focus(), 350);
  }
}

class GlasPlanerEditor extends GlasEditor {
  schema() {
    return [
      { name: "titel", selector: { text: {} } },
      { name: "ohne_datum", selector: { boolean: {} } },
      { name: "max_aufgaben", selector: { number: { min: 0, max: 30, mode: "box" } } },
      { name: "planer_pfad", selector: { text: {} } },
    ];
  }
  labels() { return { titel: "Titel (leer = „Heute, 20. Nov.“)", ohne_datum: "Aufgaben ohne Datum mitzeigen", max_aufgaben: "Höchstens so viele erledigte+offene Aufgaben (0 = alle)", planer_pfad: "Pfad zum Planer" }; }
  hilfen() { return { titel: "Welche Person gezeigt wird, steuert die Personenwahl in der Kopf-Karte (C, L, Tablet)." }; }
}
// ---------------------------------------------------------------------------
// glas-wetter-card: jetzt, nächste Stunden, aufklappbar 5 Tage, trocken/nass
// ---------------------------------------------------------------------------
const WETTER = {
  "clear-night": ["Klar", "mdi:weather-night"], cloudy: ["Bewölkt", "mdi:weather-cloudy"], exceptional: ["Unwetter", "mdi:alert-circle-outline"],
  fog: ["Nebel", "mdi:weather-fog"], hail: ["Hagel", "mdi:weather-hail"], lightning: ["Gewitter", "mdi:weather-lightning"],
  "lightning-rainy": ["Gewitter", "mdi:weather-lightning-rainy"], partlycloudy: ["Teils bewölkt", "mdi:weather-partly-cloudy"],
  pouring: ["Starkregen", "mdi:weather-pouring"], rainy: ["Regen", "mdi:weather-rainy"], snowy: ["Schnee", "mdi:weather-snowy"],
  "snowy-rainy": ["Schneeregen", "mdi:weather-snowy-rainy"], sunny: ["Sonnig", "mdi:weather-sunny"], windy: ["Windig", "mdi:weather-windy"],
  "windy-variant": ["Windig", "mdi:weather-windy-variant"],
};
const NASS = ["rainy", "pouring", "lightning-rainy", "snowy-rainy", "hail", "snowy"];
const TAGE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const WETTER_CSS = `
:host{display:block}
.karte{display:flex;flex-direction:column;gap:var(--g-a4);width:100%;text-align:left;cursor:pointer}
.jetzt{display:flex;align-items:center;gap:var(--g-a3)}
.jetzt ha-icon{--mdc-icon-size:40px;color:var(--g-text)}
.temp{font-size:34px;font-weight:300;line-height:1;color:var(--g-text);font-variant-numeric:tabular-nums}
.was{font-size:var(--g-s-name);font-weight:600;color:var(--g-text)}
.mitte{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.mitte .leise{line-height:1.35}
.status{flex:none;align-self:flex-start;padding:4px 10px;border-radius:var(--g-r-pille);font-size:var(--g-s-klein);font-weight:600;color:#fff;background:var(--g-gruen-voll)}
.status.nass{background:var(--g-akzent-voll)}
.stunden{display:grid;grid-template-columns:repeat(var(--n),minmax(0,1fr));gap:var(--g-a1)}
.stunde{display:flex;flex-direction:column;align-items:center;gap:var(--g-a1);font-size:var(--g-s-klein);color:var(--g-text);font-variant-numeric:tabular-nums}
.stunde b{font-weight:700}
.tag{display:flex;align-items:center;gap:var(--g-a3);min-height:44px;border-top:1px solid var(--g-glas-rand);font-size:var(--g-s-name);color:var(--g-text)}
.tag span:first-child{width:32px}
.tag span.t{flex:1;color:var(--g-text2)}
.tag b{font-variant-numeric:tabular-nums}
`;

class GlasWetterCard extends GlasKarte {
  static standard() { return { stunden: 5, tage: 5 }; }
  static getConfigElement() { return document.createElement("glas-wetter-card-editor"); }
  static getStubConfig(hass) { return { entity: Object.keys(hass.states).find((e) => e.startsWith("weather.")) || "" }; }
  pruefen(c) { if (!c.entity) throw new Error("Bitte eine Wetter-Entität wählen"); }
  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }
  entitaeten() { return [this._config.entity, this._config.temperatur, this._config.regen].filter(Boolean); }
  css() { return WETTER_CSS; }
  connectedCallback() { super.connectedCallback(); this.abonnieren(); }
  disconnectedCallback() { super.disconnectedCallback(); this.abmelden(); }
  setConfig(c) { const neu = c.entity !== this._config?.entity; super.setConfig(c); if (neu) { this.abmelden(); this.abonnieren(); } }
  set hass(h) { const erst = !this._hass; super.hass = h; if (erst) this.abonnieren(); }
  get hass() { return this._hass; }
  abmelden() { (this._abos || []).forEach((p) => p.then((f) => f()).catch(() => {})); this._abos = null; }
  abonnieren() {
    if (this._abos || !this._hass || !this._config || !this.isConnected) return;
    this._vh = {};
    this._abos = ["hourly", "daily"].map((art) => this._hass.connection.subscribeMessage((m) => { this._vh[art] = m.forecast || []; this.render(); },
      { type: "weather/subscribe_forecast", forecast_type: art, entity_id: this._config.entity }));
    this._abos.forEach((p) => p.catch(() => {}));
  }
  html() {
    const h = this._hass, c = this._config, st = h.states[c.entity];
    if (!st) return `<div class="karte glas"><span class="leise">Wetter-Entität ${esc(c.entity)} nicht gefunden</span></div>`;
    const a = st.attributes;
    const [was, icon] = WETTER[st.state] || [st.state, "mdi:weather-cloudy"];
    const tSensor = c.temperatur && h.states[c.temperatur];
    const temp = tSensor ? Number(tSensor.state) : a.temperature;
    const tage = (this._vh?.daily || []).slice(0, c.tage);
    const heute = tage[0];
    let nass = NASS.includes(st.state);
    const r = c.regen && h.states[c.regen];
    if (r) nass = domainVon(c.regen) === "binary_sensor" ? r.state === "on" : Number(r.state) > 0;
    const unter = [c.ort || "", a.apparent_temperature != null ? `gefühlt ${Math.round(a.apparent_temperature)}°` : "",
      a.wind_speed != null ? `Wind ${Math.round(a.wind_speed)} ${a.wind_speed_unit || "km/h"}` : ""].filter(Boolean).join(" · ");
    const stunden = (this._vh?.hourly || []).slice(0, c.stunden);
    const auf = !!this._auf && tage.length > 0;
    return `<button class="karte glas k" aria-expanded="${auf}" aria-label="Wetter: ${esc(was)}, ${Math.round(temp)} Grad">
      <span class="jetzt"><ha-icon data-i="${icon}"></ha-icon><span class="mitte">
        <span><span class="temp">${Math.round(temp)}°</span> <span class="was">${esc(was)}${heute ? ` · H ${Math.round(heute.temperature)}° T ${Math.round(heute.templow ?? heute.temperature)}°` : ""}</span></span>
        ${unter ? `<span class="leise">${esc(unter)}</span>` : ""}</span>
        ${c.status_zeigen === false ? "" : `<span class="status ${nass ? "nass" : ""}">${nass ? "Nass" : "Trocken"}</span>`}</span>
      ${stunden.length ? `<span class="stunden" style="--n:${stunden.length}">${stunden.map((s) => {
        const [, i] = WETTER[s.condition] || ["", "mdi:weather-cloudy"];
        return `<span class="stunde"><span>${new Date(s.datetime).getHours()} Uhr</span><ha-icon data-i="${i}"></ha-icon><b>${Math.round(s.temperature)}°</b></span>`;
      }).join("")}</span>` : ""}
      ${auf ? `<span>${tage.map((t, n) => {
        const [w, i] = WETTER[t.condition] || ["", "mdi:weather-cloudy"];
        return `<span class="tag"><span>${n === 0 ? "Heute" : TAGE[new Date(t.datetime).getDay()]}</span><ha-icon data-i="${i}"></ha-icon><span class="t">${esc(w)}</span>
          <b>${Math.round(t.temperature)}° / ${Math.round(t.templow ?? t.temperature)}°</b></span>`;
      }).join("")}</span>` : ""}
    </button>`;
  }
  binden() {
    this.iconsSetzen();
    this.$(".karte")?.addEventListener("click", () => {
      if (this._config.tap_action?.action) return aktion(this, { entity: this._config.entity, tap_action: this._config.tap_action }, "tap");
      this._auf = !this._auf; this.render();
    });
  }
}

class GlasWetterEditor extends GlasEditor {
  schema() {
    return [
      { name: "entity", selector: { entity: { filter: { domain: "weather" } } } },
      { name: "ort", selector: { text: {} } },
      { name: "temperatur", selector: { entity: { filter: { domain: "sensor", device_class: "temperature" } } } },
      { name: "regen", selector: { entity: { filter: [{ domain: "binary_sensor" }, { domain: "sensor" }] } } },
      { type: "grid", name: "", schema: [
        { name: "stunden", selector: { number: { min: 0, max: 8, mode: "box" } } },
        { name: "tage", selector: { number: { min: 0, max: 7, mode: "box" } } },
      ] },
      { name: "status_zeigen", selector: { boolean: {} } },
      { name: "tap_action", selector: { ui_action: {} } },
    ];
  }
  render() { if (this._config.status_zeigen === undefined) this._config.status_zeigen = true; super.render(); }
  labels() { return { entity: "Wetter-Entität", ort: "Ort (Anzeige)", temperatur: "Eigener Temperatursensor (optional)", regen: "Regensensor für trocken/nass (optional)",
    stunden: "Stunden", tage: "Tage beim Aufklappen", status_zeigen: "Trocken/Nass zeigen", tap_action: "Tippen (leer = aufklappen)" }; }
}
// ---------------------------------------------------------------------------
// Räume: schwebende Raumleiste unten + Raum-Blatt (öffnet über #raumname)
// ---------------------------------------------------------------------------
const hashJetzt = () => decodeURIComponent(location.hash.replace(/^#/, ""));
function hashOeffnen(hash) {
  Glas.gepusht = hash;
  navigieren(`${location.pathname}${location.search}#${encodeURIComponent(hash)}`);
}
function hashSchliessen() {
  if (Glas.gepusht && Glas.gepusht === hashJetzt()) { Glas.gepusht = null; history.back(); return; }
  navigieren(`${location.pathname}${location.search}`, true);
}
// Karte im normalen Raster ausblenden (sie lebt als Leiste bzw. Blatt in der Ebene darüber)
function karteVerstecken(el, weg) {
  if (!!el._versteckt === weg) return;
  el._versteckt = weg;
  el.hidden = weg;
  fire(el, "card-visibility-changed", { value: !weg });
}

const LEISTE_CSS = `
:host{display:block}
.leiste{display:flex;align-items:center;justify-content:space-around;gap:var(--g-a1);height:68px;padding:0 var(--g-a2);border-radius:34px;
  box-shadow:0 8px 30px rgba(0,0,0,.15)}
.fest{position:fixed;left:50%;bottom:calc(20px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(560px,calc(100% - 32px));z-index:6}
.raum{position:relative;width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--g-fuell-text);transition:background-color .2s ease}
.raum[aria-current="page"]{background:var(--g-aktiv);color:var(--g-aktiv-text)}
.raum ha-icon{--mdc-icon-size:22px}
.raum .punkt{position:absolute;bottom:5px;left:50%;margin-left:-3px;width:6px;height:6px;background:var(--g-orange)}
.hinweis{margin-top:var(--g-a2);text-align:center}
`;

class GlasRaumleisteCard extends GlasKarte {
  static standard() { return { raeume: [], zuhause_zeigen: true }; }
  static getConfigElement() { return document.createElement("glas-raumleiste-card-editor"); }
  static getStubConfig(hass) {
    return { raeume: Object.values(hass.areas || {}).slice(0, 4).map((a) => ({ name: a.name, bereich: a.area_id, hash: a.area_id, icon: a.icon || "mdi:sofa" })) };
  }
  getGridOptions() { return { columns: 12, rows: "auto" }; }
  constructor() {
    super();
    this._ort = () => this.render();
  }
  connectedCallback() {
    super.connectedCallback();
    ["location-changed", "hashchange", "popstate"].forEach((t) => window.addEventListener(t, this._ort));
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    ["location-changed", "hashchange", "popstate"].forEach((t) => window.removeEventListener(t, this._ort));
    this._portal?.remove(); this._portal = null;
  }
  entitaeten() { return Object.keys(this._hass?.states || {}).filter((e) => ["light", "switch", "media_player", "fan"].includes(domainVon(e))); }
  css() { return LEISTE_CSS; }
  inhalt(fest) {
    const h = this._hass, c = this._config, jetzt = hashJetzt();
    const raeume = [...(c.zuhause_zeigen ? [{ name: "Zuhause", icon: "mdi:home-outline", hash: "" }] : []), ...(c.raeume || [])];
    return `<nav class="leiste glas ${fest ? "fest" : ""}" aria-label="Räume">${raeume.map((r) => {
      const an = r.bereich && entitaetenImBereich(h, r.bereich, ["light", "switch", "media_player", "fan"]).some((e) => Geraet.istAn(h.states[e]));
      const akt = (r.hash || "") === jetzt;
      return `<button class="raum" data-h="${esc(r.hash || "")}" aria-label="${esc(r.name)}" aria-current="${akt ? "page" : "false"}">
        <ha-icon data-i="${esc(r.icon || "mdi:door")}"></ha-icon>${an ? `<span class="punkt" aria-hidden="true"></span>` : ""}</button>`;
    }).join("")}</nav>`;
  }
  render() {
    if (!this._config || !this._hass) return;
    const bearbeiten = istBearbeiten();
    karteVerstecken(this, !bearbeiten);
    if (bearbeiten) {
      this._portal?.remove(); this._portal = null;
      this.shadowRoot.innerHTML = `<style>${TOKENS}${LEISTE_CSS}</style>${this.inhalt(false)}<div class="leise hinweis">Raumleiste · schwebt außerhalb des Bearbeitens unten über dem Dashboard</div>`;
      this.verdrahten(this.shadowRoot);
      return;
    }
    if (!this._portal) {
      this._portal = document.createElement("div");
      this._portal.attachShadow({ mode: "open" });
      portalWurzel().appendChild(this._portal);
    }
    const r = this._portal.shadowRoot;
    r.innerHTML = `<style>${TOKENS.replace(":host{", ".w{").replace(":host([dunkel]){", ".w.dunkel{")}${LEISTE_CSS}</style>
      <div class="w ${istDunkel(this._hass) ? "dunkel" : ""}">${this.inhalt(true)}</div>`;
    this.verdrahten(r);
  }
  verdrahten(r) {
    r.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
    r.querySelectorAll("[data-h]").forEach((b) => b.addEventListener("click", () => {
      const ziel = b.dataset.h;
      if (!ziel || ziel === hashJetzt()) hashSchliessen(); else hashOeffnen(ziel);
    }));
  }
}

class GlasRaumleisteEditor extends GlasEditor {
  schema() { return [{ name: "zuhause_zeigen", selector: { boolean: {} } }]; }
  labels() { return { zuhause_zeigen: "Zuhause-Knopf vorne" }; }
  listen() {
    return [{ key: "raeume", titel: "Räume", neuText: "Raum", hinweis: "Jeder Raum öffnet das Raum-Blatt mit demselben Kurznamen (#…). Der Punkt zeigt, ob im Bereich etwas an ist.",
      neu: () => ({ icon: "mdi:sofa" }), name: (r) => r.name || "Neuer Raum",
      labels: { name: "Name", icon: "Symbol", hash: "Kurzname (z. B. wohnzimmer)", bereich: "HA-Bereich (für den Punkt)" },
      schema: () => [
        { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "icon", selector: { icon: {} } }] },
        { type: "grid", name: "", schema: [{ name: "hash", selector: { text: {} } }, { name: "bereich", selector: { area: {} } }] },
      ] }];
  }
}

// ---------------------------------------------------------------------------
// glas-raum-card: das Raum-Blatt. Enthält beliebige Karten (auch HA-Karten)
// ---------------------------------------------------------------------------
const RAUM_CSS = `
.chips{display:flex;gap:var(--g-a2);flex-wrap:wrap;margin-top:calc(-1 * var(--g-a2));padding:0 var(--g-a1)}
.chips ha-state-icon{--mdc-icon-size:16px}
.raster{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:var(--g-a2) var(--g-a2);align-items:start}
.raster > *{min-width:0}
.platz{display:flex;align-items:center;gap:var(--g-a3);width:100%;padding:var(--g-a4);border-radius:var(--g-r);border:1.5px dashed var(--g-text2);color:var(--g-text);text-align:left}
`;

class GlasRaumCard extends GlasKarte {
  static standard() { return { cards: [], alles_aus: true, fenster_auto: true }; }
  static getConfigElement() { return document.createElement("glas-raum-card-editor"); }
  static getStubConfig() { return { hash: "wohnzimmer", name: "Wohnzimmer", cards: [] }; }
  pruefen(c) { if (!c.hash) throw new Error("Bitte einen Kurznamen (#…) eintragen"); }
  getGridOptions() { return { columns: 12, rows: "auto" }; }
  constructor() {
    super();
    this._ort = () => this.pruefeHash();
    this._karten = [];
  }
  connectedCallback() {
    super.connectedCallback();
    ["location-changed", "hashchange", "popstate"].forEach((t) => window.addEventListener(t, this._ort));
    this.pruefeHash();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    ["location-changed", "hashchange", "popstate"].forEach((t) => window.removeEventListener(t, this._ort));
    this._schicht?.schliessen();
  }
  setConfig(c) { super.setConfig(c); this._karten = []; this._kartenCfg = null; }
  set hass(h) {
    super.hass = h;
    this._karten.forEach((k) => { k.hass = h; });
    if (this._schicht) this.kopfZeichnen();
    this.pruefeHash();
  }
  get hass() { return this._hass; }
  css() { return RAUM_CSS; }
  html() {
    const c = this._config;
    if (!istBearbeiten()) return "";
    return `<button class="platz glas"><ha-icon data-i="${esc(c.icon || "mdi:door-open")}"></ha-icon><span><b>Raum-Blatt ${esc(c.name || c.hash)}</b><br>
      <span class="leise">Öffnet über #${esc(c.hash)} · ${c.cards.length} Karten · antippen zum Vorschauen</span></span></button>`;
  }
  render() {
    karteVerstecken(this, !istBearbeiten());
    super.render();
    this.iconsSetzen();
    this.$(".platz")?.addEventListener("click", () => this.oeffnen());
  }
  pruefeHash() {
    if (!this._config || !this._hass) return;
    const soll = hashJetzt() === this._config.hash;
    if (soll && !this._schicht) this.oeffnen(true);
    if (!soll && this._schicht && this._ueberHash) this._schicht.schliessen();
  }
  messwerte() {
    const h = this._hass, c = this._config;
    const finde = (dc) => (c.bereich ? entitaetenImBereich(h, c.bereich, ["sensor"]).find((e) => h.states[e].attributes.device_class === dc) : null);
    const t = h.states[c.temperatur || finde("temperature")];
    const f = h.states[c.feuchte || finde("humidity")];
    return [t && `${zustandText(h, t)}`, f && `${zustandText(h, f)} Luftfeuchte`].filter(Boolean).join(" · ");
  }
  chips() {
    const h = this._hass, c = this._config;
    let ids = c.chips || [];
    if (c.fenster_auto && c.bereich) ids = [...new Set([...ids, ...entitaetenImBereich(h, c.bereich, ["binary_sensor"])
      .filter((e) => ["window", "door", "opening", "moisture", "smoke"].includes(h.states[e].attributes.device_class))])];
    return ids.map((e) => h.states[e]).filter(Boolean);
  }
  ausZiele() {
    const h = this._hass, c = this._config;
    if (c.alles_aus_entitaeten?.length) return c.alles_aus_entitaeten;
    return c.bereich ? entitaetenImBereich(h, c.bereich, ["light", "switch", "media_player", "fan"]).filter((e) => Geraet.istAn(h.states[e])) : [];
  }
  kopfZeichnen() {
    const s = this._schicht, h = this._hass, c = this._config;
    if (!s) return;
    s.dunkel(istDunkel(h));
    const k = s.inhalt.querySelector(".kopf-bereich");
    const knoepfe = c.alles_aus ? `<button class="rund glas" data-aus aria-label="Alles im Raum ausschalten"><ha-icon data-i="mdi:power"></ha-icon></button>` : "";
    const chips = this.chips();
    const kompakt = s.inhalt.querySelector(".kopf")?.classList.contains("kompakt");
    const kopfNeu = `${s.kopfHtml(c.name || c.hash, this.messwerte(), knoepfe)}${chips.length ? `<div class="chips">${chips.map((st) => {
      const w = Geraet.istWarnung(st);
      return `<button class="pille fuell" data-chip="${esc(st.entity_id)}"><span class="punkt" style="background:${w ? FARBEN[w] : "var(--g-gruen)"}"></span>${esc(st.attributes.friendly_name)} ${esc(zustandText(h, st))}</button>`;
    }).join("")}</div>` : ""}`;
    if (this._kopfHtml === kopfNeu && k.firstChild) return;
    this._kopfHtml = kopfNeu;
    k.innerHTML = kopfNeu;
    if (kompakt) k.querySelector(".kopf").classList.add("kompakt");
    s.kopfBinden();
    k.querySelector("[data-aus]")?.addEventListener("click", () => {
      const ziele = this.ausZiele();
      if (ziele.length) h.callService("homeassistant", "turn_off", { entity_id: ziele });
    });
    k.querySelectorAll("[data-chip]").forEach((b) => b.addEventListener("click", () => {
      const st = this._hass.states[b.dataset.chip];
      if (istFenster(st)) fensterOeffnen(this, this._config.bereich, this._config.name); else mehrInfo(this, b.dataset.chip);
    }));
  }
  async oeffnen(ueberHash = false) {
    if (this._schicht) return;
    this._ueberHash = ueberHash;
    const s = new GlasSchicht({ quelle: this, hoch: true, titel: this._config.name || this._config.hash,
      zu: () => { this._schicht = null; if (hashJetzt() === this._config.hash) hashSchliessen(); } });
    this._schicht = s;
    s.inhalt.innerHTML = `<style>${RAUM_CSS}</style><div class="kopf-bereich"></div><div class="raster"></div>`;
    this.kopfZeichnen();
    s.oeffnen();
    const raster = s.inhalt.querySelector(".raster");
    const hilfe = await window.loadCardHelpers?.();
    if (!hilfe) { raster.innerHTML = `<div class="leise">Karten können hier nicht geladen werden.</div>`; return; }
    if (this._kartenCfg !== this._config.cards) {
      this._kartenCfg = this._config.cards;
      this._karten = (this._config.cards || []).map((cfg) => { const el = hilfe.createCardElement(cfg); el.hass = this._hass; return el; });
    }
    this._karten.forEach((el) => {
      const z = document.createElement("div");
      const g = el.getGridOptions?.() || el.getLayoutOptions?.() || {};
      const sp = g.columns === "full" ? 12 : Number(g.columns || g.grid_columns * 3 || 12);
      z.style.gridColumn = `span ${klemmen(sp || 12, 1, 12)}`;
      z.appendChild(el);
      raster.appendChild(z);
      el.addEventListener("ll-rebuild", () => { this._kartenCfg = null; });
    });
  }
}

class GlasRaumEditor extends GlasEditor {
  schema() {
    return [
      { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "hash", selector: { text: {} } }] },
      { type: "grid", name: "", schema: [{ name: "icon", selector: { icon: {} } }, { name: "bereich", selector: { area: {} } }] },
      { type: "expandable", flatten: true, name: "kopf", title: "Kopfzeile", icon: "mdi:page-layout-header", schema: [
        { name: "temperatur", selector: { entity: { filter: { domain: "sensor", device_class: "temperature" } } } },
        { name: "feuchte", selector: { entity: { filter: { domain: "sensor", device_class: "humidity" } } } },
        { name: "fenster_auto", selector: { boolean: {} } },
        { name: "chips", selector: { entity: { multiple: true } } },
        { name: "alles_aus", selector: { boolean: {} } },
        { name: "alles_aus_entitaeten", selector: { entity: { multiple: true } } },
      ] },
    ];
  }
  render() { for (const k of ["alles_aus", "fenster_auto"]) if (this._config[k] === undefined) this._config[k] = true; super.render(); }
  labels() {
    return { name: "Name", hash: "Kurzname (#…, wie in der Raumleiste)", icon: "Symbol", bereich: "HA-Bereich", temperatur: "Temperatur (leer = aus dem Bereich)",
      feuchte: "Luftfeuchte (leer = aus dem Bereich)", fenster_auto: "Fenster/Türen des Bereichs als Chips", chips: "Weitere Chips im Kopf",
      alles_aus: "Knopf „Alles aus“", alles_aus_entitaeten: "Was „Alles aus“ ausschaltet (leer = alles, was im Bereich an ist)" };
  }
  // Karten im Blatt: der normale HA-Stapel-Editor (Karten hinzufügen, verschieben, bearbeiten wie gewohnt)
  async extra(box) {
    box.innerHTML = `<div class="ge-liste"><div class="ge-kopf">Karten im Raum-Blatt</div>
      <div class="ge-hinweis">Wie bei einem Stapel: Karten hinzufügen, umsortieren und bearbeiten. Glas-Kacheln teilen sich das Raster nach ihrer Größe (klein = ¼, breit = ½, ganze Breite).</div></div>`;
    try {
      const Stapel = customElements.get("hui-vertical-stack-card") || (await window.loadCardHelpers().then((hf) => hf.createCardElement({ type: "vertical-stack", cards: [] })).then((e) => e.constructor));
      const ed = await Stapel.getConfigElement();
      ed.hass = this._hass;
      ed.lovelace = this.lovelace;
      ed.setConfig({ type: "vertical-stack", cards: this._config.cards || [] });
      ed.addEventListener("config-changed", (e) => {
        e.stopPropagation();
        this.aendern({ ...this._config, cards: e.detail.config.cards || [] });
      });
      box.firstElementChild.appendChild(ed);
      this._stapel = ed;
    } catch (e) {
      box.firstElementChild.insertAdjacentHTML("beforeend", `<div class="ge-hinweis">Der Karten-Editor ließ sich nicht laden. Karten bitte im Code-Editor unter „cards:“ eintragen.</div>`);
    }
  }
  set hass(h) { super.hass = h; if (this._stapel) this._stapel.hass = h; }
  get hass() { return this._hass; }
}

// ---------------------------------------------------------------------------
// Fenster-Ansicht: alle Fenster und Türen, der aktuelle Raum zuerst
// ---------------------------------------------------------------------------
const FENSTER_KLASSEN = ["window", "door", "garage_door", "opening"];
const istFenster = (st) => !!st && domainVon(st.entity_id) === "binary_sensor" && FENSTER_KLASSEN.includes(st.attributes.device_class);
const FENSTER_CSS = `
.gruppe-f{display:flex;flex-direction:column;border-radius:var(--g-r);overflow:hidden}
.gruppe-titel{margin:var(--g-a2) var(--g-a2) 0;font-size:var(--g-s-klein);font-weight:600;color:var(--g-text2)}
.f-zeile{display:flex;align-items:center;gap:var(--g-a3);min-height:56px;padding:var(--g-a2) var(--g-a4);text-align:left;color:var(--g-text)}
.f-zeile + .f-zeile{border-top:1px solid var(--g-trenn)}
.f-sym{flex:none;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--g-fuell);color:var(--g-fuell-text)}
.f-zeile.offen .f-sym{background:var(--g-orange);color:#fff}
.f-text{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.f-text b{font-size:var(--g-s-name);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.f-text span{font-size:var(--g-s-klein);color:var(--g-text2)}
.f-wert{flex:none;font-size:var(--g-s-name);font-weight:600;color:var(--g-text2)}
.offen .f-wert{color:var(--g-orange-text,#c93400)}
.dunkel .offen .f-wert{color:#ffb35c}
`;
function fensterOeffnen(quelle, bereich, raumName) {
  const s = new GlasSchicht({ quelle, hoch: true, titel: "Fenster und Türen", zu: () => Glas.hassHoerer.delete(neu) });
  let letzt = "";
  const zeichnen = () => {
    const h = Glas.hass;
    if (!h) return;
    const alle = Object.values(h.states).filter((st) => istFenster(st) && !h.entities?.[st.entity_id]?.hidden);
    const schluessel = alle.map((x) => x.entity_id + x.state + x.last_changed).join() + istDunkel(h);
    if (schluessel === letzt) return;
    letzt = schluessel;
    s.dunkel(istDunkel(h));
    const offen = alle.filter((x) => x.state === "on").length;
    const raumVon = (st) => { const a = bereichVon(h, st.entity_id); return a ? h.areas?.[a]?.name || a : "Ohne Raum"; };
    const zeile = (st) => {
      const o = st.state === "on", tuer = st.attributes.device_class !== "window";
      return `<button class="f-zeile ${o ? "offen" : ""}" data-e="${esc(st.entity_id)}"><span class="f-sym"><ha-state-icon data-e="${esc(st.entity_id)}"></ha-state-icon></span>
        <span class="f-text"><b>${esc(st.attributes.friendly_name || st.entity_id)}</b><span>${o ? "offen" : tuer ? "zu" : "geschlossen"} seit ${esc(relativeZeit(st.last_changed).replace(/^vor /, ""))}</span></span>
        <span class="f-wert">${o ? "Offen" : "Zu"}</span></button>`;
    };
    const hier = alle.filter((st) => bereich && bereichVon(h, st.entity_id) === bereich);
    const rest = alle.filter((st) => !hier.includes(st));
    const gruppen = {};
    rest.sort((a, b) => (b.state === "on") - (a.state === "on")).forEach((st) => { (gruppen[raumVon(st)] = gruppen[raumVon(st)] || []).push(st); });
    s.inhalt.innerHTML = `<style>${FENSTER_CSS}</style>${s.kopfHtml("Fenster und Türen", offen ? `${offen} offen` : "Alles zu")}
      ${hier.length ? `<div class="gruppe-titel">${esc(raumName || "Dieser Raum")}</div><div class="gruppe-f glas">${hier.map(zeile).join("")}</div>` : ""}
      ${Object.entries(gruppen).map(([r, l]) => `<div class="gruppe-titel">${esc(r)}</div><div class="gruppe-f glas">${l.map(zeile).join("")}</div>`).join("")}
      ${alle.length ? "" : `<div class="leise">Keine Fenster- oder Türsensoren gefunden.</div>`}`;
    s.kopfBinden();
    s.inhalt.querySelectorAll("ha-state-icon[data-e]").forEach((el) => { el.hass = h; el.stateObj = h.states[el.dataset.e]; });
    s.inhalt.querySelectorAll(".f-zeile").forEach((b) => b.addEventListener("click", () => mehrInfo(quelle, b.dataset.e)));
  };
  const neu = () => zeichnen();
  Glas.hassHoerer.add(neu);
  zeichnen();
  s.oeffnen();
  return s;
}
// ---------------------------------------------------------------------------
// Bereichs-Karten: kompakt auf der Startseite, Tippen öffnet ein Blatt mit allem
// Sicherheit · Drucker & Werkstatt · Robi · Gäste
// ---------------------------------------------------------------------------
const BEREICH_CSS = `
:host{display:block;height:100%}
.kompakt{height:100%;min-height:var(--g-kachel-h);display:flex;align-items:center;gap:var(--g-a3);width:100%;padding:var(--g-a3);border-radius:var(--g-r);cursor:pointer}
.oeffnen{flex:1;min-width:0;display:flex;align-items:center;gap:var(--g-a3);align-self:stretch;text-align:left;border-radius:var(--g-r-klein)}
.kompakt.an{background:var(--g-an);border:1px solid transparent;box-shadow:var(--g-schatten)}
.kreis{flex:none;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;background:var(--kf,var(--g-akzent))}
.texte{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.t1{font-size:var(--g-s-name);font-weight:600;line-height:1.25;color:var(--g-text);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.t2{font-size:var(--g-s-klein);color:var(--g-text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.an .t1{color:var(--g-text-an)} .an .t2{color:var(--g-text2-an)}
.knopf{flex:none;min-height:36px;padding:0 var(--g-a3);border-radius:var(--g-r-pille);font-size:var(--g-s-klein);font-weight:600;color:#fff;background:var(--bk,var(--g-rot-voll))}
.balken{height:6px;border-radius:3px;overflow:hidden;background:var(--g-fuell);margin-top:var(--g-a1)}
.balken i{display:block;height:100%;border-radius:3px;background:var(--bf,var(--g-gruen))}
`;
const BLATT_CSS = `
.karte{display:flex;flex-direction:column;gap:2px;padding:var(--g-a3) var(--g-a4) var(--g-a2);border-radius:var(--g-r)}
.karte-kopf{display:flex;justify-content:space-between;align-items:baseline;gap:var(--g-a2);padding-bottom:var(--g-a1)}
.karte-titel{margin:0;font-size:var(--g-s-name);font-weight:600;color:var(--g-text2)}
.zeile{display:flex;align-items:center;gap:var(--g-a3);min-height:44px;font-size:var(--g-s-name);color:var(--g-text);border-top:1px solid var(--g-glas-rand)}
.zeile:first-of-type{border-top:0}
.zeile .rechts{margin-left:auto;font-weight:600;color:var(--g-text2);font-variant-numeric:tabular-nums}
.zeile .rechts.warn{color:#c93400}
:host([dunkel]) .zeile .rechts.warn,.dunkel .zeile .rechts.warn{color:#ffb35c}
.zeit{flex:none;width:44px;font-size:var(--g-s-klein);font-weight:600;color:var(--g-text2);font-variant-numeric:tabular-nums}
.raster2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--g-a2)}
.raster3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--g-a2)}
.aktion{min-height:48px;padding:0 var(--g-a2);border-radius:var(--g-r-klein);font-size:var(--g-s-name);font-weight:600;color:var(--g-text)}
.aktion.haupt{color:#fff;background:var(--g-akzent-voll);border-color:transparent}
.aktion:disabled{opacity:.45}
.wertbox{display:flex;flex-direction:column;gap:2px;padding:10px var(--g-a3);border-radius:var(--g-r-klein)}
.wertbox b{font-size:var(--g-s-text);color:var(--g-text);font-variant-numeric:tabular-nums}
.bild{position:relative;width:100%;border-radius:var(--g-r);overflow:hidden;background:#1c232d;aspect-ratio:16/9}
.bild img{display:block;width:100%;height:100%;object-fit:cover}
.live{position:absolute;left:12px;top:12px;padding:2px 8px;border-radius:6px;font-size:var(--g-s-mini);font-weight:800;letter-spacing:.5px;color:#fff;background:var(--g-rot-voll)}
.balken{height:12px;border-radius:6px;overflow:hidden;background:var(--g-fuell)}
.balken i{display:block;height:100%;border-radius:6px;background:var(--bf,var(--g-gruen))}
.gross{font-size:var(--g-s-h2);font-weight:800;color:var(--g-text);font-variant-numeric:tabular-nums}
.alarm{display:flex;align-items:center;gap:var(--g-a3);padding:var(--g-a3);border-radius:var(--g-r)}
.alarm.scharf{background:var(--g-an);box-shadow:var(--g-schatten)}
.alarm.scharf .t1{color:var(--g-text-an)}
.feld{flex:1;min-width:0;min-height:44px;padding:10px 14px;border-radius:var(--g-r-klein);font:inherit;font-size:var(--g-s-text);color:var(--g-text);
  background:var(--g-fuell);border:1px solid var(--g-glas-rand);outline-color:var(--g-akzent)}
.plus{flex:none;width:44px;height:44px;border-radius:var(--g-r-klein);display:flex;align-items:center;justify-content:center;color:#fff;background:var(--g-akzent-voll)}
.qr{display:flex;flex-direction:column;align-items:center;gap:var(--g-a3)}
.robi-held{display:flex;align-items:center;gap:var(--g-a4);padding:var(--g-a4);border-radius:var(--g-r)}
.robi-bild{position:relative;flex:none;width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;background:var(--g-lila)}
.robi-bild ha-icon{--mdc-icon-size:36px}
.robi-bild .ring{position:absolute;inset:-5px;border-radius:50%;border:3px solid transparent;border-top-color:var(--g-lila);opacity:0}
.robi-held.putzt .ring{opacity:1;animation:robi-dreh 1.4s linear infinite}
@keyframes robi-dreh{to{transform:rotate(360deg)}}
.robi-text{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.robi-status{font-size:var(--g-s-h2);font-weight:700;color:var(--g-text)}
.robi-text .balken{height:8px;margin-top:2px}
.aktion{display:inline-flex;align-items:center;justify-content:center;gap:8px}
.aktion ha-icon{--mdc-icon-size:20px}
.robi-haupt{color:#fff;background:var(--g-lila-voll);border-color:transparent}
.robi-raeume{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:var(--g-a2);padding:var(--g-a1) 0 var(--g-a3)}
.robi-raum{display:flex;align-items:center;gap:var(--g-a2);min-height:48px;padding:0 var(--g-a3);border-radius:var(--g-r-klein);background:var(--g-fuell);
  font-size:var(--g-s-name);font-weight:600;color:var(--g-text);text-align:left;transition:background-color .2s ease}
.robi-raum ha-icon{--mdc-icon-size:20px;color:var(--g-text2)}
.robi-raum.aktiv{background:var(--g-lila-voll);color:#fff}
.robi-raum.aktiv ha-icon{color:#fff}
.robi-chips{padding:var(--g-a1) 0 var(--g-a3)}
.karte [data-raeume]{margin-bottom:var(--g-a2)}
.qr svg{width:220px;height:220px;padding:14px;border-radius:var(--g-r);background:#fff}
.chips{display:flex;gap:var(--g-a2);flex-wrap:wrap}
${BEREICH_CSS.replace(":host{display:block;height:100%}", "")}
`;

// Gemeinsame Basis: kompakte Karte + Blatt, das mit hass mitlebt
class GlasBereichKarte extends GlasKarte {
  getGridOptions() { return { columns: this._config?.breite === "halb" ? 6 : 12, rows: "auto", min_columns: 6 }; }
  css() { return BEREICH_CSS; }
  set hass(h) { super.hass = h; if (this._blatt && !this._blattSperre) this.blattZeichnen(); }
  get hass() { return this._hass; }
  blattOeffnen() {
    if (this._blatt) return;
    this._blatt = new GlasSchicht({ quelle: this, hoch: this.blattHoch?.() ?? false, titel: this.blattTitel(), zu: () => { this._blatt = null; } });
    this.blattZeichnen();
    this._blatt.oeffnen();
  }
  blattZeichnen() {
    const s = this._blatt; if (!s) return;
    s.dunkel(istDunkel(this._hass));
    const html = `<style>${BLATT_CSS}</style>${this.blattHtml(s)}`;
    if (s._letztesHtml === html) return; // nichts geändert: Blatt stehen lassen
    s._letztesHtml = html;
    const scroll = s.inhalt.scrollTop;
    const fokus = s.inhalt.querySelector("input:focus");
    const wert = fokus?.value;
    s.inhalt.innerHTML = html;
    s.kopfBinden();
    s.inhalt.querySelectorAll("ha-state-icon[data-e]").forEach((el) => { el.hass = this._hass; el.stateObj = this._hass.states[el.dataset.e]; });
    this.blattBinden(s, (q) => s.inhalt.querySelector(q), (q) => [...s.inhalt.querySelectorAll(q)]);
    s.inhalt.scrollTop = scroll;
    if (fokus) { const neu = s.inhalt.querySelector("input"); if (neu) { neu.value = wert; neu.focus(); } }
  }
  kompaktHtml({ icon, farbe, t1, t2, knopf, knopfFarbe, an, balken, balkenFarbe }) {
    return `<div class="kompakt k ${an ? "an" : "glas"}" style="--kf:${farbe}"><button class="oeffnen" aria-haspopup="dialog" aria-label="${esc(t1)}${t2 ? `, ${esc(t2)}` : ""}">
      <span class="kreis" aria-hidden="true"><ha-icon data-i="${icon}"></ha-icon></span>
      <span class="texte"><span class="t1">${esc(t1)}</span>${t2 ? `<span class="t2">${esc(t2)}</span>` : ""}
      ${balken != null ? `<span class="balken" style="--bf:${balkenFarbe || "var(--g-gruen)"}"><i style="width:${klemmen(balken, 0, 100)}%"></i></span>` : ""}</span></button>
      ${knopf ? `<button class="knopf" data-knopf style="--bk:${knopfFarbe || "var(--g-rot)"}">${esc(knopf)}</button>` : ""}</div>`;
  }
  binden() {
    this.iconsSetzen();
    const k = this.$(".kompakt");
    k?.addEventListener("click", (e) => { if (!e.target.closest("[data-knopf]")) this.blattOeffnen(); });
    this.$("[data-knopf]")?.addEventListener("click", (e) => { e.stopPropagation(); this.knopf?.(); });
  }
  kameraHtml(eid, titel) {
    const st = eid && this._hass.states[eid];
    if (!st) return "";
    const bild = st.attributes.entity_picture ? `<img alt="" src="${esc(st.attributes.entity_picture)}">` : "";
    return `<button class="bild" data-kamera="${esc(eid)}" aria-label="${esc(titel || st.attributes.friendly_name)} groß öffnen">${bild}<span class="live">LIVE</span></button>`;
  }
}

// ---------------------------------------------------------------------------
// Sicherheit: Alarm (scharf/unscharf), letzter Tasterdruck, Fenster, Kamera, Verlauf
// ---------------------------------------------------------------------------
const ALARM_TEXT = { disarmed: "Unscharf", armed_home: "Scharf (zu Hause)", armed_away: "Scharf", armed_night: "Scharf (Nacht)",
  armed_vacation: "Scharf (Urlaub)", arming: "Wird scharf geschaltet", pending: "Gleich Alarm", triggered: "ALARM", disarming: "Wird unscharf" };

class GlasSicherheitCard extends GlasBereichKarte {
  static standard() { return { fenster_auto: true, scharf_modus: "away", verlauf: 6 }; }
  static getConfigElement() { return document.createElement("glas-sicherheit-card-editor"); }
  static getStubConfig(hass) { return { alarm: Object.keys(hass.states).find((e) => e.startsWith("alarm_control_panel.")) || "" }; }
  fenster() {
    const h = this._hass, c = this._config;
    const auto = c.fenster_auto ? Object.keys(h.states).filter((e) => e.startsWith("binary_sensor.") && ["window", "door", "garage_door"].includes(h.states[e].attributes.device_class)
      && !h.entities?.[e]?.hidden) : [];
    return [...new Set([...(c.fenster || []), ...auto])].map((e) => h.states[e]).filter(Boolean);
  }
  mitRaum(st) {
    const n = st.attributes.friendly_name || st.entity_id, a = bereichVon(this._hass, st.entity_id), r = a && this._hass.areas?.[a]?.name;
    return r && !n.toLowerCase().includes(r.toLowerCase()) ? `${r} · ${n}` : n;
  }
  entitaeten() { return [this._config.alarm, this._config.taster, this._config.kamera, ...this.fenster().map((s) => s.entity_id)].filter(Boolean); }
  blattTitel() { return "Sicherheit"; }
  blattHoch() { return true; }
  zustand() {
    const st = this._hass.states[this._config.alarm];
    const offen = this.fenster().filter((s) => s.state === "on");
    return { st, scharf: st && st.state !== "disarmed", offen,
      fensterText: offen.length === 0 ? "Alle Fenster zu" : offen.length === 1 ? `Offen: ${this.mitRaum(offen[0])}` : `${offen.length} Fenster offen` };
  }
  html() {
    const z = this.zustand();
    if (!this._config.alarm) return this.kompaktHtml({ icon: "mdi:shield-home-outline", farbe: "var(--g-gruen)", t1: "Sicherheit", t2: z.fensterText });
    const t = z.st ? ALARM_TEXT[z.st.state] || zustandText(this._hass, z.st) : "Alarm nicht gefunden";
    return this.kompaktHtml({ icon: z.scharf ? "mdi:shield-lock" : "mdi:shield-home-outline", farbe: z.scharf ? "var(--g-rot)" : "var(--g-gruen)", an: z.scharf,
      t1: `Alarmanlage · ${t}`, t2: z.fensterText, knopf: z.st ? (z.scharf ? "Unscharf" : "Scharf schalten") : "", knopfFarbe: z.scharf ? "var(--g-aktiv)" : "var(--g-rot-voll)" });
  }
  knopf() {
    const st = this._hass.states[this._config.alarm];
    if (!st) return;
    if (st.attributes.code_format && (st.state === "disarmed" ? st.attributes.code_arm_required !== false : true)) return mehrInfo(this, st.entity_id); // Code nötig → HA-Dialog
    const dienst = st.state === "disarmed" ? `alarm_arm_${this._config.scharf_modus || "away"}` : "alarm_disarm";
    this.dienst("alarm_control_panel", dienst, { entity_id: st.entity_id });
  }
  async verlaufLaden() {
    const c = this._config, ids = [c.alarm, c.taster, ...this.fenster().map((s) => s.entity_id), c.bewegung].filter(Boolean);
    if (!ids.length || !c.verlauf) return;
    try {
      const start = new Date(Date.now() - 24 * 3600e3).toISOString();
      const ev = await this._hass.callWS({ type: "logbook/get_events", start_time: start, entity_ids: ids });
      this._verlauf = ev.filter((e) => e.state != null || e.message).slice(-c.verlauf).reverse();
    } catch (_) { this._verlauf = []; }
    this.blattZeichnen();
  }
  blattOeffnen() { super.blattOeffnen(); this.verlaufLaden(); }
  blattHtml(s) {
    const h = this._hass, c = this._config, z = this.zustand();
    const taster = c.taster && h.states[c.taster];
    const alarm = z.st ? `<div class="alarm ${z.scharf ? "scharf" : "glas"}"><span class="kreis" style="--kf:${z.scharf ? "var(--g-rot)" : "var(--g-gruen)"}"><ha-icon data-i="mdi:shield-home-outline"></ha-icon></span>
      <span class="texte"><span class="t1">${esc(ALARM_TEXT[z.st.state] || z.st.state)}</span>
      <span class="t2">${taster ? `Taster zuletzt ${relativeZeit(taster.last_changed)}` : `Geändert ${relativeZeit(z.st.last_changed)}`}</span></span>
      <button class="knopf" data-alarm style="--bk:${z.scharf ? "var(--g-aktiv)" : "var(--g-rot-voll)"}">${z.scharf ? "Unscharf" : "Scharf schalten"}</button></div>` : "";
    const fenster = this.fenster();
    return `${s.kopfHtml("Sicherheit", z.fensterText)}${alarm}
      ${fenster.length ? `<div class="karte glas"><div class="karte-kopf"><h3 class="karte-titel">Fenster und Türen</h3></div>${fenster.map((f) =>
        `<div class="zeile"><span class="punkt" style="background:${f.state === "on" ? "var(--g-orange)" : "var(--g-gruen)"}"></span>${esc(this.mitRaum(f))}
        <span class="rechts ${f.state === "on" ? "warn" : ""}">${esc(zustandText(h, f))}</span></div>`).join("")}</div>` : ""}
      ${this.kameraHtml(c.kamera)}
      ${c.verlauf ? `<div class="karte glas"><div class="karte-kopf"><h3 class="karte-titel">Verlauf (24 Std.)</h3></div>${(this._verlauf || []).map((e) =>
        `<div class="zeile"><span class="zeit">${uhr(new Date(e.when * 1000))}</span><span>${esc(e.name || h.states[e.entity_id]?.attributes.friendly_name || "")} ${esc(e.message || (e.state ? zustandText(h, { ...h.states[e.entity_id], state: e.state }) : ""))}</span></div>`).join("")
        || `<div class="zeile leise">${this._verlauf ? "Nichts passiert." : "Lade …"}</div>`}</div>` : ""}`;
  }
  blattBinden(s, $, $$) {
    $("[data-alarm]")?.addEventListener("click", () => this.knopf());
    $$("[data-kamera]").forEach((b) => b.addEventListener("click", () => mehrInfo(this, b.dataset.kamera)));
  }
}
class GlasSicherheitEditor extends GlasEditor {
  schema() {
    return [
      { name: "alarm", selector: { entity: { filter: { domain: "alarm_control_panel" } } } },
      { name: "scharf_modus", selector: { select: { mode: "dropdown", options: [{ value: "away", label: "Abwesend" }, { value: "home", label: "Zu Hause" }, { value: "night", label: "Nacht" }] } } },
      { name: "taster", selector: { entity: { filter: [{ domain: "event" }, { domain: "binary_sensor" }, { domain: "sensor" }] } } },
      { name: "fenster_auto", selector: { boolean: {} } },
      { name: "fenster", selector: { entity: { multiple: true, filter: { domain: "binary_sensor" } } } },
      { name: "kamera", selector: { entity: { filter: { domain: "camera" } } } },
      { name: "verlauf", selector: { number: { min: 0, max: 20, mode: "box" } } },
      { name: "breite", selector: { select: { mode: "dropdown", options: [{ value: "ganz", label: "Ganze Breite" }, { value: "halb", label: "Halbe Breite" }] } } },
    ];
  }
  render() { if (this._config.fenster_auto === undefined) this._config.fenster_auto = true; super.render(); }
  labels() { return { alarm: "Alarmanlage", scharf_modus: "„Scharf schalten“ bedeutet", taster: "Taster (für „zuletzt gedrückt“)", fenster_auto: "Alle Fenster/Türen automatisch",
    fenster: "Weitere Fenster/Türen", kamera: "Kamera", verlauf: "Einträge im Verlauf (0 = aus)", breite: "Breite auf der Startseite" }; }
  hilfen() { return { alarm: "Wenn die Anlage einen Code verlangt, öffnet der Knopf den HA-Dialog zur Code-Eingabe." }; }
}

// ---------------------------------------------------------------------------
// Drucker & Werkstatt: Fortschritt, Steuerung, Kamera, Warteschlange, knappes Filament
// Entitäten werden aus dem Drucker-Gerät (Bambu-Lab-Integration) automatisch gesucht
// ---------------------------------------------------------------------------
const DRUCKER_SUCHE = {
  fortschritt: ["print_progress", "_progress"], status: ["print_status", "current_stage", "_status"], restzeit: ["remaining_time"], ende: ["end_time"],
  schicht: ["current_layer"], schichten: ["total_layer_count", "total_layers"], duese: ["nozzle_temperature", "nozzle_temp"], bett: ["bed_temperature", "bed_temp"],
  aufgabe: ["task_name", "subtask_name", "gcode_file"], kamera: ["camera"], licht: ["chamber_light"], pause: ["pause_printing", "_pause"], weiter: ["resume_printing", "_resume"],
  stopp: ["stop_printing", "_stop"], bild: ["cover_image"],
};
const DRUCK_STATUS = { running: "druckt", printing: "druckt", pause: "pausiert", paused: "pausiert", finish: "fertig", finished: "fertig", idle: "bereit", failed: "Fehler", prepare: "bereitet vor", offline: "aus" };

class GlasDruckerCard extends GlasBereichKarte {
  static standard() { return { knapp_g: 200, name: "P1S" }; }
  static getConfigElement() { return document.createElement("glas-drucker-card-editor"); }
  static getStubConfig() { return { name: "P1S" }; }
  e(k) {
    const c = this._config, h = this._hass;
    if (c[k]) return c[k];
    if (!c.geraet) return null;
    const alle = Object.keys(h.entities || {}).filter((x) => h.entities[x].device_id === c.geraet);
    for (const s of DRUCKER_SUCHE[k] || []) { const t = alle.find((x) => x.includes(s)); if (t) return t; }
    return null;
  }
  st(k) { const id = this.e(k); return id ? this._hass.states[id] : null; }
  entitaeten() { return [...Object.keys(DRUCKER_SUCHE).map((k) => this.e(k)), this._config.stecker].filter(Boolean); }
  blattTitel() { return this._config.name; }
  blattHoch() { return true; }
  werte() {
    const fs = this.st("fortschritt"), ss = this.st("status"), stecker = this._config.stecker && this._hass.states[this._config.stecker];
    const roh = ss?.state || "";
    const status = DRUCK_STATUS[roh.toLowerCase()] || (ss ? zustandText(this._hass, ss) : "");
    const aus = stecker && stecker.state === "off";
    const pct = fs && !isNaN(Number(fs.state)) ? Number(fs.state) : null;
    const laeuft = !aus && /druck|print|running|pause/i.test(status + roh);
    const pause = /pause/i.test(roh);
    let rest = "";
    const rz = this.st("restzeit"), en = this.st("ende");
    if (rz && !isNaN(Number(rz.state)) && Number(rz.state) > 0) {
      const minuten = Number(rz.state) * ((rz.attributes.unit_of_measurement || "min").startsWith("h") ? 60 : 1);
      rest = `noch ${minuten >= 60 ? `${Math.floor(minuten / 60)} Std. ${Math.round(minuten % 60)} Min.` : `${Math.round(minuten)} Min.`}`;
    }
    if (en && en.state && !isNaN(Date.parse(en.state))) rest += `${rest ? " · " : ""}fertig ca. ${uhr(new Date(en.state))}`;
    return { pct, status: aus ? "aus" : status, laeuft, pause, rest, aus };
  }
  html() {
    const w = this.werte(), c = this._config;
    return this.kompaktHtml({ icon: "mdi:printer-3d-nozzle", farbe: w.laeuft ? (w.pause ? "var(--g-orange)" : "var(--g-gruen)") : "#8e8e93", an: w.laeuft,
      t1: `${c.name} ${w.status}${w.laeuft && w.pct != null ? ` · ${Math.round(w.pct)} %` : ""}`, t2: w.laeuft ? w.rest : this.warteText(),
      balken: w.laeuft && w.pct != null ? w.pct : null, balkenFarbe: w.pause ? "var(--g-orange)" : "var(--g-gruen)" });
  }
  warteText() { const n = this._werk?.warteschlange?.length; return n ? `${n} in der Warteschlange` : "Werkstatt öffnen"; }
  async werkstattLaden() {
    if (this._config.werkstatt === false) return;
    try {
      const r = await this._hass.connection.sendMessagePromise({ type: "call_service", domain: "filament_werkstatt", service: "lesen", service_data: {}, return_response: true });
      this._werk = r.response?.daten || r.response || null;
    } catch (_) { this._werk = null; }
    this.render(); this.blattZeichnen();
  }
  connectedCallback() { super.connectedCallback(); this._werkT = setInterval(() => this.werkstattLaden(), 10 * 60e3); }
  disconnectedCallback() { super.disconnectedCallback(); clearInterval(this._werkT); }
  set hass(h) { const erst = !this._hass; super.hass = h; if (erst) this.werkstattLaden(); }
  get hass() { return this._hass; }
  blattHtml(s) {
    const h = this._hass, c = this._config, w = this.werte();
    const auf = this.st("aufgabe"), sch = this.st("schicht"), schs = this.st("schichten"), du = this.st("duese"), be = this.st("bett"), bild = this.st("bild");
    const knoepfe = [];
    if (this.e("pause") || this.e("weiter")) knoepfe.push(`<button class="aktion glas" data-pause>${w.pause ? "Fortsetzen" : "Pause"}</button>`);
    if (this.e("licht")) knoepfe.push(`<button class="aktion glas" data-licht>Licht ${this.st("licht")?.state === "on" ? "aus" : "an"}</button>`);
    if (c.stecker) knoepfe.push(`<button class="aktion glas" data-stecker>Strom ${h.states[c.stecker]?.state === "on" ? "aus" : "an"}</button>`);
    const werk = this._werk;
    const rollen = werk?.rollen || [];
    const geladen = rollen.find((r) => r.id === werk?.geladen);
    const knapp = rollen.filter((r) => r.rest_g != null && r.rest_g < c.knapp_g).slice(0, 5);
    const farbe = (r) => r?.hex || "#8e8e93";
    return `${s.kopfHtml(`${c.name} ${w.status}`, [auf && Geraet.verfuegbar(auf) ? auf.state : "", w.pct == null ? w.rest : ""].filter(Boolean).join(" · "))}
      <div class="raster2">${bild?.attributes.entity_picture ? `<div class="bild" style="aspect-ratio:1"><img alt="Vorschau" src="${esc(bild.attributes.entity_picture)}"></div>` : ""}
        ${this.kameraHtml(this.e("kamera"), "Druckerkamera").replace('class="bild"', `class="bild" style="aspect-ratio:${bild ? "1" : "16/9"}"`)}</div>
      ${w.pct != null ? `<div><div class="balken" style="--bf:${w.pause ? "var(--g-orange)" : "var(--g-gruen)"}"><i style="width:${klemmen(w.pct, 0, 100)}%"></i></div>
        <div class="zeile" style="border:0"><span class="gross">${Math.round(w.pct)} %</span><span class="rechts">${esc(w.rest)}</span></div></div>` : ""}
      ${sch || du || be ? `<div class="raster3">${sch ? `<div class="wertbox glas"><span class="leise">Schicht</span><b>${esc(sch.state)}${schs ? ` / ${esc(schs.state)}` : ""}</b></div>` : ""}
        ${du ? `<div class="wertbox glas"><span class="leise">Düse</span><b>${esc(zustandText(h, du))}</b></div>` : ""}${be ? `<div class="wertbox glas"><span class="leise">Bett</span><b>${esc(zustandText(h, be))}</b></div>` : ""}</div>` : ""}
      ${knoepfe.length ? `<div class="raster3">${knoepfe.join("")}</div>` : ""}
      ${geladen ? `<div class="zeile glas" style="padding:0 var(--g-a3);border-radius:var(--g-r-klein)"><span class="punkt" style="background:${farbe(geladen)};box-shadow:inset 0 0 0 1px rgba(0,0,0,.2)"></span>
        ${esc(geladen.material)} ${esc(geladen.farbe)}<span class="rechts">${geladen.rest_g != null ? `noch ${Math.round(geladen.rest_g)} g` : ""}</span></div>` : ""}
      ${werk ? `<h3 class="h2" style="margin-top:var(--g-a2)">Werkstatt</h3>
      <div class="karte glas"><div class="karte-kopf"><h3 class="karte-titel">Warteschlange</h3><span class="leise">${werk.warteschlange?.length || 0} Modelle</span></div>
        ${(werk.warteschlange || []).slice(0, 8).map((q) => { const r = rollen.find((x) => x.id === q.rolleId);
          return `<div class="zeile"><span class="punkt" style="background:${farbe(r)};box-shadow:inset 0 0 0 1px rgba(0,0,0,.2)"></span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(q.name)}</span>
          <span class="rechts">${esc(r ? `${r.material} ${r.farbe}` : q.zeit || "")}</span></div>`; }).join("")}
        <div style="display:flex;gap:var(--g-a2);padding:var(--g-a2) 0 var(--g-a1)"><input class="feld" placeholder="Modell zur Warteschlange" aria-label="Modell zur Warteschlange" enterkeyhint="done">
        <button class="plus" data-plus aria-label="Hinzufügen"><ha-icon data-i="mdi:plus"></ha-icon></button></div></div>
      ${knapp.length ? `<div class="karte glas"><div class="karte-kopf"><h3 class="karte-titel">Filament wird knapp</h3></div>${knapp.map((r) =>
        `<div class="zeile"><span class="punkt" style="background:${farbe(r)};box-shadow:inset 0 0 0 1px rgba(0,0,0,.2)"></span>${esc(r.material)} ${esc(r.farbe)}<span class="rechts warn">noch ${Math.round(r.rest_g)} g</span></div>`).join("")}</div>` : ""}` : ""}
      <button class="link" data-werk>Werkstatt öffnen ›</button>`;
  }
  blattBinden(s, $, $$) {
    const h = this._hass, w = this.werte();
    s.inhalt.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
    $("[data-pause]")?.addEventListener("click", () => { const b = this.e(w.pause ? "weiter" : "pause"); if (b) h.callService("button", "press", { entity_id: b }); });
    $("[data-licht]")?.addEventListener("click", () => h.callService("light", "toggle", { entity_id: this.e("licht") }));
    $("[data-stecker]")?.addEventListener("click", () => h.callService("homeassistant", "toggle", { entity_id: this._config.stecker }));
    $$("[data-kamera]").forEach((b) => b.addEventListener("click", () => mehrInfo(this, b.dataset.kamera)));
    $("[data-werk]")?.addEventListener("click", () => { s.schliessen(); navigieren(this._config.werkstatt_pfad || "/filament"); });
    const feld = $("input.feld");
    const hinzu = async () => {
      const name = feld.value.trim(); if (!name) return;
      feld.value = "";
      try { await h.callService("filament_werkstatt", "warteschlange_hinzufuegen", { name, quelle: "glas-dashboard" }); } catch (_) { /* */ }
      this.werkstattLaden();
    };
    feld?.addEventListener("keydown", (e) => { if (e.key === "Enter") hinzu(); });
    $("[data-plus]")?.addEventListener("click", hinzu);
  }
}
class GlasDruckerEditor extends GlasEditor {
  schema() {
    return [
      { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "breite", selector: { select: { mode: "dropdown", options: [{ value: "ganz", label: "Ganze Breite" }, { value: "halb", label: "Halbe Breite" }] } } }] },
      { name: "geraet", selector: { device: {} } },
      { name: "stecker", selector: { entity: { filter: { domain: "switch" } } } },
      { type: "grid", name: "", schema: [{ name: "werkstatt", selector: { boolean: {} } }, { name: "knapp_g", selector: { number: { min: 0, max: 1000, mode: "box", unit_of_measurement: "g" } } }] },
      { type: "expandable", flatten: true, name: "einzeln", title: "Entitäten einzeln festlegen (sonst automatisch)", icon: "mdi:tune", schema:
        Object.keys(DRUCKER_SUCHE).map((k) => ({ name: k, selector: { entity: {} } })) },
    ];
  }
  render() { if (this._config.werkstatt === undefined) this._config.werkstatt = true; super.render(); }
  labels() { return { name: "Name", breite: "Breite", geraet: "Drucker-Gerät (Bambu Lab)", stecker: "Steckdose des Druckers", werkstatt: "Werkstatt-Daten zeigen", knapp_g: "Filament knapp unter",
    fortschritt: "Fortschritt", status: "Status", restzeit: "Restzeit", ende: "Endzeit", schicht: "Aktuelle Schicht", schichten: "Schichten gesamt", duese: "Düsentemperatur",
    bett: "Betttemperatur", aufgabe: "Dateiname", kamera: "Kamera", licht: "Licht", pause: "Knopf Pause", weiter: "Knopf Fortsetzen", stopp: "Knopf Stopp", bild: "Vorschaubild" }; }
  hilfen() { return { geraet: "Alle Werte werden aus dem Gerät gesucht. Fehlt etwas, unten einzeln festlegen." }; }
}

// ---------------------------------------------------------------------------
// Robi: Status, Akku, alles saugen, Räume saugen, Saugstärke, Stationsknöpfe
// ---------------------------------------------------------------------------
const ROBI_STATUS = { docked: "In der Station", cleaning: "Saugt", paused: "Pausiert", returning: "Fährt zur Station", idle: "Bereit", error: "Fehler" };

class GlasRobiCard extends GlasBereichKarte {
  static standard() { return { raeume: [], befehl: "spot_area" }; }
  static getConfigElement() { return document.createElement("glas-robi-card-editor"); }
  static getStubConfig(hass) { return { entity: Object.keys(hass.states).find((e) => e.startsWith("vacuum.")) || "" }; }
  pruefen(c) { if (!c.entity) throw new Error("Bitte den Saugroboter wählen"); }
  blattTitel() { return this._config.name || "Robi"; }
  akku() {
    const c = this._config, st = this._hass.states[c.entity], a = c.akku && this._hass.states[c.akku];
    const v = a ? Number(a.state) : st?.attributes.battery_level;
    return v == null || isNaN(v) ? null : Number(v);
  }
  html() {
    const st = this._hass.states[this._config.entity], ak = this.akku();
    const s = st ? ROBI_STATUS[st.state] || zustandText(this._hass, st) : "nicht gefunden";
    return this.kompaktHtml({ icon: "mdi:robot-vacuum", farbe: "var(--g-lila)", an: st?.state === "cleaning", t1: `${this._config.name || "Robi"} · ${s}`,
      t2: ak != null ? `Akku ${Math.round(ak)} %` : "", balken: ak, knopf: st?.state === "cleaning" ? "Pause" : "", knopfFarbe: "var(--g-aktiv)" });
  }
  knopf() { this.dienst("vacuum", "pause", { entity_id: this._config.entity }); }
  // Was zum Roboter gehört: Räume, Auswahlen, Stationsknöpfe – eingestellt oder automatisch vom Gerät
  geraetEntitaeten(domain) {
    const h = this._hass, dev = h.entities?.[this._config.entity]?.device_id;
    if (!dev) return [];
    return Object.keys(h.entities || {}).filter((e) => e.startsWith(`${domain}.`) && h.entities[e].device_id === dev && h.entities[e].entity_category !== "diagnostic"
      && !h.entities[e].hidden && h.states[e] && !/reset|zurueck|zurück|lifespan|lebensdauer/i.test(`${e} ${h.states[e].attributes.friendly_name || ""}`));
  }
  raumListe() {
    const c = this._config, st = this._hass.states[c.entity];
    if ((c.raeume || []).length) return c.raeume;
    const r = st?.attributes.rooms;
    if (!r || typeof r !== "object") return [];
    return Object.entries(r).map(([name, id]) => ({ name: ROBI_RAUM[name] || name.replace(/_/g, " ").replace(/^./, (x) => x.toUpperCase()), id: [].concat(id).join(",") }));
  }
  auswahlen() { const c = this._config; return (c.auswahl?.length ? c.auswahl : this.geraetEntitaeten("select")).map((e) => this._hass.states[e]).filter(Boolean); }
  knoepfe() { const c = this._config; return (c.knoepfe?.length ? c.knoepfe : this.geraetEntitaeten("button")).map((e) => this._hass.states[e]).filter(Boolean); }
  blattHtml(s) {
    const h = this._hass, c = this._config, st = h.states[c.entity], ak = this.akku();
    if (!st) return s.kopfHtml(c.name || "Robi", "nicht gefunden");
    const gew = this._gewaehlt || new Set();
    const putzt = st.state === "cleaning", pause = st.state === "paused";
    const stufen = st.attributes.fan_speed_list || [];
    const raeume = this.raumListe();
    const status = ROBI_STATUS[st.state] || zustandText(h, st);
    const akkuFarbe = ak == null ? "" : ak < 20 ? "var(--g-rot)" : ak < 40 ? "var(--g-orange)" : "var(--g-gruen)";
    const wahlChips = (a, opts, wert, attr) => opts.map((o) =>
      `<button class="pille fuell robi-chip ${wert === o ? "aktiv" : ""}" ${attr}="${esc(o)}" aria-pressed="${wert === o}">${esc(o.label || o)}</button>`).join("");
    return `${s.kopfHtml(c.name || "Robi", "Saugroboter")}
      <div class="robi-held glas ${putzt ? "putzt" : ""}">
        <div class="robi-bild"><span class="ring" aria-hidden="true"></span><ha-icon data-i="mdi:robot-vacuum"></ha-icon></div>
        <div class="robi-text"><span class="robi-status">${esc(status)}</span>
          ${ak != null ? `<span class="leise">Akku ${Math.round(ak)} %${st.attributes.fan_speed ? ` · ${esc(ROBI_STUFE[st.attributes.fan_speed] || st.attributes.fan_speed)}` : ""}</span>
          <div class="balken"><i style="width:${ak}%;--bf:${akkuFarbe}"></i></div>` : ""}</div>
      </div>
      <div class="raster2">
        <button class="aktion robi-haupt" data-start><ha-icon data-i="${putzt ? "mdi:pause" : "mdi:play"}"></ha-icon>${putzt ? "Pause" : pause ? "Fortsetzen" : "Alles saugen"}</button>
        <button class="aktion glas" data-station><ha-icon data-i="mdi:home-import-outline"></ha-icon>Zur Station</button></div>
      ${raeume.length ? `<div class="karte glas"><div class="karte-kopf"><h3 class="karte-titel">Räume saugen</h3>${gew.size ? `<span class="leise">${gew.size} gewählt</span>` : ""}</div>
        <div class="robi-raeume">${raeume.map((r, i) => `<button class="robi-raum ${gew.has(i) ? "aktiv" : ""}" data-raum="${i}" aria-pressed="${gew.has(i)}">
          <ha-icon data-i="${gew.has(i) ? "mdi:check-circle" : "mdi:circle-outline"}"></ha-icon><span>${esc(r.name)}</span></button>`).join("")}</div>
        <button class="aktion robi-haupt" data-raeume ${gew.size ? "" : "disabled"}>${gew.size ? `${gew.size} ${gew.size === 1 ? "Raum" : "Räume"} saugen` : "Räume antippen"}</button></div>` : ""}
      ${stufen.length || this.auswahlen().length ? `<div class="karte glas">
        ${stufen.length ? `<div class="karte-kopf"><h3 class="karte-titel">Saugstärke</h3></div><div class="chips robi-chips">${stufen.map((f) =>
          `<button class="pille fuell ${st.attributes.fan_speed === f ? "aktiv" : ""}" data-stufe="${esc(f)}" aria-pressed="${st.attributes.fan_speed === f}">${esc(ROBI_STUFE[f] || f)}</button>`).join("")}</div>` : ""}
        ${this.auswahlen().map((a) => `<div class="karte-kopf"><h3 class="karte-titel">${esc(robiName(a, c.name))}</h3></div><div class="chips robi-chips">${(a.attributes.options || []).map((o) =>
          `<button class="pille fuell ${a.state === o ? "aktiv" : ""}" data-wahl="${esc(a.entity_id)}" data-o="${esc(o)}" aria-pressed="${a.state === o}">${esc(attributText(h, { ...a, attributes: { ...a.attributes, x: o } }, "x") || ROBI_STUFE[o] || o)}</button>`).join("")}</div>`).join("")}
      </div>` : ""}
      ${this.knoepfe().length ? `<div class="raster2">${this.knoepfe().map((b) =>
        `<button class="aktion glas" data-btn="${esc(b.entity_id)}"><ha-icon data-i="${esc(b.attributes.icon || robiKnopfIcon(b.entity_id))}"></ha-icon>${esc(robiName(b, c.name))}</button>`).join("")}</div>` : ""}`;
  }
  blattBinden(s, $, $$) {
    const h = this._hass, c = this._config, st = h.states[c.entity];
    $("[data-start]")?.addEventListener("click", () => h.callService("vacuum", st.state === "cleaning" ? "pause" : "start", { entity_id: c.entity }));
    $("[data-station]")?.addEventListener("click", () => h.callService("vacuum", "return_to_base", { entity_id: c.entity }));
    $$("[data-raum]").forEach((b) => b.addEventListener("click", () => {
      this._gewaehlt = this._gewaehlt || new Set(); const i = Number(b.dataset.raum);
      this._gewaehlt.has(i) ? this._gewaehlt.delete(i) : this._gewaehlt.add(i); this.blattZeichnen();
    }));
    $("[data-raeume]")?.addEventListener("click", () => {
      const liste = this.raumListe();
      const ids = [...(this._gewaehlt || [])].map((i) => liste[i]?.id).filter((x) => x !== undefined && x !== "");
      if (!ids.length) return;
      h.callService("vacuum", "send_command", { entity_id: c.entity, command: c.befehl || "spot_area", params: { rooms: ids.join(","), cleanings: 1 } });
      this._gewaehlt = new Set(); this.blattZeichnen();
    });
    $$("[data-stufe]").forEach((b) => b.addEventListener("click", () => h.callService("vacuum", "set_fan_speed", { entity_id: c.entity, fan_speed: b.dataset.stufe })));
    $$("[data-wahl]").forEach((b) => b.addEventListener("click", () => h.callService("select", "select_option", { entity_id: b.dataset.wahl, option: b.dataset.o })));
    $$("[data-btn]").forEach((b) => b.addEventListener("click", () => h.callService("button", "press", { entity_id: b.dataset.btn })));
    s.inhalt.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
  }
  entitaeten() { return [this._config.entity, this._config.akku, ...this.auswahlen().map((a) => a.entity_id), ...this.knoepfe().map((b) => b.entity_id)].filter(Boolean); }
}
// Ecovacs meldet Raumtypen auf Englisch
const ROBI_RAUM = { kitchen: "Küche", living_room: "Wohnzimmer", bedroom: "Schlafzimmer", study: "Arbeitszimmer", corridor: "Flur", bathroom: "Bad", dining_room: "Esszimmer",
  balcony: "Balkon", laundry: "Waschraum", childrens_room: "Kinderzimmer", storeroom: "Abstellraum", sunroom: "Wintergarten", lounge: "Lounge", default: "Raum" };
const ROBI_STUFE = { quiet: "Leise", silent: "Leise", standard: "Standard", normal: "Normal", strong: "Stark", turbo: "Turbo", max: "Max", max_plus: "Max+",
  low: "Niedrig", medium: "Mittel", high: "Hoch", ultrahigh: "Sehr hoch", auto: "Automatisch" };
// „Robi Wassermenge“ → „Wassermenge“: Gerätename vorne weglassen
const robiName = (st, vorne) => { const n = st.attributes.friendly_name || st.entity_id; const v = [vorne, "Robi", "Deebot", "Ecovacs"].filter(Boolean).find((x) => n.toLowerCase().startsWith(x.toLowerCase() + " ")); return v ? n.slice(v.length + 1).replace(/^./, (x) => x.toUpperCase()) : n; };
const robiKnopfIcon = (id) => (/empty|absaug|dust/i.test(id) ? "mdi:delete-empty-outline" : /mop|wash|wisch|clean/i.test(id) ? "mdi:water-outline" : /dry|trock/i.test(id) ? "mdi:fan" : /relocat/i.test(id) ? "mdi:map-marker-radius-outline" : "mdi:gesture-tap-button");

class GlasRobiEditor extends GlasEditor {
  schema() {
    return [
      { type: "grid", name: "", schema: [{ name: "entity", selector: { entity: { filter: { domain: "vacuum" } } } }, { name: "name", selector: { text: {} } }] },
      { name: "akku", selector: { entity: { filter: { domain: "sensor", device_class: "battery" } } } },
      { name: "auswahl", selector: { entity: { multiple: true, filter: { domain: "select" } } } },
      { name: "knoepfe", selector: { entity: { multiple: true, filter: { domain: "button" } } } },
      { type: "grid", name: "", schema: [{ name: "befehl", selector: { text: {} } }, { name: "breite", selector: { select: { mode: "dropdown", options: [{ value: "ganz", label: "Ganze Breite" }, { value: "halb", label: "Halbe Breite" }] } } }] },
    ];
  }
  labels() { return { entity: "Saugroboter", name: "Name", akku: "Akku-Sensor (leer = vom Roboter)", auswahl: "Auswahlen (z. B. Wassermenge, Modus)", knoepfe: "Knöpfe der Station (Absaugen, Mopp waschen …)",
    befehl: "Befehl für Räume", breite: "Breite" }; }
  hilfen() { return { befehl: "Ecovacs: spot_area. Die Raum-Nummern stehen in der Ecovacs-App bzw. im Attribut „rooms“." }; }
  listen() {
    return [{ key: "raeume", titel: "Räume", neuText: "Raum", hinweis: "Name und Nummer des Raums, wie der Roboter ihn kennt.", neu: () => ({ name: "" }), name: (r) => r.name || "Neuer Raum",
      labels: { name: "Name", id: "Nummer beim Roboter" }, schema: () => [{ type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "id", selector: { text: {} } }] }] }];
  }
}

// ---------------------------------------------------------------------------
// Gäste: WLAN-QR zum Scannen (Daten aus Text oder HA-Helfern), optional zweiter Code
// ---------------------------------------------------------------------------
function qrSvg(text) {
  const q = qrcode(0, "M"); q.addData(text); q.make();
  const n = q.getModuleCount(); let d = "";
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (q.isDark(y, x)) d += `M${x} ${y}h1v1h-1z`;
  return `<svg viewBox="0 0 ${n} ${n}" role="img" aria-label="QR-Code" shape-rendering="crispEdges"><path d="${d}" fill="#000"/></svg>`;
}
const wlanEsc = (s) => String(s || "").replace(/([\\;,:"])/g, "\\$1");

class GlasGaesteCard extends GlasBereichKarte {
  static standard() { return { verschluesselung: "WPA" }; }
  static getConfigElement() { return document.createElement("glas-gaeste-card-editor"); }
  static getStubConfig() { return { ssid: "Gäste-WLAN" }; }
  wert(k) { const c = this._config; const e = c[`${k}_entity`] && this._hass.states[c[`${k}_entity`]]; return e ? e.state : c[k] || ""; }
  entitaeten() { return [this._config.ssid_entity, this._config.passwort_entity].filter(Boolean); }
  blattTitel() { return "Für Gäste"; }
  html() { return this.kompaktHtml({ icon: "mdi:qrcode", farbe: "var(--g-akzent)", t1: "Gäste", t2: `WLAN ${this.wert("ssid")}` }); }
  blattHtml(s) {
    const c = this._config, tab = this._tab || "wlan";
    const wlan = `WIFI:T:${c.verschluesselung};S:${wlanEsc(this.wert("ssid"))};P:${wlanEsc(this.wert("passwort"))};;`;
    const text = tab === "wlan" ? wlan : c.zweiter_text || "";
    return `${s.kopfHtml("Für Gäste", "")}${c.zweiter_text ? `<div class="chips"><button class="pille fuell ${tab === "wlan" ? "aktiv" : ""}" data-tab="wlan">WLAN</button>
      <button class="pille fuell ${tab === "zwei" ? "aktiv" : ""}" data-tab="zwei">${esc(c.zweiter_name || "Link")}</button></div>` : ""}
      <div class="qr">${text ? qrSvg(text) : ""}<span class="t1">${esc(tab === "wlan" ? this.wert("ssid") : c.zweiter_name || "")}</span>
      ${tab === "wlan" && c.passwort_zeigen ? `<span class="leise">Passwort: ${esc(this.wert("passwort"))}</span>` : `<span class="leise">Mit der Handykamera scannen.</span>`}</div>`;
  }
  blattBinden(s, $, $$) { $$("[data-tab]").forEach((b) => b.addEventListener("click", () => { this._tab = b.dataset.tab; this.blattZeichnen(); })); }
}
class GlasGaesteEditor extends GlasEditor {
  schema() {
    return [
      { type: "grid", name: "", schema: [{ name: "ssid", selector: { text: {} } }, { name: "passwort", selector: { text: { type: "password" } } }] },
      { type: "grid", name: "", schema: [{ name: "ssid_entity", selector: { entity: { filter: [{ domain: "input_text" }, { domain: "sensor" }] } } },
        { name: "passwort_entity", selector: { entity: { filter: [{ domain: "input_text" }, { domain: "sensor" }] } } }] },
      { type: "grid", name: "", schema: [{ name: "verschluesselung", selector: { select: { mode: "dropdown", options: [{ value: "WPA", label: "WPA/WPA2/WPA3" }, { value: "WEP", label: "WEP" }, { value: "nopass", label: "Offen" }] } } },
        { name: "passwort_zeigen", selector: { boolean: {} } }] },
      { type: "grid", name: "", schema: [{ name: "zweiter_name", selector: { text: {} } }, { name: "zweiter_text", selector: { text: {} } }] },
      { name: "breite", selector: { select: { mode: "dropdown", options: [{ value: "ganz", label: "Ganze Breite" }, { value: "halb", label: "Halbe Breite" }] } } },
    ];
  }
  labels() { return { ssid: "WLAN-Name", passwort: "Passwort", ssid_entity: "…oder Name aus Helfer", passwort_entity: "…oder Passwort aus Helfer", verschluesselung: "Verschlüsselung",
    passwort_zeigen: "Passwort als Text zeigen", zweiter_name: "Zweiter Code: Name", zweiter_text: "Zweiter Code: Link/Text", breite: "Breite" }; }
  hilfen() { return { passwort: "Steht im Klartext in der Dashboard-Konfiguration. Sicherer: ein input_text-Helfer." }; }
}
// ---------------------------------------------------------------------------
// glas-zuhause-card: das ganze Dashboard aus den zentralen Einstellungen.
// Kopf, Startseite der gewählten Person, Raumleiste und Raum-Blätter, mit Hintergrund.
// ---------------------------------------------------------------------------
const ZUHAUSE_CSS = `
:host{display:block;position:relative;min-height:100vh;min-height:100dvh}
.hg{position:fixed;inset:0;z-index:0;pointer-events:none}
.seite{position:relative;z-index:1;max-width:1320px;margin:0 auto;
  padding:var(--g-a4) var(--g-a4) calc(120px + env(safe-area-inset-bottom))}
.raster{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:var(--g-a2);margin-top:var(--g-a3);align-items:start}
.raster > *{grid-column:span 12;min-width:0}
.raster > .halb{grid-column:span 6}
.abschnitt-titel{grid-column:span 12;margin:var(--g-a4) var(--g-a1) var(--g-a1)}
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
    this.themaSetzen(true);
    this._takt = setInterval(() => this.hintergrund(), 10 * 60e3);
    this.aufbauen();
  }
  disconnectedCallback() { Glas.hoerer.delete(this._hoerer); clearInterval(this._takt); this.themaSetzen(false); }
  // Wie das bisherige Glas-Thema: gläserne Kopfleiste, normale HA-Karten rund und durchscheinend
  themaSetzen(an) {
    const d = istDunkel(this._hass), r = document.documentElement.style;
    const werte = { "--app-header-background-color": d ? "rgba(22,22,28,.7)" : "rgba(246,246,250,.7)", "--app-header-text-color": d ? "#f2f2f7" : "#1c1c1e",
      "--ha-card-border-radius": "22px", "--ha-card-background": d ? "rgba(44,44,52,.55)" : "rgba(255,255,255,.55)",
      "--ha-card-border-color": d ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.7)", "--ha-card-box-shadow": "none" };
    if (!an) { if (this._thema) { Object.keys(werte).forEach((k) => r.removeProperty(k)); this._thema = false; } return; }
    if (Glas.einst?.aussehen?.hintergrund === "aus") return this.themaSetzen(false);
    Object.entries(werte).forEach(([k, v]) => r.setProperty(k, v));
    this._thema = true;
  }
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
    const css = hintergrundCss(Glas.einst?.aussehen?.hintergrund || "klassisch", d);
    if (hg._css !== css) { hg._css = css; hg.style.background = css; this.themaSetzen(true); }
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
      else if (a.id === "favoriten" && (s.favoriten || []).some((f) => f.an !== false && (f.entity || listenKarte(f.karte)))) {
        const wrap = document.createElement("div");
        wrap.innerHTML = `<h2 class="h2 abschnitt-titel">Favoriten</h2><div class="fav"></div>`;
        wrap.style.display = "contents";
        const fav = wrap.querySelector(".fav");
        s.favoriten.filter((f) => f.an !== false && (f.entity || listenKarte(f.karte))).forEach((f, i) => {
          const kk = f.karte && listenKarte(f.karte);
          const k = kk ? this.kind(`fav${i}-${f.karte}`, kk[3], (e.bereiche || {})[f.karte] || {}) : this.kind(`fav${i}`, "glas-kachel-card", kachelCfg(f));
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
  const geraete = (r.geraete || raumGeraeteVorschlag(hass, r.bereich)).filter((g) => g.an !== false && (g.entity || g.karte));
  const cards = [];
  let gruppe = null;
  for (const g of geraete) {
    if (g.karte) { const k = listenKarteCfg(g); if (k) { cards.push({ type: "heading", heading: listenKarte(g.karte)[1], heading_style: "subtitle" }, k); gruppe = null; } continue; }
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
// ---------------------------------------------------------------------------
// Einstellungsseite „Glas“ (Seitenleiste): alles an einer Stelle, gilt auf allen Geräten
// ---------------------------------------------------------------------------
const EINST_CSS = `
:host{display:block;position:relative;min-height:100vh;min-height:100dvh;color:var(--g-text)}
.hg{position:fixed;inset:0;z-index:0;pointer-events:none}
.seite{position:relative;z-index:1;max-width:780px;margin:0 auto;padding:calc(12px + env(safe-area-inset-top)) var(--g-a4) 120px}
.oben{display:flex;align-items:center;gap:var(--g-a2);min-height:56px}
.oben h1{flex:1;margin:0;font-size:var(--g-s-titel);font-weight:800;letter-spacing:-.4px}
.status{font-size:var(--g-s-klein);color:var(--g-text2);transition:opacity .3s ease}
.menue{display:none}
:host([schmal]) .menue{display:flex}
.reiter{display:flex;gap:2px;padding:3px;border-radius:var(--g-r-pille);margin:var(--g-a2) 0 var(--g-a5);overflow-x:auto;scrollbar-width:none}
.reiter::-webkit-scrollbar{display:none}
.reiter button{flex:1 0 auto;min-height:36px;padding:0 var(--g-a4);border-radius:var(--g-r-pille);font-size:var(--g-s-klein);font-weight:600;color:var(--g-text);white-space:nowrap}
.reiter button[aria-selected="true"]{background:var(--g-aktiv);color:var(--g-aktiv-text)}
h2{margin:var(--g-a5) var(--g-a3) var(--g-a2);font-size:var(--g-s-klein);font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:var(--g-text2)}
h2:first-child{margin-top:0}
.gruppe{border-radius:var(--g-r-klein);overflow:hidden;background:var(--g-blatt);border:1px solid var(--g-glas-rand)}
.gruppe.form{padding:var(--g-a2) var(--g-a4) var(--g-a4)}
.fuss{margin:var(--g-a2) var(--g-a3) 0;font-size:var(--g-s-klein);color:var(--g-text2);line-height:1.4}
.zeile{position:relative;display:flex;align-items:center;gap:var(--g-a3);min-height:52px;padding:var(--g-a2) var(--g-a3) var(--g-a2) var(--g-a2);background:var(--g-blatt);
  transition:transform .2s cubic-bezier(.23,1,.32,1)}
.zeile + .zeile, .kopfzeile + .zeile{box-shadow:inset 0 1px 0 var(--g-trenn)}
.zeile.zieht{z-index:3;transition:none;box-shadow:0 10px 30px rgba(0,0,0,.22);border-radius:var(--g-r-klein)}
.zeile.aus .name{opacity:.45}
.zeile button.weiter{position:absolute;inset:0;z-index:0}
.zeile > *:not(.weiter){position:relative;z-index:1}
.griff{flex:none;width:32px;height:40px;display:flex;align-items:center;justify-content:center;color:var(--g-text2);cursor:grab;touch-action:none}
.griff:active{cursor:grabbing}
.sym{flex:none;width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:var(--g-fuell);color:var(--g-text)}
.name{flex:1;min-width:0}
.name b{display:block;font-size:var(--g-s-name);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.name span{display:block;font-size:var(--g-s-klein);color:var(--g-text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pfeil{flex:none;color:var(--g-text2)}
.kopfzeile{padding:var(--g-a2) var(--g-a4) 4px;font-size:var(--g-s-mini);font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--g-text2);background:var(--g-blatt)}
.segment{flex:none;display:flex;padding:2px;border-radius:9px;background:var(--g-fuell)}
.segment button{min-width:34px;height:30px;padding:0 8px;border-radius:7px;font-size:var(--g-s-klein);font-weight:600;color:var(--g-text)}
.segment button[aria-pressed="true"]{background:var(--g-an);color:#1c1c1e;box-shadow:0 1px 3px rgba(0,0,0,.15)}
.auswahl{flex:none;height:34px;padding:0 var(--g-a2);border-radius:9px;border:0;background:var(--g-fuell);color:var(--g-text);font:inherit;font-size:var(--g-s-klein)}
.schalter{flex:none;position:relative;width:51px;height:31px;border-radius:16px;background:var(--g-fuell);transition:background-color .2s ease}
.schalter::after{content:"";position:absolute;top:2px;left:2px;width:27px;height:27px;border-radius:50%;background:#fff;box-shadow:0 2px 4px rgba(0,0,0,.2);transition:transform .2s cubic-bezier(.23,1,.32,1)}
.schalter[aria-checked="true"]{background:var(--g-gruen-voll)}
.schalter[aria-checked="true"]::after{transform:translateX(20px)}
.klein-knopf{flex:none;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--g-text2)}
.extra{padding:0 var(--g-a4) var(--g-a4) 52px;background:var(--g-blatt)}
.aktionen{display:flex;flex-wrap:wrap;gap:var(--g-a2);margin-top:var(--g-a3)}
.knopf{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 var(--g-a4);border-radius:var(--g-r-pille);font-size:var(--g-s-name);font-weight:600;background:var(--g-fuell);color:var(--g-text)}
.knopf.haupt{background:var(--g-akzent-voll);color:#fff}
.knopf.rot{color:var(--g-rot-text)}
.zurueck{display:inline-flex;align-items:center;min-height:44px;margin-left:-8px;font-size:var(--g-s-text);color:var(--g-akzent)}
.personen-wahl{display:flex;flex-wrap:wrap;gap:var(--g-a2);margin-bottom:var(--g-a3)}
.hgs{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:var(--g-a3);padding:var(--g-a3)}
.hg-wahl{display:flex;flex-direction:column;gap:6px;align-items:stretch;font-size:var(--g-s-klein);font-weight:600;color:var(--g-text)}
.hg-wahl .muster{height:84px;border-radius:var(--g-r-klein);border:1px solid var(--g-glas-rand);display:flex;align-items:center;justify-content:center}
.hg-wahl .muster span{width:56%;height:38%;border-radius:10px;background:var(--g-glas);border:1px solid var(--g-glas-rand);-webkit-backdrop-filter:var(--g-blur);backdrop-filter:var(--g-blur)}
.hg-wahl[aria-pressed="true"] .muster{outline:3px solid var(--g-akzent);outline-offset:2px}
.hinzu{padding:var(--g-a2) var(--g-a4) var(--g-a3);background:var(--g-blatt);box-shadow:inset 0 1px 0 var(--g-trenn)}
.karten-hinzu{display:flex;flex-wrap:wrap;align-items:center;gap:var(--g-a2)}
.karten-hinzu .knopf ha-icon,.karte-zeile .name b ha-icon{--mdc-icon-size:18px}
.karte-zeile .name b{display:inline-flex;align-items:center;gap:6px}
.leise-zeile{padding:var(--g-a4);font-size:var(--g-s-klein);color:var(--g-text2);background:var(--g-blatt)}
@media (max-width:560px){
  .zeile.geraet{flex-wrap:wrap}
  .zeile.geraet .name{flex-basis:calc(100% - 140px)}
  .zeile.geraet .optionen{flex-basis:100%;min-width:0;padding-left:40px;display:flex;gap:var(--g-a2);align-items:center}
  .zeile.geraet .optionen .auswahl{flex:1;min-width:0}
}
.optionen{display:flex;gap:var(--g-a2);align-items:center}
.seite{position:relative}
.anzeige-knopf{display:inline-flex;align-items:center;gap:4px;cursor:pointer;white-space:nowrap;max-width:170px;overflow:hidden;text-overflow:ellipsis}
.anzeige-knopf ha-icon{--mdc-icon-size:16px;flex:none}
.menue-pop{position:absolute;z-index:30;min-width:220px;padding:6px;border-radius:var(--g-r-klein);background:var(--g-blatt);border:1px solid var(--g-glas-rand);
  box-shadow:0 12px 40px rgba(0,0,0,.2);-webkit-backdrop-filter:var(--g-blur);backdrop-filter:var(--g-blur);animation:pop-auf .16s cubic-bezier(.23,1,.32,1)}
@keyframes pop-auf{from{opacity:0;transform:scale(.96) translateY(-4px)}}
.menue-pop button{display:flex;align-items:center;gap:10px;width:100%;min-height:44px;padding:0 10px;border-radius:9px;font-size:var(--g-s-name);color:var(--g-text);text-align:left}
.menue-pop button:hover{background:var(--g-fuell)}
.menue-pop button[aria-checked="true"] ha-icon{color:var(--g-akzent)}
.menue-pop button[aria-checked="false"] ha-icon{color:var(--g-text2)}
`;
const GROESSEN = [["klein", "S", "Klein (1×1)"], ["breit", "M", "Breit (2×1)"], ["gross", "L", "Groß (2×2)"], ["ganz", "▭", "Ganze Breite"]];
const ANZEIGEN = [["zustand", "Zustand"], ["zustand_zuletzt", "Zustand + Zeit"], ["zuletzt", "Zuletzt geändert"], ["aus", "Nur Name"]];
const ANZEIGE_TEILE = [["name", "Name"], ["symbol", "Symbol"], ["zustand", "Zustand"], ["zuletzt", "Zuletzt geändert"], ["raum", "Raum / Bereich"]];
// alte Einstellung (zweite_zeile, name_zeigen …) in die Häkchen-Liste übersetzen
function anzeigeVon(x) {
  if (Array.isArray(x.anzeige)) return x.anzeige;
  const z = x.zweite_zeile || "zustand";
  return [x.name_zeigen !== false && "name", x.icon_zeigen !== false && "symbol", (z === "zustand" || z === "zustand_zuletzt") && "zustand", (z === "zuletzt" || z === "zustand_zuletzt") && "zuletzt"].filter(Boolean);
}
function anzeigeText(l) {
  const teile = ANZEIGE_TEILE.filter(([id]) => l.includes(id) && id !== "symbol" && id !== "name").map(([, t]) => (t === "Raum / Bereich" ? "Raum" : t === "Zuletzt geändert" ? "Zeit" : t));
  return teile.length ? teile.join(" + ") : l.includes("name") ? "Nur Name" : "Nur Symbol";
}
const slug = (s) => String(s || "").toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "raum";
const kopie = (o) => JSON.parse(JSON.stringify(o));

// Teile der vorhandenen Karten-Editoren wiederverwenden
class GlasPersonenEditor extends GlasKopfEditor { listen() { return super.listen().filter((l) => l.key === "personen"); } }
class GlasChipsEditor extends GlasKopfEditor { schema() { return []; } listen() { return super.listen().filter((l) => l.key === "chips"); } }

// Zeilen per Griff verschieben: folgt dem Finger 1:1, die anderen weichen aus
function ziehSortieren(liste, fertig) {
  liste.querySelectorAll(".griff").forEach((griff) => {
    griff.addEventListener("pointerdown", (ev) => {
      const zeile = griff.closest(".zeile");
      const zeilen = [...liste.querySelectorAll(":scope > .zeile[data-i]")];
      const von = zeilen.indexOf(zeile);
      if (von < 0) return;
      ev.preventDefault();
      griff.setPointerCapture(ev.pointerId);
      const start = ev.clientY, boxen = zeilen.map((z) => z.getBoundingClientRect()), hoehe = boxen[von].height;
      let nach = von;
      zeile.classList.add("zieht");
      const bewegen = (e) => {
        const dy = e.clientY - start;
        zeile.style.transform = `translateY(${dy}px)`;
        const mitte = boxen[von].top + hoehe / 2 + dy;
        nach = von;
        boxen.forEach((b, i) => { if (i < von && mitte < b.top + b.height / 2) nach = Math.min(nach, i); if (i > von && mitte > b.top + b.height / 2) nach = Math.max(nach, i); });
        zeilen.forEach((z, i) => {
          if (i === von) return;
          const weg = von < nach && i > von && i <= nach ? -hoehe : von > nach && i < von && i >= nach ? hoehe : 0;
          z.style.transform = weg ? `translateY(${weg}px)` : "";
        });
      };
      const los = () => {
        griff.removeEventListener("pointermove", bewegen);
        zeilen.forEach((z) => { z.style.transform = ""; z.classList.remove("zieht"); });
        if (nach !== von) fertig(von, nach);
      };
      griff.addEventListener("pointermove", bewegen);
      griff.addEventListener("pointerup", los, { once: true });
      griff.addEventListener("pointercancel", los, { once: true });
    });
    // Tastatur: Griff fokussieren, Pfeil hoch/runter
    griff.addEventListener("keydown", (e) => {
      const i = Number(griff.closest(".zeile").dataset.i), n = liste.querySelectorAll(":scope > .zeile[data-i]").length;
      if (e.key === "ArrowUp" && i > 0) { e.preventDefault(); fertig(i, i - 1); }
      if (e.key === "ArrowDown" && i < n - 1) { e.preventDefault(); fertig(i, i + 1); }
    });
  });
}
const verschieben = (arr, von, nach) => { const a = [...arr]; const [x] = a.splice(von, 1); a.splice(nach, 0, x); return a; };

class GlasEinstellungen extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._tab = "raeume";
    this._raum = null; // geöffneter Raum (Index)
    this._fuer = "alle";
    this._offen = new Set(); // aufgeklappte Geräte-Zeilen
  }
  set narrow(n) { this.toggleAttribute("schmal", !!n); }
  set panel(_) { /* */ }
  set route(_) { /* */ }
  set hass(h) {
    const erst = !this._hass;
    this._hass = h;
    Glas.hassSetzen(h);
    if (erst) this.start();
    else {
      this.shadowRoot.querySelectorAll("ha-form, .editor").forEach((f) => { f.hass = h; });
      this.shadowRoot.querySelectorAll("ha-state-icon[data-e]").forEach((el) => { el.hass = h; });
      this.hintergrund();
    }
  }
  get hass() { return this._hass; }
  async start() {
    this.shadowRoot.innerHTML = `<style>${TOKENS}${EINST_CSS}</style><div class="hg"></div><div class="seite"><div class="leise">Lädt …</div></div>`;
    this.hintergrund();
    // HA lädt Formular-Bausteine erst bei Bedarf: einmal einen Karten-Editor anfordern
    try {
      const hf = await window.loadCardHelpers();
      for (const cfg of [{ type: "entities", entities: [] }, { type: "tile", entity: "sun.sun" }]) {
        const k = await hf.createCardElement(cfg);
        await k.constructor.getConfigElement?.();
      }
    } catch (_) { /* geht auch ohne */ }
    const e = await Glas.einstLaden(this._hass);
    if (!e) {
      this.$(".seite").innerHTML = `<div class="gruppe leise-zeile">${Glas.einstFehler === "fehlt" ? "Die Integration „Glas-Dashboard“ ist nicht eingerichtet: Einstellungen › Geräte &amp; Dienste › Integration hinzufügen." : esc(Glas.einstFehler)}</div>`;
      return;
    }
    this._d = kopie(e);
    this._d.bereiche = this._d.bereiche || {};
    this._d.startseiten = this._d.startseiten || { alle: startseiteStandard() };
    this.zeichnen();
  }
  $(s) { return this.shadowRoot.querySelector(s); }
  $$(s) { return [...this.shadowRoot.querySelectorAll(s)]; }
  hintergrund() {
    const d = istDunkel(this._hass);
    this.toggleAttribute("dunkel", d);
    const hg = this.$(".hg");
    if (hg) hg.style.background = hintergrundCss(this._d?.aussehen?.hintergrund || Glas.einst?.aussehen?.hintergrund || "klassisch", d);
  }
  speichern() {
    clearTimeout(this._speicherT);
    const st = this.$(".status");
    if (st) st.textContent = "…";
    this._speicherT = setTimeout(async () => {
      try { await Glas.einstSpeichern(this._hass, kopie(this._d)); if (this.$(".status")) this.$(".status").textContent = "Gespeichert"; }
      catch (e) { if (this.$(".status")) this.$(".status").textContent = `Nicht gespeichert: ${e.message || e}`; }
    }, 450);
  }
  form(box, data, schema, labels, aendern, hilfen = {}) {
    const f = document.createElement("ha-form");
    f.hass = this._hass; f.data = data; f.schema = schema;
    f.computeLabel = (s) => labels[s.name] ?? s.name;
    f.computeHelper = (s) => hilfen[s.name];
    f.addEventListener("value-changed", (e) => { e.stopPropagation(); const v = { ...e.detail.value }; Object.keys(v).forEach((k) => { if (v[k] === "" || v[k] === undefined) delete v[k]; }); f.data = v; aendern(v, f); });
    box.appendChild(f);
    return f;
  }
  editor(box, tag, cfg, aendern) {
    const ed = document.createElement(tag);
    ed.classList.add("editor");
    ed.hass = this._hass;
    ed.setConfig({ type: `custom:${tag.replace("-editor", "")}`, ...cfg });
    ed.addEventListener("config-changed", (e) => { e.stopPropagation(); const { type, ...rest } = e.detail.config; aendern(rest); });
    box.appendChild(ed);
    return ed;
  }
  zeichnen() {
    const tabs = [["raeume", "Räume"], ["start", "Startseite"], ["personen", "Personen"], ["bereiche", "Bereiche"], ["aussehen", "Aussehen"]];
    const scroll = window.scrollY;
    this.$(".seite").innerHTML = `<div class="oben"><button class="klein-knopf menue" aria-label="Seitenleiste"><ha-icon data-i="mdi:menu"></ha-icon></button>
      <h1>Glas</h1><span class="status" aria-live="polite"></span></div>
      <div class="reiter glas" role="tablist">${tabs.map(([id, n]) => `<button role="tab" data-tab="${id}" aria-selected="${this._tab === id}">${n}</button>`).join("")}</div>
      <div class="inhalt"></div>`;
    this.$(".menue").addEventListener("click", () => fire(this, "hass-toggle-menu"));
    this.$$("[data-tab]").forEach((b) => b.addEventListener("click", () => { this._tab = b.dataset.tab; this._raum = null; this.zeichnen(); window.scrollTo(0, 0); }));
    const box = this.$(".inhalt");
    ({ raeume: () => (this._raum === null ? this.raeumeListe(box) : this.raumDetail(box)), start: () => this.startseite(box), personen: () => this.personen(box),
      bereiche: () => this.bereiche(box), aussehen: () => this.aussehen(box) })[this._tab]();
    this.$$("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
    this.$$("ha-state-icon[data-e]").forEach((el) => { el.hass = this._hass; el.stateObj = this._hass.states[el.dataset.e]; });
    window.scrollTo(0, scroll);
  }
  html(box, s) { box.insertAdjacentHTML("beforeend", s); return box.lastElementChild; }

  // ---------------- Räume ----------------
  raeumeListe(box) {
    const r = this._d.raeume || [];
    this.html(box, `<h2>Räume</h2>`);
    const g = this.html(box, `<div class="gruppe"></div>`);
    if (!r.length) g.innerHTML = `<div class="leise-zeile">Noch keine Räume. Übernimm sie aus Home Assistant oder füge einzeln hinzu.</div>`;
    r.forEach((raum, i) => {
      const n = (raum.geraete || []).filter((x) => x.an !== false).length;
      this.html(g, `<div class="zeile" data-i="${i}"><button class="weiter" data-raum="${i}" aria-label="${esc(raum.name)} bearbeiten"></button>
        <span class="griff" tabindex="0" role="button" aria-label="${esc(raum.name)} verschieben"><ha-icon data-i="mdi:drag-horizontal-variant"></ha-icon></span>
        <span class="sym"><ha-icon data-i="${esc(raum.icon || "mdi:door")}"></ha-icon></span>
        <span class="name"><b>${esc(raum.name)}</b><span>${n} ${n === 1 ? "Gerät" : "Geräte"}${raum.bereich ? ` · Bereich ${esc(this._hass.areas?.[raum.bereich]?.name || raum.bereich)}` : ""}</span></span>
        <ha-icon class="pfeil" data-i="mdi:chevron-right"></ha-icon></div>`);
    });
    ziehSortieren(g, (von, nach) => { this._d.raeume = verschieben(this._d.raeume, von, nach); this.speichern(); this.zeichnen(); });
    g.querySelectorAll("[data-raum]").forEach((b) => b.addEventListener("click", () => { this._raum = Number(b.dataset.raum); this.zeichnen(); window.scrollTo(0, 0); }));
    const hinzu = this.html(g, `<div class="hinzu"></div>`);
    this.form(hinzu, {}, [{ name: "bereich", selector: { area: {} } }], { bereich: "Raum aus HA-Bereich hinzufügen" }, (v) => {
      if (v.bereich) { this.raumNeu(v.bereich); this.speichern(); this._raum = this._d.raeume.length - 1; this.zeichnen(); }
    });
    const frei = Object.values(this._hass.areas || {}).filter((a) => !r.some((x) => x.bereich === a.area_id));
    const akt = this.html(box, `<div class="aktionen">${frei.length ? `<button class="knopf" data-alle>Alle ${frei.length} HA-Bereiche übernehmen</button>` : ""}
      <button class="knopf" data-leer>Raum ohne Bereich</button></div>`);
    akt.querySelector("[data-alle]")?.addEventListener("click", () => { frei.forEach((a) => this.raumNeu(a.area_id)); this.speichern(); this.zeichnen(); });
    akt.querySelector("[data-leer]").addEventListener("click", () => {
      this._d.raeume = [...r, { name: "Neuer Raum", hash: slug(`raum-${r.length + 1}`), icon: "mdi:door", geraete: [] }];
      this.speichern(); this._raum = this._d.raeume.length - 1; this.zeichnen();
    });
    this.html(box, `<div class="fuss">Die Geräte jedes Raums werden aus dem HA-Bereich vorgeschlagen. Im Raum kannst du sie an- und abwählen, verschieben und die Größe einstellen.</div>`);
  }
  raumNeu(bereich) {
    const a = this._hass.areas?.[bereich] || {};
    let hash = slug(a.name || bereich);
    while ((this._d.raeume || []).some((r) => r.hash === hash)) hash += "-2";
    this._d.raeume = [...(this._d.raeume || []), { name: a.name || bereich, icon: a.icon || "mdi:door", bereich, hash, geraete: raumGeraeteVorschlag(this._hass, bereich) }];
  }
  raumDetail(box) {
    const i = this._raum, raum = this._d.raeume[i];
    if (!raum) { this._raum = null; this.raeumeListe(box); return; }
    if (!raum.geraete) raum.geraete = raumGeraeteVorschlag(this._hass, raum.bereich);
    const z = this.html(box, `<button class="zurueck"><ha-icon data-i="mdi:chevron-left"></ha-icon>Räume</button>`);
    z.addEventListener("click", () => { this._raum = null; this.zeichnen(); });
    this.html(box, `<h2>${esc(raum.name)}</h2>`);
    const g = this.html(box, `<div class="gruppe form"></div>`);
    const { geraete, ...rest } = raum;
    this.form(g, { fenster_auto: true, alles_aus: true, ...rest }, [
      { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "icon", selector: { icon: {} } }] },
      { name: "bereich", selector: { area: {} } },
      { type: "grid", name: "", schema: [
        { name: "temperatur", selector: { entity: { filter: { domain: "sensor", device_class: "temperature" } } } },
        { name: "feuchte", selector: { entity: { filter: { domain: "sensor", device_class: "humidity" } } } }] },
      { name: "fenster_auto", selector: { boolean: {} } },
      { name: "alles_aus", selector: { boolean: {} } },
    ], { name: "Name", icon: "Symbol", bereich: "HA-Bereich", temperatur: "Temperatur im Kopf", feuchte: "Luftfeuchte im Kopf", fenster_auto: "Fenster und Türen oben als Chips", alles_aus: "Knopf „Alles aus“" }, (v) => {
      const neuBereich = v.bereich && v.bereich !== raum.bereich;
      Object.assign(raum, v);
      ["temperatur", "feuchte", "bereich"].forEach((k) => { if (!(k in v)) delete raum[k]; });
      if (neuBereich && !raum.geraete.length) raum.geraete = raumGeraeteVorschlag(this._hass, v.bereich);
      this.speichern();
      if (neuBereich) this.zeichnen();
    });
    this.html(box, `<h2>Geräte im Raum</h2>`);
    this.geraeteListe(box, raum.geraete, (neu) => { raum.geraete = neu; }, { gruppen: true, bereich: raum.bereich });
    const akt = this.html(box, `<div class="aktionen"><button class="knopf rot" data-weg>Raum entfernen</button></div>`);
    akt.querySelector("[data-weg]").addEventListener("click", () => {
      if (this._weg !== i) { this._weg = i; akt.querySelector("[data-weg]").textContent = "Wirklich entfernen?"; return; }
      this._weg = null; this._d.raeume.splice(i, 1); this._raum = null; this.speichern(); this.zeichnen();
    });
  }

  // Geräte-Liste (Räume und Favoriten): an/aus, verschieben, Größe, Anzeige, alles Weitere aufklappbar
  geraeteListe(box, liste, setzen, { gruppen = false, bereich = null } = {}) {
    const g = this.html(box, `<div class="gruppe"></div>`);
    const h = this._hass;
    if (!liste.length) g.innerHTML = `<div class="leise-zeile">Noch keine Geräte.</div>`;
    let letzte = null;
    liste.forEach((x, i) => {
      if (x.karte) { this.kartenZeile(g, liste, i, setzen, (l) => { liste = l; }); if (gruppen) letzte = null; return; }
      const st = h.states[x.entity];
      const gr = x.gruppe || gruppeVon(h, x.entity);
      if (gruppen && gr !== letzte) { letzte = gr; this.html(g, `<div class="kopfzeile">${esc((GRUPPEN.find(([id]) => id === gr) || [, "Sonstiges"])[1])}</div>`); }
      const an = x.an !== false, offen = this._offen.has(`${x.entity}|${i}`);
      const z = this.html(g, `<div class="zeile geraet ${an ? "" : "aus"}" data-i="${i}">
        <span class="griff" tabindex="0" role="button" aria-label="${esc(x.name || st?.attributes.friendly_name || x.entity)} verschieben"><ha-icon data-i="mdi:drag-horizontal-variant"></ha-icon></span>
        <button class="schalter" role="switch" aria-checked="${an}" aria-label="Zeigen"></button>
        <span class="name"><b>${esc(x.name || st?.attributes.friendly_name || x.entity)}</b><span>${st ? esc(Geraet.zustand(h, st, Geraet.regler(st))) : "nicht gefunden"}</span></span>
        <span class="optionen"><span class="segment" role="group" aria-label="Größe">${GROESSEN.map(([id, k, t]) => `<button data-g="${id}" title="${t}" aria-label="${t}" aria-pressed="${(x.groesse || "breit") === id}">${k}</button>`).join("")}</span>
        <span class="menue-wrap"><button class="auswahl anzeige-knopf" data-anzeige aria-haspopup="true" aria-expanded="false">${esc(anzeigeText(anzeigeVon(x)))}<ha-icon data-i="mdi:chevron-down"></ha-icon></button></span>
        <button class="klein-knopf" data-mehr aria-expanded="${offen}" aria-label="Mehr Einstellungen"><ha-icon data-i="mdi:${offen ? "chevron-up" : "dots-horizontal"}"></ha-icon></button></span></div>`);
      const neu = (teil) => { const l = [...liste]; l[i] = { ...l[i], ...teil }; setzen(l); liste = l; this.speichern(); };
      z.querySelector(".schalter").addEventListener("click", (e) => { const a = e.currentTarget.getAttribute("aria-checked") !== "true"; e.currentTarget.setAttribute("aria-checked", a); z.classList.toggle("aus", !a); neu({ an: a }); });
      z.querySelectorAll("[data-g]").forEach((b) => b.addEventListener("click", () => { z.querySelectorAll("[data-g]").forEach((o) => o.setAttribute("aria-pressed", o === b)); neu({ groesse: b.dataset.g }); }));
      z.querySelector("[data-anzeige]").addEventListener("click", (e) => {
        e.stopPropagation();
        const knopf = e.currentTarget;
        this.anzeigeMenue(knopf, anzeigeVon(liste[i]), (wahl) => { neu({ anzeige: wahl }); knopf.firstChild.textContent = anzeigeText(wahl); });
      });
      z.querySelector("[data-mehr]").addEventListener("click", () => { const k = `${x.entity}|${i}`; this._offen.has(k) ? this._offen.delete(k) : this._offen.add(k); this.zeichnen(); });
      if (offen) {
        const ex = this.html(g, `<div class="extra"></div>`);
        if (gruppen) this.form(ex, { gruppe: gr }, [{ name: "gruppe", selector: { select: { mode: "dropdown", options: GRUPPEN.map(([value, label]) => ({ value, label })) } } }], { gruppe: "Gruppe" }, (v) => { neu({ gruppe: v.gruppe }); this.zeichnen(); });
        this.editor(ex, "glas-kachel-card-editor", kachelCfg(x), (cfg) => { const l = [...liste]; l[i] = { an: x.an, gruppe: x.gruppe, ...cfg }; setzen(l); liste = l; this.speichern(); });
        const w = this.html(ex, `<div class="aktionen"><button class="knopf rot">Aus der Liste entfernen</button></div>`);
        w.querySelector("button").addEventListener("click", () => { const l = [...liste]; l.splice(i, 1); setzen(l); this.speichern(); this.zeichnen(); });
      }
    });
    ziehSortieren(g, (von, nach) => {
      const l = verschieben(liste, von, nach);
      // In eine andere Gruppe gezogen: Gerät übernimmt die Gruppe seines neuen Nachbarn
      if (gruppen && !l[nach].karte) { const n = [l[nach - 1], l[nach + 1]].find((y) => y?.entity); if (n) l[nach] = { ...l[nach], gruppe: n.gruppe || gruppeVon(h, n.entity) }; }
      setzen(l); this.speichern(); this.zeichnen();
    });
    const hinzu = this.html(g, `<div class="hinzu"></div>`);
    this.form(hinzu, {}, [{ name: "entity", selector: { entity: {} } }], { entity: "Gerät hinzufügen" }, (v) => {
      if (!v.entity) return;
      setzen([...liste, geraetVorschlag(h, v.entity)].map((y, k, a) => (k === a.length - 1 ? { ...y, an: true } : y)));
      this.speichern(); this.zeichnen();
    });
    const freie = LISTEN_KARTEN.filter(([id]) => !liste.some((y) => y.karte === id));
    if (freie.length) {
      const kz = this.html(g, `<div class="hinzu karten-hinzu"><span class="leise">Karte hinzufügen</span>${freie.map(([id, n, ic]) =>
        `<button class="knopf" data-karte="${id}"><ha-icon data-i="${ic}"></ha-icon>${n}</button>`).join("")}</div>`);
      kz.querySelectorAll("[data-karte]").forEach((b) => b.addEventListener("click", () => {
        setzen([...liste, { karte: b.dataset.karte, groesse: "breit", an: true }]); this.speichern(); this.zeichnen();
      }));
    }
    if (bereich) {
      const fehlen = raumGeraeteVorschlag(h, bereich).filter((v) => !liste.some((x) => x.entity === v.entity));
      if (fehlen.length) {
        const a = this.html(box, `<div class="aktionen"><button class="knopf">${fehlen.length} neue Geräte im Bereich übernehmen</button></div>`);
        a.querySelector("button").addEventListener("click", () => { setzen([...liste, ...fehlen]); this.speichern(); this.zeichnen(); });
      }
    }
  }

  // Zeile für eine ganze Karte (3D-Drucker, Robi): zeigen, verschieben, Größe, entfernen
  kartenZeile(g, liste, i, setzen, merken) {
    const x = liste[i], [id, titel, icon] = listenKarte(x.karte) || [x.karte, x.karte, "mdi:card-outline"];
    const b = (this._d.bereiche || {})[id] || {};
    const fertig = id === "drucker" ? !!(b.geraet || b.fortschritt) : !!b.entity;
    const an = x.an !== false;
    const z = this.html(g, `<div class="zeile geraet karte-zeile ${an ? "" : "aus"}" data-i="${i}">
      <span class="griff" tabindex="0" role="button" aria-label="${esc(titel)} verschieben"><ha-icon data-i="mdi:drag-horizontal-variant"></ha-icon></span>
      <button class="schalter" role="switch" aria-checked="${an}" aria-label="Zeigen"></button>
      <span class="name"><b><ha-icon data-i="${icon}"></ha-icon>${esc(titel)}-Karte</b><span>${fertig ? "Einstellungen unter Bereiche" : "Noch nicht eingerichtet: Bereiche öffnen"}</span></span>
      <span class="optionen"><span class="segment" role="group" aria-label="Größe">${[["breit", "M", "Halbe Breite"], ["ganz", "▭", "Ganze Breite"]].map(([gid, k, t]) =>
        `<button data-g="${gid}" title="${t}" aria-label="${t}" aria-pressed="${(x.groesse === "ganz" ? "ganz" : "breit") === gid}">${k}</button>`).join("")}</span>
        <button class="klein-knopf" data-bereich aria-label="${esc(titel)} einstellen"><ha-icon data-i="mdi:cog-outline"></ha-icon></button>
        <button class="klein-knopf" data-weg aria-label="Entfernen"><ha-icon data-i="mdi:close"></ha-icon></button></span></div>`);
    const neu = (teil) => { const l = [...liste]; l[i] = { ...l[i], ...teil }; setzen(l); merken(l); liste = l; this.speichern(); };
    z.querySelector(".schalter").addEventListener("click", (e) => { const a = e.currentTarget.getAttribute("aria-checked") !== "true"; e.currentTarget.setAttribute("aria-checked", a); z.classList.toggle("aus", !a); neu({ an: a }); });
    z.querySelectorAll("[data-g]").forEach((bt) => bt.addEventListener("click", () => { z.querySelectorAll("[data-g]").forEach((o) => o.setAttribute("aria-pressed", o === bt)); neu({ groesse: bt.dataset.g }); }));
    z.querySelector("[data-bereich]").addEventListener("click", () => { this._tab = "bereiche"; this._raum = null; this.zeichnen(); });
    z.querySelector("[data-weg]").addEventListener("click", () => { const l = [...liste]; l.splice(i, 1); setzen(l); this.speichern(); this.zeichnen(); });
  }

  // Kleines Menü mit Häkchen, schwebt unter dem Knopf
  anzeigeMenue(knopf, wahl, fertig) {
    this.$(".menue-pop")?.remove();
    const pop = document.createElement("div");
    pop.className = "menue-pop glas";
    pop.setAttribute("role", "menu");
    let aktuell = [...wahl];
    const zeichnen = () => {
      pop.innerHTML = ANZEIGE_TEILE.map(([id, t]) => `<button role="menuitemcheckbox" aria-checked="${aktuell.includes(id)}" data-t="${id}">
        <ha-icon data-i="${aktuell.includes(id) ? "mdi:check-circle" : "mdi:circle-outline"}"></ha-icon>${t}</button>`).join("");
      pop.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
      pop.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = b.dataset.t;
        aktuell = aktuell.includes(id) ? aktuell.filter((x) => x !== id) : ANZEIGE_TEILE.map(([k]) => k).filter((k) => k === id || aktuell.includes(k));
        if (!aktuell.length) aktuell = ["symbol"];
        fertig(aktuell);
        zeichnen();
      }));
    };
    zeichnen();
    const r = knopf.getBoundingClientRect(), seite = this.$(".seite").getBoundingClientRect();
    pop.style.top = `${r.bottom - seite.top + 6}px`;
    pop.style.right = `${Math.max(8, seite.right - r.right)}px`;
    this.$(".seite").appendChild(pop);
    knopf.setAttribute("aria-expanded", "true");
    pop.querySelector("button")?.focus();
    const zu = (e) => {
      if (e.type === "keydown" && e.key !== "Escape") return;
      if (e.type === "pointerdown" && pop.contains(e.composedPath()[0])) return;
      pop.remove(); knopf.setAttribute("aria-expanded", "false");
      this.shadowRoot.removeEventListener("pointerdown", zu, true); this.shadowRoot.removeEventListener("keydown", zu, true);
      if (e.type === "keydown") knopf.focus();
    };
    setTimeout(() => { this.shadowRoot.addEventListener("pointerdown", zu, true); this.shadowRoot.addEventListener("keydown", zu, true); }, 0);
  }

  // ---------------- Startseite ----------------
  startseite(box) {
    const leute = (this._d.personen || []).map((p, i) => ({ id: p.benutzer || p.name || `p${i}`, name: p.tablet ? "Tablet" : p.name || "Person" }));
    if (!leute.some((p) => p.id === this._fuer)) this._fuer = "alle";
    const wahl = this.html(box, `<div class="personen-wahl">${[{ id: "alle", name: "Für alle" }, ...leute].map((p) => `<button class="pille ${this._fuer === p.id ? "aktiv" : "glas"}" data-fuer="${esc(p.id)}" aria-pressed="${this._fuer === p.id}">${esc(p.name)}</button>`).join("")}</div>`);
    wahl.querySelectorAll("[data-fuer]").forEach((b) => b.addEventListener("click", () => { this._fuer = b.dataset.fuer; this.zeichnen(); }));
    const S = this._d.startseiten;
    if (this._fuer !== "alle") {
      const eigen = !!S[this._fuer] && S[this._fuer].eigen !== false;
      const g = this.html(box, `<div class="gruppe"><div class="zeile"><span class="name"><b>Eigene Startseite</b><span>${eigen ? "Diese Person hat eine eigene Startseite" : "Nutzt gerade „Für alle“"}</span></span>
        <button class="schalter" role="switch" aria-checked="${eigen}" aria-label="Eigene Startseite"></button></div></div>`);
      g.querySelector(".schalter").addEventListener("click", () => {
        if (eigen) S[this._fuer] = { ...S[this._fuer], eigen: false };
        else S[this._fuer] = { ...kopie(startseiteVon(this._d, null)), ...(S[this._fuer]?.abschnitte ? S[this._fuer] : {}), eigen: true };
        this.speichern(); this.zeichnen();
      });
      if (!eigen) return;
    }
    const s = (S[this._fuer] = startseiteVon(this._d, this._fuer === "alle" ? null : { id: this._fuer }));
    if (this._fuer !== "alle") s.eigen = true;
    this.html(box, `<h2>Abschnitte</h2>`);
    const g = this.html(box, `<div class="gruppe"></div>`);
    s.abschnitte.forEach((a, i) => {
      const [, name, icon] = ABSCHNITTE.find(([id]) => id === a.id) || [a.id, a.id, "mdi:square-outline"];
      const z = this.html(g, `<div class="zeile ${a.an ? "" : "aus"}" data-i="${i}">
        <span class="griff" tabindex="0" role="button" aria-label="${esc(name)} verschieben"><ha-icon data-i="mdi:drag-horizontal-variant"></ha-icon></span>
        <button class="schalter" role="switch" aria-checked="${!!a.an}" aria-label="${esc(name)} zeigen"></button>
        <span class="sym"><ha-icon data-i="${icon}"></ha-icon></span><span class="name"><b>${esc(name)}</b></span>
        <span class="segment" role="group" aria-label="Breite"><button data-b="halb" aria-pressed="${a.breite === "halb"}" title="Halbe Breite (am PC)">½</button><button data-b="ganz" aria-pressed="${a.breite !== "halb"}" title="Ganze Breite">Ganz</button></span></div>`);
      z.querySelector(".schalter").addEventListener("click", (e) => { a.an = !a.an; e.currentTarget.setAttribute("aria-checked", a.an); z.classList.toggle("aus", !a.an); this.speichern(); });
      z.querySelectorAll("[data-b]").forEach((b) => b.addEventListener("click", () => { a.breite = b.dataset.b; z.querySelectorAll("[data-b]").forEach((o) => o.setAttribute("aria-pressed", o === b)); this.speichern(); }));
    });
    ziehSortieren(g, (von, nach) => { s.abschnitte = verschieben(s.abschnitte, von, nach); this.speichern(); this.zeichnen(); });
    this.html(box, `<div class="fuss">Abschnitte ohne Einstellung (z. B. kein Saugroboter gewählt) bleiben automatisch weg. „½“ stellt am PC zwei nebeneinander.</div>`);
    this.html(box, `<h2>Favoriten</h2>`);
    this.geraeteListe(box, s.favoriten || [], (neu) => { s.favoriten = neu; });
    this.html(box, `<h2>Schnellzugriff</h2>`);
    const c = this.html(box, `<div class="gruppe form"></div>`);
    this.editor(c, "glas-chips-editor", { chips: s.chips || [] }, (cfg) => { s.chips = cfg.chips || []; this.speichern(); });
  }

  // ---------------- Personen ----------------
  personen(box) {
    this.html(box, `<h2>Personen und Begrüßung</h2>`);
    const g = this.html(box, `<div class="gruppe form"></div>`);
    this.editor(g, "glas-personen-editor", { gruss_modus: this._d.gruss_modus || "name", gruss_text: this._d.gruss_text, untertitel: this._d.untertitel, personen: this._d.personen || [] }, (cfg) => {
      Object.assign(this._d, { gruss_modus: cfg.gruss_modus, gruss_text: cfg.gruss_text, untertitel: cfg.untertitel, personen: cfg.personen || [] });
      this.speichern();
    });
    this.html(box, `<div class="fuss">Jede Person kann unter „Startseite“ eine eigene Startseite bekommen. Welche Person ein Gerät zeigt, merkt sich jedes Gerät selbst (das Tablet bleibt Tablet).</div>`);
  }

  // ---------------- Bereiche ----------------
  bereiche(box) {
    const B = this._d.bereiche;
    [["wetter", "Wetter", "glas-wetter-card-editor"], ["planer", "Planer heute", "glas-planer-card-editor"], ["sicherheit", "Sicherheit", "glas-sicherheit-card-editor"],
      ["drucker", "Drucker & Werkstatt", "glas-drucker-card-editor"], ["robi", "Robi", "glas-robi-card-editor"], ["gaeste", "Gäste", "glas-gaeste-card-editor"]].forEach(([id, titel, tag]) => {
      this.html(box, `<h2>${titel}</h2>`);
      const g = this.html(box, `<div class="gruppe form"></div>`);
      this.editor(g, tag, B[id] || {}, (cfg) => { B[id] = cfg; this.speichern(); });
    });
  }

  // ---------------- Aussehen ----------------
  aussehen(box) {
    const A = (this._d.aussehen = { modus: "auto", hintergrund: "klassisch", ...(this._d.aussehen || {}) });
    this.html(box, `<h2>Hell oder dunkel</h2>`);
    const m = this.html(box, `<div class="gruppe"><div class="zeile"><span class="name"><b>Darstellung</b><span>Automatisch folgt dem Handy bzw. HA</span></span>
      <span class="segment" role="group" aria-label="Darstellung">${[["auto", "Auto"], ["hell", "Hell"], ["dunkel", "Dunkel"]].map(([id, t]) => `<button data-m="${id}" aria-pressed="${A.modus === id}">${t}</button>`).join("")}</span></div></div>`);
    m.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { A.modus = b.dataset.m; Glas.einst = { ...(Glas.einst || {}), aussehen: { ...A } }; this.speichern(); this.hintergrund(); this.zeichnen(); }));
    this.html(box, `<h2>Hintergrund</h2>`);
    const d = istDunkel(this._hass);
    const hg = this.html(box, `<div class="gruppe"><div class="hgs">${[...Object.entries(HINTERGRUENDE).map(([id, x]) => [id, x.name]), ["tageszeit", "Nach Tageszeit"], ["aus", "Wie Home Assistant"]]
      .map(([id, n]) => `<button class="hg-wahl" data-hg="${id}" aria-pressed="${A.hintergrund === id}"><span class="muster" style="background:${hintergrundCss(id, d)}"><span></span></span>${esc(n)}</button>`).join("")}</div></div>`);
    hg.querySelectorAll("[data-hg]").forEach((b) => b.addEventListener("click", () => { A.hintergrund = b.dataset.hg; this.speichern(); this.hintergrund(); this.zeichnen(); }));
    this.html(box, `<div class="fuss">„Nach Tageszeit“: morgens warm, tagsüber wie bisher, abends See, nachts ruhig.</div>`);
    this.dashboardBlock(box);
  }
  async dashboardBlock(box) {
    this.html(box, `<h2>Dashboard</h2>`);
    const g = this.html(box, `<div class="gruppe"><div class="zeile"><span class="name"><b>Dashboard „Zuhause“</b><span class="info">Prüfe …</span></span><span class="knopf-platz"></span></div></div>`);
    this.html(box, `<div class="fuss">Baut sich komplett aus diesen Einstellungen auf. Du kannst die Glas-Karten aber auch weiterhin einzeln in jedes andere Dashboard legen.</div>`);
    const info = g.querySelector(".info"), platz = g.querySelector(".knopf-platz");
    let liste = [];
    try { liste = await this._hass.callWS({ type: "lovelace/dashboards/list" }); } catch (_) { info.textContent = "Nur Admins können Dashboards anlegen."; return; }
    const da = liste.find((x) => x.url_path === "glas-zuhause");
    if (da) { info.textContent = "Ist angelegt und in der Seitenleiste"; platz.innerHTML = `<a class="knopf haupt" href="/glas-zuhause" style="text-decoration:none">Öffnen</a>`; return; }
    info.textContent = "Noch nicht angelegt";
    platz.innerHTML = `<button class="knopf haupt">Anlegen</button>`;
    platz.querySelector("button").addEventListener("click", async () => {
      try {
        await this._hass.callWS({ type: "lovelace/dashboards/create", url_path: "glas-zuhause", title: "Zuhause", icon: "mdi:home-outline", show_in_sidebar: true, require_admin: false, mode: "storage" });
        await this._hass.callWS({ type: "lovelace/config/save", url_path: "glas-zuhause", config: { strategy: { type: "custom:glas" } } });
        info.textContent = "Angelegt – steht jetzt in der Seitenleiste";
        platz.innerHTML = `<a class="knopf haupt" href="/glas-zuhause" style="text-decoration:none">Öffnen</a>`;
      } catch (e) { info.textContent = `Ging nicht: ${e.message || e}`; }
    });
  }
}

// ---------------------------------------------------------------------------
// Dashboard-Strategie „custom:glas“: eine Seite, die sich aus den Einstellungen aufbaut
// ---------------------------------------------------------------------------
class GlasStrategie extends HTMLElement {
  static async generate() {
    return { title: "Zuhause", views: [{ title: "Zuhause", path: "zuhause", icon: "mdi:home-outline", type: "panel", cards: [{ type: "custom:glas-zuhause-card" }] }] };
  }
}
// ---------------------------------------------------------------------------
// Registrieren: Karten erscheinen in „Karte hinzufügen“ mit Vorschau
// ---------------------------------------------------------------------------
const KARTEN = [
  ["glas-kachel-card", GlasKachelCard, GlasKachelEditor, "Glas · Kachel", "Eine Kachel für jede Entität: Tippen schaltet, seitlich wischen dimmt, Symbol öffnet die große Steuerung."],
  ["glas-kopf-card", GlasKopfCard, GlasKopfEditor, "Glas · Kopf", "Begrüßung, Personenwahl (wer schaut) und Schnellzugriff-Chips."],
  ["glas-planer-card", GlasPlanerCard, GlasPlanerEditor, "Glas · Planer heute", "Aufgaben, Schicht und Termine von heute aus dem Planer, für die gewählte Person."],
  ["glas-wetter-card", GlasWetterCard, GlasWetterEditor, "Glas · Wetter", "Jetzt, die nächsten Stunden, aufklappbar 5 Tage, trocken oder nass."],
  ["glas-raumleiste-card", GlasRaumleisteCard, GlasRaumleisteEditor, "Glas · Raumleiste", "Schwebende Leiste unten mit allen Räumen."],
  ["glas-sicherheit-card", GlasSicherheitCard, GlasSicherheitEditor, "Glas · Sicherheit", "Alarmanlage scharf/unscharf, Fenster, Kamera, Verlauf."],
  ["glas-drucker-card", GlasDruckerCard, GlasDruckerEditor, "Glas · Drucker & Werkstatt", "3D-Drucker: Fortschritt, Kamera, Steuerung, Warteschlange und knappes Filament aus der Filament-Werkstatt."],
  ["glas-robi-card", GlasRobiCard, GlasRobiEditor, "Glas · Robi", "Saugroboter: Akku, alles oder einzelne Räume saugen, Saugstärke, Station."],
  ["glas-gaeste-card", GlasGaesteCard, GlasGaesteEditor, "Glas · Gäste", "WLAN-QR-Code zum Scannen, optional ein zweiter Code."],
  ["glas-zuhause-card", GlasZuhauseCard, GlasZuhauseEditor, "Glas · Zuhause (alles)", "Das ganze Dashboard aus den Glas-Einstellungen: Kopf, Startseite der gewählten Person, Räume."],
  ["glas-raum-card", GlasRaumCard, GlasRaumEditor, "Glas · Raum-Blatt", "Blatt von unten mit beliebigen Karten, öffnet über die Raumleiste."],
];
window.customCards = window.customCards || [];
for (const [tag, Karte, Editor, name, beschreibung] of KARTEN) {
  if (!customElements.get(tag)) customElements.define(tag, Karte);
  if (!customElements.get(`${tag}-editor`)) customElements.define(`${tag}-editor`, Editor);
  if (!window.customCards.some((k) => k.type === tag)) window.customCards.push({ type: tag, name, description: beschreibung, preview: true, documentationURL: "https://github.com/Corineye/glas-dashboard" });
}
for (const [tag, K] of [["glas-personen-editor", GlasPersonenEditor], ["glas-chips-editor", GlasChipsEditor], ["glas-einstellungen", GlasEinstellungen], ["ll-strategy-dashboard-glas", GlasStrategie]]) {
  if (!customElements.get(tag)) customElements.define(tag, K);
}
console.info(`%c GLAS-DASHBOARD %c ${VERSION} `, "color:#fff;background:#0a84ff;font-weight:700;border-radius:4px 0 0 4px;padding:2px 6px", "color:#0a84ff;background:#e8f1ff;border-radius:0 4px 4px 0;padding:2px 6px");
})();
