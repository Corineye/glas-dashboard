/* Glas-Dashboard – Karten im Glas-Look für Home Assistant. Gebaut aus src/, nicht direkt bearbeiten. */
(() => {
// ---------------------------------------------------------------------------
// Glas-Dashboard · Grundbausteine (Design-Tokens, Helfer, Personen, Portale)
// ---------------------------------------------------------------------------
const VERSION = "0.10.0";

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
:focus:not(:focus-visible){outline:none}
@media (pointer:fine){button:focus-visible,[tabindex]:focus-visible{outline:2px solid var(--g-akzent);outline-offset:2px}}
@media (pointer:coarse){:focus{outline:none}}
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
// ---------------------------------------------------------------------------
// Zentrale Einstellungen (Integration „Glas-Dashboard“, gespeichert auf dem Pi)
// Personen · Räume mit Geräten · Startseite pro Person · Bereiche · Aussehen
// ---------------------------------------------------------------------------
const ABSCHNITTE = [
  ["wetter", "Wetter", "mdi:weather-partly-cloudy", "ganz"], ["planer", "Planer & Kalender", "mdi:calendar-check", "ganz"],
  ["favoriten", "Favoriten", "mdi:star-outline", "ganz"], ["sicherheit", "Sicherheit", "mdi:shield-home-outline", "ganz"],
  ["drucker", "Drucker & Werkstatt", "mdi:printer-3d-nozzle", "halb"], ["robi", "Robi", "mdi:robot-vacuum", "halb"],
  ["gaeste", "Gäste", "mdi:qrcode", "ganz"], ["zuhause", "Zuhause-Status (Widget)", "mdi:home-heart", "halb"],
];
// Ganze Karten, die man wie ein Gerät in Räume und Favoriten legen kann.
// [id, Name, Symbol, Element, eigen]: eigen = Einstellungen im Eintrag selbst (mehrfach möglich), sonst gemeinsam unter Bereiche
const LISTEN_KARTEN = [["drucker", "3D-Drucker", "mdi:printer-3d-nozzle", "glas-drucker-card", false], ["robi", "Robi", "mdi:robot-vacuum", "glas-robi-card", false],
  ["bild", "Bild & QR-Code", "mdi:qrcode", "glas-bild-card", true], ["kamera", "Kamera", "mdi:cctv", "glas-kamera-card", true]];
const listenKarte = (id) => LISTEN_KARTEN.find(([k]) => k === id);
function listenKarteCfg(x) {
  const k = listenKarte(x.karte);
  if (!k) return null;
  return { type: `custom:${k[3]}`, ...(k[4] ? { ...(x.cfg || {}), groesse: x.groesse || "gross" } : (Glas.einst?.bereiche || {})[x.karte] || {}) };
}
// Anzeigename eines Karten-Eintrags
function listenKarteName(x) {
  const k = listenKarte(x.karte);
  return x.cfg?.titel || x.cfg?.name || (x.karte === "kamera" && x.cfg?.entity && Glas.hass?.states[x.cfg.entity]?.attributes.friendly_name) || k?.[1] || "Karte";
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
// Fenster/Türen eines Raums, die oben als Chips erscheinen können
const CHIP_KLASSEN = ["window", "door", "opening", "garage_door", "moisture", "smoke"];
function raumFensterAuto(hass, bereich) {
  return bereich ? entitaetenImBereich(hass, bereich, ["binary_sensor"]).filter((e) => CHIP_KLASSEN.includes(hass.states[e].attributes.device_class)) : [];
}
function raumFensterAlle(hass, r) { return [...new Set([...raumFensterAuto(hass, r.bereich), ...(r.fenster || [])])]; }
function raumFensterGezeigt(hass, r) {
  const auto = raumFensterAuto(hass, r.bereich), aus = r.fenster_auto === false ? auto : r.fenster_aus || [];
  return raumFensterAlle(hass, r).filter((e) => !(auto.includes(e) && aus.includes(e)));
}
// gezeigt = Liste der Sensoren, die oben stehen sollen; der Rest des Bereichs wird gemerkt als ausgeblendet
function raumFensterSetzen(hass, r, gezeigt) {
  const auto = raumFensterAuto(hass, r.bereich);
  delete r.fenster_auto;
  const aus = auto.filter((e) => !gezeigt.includes(e)), extra = gezeigt.filter((e) => !auto.includes(e));
  if (aus.length) r.fenster_aus = aus; else delete r.fenster_aus;
  if (extra.length) r.fenster = extra; else delete r.fenster;
}
function einstStandard() {
  return { version: 1, personen: [], gruss_modus: "name", raeume: [], startseiten: { alle: startseiteStandard() }, bereiche: {},
    aussehen: { modus: "auto", hintergrund: "klassisch" } };
}
function startseiteStandard() {
  return { abschnitte: ABSCHNITTE.map(([id, , , breite]) => ({ id, an: id !== "zuhause", breite, ...(id === "zuhause" ? { widget: true } : {}) })), favoriten: [], chips: [] };
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
      const ist = (a.current_temperature != null ? ` · ${String(a.current_temperature).replace(".", ",")}°` : "") + (a.current_humidity != null ? ` · ${Math.round(a.current_humidity)} %` : "");
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
// – Öffnen/Schließen mit echten Federn (Geschwindigkeit des Fingers wird übernommen)
// – folgt dem Finger am Griff, am Kopf und im Inhalt (wenn ganz oben), jederzeit greifbar
// – schließt bei Wischen nach unten, Escape, Tippen daneben
// ---------------------------------------------------------------------------
// Feder wie bei Apple (Antwortzeit + Dämpfung). Liefert den Verlauf 0→1 in 60-Hz-Schritten,
// damit der Browser die Bewegung als fertige Keyframes auf der Grafikkarte abspielt (kein JS pro Bild).
function federVerlauf(v0 = 0, { antwort = 0.42, daempfung = 1 } = {}) {
  const k = (2 * Math.PI / antwort) ** 2, c = (4 * Math.PI * daempfung) / antwort, dt = 1 / 240;
  let x = -1, v = v0; const werte = [0];
  for (let t = 0; t < 1.6; t += 1 / 60) {
    for (let j = 0; j < 4; j++) { v += (-k * x - c * v) * dt; x += v * dt; }
    werte.push(1 + x);
    if (Math.abs(x) < 0.0015 && Math.abs(v) < 0.02) break;
  }
  werte[werte.length - 1] = 1;
  return { werte, dauer: Math.max(1, werte.length - 1) * (1000 / 60) };
}
const SCHICHT_BREIT = matchMedia("(min-width:900px)");
const SCHICHT_RUHIG = matchMedia("(prefers-reduced-motion: reduce)");
// Gummiband wie iOS: je weiter, desto zäher
const gummi = (x, d = 80) => (x < 0 ? -1 : 1) * (1 - 1 / ((Math.abs(x) * 0.55) / d + 1)) * d;

const SCHICHT_CSS = `
.dimm{position:fixed;inset:0;z-index:7;background:rgba(0,0,0,.3);opacity:0;touch-action:none}
.blatt{position:fixed;left:0;right:0;bottom:0;z-index:8;margin:0 auto;max-width:560px;max-height:calc(100% - 48px);
  display:flex;flex-direction:column;border-radius:var(--g-r-blatt) var(--g-r-blatt) 0 0;background:var(--g-blatt);
  border-top:1px solid var(--g-glas-rand);-webkit-backdrop-filter:var(--g-blur);backdrop-filter:var(--g-blur);
  box-shadow:var(--g-schatten-gross);translate:0 110vh;transform-origin:50% 0;
  padding-bottom:env(safe-area-inset-bottom)}
/* Unter einem weiteren Blatt rückt das alte leicht nach hinten (Karten-Stapel wie iOS) */
@media (max-width:899px){.blatt{transition:scale .5s cubic-bezier(.32,.72,0,1);-webkit-backdrop-filter:none;backdrop-filter:none;background:rgb(246,246,250);contain:layout paint style}
  .wurzel.dunkel .blatt{background:rgb(28,28,32)}.blatt.hinten{scale:.94}
  .blatt.bewegt .inhalt{-webkit-mask-image:none;mask-image:none}}
.blatt.bewegt{will-change:translate,scale,opacity}
.blatt.breit{max-width:min(1000px,100%)}
.blatt.hoch{height:calc(100% - 48px)}
/* Unten auf dem Bildschirm „verlängert“ sich das Blatt, damit beim Hochziehen nie eine Lücke sichtbar wird */
.blatt::after{content:"";position:absolute;left:0;right:0;top:100%;height:120px;background:inherit}
@media (min-width:900px){.blatt{bottom:auto;top:50%;transform:translateY(-50%);border-radius:var(--g-r-blatt);translate:none;opacity:0;transform-origin:50% 50%}
  .blatt::after{display:none}
  .blatt.hoch{height:auto;max-height:min(86vh,900px);min-height:320px}.griff{height:16px;visibility:hidden}}
.griff{flex:none;height:32px;display:flex;align-items:center;justify-content:center;touch-action:none;cursor:grab}
.griff span{width:38px;height:5px;border-radius:3px;background:var(--g-text2);opacity:.45}
.inhalt{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:0 var(--g-a4) var(--g-a5);display:flex;flex-direction:column;gap:var(--g-a4);scrollbar-width:none}
.inhalt::-webkit-scrollbar{display:none}
/* Kopf steht fest über dem Inhalt (eigene Zeile im Blatt), der Inhalt läuft darunter weich aus – keine Farbfläche, nichts springt.
   Sobald gescrollt wird, blendet eine feine Trennlinie ein. */
.kopf-platz{position:relative;flex:none;padding:0 var(--g-a4)}
.kopf-platz::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:var(--g-text2);opacity:0;transform:scaleY(.5);transition:opacity .2s ease}
.kopf-platz.gerollt::after{opacity:.18}
.kopf{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--g-a3);padding:0 var(--g-a1) var(--g-a2);touch-action:none}
.kopf-text{display:flex;flex-direction:column;gap:2px;min-width:0;padding-top:2px}
.titel{margin:0;font-size:var(--g-s-titel);font-weight:800;letter-spacing:-.4px;line-height:1.15;color:var(--g-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.unter{font-size:var(--g-s-name);font-weight:500;color:var(--g-text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.inhalt{-webkit-mask-image:linear-gradient(transparent 0,#000 12px);mask-image:linear-gradient(transparent 0,#000 12px);padding-top:var(--g-a3)}
.kopf-knoepfe{display:flex;gap:var(--g-a2);flex:none}
.stern{transition:transform .16s cubic-bezier(.23,1,.32,1)}
.stern:active{transform:scale(.9)}
.stern.an{color:#ff9f0a}
.stern.hupf ha-icon{animation:stern-hupf .3s cubic-bezier(.34,1.56,.64,1)}
@keyframes stern-hupf{from{transform:scale(.6)}}
`;

class GlasSchicht {
  constructor({ quelle, hoch = false, titel = "", zu, stern = null }) {
    this.stern = stern; // { entity } oder { karte }: Stern im Kopf = zu Favoriten
    this.quelle = quelle; // Karte, von der Ereignisse an HA weitergehen
    this.zu = zu;
    this.host = document.createElement("div");
    this.host.style.cssText = "position:relative;z-index:7";
    this.root = this.host.attachShadow({ mode: "open" });
    this.root.innerHTML = `<style>${TOKENS.replace(":host{", ".wurzel{").replace(":host([dunkel]){", ".wurzel.dunkel{")}${SCHICHT_CSS}</style>
      <div class="wurzel"><div class="dimm"></div><div class="blatt ${hoch ? "hoch" : ""}" role="dialog" aria-modal="true" aria-label="${esc(titel)}">
      <div class="griff" aria-hidden="true"><span></span></div><div class="kopf-platz"></div><div class="inhalt"></div></div></div>`;
    this.wurzel = this.root.querySelector(".wurzel");
    this.blatt = this.root.querySelector(".blatt");
    this.dimm = this.root.querySelector(".dimm");
    this.inhalt = this.root.querySelector(".inhalt");
    this.kopfPlatz = this.root.querySelector(".kopf-platz");
    this._lageWert = 1; // 0 = offen, 1 = zu (Anteil der Blatthöhe bzw. Einblendung am PC)
    this.dimm.addEventListener("click", () => this.schliessen());
    // Escape schließt nur das oberste Blatt
    this._taste = (e) => { if (e.key === "Escape" && GlasSchicht.stapel[GlasSchicht.stapel.length - 1] === this) { e.stopImmediatePropagation(); this.schliessen(); } };
    this.ziehen();
    // Trennlinie unter dem Kopf, sobald der Inhalt gescrollt ist (nur Klasse umschalten, kein Layout)
    this.inhalt.addEventListener("scroll", () => {
      const g = this.inhalt.scrollTop > 2;
      if (g !== this._gerollt) { this._gerollt = g; this.kopfPlatz.classList.toggle("gerollt", g); }
    }, { passive: true });
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

  // --- Lage: 0 = ganz offen, 1 = ganz zu. Handy: Verschiebung nach unten. PC: Einblenden + leichtes Wachsen.
  _hoehe() { return (this.blatt.offsetHeight || 400) + 24; }
  _stil(lage) {
    if (SCHICHT_BREIT.matches) {
      const p = 1 - lage;
      return [{ opacity: String(klemmen(p * 1.8, 0, 1)), scale: String(0.94 + 0.06 * p), translate: `0 ${(1 - p) * 16}px` }, { opacity: String(klemmen(p, 0, 1)) }];
    }
    return [{ translate: `0 ${lage * this._hoehe()}px`, opacity: "1", scale: "" }, { opacity: String(klemmen(1 - lage, 0, 1)) }];
  }
  _setzen(lage) {
    this._lageWert = lage;
    const [b, d] = this._stil(lage);
    Object.assign(this.blatt.style, b);
    this.dimm.style.opacity = d.opacity;
  }
  // Laufende Federn anhalten und die Lage übernehmen, die gerade zu sehen ist (zum Greifen mitten in der Bewegung)
  _anhalten() {
    if (!this._anim) return;
    const t = this._anim[0].currentTime ?? 0;
    const w = this._kurve, i = Math.min(w.length - 1, Math.round(t / (1000 / 60)));
    const lage = this._vonNach[0] + (this._vonNach[1] - this._vonNach[0]) * w[i];
    this._anim.forEach((a) => a.cancel());
    this._anim = null;
    this.blatt.classList.remove("bewegt");
    this._setzen(lage);
  }
  // Feder von der aktuellen Lage nach `ziel`; v = Geschwindigkeit in Lage-Einheiten pro Sekunde
  _feder(ziel, v = 0, opt) {
    this._anhalten();
    const von = this._lageWert;
    if (SCHICHT_RUHIG.matches) {
      // Weniger Bewegung: nur weich überblenden
      this._lageWert = ziel;
      Object.assign(this.blatt.style, { translate: "0 0", scale: "", opacity: ziel ? "0" : "1" });
      this.dimm.style.opacity = ziel ? "0" : "1";
      const bild = [{ opacity: ziel ? 1 : 0 }, { opacity: ziel ? 0 : 1 }], z = { duration: 200, easing: "ease" };
      const a = this.blatt.animate(bild, z); this.dimm.animate(bild, z);
      return a.finished.catch(() => {});
    }
    const spanne = ziel - von;
    if (Math.abs(spanne) < 0.0005) { this._setzen(ziel); return Promise.resolve(); }
    const { werte, dauer } = federVerlauf(v / spanne, opt);
    const bilder = werte.map((p) => this._stil(von + spanne * p));
    this._setzen(ziel); // Endzustand steht fest, die Animation spielt nur den Weg dorthin
    this.blatt.classList.add("bewegt");
    const z = { duration: dauer, easing: "linear" };
    const anim = [this.blatt.animate(bilder.map((b) => b[0]), z), this.dimm.animate(bilder.map((b) => b[1]), z)];
    this._anim = anim; this._kurve = werte; this._vonNach = [von, ziel];
    return anim[0].finished.then(() => { if (this._anim === anim) { this._anim = null; this.blatt.classList.remove("bewegt"); } }, () => {});
  }

  oeffnen() {
    portalWurzel().appendChild(this.host);
    const darunter = GlasSchicht.stapel[GlasSchicht.stapel.length - 1];
    if (darunter && !SCHICHT_BREIT.matches) darunter.blatt.classList.add("hinten");
    GlasSchicht.stapel.push(this);
    this._vorher = document.activeElement;
    document.addEventListener("keydown", this._taste);
    this._setzen(1);
    // Inhalt (Symbole, eingebettete Karten) darf sich noch einen Moment setzen, dann federt das Blatt hoch
    requestAnimationFrame(() => {
      if (this._weg) return;
      this._feder(0, 0, SCHICHT_BREIT.matches ? { antwort: 0.38, daempfung: 0.82 } : { antwort: 0.46, daempfung: 1 });
      this.blatt.querySelector("[data-zu]")?.focus({ preventScroll: true, focusVisible: false });
    });
  }
  schliessen(v = 0) {
    if (this._weg) return;
    this._weg = true;
    GlasSchicht.stapel = GlasSchicht.stapel.filter((x) => x !== this);
    GlasSchicht.stapel[GlasSchicht.stapel.length - 1]?.blatt.classList.remove("hinten");
    document.removeEventListener("keydown", this._taste);
    this.dimm.style.pointerEvents = "none";
    this.blatt.style.pointerEvents = "none";
    this._feder(1, v, SCHICHT_BREIT.matches ? { antwort: 0.26, daempfung: 1 } : { antwort: 0.36, daempfung: 1 })
      .then(() => { this.host.remove(); this.zu?.(); });
    try { this._vorher?.focus?.({ preventScroll: true }); } catch (_) { /* */ }
  }

  // Ziehen: am Griff und Kopf (Maus + Finger), im Inhalt mit dem Finger, wenn er ganz oben ist.
  // Das Blatt bleibt unter dem Finger, nach oben mit Gummiband; beim Loslassen entscheidet Weg + Schwung.
  ziehen() {
    let z = null;
    const beginnen = (y) => {
      this._anhalten();
      z = { y0: y, lage0: this._lageWert, h: this._hoehe(), punkte: [[performance.now(), y]] };
    };
    const bewegen = (y) => {
      const dy = y - z.y0 + z.lage0 * z.h;
      const px = dy < 0 ? gummi(dy) : dy;
      this._setzen(px / z.h);
      const jetzt = performance.now();
      z.punkte.push([jetzt, y]);
      while (z.punkte.length > 2 && jetzt - z.punkte[0][0] > 90) z.punkte.shift();
    };
    const enden = () => {
      if (!z) return;
      const s = z; z = null;
      const [t0, y0] = s.punkte[0], [t1, y1] = s.punkte[s.punkte.length - 1];
      const v = t1 - t0 > 0 ? ((y1 - y0) / (t1 - t0)) * 1000 : 0; // px/s
      const lage = this._lageWert, ziel = lage * s.h + v * 0.22; // wohin der Schwung trägt
      this._gezogen = performance.now();
      if ((ziel > s.h * 0.42 && v > -200) || v > 1100) this.schliessen(v / s.h);
      else this._feder(0, v / s.h, { antwort: 0.4, daempfung: lage < 0 ? 1 : 0.9 });
    };
    // Maus/Stift/Finger an Griff und Kopf
    for (const el of [this.root.querySelector(".griff"), this.kopfPlatz]) {
      el.addEventListener("pointerdown", (e) => {
        if (e.button > 0 || SCHICHT_BREIT.matches || this._weg) return;
        if (e.target.closest("button,input,select,textarea,a,[role=button]")) return;
        el.setPointerCapture(e.pointerId);
        beginnen(e.clientY); z.ptr = e.pointerId; z.aktiv = false;
      });
      el.addEventListener("pointermove", (e) => {
        if (!z || z.ptr !== e.pointerId) return;
        if (!z.aktiv) { if (Math.abs(e.clientY - z.y0) < 4) return; z.aktiv = true; z.y0 = e.clientY; }
        bewegen(e.clientY);
      });
      const los = (e) => { if (z && z.ptr === e.pointerId) { if (z.aktiv) enden(); else { z = null; this._feder(this._lageWert > 0.5 ? 1 : 0); } } };
      el.addEventListener("pointerup", los);
      el.addEventListener("pointercancel", los);
    }
    // Inhalt: ganz oben nach unten ziehen nimmt das Blatt mit (wie iOS); sonst normales Scrollen
    const SPERRE = "input,select,textarea,[role=slider],.saeule,.rad,.luefter,.deckel,[data-kein-ziehen]";
    let t = null;
    this.inhalt.addEventListener("touchstart", (e) => {
      if (SCHICHT_BREIT.matches || this._weg || e.touches.length > 1 || e.target.closest?.(SPERRE)) { t = null; return; }
      const p = e.touches[0];
      t = { x: p.clientX, y: p.clientY, modus: null };
    }, { passive: true });
    this.inhalt.addEventListener("touchmove", (e) => {
      if (!t) return;
      const p = e.touches[0], dx = p.clientX - t.x, dy = p.clientY - t.y;
      if (!t.modus) {
        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
        t.modus = dy > 0 && Math.abs(dy) > Math.abs(dx) && this.inhalt.scrollTop <= 0 ? "blatt" : "scroll";
        if (t.modus === "blatt") beginnen(p.clientY);
      }
      if (t.modus !== "blatt") return;
      e.preventDefault();
      bewegen(Math.max(p.clientY, z.y0)); // im Inhalt nicht über die Ausgangslage hinaus nach oben
    }, { passive: false });
    const touchEnde = () => { if (t?.modus === "blatt") enden(); t = null; };
    this.inhalt.addEventListener("touchend", touchEnde);
    this.inhalt.addEventListener("touchcancel", touchEnde);
    // Nach einem Zug keinen versehentlichen Klick auf einen Knopf unter dem Finger auslösen
    this.blatt.addEventListener("click", (e) => { if (performance.now() - (this._gezogen || 0) < 350) { e.stopPropagation(); e.preventDefault(); } }, true);
  }
  // Kopf: Titel, Untertitel, Knöpfe. Wird von kopfBinden in die feste Kopfzeile über dem Inhalt gesetzt.
  kopfHtml(titel, unter, knoepfe = "") {
    return `<div class="kopf"><div class="kopf-text"><h2 class="titel">${esc(titel)}</h2>${unter ? `<div class="unter">${esc(unter)}</div>` : ""}</div>
      <div class="kopf-knoepfe">${knoepfe}${this.sternHtml()}<button class="rund" data-zu aria-label="Schließen"><ha-icon data-i="mdi:close"></ha-icon></button></div></div>`;
  }
  // Stern: in die Favoriten der Person, die gerade schaut (bzw. „Für alle“)
  _favZugriff() { return typeof listeZugriff === "function" && Glas.einst ? listeZugriff({ art: "fav", person: Glas.aktuellePerson(Glas.hass) }) : null; }
  _istFav() {
    const z = this._favZugriff(), x = this.stern;
    return !!z && z.lesen(Glas.hass).some((f) => f.an !== false && (x.entity ? f.entity === x.entity : f.karte === x.karte));
  }
  sternHtml() {
    if (!this.stern || !this._favZugriff()) return "";
    const an = this._istFav();
    return `<button class="rund stern ${an ? "an" : ""}" data-stern aria-pressed="${an}" aria-label="${an ? "Aus Favoriten entfernen" : "Zu Favoriten"}"><ha-icon data-i="mdi:${an ? "star" : "star-outline"}"></ha-icon></button>`;
  }
  sternUmschalten(knopf) {
    const z = this._favZugriff(), x = this.stern, h = Glas.hass;
    if (!z) return;
    const an = !this._istFav();
    knopf.classList.toggle("an", an); knopf.setAttribute("aria-pressed", an);
    knopf.setAttribute("aria-label", an ? "Aus Favoriten entfernen" : "Zu Favoriten");
    knopf.querySelector("ha-icon").icon = an ? "mdi:star" : "mdi:star-outline";
    knopf.classList.remove("hupf"); void knopf.offsetWidth; if (an) knopf.classList.add("hupf");
    const gleich = (f) => (x.entity ? f.entity === x.entity : f.karte === x.karte);
    z.schreiben(h, (liste) => {
      if (!an) return liste.filter((f) => !gleich(f));
      const da = liste.findIndex(gleich);
      if (da >= 0) return liste.map((f, i) => (i === da ? { ...f, an: true } : f));
      return [...liste, x.entity ? { ...geraetVorschlag(h, x.entity), an: true, groesse: "breit" } : { karte: x.karte, groesse: "breit", an: true }];
    });
  }
  kopfBinden() {
    const kopf = this.inhalt.querySelector(".kopf");
    if (kopf) {
      this.kopfPlatz.replaceChildren(kopf);
      kopf.querySelector("[data-zu]")?.addEventListener("click", () => this.schliessen());
      kopf.querySelector("[data-stern]")?.addEventListener("click", (e) => this.sternUmschalten(e.currentTarget));
      kopf.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
    }
    this.inhalt.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
  }
  // Suche im ganzen Blatt (Kopf + Inhalt)
  $(q) { return this.kopfPlatz.querySelector(q) || this.inhalt.querySelector(q); }
}
GlasSchicht.stapel = [];
// ---------------------------------------------------------------------------
// Große Steuerung: öffnet beim Tippen aufs Symbol oder langem Drücken
// Regler-Säule, Farben, Temperatur, Rollo, Medien – je nach Gerätetyp
// ---------------------------------------------------------------------------
const STEUER_CSS = `
.mitte{display:flex;gap:var(--g-a5);align-items:center;justify-content:center;padding:var(--g-a2) 0}
.saeule{position:relative;flex:none;width:96px;height:250px;border-radius:28px;overflow:hidden;touch-action:none;cursor:ns-resize;background:var(--g-fuell)}
.saeule .fuell{position:absolute;inset:0;background:var(--f,#ff9f0a);transform-origin:bottom;will-change:transform}
.wert{font-size:44px;font-weight:300;line-height:1;color:var(--g-text);text-align:center;font-variant-numeric:tabular-nums}
.anzeige-gross{display:flex;flex-direction:column;align-items:center;gap:var(--g-a2);padding:var(--g-a2) 0}
.gross-sym{width:88px;height:88px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--g-fuell);color:var(--g-fuell-text);--mdc-icon-size:44px}
.gross-sym.an{background:var(--sf);color:#fff;box-shadow:0 0 28px 2px color-mix(in srgb,var(--sf) 55%,transparent)}
.gross-sym ha-state-icon{--mdc-icon-size:44px}
.reihe{display:flex;gap:var(--g-a2);justify-content:center;flex-wrap:wrap}
.farben{display:flex;align-items:center;justify-content:center;gap:var(--g-a3)}
.farbe{position:relative;width:48px;height:48px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.08)}
.farbe[aria-pressed="true"]::after{content:"";position:absolute;inset:-5px;border-radius:50%;border:2.5px solid var(--g-text)}
.farbe-trenn{width:1px;height:28px;background:var(--g-trenn)}
.farbe.rad-knopf{background:conic-gradient(from 90deg,#ff3b30,#ffcc00,#34c759,#30b0c7,#0a84ff,#5e5ce6,#ff2d55,#ff3b30)}
.farbe.rad-knopf span{position:absolute;inset:11px;border-radius:50%;background:var(--g-blatt);display:flex;align-items:center;justify-content:center;color:var(--g-text)}
.farbe.rad-knopf ha-icon{--mdc-icon-size:16px}
.rad-feld{display:flex;justify-content:center;padding:var(--g-a2) 0;animation:aufklappen .28s cubic-bezier(.32,.72,0,1)}
@keyframes aufklappen{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:none}}
.schalter{position:relative;width:96px;height:58px;border-radius:29px;background:var(--g-fuell);transition:background-color .25s ease}
.schalter[aria-pressed="true"]{background:var(--g-gruen)}
.schalter span{position:absolute;top:4px;left:4px;width:50px;height:50px;border-radius:50%;background:#fff;box-shadow:0 3px 8px rgba(0,0,0,.25);
  transition:transform .25s cubic-bezier(.32,.72,0,1)}
.schalter[aria-pressed="true"] span{transform:translateX(38px)}
.gross-rund{width:56px;height:56px;border-radius:50%;font-size:28px;background:var(--g-fuell);color:var(--g-text);display:flex;align-items:center;justify-content:center}
.zeile-knopf{display:inline-flex;align-items:center;justify-content:center;gap:2px;min-height:48px;padding:0 var(--g-a4);border-radius:var(--g-r-klein);font-size:var(--g-s-name);font-weight:600;color:var(--g-text)}
.raum-knopf{display:grid;place-items:center}
.raum-knopf > span{grid-area:1/1;transition:opacity .25s ease,transform .25s cubic-bezier(.23,1,.32,1)}
.raum-knopf.an .rk-aus,.raum-knopf.aus .rk-an{opacity:0;transform:translateY(6px)}
@media (prefers-reduced-motion:reduce){.raum-knopf > span{transition:opacity .2s ease;transform:none!important}}
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

`;

// Vier ruhige Lichtstimmungen von warm bis kalt (statt bunter Punkte); bunte Farben über das Farbrad
const LICHT_FARBEN = [["Gemütlich", 2200, [255, 147, 41], "#ffa24a"], ["Warmweiß", 2700, [255, 180, 107], "#ffc98f"],
  ["Neutral", 4000, [255, 228, 206], "#fff0e0"], ["Tageslicht", 6000, [235, 242, 255], "#e4eeff"]];
const lichtFarbeDaten = (st, f) => ((st.attributes.supported_color_modes || []).includes("color_temp") ? { color_temp_kelvin: f[1] } : { rgb_color: f[2] });
// Welche Vorwahl gerade aktiv ist (Farbtemperatur ±250 K)
const lichtFarbeAktiv = (st, f) => st.attributes.color_mode === "color_temp" && Math.abs(Number(st.attributes.color_temp_kelvin || 0) - f[1]) <= 250;
const HVAC = { off: "Aus", heat: "Heizen", cool: "Kühlen", auto: "Auto", heat_cool: "Heizen/Kühlen", dry: "Trocknen", fan_only: "Lüften" };

// Heizung mit eigenem Temperatur-/Feuchtesensor: Messwerte im Zustand ersetzen
function mitSensoren(h, st, cfg) {
  if (!st || domainVon(st.entity_id) !== "climate" || !(cfg?.temp_sensor || cfg?.feuchte_sensor)) return st;
  const t = cfg.temp_sensor && h.states[cfg.temp_sensor], f = cfg.feuchte_sensor && h.states[cfg.feuchte_sensor];
  const ok = (x) => x && !isNaN(Number(x.state)) && x.state !== "";
  return { ...st, attributes: { ...st.attributes, ...(ok(t) ? { current_temperature: Number(t.state) } : {}), ...(ok(f) ? { current_humidity: Number(f.state) } : {}) } };
}
// Welche Verläufe die große Ansicht zeigt (cfg.verlauf === false schaltet ihn ab)
// Einträge mit „@“ sind Attribute: climate.x@current_temperature = Raumtemperatur des Thermostats
function verlaufIds(entityId, cfg) {
  if (cfg.verlauf === false) return [];
  const d = domainVon(entityId);
  if (d === "climate") {
    const st = Glas.hass?.states[entityId];
    return [cfg.temp_sensor || (st?.attributes.current_temperature != null ? `${entityId}@current_temperature` : null), cfg.feuchte_sensor,
      st?.attributes.hvac_action != null ? `${entityId}@hvac_action` : null].filter(Boolean);
  }
  if (["weather", "camera", "button", "scene", "script", "image", "update", "event"].includes(d)) return [];
  return [entityId];
}

function steuerungOeffnen(quelle, entityId, cfg = {}) {
  const s = new GlasSchicht({ quelle, titel: cfg.name || entityId, stern: { entity: entityId }, zu: () => { Glas.hassHoerer.delete(neu); clearInterval(takt); } });
  let letzter = null;
  // nur neu zeichnen, wenn sich diese Entität geändert hat
  let letzterTimer = null;
  const sig = () => [entityId, cfg.temp_sensor, cfg.feuchte_sensor].map((e) => (e && Glas.hass?.states[e]?.last_updated) || "").join("|");
  const neu = () => { if (sig() !== letzter || Glas.timer?.[entityId] !== letzterTimer) zeichnen(); };
  // Verlauf (wird einmal geladen, Zeitraum umschaltbar)
  const vIds = verlaufIds(entityId, cfg);
  const vZustand = { auf: cfg.verlauf_offen ?? ["sensor", "binary_sensor"].includes(domainVon(entityId)), stunden: cfg.verlauf_tage ? 168 : 24, daten: null };
  let radAuf = false, letztePct = null;
  const vLaden = async () => { vZustand.daten = null; zeichnen(); vZustand.daten = await verlaufHolen(Glas.hass, vIds, vZustand.stunden); zeichnen(); };
  const takt = setInterval(() => { letzterTimer = undefined; neu(); }, 30e3);
  let ziehen = false;
  const zeichnen = () => {
    if (ziehen) return;
    const h = Glas.hass, st = mitSensoren(h, h?.states[entityId], cfg);
    if (!st) return;
    letzter = sig();
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
    } else if (d === "climate") {
      const soll = a.temperature != null ? String(a.temperature).replace(".", ",") + "°" : "–";
      mitte = `<button class="gross-rund" data-t="-" aria-label="Kälter">−</button><div style="text-align:center"><div class="wert">${st.state === "off" ? "Aus" : soll}</div>
        <div class="leise">Raum jetzt ${a.current_temperature != null ? String(a.current_temperature).replace(".", ",") + " °" : "–"}${a.current_humidity != null ? ` · ${Math.round(a.current_humidity)} % Luftfeuchte` : ""}</div></div>
        <button class="gross-rund" data-t="+" aria-label="Wärmer">+</button>`;
    } else if (Geraet.schaltbar(st) || Geraet.ausloesbar(st)) {
      mitte = `<button class="schalter" data-schalten aria-pressed="${an}" aria-label="${esc(name)} ${an ? "ausschalten" : "einschalten"}"><span></span></button>`;
    } else {
      // Sensoren, Fenster, Bewegung: großes Symbol + Zustand, darunter der Verlauf
      const warn = Geraet.istWarnung(st);
      mitte = `<div class="anzeige-gross"><span class="gross-sym ${an || warn ? "an" : ""}" style="--sf:${warn ? FARBEN[warn] : Geraet.farbe(st)}"><ha-state-icon></ha-state-icon></span>
        <div class="wert">${esc(zustandText(h, st))}</div><div class="leise">seit ${esc(relativeZeit(st.last_changed).replace(/^vor /, ""))}</div></div>`;
    }
    let extra = "";
    if (d === "light") { // Lichtstimmungen auch bei Aus zeigen: Antippen schaltet mit dieser Farbe ein
      const modes = a.supported_color_modes || [];
      const farbig = modes.some((m) => ["hs", "rgb", "rgbw", "rgbww", "xy"].includes(m));
      const temp = modes.includes("color_temp");
      if (farbig || temp) {
        extra += `<div class="farben">${LICHT_FARBEN.map((f, i) => {
          const akt = st.state === "on" && lichtFarbeAktiv(st, f);
          return `<button class="farbe" data-farbe="${i}" style="background:${f[3]}" aria-label="${f[0]}" title="${f[0]}" aria-pressed="${akt}"></button>`;
        }).join("")}${farbig ? `<span class="farbe-trenn" aria-hidden="true"></span><button class="farbe rad-knopf" data-radauf aria-expanded="${radAuf}" aria-label="Eigene Farbe wählen" title="Eigene Farbe"><span><ha-icon data-i="mdi:${radAuf ? "chevron-up" : "palette-outline"}"></ha-icon></span></button>` : ""}</div>`;
        if (farbig && radAuf) {
          const [hu, sa] = a.hs_color || [30, 0];
          const w = (hu - 90) * Math.PI / 180, r = klemmen(sa, 0, 100) / 2;
          const farbeJetzt = a.hs_color ? `hsl(${hu},100%,${100 - sa / 2}%)` : "#fff";
          const pos = `left:${50 + Math.cos(w) * r}%;top:${50 + Math.sin(w) * r}%;background:${farbeJetzt}`;
          extra += `<div class="rad-feld"><div class="rad" aria-label="Farbe wählen" role="img"><span class="marke" style="${pos}"></span><span class="lupe" style="${pos}"></span></div></div>`;
        }
      }
      if (bereich && entitaetenImBereich(h, bereich, ["light"]).length > 1) {
        // ein Knopf, zwei Texte: blendet beim Ein-/Ausschalten weich über statt zu springen
        const vorher = (Glas._raumKnopf ||= {})[entityId] ?? st.state;
        extra += `<button class="zeile-knopf glas raum-knopf ${vorher === "on" ? "an" : "aus"}" data-raumfarbe data-soll="${st.state === "on" ? "an" : "aus"}">
          <span class="rk-an">Diese Farbe für alle Lichter im Raum</span><span class="rk-aus">Alle Lichter im Raum ausschalten</span></button>`;
        Glas._raumKnopf[entityId] = st.state;
      }
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
    if (vIds.length) extra += verlaufKlappHtml(h, vIds, vZustand);
    extra += `<button class="zeile-knopf glas" data-ha>Mehr in Home Assistant<ha-icon class="pfeil-r" data-i="mdi:chevron-right" aria-hidden="true"></ha-icon></button>`;
    s.inhalt.innerHTML = `<style>${STEUER_CSS}${VERLAUF_CSS}</style>${s.kopfHtml(name, [raum, Geraet.zustand(h, st, reg)].filter(Boolean).join(" · "))}
      <div class="mitte">${mitte}</div>${extra}`;
    s.kopfBinden();
    // Säule gleitet vom alten zum neuen Wert (Ein/Aus, Dimmen von außen)
    const fuellEl = s.inhalt.querySelector(".saeule .fuell");
    const pctJetzt = reg ? (Geraet.istAn(st) ? klemmen(reg.pct, 0, 100) : 0) : null;
    if (fuellEl && letztePct != null && letztePct !== pctJetzt) {
      fuellEl.style.transition = "none";
      fuellEl.style.transform = `scaleY(${letztePct / 100})`;
      fuellEl.getBoundingClientRect();
      fuellEl.style.transition = "transform .32s cubic-bezier(.23,1,.32,1)";
      fuellEl.style.transform = `scaleY(${pctJetzt / 100})`;
    }
    letztePct = pctJetzt;
    const $ = (q) => s.inhalt.querySelector(q), $$ = (q) => [...s.inhalt.querySelectorAll(q)];
    $$("[data-schalten]").forEach((b) => b.addEventListener("click", () => {
      // sofort sichtbar: Säule läuft nach unten bzw. nach oben, HA bestätigt danach
      if (fuellEl && reg) {
        const ziel = an ? 0 : klemmen(reg.pct || 100, 1, 100);
        fuellEl.style.transition = "transform .32s cubic-bezier(.23,1,.32,1)";
        fuellEl.style.transform = `scaleY(${ziel / 100})`;
        letztePct = ziel;
      }
      Geraet.schalten(h, st);
    }));
    $("[data-ha]").addEventListener("click", () => { s.schliessen(); mehrInfo(quelle, entityId); });
    verlaufKlappBinden(s.inhalt, vZustand, vLaden, zeichnen);
    $$("[data-farbe]").forEach((b) => b.addEventListener("click", () => h.callService("light", "turn_on", { entity_id: entityId, ...lichtFarbeDaten(st, LICHT_FARBEN[b.dataset.farbe]) })));
    $("[data-radauf]")?.addEventListener("click", () => { radAuf = !radAuf; zeichnen(); });
    $$("[data-hvac]").forEach((b) => b.addEventListener("click", () => h.callService("climate", "set_hvac_mode", { entity_id: entityId, hvac_mode: b.dataset.hvac })));
    $("[data-eco]")?.addEventListener("click", () => h.callService("climate", "set_temperature", { entity_id: entityId, temperature: 17, hvac_mode: "heat" }));
    $$("[data-timer]").forEach((b) => b.addEventListener("click", () => {
      const m = Number(b.dataset.timer), vorher = Number(Glas._timerWahl?.[entityId] || 0);
      const neuM = m && vorher === m && Glas.timer?.[entityId] ? 0 : m; // gleicher Knopf nochmal = Timer aus
      Glas._timerWahl = { ...(Glas._timerWahl || {}), [entityId]: neuM };
      if (neuM && !an) Geraet.schalten(h, st);
      Glas.timerSetzen(h, entityId, neuM).catch(() => {});
    }));
    const rk = $("[data-raumfarbe]");
    if (rk) requestAnimationFrame(() => requestAnimationFrame(() => {
      rk.classList.toggle("an", rk.dataset.soll === "an"); rk.classList.toggle("aus", rk.dataset.soll !== "an");
      rk.querySelector(".rk-an").setAttribute("aria-hidden", rk.dataset.soll !== "an"); rk.querySelector(".rk-aus").setAttribute("aria-hidden", rk.dataset.soll === "an");
    }));
    rk?.addEventListener("click", () => {
      const ziel = entitaetenImBereich(h, bereich, ["light"]);
      if (rk.dataset.soll !== "an") { h.callService("light", "turn_off", { entity_id: ziel }); return; }
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
    s.inhalt.querySelectorAll(".gross-sym ha-state-icon").forEach((el) => { el.hass = h; el.stateObj = st; if (cfg.icon) el.icon = cfg.icon; });
    const saeule = $(".saeule");
    if (saeule && reg) {
      let p = reg.pct;
      const setze = (e) => {
        const r = saeule.getBoundingClientRect();
        p = klemmen(((r.bottom - e.clientY) / r.height) * 100, 0, 100);
        saeule.firstElementChild.style.transform = `scaleY(${p / 100})`;
        saeule.setAttribute("aria-valuenow", Math.round(p)); saeule.setAttribute("aria-valuetext", reg.text(p));
        s.kopfPlatz.querySelector(".unter").textContent = [raum, reg.text(p)].filter(Boolean).join(" · ");
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
  if (vIds.length && vZustand.auf) vLaden();
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
  background:var(--g-fuell);color:var(--g-fuell-text);transition:background-color .2s ease,box-shadow .35s ease}
.an .symbol{background:var(--sf);color:#fff;box-shadow:0 0 16px 1px color-mix(in srgb,var(--sf) 60%,transparent)}
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
  entitaeten() { return [this._config.entity, ...(this._config.zusatz || []), this._config.temp_sensor, this._config.feuchte_sensor].filter(Boolean); }
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
    const h = this._hass, c = this._config, st = mitSensoren(h, h.states[c.entity], c);
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
      if (art === "tap" && v.anzeige) { steuerungOeffnen(this, c.entity, c); return; } // eigene große Ansicht mit Verlauf
      // Langes Drücken: Vorschau wie iOS (abschaltbar mit vorschau: false)
      if (art === "hold" && c.vorschau !== false && typeof vorschauOeffnen === "function") { this._vorschau = vorschauOeffnen(this, c); if (this._vorschau) return; }
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
      timer = setTimeout(() => { if (ges && !ges.zieh && !ges.weg) { ges.lang = true; this._vorschau = null; ausfuehren("hold"); } }, 480);
    });
    el.addEventListener("pointermove", (e) => {
      if (ges?.lang) { this._vorschau?.ziehen(e.clientX, e.clientY); return; }
      if (!ges) return;
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
      if (g.lang) { if (!abbruch) this._vorschau?.loslassen(); this._vorschau = null; return; }
      if (abbruch || g.weg) return;
      const art = g.zone === "icon" ? "icon" : "tap";
      if (c.double_tap_action?.action && art === "tap") {
        const jetzt = Date.now();
        if (jetzt - letzterTipp < 280) { clearTimeout(tippTimer); letzterTipp = 0; ausfuehren("double"); return; }
        letzterTipp = jetzt; tippTimer = setTimeout(() => ausfuehren("tap"), 280); return;
      }
      ausfuehren(art);
    };
    // Nach dem langen Drücken scrollt der Finger nicht mehr, sondern wählt in der Vorschau
    el.addEventListener("touchmove", (e) => { if (ges?.lang && e.cancelable) e.preventDefault(); }, { passive: false });
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
      ...(domainVon(c.entity || "") === "climate" ? [{ type: "expandable", flatten: true, name: "gruppe_klima", title: "Heizung: eigene Sensoren", icon: "mdi:thermometer", schema: [
        { type: "grid", name: "", schema: [
          { name: "temp_sensor", selector: { entity: { filter: { domain: "sensor", device_class: "temperature" } } } },
          { name: "feuchte_sensor", selector: { entity: { filter: { domain: "sensor", device_class: "humidity" } } } }] }] }] : []),
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
      zusatz: "Weitere Entitäten (kleine Chips)", temp_sensor: "Temperatursensor (statt Thermostat)", feuchte_sensor: "Luftfeuchtesensor", ...AKTIONEN_LABELS };
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
.aktiv-rund{background:var(--g-akzent-voll);color:#fff}
.insel-platz{flex:1;min-width:0;align-self:stretch;margin-left:calc(-1 * var(--g-a3))}
/* Läuft etwas, bleibt mindestens Platz für die kleine Insel (nur das Symbol) */
:host([insel]) .insel-platz{min-width:44px;margin-left:0}
.rechts{display:flex;align-items:center;gap:var(--g-a2);flex:none}
.bearb-zeile{display:flex;align-items:center;gap:var(--g-a2);margin-top:var(--g-a3);padding:var(--g-a2) var(--g-a3);border-radius:var(--g-r-klein);
  font-size:var(--g-s-klein);line-height:1.4;color:var(--g-text)}
.bearb-zeile ha-icon{flex:none;color:var(--g-akzent)}
.chip ha-state-icon,.chip ha-icon{--mdc-icon-size:16px;color:var(--cf)}
/* Großer Titel: schrumpft beim Scrollen (nur transform/opacity, folgt dem Finger) */
.gruss{transform-origin:0 50%}
/* Kleine Glas-Blase oben links: Avatar + Name, kein Stift, keine volle Leiste */
.blase{position:fixed;z-index:5;top:calc(var(--header-height,0px) + env(safe-area-inset-top,0px) + var(--g-a2));left:var(--blase-x,var(--g-a4));
  display:flex;align-items:center;gap:var(--g-a2);max-width:calc(100vw - 32px);min-height:44px;padding:5px var(--g-a4) 5px 5px;border-radius:var(--g-r-pille);
  box-shadow:0 6px 24px rgba(0,0,0,.12);color:var(--g-text);font-size:var(--g-s-name);font-weight:650;letter-spacing:-.2px;white-space:nowrap;
  transform-origin:0 50%;opacity:0;visibility:hidden;pointer-events:none;transform:translate3d(0,-6px,0) scale(.72);
  transition:transform .32s cubic-bezier(.32,.72,0,1),opacity .16s ease,visibility 0s linear .32s}
.blase.zu{opacity:1;visibility:visible;pointer-events:auto;transform:none;
  transition:transform .42s cubic-bezier(.34,1.3,.64,1),opacity .16s ease,visibility 0s}
@supports (transition-timing-function:linear(0,1)){
  /* echte Feder (leichtes Nachschwingen wie iOS) */
  .blase.zu{transition-timing-function:linear(0,.009,.035 2.1%,.141 4.4%,.723 12.9%,.938 16.7%,1.017 19.6%,1.067 22.4%,1.088 25.4%,1.084 28.6%,1.064 32.1%,1.017 40.5%,.998 47.5%,.995 54.5%,1 70%,1),ease,linear}
}
:host([dunkel]) .blase{box-shadow:0 6px 24px rgba(0,0,0,.4)}
.blase .ava{flex:none;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  background:var(--g-aktiv);color:var(--g-aktiv-text);font-size:var(--g-s-klein);font-weight:700}
.blase .ava ha-icon{--mdc-icon-size:18px}
.blase.zu:active{transform:scale(.96);transition-duration:.12s}
.blase .bt{overflow:hidden;text-overflow:ellipsis}
`;
const BEWEGUNG_REDUZIERT = matchMedia("(prefers-reduced-motion: reduce)");

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
  connectedCallback() {
    super.connectedCallback();
    if (!this._scrollHoerer) {
      let wartet = false;
      this._scrollHoerer = () => { if (!wartet) { wartet = true; requestAnimationFrame(() => { wartet = false; this.titelFolgen(); }); } };
      this._groesseHoerer = () => { this._kopfH = null; this._scrollHoerer(); };
    }
    if (!this._inselHoerer) this._inselHoerer = () => { const an = !!Glas.inselAktiv && !(parseFloat(getComputedStyle(this).getPropertyValue("--header-height")) || 0); if (an !== this.hasAttribute("insel")) { this.toggleAttribute("insel", an); } this._scrollHoerer(); };
    addEventListener("glas-insel-aktiv", this._inselHoerer);
    requestAnimationFrame(() => this._inselHoerer());
    addEventListener("scroll", this._scrollHoerer, { passive: true });
    addEventListener("resize", this._groesseHoerer, { passive: true });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    removeEventListener("scroll", this._scrollHoerer);
    removeEventListener("glas-insel-aktiv", this._inselHoerer);
    removeEventListener("resize", this._groesseHoerer);
  }
  // Großer Titel folgt dem Scrollen (wird kleiner und blasser); ab der Hälfte federt die Blase oben links heraus.
  // Pro Bild nur ein Messen (getBoundingClientRect), danach nur transform/opacity schreiben.
  titelFolgen() {
    const g = this.$(".gruss"), b = this.$(".blase");
    if (!g || !b) return;
    if (this._kopfH == null) this._kopfH = parseFloat(getComputedStyle(this).getPropertyValue("--header-height")) || 0;
    const r = g.parentNode.getBoundingClientRect(); // .oben wird nicht verwandelt, misst also ehrlich
    if (!r.height) return; // gerade nicht sichtbar
    const ruhe = r.top + scrollY; // Lage des Titels ohne Scrollen
    const weg = scrollY - Math.max(0, ruhe - this._kopfH - 24); // wie weit der Titel schon nach oben gewandert ist
    const p = klemmen(weg / 64, 0, 1);
    if (p !== this._p) {
      this._p = p;
      g.style.transform = p && !BEWEGUNG_REDUZIERT.matches ? `scale(${(1 - p * 0.18).toFixed(4)})` : "";
      g.style.opacity = p ? (1 - p).toFixed(3) : "";
    }
    // Freie Fläche zwischen Begrüßung und Knöpfen: dort sitzt die Dynamic Island (keine eigene Zeile)
    const pl = this.$(".insel-platz")?.getBoundingClientRect();
    if (pl) {
      const P = { x: Math.round(pl.left + pl.width / 2 + scrollX), y: Math.round(pl.top + pl.height / 2 + scrollY), w: Math.round(pl.width) };
      if (JSON.stringify(P) !== JSON.stringify(Glas.inselPlatz)) { Glas.inselPlatz = P; window.dispatchEvent(new CustomEvent("glas-insel-platz")); }
    }
    const x = Math.round(Math.max(8, r.left - 4));
    if (x !== this._x) { this._x = x; b.style.setProperty("--blase-x", x + "px"); }
    // Kleiner Abstand (Hysterese), damit die Blase am Umschaltpunkt nicht flackert
    const zu = this._zu ? p > 0.4 : p > 0.6;
    if (zu !== this._zu) { this._zu = zu; Glas.blaseZu = zu; window.dispatchEvent(new CustomEvent("glas-blase", { detail: zu })); b.classList.toggle("zu", zu); b.setAttribute("aria-hidden", String(!zu)); b.tabIndex = zu ? 0 : -1; }
  }
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
    const stift = istAdmin(h) && Glas.einst && c.bearbeiten_knopf !== false
      ? (Glas.bearbeiten ? `<button class="rund aktiv-rund" data-bearb aria-label="Bearbeiten beenden"><ha-icon data-i="mdi:check"></ha-icon></button>` : `<button class="rund glas" data-bearb aria-label="Dashboard bearbeiten"><ha-icon data-i="mdi:pencil-outline"></ha-icon></button>`) : "";
    const ava = ich?.tablet ? `<ha-icon data-i="mdi:tablet"></ha-icon>` : ich ? esc(String(ich.kurz || "").slice(0, 2)) : `<ha-icon data-i="mdi:home"></ha-icon>`;
    const blase = `<button class="blase glas" data-blase aria-hidden="true" tabindex="-1" aria-label="${esc(gruss)}, nach oben"><span class="ava" aria-hidden="true">${ava}</span><span class="bt">${esc(gruss)}</span></button>`;
    return `${blase}<div class="oben"><div class="gruss"><h1>${esc(gruss)}</h1>${c.untertitel ? `<div class="leise">${esc(c.untertitel)}</div>` : ""}</div><span class="insel-platz" aria-hidden="true"></span><div class="rechts">${stift}
      ${ps.length > 1 ? `<div class="personen glas" role="group" aria-label="Wer schaut gerade?">${ps.map((p) => {
        const da = p.entity && h.states[p.entity]?.state === "home";
        return `<button class="person" data-p="${esc(p.id)}" aria-pressed="${ich?.id === p.id}" aria-label="${esc(p.name || "Tablet")}${da ? ", zu Hause" : ""}">
          ${p.tablet ? `<ha-icon data-i="mdi:tablet"></ha-icon>` : esc(p.kurz)}${da ? `<span class="haus" aria-hidden="true"><ha-icon data-i="mdi:home"></ha-icon></span>` : ""}</button>`;
      }).join("")}</div>` : ""}</div></div>
      ${chips.length ? `<div class="chips">${chips.map(({ ch, i, st }) => {
        const farbe = farbeAus(ch.farbe, st ? Geraet.farbe(st) : "#8e8e93");
        const text = [ch.name || st?.attributes.friendly_name || ch.entity, ch.zustand_zeigen === false || !st ? "" : Geraet.zustand(h, st, Geraet.regler(st))].filter(Boolean).join(" ");
        const sym = ch.icon ? `<ha-icon data-i="${esc(ch.icon)}"></ha-icon>` : st ? `<ha-state-icon data-e="${esc(ch.entity)}"></ha-state-icon>` : `<span class="punkt" style="background:${farbe}"></span>`;
        return `<button class="pille glas chip k" data-c="${i}" style="--cf:${farbe}">${sym}${esc(text)}</button>`;
      }).join("")}</div>` : ""}`;
  }
  binden() {
    this.iconsSetzen();
    // Nach dem Neuzeichnen Zustand sofort (ohne Animation) wiederherstellen
    this._p = this._zu = this._x = undefined;
    this.titelFolgen();
    this.$("[data-blase]").addEventListener("click", () => scrollTo({ top: 0, behavior: BEWEGUNG_REDUZIERT.matches ? "auto" : "smooth" }));
    this.$$("[data-p]").forEach((b) => b.addEventListener("click", () => Glas.personWaehlen(b.dataset.p)));
    this.$("[data-bearb]")?.addEventListener("click", () => Glas.bearbeitenSetzen(!Glas.bearbeiten));
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
.karte{display:flex;flex-direction:column;gap:var(--g-a3);overflow:clip}
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
.seg{display:flex;gap:2px;padding:3px;border-radius:var(--g-r-pille);background:var(--g-fuell);align-self:flex-start}
.seg button{min-height:32px;padding:0 var(--g-a3);border-radius:var(--g-r-pille);font-size:var(--g-s-klein);font-weight:600;color:var(--g-text2);transition:background-color .2s ease,color .2s ease}
.seg button[aria-selected="true"]{background:var(--g-an);color:var(--g-text-an);box-shadow:0 1px 4px rgba(0,0,0,.12)}
.bahn{display:flex;align-items:flex-start;overflow-x:auto;overflow-y:hidden;transition:height .32s cubic-bezier(.32,.72,0,1);scroll-snap-type:x mandatory;overscroll-behavior-x:contain;scrollbar-width:none;margin:0 calc(-1 * var(--g-a4))}
.bahn::-webkit-scrollbar{display:none}
.seite{flex:0 0 100%;min-width:0;scroll-snap-align:start;scroll-snap-stop:always;padding:0 var(--g-a4);display:flex;flex-direction:column;gap:var(--g-a3)}
.punkte{display:flex;justify-content:center;gap:6px}
.punkte i{width:6px;height:6px;border-radius:50%;background:var(--g-text2);opacity:.3;transition:opacity .2s ease}
.punkte i.an{opacity:.9}
.tag-titel{margin:var(--g-a1) var(--g-a1) 0;font-size:var(--g-s-klein);font-weight:700;color:var(--g-text2)}
.tag-titel.heute{color:var(--g-akzent)}
.woche{display:grid;grid-template-columns:auto repeat(7,minmax(0,1fr));gap:6px;align-items:center}
.woche .kopf-t{font-size:var(--g-s-mini);font-weight:600;line-height:1.3;color:var(--g-text2);text-align:center;padding:2px 0;border-radius:8px}
.woche .kopf-t.heute{background:var(--g-akzent-voll);color:#fff}
.woche .wer{font-size:var(--g-s-klein);font-weight:700;color:var(--g-text);padding-right:var(--g-a1)}
.woche .sch{height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:var(--g-s-klein);font-weight:700;
  color:#fff;background:var(--sc);text-shadow:0 1px 2px rgba(0,0,0,.3)}
.woche .sch.frei{background:var(--g-fuell);color:var(--g-text2);font-weight:500;text-shadow:none}
.woche .sch.heute{box-shadow:0 0 0 2px var(--g-akzent)}
.klapp{display:inline-flex;align-items:center;gap:var(--g-a1)}
.klapp ha-icon{--mdc-icon-size:20px;transition:transform .25s cubic-bezier(.32,.72,0,1)}
.klapp[aria-expanded="true"] ha-icon{transform:rotate(180deg)}
.monat{display:flex;flex-direction:column;gap:4px}
.mkopf,.mraster{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px}
.mkopf span{text-align:center;font-size:var(--g-s-mini);font-weight:600;color:var(--g-text2)}
.mtag{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;height:44px;border-radius:12px;color:var(--g-text);transition:background-color .2s ease}
.mtag.vorbei{color:var(--g-text2)}
.mzahl{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:var(--g-s-name);font-variant-numeric:tabular-nums}
.mtag.heute .mzahl{color:var(--g-rot-text);font-weight:700}
.mtag[aria-pressed="true"] .mzahl{background:var(--g-aktiv);color:var(--g-aktiv-text);font-weight:700}
.mtag.heute[aria-pressed="true"] .mzahl{background:var(--g-rot-voll);color:#fff}
.mpunkte{display:flex;gap:2px;height:5px}
.mpunkte i{width:5px;height:5px;border-radius:50%}
.mpunkte i.t{background:var(--g-orange)}
.legende{display:flex;flex-wrap:wrap;gap:var(--g-a2)}
.feld{width:100%;min-height:48px;padding:10px 14px;border-radius:var(--g-r-klein);font:inherit;font-size:var(--g-s-text);color:var(--g-text);
  background:var(--g-fuell);border:1px solid var(--g-glas-rand);outline-color:var(--g-akzent)}
.gruppe{display:flex;flex-direction:column;gap:var(--g-a2)}
.haupt{min-height:52px;border-radius:var(--g-r-klein);font-size:var(--g-s-text);font-weight:600;color:#fff;background:var(--g-akzent-voll)}
.haupt:disabled{opacity:.45}
`;
const MONATE = ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sept.", "Okt.", "Nov.", "Dez."];

class GlasPlanerCard extends GlasKarte {
  static standard() { return { titel: "", ohne_datum: true, planer_pfad: "/planer", max_aufgaben: 6, seite_planer: true, seite_kalender: true, seite_monat: true, seite_schichten: true }; }
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
    // Vom Monatsanfang bis mindestens 7 Tage voraus (Seiten „Kalender“ und „Monat“)
    const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(1);
    const ende = new Date(); ende.setHours(0, 0, 0, 0); ende.setDate(ende.getDate() + 7);
    const monatsEnde = new Date(start); monatsEnde.setMonth(monatsEnde.getMonth() + 1);
    if (monatsEnde > ende) ende.setTime(monatsEnde.getTime());
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
    const morgen0 = new Date(jetzt); morgen0.setHours(24, 0, 0, 0);
    const heute0 = new Date(jetzt); heute0.setHours(0, 0, 0, 0);
    const termine = (this._termine || []).filter((t) => t.start < morgen0 && t.ende > heute0);
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
    const seite1 = `<section class="seite" aria-label="Planer">
      <div class="oben"><h2 class="datum">${esc(titel)}</h2><button class="rund" data-neu aria-label="Aufgabe hinzufügen"><ha-icon data-i="mdi:plus"></ha-icon></button></div>
      ${schicht}${koerper}
      <div class="unten"><button class="klapp" data-klapp aria-expanded="${!!this._auf}">${this._auf ? "Weniger" : `Ganzer Tag · ${anz} ${anz === 1 ? "Eintrag" : "Einträge"}`}<ha-icon data-i="mdi:chevron-down"></ha-icon></button>
      <button class="link" data-oeffnen>Planer öffnen<ha-icon class="pfeil-r" data-i="mdi:chevron-right" aria-hidden="true"></ha-icon></button></div></section>`;
    const seiten = [["planer", "Planer", seite1], ["kalender", "Kalender", this.kalenderSeite(terminHtml)], ["monat", "Monat", this.monatSeite(terminHtml)], ["schichten", "Schichten", this.schichtSeite()]]
      .filter(([id]) => c[`seite_${id}`] !== false);
    if (seiten.length <= 1) return `<div class="karte glas">${(seiten[0] || [, , seite1])[2].replace('class="seite"', 'class="seite" style="padding:0"')}</div>`;
    const akt = klemmen(this._seite || 0, 0, seiten.length - 1);
    return `<div class="karte glas" style="gap:var(--g-a2)">
      <div class="seg" role="tablist" aria-label="Ansicht">${seiten.map(([, n], i) => `<button role="tab" data-seite="${i}" aria-selected="${i === akt}">${n}</button>`).join("")}</div>
      <div class="bahn">${seiten.map(([, , html]) => html).join("")}</div>
      <div class="punkte" aria-hidden="true">${seiten.map((_, i) => `<i class="${i === akt ? "an" : ""}"></i>`).join("")}</div></div>`;
  }
  // Seite 2: die nächsten 7 Tage aus den Kalendern der Person
  kalenderSeite(terminHtml) {
    const alle = this._termine || [];
    const tage = [...Array(7)].map((_, i) => {
      const a = new Date(); a.setHours(0, 0, 0, 0); a.setDate(a.getDate() + i);
      const b = new Date(a); b.setDate(b.getDate() + 1);
      return { i, a, liste: alle.filter((t) => t.start < b && t.ende > a) };
    }).filter((t) => t.liste.length);
    const name = (t) => (t.i === 0 ? "Heute" : t.i === 1 ? "Morgen" : t.a.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "short" }));
    return `<section class="seite" aria-label="Kalender"><div class="oben"><h2 class="datum">Nächste 7 Tage</h2></div>
      ${tage.length ? tage.map((t) => `<div class="tag-titel ${t.i === 0 ? "heute" : ""}">${esc(name(t))}</div>${t.liste.map(terminHtml).join("")}`).join("")
        : `<div class="leise leer">Keine Termine in den nächsten 7 Tagen.</div>`}</section>`;
  }
  // Seite Monat: kleiner Monatskalender mit Punkten, Tag antippen zeigt die Termine darunter groß
  monatSeite(terminHtml) {
    const jetzt = new Date(), heute = heuteIso();
    const wahl = this._tagWahl || heute;
    const erster = new Date(jetzt.getFullYear(), jetzt.getMonth(), 1);
    const versatz = (erster.getDay() + 6) % 7;
    const tageImMonat = new Date(jetzt.getFullYear(), jetzt.getMonth() + 1, 0).getDate();
    const alle = this._termine || [];
    const termineAm = (iso) => { const a = new Date(`${iso}T00:00`), b = new Date(a); b.setDate(b.getDate() + 1); return alle.filter((t) => t.start < b && t.ende > a); };
    const p = this.person(), d = this._daten || {};
    const plan = p && !p.tablet ? d.schichten?.[p.benutzer] : null;
    const zellen = [];
    for (let i = 0; i < versatz; i++) zellen.push(`<span></span>`);
    for (let t = 1; t <= tageImMonat; t++) {
      const iso = isoTag(new Date(jetzt.getFullYear(), jetzt.getMonth(), t));
      const n = termineAm(iso).length, art = plan?.arten?.find((x) => x.id === plan.tage?.[iso]);
      zellen.push(`<button class="mtag ${iso === heute ? "heute" : ""} ${iso < heute ? "vorbei" : ""}" data-tag="${iso}" aria-pressed="${iso === wahl}" aria-label="${t}.${n ? `, ${n} Termine` : ""}${art ? `, ${esc(art.name)}` : ""}">
        <span class="mzahl">${t}</span><span class="mpunkte">${art ? `<i style="background:${esc(art.farbe)}"></i>` : ""}${n ? `<i class="t"></i>` : ""}${n > 1 ? `<i class="t"></i>` : ""}</span></button>`);
    }
    const liste = termineAm(wahl);
    const titel = wahl === heute ? "Heute" : new Date(`${wahl}T00:00`).toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
    return `<section class="seite" aria-label="Monat"><div class="oben"><h2 class="datum">${jetzt.toLocaleDateString("de-DE", { month: "long", year: "numeric" })}</h2></div>
      <div class="monat"><div class="mkopf">${["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((x) => `<span>${x}</span>`).join("")}</div><div class="mraster">${zellen.join("")}</div></div>
      <div class="tag-titel ${wahl === heute ? "heute" : ""}">${esc(titel)}</div>
      ${liste.length ? liste.map(terminHtml).join("") : `<div class="leise leer">Keine Termine.</div>`}</section>`;
  }
  // Seite 3: Schichten der Woche für alle Personen (Mo–So), heute markiert
  schichtSeite() {
    const d = this._daten || {};
    const mo = new Date(); mo.setHours(0, 0, 0, 0); mo.setDate(mo.getDate() - ((mo.getDay() + 6) % 7));
    const tage = [...Array(7)].map((_, i) => { const x = new Date(mo); x.setDate(x.getDate() + i); return x; });
    const heute = heuteIso();
    const leute = Glas.personen.filter((p) => !p.tablet && p.benutzer && d.schichten?.[p.benutzer]);
    if (!leute.length) return `<section class="seite" aria-label="Schichten"><div class="oben"><h2 class="datum">Schichten</h2></div><div class="leise leer">Noch keine Schichten im Planer eingetragen.</div></section>`;
    const kw = (() => { const t = new Date(tage[3]); const j = new Date(t.getFullYear(), 0, 4); return 1 + Math.round(((t - j) / 864e5 - 3 + ((j.getDay() + 6) % 7)) / 7); })();
    const benutzt = new Map();
    const zeilen = leute.map((p) => {
      const plan = d.schichten[p.benutzer];
      return `<span class="wer">${esc(p.kurz || (p.name || "?")[0])}</span>${tage.map((t) => {
        const iso = isoTag(t), art = plan.arten?.find((x) => x.id === plan.tage?.[iso]);
        if (art) benutzt.set(art.id + art.name, art);
        const lab = `${p.name} ${t.toLocaleDateString("de-DE", { weekday: "long" })}: ${art ? `${art.name}${art.von ? ` ${art.von}–${art.bis}` : ""}` : "frei"}`;
        return `<span class="sch ${art ? "" : "frei"} ${iso === heute ? "heute" : ""}" style="--sc:${art ? esc(art.farbe) : "transparent"}" role="img" aria-label="${esc(lab)}">${art ? esc(art.kurz) : "–"}</span>`;
      }).join("")}`;
    }).join("");
    return `<section class="seite" aria-label="Schichten"><div class="oben"><h2 class="datum">Schichten · KW ${kw}</h2></div>
      <div class="woche"><span></span>${tage.map((t) => `<span class="kopf-t ${isoTag(t) === heute ? "heute" : ""}">${t.toLocaleDateString("de-DE", { weekday: "short" }).replace(".", "")}<br>${t.getDate()}</span>`).join("")}${zeilen}</div>
      ${benutzt.size ? `<div class="legende">${[...benutzt.values()].map((a) => `<span class="mini"><span class="punkt" style="background:${esc(a.farbe)}"></span>${esc(a.kurz)} ${esc(a.name)}${a.von ? ` ${a.von}–${a.bis}` : ""}</span>`).join("")}</div>` : ""}</section>`;
  }
  binden() {
    this.iconsSetzen();
    const h = this._hass;
    const bahn = this.$(".bahn");
    if (bahn) {
      const breite = () => bahn.clientWidth || 1;
      // Höhe folgt der sichtbaren Seite (kein Leerraum unter kurzen Seiten)
      const hoehe = (i) => { const sec = bahn.children[i]; if (sec?.offsetHeight) bahn.style.height = `${sec.offsetHeight}px`; };
      bahn.scrollLeft = (this._seite || 0) * breite();
      this._seiteAnzeige = this._seite || 0;
      hoehe(this._seiteAnzeige);
      let t = null;
      bahn.addEventListener("scroll", () => {
        const i = Math.round(bahn.scrollLeft / breite());
        if (i === this._seiteAnzeige) return;
        this._seiteAnzeige = i;
        hoehe(i);
        this.$$("[data-seite]").forEach((b, k) => b.setAttribute("aria-selected", k === i));
        this.$$(".punkte i").forEach((p, k) => p.classList.toggle("an", k === i));
        clearTimeout(t); t = setTimeout(() => { this._seite = i; }, 120);
      }, { passive: true });
      this.$$("[data-seite]").forEach((b) => b.addEventListener("click", () => {
        const ziel = Number(b.dataset.seite), von = this._seiteAnzeige ?? 0;
        this._seite = ziel;
        if (ziel === von) return;
        // Nicht durch alle Seiten rauschen: direkt springen und die Zielseite aus der Richtung
        // hereinfedern lassen, aus der sie kommt (wie ein Segment-Wechsel bei iOS).
        bahn.scrollLeft = ziel * breite();
        if (matchMedia("(prefers-reduced-motion: reduce)").matches || !bahn.animate) return;
        this._sprung?.forEach((x) => x.cancel());
        const r = ziel > von ? 1 : -1, { werte, dauer } = federVerlauf(0, { antwort: 0.34, daempfung: 0.92 });
        this._sprung = [
          bahn.animate(werte.map((p) => ({ translate: `${(1 - p) * 40 * r}px 0` })), { duration: dauer, easing: "linear" }),
          bahn.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: 200, easing: "cubic-bezier(.23,1,.32,1)" }),
        ];
      }));
    }
    this.$$("[data-tag]").forEach((b) => b.addEventListener("click", () => { this._tagWahl = b.dataset.tag; this._seite = this._seiteAnzeige; this.render(); }));
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
  render() {
    // Standardwerte sichtbar machen (nicht gesetzt = an)
    for (const k of ["ohne_datum", "seite_planer", "seite_kalender", "seite_monat", "seite_schichten"]) if (this._config[k] === undefined) this._config[k] = true;
    if (this._config.max_aufgaben === undefined) this._config.max_aufgaben = 6;
    super.render();
  }
  schema() {
    return [
      { name: "titel", selector: { text: {} } },
      { name: "ohne_datum", selector: { boolean: {} } },
      { name: "max_aufgaben", selector: { number: { min: 0, max: 30, mode: "box" } } },
      { name: "planer_pfad", selector: { text: {} } },
      { type: "grid", name: "", schema: [{ name: "seite_planer", selector: { boolean: {} } }, { name: "seite_kalender", selector: { boolean: {} } }] },
      { type: "grid", name: "", schema: [{ name: "seite_monat", selector: { boolean: {} } }, { name: "seite_schichten", selector: { boolean: {} } }] },
    ];
  }
  labels() { return { titel: "Titel (leer = „Heute, 20. Nov.“)", ohne_datum: "Aufgaben ohne Datum mitzeigen", max_aufgaben: "Höchstens so viele erledigte+offene Aufgaben (0 = alle)", planer_pfad: "Pfad zum Planer", seite_planer: "Seite Planer", seite_kalender: "Seite Kalender (7 Tage)", seite_monat: "Seite Monat (kleiner Kalender)", seite_schichten: "Seite Schichten (Woche)" }; }
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
    this._portal?.remove(); this._portal = null; this._kz = null;
  }
  entitaeten() { return Object.keys(this._hass?.states || {}).filter((e) => ["light", "switch", "media_player", "fan"].includes(domainVon(e))); }
  css() { return LEISTE_CSS; }
  inhalt(fest) {
    return `<nav class="leiste glas ${fest ? "fest" : ""}" aria-label="Räume">${this.knoepfeHtml()}</nav>`;
  }
  knoepfeHtml() {
    const h = this._hass, c = this._config, jetzt = hashJetzt();
    const raeume = [...(c.zuhause_zeigen ? [{ name: "Zuhause", icon: "mdi:home-outline", hash: "" }] : []), ...(c.raeume || [])];
    return `${raeume.map((r) => {
      const an = r.bereich && entitaetenImBereich(h, r.bereich, ["light", "switch", "media_player", "fan"]).some((e) => Geraet.istAn(h.states[e]));
      const akt = (r.hash || "") === jetzt;
      return `<button class="raum" data-h="${esc(r.hash || "")}" aria-label="${esc(r.name)}" aria-current="${akt ? "page" : "false"}">
        <ha-icon data-i="${esc(r.icon || "mdi:door")}"></ha-icon>${an ? `<span class="punkt" aria-hidden="true"></span>` : ""}</button>`;
    }).join("")}`;
  }
  render() {
    if (!this._config || !this._hass) return;
    const bearbeiten = istBearbeiten();
    karteVerstecken(this, !bearbeiten);
    if (bearbeiten) {
      this._portal?.remove(); this._portal = null; this._kz = null;
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
    // Gerüst einmal bauen (Kontrollzentrum bleibt dabei offen), danach nur die Raumknöpfe neu
    if (!r.querySelector(".fest")) {
      const kz = this._config.kontrollzentrum !== false && Glas.einst?.kontrollzentrum?.an !== false;
      let gesehen = false;
      try { gesehen = !!localStorage.getItem("glas-kz-gesehen"); } catch (_) { gesehen = true; }
      r.innerHTML = `<style>${TOKENS.replace(":host{", ".w{").replace(":host([dunkel]){", ".w.dunkel{")}${LEISTE_CSS}${KZ_CSS}</style>
        <div class="w"><div class="kz-dimm"></div><div class="fest">
        ${kz ? `<div class="kz-clip"><div class="kz-panel" role="dialog" aria-label="Kontrollzentrum"><div class="kz-griff-oben" aria-hidden="true"><span></span></div><div class="kz-raster"></div></div></div>
        <button class="kz-griff" aria-label="Kontrollzentrum öffnen" aria-expanded="false"><span></span></button>
        ${gesehen ? "" : `<div class="kz-tipp glas" aria-hidden="true">Hochziehen für Schnellzugriff</div>`}` : ""}
        <nav class="leiste glas" aria-label="Räume"></nav></div></div>`;
      this._kz = kz ? new Kontrollzentrum(this, r) : null;
    }
    r.querySelector(".w").classList.toggle("dunkel", istDunkel(this._hass));
    const nav = r.querySelector("nav.leiste"), neu = this.knoepfeHtml();
    if (nav._html !== neu) { nav._html = neu; nav.innerHTML = neu; this.verdrahten(nav); }
  }
  verdrahten(r) {
    r.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
    r.querySelectorAll("[data-h]").forEach((b) => b.addEventListener("click", () => {
      const ziel = b.dataset.h;
      if (this._kz?.offen) this._kz.zu();
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
.kopf-bereich{display:contents}
.raster{display:flex;flex-direction:column;gap:var(--g-a3)}
.abschn-raster{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:var(--g-a2);align-items:start}
.abschn-raster > *{min-width:0}
@media (min-width:760px){.raster.zwei{display:block;columns:2;column-gap:var(--g-a5)}.raster.zwei > .abschn{break-inside:avoid;margin-bottom:var(--g-a3)}}
.aktiv-rund{background:var(--g-akzent-voll)!important;color:#fff!important}
.chips{display:flex;gap:var(--g-a2);flex-wrap:wrap;padding:0 var(--g-a1)}
.chips ha-state-icon{--mdc-icon-size:16px}
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
  setConfig(c) {
    super.setConfig(c);
    this._karten = []; this._kartenCfg = null;
    if (this._schicht) { this._kopfHtml = null; this.kopfZeichnen(); this.rasterZeichnen(); }
  }
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
    // Bearbeiten-Modus umgeschaltet: offenes Blatt neu aufbauen
    if (this._schicht && this._bearbVorher !== Glas.bearbeiten) { this.kopfZeichnen(); this.rasterZeichnen(); }
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
    if (c.fenster_auto && c.bereich) ids = [...new Set([...ids, ...raumFensterAuto(h, c.bereich).filter((e) => !(c.fenster_aus || []).includes(e))])];
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
    const bearbKnopf = istAdmin(h) && Glas.einst && (Glas.einst.raeume || []).some((r) => r.hash === c.hash)
      ? (Glas.bearbeiten ? `<button class="rund aktiv-rund" data-bearb aria-label="Bearbeiten beenden"><ha-icon data-i="mdi:check"></ha-icon></button>` : `<button class="rund glas" data-bearb aria-label="Raum bearbeiten"><ha-icon data-i="mdi:pencil-outline"></ha-icon></button>`) : "";
    const zahnrad = Glas.bearbeiten && bearbKnopf ? `<button class="rund glas" data-raumeinst aria-label="Raum einstellen"><ha-icon data-i="mdi:cog-outline"></ha-icon></button>` : "";
    const knoepfe = zahnrad + bearbKnopf + (c.alles_aus && !Glas.bearbeiten ? `<button class="rund glas" data-aus aria-label="Alles im Raum ausschalten"><ha-icon data-i="mdi:power"></ha-icon></button>` : "");
    const chips = this.chips();
    const kopfNeu = `${s.kopfHtml(c.name || c.hash, this.messwerte(), knoepfe)}${chips.length ? `<div class="chips">${chips.map((st) => {
      const w = Geraet.istWarnung(st);
      return `<button class="pille fuell" data-chip="${esc(st.entity_id)}"><span class="punkt" style="background:${w ? FARBEN[w] : "var(--g-gruen)"}"></span>${esc(st.attributes.friendly_name)} ${esc(zustandText(h, st))}</button>`;
    }).join("")}${c.bereich && c.verlauf_chip !== false ? `<button class="pille fuell" data-verlauf><ha-icon data-i="mdi:chart-timeline-variant" style="--mdc-icon-size:16px"></ha-icon>Verlauf</button>` : ""}</div>`
      : c.bereich && c.verlauf_chip !== false ? `<div class="chips"><button class="pille fuell" data-verlauf><ha-icon data-i="mdi:chart-timeline-variant" style="--mdc-icon-size:16px"></ha-icon>Verlauf</button></div>` : ""}`;
    if (this._kopfHtml === kopfNeu && k.firstChild) return;
    this._kopfHtml = kopfNeu;
    k.innerHTML = kopfNeu;
    s.kopfBinden();
    const kp = s.kopfPlatz;
    kp.querySelector("[data-raumeinst]")?.addEventListener("click", () => raumMenue(this, c.hash));
    kp.querySelector("[data-bearb]")?.addEventListener("click", () => Glas.bearbeitenSetzen(!Glas.bearbeiten));
    kp.querySelector("[data-aus]")?.addEventListener("click", () => {
      const ziele = this.ausZiele();
      if (ziele.length) h.callService("homeassistant", "turn_off", { entity_id: ziele });
    });
    k.querySelectorAll("[data-chip]").forEach((b) => b.addEventListener("click", () => {
      const st = this._hass.states[b.dataset.chip];
      if (istFenster(st)) fensterOeffnen(this, this._config.bereich, this._config.name); else raumVerlaufOeffnen(this, this._config.bereich, this._config.name, b.dataset.chip);
    }));
    k.querySelector("[data-verlauf]")?.addEventListener("click", () => raumVerlaufOeffnen(this, this._config.bereich, this._config.name));
    const unter = kp.querySelector(".unter");
    if (unter && c.bereich) {
      unter.setAttribute("role", "button"); unter.tabIndex = 0; unter.style.cursor = "pointer";
      unter.setAttribute("aria-label", `${unter.textContent}, Verlauf öffnen`);
      const auf = () => raumVerlaufOeffnen(this, c.bereich, c.name, c.temperatur || undefined);
      unter.addEventListener("click", auf);
      unter.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); auf(); } });
    }
  }
  async oeffnen(ueberHash = false) {
    if (this._schicht) return;
    this._ueberHash = ueberHash;
    const s = new GlasSchicht({ quelle: this, hoch: true, titel: this._config.name || this._config.hash,
      zu: () => { this._schicht = null; if (hashJetzt() === this._config.hash) hashSchliessen(); } });
    this._schicht = s;
    s.inhalt.innerHTML = `<style>${RAUM_CSS}${BEARB_CSS}</style><div class="kopf-bereich"></div><div class="raster"></div>`;
    this.kopfZeichnen();
    s.oeffnen();
    await this.rasterZeichnen();
  }
  // Karten im Blatt; im Bearbeiten-Modus direkt aus den Einstellungen (auch ausgeblendete) mit Ziehen und Menü
  async rasterZeichnen() {
    const s = this._schicht;
    if (!s) return;
    const raster = s.inhalt.querySelector(".raster");
    const hilfe = await window.loadCardHelpers?.();
    if (!hilfe) { raster.innerHTML = `<div class="leise">Karten können hier nicht geladen werden.</div>`; return; }
    if (this._schicht !== s) return;
    this._bearbVorher = Glas.bearbeiten;
    const raum = Glas.bearbeiten && Glas.einst ? (Glas.einst.raeume || []).find((r) => r.hash === this._config.hash) : null;
    const sauber = (cfg) => Object.fromEntries(Object.entries(cfg).filter(([k]) => !k.startsWith("_")));
    let cfgs;
    if (raum) {
      cfgs = raumCfg(this._hass, raum, true).cards;
      this._karten = cfgs.map((cfg) => { const el = hilfe.createCardElement(sauber(cfg)); el.hass = this._hass; return el; });
      this._kartenCfg = null;
    } else {
      cfgs = this._config.cards || [];
      if (this._kartenCfg !== cfgs) {
        this._kartenCfg = cfgs;
        this._karten = cfgs.map((cfg) => { const el = hilfe.createCardElement(sauber(cfg)); el.hass = this._hass; return el; });
      }
    }
    // Abschnitte (Überschrift + Kacheln) als eigene Kästen: untereinander oder versetzt nebeneinander
    const spalten = (raum ? raum.spalten : this._config.spalten) === 2;
    raster.replaceChildren();
    raster.classList.remove("bearb");
    raster.classList.toggle("zwei", spalten);
    s.blatt.classList.toggle("breit", spalten);
    let box = null;
    const neueBox = (gruppe) => {
      box = document.createElement("section");
      box.className = "abschn";
      if (gruppe !== undefined) box.dataset.gruppe = gruppe;
      box.innerHTML = `<div class="abschn-raster"></div>`;
      raster.appendChild(box);
      return box;
    };
    this._karten.forEach((el, n) => {
      const cfg = cfgs[n] || {};
      const z = document.createElement("div");
      const g = el.getGridOptions?.() || el.getLayoutOptions?.() || {};
      const sp = g.columns === "full" ? 12 : Number(g.columns || g.grid_columns * 3 || 12);
      z.style.gridColumn = `span ${klemmen(sp || 12, 1, 12)}`;
      if (cfg.type === "heading") neueBox(cfg._gruppe);
      else if (!box) neueBox(undefined);
      if (raum && cfg._i != null) {
        z.dataset.i = cfg._i;
        z.dataset.name = cfg.type === "custom:glas-ordner-card" ? `Ordner ${cfg.name || ""}` : cfg.titel || cfg.name || this._hass.states[cfg.entity]?.attributes.friendly_name || (listenKarte(cfg._karte)?.[1] ?? "Karte");
        if (cfg._aus) z.classList.add("aus");
      }
      z.appendChild(el);
      box.firstElementChild.appendChild(z);
      el.addEventListener("ll-rebuild", () => { this._kartenCfg = null; });
    });
    if (raum) bearbeitRaster(raster, listeZugriff({ art: "raum", hash: raum.hash }), this, { scroller: s.inhalt });
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
    s.inhalt.querySelectorAll(".f-zeile").forEach((b) => b.addEventListener("click", () => steuerungOeffnen(quelle, b.dataset.e, {})));
  };
  const neu = () => zeichnen();
  Glas.hassHoerer.add(neu);
  zeichnen();
  s.oeffnen();
  return s;
}
// ---------------------------------------------------------------------------
// Bearbeiten direkt im Dashboard
// · Stift oben (nur Admins) schaltet den Bearbeiten-Modus für alle Karten an
// · Kacheln in Räumen und Favoriten verschieben: Maus ziehen, am Handy kurz halten und ziehen
// · Kachel antippen: ausführliches Menü (Gerät, Größe, Anzeige, Verhalten, Verlauf, Platz)
// Alles wird sofort in den zentralen Einstellungen gespeichert.
// ---------------------------------------------------------------------------
Glas.bearbeiten = Glas.bearbeiten || false;
Glas.bearbeitenSetzen = function (an) { this.bearbeiten = !!an; this.melden(); };
const kopieJ = (o) => JSON.parse(JSON.stringify(o));
const istAdmin = (h) => !!h?.user?.is_admin;

// Zugriff auf eine Geräteliste in den Einstellungen: Raum (#hash) oder Favoriten der Person
function listeZugriff(ort) {
  const startId = (e) => (ort.person && e.startseiten?.[ort.person.id] && e.startseiten[ort.person.id].eigen !== false ? ort.person.id : "alle");
  const z = {
    ort,
    lesen(h) {
      const e = Glas.einst;
      if (!e) return [];
      if (ort.art === "raum") { const r = (e.raeume || []).find((x) => x.hash === ort.hash); return r ? r.geraete || raumGeraeteVorschlag(h, r.bereich) : []; }
      if (ort.art === "abschnitte") return startseiteVon(e, ort.person).abschnitte || [];
      return startseiteVon(e, ort.person).favoriten || [];
    },
    raum() { return ort.art === "raum" ? (Glas.einst?.raeume || []).find((x) => x.hash === ort.hash) : null; },
    schreiben(h, fn) {
      if (!Glas.einst) return Promise.resolve();
      const e = kopieJ(Glas.einst);
      if (ort.art === "raum") {
        const r = (e.raeume || []).find((x) => x.hash === ort.hash);
        if (!r) return Promise.resolve();
        r.geraete = fn(r.geraete || raumGeraeteVorschlag(h, r.bereich), e);
      } else {
        e.startseiten = e.startseiten || {};
        const id = startId(e);
        const s = (e.startseiten[id] = { ...startseiteVon(e, ort.person), ...(id !== "alle" ? { eigen: true } : {}) });
        if (ort.art === "abschnitte") s.abschnitte = fn(s.abschnitte || [], e);
        else s.favoriten = fn(s.favoriten || [], e);
      }
      return Glas.einstSpeichern(h, e).catch((err) => console.error("Glas: speichern", err));
    },
  };
  return z;
}

const BEARB_CSS = `
.bearb [data-i]{position:relative}
.bearb [data-i]:not([data-griff]) > :not(.deckel){pointer-events:none}
.bearb [data-griff] > .deckel{bottom:auto;height:52px;box-shadow:none}
.deckel{position:absolute;inset:0;z-index:2;border-radius:var(--g-r);background:transparent;cursor:grab;touch-action:pan-y;
  box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--g-akzent) 50%,transparent)}
.deckel .marke{position:absolute;top:-6px;right:-6px;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  background:var(--g-akzent-voll);color:#fff;box-shadow:0 2px 6px rgba(0,0,0,.2)}
.deckel .marke ha-icon{--mdc-icon-size:14px}
.bearb .aus > :not(.deckel){opacity:.4}
.bearb .aus > .deckel .marke{background:#636366}
.bearb .zieht{z-index:5}
.bearb .zieht > :first-child{transform:scale(1.04);border-radius:var(--g-r);box-shadow:0 14px 34px rgba(0,0,0,.28);transition:transform .18s cubic-bezier(.23,1,.32,1)}
.bearb .zieht > .deckel{cursor:grabbing}
.bearb .ordner-ziel > :first-child{transform:scale(1.07);border-radius:var(--g-r);box-shadow:0 0 0 3px var(--g-akzent),0 10px 30px rgba(0,0,0,.2);transition:transform .22s cubic-bezier(.34,1.4,.64,1)}
.bearb .gehalten > :first-child{transform:scale(1.03);transition:transform .18s cubic-bezier(.23,1,.32,1)}
.bearb .abschn-raster:not(:has([data-i]))::after{content:"Kacheln hierher ziehen";grid-column:span 12;min-height:64px;display:flex;align-items:center;justify-content:center;
  border:1.5px dashed var(--g-text2);border-radius:var(--g-r);color:var(--g-text2);font-size:var(--g-s-klein)}
.neu-kachel{display:flex;align-items:center;justify-content:center;gap:var(--g-a2);width:100%;min-height:var(--g-kachel-h);border-radius:var(--g-r);
  border:1.5px dashed var(--g-text2);color:var(--g-text);font-size:var(--g-s-name);font-weight:600}
.platzhalter{display:flex;align-items:center;gap:var(--g-a3);min-height:72px;padding:var(--g-a3) var(--g-a4);border-radius:var(--g-r);color:var(--g-text)}
.platzhalter .leise{display:block}
.bearb-hinweis{grid-column:span 12;display:flex;align-items:center;gap:var(--g-a2);padding:var(--g-a2) var(--g-a3);border-radius:var(--g-r-klein);
  font-size:var(--g-s-klein);color:var(--g-text2)}
`;

// FLIP: Nachbarn gleiten weich an ihren neuen Platz
function flip(kinder, aendern) {
  const vorher = new Map(kinder.map((k) => [k, k.getBoundingClientRect()]));
  aendern();
  kinder.forEach((k) => {
    if (k.classList.contains("zieht")) return;
    const a = vorher.get(k), b = k.getBoundingClientRect();
    const dx = a.left - b.left, dy = a.top - b.top;
    if (!dx && !dy) return;
    k.style.transition = "none";
    k.style.transform = `translate(${dx}px,${dy}px)`;
    requestAnimationFrame(() => { k.style.transition = "transform .26s cubic-bezier(.23,1,.32,1)"; k.style.transform = ""; });
  });
}

// Kacheln eines Rasters bearbeitbar machen (Kinder mit data-i = Index in der Liste)
function bearbeitRaster(raster, zugriff, quelle, { scroller = null, mitNeu = true, menue: eigenesMenue = null } = {}) {
  raster.classList.add("bearb");
  const ordnerErlaubt = zugriff?.ort && zugriff.ort.art !== "abschnitte";
  if (ordnerErlaubt) {
    const l = zugriff.lesen(Glas.hass);
    raster.querySelectorAll("[data-i]").forEach((z) => { const x = l[Number(z.dataset.i)]; if (x && (x.entity || x.ordner)) z.dataset.ordnerbar = "1"; });
  }
  // eigene Kacheln: auch in Abschnitt-Kästen (Räume), aber nicht die eines inneren Rasters (Favoriten in der Startseite)
  const kinder = () => [...raster.querySelectorAll("[data-i]")].filter((z) => z.parentElement.closest(".bearb") === raster);
  const reihenfolgeSpeichern = () => {
    const neu = kinder().map((z) => ({ i: Number(z.dataset.i), gruppe: z.parentElement.closest("[data-gruppe]")?.dataset.gruppe || undefined }));
    zugriff.schreiben(Glas.hass, (liste) => {
      const l = neu.map(({ i, gruppe }) => (liste[i] ? { ...liste[i], ...(gruppe ? { gruppe } : {}) } : null)).filter(Boolean);
      return [...l, ...liste.filter((_, i) => !neu.some((x) => x.i === i))];
    });
  };
  kinder().forEach((z) => {
    const d = document.createElement("button");
    d.className = "deckel";
    d.setAttribute("aria-label", `${z.dataset.name || "Kachel"} bearbeiten. Pfeiltasten verschieben.`);
    d.innerHTML = `<span class="marke" aria-hidden="true"><ha-icon></ha-icon></span>`;
    d.querySelector("ha-icon").icon = z.classList.contains("aus") ? "mdi:eye-off" : "mdi:pencil";
    z.appendChild(d);
    let g = null, halteT = null;
    const menue = () => (eigenesMenue ? eigenesMenue(Number(z.dataset.i)) : kachelMenue(quelle, zugriff, Number(z.dataset.i)));
    const ende = (ok) => {
      clearTimeout(halteT);
      const x = g; g = null;
      z.classList.remove("gehalten");
      if (!x) return;
      if (!x.zieht) { if (ok && !x.weg) menue(); return; }
      clearTimeout(x.ordnerT);
      z.classList.remove("zieht");
      if (x.ordnerZiel && ok) {
        x.ordnerZiel.classList.remove("ordner-ziel");
        const von = Number(z.dataset.i), auf = Number(x.ordnerZiel.dataset.i);
        z.style.transition = "transform .2s ease, opacity .2s ease"; z.style.opacity = "0";
        zugriff.schreiben(Glas.hass, (l) => ordnerBilden(l, von, auf));
        vibrieren(15);
        return;
      }
      z.style.transition = "transform .26s cubic-bezier(.23,1,.32,1)";
      z.style.transform = "";
      if (x.bewegt) reihenfolgeSpeichern();
    };
    d.addEventListener("pointerdown", (e) => {
      if (e.button > 0) return;
      g = { x: e.clientX, y: e.clientY, tx: 0, ty: 0, zieht: false, weg: false, maus: e.pointerType === "mouse", ziel: null, bewegt: false };
      try { d.setPointerCapture(e.pointerId); } catch (_) { /* */ }
      if (!g.maus) halteT = setTimeout(() => { if (g && !g.weg) { g.bereit = true; z.classList.add("gehalten"); if (navigator.vibrate) navigator.vibrate(10); } }, 260);
    });
    d.addEventListener("pointermove", (e) => {
      if (!g) return;
      const dist = Math.hypot(e.clientX - g.x, e.clientY - g.y);
      if (!g.zieht) {
        if (dist < 7) return;
        if (!g.maus && !g.bereit) { g.weg = true; clearTimeout(halteT); return; } // Finger scrollt
        if (g.weg) return;
        g.zieht = true;
        const r = z.getBoundingClientRect();
        g.gx = g.x - r.left; g.gy = g.y - r.top;
        z.style.transition = "none";
        z.classList.add("zieht");
      }
      // Ziel unter dem Finger: davor oder dahinter einsortieren
      const ziel = kinder().find((k) => { if (k === z) return false; const r = k.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; });
      // Mitte einer Kachel kurz halten = Ordner anlegen (wie am iPhone); Rand = davor/dahinter einsortieren
      let mitte = false;
      if (ziel && ordnerErlaubt && ziel.dataset.ordnerbar && z.dataset.ordnerbar) {
        const r = ziel.getBoundingClientRect(), rx = (e.clientX - r.left) / r.width;
        mitte = rx > 0.26 && rx < 0.74;
      }
      if (mitte) {
        if (g.ordnerKand !== ziel) {
          clearTimeout(g.ordnerT); g.ordnerZiel?.classList.remove("ordner-ziel"); g.ordnerZiel = null; g.ordnerKand = ziel;
          g.ordnerT = setTimeout(() => { if (g && g.ordnerKand === ziel) { g.ordnerZiel = ziel; ziel.classList.add("ordner-ziel"); vibrieren(10); } }, 420);
        }
      } else if (g.ordnerKand) { clearTimeout(g.ordnerT); g.ordnerZiel?.classList.remove("ordner-ziel"); g.ordnerZiel = null; g.ordnerKand = null; }
      if (ziel && !mitte && ziel !== g.ziel) {
        const r = ziel.getBoundingClientRect(), vor = e.clientX < r.left + r.width / 2;
        const ref = vor ? ziel : ziel.nextElementSibling;
        if (ref !== z && (z.nextElementSibling !== ref || z.parentNode !== ziel.parentNode)) { flip(kinder(), () => ziel.parentNode.insertBefore(z, ref)); g.bewegt = true; }
      }
      if (!ziel) {
        // leerer Abschnitt unter dem Finger: dort hinein
        const box = [...raster.querySelectorAll(".abschn-raster")].find((b) => { const r = b.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; });
        if (box && box !== z.parentNode && !kinder().some((k) => k !== z && k.parentNode === box)) { flip(kinder(), () => box.appendChild(z)); g.bewegt = true; }
      }
      g.ziel = mitte ? g.ziel : ziel || null;
      // Am Rand automatisch scrollen
      const sc = scroller || document.scrollingElement;
      const box = scroller ? scroller.getBoundingClientRect() : { top: 0, bottom: innerHeight };
      if (e.clientY > box.bottom - 56) sc.scrollTop += 10; else if (e.clientY < box.top + 56) sc.scrollTop -= 10;
      const r = z.getBoundingClientRect(), bl = r.left - g.tx, bt = r.top - g.ty;
      g.tx = e.clientX - g.gx - bl; g.ty = e.clientY - g.gy - bt;
      z.style.transform = `translate(${g.tx}px,${g.ty}px)`;
    });
    // Nach dem Halten darf der Finger nicht mehr scrollen
    d.addEventListener("touchmove", (e) => { if (g && (g.bereit || g.zieht) && e.cancelable) e.preventDefault(); }, { passive: false });
    d.addEventListener("pointerup", () => ende(true));
    d.addEventListener("pointercancel", () => ende(false));
    d.addEventListener("click", (e) => { if (e.detail === 0) menue(); });
    d.addEventListener("contextmenu", (e) => e.preventDefault());
    d.addEventListener("keydown", (e) => {
      const schritt = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
      if (!schritt) return;
      e.preventDefault();
      const l = kinder(), pos = l.indexOf(z), nach = l[pos + schritt];
      if (!nach) return;
      nach.parentNode.insertBefore(z, schritt < 0 ? nach : nach.nextElementSibling);
      d.focus();
      reihenfolgeSpeichern();
    });
  });
  if (mitNeu) {
    const z = document.createElement("div");
    z.style.gridColumn = "span 6";
    z.innerHTML = `<button class="neu-kachel"><ha-icon></ha-icon>Hinzufügen</button>`;
    z.querySelector("ha-icon").icon = "mdi:plus";
    z.querySelector("button").addEventListener("click", () => neuMenue(quelle, zugriff));
    raster.appendChild(z);
  }
}

// ha-form wird von HA erst bei Bedarf geladen: einmal einen Karten-Editor anfordern, dann ist es da
async function haFormLaden() {
  if (customElements.get("ha-form")) return;
  try {
    const hf = await window.loadCardHelpers?.();
    const c = await hf?.createCardElement({ type: "entities", entities: [] });
    await c?.constructor?.getConfigElement?.();
  } catch (_) { /* */ }
  await Promise.race([customElements.whenDefined("ha-form"), new Promise((r) => setTimeout(r, 1500))]);
}
function felderVon(schema) { return schema.flatMap((x) => (x.schema ? felderVon(x.schema) : [x.name])).filter(Boolean); }
function haForm(box, data, schema, labels, aendern, hilfen = {}) {
  const f = document.createElement("ha-form");
  f.hass = Glas.hass; f.data = data; f.schema = schema;
  f.computeLabel = (s) => labels[s.name] ?? s.title ?? s.name;
  f.computeHelper = (s) => hilfen[s.name];
  f.addEventListener("value-changed", (e) => { e.stopPropagation(); const v = { ...e.detail.value }; f.data = v; aendern(v, felderVon(schema)); });
  box.appendChild(f);
  return f;
}

const MENUE_CSS = `
.vorschau{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:var(--g-a2);padding:var(--g-a2) 0}
.vorschau > *{min-width:0}
.m-gruppe{display:flex;flex-direction:column;gap:var(--g-a2);padding:var(--g-a3) var(--g-a4);border-radius:var(--g-r)}
.m-titel{display:flex;align-items:center;gap:var(--g-a2);font-size:var(--g-s-klein);font-weight:700;letter-spacing:.3px;text-transform:uppercase;color:var(--g-text2)}
.m-titel ha-icon{--mdc-icon-size:16px}
.segment{display:flex;gap:2px;padding:3px;border-radius:var(--g-r-klein);background:var(--g-fuell)}
.segment button{flex:1;min-height:40px;border-radius:11px;font-size:var(--g-s-klein);font-weight:600;color:var(--g-text2);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px}
.segment button small{font-size:var(--g-s-mini);font-weight:500}
.segment button[aria-pressed="true"]{background:var(--g-an);color:var(--g-text-an);box-shadow:0 1px 4px rgba(0,0,0,.12)}
.haken{display:flex;align-items:center;justify-content:space-between;min-height:44px;font-size:var(--g-s-name);color:var(--g-text);text-align:left;width:100%}
.haken + .haken{border-top:1px solid var(--g-trenn)}
.sw{position:relative;flex:none;width:51px;height:31px;border-radius:16px;background:var(--g-fuell);transition:background-color .2s ease}
.sw::after{content:"";position:absolute;top:2px;left:2px;width:27px;height:27px;border-radius:50%;background:#fff;box-shadow:0 2px 4px rgba(0,0,0,.2);transition:transform .22s cubic-bezier(.32,.72,0,1)}
[aria-checked="true"] .sw{background:var(--g-gruen)}
[aria-checked="true"] .sw::after{transform:translateX(20px)}
.knoepfe{display:flex;gap:var(--g-a2);flex-wrap:wrap}
.knoepfe button{flex:1;min-height:48px;padding:0 var(--g-a4);border-radius:var(--g-r-klein);font-size:var(--g-s-name);font-weight:600;color:var(--g-text)}
.knoepfe .rot{color:var(--g-rot-text)}
.karten-wahl{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:var(--g-a2)}
.karten-wahl button{display:flex;align-items:center;gap:var(--g-a2);min-height:52px;padding:0 var(--g-a3);border-radius:var(--g-r-klein);font-size:var(--g-s-name);font-weight:600;color:var(--g-text);text-align:left}
.karten-wahl button span{display:flex;flex-direction:column}
.karten-wahl small{font-size:var(--g-s-mini);font-weight:500;color:var(--g-text2)}
.karten-wahl button:disabled{opacity:.5}
.karten-wahl ha-icon{--mdc-icon-size:22px;color:var(--g-akzent)}
.neu-zeile{display:flex;gap:var(--g-a2);margin-top:var(--g-a2)}
.neu-zeile input{flex:1;min-width:0;min-height:44px;padding:0 var(--g-a3);border-radius:var(--g-r-klein);border:1px solid var(--g-glas-rand);background:var(--g-fuell);
  font:inherit;font-size:16px;color:var(--g-text);outline-color:var(--g-akzent)}
.neu-zeile button{flex:none;min-height:44px;padding:0 var(--g-a4);border-radius:var(--g-r-klein);font-size:var(--g-s-name);font-weight:600;color:#fff;background:var(--g-akzent-voll)}
.neu-zeile button:disabled{opacity:.45}
.m-hinweis{font-size:var(--g-s-klein);color:var(--g-text2);line-height:1.4}
`;
const GROESSEN_M = [["klein", "S", "1×1"], ["breit", "M", "2×1"], ["gross", "L", "2×2"], ["ganz", "Ganz", "Breite"]];
const SPANNE_M = { klein: 3, breit: 6, gross: 6, ganz: 12 };

// Ausführliches Menü für eine Kachel
async function kachelMenue(quelle, zugriff, i) {
  await haFormLaden();
  const h0 = Glas.hass;
  let eintrag = kopieJ(zugriff.lesen(h0)[i] || {});
  if (eintrag.ordner) return ordnerMenue(quelle, zugriff, i);
  if (!eintrag.entity && !eintrag.karte) return;
  const s = new GlasSchicht({ quelle, hoch: true, titel: "Kachel bearbeiten" });
  let speicherT = null, wegFrage = false;
  const speichern = (sofort) => {
    clearTimeout(speicherT);
    const los = () => zugriff.schreiben(Glas.hass, (l) => { l[i] = kopieJ(eintrag); return l; });
    if (sofort) los(); else speicherT = setTimeout(los, 380);
  };
  // Formularwerte übernehmen: Felder, die fehlen oder leer sind, werden gelöscht
  const uebernehmen = (v, felder) => {
    felder.forEach((k) => { if (v[k] === "" || v[k] === undefined || v[k] === null || (Array.isArray(v[k]) && !v[k].length)) delete eintrag[k]; else eintrag[k] = v[k]; });
  };
  const vorschau = () => {
    const box = s.inhalt.querySelector(".vorschau");
    if (!box || eintrag.karte) return;
    const el = box.firstElementChild?.firstElementChild || document.createElement("glas-kachel-card");
    try { el.setConfig(kachelCfg(eintrag)); } catch (_) { return; }
    el.hass = Glas.hass;
    if (!el.isConnected) { const z = document.createElement("div"); z.appendChild(el); box.appendChild(z); }
    el.parentElement.style.gridColumn = `span ${SPANNE_M[eintrag.groesse || "breit"] || 6}`;
  };
  const zeichnen = () => {
    const h = Glas.hass, x = eintrag, st = x.entity && h.states[x.entity];
    s.dunkel(istDunkel(h));
    const karte = x.karte && listenKarte(x.karte);
    const name = karte ? (karte[4] ? listenKarteName(x) : `${karte[1]}-Karte`) : x.name || st?.attributes.friendly_name || x.entity;
    const an = x.an !== false;
    const raum = zugriff.raum();
    const groessen = karte ? GROESSEN_M.filter(([g]) => g === "breit" || g === "ganz" || (karte[4] && g === "gross")) : GROESSEN_M;
    const anzeige = anzeigeVon(x);
    const scroll = s.inhalt.scrollTop;
    s.inhalt.innerHTML = `<style>${MENUE_CSS}</style>${s.kopfHtml(name, karte ? "Ganze Karte" : x.entity)}
      ${karte ? "" : `<div class="vorschau" aria-hidden="true"></div>`}
      ${karte ? "" : `<div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:link-variant"></ha-icon>Gerät</div><div data-f="geraet"></div></div>`}
      <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:resize"></ha-icon>Größe</div>
        <div class="segment" role="group" aria-label="Größe">${groessen.map(([g, k, t]) => `<button data-g="${g}" aria-pressed="${(x.groesse || "breit") === g || (karte && !karte[4] && g === "breit" && x.groesse !== "ganz")}">${k}<small>${t}</small></button>`).join("")}</div></div>
      ${karte ? `<div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:tune-variant"></ha-icon>Einstellungen</div>
        ${karte[4] ? "" : `<div class="m-hinweis">Gilt für die ${esc(karte[1])}-Karte überall im Dashboard.</div>`}<div data-ked></div></div>` : `
      <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:eye-outline"></ha-icon>Anzeige in der Kachel</div>
        ${ANZEIGE_TEILE.map(([id, t]) => `<button class="haken" role="switch" data-a="${id}" aria-checked="${anzeige.includes(id)}">${t}<span class="sw" aria-hidden="true"></span></button>`).join("")}</div>
      <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:gesture-tap"></ha-icon>Verhalten</div><div data-f="verhalten"></div></div>
      <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:chart-timeline-variant"></ha-icon>Große Ansicht &amp; Verlauf</div><div data-f="verlauf"></div></div>`}
      ${raum ? `<div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:map-marker-outline"></ha-icon>Platz</div><div data-f="platz"></div></div>` : ""}
      ${karte ? "" : `<div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:folder-outline"></ha-icon>In Ordner legen</div>
        <div class="karten-wahl">${zugriff.lesen(h).map((y, k) => (y.ordner ? `<button class="glas" data-in-ordner="${k}"><ha-icon data-i="mdi:folder-outline"></ha-icon><span>${esc(y.name || "Ordner")}<small>${(y.eintraege || []).length} Geräte</small></span></button>` : "")).join("")}
          <button class="glas" data-in-ordner="neu"><ha-icon data-i="mdi:folder-plus-outline"></ha-icon><span>Neuer Ordner</span></button></div>
        <div class="m-hinweis">Oder im Bearbeiten-Modus eine Kachel auf die Mitte einer anderen ziehen und kurz halten.</div></div>`}
      <div class="knoepfe"><button class="glas" data-aus>${an ? "Ausblenden" : "Wieder zeigen"}</button><button class="glas rot" data-weg>${wegFrage ? "Wirklich entfernen?" : "Entfernen"}</button></div>`;
    s.kopfBinden();
    const $ = (q) => s.inhalt.querySelector(q);
    if (karte) {
      // Einstellungen der ganzen Karte direkt hier (eigene Karten im Eintrag, Drucker/Robi gemeinsam unter Bereiche)
      const tag = `${karte[3]}-editor`, box = $("[data-ked]");
      customElements.whenDefined(tag).then(() => {
        if (!box.isConnected) return;
        const ed = document.createElement(tag);
        ed.hass = Glas.hass;
        ed.setConfig({ type: `custom:${karte[3]}`, ...(karte[4] ? x.cfg || {} : (Glas.einst.bereiche || {})[x.karte] || {}) });
        let t = null;
        ed.addEventListener("config-changed", (ev) => {
          ev.stopPropagation();
          const { type, ...rest } = ev.detail.config;
          if (karte[4]) { eintrag.cfg = rest; speichern(); const tt = s.kopfPlatz.querySelector(".titel"); if (tt) tt.textContent = listenKarteName(eintrag); }
          else { clearTimeout(t); t = setTimeout(() => bereichSpeichern(x.karte, rest), 400); }
        });
        box.appendChild(ed);
      });
    }
    if (!karte) {
      haForm($("[data-f=geraet]"), { entity: x.entity, name: x.name, icon: x.icon }, [
        { name: "entity", selector: { entity: {} } },
        { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } }] },
      ], { entity: "Entität", name: "Name (leer = aus HA)", icon: "Symbol (leer = automatisch)" }, (v, f) => {
        const neuE = v.entity && v.entity !== x.entity;
        uebernehmen(v, f); speichern(); vorschau();
        if (neuE) zeichnen();
      });
      const klima = domainVon(x.entity) === "climate";
      haForm($("[data-f=verhalten]"), { typ: x.typ || "auto", farbe: x.farbe || "auto", wischen: x.wischen !== false, hell_wenn_an: x.hell_wenn_an !== false }, [
        { name: "typ", selector: { select: { mode: "dropdown", options: [{ value: "auto", label: "Automatisch" }, { value: "schalter", label: "Schalter (Tippen schaltet)" },
          { value: "regler", label: "Regler (seitlich wischen)" }, { value: "anzeige", label: "Nur anzeigen" }] } } },
        { name: "farbe", selector: { select: { mode: "dropdown", options: FARB_OPTIONEN.map(([value, label]) => ({ value, label })) } } },
        { type: "grid", name: "", schema: [{ name: "wischen", selector: { boolean: {} } }, { name: "hell_wenn_an", selector: { boolean: {} } }] },
        { type: "expandable", flatten: true, name: "akt", title: "Eigene Aktionen (Tippen, Halten …)", icon: "mdi:gesture-double-tap", schema: AKTIONEN_SCHEMA },
      ], { typ: "Verhalten", farbe: "Farbe, wenn an", wischen: "Seitlich wischen regelt", hell_wenn_an: "Hell, wenn an", ...AKTIONEN_LABELS }, (v, f) => {
        uebernehmen(v, f);
        ["wischen", "hell_wenn_an"].forEach((k) => { if (eintrag[k] === true) delete eintrag[k]; });
        if (eintrag.typ === "auto") delete eintrag.typ;
        if (eintrag.farbe === "auto") delete eintrag.farbe;
        speichern(); vorschau();
      });
      haForm($("[data-f=verlauf]"), { verlauf: x.verlauf !== false, verlauf_offen: !!x.verlauf_offen, verlauf_tage: !!x.verlauf_tage, temp_sensor: x.temp_sensor, feuchte_sensor: x.feuchte_sensor, zusatz: x.zusatz }, [
        { type: "grid", name: "", schema: [{ name: "verlauf", selector: { boolean: {} } }, { name: "verlauf_offen", selector: { boolean: {} } }] },
        { name: "verlauf_tage", selector: { boolean: {} } },
        ...(klima ? [{ type: "grid", name: "", schema: [
          { name: "temp_sensor", selector: { entity: { filter: { domain: "sensor", device_class: "temperature" } } } },
          { name: "feuchte_sensor", selector: { entity: { filter: { domain: "sensor", device_class: "humidity" } } } }] }] : []),
        { name: "zusatz", selector: { entity: { multiple: true } } },
      ], { verlauf: "Verlauf zeigen", verlauf_offen: "Verlauf gleich aufgeklappt", verlauf_tage: "7 Tage statt 24 Std.", temp_sensor: "Eigener Temperatursensor", feuchte_sensor: "Eigener Feuchtesensor",
        zusatz: "Weitere Werte als Chips in der Kachel" }, (v, f) => {
        uebernehmen(v, f);
        if (eintrag.verlauf === true) delete eintrag.verlauf;
        ["verlauf_offen", "verlauf_tage"].forEach((k) => { if (!eintrag[k]) delete eintrag[k]; });
        speichern(); vorschau();
      }, { verlauf: "Aufklappbar unten in der großen Ansicht (Symbol antippen oder lange drücken)." });
    }
    if (raum) {
      const andere = (Glas.einst.raeume || []).filter((r) => r.hash !== raum.hash);
      const eigene = Object.keys(raum.gruppen_namen || {}).filter((k) => !GRUPPEN.some(([g]) => g === k));
      const gStandard = x.entity ? gruppeVon(h, x.entity) : `karte-${x.karte}`;
      haForm($("[data-f=platz]"), { gruppe: x.gruppe || gStandard, raum: "" }, [
        { name: "gruppe", selector: { select: { mode: "dropdown", options: [...new Set([...(x.karte ? [gStandard] : []), ...GRUPPEN.map(([g]) => g), ...eigene])].map((g) => ({ value: g, label: gruppenName(raum, g) })) } } },
        { name: "neu_gruppe", selector: { text: {} } },
        ...(andere.length ? [{ name: "raum", selector: { select: { mode: "dropdown", options: [{ value: "", label: "–" }, ...andere.map((r) => ({ value: r.hash, label: r.name }))] } } }] : []),
      ], { gruppe: "Abschnitt im Raum", neu_gruppe: "Oder neuer Abschnitt (Name eintippen)", raum: "In anderen Raum verschieben" }, (v) => {
        if (v.neu_gruppe && v.neu_gruppe.trim()) {
          clearTimeout(speicherT);
          const name = v.neu_gruppe.trim(), key = `eigen-${slug(name)}`;
          eintrag.gruppe = key;
          zugriff.schreiben(Glas.hass, (l, e) => { const r = e.raeume.find((y) => y.hash === raum.hash); r.gruppen_namen = { ...(r.gruppen_namen || {}), [key]: name }; l[i] = kopieJ(eintrag); return l; });
          return;
        }
        if (v.raum) {
          clearTimeout(speicherT);
          zugriff.schreiben(Glas.hass, (l, e) => {
            const ziel = e.raeume.find((r) => r.hash === v.raum);
            if (ziel) ziel.geraete = [...(ziel.geraete || raumGeraeteVorschlag(Glas.hass, ziel.bereich)), { ...kopieJ(eintrag), gruppe: undefined }];
            return l.filter((_, k) => k !== i);
          });
          s.schliessen();
          return;
        }
        if (v.gruppe && v.gruppe !== eintrag.gruppe) { eintrag.gruppe = v.gruppe; speichern(true); }
      });
    }
    s.inhalt.querySelectorAll("[data-g]").forEach((b) => b.addEventListener("click", () => {
      eintrag.groesse = b.dataset.g;
      s.inhalt.querySelectorAll("[data-g]").forEach((o) => o.setAttribute("aria-pressed", o === b));
      speichern(true); vorschau();
    }));
    s.inhalt.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => {
      const id = b.dataset.a, l = anzeigeVon(eintrag);
      let neu = l.includes(id) ? l.filter((y) => y !== id) : ANZEIGE_TEILE.map(([k]) => k).filter((k) => k === id || l.includes(k));
      if (!neu.length) neu = ["symbol"];
      eintrag.anzeige = neu;
      s.inhalt.querySelectorAll("[data-a]").forEach((o) => o.setAttribute("aria-checked", neu.includes(o.dataset.a)));
      speichern(true); vorschau();
    }));
    s.inhalt.querySelectorAll("[data-in-ordner]").forEach((b) => b.addEventListener("click", () => {
      clearTimeout(speicherT);
      const ziel = b.dataset.inOrdner, { gruppe, an: _an, ...rein } = kopieJ(eintrag);
      zugriff.schreiben(Glas.hass, (l) => {
        if (ziel === "neu") { l[i] = { ordner: true, name: "Neuer Ordner", groesse: "breit", an: true, ...(gruppe ? { gruppe } : {}), eintraege: [rein] }; return l; }
        const k = Number(ziel);
        l[k] = { ...l[k], eintraege: [...(l[k].eintraege || []), rein] };
        return l.filter((_, n) => n !== i);
      });
      s.schliessen();
      if (ziel === "neu") setTimeout(() => ordnerMenue(quelle, zugriff, i), 250);
    }));
    $("[data-aus]").addEventListener("click", () => { eintrag.an = eintrag.an === false; speichern(true); zeichnen(); });
    $("[data-weg]").addEventListener("click", () => {
      if (!wegFrage) { wegFrage = true; $("[data-weg]").textContent = "Wirklich entfernen?"; return; }
      clearTimeout(speicherT);
      zugriff.schreiben(Glas.hass, (l) => l.filter((_, k) => k !== i));
      s.schliessen();
    });
    s.inhalt.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
    vorschau();
    s.inhalt.scrollTop = scroll;
  };
  zeichnen();
  s.oeffnen();
}

// Neues Gerät oder ganze Karte hinzufügen
async function neuMenue(quelle, zugriff) {
  await haFormLaden();
  const s = new GlasSchicht({ quelle, titel: "Hinzufügen" });
  const h = Glas.hass, liste = zugriff.lesen(h);
  s.dunkel(istDunkel(h));
  const da = (id) => !listenKarte(id)[4] && liste.some((y) => y.karte === id);
  s.inhalt.innerHTML = `<style>${MENUE_CSS}</style>${s.kopfHtml("Hinzufügen", zugriff.raum()?.name || "Favoriten")}
    <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:link-variant"></ha-icon>Gerät</div><div data-f></div></div>
    <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:card-outline"></ha-icon>Ganze Karte</div><div class="karten-wahl">${LISTEN_KARTEN.map(([id, n, ic]) =>
      `<button class="glas" data-karte="${id}" ${da(id) ? "disabled" : ""}><ha-icon data-i="${ic}"></ha-icon><span>${esc(n)}${da(id) ? `<small>Schon hier</small>` : ""}</span></button>`).join("")}</div></div>`;
  s.kopfBinden();
  const fertig = (neu) => {
    const n = liste.length;
    zugriff.schreiben(Glas.hass, (l) => [...l, neu]);
    s.schliessen();
    if (neu.karte && listenKarte(neu.karte)[4]) setTimeout(() => kachelMenue(quelle, zugriff, n), 200); // gleich einstellen
  };
  haForm(s.inhalt.querySelector("[data-f]"), {}, [{ name: "entity", selector: { entity: {} } }], { entity: "Entität wählen" }, (v) => {
    if (!v.entity) return;
    fertig(zugriff.ort.art === "raum" ? { ...geraetVorschlag(h, v.entity), an: true } : { entity: v.entity, groesse: "breit" });
  });
  s.inhalt.querySelectorAll("[data-karte]").forEach((b) => b.addEventListener("click", () => fertig({ karte: b.dataset.karte, groesse: listenKarte(b.dataset.karte)[4] ? "gross" : "breit", an: true, ...(listenKarte(b.dataset.karte)[4] ? { cfg: {} } : {}) })));
  s.oeffnen();
}

// Name eines Abschnitts im Raum: eigener Name, sonst Standardname
function gruppenName(raum, g) {
  if (!raum?.gruppen_namen?.[g] && g?.startsWith("karte-")) return listenKarte(g.slice(6))?.[1] || "Karte";
  return raum?.gruppen_namen?.[g] || (GRUPPEN.find(([id]) => id === g) || [, g && g.startsWith("eigen-") ? g.slice(6) : "Sonstiges"])[1];
}

// ---------------------------------------------------------------------------
// Startseiten-Abschnitt bearbeiten: zeigen, Breite, alle Einstellungen der Karte
// ---------------------------------------------------------------------------
const ABSCHNITT_EDITOR = { wetter: "glas-wetter-card-editor", planer: "glas-planer-card-editor", sicherheit: "glas-sicherheit-card-editor",
  drucker: "glas-drucker-card-editor", robi: "glas-robi-card-editor", gaeste: "glas-gaeste-card-editor", hinweise: "glas-hinweise-card-editor" };
function bereichSpeichern(id, cfg) {
  const e = kopieJ(Glas.einst);
  e.bereiche = { ...(e.bereiche || {}), [id]: cfg };
  return Glas.einstSpeichern(Glas.hass, e).catch((err) => console.error("Glas: speichern", err));
}
async function abschnittMenue(quelle, zugriff, i, festId = null) {
  await haFormLaden();
  const liste = festId ? [] : zugriff.lesen(Glas.hass);
  const a = festId ? { id: festId } : kopieJ(liste[i] || {});
  const info = ABSCHNITTE.find(([id]) => id === a.id) || [a.id, a.id === "hinweise" ? "Warnungen" : a.id, "mdi:card-outline"];
  const s = new GlasSchicht({ quelle, hoch: true, titel: `${info[1]} bearbeiten` });
  s.dunkel(istDunkel(Glas.hass));
  const zeigenAn = festId ? (Glas.einst.bereiche?.[festId]?.an !== false) : a.an !== false;
  s.inhalt.innerHTML = `<style>${MENUE_CSS}</style>${s.kopfHtml(info[1], "Abschnitt der Startseite")}
    <div class="m-gruppe glas"><button class="haken" role="switch" data-zeigen aria-checked="${zeigenAn}">Auf der Startseite zeigen<span class="sw" aria-hidden="true"></span></button></div>
    ${festId || a.id === "zuhause" ? "" : `<div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:resize"></ha-icon>Darstellung</div>
      <div class="segment" role="group" aria-label="Darstellung">${[["halb", "Halb", "Karte"], ["ganz", "Ganz", "Karte"], ...(WIDGET_ARTEN.includes(a.id) ? [["widget", "Widget", "Quadrat"]] : [])]
        .map(([b, n, k]) => `<button data-b="${b}" aria-pressed="${b === "widget" ? !!a.widget : !a.widget && (a.breite || "ganz") === b}">${n}<small>${k}</small></button>`).join("")}</div>
      ${WIDGET_ARTEN.includes(a.id) ? `<div class="m-hinweis">Widget: quadratisch wie auf dem iPhone-Homescreen, zwei nebeneinander. Antippen öffnet die große Ansicht.</div>` : ""}</div>`}
    ${ABSCHNITT_EDITOR[a.id] ? `<div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:tune-variant"></ha-icon>Einstellungen</div><div data-ed></div></div>`
      : a.id === "favoriten" ? `<div class="m-gruppe glas"><div class="m-hinweis">Die Favoriten bearbeitest du direkt: Kachel antippen oder verschieben, unten „Hinzufügen“.</div></div>` : ""}`;
  s.kopfBinden();
  const abschnittSetzen = (teil) => zugriff.schreiben(Glas.hass, (l) => { l[i] = { ...l[i], ...teil }; return l; });
  s.inhalt.querySelector("[data-zeigen]").addEventListener("click", (ev) => {
    const b = ev.currentTarget, an = b.getAttribute("aria-checked") !== "true";
    b.setAttribute("aria-checked", an);
    if (festId) bereichSpeichern(festId, { ...(Glas.einst.bereiche?.[festId] || {}), an }); else abschnittSetzen({ an });
  });
  s.inhalt.querySelectorAll("[data-b]").forEach((b) => b.addEventListener("click", () => {
    s.inhalt.querySelectorAll("[data-b]").forEach((o) => o.setAttribute("aria-pressed", o === b));
    abschnittSetzen(b.dataset.b === "widget" ? { widget: true } : { breite: b.dataset.b, widget: false });
  }));
  const box = s.inhalt.querySelector("[data-ed]");
  if (box) {
    const tag = ABSCHNITT_EDITOR[a.id];
    await customElements.whenDefined(tag);
    const ed = document.createElement(tag);
    ed.hass = Glas.hass;
    ed.setConfig({ type: `custom:${tag.replace("-editor", "")}`, ...((Glas.einst.bereiche || {})[a.id] || {}) });
    let t = null;
    ed.addEventListener("config-changed", (ev) => {
      ev.stopPropagation();
      const { type, ...rest } = ev.detail.config;
      clearTimeout(t); t = setTimeout(() => bereichSpeichern(a.id, rest), 400);
    });
    box.appendChild(ed);
  }
  s.inhalt.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
  s.oeffnen();
}

// ---------------------------------------------------------------------------
// Raum bearbeiten: Name, Sensoren im Kopf, Chips, Abschnitte umbenennen, Anordnung
// ---------------------------------------------------------------------------
async function raumMenue(quelle, hash) {
  await haFormLaden();
  const raum0 = (Glas.einst?.raeume || []).find((r) => r.hash === hash);
  if (!raum0) return;
  const s = new GlasSchicht({ quelle, hoch: true, titel: `${raum0.name} einstellen` });
  s.dunkel(istDunkel(Glas.hass));
  let r = kopieJ(raum0), t = null;
  const speichern = () => {
    clearTimeout(t);
    t = setTimeout(() => {
      const e = kopieJ(Glas.einst), k = e.raeume.findIndex((x) => x.hash === hash);
      if (k < 0) return;
      e.raeume[k] = { ...e.raeume[k], ...r, geraete: e.raeume[k].geraete };
      Glas.einstSpeichern(Glas.hass, e).catch(() => {});
      quelle.rasterZeichnen?.(); // z. B. neuer leerer Abschnitt sofort sichtbar
    }, 400);
  };
  const h = Glas.hass;
  const benutzt = () => [...new Set((r.geraete || raumGeraeteVorschlag(h, r.bereich)).filter((g) => g.entity || g.karte || g.ordner).map((g) => g.gruppe || (g.entity ? gruppeVon(h, g.entity) : g.ordner ? (g.eintraege?.[0]?.entity && h.states[g.eintraege[0].entity] ? gruppeVon(h, g.eintraege[0].entity) : "sonstiges") : `karte-${g.karte}`)))];
  s.inhalt.innerHTML = `<style>${MENUE_CSS}</style>${s.kopfHtml(r.name, "Raum einstellen")}
    <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:door"></ha-icon>Raum</div><div data-f="raum"></div></div>
    <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:thermometer"></ha-icon>Kopfzeile: Messwerte</div><div data-f="mess"></div></div>
    <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:window-open-variant"></ha-icon>Kopfzeile: Fenster und Türen</div><div data-f="fenster"></div></div>
    <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:motion-sensor"></ha-icon>Kopfzeile: weitere Chips</div><div data-f="chips"></div></div>
    <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:view-grid-outline"></ha-icon>Anordnung</div>
      <div class="segment" role="group" aria-label="Anordnung">${[[1, "Untereinander"], [2, "Nebeneinander"]].map(([n, l]) => `<button data-sp="${n}" aria-pressed="${(r.spalten || 1) === n}">${l}<small>${n === 1 ? "eine Spalte" : "Abschnitte versetzt"}</small></button>`).join("")}</div>
      <div class="m-hinweis">Nebeneinander gilt auf breiten Bildschirmen (PC, Tablet quer). Am Handy bleibt es eine Spalte.</div></div>
    <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:format-title"></ha-icon>Abschnitte</div><div data-f="namen"></div>
      <form class="neu-zeile" data-neu><input type="text" placeholder="Neuer Abschnitt, z. B. Sofa-Ecke" aria-label="Name des neuen Abschnitts" enterkeyhint="done"><button type="submit" disabled>Hinzufügen</button></form>
      <div class="m-hinweis">Ein neuer Abschnitt erscheint leer im Raum. Kacheln ziehst du im Bearbeiten-Modus hinein. Leere Abschnitte ohne Namen verschwinden.</div></div>`;
  s.kopfBinden();
  const $ = (q) => s.inhalt.querySelector(q);
  const nimm = (v, f) => { f.forEach((k) => { if (v[k] === "" || v[k] === undefined || (Array.isArray(v[k]) && !v[k].length)) delete r[k]; else r[k] = v[k]; }); speichern(); };
  haForm($("[data-f=raum]"), { name: r.name, icon: r.icon, bereich: r.bereich }, [
    { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "icon", selector: { icon: {} } }] },
    { name: "bereich", selector: { area: {} } },
  ], { name: "Name", icon: "Symbol", bereich: "HA-Bereich" }, nimm);
  haForm($("[data-f=mess]"), { temperatur: r.temperatur, feuchte: r.feuchte }, [
    { name: "temperatur", selector: { entity: { filter: { domain: "sensor", device_class: "temperature" } } } },
    { name: "feuchte", selector: { entity: { filter: { domain: "sensor", device_class: "humidity" } } } },
  ], { temperatur: "Temperatursensor (leer = automatisch)", feuchte: "Luftfeuchtesensor (leer = automatisch)" }, nimm);
  const fensterForm = () => {
    const box = $("[data-f=fenster]");
    box.replaceChildren();
    const alle = raumFensterAlle(h, r);
    haForm(box, { fenster_zeigen: raumFensterGezeigt(h, r) }, [
      ...(alle.length ? [{ name: "fenster_zeigen", selector: { select: { multiple: true, mode: "list", options: alle.map((e) => ({ value: e, label: `${h.states[e]?.attributes.friendly_name || e}${raumFensterAuto(h, r.bereich).includes(e) ? "" : " (hinzugefügt)"}` })) } } }] : []),
      { name: "fenster_neu", selector: { entity: { filter: { domain: "binary_sensor", device_class: CHIP_KLASSEN } } } },
    ], { fenster_zeigen: "Oben anzeigen", fenster_neu: "Weiteren Sensor hinzufügen" }, (v) => {
      const gezeigt = [...(v.fenster_zeigen || []), ...(v.fenster_neu && !(v.fenster_zeigen || []).includes(v.fenster_neu) ? [v.fenster_neu] : [])];
      raumFensterSetzen(h, r, gezeigt);
      speichern();
      if (v.fenster_neu) fensterForm();
    }, alle.length ? {} : { fenster_neu: "Im Bereich gibt es keine Fenster- oder Türsensoren." });
  };
  fensterForm();
  haForm($("[data-f=chips]"), { bewegung: r.bewegung, chips: r.chips, verlauf_chip: r.verlauf_chip !== false, alles_aus: r.alles_aus !== false }, [
    { name: "bewegung", selector: { entity: { multiple: true, filter: { domain: "binary_sensor", device_class: ["motion", "occupancy", "presence"] } } } },
    { name: "chips", selector: { entity: { multiple: true } } },
    { type: "grid", name: "", schema: [{ name: "verlauf_chip", selector: { boolean: {} } }, { name: "alles_aus", selector: { boolean: {} } }] },
  ], { bewegung: "Bewegungsmelder", chips: "Weitere Chips (beliebige Entitäten)",
    verlauf_chip: "Chip „Verlauf“", alles_aus: "Knopf „Alles aus“" }, (v, f) => {
    nimm(v, f);
    ["verlauf_chip", "alles_aus"].forEach((k) => { if (r[k] === true) delete r[k]; });
  });
  const namenZeichnen = () => {
    const genutzt = benutzt();
    const alle = [...genutzt, ...Object.keys(r.gruppen_namen || {}).filter((g) => g.startsWith("eigen-") && !genutzt.includes(g))];
    const box = $("[data-f=namen]");
    box.replaceChildren();
    haForm(box, Object.fromEntries(alle.map((g) => [`gn_${g}`, r.gruppen_namen?.[g] || ""])), alle.map((g) => ({ name: `gn_${g}`, selector: { text: {} } })),
      Object.fromEntries(alle.map((g) => [`gn_${g}`, g.startsWith("eigen-") ? `Eigener Abschnitt${genutzt.includes(g) ? "" : " (noch leer)"}` : `${gruppenName(null, g)} heißt …`])), (v) => {
        const gn = { ...(r.gruppen_namen || {}) };
        alle.forEach((g) => { const w = (v[`gn_${g}`] || "").trim(); if (w) gn[g] = w; else if (!g.startsWith("eigen-") || !genutzt.includes(g)) delete gn[g]; });
        r.gruppen_namen = gn; speichern();
      });
  };
  namenZeichnen();
  const neuForm = $("[data-neu]"), neuIn = neuForm.querySelector("input"), neuKnopf = neuForm.querySelector("button");
  neuIn.addEventListener("input", () => { neuKnopf.disabled = !neuIn.value.trim(); });
  neuForm.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const name = neuIn.value.trim(); if (!name) return;
    let key = `eigen-${slug(name)}`, n = 2;
    while (r.gruppen_namen?.[key] || benutzt().includes(key)) key = `eigen-${slug(name)}-${n++}`;
    r.gruppen_namen = { ...(r.gruppen_namen || {}), [key]: name };
    neuIn.value = ""; neuKnopf.disabled = true;
    speichern(); namenZeichnen();
  });
  s.inhalt.querySelectorAll("[data-sp]").forEach((b) => b.addEventListener("click", () => {
    s.inhalt.querySelectorAll("[data-sp]").forEach((o) => o.setAttribute("aria-pressed", o === b));
    r.spalten = Number(b.dataset.sp); if (r.spalten === 1) delete r.spalten; speichern();
  }));
  s.inhalt.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
  s.oeffnen();
}
// ---------------------------------------------------------------------------
// Verläufe: Sensor-Kurven und An/Aus-Zeitleisten aus der HA-Historie
// Einzeln in der großen Ansicht eines Sensors, gesammelt in der Raum-Verlaufsansicht
// ---------------------------------------------------------------------------
const VERLAUF_CSS = `
.zeitraum{display:flex;gap:var(--g-a2);margin:var(--g-a1) 0 var(--g-a2)}
.v-gruppe{display:flex;flex-direction:column;gap:var(--g-a2);margin-bottom:var(--g-a3)}
.v-gruppe-titel{margin:var(--g-a2) var(--g-a1) 0;font-size:var(--g-s-klein);font-weight:600;letter-spacing:.3px;text-transform:uppercase;color:var(--g-text2)}
.v-karte{display:flex;flex-direction:column;gap:6px;padding:var(--g-a3) var(--g-a4);border-radius:var(--g-r);text-align:left;width:100%;color:inherit;font:inherit}
.v-karte.fokus{box-shadow:0 0 0 2px var(--g-blau,#0a84ff)}
.v-kopf{display:flex;align-items:baseline;justify-content:space-between;gap:var(--g-a2)}
.v-kopf b{font-size:var(--g-s-name);font-weight:600;color:var(--g-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.v-kopf span{flex:none;font-size:var(--g-s-name);font-weight:600;color:var(--g-text2);font-variant-numeric:tabular-nums}
.v-kurve{display:block;width:100%;height:84px;overflow:visible}
.v-kurve .linie{fill:none;stroke:var(--vf);stroke-width:2;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke}
.v-kurve .flaeche{fill:var(--vf);opacity:.14}
.v-achse{display:flex;justify-content:space-between;font-size:var(--g-s-mini);color:var(--g-text2);font-variant-numeric:tabular-nums}
.v-minmax{display:flex;gap:var(--g-a3);font-size:var(--g-s-mini);color:var(--g-text2)}
.v-leiste{position:relative;height:14px;border-radius:7px;background:var(--g-fuell);overflow:hidden}
.v-leiste i{position:absolute;top:0;bottom:0;background:var(--vf);border-radius:3px}
.v-klapp{display:flex;align-items:center;justify-content:space-between;gap:var(--g-a2);width:100%;min-height:52px;padding:0 var(--g-a4);border-radius:var(--g-r);
  font-size:var(--g-s-name);font-weight:600;color:var(--g-text);text-align:left}
.v-klapp ha-icon{transition:transform .25s cubic-bezier(.32,.72,0,1)}
.v-klapp[aria-expanded="true"] ha-icon{transform:rotate(180deg)}
.v-klapp .leise{margin-left:auto;font-weight:500}
.v-inhalt{display:flex;flex-direction:column;gap:var(--g-a2);animation:aufklappen .28s cubic-bezier(.32,.72,0,1)}
@keyframes aufklappen{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
.v-leer{font-size:var(--g-s-klein);color:var(--g-text2);padding:var(--g-a2) 0}
`;
// Historie holen: { entity_id: [{ t: ms, s: zustand }] }
async function verlaufHolen(h, ids, stunden) {
  const bis = Date.now(), von = bis - stunden * 36e5;
  if (!ids.length) return { von, bis, daten: {} };
  const anfrage = (eids, mitAttr) => h.callWS({ type: "history/history_during_period", start_time: new Date(von).toISOString(), end_time: new Date(bis).toISOString(),
    entity_ids: eids, minimal_response: !mitAttr, no_attributes: !mitAttr, significant_changes_only: false }).catch((e) => { console.warn("Glas: Verlauf", e); return {}; });
  const normal = ids.filter((i) => !i.includes("@")), attr = [...new Set(ids.filter((i) => i.includes("@")).map((i) => i.split("@")[0]))];
  const [r, ra] = await Promise.all([normal.length ? anfrage(normal, false) : {}, attr.length ? anfrage(attr, true) : {}]);
  const zeit = (x) => ((x.lu ?? x.lc) != null ? (x.lu ?? x.lc) * 1000 : Date.parse(x.last_updated || x.last_changed));
  const daten = {};
  for (const id of ids) {
    const [eid, at] = id.split("@");
    let letzt;
    daten[id] = ((at ? ra : r)[eid] || []).map((x) => {
      // Attribute: im komprimierten Format „a“, sonst „attributes“; fehlende Werte gelten weiter
      const v = at ? ((x.a || x.attributes || {})[at] ?? letzt) : (x.s ?? x.state);
      letzt = v;
      return { t: zeit(x), s: v };
    }).filter((x) => !isNaN(x.t) && x.s != null).map((x) => ({ ...x, t: Math.max(x.t, von) }));
  }
  return { von, bis, daten };
}
const zahl = (v, st) => {
  const n = Number(v);
  if (isNaN(n)) return "–";
  const stellen = Math.abs(n) >= 100 ? 0 : 1;
  return `${n.toFixed(stellen).replace(".", ",")}${st?.attributes.unit_of_measurement ? ` ${st.attributes.unit_of_measurement}` : ""}`;
};
const istZahlSensor = (st) => st && domainVon(st.entity_id) === "sensor" && (st.attributes.unit_of_measurement != null || st.attributes.state_class) && !isNaN(Number(st.state));
const VERLAUF_FARBE = { temperature: "#ff9f0a", humidity: "#0a84ff", carbon_dioxide: "#34c759", pm25: "#af52de", illuminance: "#ffcc00", power: "#ff375f", energy: "#ff375f" };
function achseHtml(von, bis) {
  const tage = (bis - von) / 864e5 > 1.5;
  const n = tage ? 7 : 5;
  const teile = [...Array(n)].map((_, i) => {
    const d = new Date(von + (bis - von) * i / (n - 1));
    return tage ? d.toLocaleDateString("de-DE", { weekday: "short" }) : (i === n - 1 ? "jetzt" : `${String(d.getHours()).padStart(2, "0")}:00`);
  });
  return `<div class="v-achse">${teile.map((t) => `<span>${t}</span>`).join("")}</div>`;
}
// Linie für Zahlensensoren
function kurveHtml(punkte, von, bis, st) {
  const p = punkte.map((x) => ({ t: x.t, v: Number(x.s) })).filter((x) => !isNaN(x.v));
  if (st && !isNaN(Number(st.state))) p.push({ t: bis, v: Number(st.state) });
  if (p.length < 2) return `<div class="v-leer">Noch kein Verlauf in diesem Zeitraum.</div>`;
  let min = Math.min(...p.map((x) => x.v)), max = Math.max(...p.map((x) => x.v));
  const spanne = max - min || 1, unten = min - spanne * 0.1, oben = max + spanne * 0.1;
  const X = (t) => ((t - von) / (bis - von)) * 300, Y = (v) => 80 - ((v - unten) / (oben - unten)) * 76;
  // Stufen statt Schrägen: Messwert gilt bis zum nächsten
  let d = `M${X(p[0].t).toFixed(1)},${Y(p[0].v).toFixed(1)}`;
  for (let i = 1; i < p.length; i++) d += ` L${X(p[i].t).toFixed(1)},${Y(p[i - 1].v).toFixed(1)} L${X(p[i].t).toFixed(1)},${Y(p[i].v).toFixed(1)}`;
  const flaeche = `${d} L${X(p[p.length - 1].t).toFixed(1)},80 L${X(p[0].t).toFixed(1)},80 Z`;
  return `<svg class="v-kurve" viewBox="0 0 300 80" preserveAspectRatio="none" aria-hidden="true"><path class="flaeche" d="${flaeche}"/><path class="linie" d="${d}"/></svg>
    ${achseHtml(von, bis)}<div class="v-minmax"><span>Tief ${zahl(min, st)}</span><span>Hoch ${zahl(max, st)}</span></div>`;
}
// Zeitleiste für An/Aus, Offen/Zu
const istAktivZustand = (s) => ["on", "open", "heat", "heating", "cool", "cooling", "playing", "home", "detected", "unlocked", "cleaning", "printing", "running", "armed_away", "armed_home", "armed_night", "triggered"].includes(String(s).toLowerCase());
function leisteHtml(punkte, von, bis, st) {
  const p = [...punkte];
  if (!p.length && st) p.push({ t: von, s: st.state });
  const teile = [];
  let anzahl = 0, dauer = 0;
  p.forEach((x, i) => {
    if (!istAktivZustand(x.s)) return;
    const ende = p[i + 1]?.t ?? bis;
    if (i === 0 || !istAktivZustand(p[i - 1].s)) anzahl++;
    dauer += ende - x.t;
    teile.push(`<i style="left:${((x.t - von) / (bis - von)) * 100}%;width:${Math.max(0.6, ((ende - x.t) / (bis - von)) * 100)}%"></i>`);
  });
  const std = dauer / 36e5;
  const summe = !anzahl ? "nie" : `${anzahl}× · ${std >= 1 ? `${std.toFixed(1).replace(".", ",")} Std.` : `${Math.max(1, Math.round(dauer / 6e4))} Min.`}`;
  return { html: `<div class="v-leiste" aria-hidden="true">${teile.join("")}</div>${achseHtml(von, bis)}`, summe };
}
// Attribut-Verlauf (z. B. Raumtemperatur des Thermostats ohne eigenen Sensor)
function verlaufAttrHtml(h, id, v) {
  const [eid, at] = id.split("@"), st = h.states[eid];
  if (!st) return "";
  if (at === "hvac_action") {
    const l = leisteHtml(v.daten[id] || [], v.von, v.bis, { state: st.attributes.hvac_action });
    return `<div class="v-karte glas" style="--vf:#ff9f0a"><div class="v-kopf"><b>Heizt</b><span>${esc(l.summe)}</span></div>${l.html}</div>`;
  }
  const einheit = h.config?.unit_system?.temperature || "°C";
  const pseudo = { entity_id: eid, state: String(st.attributes[at] ?? ""), attributes: { unit_of_measurement: einheit } };
  return `<div class="v-karte glas" style="--vf:#ff9f0a"><div class="v-kopf"><b>Raumtemperatur</b><span>${esc(zahl(st.attributes[at], pseudo))}</span></div>
    ${kurveHtml(v.daten[id] || [], v.von, v.bis, pseudo)}</div>`;
}
// Aufklappbarer Abschnitt „Verlauf“ – in jeder großen Ansicht gleich (standardmäßig zu, lädt erst beim Aufklappen)
function verlaufKlappHtml(h, ids, z) {
  const inhalt = !z.auf ? "" : `<div class="v-inhalt">${zeitraumHtml(z.stunden)}${z.daten ? ids.map((e) => (e.includes("@") ? verlaufAttrHtml(h, e, z.daten) : verlaufKarteHtml(h, e, z.daten))).join("")
    : `<div class="v-leer">Lade Verlauf …</div>`}</div>`;
  return `<div class="abschnitt"><button class="v-klapp glas" data-vklapp aria-expanded="${z.auf}"><span>Verlauf</span><span class="leise">${z.stunden === 24 ? "24 Std." : "7 Tage"}</span>
    <ha-icon data-i="mdi:chevron-down"></ha-icon></button>${inhalt}</div>`;
}
function verlaufKlappBinden(root, z, laden, zeichnen) {
  root.querySelector("[data-vklapp]")?.addEventListener("click", () => { z.auf = !z.auf; if (z.auf && !z.daten) laden(); else zeichnen(); });
  root.querySelectorAll("[data-zeitraum]").forEach((b) => b.addEventListener("click", () => { z.stunden = Number(b.dataset.zeitraum); laden(); }));
  root.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
}
function verlaufKarteHtml(h, eid, v, fokus) {
  const st = h.states[eid];
  if (!st) return "";
  const dc = st.attributes.device_class;
  const name = esc(st.attributes.friendly_name || eid);
  const tag = fokus !== undefined ? "button" : "div";
  if (istZahlSensor(st)) {
    return `<${tag} class="v-karte glas ${fokus ? "fokus" : ""}" data-ve="${esc(eid)}" style="--vf:${VERLAUF_FARBE[dc] || "#0a84ff"}"><div class="v-kopf"><b>${name}</b><span>${esc(zustandText(h, st))}</span></div>
      ${kurveHtml(v.daten[eid] || [], v.von, v.bis, st)}</${tag}>`;
  }
  const l = leisteHtml(v.daten[eid] || [], v.von, v.bis, st);
  const farbe = domainVon(eid) === "light" ? "#ffcc00" : ["window", "door", "garage_door", "opening"].includes(dc) ? "#ff9f0a" : ["motion", "occupancy", "presence"].includes(dc) ? "#5e5ce6" : "#34c759";
  return `<${tag} class="v-karte glas ${fokus ? "fokus" : ""}" data-ve="${esc(eid)}" style="--vf:${farbe}"><div class="v-kopf"><b>${name}</b><span>${esc(zustandText(h, st))} · ${l.summe}</span></div>${l.html}</${tag}>`;
}
const ZEITRAEUME = [[24, "24 Std."], [168, "7 Tage"]];
const zeitraumHtml = (stunden) => `<div class="zeitraum" role="group" aria-label="Zeitraum">${ZEITRAEUME.map(([s, n]) =>
  `<button class="pille fuell ${stunden === s ? "aktiv" : ""}" data-zeitraum="${s}" aria-pressed="${stunden === s}">${n}</button>`).join("")}</div>`;

// Raum-Verlauf: Luft, Fenster & Türen, Licht, Bewegung, Heizung – alles aus dem HA-Bereich
const RAUM_VERLAUF_GRUPPEN = [
  ["Luft", (st) => istZahlSensor(st) && ["temperature", "humidity", "carbon_dioxide", "pm25", "pm10", "volatile_organic_compounds", "illuminance"].includes(st.attributes.device_class)],
  ["Fenster & Türen", (st) => istFenster(st)],
  ["Licht", (st) => domainVon(st.entity_id) === "light"],
  ["Bewegung & Anwesenheit", (st) => domainVon(st.entity_id) === "binary_sensor" && ["motion", "occupancy", "presence"].includes(st.attributes.device_class)],
  ["Heizung & Klima", (st) => ["climate", "fan", "humidifier"].includes(domainVon(st.entity_id))],
  ["Strom", (st) => istZahlSensor(st) && st.attributes.device_class === "power"],
];
function raumVerlaufOeffnen(quelle, bereich, raumName, fokus) {
  const s = new GlasSchicht({ quelle, hoch: true, titel: `Verlauf ${raumName || ""}`.trim() });
  let stunden = 24, v = null, laedt = false;
  const h0 = Glas.hass || quelle._hass;
  const alle = bereich ? Object.keys(h0.states).filter((e) => bereichVon(h0, e) === bereich && !h0.entities?.[e]?.hidden && h0.entities?.[e]?.entity_category !== "diagnostic") : [];
  if (fokus && !alle.includes(fokus)) alle.unshift(fokus);
  const gruppen = RAUM_VERLAUF_GRUPPEN.map(([n, f]) => [n, alle.filter((e) => h0.states[e] && f(h0.states[e]))]).filter(([, l]) => l.length);
  const ids = [...new Set(gruppen.flatMap(([, l]) => l))];
  const zeichnen = () => {
    const h = Glas.hass || quelle._hass;
    s.dunkel(istDunkel(h));
    s.inhalt.innerHTML = `<style>${VERLAUF_CSS}</style>${s.kopfHtml("Verlauf", [raumName, stunden === 24 ? "letzte 24 Stunden" : "letzte 7 Tage"].filter(Boolean).join(" · "))}${zeitraumHtml(stunden)}
      ${!ids.length ? `<div class="v-leer">In diesem Raum gibt es keine Sensoren mit Verlauf.</div>` : !v ? `<div class="v-leer">Lade Verlauf …</div>`
        : gruppen.map(([n, l]) => `<div class="v-gruppe-titel">${esc(n)}</div><div class="v-gruppe">${l.map((e) => verlaufKarteHtml(h, e, v, e === fokus)).join("")}</div>`).join("")}`;
    s.kopfBinden();
    s.inhalt.querySelectorAll("[data-zeitraum]").forEach((b) => b.addEventListener("click", () => { stunden = Number(b.dataset.zeitraum); laden(); }));
    s.inhalt.querySelectorAll("button[data-ve]").forEach((b) => b.addEventListener("click", () => steuerungOeffnen(quelle, b.dataset.ve, {})));
    if (fokus && v && !s._gescrollt) { s._gescrollt = true; s.inhalt.querySelector(".fokus")?.scrollIntoView({ block: "center" }); }
  };
  const laden = async () => {
    if (laedt) return;
    laedt = true; v = null; zeichnen();
    v = await verlaufHolen(Glas.hass || quelle._hass, ids, stunden);
    laedt = false; zeichnen();
  };
  s.oeffnen();
  laden();
  return s;
}
// ---------------------------------------------------------------------------
// Apple-Bausteine: Ordner (wie iPhone-Ordner) und Vorschau bei langem Drücken
// ---------------------------------------------------------------------------

// Feder auf ein Element: stil(p) liefert die Stile für Lage p (von → nach). Läuft als fertige Keyframes auf der Grafikkarte.
function federAnim(el, stil, { von = 0, nach = 1, v = 0, antwort = 0.42, daempfung = 0.86 } = {}) {
  const sp = nach - von;
  Object.assign(el.style, stil(nach));
  if (SCHICHT_RUHIG.matches) {
    const a = stil(von), b = stil(nach);
    return el.animate([{ opacity: a.opacity ?? 1 }, { opacity: b.opacity ?? 1 }], { duration: 160, easing: "ease" });
  }
  const { werte, dauer } = federVerlauf(sp ? v / sp : 0, { antwort, daempfung });
  return el.animate(werte.map((p) => stil(von + sp * p)), { duration: dauer, easing: "linear" });
}
const vibrieren = (ms = 10) => { try { navigator.vibrate?.(ms); } catch (_) { /* */ } };

// Eine Ebene über allem (Portal), mit unscharfem, abgedunkeltem Hintergrund
const EBENE_CSS = `
.dimm{position:fixed;inset:0;background:rgba(0,0,0,.22);-webkit-backdrop-filter:blur(18px) saturate(140%);backdrop-filter:blur(18px) saturate(140%);opacity:0;touch-action:none}
.wurzel.dunkel .dimm{background:rgba(0,0,0,.45)}
`;
class GlasEbene {
  constructor({ quelle, css = "", label = "", zu }) {
    this.quelle = quelle; this.zu = zu;
    this.host = document.createElement("div");
    this.host.style.cssText = "position:relative;z-index:7";
    this.root = this.host.attachShadow({ mode: "open" });
    this.root.innerHTML = `<style>${TOKENS.replace(":host{", ".wurzel{").replace(":host([dunkel]){", ".wurzel.dunkel{")}${EBENE_CSS}${css}</style>
      <div class="wurzel ${istDunkel(Glas.hass) ? "dunkel" : ""}" role="dialog" aria-modal="true" aria-label="${esc(label)}"><div class="dimm"></div></div>`;
    this.wurzel = this.root.querySelector(".wurzel");
    this.dimm = this.root.querySelector(".dimm");
    this.dimm.addEventListener("click", () => this.schliessen());
    this._taste = (e) => { if (e.key === "Escape" && GlasEbene.oben === this && GlasSchicht.stapel.length <= this._stapel) { e.stopImmediatePropagation(); this.schliessen(); } };
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
  oeffnen() {
    portalWurzel().appendChild(this.host);
    this._vorher = GlasEbene.oben; GlasEbene.oben = this;
    this._fokusVorher = document.activeElement;
    this._stapel = GlasSchicht.stapel.length; // Blätter, die schon offen waren (z. B. Raum), liegen darunter
    document.addEventListener("keydown", this._taste, true);
    federAnim(this.dimm, (p) => ({ opacity: String(klemmen(p, 0, 1)) }), { antwort: 0.3, daempfung: 1 });
  }
  schliessen() {
    if (this._weg) return Promise.resolve();
    this._weg = true;
    if (GlasEbene.oben === this) GlasEbene.oben = this._vorher || null;
    document.removeEventListener("keydown", this._taste, true);
    this.wurzel.style.pointerEvents = "none";
    const fertig = this.wegAnimieren?.() || Promise.resolve();
    const d = federAnim(this.dimm, (p) => ({ opacity: String(klemmen(1 - p, 0, 1)) }), { antwort: 0.28, daempfung: 1 });
    return Promise.all([fertig, d.finished.catch(() => {})]).then(() => { this.host.remove(); this.zu?.(); try { this._fokusVorher?.focus?.({ preventScroll: true }); } catch (_) { /* */ } });
  }
}
GlasEbene.oben = null;

// ---------------------------------------------------------------------------
// glas-ordner-card: mehrere Kacheln in einem Ordner. Antippen lässt ihn zum großen Glas-Feld wachsen.
// Größe L = Smart-Stapel: die ersten vier Geräte direkt bedienbar.
// ---------------------------------------------------------------------------
const ORDNER_CSS = `
:host{display:block;height:100%}
.ordner{position:relative;width:100%;height:100%;min-height:var(--g-kachel-h);display:flex;align-items:center;gap:var(--g-a3);padding:var(--g-a3);
  border-radius:var(--g-r);text-align:left;color:var(--g-text);overflow:hidden}
.ordner.klein{flex-direction:column;justify-content:center;gap:4px;padding:var(--g-a1) 6px}
.vier{flex:none;display:grid;grid-template-columns:repeat(2,18px);grid-auto-rows:18px;gap:3px;padding:4px;border-radius:12px;background:var(--g-fuell)}
.mini{width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(120,120,128,.18);color:var(--g-fuell-text)}
.mini ha-state-icon{--mdc-icon-size:11px}
.mini.an{background:var(--sf);color:#fff}
.text{min-width:0;flex:1;display:flex;flex-direction:column;gap:2px}
.name{font-size:var(--g-s-name);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.zustand{font-size:var(--g-s-klein);color:var(--g-text2)}
.pfeil{flex:none;color:var(--g-text2)}
.kname{max-width:100%;font-size:var(--g-s-mini);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.stapel{height:100%;min-height:calc(var(--g-kachel-h) * 2 + var(--g-a2));display:flex;flex-direction:column;gap:var(--g-a2);padding:var(--g-a3);border-radius:var(--g-r)}
.stapel .kopf{display:flex;align-items:center;gap:var(--g-a2);min-height:28px;text-align:left;color:var(--g-text)}
.stapel .kopf .text{flex-direction:row;align-items:baseline;gap:var(--g-a2)}
.vierer{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:6px}
.mk{display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;gap:2px;min-height:52px;padding:6px 8px;border-radius:var(--g-r-klein);
  background:var(--g-fuell);color:var(--g-text);text-align:left;min-width:0}
.mk.an{background:var(--g-an);color:var(--g-text-an)}
.mk .mini{width:24px;height:24px}
.mk .mini ha-state-icon{--mdc-icon-size:14px}
.mk b{font-size:var(--g-s-mini);font-weight:600;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
`;
const ordnerAnzahl = (h, eintraege) => {
  const da = (eintraege || []).filter((x) => x.entity && h.states[x.entity]);
  const schaltbar = da.filter((x) => Geraet.schaltbar(h.states[x.entity]));
  const an = da.filter((x) => Geraet.istAn(h.states[x.entity])).length;
  return { da, text: schaltbar.length ? `${an} von ${schaltbar.length} an` : `${da.length} ${da.length === 1 ? "Gerät" : "Geräte"}`, an };
};
const miniHtml = (h, x) => {
  const st = h.states[x.entity], an = Geraet.istAn(st);
  return `<span class="mini ${an ? "an" : ""}" style="--sf:${farbeAus(x.farbe, Geraet.farbe(st))}"><ha-state-icon data-e="${esc(x.entity)}" ${x.icon ? `data-i="${esc(x.icon)}"` : ""}></ha-state-icon></span>`;
};

class GlasOrdnerCard extends GlasKarte {
  static standard() { return { name: "Ordner", groesse: "breit", eintraege: [] }; }
  static getConfigElement() { return document.createElement("glas-ordner-card-editor"); }
  static getStubConfig(hass) { return { name: "Lichter", eintraege: Object.keys(hass.states).filter((e) => e.startsWith("light.")).slice(0, 4).map((entity) => ({ entity })) }; }
  getCardSize() { return this._config?.groesse === "gross" ? 3 : 1; }
  getGridOptions() {
    const g = this._config?.groesse;
    return g === "klein" ? { columns: 3, rows: "auto" } : g === "ganz" ? { columns: 12, rows: "auto" } : g === "gross" ? { columns: 6, rows: 3 } : { columns: 6, rows: "auto" };
  }
  entitaeten() { return (this._config.eintraege || []).map((x) => x.entity).filter(Boolean); }
  css() { return ORDNER_CSS; }
  html() {
    const h = this._hass, c = this._config, g = c.groesse || "breit";
    const { da, text } = ordnerAnzahl(h, c.eintraege);
    const vier = `<span class="vier" aria-hidden="true">${da.slice(0, 4).map((x) => miniHtml(h, x)).join("")}</span>`;
    const label = `Ordner ${esc(c.name)}, ${esc(text)}`;
    if (g === "klein") return `<button class="ordner glas k klein" data-auf aria-haspopup="dialog" aria-label="${label}">${vier}<span class="kname">${esc(c.name)}</span></button>`;
    if (g === "gross") {
      return `<div class="stapel glas"><button class="kopf" data-auf aria-haspopup="dialog" aria-label="${label}"><span class="text"><span class="name">${esc(c.name)}</span><span class="zustand">${esc(text)}</span></span>
        <ha-icon class="pfeil" data-i="mdi:arrow-expand"></ha-icon></button><div class="vierer">${da.slice(0, 4).map((x) => {
          const st = h.states[x.entity];
          return `<button class="mk k ${Geraet.istAn(st) ? "an" : ""}" data-e="${esc(x.entity)}" aria-label="${esc(x.name || st.attributes.friendly_name)}: ${esc(Geraet.zustand(h, st, Geraet.regler(st)))}">
            ${miniHtml(h, x)}<b>${esc(x.name || st.attributes.friendly_name || x.entity)}</b></button>`;
        }).join("")}</div></div>`;
    }
    return `<button class="ordner glas k ${g}" data-auf aria-haspopup="dialog" aria-label="${label}">${vier}<span class="text"><span class="name">${esc(c.name)}</span><span class="zustand">${esc(text)}</span></span>
      <ha-icon class="pfeil" data-i="mdi:chevron-right"></ha-icon></button>`;
  }
  binden() {
    this.iconsSetzen();
    this.$("[data-auf]")?.addEventListener("click", () => ordnerOeffnen(this));
    this.$$("[data-e]").forEach((b) => {
      let t = null, lang = false;
      b.addEventListener("pointerdown", () => { lang = false; t = setTimeout(() => { lang = true; vibrieren(12); steuerungOeffnen(this, b.dataset.e, (this._config.eintraege || []).find((x) => x.entity === b.dataset.e) || {}); }, 480); });
      ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => b.addEventListener(ev, () => clearTimeout(t)));
      b.addEventListener("click", () => {
        if (lang) return;
        const st = this._hass.states[b.dataset.e];
        if (Geraet.schaltbar(st) || Geraet.ausloesbar(st)) { vibrieren(8); Geraet.schalten(this._hass, st); } else steuerungOeffnen(this, b.dataset.e, {});
      });
    });
  }
}

// Großes Glas-Feld: wächst aus der Ordner-Kachel, darin normale Kacheln
const ORDNER_FELD_CSS = `
.feld{position:fixed;left:50%;top:50%;width:min(560px,calc(100vw - 32px));max-height:calc(100dvh - 96px);overflow:auto;overscroll-behavior:contain;
  translate:-50% -50%;padding:var(--g-a5);border-radius:var(--g-r-blatt);background:var(--g-glas);border:1px solid var(--g-glas-rand);
  -webkit-backdrop-filter:blur(30px) saturate(170%);backdrop-filter:blur(30px) saturate(170%);box-shadow:0 30px 80px rgba(0,0,0,.25);transform-origin:0 0;scrollbar-width:none}
.wurzel:not(.dunkel) .feld{background:rgba(255,255,255,.62)}
.feld::-webkit-scrollbar{display:none}
.feld h2{margin:0;font-size:var(--g-s-titel);font-weight:800;letter-spacing:-.4px;color:var(--g-text);line-height:1.15}
.feld .unter{margin:2px 0 var(--g-a4);font-size:var(--g-s-name);color:var(--g-text2)}
.kacheln{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:var(--g-a2)}
.kacheln > *{min-width:0}
.feld .inhalt-an{opacity:0}
`;
const ORDNER_SPANNE = { klein: 4, breit: 6, gross: 6, ganz: 12 };
function ordnerOeffnen(karte) {
  const c = karte._config, h = karte._hass;
  const quellRect = karte.getBoundingClientRect();
  const e = new GlasEbene({ quelle: karte, css: ORDNER_FELD_CSS, label: c.name, zu: () => Glas.hassHoerer.delete(neu) });
  const feld = document.createElement("div");
  feld.className = "feld";
  feld.innerHTML = `<div class="inhalt"><h2>${esc(c.name)}</h2><div class="unter"></div><div class="kacheln"></div></div>`;
  e.wurzel.appendChild(feld);
  const kacheln = (c.eintraege || []).filter((x) => x.entity).map((x) => {
    const el = document.createElement("glas-kachel-card");
    try { el.setConfig(kachelCfg({ ...x, groesse: x.groesse === "ganz" ? "ganz" : x.groesse === "klein" ? "klein" : "breit" })); } catch (_) { return null; }
    el.hass = h;
    const z = document.createElement("div");
    z.style.gridColumn = `span ${ORDNER_SPANNE[x.groesse === "ganz" ? "ganz" : x.groesse === "klein" ? "klein" : "breit"]}`;
    z.appendChild(el);
    feld.querySelector(".kacheln").appendChild(z);
    return el;
  }).filter(Boolean);
  const unter = () => { feld.querySelector(".unter").textContent = ordnerAnzahl(Glas.hass, c.eintraege).text; };
  const neu = () => { kacheln.forEach((k) => { k.hass = Glas.hass; }); unter(); };
  Glas.hassHoerer.add(neu);
  unter();
  e.oeffnen();
  // Aus der Kachel wachsen (FLIP): Startlage = Rechteck der Ordner-Kachel
  const ziel = feld.getBoundingClientRect();
  const sx = quellRect.width / ziel.width, sy = quellRect.height / ziel.height;
  const dx = quellRect.left - ziel.left, dy = quellRect.top - ziel.top;
  const inhalt = feld.querySelector(".inhalt");
  const stil = (p) => ({ transform: `translate(${dx * (1 - p)}px,${dy * (1 - p)}px) scale(${sx + (1 - sx) * p},${sy + (1 - sy) * p})`, opacity: String(klemmen(p * 3, 0, 1)) });
  const sichtbar = quellRect.width > 0 && quellRect.bottom > 0 && quellRect.top < innerHeight;
  if (sichtbar) {
    federAnim(feld, stil, { antwort: 0.42, daempfung: 0.8 });
    federAnim(inhalt, (p) => ({ opacity: String(klemmen((p - 0.35) * 2, 0, 1)) }), { antwort: 0.42, daempfung: 1 });
  } else federAnim(feld, (p) => ({ transform: `scale(${0.92 + 0.08 * p})`, opacity: String(klemmen(p, 0, 1)) }), { antwort: 0.36, daempfung: 0.85 });
  karte.style.visibility = "hidden";
  vibrieren(8);
  e.wegAnimieren = () => {
    const r = karte.getBoundingClientRect();
    karte.style.visibility = "";
    if (!r.width || !karte.isConnected) return federAnim(feld, (p) => ({ transform: `scale(${1 - 0.08 * p})`, opacity: String(1 - p) }), { antwort: 0.26, daempfung: 1 }).finished.catch(() => {});
    const z2 = feld.getBoundingClientRect(); // ohne Transform gemessen? Rechteck ist bereits Endlage (Transform aufgehoben)
    const sx2 = r.width / z2.width, sy2 = r.height / z2.height, dx2 = r.left - z2.left, dy2 = r.top - z2.top;
    karte.style.visibility = "hidden";
    federAnim(inhalt, (p) => ({ opacity: String(klemmen(1 - p * 2.5, 0, 1)) }), { antwort: 0.24, daempfung: 1 });
    return federAnim(feld, (p) => ({ transform: `translate(${dx2 * p}px,${dy2 * p}px) scale(${1 + (sx2 - 1) * p},${1 + (sy2 - 1) * p})`, opacity: String(klemmen((1 - p) * 4, 0, 1)) }),
      { antwort: 0.34, daempfung: 0.95 }).finished.catch(() => {}).then(() => { karte.style.visibility = ""; });
  };
  // Nach unten wischen schließt (folgt dem Finger)
  let z = null;
  feld.addEventListener("pointerdown", (ev) => {
    if (ev.button > 0 || ev.target.closest("glas-kachel-card") || feld.scrollTop > 0) return;
    z = { y: ev.clientY, dy: 0, id: ev.pointerId };
  });
  feld.addEventListener("pointermove", (ev) => {
    if (!z || z.id !== ev.pointerId) return;
    z.dy = Math.max(0, ev.clientY - z.y);
    if (z.dy > 4) { try { feld.setPointerCapture(ev.pointerId); } catch (_) { /* */ } feld.style.transform = `translateY(${z.dy}px) scale(${1 - Math.min(z.dy, 300) / 3000})`; }
  });
  const los = () => {
    if (!z) return;
    const d = z.dy; z = null;
    if (d > 90) e.schliessen();
    else federAnim(feld, (p) => ({ transform: `translateY(${d * (1 - p)}px)` }), { antwort: 0.35, daempfung: 0.8 });
  };
  feld.addEventListener("pointerup", los);
  feld.addEventListener("pointercancel", los);
  e.zu = () => { Glas.hassHoerer.delete(neu); karte.style.visibility = ""; };
  setTimeout(() => feld.querySelector("glas-kachel-card")?.shadowRoot?.querySelector("button")?.focus({ preventScroll: true }), 50);
  return e;
}

class GlasOrdnerEditor extends GlasEditor {
  schema() {
    return [{ type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "groesse", selector: { select: { mode: "dropdown", options: [
      { value: "klein", label: "Klein (1×1)" }, { value: "breit", label: "Breit (2×1)" }, { value: "gross", label: "Groß (2×2, Stapel)" }, { value: "ganz", label: "Ganze Breite" }] } } }] }];
  }
  labels() { return { name: "Name", groesse: "Größe" }; }
  listen() {
    return [{ key: "eintraege", titel: "Geräte im Ordner", neuText: "Gerät", neu: () => ({}), name: (x) => x.name || x.entity || "Neues Gerät",
      labels: { entity: "Entität", name: "Name (leer = aus HA)" }, schema: () => [{ name: "entity", selector: { entity: {} } }, { name: "name", selector: { text: {} } }] }];
  }
}

// ---------------------------------------------------------------------------
// Vorschau bei langem Drücken (wie iOS): Kachel hebt sich, Hintergrund unscharf,
// darunter Details (Zustand groß, Verlauf 24 Std., Schnellknöpfe) und ein kleines Menü.
// Finger auf einen Punkt ziehen und loslassen wählt ihn; einfach loslassen lässt die Vorschau offen.
// ---------------------------------------------------------------------------
const VORSCHAU_CSS = `
.saeule-v{position:fixed;display:flex;flex-direction:column;gap:var(--g-a2);transform-origin:50% 0}
.gehoben{position:relative;border-radius:var(--g-r);box-shadow:0 18px 50px rgba(0,0,0,.28);transform-origin:50% 50%}
.detail,.menue{border-radius:var(--g-r);background:var(--g-glas);border:1px solid var(--g-glas-rand);-webkit-backdrop-filter:blur(30px) saturate(170%);backdrop-filter:blur(30px) saturate(170%);
  box-shadow:0 12px 40px rgba(0,0,0,.18);transform-origin:50% 0;overflow:hidden}
.wurzel:not(.dunkel) .detail,.wurzel:not(.dunkel) .menue{background:rgba(255,255,255,.72)}
.detail{padding:var(--g-a3) var(--g-a4);display:flex;flex-direction:column;gap:var(--g-a2)}
.gross-zustand{font-size:var(--g-s-titel);font-weight:700;letter-spacing:-.4px;color:var(--g-text);font-variant-numeric:tabular-nums;line-height:1.1}
.gross-zustand small{display:block;margin-top:2px;font-size:var(--g-s-klein);font-weight:500;color:var(--g-text2);letter-spacing:0}
.mini-kurve{height:44px}
.mini-kurve svg{width:100%;height:44px;display:block;overflow:visible}
.mini-kurve .linie{fill:none;stroke:var(--vf,#0a84ff);stroke-width:2;vector-effect:non-scaling-stroke;stroke-linejoin:round}
.mini-kurve .flaeche{fill:var(--vf,#0a84ff);opacity:.14}
.mini-kurve .balken{height:10px;margin-top:17px;border-radius:5px;background:var(--g-fuell);position:relative;overflow:hidden}
.mini-kurve .balken i{position:absolute;top:0;bottom:0;background:var(--vf,#34c759)}
.mini-kurve .leer{font-size:var(--g-s-mini);color:var(--g-text2);line-height:44px}
.schnell{display:flex;gap:var(--g-a2)}
.schnell button{flex:1;min-height:40px;padding:0 6px;border-radius:var(--g-r-klein);background:var(--g-fuell);font-size:var(--g-s-klein);font-weight:600;color:var(--g-text);
  display:flex;align-items:center;justify-content:center;gap:4px}
.schnell button .farbe{width:16px;height:16px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)}
.schnell button.an{background:var(--g-aktiv);color:var(--g-aktiv-text)}
.menue{display:flex;flex-direction:column}
.menue button{display:flex;align-items:center;justify-content:space-between;gap:var(--g-a3);min-height:46px;padding:0 var(--g-a4);font-size:var(--g-s-text);color:var(--g-text);text-align:left}
.menue button + button{border-top:1px solid var(--g-trenn)}
.menue button.rot{color:var(--g-rot-text)}
.menue ha-icon{--mdc-icon-size:20px}
[data-wahl].drauf{background:rgba(120,120,128,.2)}
`;
async function miniVerlaufHtml(h, eid) {
  const st = h.states[eid];
  if (!st) return "";
  try {
    const v = await verlaufHolen(h, [eid], 24);
    const punkte = v.daten[eid] || [];
    if (istZahlSensor(st)) {
      const p = [...punkte.map((x) => ({ t: x.t, w: Number(x.s) })), { t: v.bis, w: Number(st.state) }].filter((x) => !isNaN(x.w));
      if (p.length < 2) return `<div class="leer">Noch kein Verlauf</div>`;
      const min = Math.min(...p.map((x) => x.w)), max = Math.max(...p.map((x) => x.w)), sp = max - min || 1;
      const X = (t) => ((t - v.von) / (v.bis - v.von)) * 300, Y = (w) => 40 - ((w - min) / sp) * 36;
      let d = `M${X(p[0].t).toFixed(1)},${Y(p[0].w).toFixed(1)}`;
      for (let i = 1; i < p.length; i++) d += ` L${X(p[i].t).toFixed(1)},${Y(p[i].w).toFixed(1)}`;
      return `<svg viewBox="0 0 300 44" preserveAspectRatio="none" style="--vf:${VERLAUF_FARBE[st.attributes.device_class] || "#0a84ff"}"><path class="flaeche" d="${d} L300,44 L0,44 Z"/><path class="linie" d="${d}"/></svg>`;
    }
    const l = leisteHtml(punkte, v.von, v.bis, st);
    const i = l.html.match(/<i [^>]*><\/i>/g) || [];
    return `<div class="balken" style="--vf:${domainVon(eid) === "light" ? "#ffcc00" : "#34c759"}">${i.join("")}</div>`;
  } catch (_) { return ""; }
}
function vorschauSchnell(h, st) {
  const d = domainVon(st.entity_id), eid = st.entity_id, an = Geraet.istAn(st), l = [];
  if (d === "light" && (st.attributes.supported_color_modes || []).some((m) => m !== "onoff")) {
    LICHT_FARBEN.forEach((f, i) => l.push({ html: `<span class="farbe" style="background:${f[3]}"></span>`, label: f[0], an: an && lichtFarbeAktiv(st, f),
      tun: () => h.callService("light", "turn_on", { entity_id: eid, ...lichtFarbeDaten(st, f) }) }));
  } else if (d === "cover") {
    [["mdi:arrow-up", "Öffnen", "open_cover"], ["mdi:stop", "Stopp", "stop_cover"], ["mdi:arrow-down", "Schließen", "close_cover"]].forEach(([i, n, s]) =>
      l.push({ html: `<ha-icon data-i="${i}"></ha-icon>`, label: n, tun: () => h.callService("cover", s, { entity_id: eid }) }));
  } else if (d === "climate" && st.attributes.temperature != null) {
    const t = Number(st.attributes.temperature), sch = Number(st.attributes.target_temp_step || 0.5);
    l.push({ html: "−", label: "Kälter", tun: () => h.callService("climate", "set_temperature", { entity_id: eid, temperature: t - sch }) });
    l.push({ html: "Eco 17°", label: "Eco 17 Grad", tun: () => h.callService("climate", "set_temperature", { entity_id: eid, temperature: 17 }) });
    l.push({ html: "+", label: "Wärmer", tun: () => h.callService("climate", "set_temperature", { entity_id: eid, temperature: t + sch }) });
  } else if (d === "media_player") {
    l.push({ html: `<ha-icon data-i="mdi:${st.state === "playing" ? "pause" : "play"}"></ha-icon>`, label: st.state === "playing" ? "Pause" : "Abspielen", tun: () => h.callService("media_player", "media_play_pause", { entity_id: eid }) });
  } else if (d === "vacuum") {
    l.push({ html: `<ha-icon data-i="mdi:play"></ha-icon>`, label: "Saugen", tun: () => h.callService("vacuum", "start", { entity_id: eid }) });
    l.push({ html: `<ha-icon data-i="mdi:home-import-outline"></ha-icon>`, label: "Zur Station", tun: () => h.callService("vacuum", "return_to_base", { entity_id: eid }) });
  }
  if (["light", "switch", "fan", "input_boolean", "media_player"].includes(d)) {
    const rest = timerRest(eid);
    l.push({ html: rest ? `Aus in ${esc(rest)}` : "30 Min.", label: rest ? "Timer stoppen" : "In 30 Minuten ausschalten", an: !!rest,
      tun: () => { if (!an && !rest) Geraet.schalten(h, st); return Glas.timerSetzen(h, eid, rest ? 0 : 30); } });
  }
  return l.slice(0, 5);
}
// Wo liegt die Kachel? Raum-Blatt (#hash) oder Favoriten. Liefert Zugriff + Index für „Bearbeiten“
function kachelOrt(eid) {
  const hash = hashJetzt();
  const z = hash ? listeZugriff({ art: "raum", hash }) : listeZugriff({ art: "fav", person: Glas.aktuellePerson(Glas.hass) });
  const i = z.lesen(Glas.hass).findIndex((x) => x.entity === eid);
  return i >= 0 ? { z, i } : null;
}

function vorschauOeffnen(karte, cfg) {
  const h = karte._hass, eid = cfg.entity, st = h.states[eid];
  if (!st || !Glas.hass) return null;
  const r = karte.getBoundingClientRect();
  const e = new GlasEbene({ quelle: karte, css: VORSCHAU_CSS, label: `Vorschau ${cfg.name || st.attributes.friendly_name || eid}`, zu: () => { Glas.hassHoerer.delete(neu); karte.style.visibility = ""; } });
  const breite = Math.min(innerWidth - 32, Math.max(r.width, 300));
  const saeule = document.createElement("div");
  saeule.className = "saeule-v";
  saeule.style.width = `${breite}px`;
  const kopie = document.createElement("glas-kachel-card");
  kopie.setConfig({ ...cfg, hold_action: { action: "none" } });
  kopie.hass = h;
  const gehoben = document.createElement("div");
  gehoben.className = "gehoben";
  gehoben.style.cssText = `width:${r.width}px;height:${r.height}px`;
  gehoben.appendChild(kopie);
  const ort = Glas.einst ? kachelOrt(eid) : null;
  const favZ = Glas.einst ? listeZugriff({ art: "fav", person: Glas.aktuellePerson(h) }) : null;
  const istFav = () => !!favZ?.lesen(Glas.hass).some((f) => f.entity === eid && f.an !== false);
  const detail = document.createElement("div");
  detail.className = "detail";
  const menue = document.createElement("div");
  menue.className = "menue";
  menue.setAttribute("role", "menu");
  saeule.append(gehoben, detail, menue);
  e.wurzel.appendChild(saeule);
  let schnell = [];
  const detailZeichnen = () => {
    const s = Glas.hass.states[eid];
    if (!s) return;
    schnell = vorschauSchnell(Glas.hass, s);
    const kurve = detail.querySelector(".mini-kurve")?.innerHTML || "";
    detail.innerHTML = `<div class="gross-zustand">${esc(Geraet.zustand(Glas.hass, s, Geraet.regler(s)))}<small>${esc(relativeZeit(s.last_changed))} geändert</small></div>
      <div class="mini-kurve" aria-hidden="true">${kurve}</div>
      ${schnell.length ? `<div class="schnell">${schnell.map((b, i) => `<button data-wahl data-s="${i}" class="${b.an ? "an" : ""}" aria-label="${esc(b.label)}">${b.html}</button>`).join("")}</div>` : ""}`;
    detail.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
    detail.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => wahl(b)));
  };
  const punkte = [
    ["gross", "Große Ansicht", "mdi:arrow-expand", () => { e.schliessen(); steuerungOeffnen(karte, eid, cfg); }],
    ...(favZ ? [["fav", istFav() ? "Aus Favoriten" : "Zu Favoriten", istFav() ? "mdi:star-off-outline" : "mdi:star-outline", () => {
      const an = !istFav();
      favZ.schreiben(Glas.hass, (l) => (an ? (l.some((f) => f.entity === eid) ? l.map((f) => (f.entity === eid ? { ...f, an: true } : f)) : [...l, { ...geraetVorschlag(Glas.hass, eid), an: true, groesse: "breit" }]) : l.filter((f) => f.entity !== eid)));
      e.schliessen();
    }]] : []),
    ...(ort && istAdmin(h) ? [["bearb", "Bearbeiten", "mdi:pencil-outline", () => { e.schliessen(); kachelMenue(karte, ort.z, ort.i); }]] : []),
  ];
  menue.innerHTML = punkte.map(([id, t, i]) => `<button role="menuitem" data-wahl data-m="${id}">${esc(t)}<ha-icon data-i="${i}"></ha-icon></button>`).join("");
  menue.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
  menue.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => wahl(b)));
  function wahl(b) {
    vibrieren(8);
    if (b.dataset.m) { punkte.find(([id]) => id === b.dataset.m)?.[3](); return; }
    const s = schnell[Number(b.dataset.s)];
    Promise.resolve(s?.tun()).catch(() => {});
  }
  detailZeichnen();
  miniVerlaufHtml(h, eid).then((html) => { const k = detail.querySelector(".mini-kurve"); if (k) k.innerHTML = html; });
  const neu = () => { kopie.hass = Glas.hass; detailZeichnen(); };
  Glas.hassHoerer.add(neu);
  // Lage: Kachel bleibt, wo sie war; passt die Säule nicht nach unten, rückt alles nach oben
  const links = klemmen(r.left + r.width / 2 - breite / 2, 16, innerWidth - breite - 16);
  saeule.style.left = `${links}px`;
  saeule.style.top = `${r.top}px`;
  gehoben.style.marginLeft = `${klemmen(r.left - links, 0, breite - r.width)}px`;
  const hoehe = saeule.offsetHeight;
  const oben = klemmen(r.top, 16 + (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) || 0), Math.max(16, innerHeight - hoehe - 16));
  saeule.style.top = `${oben}px`;
  const dy = r.top - oben;
  karte.style.visibility = "hidden";
  e.oeffnen();
  vibrieren(12);
  federAnim(gehoben, (p) => ({ transform: `translateY(${dy * (1 - p)}px) scale(${1 + 0.03 * p})` }), { antwort: 0.4, daempfung: 0.72 });
  [detail, menue].forEach((el, n) => federAnim(el, (p) => ({ transform: `translateY(${dy * (1 - p) - 12 * (1 - p)}px) scale(${0.55 + 0.45 * p})`, opacity: String(klemmen(p * 2, 0, 1)) }),
    { antwort: 0.42 + n * 0.04, daempfung: 0.8 }));
  e.wegAnimieren = () => {
    const r2 = karte.getBoundingClientRect(), dy2 = r2.top - oben;
    [detail, menue].forEach((el) => federAnim(el, (p) => ({ transform: `scale(${1 - 0.4 * p})`, opacity: String(klemmen(1 - p * 2.5, 0, 1)) }), { antwort: 0.26, daempfung: 1 }));
    return federAnim(gehoben, (p) => ({ transform: `translateY(${dy2 * p}px) scale(${1.03 - 0.03 * p})` }), { antwort: 0.3, daempfung: 1 }).finished.catch(() => {})
      .then(() => { karte.style.visibility = ""; });
  };
  // Finger weiterziehen: Punkt unter dem Finger markieren, beim Loslassen wählen
  let markiert = null;
  const ctrl = {
    ziehen(x, y) {
      const el = e.root.elementFromPoint(x, y)?.closest?.("[data-wahl]") || null;
      if (el === markiert) return;
      markiert?.classList.remove("drauf");
      markiert = el;
      if (el) { el.classList.add("drauf"); vibrieren(5); }
    },
    loslassen() { if (markiert) { const b = markiert; b.classList.remove("drauf"); markiert = null; wahl(b); } },
    ebene: e,
  };
  setTimeout(() => menue.querySelector("button")?.focus({ preventScroll: true }), 60);
  return ctrl;
}

// ---------------------------------------------------------------------------
// Ordner im Bearbeiten-Modus: zwei Kacheln aufeinander ziehen = neuer Ordner
// ---------------------------------------------------------------------------
function ordnerBilden(liste, von, auf) {
  const a = liste[von], b = liste[auf];
  if (!a || !b || a === b || a.karte || b.karte) return liste;
  const ohne = (x) => { const { gruppe, an, ...rest } = x; return rest; };
  let neu;
  if (b.ordner) neu = { ...b, eintraege: [...(b.eintraege || []), ...(a.ordner ? a.eintraege || [] : [ohne(a)])] };
  else {
    const raum = (Glas.hass && a.entity) ? bereichVon(Glas.hass, b.entity) : null;
    const gr = Glas.hass && a.entity && gruppeVon(Glas.hass, a.entity) === gruppeVon(Glas.hass, b.entity) ? gruppeVon(Glas.hass, b.entity) : "";
    const name = gr === "licht" ? `Lichter${raum && Glas.hass.areas?.[raum] ? ` ${Glas.hass.areas[raum].name}` : ""}` : (GRUPPEN.find(([g]) => g === gr)?.[1] || "Ordner");
    neu = { ordner: true, name, groesse: b.groesse === "klein" ? "klein" : "breit", an: true, ...(b.gruppe ? { gruppe: b.gruppe } : {}), eintraege: [ohne(b), ...(a.ordner ? a.eintraege || [] : [ohne(a)])] };
  }
  return liste.map((x, i) => (i === auf ? neu : x)).filter((_, i) => i !== von);
}

// Ordner bearbeiten: Name, Größe, Inhalt (herausnehmen, Reihenfolge), auflösen
async function ordnerMenue(quelle, zugriff, i) {
  const s = new GlasSchicht({ quelle, hoch: true, titel: "Ordner bearbeiten" });
  s.dunkel(istDunkel(Glas.hass));
  let o = kopieJ(zugriff.lesen(Glas.hass)[i] || {}), t = null;
  const speichern = (sofort) => { clearTimeout(t); const los = () => zugriff.schreiben(Glas.hass, (l) => { l[i] = kopieJ(o); return l; }); if (sofort) los(); else t = setTimeout(los, 380); };
  const zeichnen = () => {
    const h = Glas.hass;
    s.inhalt.innerHTML = `<style>${MENUE_CSS}.inh{display:flex;align-items:center;gap:var(--g-a2);min-height:48px}.inh + .inh{border-top:1px solid var(--g-trenn)}
      .inh span{flex:1;min-width:0;font-size:var(--g-s-name);color:var(--g-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.inh .rund{width:32px;height:32px}</style>
      ${s.kopfHtml(o.name || "Ordner", ordnerAnzahl(h, o.eintraege).text)}
      <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:form-textbox"></ha-icon>Name</div>
        <div class="neu-zeile" style="margin:0"><input data-name value="${esc(o.name || "")}" aria-label="Name des Ordners" enterkeyhint="done"></div></div>
      <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:resize"></ha-icon>Größe</div>
        <div class="segment" role="group" aria-label="Größe">${[["klein", "S", "1×1"], ["breit", "M", "2×1"], ["gross", "L", "Stapel"], ["ganz", "Ganz", "Breite"]]
          .map(([g, k, x]) => `<button data-g="${g}" aria-pressed="${(o.groesse || "breit") === g}">${k}<small>${x}</small></button>`).join("")}</div>
        <div class="m-hinweis">L zeigt die ersten vier Geräte direkt bedienbar (wie ein Smart-Stapel).</div></div>
      <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:folder-outline"></ha-icon>Im Ordner</div>
        ${(o.eintraege || []).map((x, n) => `<div class="inh"><span>${esc(x.name || h.states[x.entity]?.attributes.friendly_name || x.entity)}</span>
          <button class="rund" data-hoch="${n}" aria-label="Nach vorne" ${n ? "" : "disabled"}><ha-icon data-i="mdi:chevron-up"></ha-icon></button>
          <button class="rund" data-raus="${n}" aria-label="Aus dem Ordner nehmen"><ha-icon data-i="mdi:folder-arrow-up-outline"></ha-icon></button></div>`).join("")}
        <div data-f></div></div>
      <div class="knoepfe"><button class="glas" data-aufloesen>Ordner auflösen</button></div>`;
    s.kopfBinden();
    const $ = (q) => s.inhalt.querySelector(q);
    $("[data-name]").addEventListener("input", (e) => { o.name = e.target.value.trim() || "Ordner"; s.kopfPlatz.querySelector(".titel").textContent = o.name; speichern(); });
    s.inhalt.querySelectorAll("[data-g]").forEach((b) => b.addEventListener("click", () => {
      o.groesse = b.dataset.g; s.inhalt.querySelectorAll("[data-g]").forEach((x) => x.setAttribute("aria-pressed", x === b)); speichern(true);
    }));
    s.inhalt.querySelectorAll("[data-hoch]").forEach((b) => b.addEventListener("click", () => { const n = Number(b.dataset.hoch); o.eintraege = verschiebenL(o.eintraege, n, n - 1); speichern(true); zeichnen(); }));
    s.inhalt.querySelectorAll("[data-raus]").forEach((b) => b.addEventListener("click", () => {
      const n = Number(b.dataset.raus), x = o.eintraege[n];
      o.eintraege = o.eintraege.filter((_, k) => k !== n);
      clearTimeout(t);
      const zurueck = { ...(zugriff.ort.art === "raum" && x.entity ? geraetVorschlag(Glas.hass, x.entity) : { groesse: "breit" }), ...x, an: true };
      if (o.eintraege.length < 2) { // ein Ordner mit einem Gerät ist keiner mehr
        zugriff.schreiben(Glas.hass, (l) => [...l.slice(0, i), ...o.eintraege.map((y) => ({ ...y, an: true, ...(o.gruppe ? { gruppe: o.gruppe } : {}) })), zurueck, ...l.slice(i + 1)]);
        s.schliessen(); return;
      }
      zugriff.schreiben(Glas.hass, (l) => { l[i] = kopieJ(o); return [...l.slice(0, i + 1), zurueck, ...l.slice(i + 1)]; });
      zeichnen();
    }));
    haForm($("[data-f]"), {}, [{ name: "entity", selector: { entity: {} } }], { entity: "Gerät hinzufügen" }, (v) => {
      if (!v.entity) return;
      o.eintraege = [...(o.eintraege || []), { entity: v.entity }]; speichern(true); zeichnen();
    });
    $("[data-aufloesen]").addEventListener("click", () => {
      clearTimeout(t);
      zugriff.schreiben(Glas.hass, (l) => [...l.slice(0, i), ...(o.eintraege || []).map((y) => ({ ...(zugriff.ort.art === "raum" && y.entity ? geraetVorschlag(Glas.hass, y.entity) : { groesse: "breit" }), ...y, an: true })), ...l.slice(i + 1)]);
      s.schliessen();
    });
    s.inhalt.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
  };
  zeichnen();
  s.oeffnen();
}
const verschiebenL = (arr, von, nach) => { const a = [...arr]; const [x] = a.splice(von, 1); a.splice(nach, 0, x); return a; };
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
.ellipse{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.medien{display:flex;flex-direction:column;gap:var(--g-a2)}
.medien-platz .bild{display:block;width:100%;aspect-ratio:1;padding:0;border:0}
.medien-platz .bild.ist-live{aspect-ratio:16/9}
.bild .live{display:none}
.bild.ist-live .live,.bild[data-kamera] .live{display:inline-flex}
.segment-w{display:flex;padding:3px;border-radius:var(--g-r-pille);background:var(--g-fuell);align-self:center}
.segment-w button{min-height:36px;padding:0 var(--g-a4);border-radius:var(--g-r-pille);font-size:var(--g-s-name);font-weight:600;color:var(--g-text2)}
.segment-w button[aria-pressed="true"]{background:var(--g-blatt,#fff);color:var(--g-text);box-shadow:0 1px 4px rgba(0,0,0,.12)}
.aktion.licht-an{background:#ffcc00;color:#1c1c1e;border-color:transparent}
.luefter{display:grid;grid-template-columns:minmax(0,1fr) 54px;grid-template-areas:"n w" "r r";align-items:center;gap:4px var(--g-a2);padding:var(--g-a2) 0}
.luefter .ln{grid-area:n;display:flex;align-items:center;gap:var(--g-a2);font-size:var(--g-s-name);font-weight:600;color:var(--g-text)}
.luefter .ln ha-icon{--mdc-icon-size:20px;color:var(--g-text2)}
.luefter .ln ha-icon.dreht{color:var(--g-blau,#0a84ff);animation:robi-dreh var(--dauer) linear infinite}
.luefter .lw{grid-area:w;text-align:right;font-size:var(--g-s-name);font-variant-numeric:tabular-nums;color:var(--g-text)}
.luefter input{grid-area:r;width:100%;height:32px;margin:0;-webkit-appearance:none;appearance:none;background:transparent;touch-action:none}
.luefter input::-webkit-slider-runnable-track{height:10px;border-radius:5px;background:linear-gradient(90deg,var(--g-blau,#0a84ff) var(--p),var(--g-fuell) var(--p))}
.luefter input::-moz-range-track{height:10px;border-radius:5px;background:linear-gradient(90deg,var(--g-blau,#0a84ff) var(--p),var(--g-fuell) var(--p))}
.luefter input::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;margin-top:-8px;border-radius:50%;background:#fff;box-shadow:0 1px 6px rgba(0,0,0,.3)}
.luefter input::-moz-range-thumb{width:26px;height:26px;border:0;border-radius:50%;background:#fff;box-shadow:0 1px 6px rgba(0,0,0,.3)}
@media (prefers-reduced-motion:reduce){.luefter .ln ha-icon.dreht{animation:none}}
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
    this._blatt = new GlasSchicht({ quelle: this, hoch: this.blattHoch?.() ?? false, titel: this.blattTitel(), stern: ({ "glas-drucker-card": { karte: "drucker" }, "glas-robi-card": { karte: "robi" } })[this.localName] || null, zu: () => { this._blatt = null; } });
    this._vz = { auf: false, stunden: 24, daten: null };
    this.blattZeichnen();
    this._blatt.oeffnen();
  }
  blattZeichnen() {
    const s = this._blatt; if (!s) return;
    s.dunkel(istDunkel(this._hass));
    const vIds = (this.blattVerlauf?.() || []).filter((e) => this._hass.states[e]);
    const html = `<style>${BLATT_CSS}${VERLAUF_CSS}</style>${this.blattHtml(s)}${vIds.length ? verlaufKlappHtml(this._hass, vIds, this._vz) : ""}`;
    if (s._letztesHtml === html) return; // nichts geändert: Blatt stehen lassen
    s._letztesHtml = html;
    const scroll = s.inhalt.scrollTop;
    const fokus = s.inhalt.querySelector("input:focus");
    const wert = fokus?.value;
    s.inhalt.innerHTML = html;
    s.kopfBinden();
    s.inhalt.querySelectorAll("ha-state-icon[data-e]").forEach((el) => { el.hass = this._hass; el.stateObj = this._hass.states[el.dataset.e]; });
    this.blattBinden(s, (q) => s.inhalt.querySelector(q), (q) => [...s.inhalt.querySelectorAll(q)]);
    if (vIds.length) {
      const neu = () => { s._letztesHtml = null; this.blattZeichnen(); };
      verlaufKlappBinden(s.inhalt, this._vz, async () => { this._vz.daten = null; neu(); this._vz.daten = await verlaufHolen(this._hass, vIds, this._vz.stunden); neu(); }, neu);
    }
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
// Sicherheit: Alarm (scharf/unscharf), Taster zum Ein- und Ausschalten, Kameras,
// Fenster und Türen. Was angezeigt wird, lässt sich im Blatt per „Auswählen“ festlegen.
// ---------------------------------------------------------------------------
const ALARM_TEXT = { disarmed: "Unscharf", armed_home: "Scharf (zu Hause)", armed_away: "Scharf", armed_night: "Scharf (Nacht)",
  armed_vacation: "Scharf (Urlaub)", arming: "Wird scharf geschaltet", pending: "Gleich Alarm", triggered: "ALARM", disarming: "Wird unscharf", on: "Scharf", off: "Unscharf" };
const SICHER_CSS = `
.taster{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--g-a2)}
.taster .wertbox{flex-direction:row;align-items:center;gap:var(--g-a2)}
.taster .wertbox ha-icon{--mdc-icon-size:22px;flex:none;color:var(--tf)}
.taster .wertbox span{display:flex;flex-direction:column;min-width:0}
.taster .wertbox small{font-size:var(--g-s-klein);color:var(--g-text2)}
.taster .wertbox.frisch{box-shadow:inset 0 0 0 2px var(--tf)}
.kameras{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:var(--g-a2)}
.kam{position:relative;display:block;padding:0;border:0}
.kam .name{position:absolute;left:12px;bottom:10px;max-width:calc(100% - 24px);padding:3px 10px;border-radius:var(--g-r-pille);font-size:var(--g-s-klein);font-weight:600;
  color:#fff;background:rgba(0,0,0,.45);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.kam .leer{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.6)}
.kam .leer ha-icon{--mdc-icon-size:40px}
.wahl{display:none}
.waehlen .wahl{display:flex;flex:none;width:26px;height:26px;border-radius:50%;align-items:center;justify-content:center;border:2px solid var(--g-text3,#aeaeb2);color:#fff}
.waehlen .wahl ha-icon{--mdc-icon-size:18px}
.waehlen [aria-pressed="true"] .wahl{background:var(--g-akzent-voll);border-color:transparent}
.waehlen .zeile[data-wahl]{width:100%;text-align:left;cursor:pointer}
.waehlen [data-wahl][aria-pressed="false"]>:not(.wahl){opacity:.4}
.kam .wahl{position:absolute;right:12px;top:12px;z-index:1;background:rgba(0,0,0,.3);border-color:#fff}
.hinweis-w{margin:0;padding:0 var(--g-a1);font-size:var(--g-s-klein);color:var(--g-text2)}
.kopf-knoepfe .text{min-height:36px;padding:0 var(--g-a3);border-radius:var(--g-r-pille);font-size:var(--g-s-name);font-weight:600;color:var(--g-akzent);background:var(--g-fuell)}
`;
const TUER_KLASSEN = ["door", "garage_door"];

class GlasSicherheitCard extends GlasBereichKarte {
  static standard() { return { fenster_auto: true, kamera_auto: true, scharf_modus: "away", verlauf: 6 }; }
  static getConfigElement() { return document.createElement("glas-sicherheit-card-editor"); }
  static getStubConfig(hass) { return { alarm: Object.keys(hass.states).find((e) => e.startsWith("alarm_control_panel.")) || "" }; }
  // Ausgeblendete Entitäten: aus der Karte und aus den gespeicherten Glas-Einstellungen
  aus() { return new Set([...(this._config.ausgeblendet || []), ...(Glas.einst?.bereiche?.sicherheit?.ausgeblendet || [])]); }
  sichtbar(e) { return this._waehlen || !this.aus().has(e); }
  versteckt(e) { const r = this._hass.entities?.[e]; return !!(r?.hidden || r?.hidden_by || r?.entity_category); }
  alleFenster() {
    const h = this._hass, c = this._config;
    const auto = c.fenster_auto !== false ? Object.keys(h.states).filter((e) => e.startsWith("binary_sensor.")
      && FENSTER_KLASSEN.includes(h.states[e].attributes.device_class) && !this.versteckt(e)) : [];
    return [...new Set([...(c.fenster || []), ...auto])].map((e) => h.states[e]).filter(Boolean);
  }
  fenster() { return this.alleFenster().filter((s) => !this.aus().has(s.entity_id)); }
  alleKameras() {
    const h = this._hass, c = this._config;
    const druckerGeraet = Glas.einst?.bereiche?.drucker?.geraet;
    const auto = c.kamera_auto !== false ? Object.keys(h.states).filter((e) => e.startsWith("camera.") && !this.versteckt(e)
      && !(druckerGeraet && h.entities?.[e]?.device_id === druckerGeraet)) : [];
    return [...new Set([c.kamera, ...(c.kameras || []), ...auto].filter(Boolean))].filter((e) => h.states[e]);
  }
  tasterListe() {
    const c = this._config;
    return [["an", c.taster_an || c.taster, "Einschalten", "mdi:shield-lock", "var(--g-rot-voll)"], ["aus", c.taster_aus, "Ausschalten", "mdi:shield-off-outline", "var(--g-gruen-voll,var(--g-gruen))"]]
      .filter(([, e]) => e && this._hass.states[e]);
  }
  // Wann wurde der Taster zuletzt gedrückt? event.* hat den Zeitpunkt als Zustand
  gedrueckt(eid) {
    const st = this._hass.states[eid];
    if (eid.startsWith("event.") && st.state && !isNaN(Date.parse(st.state))) return st.state;
    return st.last_changed;
  }
  mitRaum(st) {
    const n = st.attributes.friendly_name || st.entity_id, a = bereichVon(this._hass, st.entity_id), r = a && this._hass.areas?.[a]?.name;
    return r && !n.toLowerCase().includes(r.toLowerCase()) ? `${r} · ${n}` : n;
  }
  entitaeten() { return [this._config.alarm, ...this.tasterListe().map((t) => t[1]), ...this.alleKameras(), ...this.alleFenster().map((s) => s.entity_id)].filter(Boolean); }
  blattTitel() { return "Sicherheit"; }
  blattHoch() { return true; }
  istScharf(st) { return !!st && !["disarmed", "off", "unavailable", "unknown"].includes(st.state); }
  zustand() {
    const st = this._hass.states[this._config.alarm];
    const offen = this.fenster().filter((s) => s.state === "on");
    const wort = (s) => (TUER_KLASSEN.includes(s.attributes.device_class) ? "Tür" : "Fenster");
    return { st, scharf: this.istScharf(st), offen,
      fensterText: offen.length === 0 ? "Alles zu" : offen.length === 1 ? `Offen: ${this.mitRaum(offen[0])}` : `${offen.length} ${offen.every((s) => wort(s) === "Tür") ? "Türen" : "Fenster/Türen"} offen` };
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
    const dom = st.entity_id.split(".")[0];
    if (dom !== "alarm_control_panel") return this.dienst(dom === "switch" ? "switch" : "input_boolean", this.istScharf(st) ? "turn_off" : "turn_on", { entity_id: st.entity_id });
    if (st.attributes.code_format && (st.state === "disarmed" ? st.attributes.code_arm_required !== false : true)) return mehrInfo(this, st.entity_id); // Code nötig → HA-Dialog
    const dienst = st.state === "disarmed" ? `alarm_arm_${this._config.scharf_modus || "away"}` : "alarm_disarm";
    this.dienst("alarm_control_panel", dienst, { entity_id: st.entity_id });
  }
  async verlaufLaden() {
    const c = this._config, ids = [c.alarm, ...this.tasterListe().map((t) => t[1]), ...this.fenster().map((s) => s.entity_id), c.bewegung].filter(Boolean);
    if (!ids.length || !c.verlauf) return;
    try {
      const start = new Date(Date.now() - 24 * 3600e3).toISOString();
      const ev = await this._hass.callWS({ type: "logbook/get_events", start_time: start, entity_ids: ids });
      this._verlauf = ev.filter((e) => e.state != null || e.message).slice(-c.verlauf).reverse();
    } catch (_) { this._verlauf = []; }
    this.blattZeichnen();
  }
  blattOeffnen() { this._waehlen = false; super.blattOeffnen(); this.verlaufLaden(); }
  wahlHtml(eid) { return `<span class="wahl" aria-hidden="true"><ha-icon data-i="mdi:check"></ha-icon></span>`; }
  wahlAttr(eid) { return this._waehlen ? `data-wahl="${esc(eid)}" aria-pressed="${!this.aus().has(eid)}"` : ""; }
  zeileHtml(f) {
    const h = this._hass, inner = `${this.wahlHtml()}<span class="punkt" style="background:${f.state === "on" ? "var(--g-orange)" : "var(--g-gruen)"}"></span>${esc(this.mitRaum(f))}
      <span class="rechts ${f.state === "on" ? "warn" : ""}">${esc(zustandText(h, f))}</span>`;
    return this._waehlen ? `<button class="zeile" ${this.wahlAttr(f.entity_id)}>${inner}</button>` : `<div class="zeile">${inner}</div>`;
  }
  gruppeHtml(titel, liste) {
    if (!liste.length) return "";
    const offen = liste.filter((f) => f.state === "on").length;
    liste = [...liste].sort((a, b) => (b.state === "on") - (a.state === "on") || this.mitRaum(a).localeCompare(this.mitRaum(b), "de"));
    return `<div class="karte glas"><div class="karte-kopf"><h3 class="karte-titel">${titel}</h3><span class="karte-titel">${offen ? `${offen} offen` : "alle zu"}</span></div>
      ${liste.map((f) => this.zeileHtml(f)).join("")}</div>`;
  }
  kamerasHtml(ids) {
    if (!ids.length) return "";
    return `<div class="kameras">${ids.map((eid) => {
      const st = this._hass.states[eid], name = st.attributes.friendly_name || eid;
      const bild = st.attributes.entity_picture && st.state !== "unavailable" ? `<img alt="" loading="lazy" src="${esc(st.attributes.entity_picture)}">` : `<span class="leer"><ha-icon data-i="mdi:cctv-off"></ha-icon></span>`;
      return `<button class="bild kam" ${this._waehlen ? this.wahlAttr(eid) : `data-kamera="${esc(eid)}"`} aria-label="${esc(name)}${this._waehlen ? "" : " groß öffnen"}">${this.wahlHtml()}${bild}
        ${this._waehlen ? "" : `<span class="live">LIVE</span>`}<span class="name">${esc(name)}</span></button>`; }).join("")}</div>`;
  }
  blattHtml(s) {
    const h = this._hass, c = this._config, z = this.zustand(), w = this._waehlen;
    const taster = this.tasterListe();
    const alarm = z.st ? `<div class="alarm ${z.scharf ? "scharf" : "glas"}"><span class="kreis" style="--kf:${z.scharf ? "var(--g-rot)" : "var(--g-gruen)"}"><ha-icon data-i="${z.scharf ? "mdi:shield-lock" : "mdi:shield-home-outline"}"></ha-icon></span>
      <span class="texte"><span class="t1">${esc(ALARM_TEXT[z.st.state] || z.st.state)}</span>
      <span class="t2">Seit ${relativeZeit(z.st.last_changed)}</span></span>
      <button class="knopf" data-alarm style="--bk:${z.scharf ? "var(--g-aktiv)" : "var(--g-rot-voll)"}">${z.scharf ? "Unscharf" : "Scharf schalten"}</button></div>` : "";
    const tasterHtml = taster.length ? `<div class="taster">${taster.map(([, eid, titel, icon, farbe]) => {
      const zeit = this.gedrueckt(eid), frisch = Date.now() - Date.parse(zeit) < 120e3;
      return `<div class="wertbox glas ${frisch ? "frisch" : ""}" style="--tf:${farbe}"><ha-icon data-i="${icon}"></ha-icon><span><small>Taster ${titel}</small><b>${esc(relativeZeit(zeit))}</b></span></div>`; }).join("")}</div>` : "";
    const alleF = this.alleFenster(), sicht = alleF.filter((f) => this.sichtbar(f.entity_id));
    const tueren = sicht.filter((f) => TUER_KLASSEN.includes(f.attributes.device_class)), fenster = sicht.filter((f) => !TUER_KLASSEN.includes(f.attributes.device_class));
    const kameras = this.alleKameras().filter((e) => this.sichtbar(e));
    const knoepfe = alleF.length || this.alleKameras().length ? `<button class="text" data-waehlen>${w ? "Fertig" : "Auswählen"}</button>` : "";
    return `${s.kopfHtml("Sicherheit", w ? "Was soll angezeigt werden?" : z.fensterText, knoepfe)}<style>${SICHER_CSS}</style>
      <div class="${w ? "waehlen" : ""}" style="display:flex;flex-direction:column;gap:var(--g-a3)">
      ${w ? `<p class="hinweis-w">Tippe an, was du in der Sicherheit sehen willst. Ausgeblendetes zählt auch nicht für „offen“.</p>` : `${alarm}${tasterHtml}`}
      ${this.kamerasHtml(kameras)}
      ${this.gruppeHtml("Türen", tueren)}${this.gruppeHtml("Fenster", fenster)}
      ${!w && c.verlauf ? `<div class="karte glas"><div class="karte-kopf"><h3 class="karte-titel">Verlauf (24 Std.)</h3></div>${(this._verlauf || []).map((e) =>
        `<div class="zeile"><span class="zeit">${uhr(new Date(e.when * 1000))}</span><span>${esc(e.name || h.states[e.entity_id]?.attributes.friendly_name || "")} ${esc(e.message || (e.state ? zustandText(h, { ...h.states[e.entity_id], state: e.state }) : ""))}</span></div>`).join("")
        || `<div class="zeile leise">${this._verlauf ? "Nichts passiert." : "Lade …"}</div>`}</div>` : ""}</div>`;
  }
  ausSetzen(eid, zeigen) {
    const b = { ...(Glas.einst?.bereiche?.sicherheit || {}) };
    const aus = new Set(b.ausgeblendet || []);
    if (zeigen) aus.delete(eid); else aus.add(eid);
    if (this._config.ausgeblendet?.includes(eid) && zeigen) this._config = { ...this._config, ausgeblendet: this._config.ausgeblendet.filter((x) => x !== eid) };
    b.ausgeblendet = [...aus];
    if (Glas.einst) { Glas.einst.bereiche = { ...(Glas.einst.bereiche || {}), sicherheit: b }; }
    clearTimeout(this._ausT);
    this._ausT = setTimeout(() => bereichSpeichern("sicherheit", { ...(Glas.einst?.bereiche?.sicherheit || b) }), 500);
  }
  blattBinden(s, $, $$) {
    $("[data-alarm]")?.addEventListener("click", () => this.knopf());
    $$("[data-kamera]").forEach((b) => b.addEventListener("click", () => mehrInfo(this, b.dataset.kamera)));
    s.kopfPlatz.querySelector("[data-waehlen]")?.addEventListener("click", () => { this._waehlen = !this._waehlen; s._letztesHtml = null; this.blattZeichnen(); if (!this._waehlen) this.verlaufLaden(); });
    $$("[data-wahl]").forEach((b) => b.addEventListener("click", () => {
      const zeigen = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", zeigen); vibrieren(8);
      this.ausSetzen(b.dataset.wahl, zeigen);
    }));
  }
}
class GlasSicherheitEditor extends GlasEditor {
  schema() {
    return [
      { name: "alarm", selector: { entity: { filter: [{ domain: "alarm_control_panel" }, { domain: "input_boolean" }, { domain: "switch" }] } } },
      { name: "scharf_modus", selector: { select: { mode: "dropdown", options: [{ value: "away", label: "Abwesend" }, { value: "home", label: "Zu Hause" }, { value: "night", label: "Nacht" }] } } },
      { name: "taster_an", selector: { entity: { filter: [{ domain: "event" }, { domain: "binary_sensor" }, { domain: "sensor" }, { domain: "button" }, { domain: "input_button" }] } } },
      { name: "taster_aus", selector: { entity: { filter: [{ domain: "event" }, { domain: "binary_sensor" }, { domain: "sensor" }, { domain: "button" }, { domain: "input_button" }] } } },
      { name: "kamera_auto", selector: { boolean: {} } },
      { name: "kameras", selector: { entity: { multiple: true, filter: { domain: "camera" } } } },
      { name: "fenster_auto", selector: { boolean: {} } },
      { name: "fenster", selector: { entity: { multiple: true, filter: { domain: "binary_sensor" } } } },
      { name: "ausgeblendet", selector: { entity: { multiple: true } } },
      { name: "verlauf", selector: { number: { min: 0, max: 20, mode: "box" } } },
      { name: "breite", selector: { select: { mode: "dropdown", options: [{ value: "ganz", label: "Ganze Breite" }, { value: "halb", label: "Halbe Breite" }] } } },
    ];
  }
  render() {
    const c = this._config;
    if (c.fenster_auto === undefined) c.fenster_auto = true;
    if (c.kamera_auto === undefined) c.kamera_auto = true;
    if (c.taster && !c.taster_an) { c.taster_an = c.taster; delete c.taster; }
    if (c.kamera && !c.kameras) { c.kameras = [c.kamera]; delete c.kamera; }
    super.render();
  }
  labels() { return { alarm: "Alarmanlage (oder Schalter/Helfer)", scharf_modus: "„Scharf schalten“ bedeutet", taster_an: "Taster zum Einschalten", taster_aus: "Taster zum Ausschalten",
    kamera_auto: "Alle Kameras automatisch", kameras: "Weitere Kameras", fenster_auto: "Alle Fenster/Türen automatisch",
    fenster: "Weitere Fenster/Türen", ausgeblendet: "Ausgeblendet", verlauf: "Einträge im Verlauf (0 = aus)", breite: "Breite auf der Startseite" }; }
  hilfen() { return { alarm: "Wenn die Anlage einen Code verlangt, öffnet der Knopf den HA-Dialog zur Code-Eingabe.",
    taster_an: "Die Taster schalten die Anlage über deine Automation. Hier wird nur angezeigt, wann sie zuletzt gedrückt wurden.",
    ausgeblendet: "Einfacher: im Sicherheits-Fenster oben auf „Auswählen“ tippen." }; }
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
  blattVerlauf() { return [this._config.stecker, this._config.status].filter(Boolean); }
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
  // Alles, was am Drucker-Gerät hängt (Lüfter, Licht, Auswahlen)
  geraetId() {
    const c = this._config, h = this._hass;
    if (c.geraet) return c.geraet;
    const e = c.fortschritt || c.status;
    return e ? h.entities?.[e]?.device_id : null;
  }
  geraetEntitaeten(domain) {
    const h = this._hass, dev = this.geraetId();
    if (!dev) return [];
    return Object.keys(h.entities || {}).filter((e) => e.startsWith(`${domain}.`) && h.entities[e].device_id === dev && !h.entities[e].hidden && h.states[e]);
  }
  luefter() { const c = this._config; return (c.luefter?.length ? c.luefter : this.geraetEntitaeten("fan")).map((e) => this._hass.states[e]).filter(Boolean); }
  lichter() { const c = this._config; return (c.licht ? [c.licht] : this.geraetEntitaeten("light")).map((e) => this._hass.states[e]).filter(Boolean); }
  auswahlen() { const c = this._config; return (c.auswahl?.length ? c.auswahl : this.geraetEntitaeten("select").filter((e) => /speed|geschw/i.test(e))).map((e) => this._hass.states[e]).filter(Boolean); }
  kameraId() { return this.e("kamera") || this.geraetEntitaeten("camera")[0] || this.geraetEntitaeten("image").find((e) => /camera|kamera/i.test(e)) || null; }
  bildId() { return this.e("bild") || this.geraetEntitaeten("image").find((e) => /cover/i.test(e)) || null; }
  medienQuelle(modus) {
    const h = this._hass;
    if (modus === "live") {
      const k = this.kameraId(), st = k && h.states[k];
      if (!st) return "";
      if (k.startsWith("camera.") && st.attributes.access_token) return `/api/camera_proxy_stream/${k}?token=${st.attributes.access_token}`;
      return st.attributes.entity_picture || "";
    }
    const b = this.bildId(), st = b && h.states[b];
    return st?.attributes.entity_picture || "";
  }
  blattHtml(s) {
    const h = this._hass, c = this._config, w = this.werte();
    const auf = this.st("aufgabe"), sch = this.st("schicht"), schs = this.st("schichten"), du = this.st("duese"), be = this.st("bett");
    const stecker = c.stecker && h.states[c.stecker], strom = !stecker || stecker.state === "on";
    const hatBild = !!this.medienQuelle("bild"), hatLive = !!this.kameraId();
    const modus = this._modus || (w.laeuft && hatLive ? "live" : hatBild ? "bild" : "live");
    this._modusJetzt = modus;
    const farbe2 = w.laeuft ? (w.pause ? "var(--g-orange)" : "var(--g-gruen)") : "#8e8e93";
    const werk = this._werk;
    const rollen = werk?.rollen || [];
    const geladen = rollen.find((r) => r.id === werk?.geladen);
    const knapp = rollen.filter((r) => r.rest_g != null && r.rest_g < c.knapp_g).slice(0, 5);
    const farbe = (r) => r?.hex || "#8e8e93";
    const luefter = strom ? this.luefter() : [], lichter = strom ? this.lichter() : [], wahl = strom ? this.auswahlen() : [];
    const knoepfe = [];
    if (stecker) knoepfe.push(`<button class="aktion ${strom ? "glas" : "robi-haupt"}" data-stecker><ha-icon data-i="mdi:power"></ha-icon>${strom ? "Ausschalten" : "Einschalten"}</button>`);
    if (strom && (this.e("pause") || this.e("weiter")) && w.laeuft) knoepfe.push(`<button class="aktion robi-haupt" data-pause><ha-icon data-i="${w.pause ? "mdi:play" : "mdi:pause"}"></ha-icon>${w.pause ? "Fortsetzen" : "Pause"}</button>`);
    if (strom && this.e("stopp") && w.laeuft) knoepfe.push(`<button class="aktion glas" data-stopp><ha-icon data-i="mdi:stop"></ha-icon>${this._stoppFrage ? "Wirklich stoppen?" : "Stoppen"}</button>`);
    lichter.forEach((l) => knoepfe.push(`<button class="aktion ${l.state === "on" ? "licht-an" : "glas"}" data-licht="${esc(l.entity_id)}" aria-pressed="${l.state === "on"}"><ha-icon data-i="${l.state === "on" ? "mdi:lightbulb-on" : "mdi:lightbulb-outline"}"></ha-icon>${esc(robiName(l, c.name).replace(/^chamber light$/i, "Licht"))}</button>`));
    return `${s.kopfHtml(c.name || "Drucker", "3D-Drucker")}
      <div class="robi-held glas ${w.laeuft && !w.pause ? "putzt" : ""}" style="--g-lila:${farbe2}">
        <div class="robi-bild"><span class="ring" aria-hidden="true"></span><ha-icon data-i="mdi:printer-3d-nozzle"></ha-icon></div>
        <div class="robi-text"><span class="robi-status">${esc(w.aus ? "Ausgeschaltet" : (w.status || "").replace(/^./, (x) => x.toUpperCase()))}${w.laeuft && w.pct != null ? ` · ${Math.round(w.pct)} %` : ""}</span>
          ${auf && Geraet.verfuegbar(auf) && auf.state ? `<span class="leise ellipse">${esc(auf.state)}</span>` : ""}
          ${w.laeuft && w.pct != null ? `<div class="balken"><i style="width:${klemmen(w.pct, 0, 100)}%;--bf:${farbe2}"></i></div>` : ""}
          ${w.rest ? `<span class="leise">${esc(w.rest)}</span>` : ""}</div>
      </div>
      ${strom && (hatBild || hatLive) ? `<div class="medien">
        ${hatBild && hatLive ? `<div class="segment-w" role="group" aria-label="Bild"><button data-modus="bild" aria-pressed="${modus === "bild"}">Vorschau</button><button data-modus="live" aria-pressed="${modus === "live"}">Live</button></div>` : ""}
        <div class="medien-platz"></div></div>` : ""}
      ${knoepfe.length ? `<div class="raster2">${knoepfe.join("")}</div>` : ""}
      ${strom && (sch || du || be) ? `<div class="raster3">${sch ? `<div class="wertbox glas"><span class="leise">Schicht</span><b>${esc(sch.state)}${schs ? ` / ${esc(schs.state)}` : ""}</b></div>` : ""}
        ${du ? `<div class="wertbox glas"><span class="leise">Düse</span><b>${esc(zustandText(h, du))}</b></div>` : ""}${be ? `<div class="wertbox glas"><span class="leise">Bett</span><b>${esc(zustandText(h, be))}</b></div>` : ""}</div>` : ""}
      ${luefter.length || wahl.length ? `<div class="karte glas">
        ${luefter.length ? `<div class="karte-kopf"><h3 class="karte-titel">Lüfter</h3></div>${luefter.map((f) => {
          const pct = f.state === "on" ? Math.round(Number(f.attributes.percentage ?? 100)) : 0;
          return `<div class="luefter"><span class="ln"><ha-icon data-i="${pct ? "mdi:fan" : "mdi:fan-off"}" class="${pct ? "dreht" : ""}" style="--dauer:${pct ? (2.2 - pct / 60).toFixed(2) : 0}s"></ha-icon>${esc(luefterName(f, c.name))}</span>
            <input type="range" min="0" max="100" step="10" value="${pct}" data-luefter="${esc(f.entity_id)}" aria-label="${esc(luefterName(f, c.name))}" style="--p:${pct}%"><b class="lw">${pct} %</b></div>`;
        }).join("")}` : ""}
        ${wahl.map((a) => `<div class="karte-kopf"><h3 class="karte-titel">${esc(robiName(a, c.name))}</h3></div><div class="chips robi-chips">${(a.attributes.options || []).map((o) =>
          `<button class="pille fuell ${a.state === o ? "aktiv" : ""}" data-wahl="${esc(a.entity_id)}" data-o="${esc(o)}" aria-pressed="${a.state === o}">${esc(DRUCK_TEMPO[o] || attributText(h, { ...a, attributes: { ...a.attributes, x: o } }, "x") || o)}</button>`).join("")}</div>`).join("")}
      </div>` : ""}
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
      <button class="link" data-werk>Werkstatt öffnen<ha-icon class="pfeil-r" data-i="mdi:chevron-right" aria-hidden="true"></ha-icon></button>`;
  }
  // Bild/Livebild bleibt als eigenes Element bestehen, damit der Stream beim Neuzeichnen nicht abreißt
  medienSetzen(platz) {
    if (!platz) return;
    const src = this.medienQuelle(this._modusJetzt);
    if (!this._medien) {
      this._medien = document.createElement("button");
      this._medien.className = "bild drucker-bild";
      this._medien.innerHTML = `<img alt=""><span class="live">LIVE</span>`;
      this._medien.addEventListener("click", () => { const k = this._modusJetzt === "live" ? this.kameraId() : this.bildId(); if (k) mehrInfo(this, k); });
    }
    const img = this._medien.querySelector("img");
    if (img.getAttribute("src") !== src) img.setAttribute("src", src);
    this._medien.classList.toggle("ist-live", this._modusJetzt === "live");
    this._medien.setAttribute("aria-label", this._modusJetzt === "live" ? "Livebild groß öffnen" : "Vorschaubild groß öffnen");
    platz.appendChild(this._medien);
  }
  blattBinden(s, $, $$) {
    const h = this._hass, w = this.werte();
    s.inhalt.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
    this.medienSetzen($(".medien-platz"));
    $$("[data-modus]").forEach((b) => b.addEventListener("click", () => { this._modus = b.dataset.modus; this.blattZeichnen(); }));
    $("[data-pause]")?.addEventListener("click", () => { const b = this.e(w.pause ? "weiter" : "pause"); if (b) h.callService("button", "press", { entity_id: b }); });
    $("[data-stopp]")?.addEventListener("click", () => {
      if (!this._stoppFrage) { this._stoppFrage = true; this.blattZeichnen(); setTimeout(() => { this._stoppFrage = false; this.blattZeichnen(); }, 4000); return; }
      this._stoppFrage = false; h.callService("button", "press", { entity_id: this.e("stopp") });
    });
    $$("[data-licht]").forEach((b) => b.addEventListener("click", () => h.callService("light", "toggle", { entity_id: b.dataset.licht })));
    $("[data-stecker]")?.addEventListener("click", () => h.callService("homeassistant", "toggle", { entity_id: this._config.stecker }));
    $$("[data-luefter]").forEach((r) => {
      const anzeigen = () => { r.style.setProperty("--p", `${r.value}%`); r.nextElementSibling.textContent = `${r.value} %`; };
      r.addEventListener("pointerdown", () => { this._blattSperre = true; });
      r.addEventListener("input", anzeigen);
      r.addEventListener("change", () => {
        this._blattSperre = false; const v = Number(r.value);
        h.callService("fan", v ? "set_percentage" : "turn_off", v ? { entity_id: r.dataset.luefter, percentage: v } : { entity_id: r.dataset.luefter });
      });
    });
    $$("[data-wahl]").forEach((b) => b.addEventListener("click", () => h.callService("select", "select_option", { entity_id: b.dataset.wahl, option: b.dataset.o })));
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
  entitaeten() { return [...Object.keys(DRUCKER_SUCHE).map((k) => this.e(k)), this._config.stecker, this.kameraId(), this.bildId(),
    ...this.luefter().map((x) => x.entity_id), ...this.lichter().map((x) => x.entity_id), ...this.auswahlen().map((x) => x.entity_id)].filter(Boolean); }
}
const DRUCK_TEMPO = { silent: "Leise", standard: "Standard", sport: "Sport", ludicrous: "Turbo" };
const luefterName = (st, vorne) => {
  const n = robiName(st, vorne), roh = `${st.entity_id} ${n}`.toLowerCase();
  if (/aux/.test(roh)) return "Hilfslüfter";
  if (/chamber|kammer/.test(roh)) return "Kammerlüfter";
  if (/cooling|part|bauteil/.test(roh)) return "Bauteillüfter";
  return n;
};
class GlasDruckerEditor extends GlasEditor {
  schema() {
    return [
      { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "breite", selector: { select: { mode: "dropdown", options: [{ value: "ganz", label: "Ganze Breite" }, { value: "halb", label: "Halbe Breite" }] } } }] },
      { name: "geraet", selector: { device: {} } },
      { name: "stecker", selector: { entity: { filter: { domain: ["switch", "input_boolean"] } } } },
      { name: "luefter", selector: { entity: { multiple: true, filter: { domain: "fan" } } } },
      { type: "grid", name: "", schema: [{ name: "licht", selector: { entity: { filter: { domain: "light" } } } }, { name: "auswahl", selector: { entity: { multiple: true, filter: { domain: "select" } } } }] },
      { type: "grid", name: "", schema: [{ name: "werkstatt", selector: { boolean: {} } }, { name: "knapp_g", selector: { number: { min: 0, max: 1000, mode: "box", unit_of_measurement: "g" } } }] },
      { type: "expandable", flatten: true, name: "einzeln", title: "Entitäten einzeln festlegen (sonst automatisch)", icon: "mdi:tune", schema:
        Object.keys(DRUCKER_SUCHE).map((k) => ({ name: k, selector: { entity: {} } })) },
    ];
  }
  render() { if (this._config.werkstatt === undefined) this._config.werkstatt = true; super.render(); }
  labels() { return { name: "Name", breite: "Breite", geraet: "Drucker-Gerät (Bambu Lab)", stecker: "Steckdose, die den Drucker ein- und ausschaltet", luefter: "Lüfter (leer = alle vom Drucker)", licht: "Licht (leer = automatisch)",
    auswahl: "Auswahlen, z. B. Druckgeschwindigkeit", werkstatt: "Werkstatt-Daten zeigen", knapp_g: "Filament knapp unter",
    fortschritt: "Fortschritt", status: "Status", restzeit: "Restzeit", ende: "Endzeit", schicht: "Aktuelle Schicht", schichten: "Schichten gesamt", duese: "Düsentemperatur",
    bett: "Betttemperatur", aufgabe: "Dateiname", kamera: "Kamera", licht: "Licht", pause: "Knopf Pause", weiter: "Knopf Fortsetzen", stopp: "Knopf Stopp", bild: "Vorschaubild" }; }
  hilfen() { return { geraet: "Alle Werte, Lüfter, Licht, Vorschaubild und Kamera werden aus dem Gerät gesucht. Fehlt etwas, unten einzeln festlegen." }; }
}

// ---------------------------------------------------------------------------
// Robi: Status, Akku, alles saugen, Räume saugen, Saugstärke, Stationsknöpfe
// ---------------------------------------------------------------------------
const ROBI_STATUS = { docked: "In der Station", cleaning: "Saugt", paused: "Pausiert", returning: "Fährt zur Station", idle: "Bereit", error: "Fehler" };

class GlasRobiCard extends GlasBereichKarte {
  blattVerlauf() { return [this._config.entity].filter(Boolean); }
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
// Bild & QR-Code · Kamera: ganze Karten, die man mehrfach in Räume und Favoriten legt.
// Die Einstellungen stehen im Listeneintrag selbst ({ karte: "bild", cfg: {…} }).
// ---------------------------------------------------------------------------
const BILD_CSS = `
.bild-karte{position:relative;display:flex;flex-direction:column;align-items:center;gap:var(--g-a2);width:100%;height:100%;padding:var(--g-a3);border-radius:var(--g-r);text-align:center}
.bild-karte .qr-mini{width:min(148px,100%);aspect-ratio:1;padding:10px;border-radius:var(--g-r-klein);background:#fff;display:flex}
.bild-karte .qr-mini svg,.bild-karte .qr-mini img{width:100%;height:100%;object-fit:contain}
.bild-karte .foto{width:100%;aspect-ratio:4/3;border-radius:var(--g-r-klein);overflow:hidden;background:var(--g-fuell)}
.bild-karte .foto img{display:block;width:100%;height:100%;object-fit:cover}
.bild-karte .leer{display:flex;align-items:center;justify-content:center;color:var(--g-text2)}
.bild-karte .leer ha-icon{--mdc-icon-size:40px}
.bild-karte .texte{align-items:center;width:100%}
.mini{flex:none;width:40px;height:40px;border-radius:10px;overflow:hidden;background:#fff;display:flex;padding:3px}
.mini svg,.mini img{width:100%;height:100%;object-fit:contain}
.mini.foto{padding:0;background:var(--g-fuell)} .mini.foto img{object-fit:cover}
.kamera-karte{position:relative;display:block;width:100%;height:100%;min-height:var(--g-kachel-h);padding:0;border-radius:var(--g-r);overflow:hidden;background:#1c232d}
.kamera-karte img{display:block;width:100%;height:100%;aspect-ratio:16/9;object-fit:cover}
.kamera-karte .unten{position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;gap:var(--g-a2);padding:var(--g-a4) var(--g-a3) var(--g-a2);
  background:linear-gradient(transparent,rgba(0,0,0,.55));color:#fff;font-size:var(--g-s-name);font-weight:600;text-align:left}
.kamera-karte .unten span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.kamera-karte .zeit{font-size:var(--g-s-klein);font-weight:500;opacity:.85}
.kamera-karte .weg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.7)}
.kamera-karte .weg ha-icon{--mdc-icon-size:36px}
`;
const BILD_BLATT_CSS = `
.bild-gross{display:flex;flex-direction:column;align-items:center;gap:var(--g-a3);padding:var(--g-a2) 0 var(--g-a4)}
.bild-gross .qr-weiss{width:min(280px,100%);aspect-ratio:1;padding:16px;border-radius:var(--g-r);background:#fff;display:flex}
.bild-gross .qr-weiss svg,.bild-gross .qr-weiss img{width:100%;height:100%;object-fit:contain}
.bild-gross .foto-gross{width:100%;max-height:70vh;border-radius:var(--g-r);object-fit:contain;background:var(--g-fuell)}
.kamera-gross{display:block;width:100%;aspect-ratio:16/9;border-radius:var(--g-r);overflow:hidden;background:#1c232d}
.mehr-ha{width:100%;margin-top:var(--g-a3)}
.kamera-gross img{display:block;width:100%;height:100%;object-fit:contain}
`;

// Bild zu HA hochladen (Medien › Bilder). Ohne Upload-API (Demo) als Daten-URL.
async function bildHochladen(hass, datei) {
  if (hass?.fetchWithAuth) {
    const fd = new FormData();
    fd.append("file", datei);
    const r = await hass.fetchWithAuth("/api/image/upload", { method: "POST", body: fd });
    if (!r.ok) throw new Error(r.status === 413 ? "Das Bild ist zu groß." : `Hochladen fehlgeschlagen (${r.status}).`);
    const j = await r.json();
    return `/api/image/serve/${j.id}/original`;
  }
  return new Promise((ok, fehler) => { const l = new FileReader(); l.onload = () => ok(l.result); l.onerror = fehler; l.readAsDataURL(datei); });
}

class GlasBildCard extends GlasBereichKarte {
  static standard() { return { quelle: "qr" }; }
  static getConfigElement() { return document.createElement("glas-bild-card-editor"); }
  static getStubConfig() { return { titel: "Gäste-Login", quelle: "qr", text: "https://" }; }
  getGridOptions() { return { columns: this._config?.groesse === "ganz" ? 12 : 6, rows: "auto", min_columns: 3 }; }
  css() { return BEREICH_CSS + BILD_CSS; }
  entitaeten() { return this._config.quelle === "entitaet" && this._config.entity ? [this._config.entity] : []; }
  istQr() { const c = this._config; return c.quelle === "qr" || (c.scan ?? c.quelle === "hochladen"); }
  url() {
    const c = this._config;
    if (c.quelle === "entitaet") return this._hass.states[c.entity]?.attributes.entity_picture || "";
    if (c.quelle === "hochladen" || c.quelle === "link") return c.bild || "";
    return "";
  }
  inhaltHtml() {
    const c = this._config;
    if (c.quelle === "qr") return c.text ? qrSvg(c.text) : "";
    const u = this.url();
    return u ? `<img alt="" src="${esc(u)}">` : "";
  }
  titel() {
    const c = this._config;
    return c.titel || (c.quelle === "entitaet" && this._hass.states[c.entity]?.attributes.friendly_name) || (c.quelle === "qr" ? "QR-Code" : "Bild");
  }
  blattTitel() { return this.titel(); }
  html() {
    const c = this._config, innen = this.inhaltHtml(), qr = this.istQr();
    const leer = `<ha-icon data-i="${qr ? "mdi:qrcode" : "mdi:image-outline"}"></ha-icon>`;
    // Klein (M): nur Symbol und Text wie die Gäste-Karte, Tippen zeigt das Bild groß
    if (!["gross", "ganz"].includes(c.groesse)) return this.kompaktHtml({ icon: qr ? "mdi:qrcode" : "mdi:image-outline", farbe: "var(--g-akzent)", t1: this.titel(), t2: c.unter || (qr ? "Antippen zum Scannen" : "Antippen zum Ansehen") });
    return `<button class="bild-karte glas kompakt" aria-haspopup="dialog" aria-label="${esc(this.titel())} groß zeigen">
      <span class="${qr ? "qr-mini" : "foto"} ${innen ? "" : "leer"}" aria-hidden="true">${innen || leer}</span>
      <span class="texte"><span class="t1">${esc(this.titel())}</span>${c.unter ? `<span class="t2">${esc(c.unter)}</span>` : ""}</span></button>`;
  }
  binden() {
    this.iconsSetzen();
    this.$(".kompakt")?.addEventListener("click", () => this.blattOeffnen());
  }
  blattHtml(s) {
    const c = this._config, innen = this.inhaltHtml(), qr = this.istQr();
    return `<style>${BILD_BLATT_CSS}</style>${s.kopfHtml(this.titel(), c.unter || "")}
      <div class="bild-gross">${!innen ? `<span class="leise">Noch kein Bild eingestellt.</span>`
        : qr ? `<div class="qr-weiss">${innen}</div><span class="leise">Mit der Handykamera scannen.</span>`
        : `<img class="foto-gross" alt="${esc(this.titel())}" src="${esc(this.url())}">`}</div>`;
  }
  blattBinden() {}
}

class GlasBildEditor extends GlasEditor {
  setConfig(c) { super.setConfig({ quelle: "qr", ...c }); }
  schemaSchluessel(c) { return [c.quelle]; }
  schema() {
    const q = this._config.quelle || "qr";
    return [
      { type: "grid", name: "", schema: [{ name: "titel", selector: { text: {} } }, { name: "unter", selector: { text: {} } }] },
      { name: "quelle", selector: { select: { mode: "dropdown", options: [{ value: "qr", label: "QR-Code aus Link oder Text erzeugen" },
        { value: "hochladen", label: "Bild hochladen (z. B. Foto vom QR-Code)" }, { value: "entitaet", label: "Bild- oder Kamera-Entität" }, { value: "link", label: "Bild-Adresse (z. B. /local/gast.png)" }] } } },
      ...(q === "qr" ? [{ name: "text", selector: { text: { multiline: true } } }] : []),
      ...(q === "entitaet" ? [{ name: "entity", selector: { entity: { filter: [{ domain: "image" }, { domain: "camera" }] } } }] : []),
      ...(q === "link" ? [{ name: "bild", selector: { text: {} } }] : []),
      ...(q === "qr" ? [] : [{ name: "scan", selector: { boolean: {} } }]),
    ];
  }
  labels() { return { titel: "Titel", unter: "Untertitel", quelle: "Woher kommt das Bild?", text: "Link oder Text im QR-Code", entity: "Entität", bild: "Bild-Adresse",
    ansicht: "Darstellung", scan: "Ist ein QR-Code (weißer Rand, Scan-Hinweis)" }; }
  hilfen() { return { text: "Für das WLAN gibt es die Gäste-Karte. Hier z. B. den Link für den Home-Assistant-Gastzugang einfügen.", bild: "Dateien aus /config/www/ heißen /local/…" }; }
  extra(box) {
    if ((this._config.quelle || "qr") !== "hochladen") return;
    box.innerHTML = `<div class="ge-liste"><div class="ge-kopf">Bild</div>
      ${this._config.bild ? `<img alt="" src="${esc(this._config.bild)}" style="display:block;max-width:180px;max-height:180px;border-radius:12px;margin-bottom:8px;background:#fff">` : ""}
      <label class="ge-neu" style="display:inline-block">${this._config.bild ? "Anderes Bild wählen" : "Bild wählen"}<input type="file" accept="image/*" hidden></label>
      <div class="ge-hinweis" data-st>Wird in Home Assistant unter Medien › Bilder gespeichert.</div></div>`;
    const inp = box.querySelector("input"), st = box.querySelector("[data-st]");
    inp.addEventListener("change", async () => {
      const d = inp.files?.[0]; if (!d) return;
      st.textContent = "Wird hochgeladen …";
      try { const bild = await bildHochladen(this._hass, d); this.aendern({ ...this._config, bild }); this.render(); }
      catch (e) { st.textContent = e.message || "Hochladen fehlgeschlagen."; }
    });
  }
}

// Kamera: Standbild in der Karte (alle 10 s neu), Tippen = Livebild groß
class GlasKameraCard extends GlasBereichKarte {
  static getConfigElement() { return document.createElement("glas-kamera-card-editor"); }
  static getStubConfig(hass) { return { entity: Object.keys(hass.states).find((e) => e.startsWith("camera.")) || "" }; }
  css() { return BEREICH_CSS + BILD_CSS; }
  getGridOptions() { return { columns: this._config?.groesse === "ganz" ? 12 : 6, rows: "auto", min_columns: 3 }; }
  // Keine Entität eingestellt: die einzige Kamera in HA nehmen
  eid() { const c = this._config; if (c.entity) return c.entity; const l = Object.keys(this._hass?.states || {}).filter((e) => e.startsWith("camera.")); return l.length === 1 ? l[0] : null; }
  entitaeten() { return [this.eid()].filter(Boolean); }
  st() { return this._hass.states[this.eid()]; }
  titel() { return this._config.name || this.st()?.attributes.friendly_name || "Kamera"; }
  blattTitel() { return this.titel(); }
  blattHoch() { return false; }
  connectedCallback() {
    super.connectedCallback();
    clearInterval(this._takt);
    this._takt = setInterval(() => { const img = this.$(".kamera-karte img"); if (img && !document.hidden) img.src = this.standbild(true); }, 10000);
  }
  disconnectedCallback() { super.disconnectedCallback(); clearInterval(this._takt); }
  standbild(neu = false) {
    const p = this.st()?.attributes.entity_picture;
    if (!p) return "";
    return neu ? `${p}${p.includes("?") ? "&" : "?"}t=${Date.now()}` : p;
  }
  html() {
    const st = this.st(), b = this.standbild();
    const weg = !st || st.state === "unavailable";
    if (!["gross", "ganz"].includes(this._config.groesse)) return this.kompaktHtml({ icon: weg ? "mdi:cctv-off" : "mdi:cctv", farbe: weg ? "#8e8e93" : "var(--g-akzent)", t1: this.titel(), t2: weg ? "Nicht erreichbar" : "Antippen für Livebild" });
    return `<button class="kamera-karte" aria-haspopup="dialog" aria-label="${esc(this.titel())} live öffnen">
      ${b && !weg ? `<img alt="" src="${esc(b)}">` : `<span class="weg"><ha-icon data-i="mdi:cctv-off"></ha-icon></span>`}
      <span class="unten"><span>${esc(this.titel())}</span>${weg ? `<span class="zeit">Nicht erreichbar</span>` : ""}</span></button>`;
  }
  binden() { this.iconsSetzen(); (this.$(".kamera-karte") || this.$(".kompakt"))?.addEventListener("click", () => this.blattOeffnen()); }
  blattHtml(s) {
    return `<style>${BILD_BLATT_CSS}</style>${s.kopfHtml(this.titel(), "Kamera")}<div class="kamera-platz"></div><button class="aktion glas mehr-ha" data-mehr>Mehr in Home Assistant<ha-icon class="pfeil-r" data-i="mdi:chevron-right" aria-hidden="true"></ha-icon></button>`;
  }
  blattOeffnen() {
    super.blattOeffnen();
    const s = this._blatt, alt = s?.zu;
    if (s) s.zu = () => { alt?.(); this._live?.querySelector("img").removeAttribute("src"); }; // Stream beenden
  }
  blattBinden(s, $) {
    const st = this.st();
    if (!this._live) {
      this._live = document.createElement("div");
      this._live.className = "kamera-gross";
      this._live.innerHTML = `<img alt="Livebild">`;
    }
    const src = st?.attributes.access_token ? `/api/camera_proxy_stream/${st.entity_id}?token=${st.attributes.access_token}` : this.standbild();
    const img = this._live.querySelector("img");
    if (img.getAttribute("src") !== src) img.setAttribute("src", src);
    $(".kamera-platz").appendChild(this._live);
    $("[data-mehr]")?.addEventListener("click", () => mehrInfo(this, this.eid()));
  }
}
class GlasKameraEditor extends GlasEditor {
  schema() { return [{ name: "entity", selector: { entity: { filter: [{ domain: "camera" }, { domain: "image" }] } } }, { name: "name", selector: { text: {} } }]; }
  labels() { return { entity: "Kamera", name: "Name (leer = aus HA)" }; }
}
// ---------------------------------------------------------------------------
// Widgets wie auf dem iPhone-Homescreen: quadratische Karten in eigener Farbe, Name darunter.
// Wetter (blau), Planer (weiß, roter Wochentag), Drucker (schwarz, Fortschrittsring),
// Zuhause (C/L, Alarm, Fenster), Robi. Antippen öffnet die große Ansicht.
// ---------------------------------------------------------------------------
const WIDGET_ARTEN = ["wetter", "planer", "drucker", "zuhause", "robi", "sicherheit"];
const WIDGET_CSS = `
:host{display:block}
.w{display:flex;flex-direction:column;align-items:center;gap:6px}
.wk{position:relative;width:100%;aspect-ratio:1;border-radius:26px;padding:var(--g-a4);display:flex;flex-direction:column;text-align:left;overflow:hidden;
  box-shadow:0 6px 22px rgba(0,0,0,.1)}
.wn{font-size:var(--g-s-klein);font-weight:600;color:var(--g-text)}
.wetter{background:linear-gradient(170deg,#3a6fbf,#5d95dc);color:#fff}
.wetter.nacht{background:linear-gradient(170deg,#1b2747,#34497a)}
.wetter .ort{font-size:var(--g-s-name);font-weight:600}
.wetter .grad{font-size:46px;font-weight:300;line-height:1;margin-top:2px}
.wetter .unten{margin-top:auto;display:flex;flex-direction:column;gap:2px;font-size:var(--g-s-klein);font-weight:600}
.wetter .unten small{font-size:var(--g-s-klein);font-weight:500;opacity:.85}
.wetter ha-icon{--mdc-icon-size:22px}
.planer{background:#fff;color:#1c1c1e}
:host([dunkel]) .planer{background:#1c1c1e;color:#f2f2f7}
.planer .tag{font-size:var(--g-s-klein);font-weight:700;letter-spacing:.3px;color:#ff3b30;text-transform:uppercase}
.planer .zahl{font-size:34px;font-weight:300;line-height:1.05}
.planer .liste{margin-top:var(--g-a2);display:flex;flex-direction:column;gap:6px;min-height:0;overflow:hidden}
.planer .e{display:flex;flex-direction:column;padding-left:8px;border-left:3px solid var(--ef,#0a84ff);min-width:0}
.planer .e b{font-size:var(--g-s-klein);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.planer .e span{font-size:var(--g-s-mini);opacity:.6}
.planer .frei{font-size:var(--g-s-klein);opacity:.6;margin-top:var(--g-a2)}
.drucker{background:#1c1c1e;color:#fff;align-items:center;justify-content:center;gap:var(--g-a2)}
.ring-w{position:relative;width:62%;aspect-ratio:1}
.ring-w svg{width:100%;height:100%;transform:rotate(-90deg)}
.ring-w circle{fill:none;stroke-width:9}
.ring-w b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;font-variant-numeric:tabular-nums}
.ring-w ha-icon{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;--mdc-icon-size:34px;color:#8e8e93}
.drucker .zeile{font-size:var(--g-s-klein);font-weight:600;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.zuhause{background:linear-gradient(170deg,#e9f3e6,#cfe8c8);color:#1c1c1e}
.zuhause.weg{background:linear-gradient(170deg,#f2ece4,#e6dccd)}
:host([dunkel]) .zuhause{background:linear-gradient(170deg,#1f3322,#152418);color:#f2f2f7}
:host([dunkel]) .zuhause.weg{background:linear-gradient(170deg,#2f2a22,#211d17)}
.avas{display:flex}
.ava{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:var(--g-s-h2);font-weight:700;color:#fff;
  box-shadow:0 0 0 3px #fff;background:var(--af)}
.ava + .ava{margin-left:-8px}
.ava.weg{filter:grayscale(1);opacity:.55}
.zuhause .unten,.robi .unten{margin-top:auto;display:flex;flex-direction:column;gap:2px}
.zuhause b,.robi b{font-size:var(--g-s-text);font-weight:700;line-height:1.2}
.zuhause small,.robi small{font-size:var(--g-s-klein);opacity:.75;line-height:1.3}
.robi{background:linear-gradient(170deg,#efeaff,#dcd2ff);color:#1c1c1e}
:host([dunkel]) .robi{background:linear-gradient(170deg,#2a2240,#1d1830);color:#f2f2f7}
.robi .kreis{width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#5e5ce6;color:#fff}
.robi .kreis ha-icon{--mdc-icon-size:28px}
`;
const PERSON_FARBEN = ["#0a84ff", "#ff2d55", "#34c759", "#ff9f0a", "#5e5ce6"];

class GlasWidgetCard extends GlasKarte {
  constructor() { super(); this._helfer = new Map(); }
  static standard() { return { art: "wetter" }; }
  static getConfigElement() { return document.createElement("glas-widget-card-editor"); }
  static getStubConfig() { return { art: "zuhause" }; }
  getGridOptions() { return { columns: 6, rows: 4 }; }
  disconnectedCallback() { super.disconnectedCallback(); this._abo?.then((f) => f?.()).catch(() => {}); this._abo = null; }
  helfer(tag, cfg) {
    const json = JSON.stringify(cfg);
    let el = this._helfer.get(tag);
    if (!el || el._json !== json) {
      el = document.createElement(tag);
      try { el.setConfig(cfg); } catch (_) { return null; }
      el._json = json;
      if (tag === "glas-planer-card") {
        // Planer-Karte als Datenquelle: nach jedem Laden (Aufgaben, Termine) das Widget neu zeichnen
        const orig = el.render.bind(el); el.render = () => { orig(); this.render(); };
        const ot = el.termineLaden.bind(el); el.termineLaden = () => ot().then(() => this.render());
      }
      this._helfer.set(tag, el);
    }
    if (el._hass !== this._hass) el.hass = this._hass;
    return el;
  }
  set hass(h) { this._hass = h; Glas.hassSetzen(h); this.toggleAttribute("dunkel", istDunkel(h)); if (this._config) this.render(); }
  get hass() { return this._hass; }
  css() { return WIDGET_CSS; }
  b() { return Glas.einst?.bereiche || {}; }
  name() { return this._config.name || { wetter: "Wetter", planer: "Planer", drucker: this.b().drucker?.name ? `${this.b().drucker.name}` : "3D-Drucker", zuhause: "Zuhause", sicherheit: "Zuhause", robi: this.b().robi?.name || "Robi" }[this._config.art] || ""; }
  html() {
    const a = this._config.art === "sicherheit" ? "zuhause" : this._config.art;
    const inhalt = this[`w_${a}`]?.() || ["", ""];
    return `<div class="w"><button class="wk ${a} ${inhalt[1]}" aria-label="${esc(this.name())}: ${esc(inhalt[2] || "")}">${inhalt[0]}</button><span class="wn" aria-hidden="true">${esc(this.name())}</span></div>`;
  }
  binden() {
    this.iconsSetzen();
    this.$(".wk").addEventListener("click", () => this.oeffnen());
  }
  oeffnen() {
    const a = this._config.art, b = this.b(), h = this._hass;
    vibrieren(8);
    if (a === "wetter") { const e = this.wetterE(); if (e) kzKarteOeffnenSchicht(this, "glas-wetter-card", { ...(b.wetter || {}), entity: e }, "Wetter"); return; }
    if (a === "planer") { kzKarteOeffnenSchicht(this, "glas-planer-card", b.planer || {}, "Planer"); return; }
    if (a === "drucker") { this.helfer("glas-drucker-card", b.drucker || {})?.blattOeffnen(); return; }
    if (a === "robi") { const e = b.robi?.entity || Object.keys(h.states).find((x) => x.startsWith("vacuum.")); if (e) this.helfer("glas-robi-card", { ...(b.robi || {}), entity: e })?.blattOeffnen(); return; }
    this.helfer("glas-sicherheit-card", { fenster_auto: true, ...(b.sicherheit || {}) })?.blattOeffnen();
  }
  wetterE() { return this.b().wetter?.entity || Object.keys(this._hass.states).find((x) => x.startsWith("weather.")); }
  w_wetter() {
    const e = this.wetterE(), st = e && this._hass.states[e];
    if (!st) return [`<span class="ort">Kein Wetter</span>`, ""];
    if (!this._abo && this._hass.connection) {
      this._abo = this._hass.connection.subscribeMessage((m) => { this._tag = m.forecast?.[0]; this.render(); }, { type: "weather/subscribe_forecast", forecast_type: "daily", entity_id: e }).catch(() => null);
    }
    const [text, icon] = WETTER[st.state] || [zustandText(this._hass, st), "mdi:weather-partly-cloudy"];
    const t = st.attributes.temperature, f = this._tag;
    const ht = f && f.temperature != null ? `H ${Math.round(f.temperature)}° T ${Math.round(f.templow ?? f.temperature)}°` : "";
    const ort = this.b().wetter?.ort || st.attributes.friendly_name || "Wetter";
    return [`<span class="ort">${esc(ort)}</span><span class="grad">${t != null ? Math.round(t) : "–"}°</span>
      <span class="unten"><ha-icon data-i="${icon}"></ha-icon>${esc(text)}${ht ? `<small>${ht}</small>` : ""}</span>`, st.state === "clear-night" ? "nacht" : "", `${t}°, ${text}`];
  }
  w_planer() {
    const p = this.helfer("glas-planer-card", this.b().planer || {});
    const jetzt = new Date();
    const tag = jetzt.toLocaleDateString("de-DE", { weekday: "long" });
    const person = Glas.aktuellePerson(this._hass);
    const morgen0 = new Date(jetzt); morgen0.setHours(24, 0, 0, 0);
    const termine = (p?._termine || []).filter((t) => t.start < morgen0 && t.ende > jetzt);
    const farben = p?._daten?.farben || {};
    const auf = (p?.aufgaben?.(person) || []).filter((a) => a.status === "offen");
    const eintraege = [...termine.map((t) => ({ t: t.titel, z: t.ganztag ? "Ganztägig" : `${uhr(t.start)}–${uhr(t.ende)}`, f: "#0a84ff" })),
      ...auf.map((a) => ({ t: a.titel, z: a.uhrzeit || (a.datum && a.datum < heuteIso() ? "überfällig" : "Heute"), f: farben[a.bereich] || "#34c759" }))].slice(0, 2);
    return [`<span class="tag">${esc(tag)}</span><span class="zahl">${jetzt.getDate()}</span>
      ${eintraege.length ? `<span class="liste">${eintraege.map((x) => `<span class="e" style="--ef:${x.f}"><b>${esc(x.t)}</b><span>${esc(x.z)}</span></span>`).join("")}</span>`
        : `<span class="frei">${p?._daten ? "Heute ist nichts geplant" : "Lade …"}</span>`}`, "", `${tag} ${jetzt.getDate()}, ${eintraege.length} Einträge`];
  }
  w_drucker() {
    const d = this.helfer("glas-drucker-card", this.b().drucker || {});
    const w = d?.werte?.();
    if (!w) return [`<span class="zeile">Nicht eingerichtet</span>`, ""];
    const pct = w.laeuft && w.pct != null ? klemmen(w.pct, 0, 100) : null;
    const farbe = w.pause ? "#ff9f0a" : "#34c759";
    const rest = (w.rest.match(/noch ([^·]+)/) || [])[1]?.trim();
    return [`<span class="ring-w"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,.16)"/>
      ${pct != null ? `<circle cx="50" cy="50" r="44" stroke="${farbe}" stroke-linecap="round" stroke-dasharray="${(276.5 * pct / 100).toFixed(1)} 277"/>` : ""}</svg>
      ${pct != null ? `<b>${Math.round(pct)}%</b>` : `<ha-icon data-i="mdi:printer-3d-nozzle"></ha-icon>`}</span>
      <span class="zeile">${esc(pct != null ? `${this.b().drucker?.name || "Drucker"}${rest ? ` · noch ${rest}` : ""}` : `${this.b().drucker?.name || "Drucker"} ${w.status}`)}</span>`, "",
      pct != null ? `${Math.round(pct)} Prozent${rest ? `, noch ${rest}` : ""}` : w.status];
  }
  w_zuhause() {
    const h = this._hass, e = Glas.einst || {};
    const leute = (e.personen || []).filter((p) => !p.tablet);
    const da = leute.filter((p) => p.entity && h.states[p.entity]?.state === "home");
    const text = !leute.length ? "Zuhause" : da.length === leute.length ? (leute.length === 2 ? "Beide zu Hause" : leute.length > 2 ? "Alle zu Hause" : `${leute[0].name} ist da`)
      : da.length ? `${da.map((p) => p.name).join(", ")} zu Hause` : "Keiner zu Hause";
    const alarmE = e.bereiche?.sicherheit?.alarm || Object.keys(h.states).find((x) => x.startsWith("alarm_control_panel."));
    const al = alarmE && h.states[alarmE];
    const fenster = Object.keys(h.states).filter((x) => x.startsWith("binary_sensor.") && ["window", "door", "garage_door", "opening"].includes(h.states[x].attributes.device_class) && h.states[x].state === "on" && !(e.bereiche?.sicherheit?.ausgeblendet || []).includes(x)).length;
    const unter = [al ? (al.state === "disarmed" ? "Alarm aus" : "Alarm scharf") : "", fenster ? `${fenster} offen` : "Alles zu"].filter(Boolean).join(" · ");
    return [`<span class="avas" aria-hidden="true">${leute.slice(0, 3).map((p, i) => `<span class="ava ${da.includes(p) ? "" : "weg"}" style="--af:${PERSON_FARBEN[i % PERSON_FARBEN.length]}">${esc((p.kurz || p.name || "?").slice(0, 1))}</span>`).join("")}</span>
      <span class="unten"><b>${esc(text)}</b><small>${esc(unter)}</small></span>`, da.length ? "" : "weg", `${text}, ${unter}`];
  }
  w_robi() {
    const h = this._hass, e = this.b().robi?.entity || Object.keys(h.states).find((x) => x.startsWith("vacuum."));
    const st = e && h.states[e];
    if (!st) return [`<b>Kein Saugroboter</b>`, ""];
    const ak = st.attributes.battery_level;
    const s = ROBI_STATUS[st.state] || zustandText(h, st);
    return [`<span class="kreis"><ha-icon data-i="mdi:robot-vacuum"></ha-icon></span><span class="unten"><b>${esc(s)}</b>${ak != null ? `<small>Akku ${Math.round(ak)} %</small>` : ""}</span>`, "", `${s}${ak != null ? `, Akku ${Math.round(ak)} Prozent` : ""}`];
  }
}
class GlasWidgetEditor extends GlasEditor {
  schema() {
    return [{ name: "art", selector: { select: { mode: "dropdown", options: [["wetter", "Wetter"], ["planer", "Planer (heute)"], ["drucker", "3D-Drucker"], ["zuhause", "Zuhause (Personen, Alarm, Fenster)"], ["robi", "Robi"]]
      .map(([value, label]) => ({ value, label })) } } }, { name: "name", selector: { text: {} } }];
  }
  labels() { return { art: "Widget", name: "Name darunter (leer = automatisch)" }; }
}
// Eine ganze Karte in einem Blatt zeigen (Wetter, Planer): Widget antippen = große Ansicht
function kzKarteOeffnenSchicht(quelle, tag, cfg, titel) {
  const el = document.createElement(tag);
  try { el.setConfig(cfg); } catch (_) { return; }
  el.hass = Glas.hass;
  const neu = () => { el.hass = Glas.hass; };
  const s = new GlasSchicht({ quelle, titel, zu: () => Glas.hassHoerer.delete(neu) });
  s.dunkel(istDunkel(Glas.hass));
  s.inhalt.innerHTML = s.kopfHtml(titel, "");
  s.kopfBinden();
  s.inhalt.appendChild(el);
  Glas.hassHoerer.add(neu);
  s.oeffnen();
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
.raster > .widget{grid-column:span 6}
@media (min-width:900px){.raster > .widget{grid-column:span 3}}
.abschnitt-titel{grid-column:span 12;margin:var(--g-a4) var(--g-a1) var(--g-a1)}
.fav{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:var(--g-a2)}
.fav > *{min-width:0}
.leer{max-width:520px;margin:12vh auto 0;padding:var(--g-a5);border-radius:var(--g-r);text-align:center;color:var(--g-text)}
.leer h2{margin:0 0 var(--g-a2);font-size:var(--g-s-h2)}
.leer p{margin:0 0 var(--g-a4);color:var(--g-text2);font-size:var(--g-s-name);line-height:1.45}
.leer a{display:inline-flex;align-items:center;min-height:44px;padding:0 var(--g-a5);border-radius:var(--g-r-pille);background:var(--g-akzent-voll);color:#fff;font-weight:600;text-decoration:none}
.unsichtbar{display:none}
.warn-platz{width:100%;margin-top:var(--g-a3);text-align:left;font:inherit}
.warn-platz.aus{opacity:.5}
.platzhalter ha-icon{flex:none}
glas-hinweise-card:not([leer]){margin-top:var(--g-a3)}
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
  // Karten wiederverwenden (gleicher Schlüssel): geänderte Einstellungen per setConfig, damit offene Blätter offen bleiben
  kind(schluessel, tag, cfg) {
    const json = JSON.stringify(cfg);
    let el = this._kinder.get(schluessel);
    if (el && el.localName !== tag) el = null;
    if (!el) {
      el = document.createElement(tag);
      try { el.setConfig(cfg); } catch (e) { el = document.createElement("div"); el.className = "leise"; el.textContent = e.message; }
      el._cfgJson = json;
      if (this._hass) el.hass = this._hass;
    } else if (el._cfgJson !== json) {
      try { el.setConfig?.(cfg); el._cfgJson = json; } catch (e) { console.error(e); }
    }
    this._neu.set(schluessel, el);
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
    if (!this.shadowRoot.firstChild) this.shadowRoot.innerHTML = `<style>${TOKENS}${ZUHAUSE_CSS}${BEARB_CSS}</style><div class="hg"></div><div class="seite"></div><div class="ebene"></div>`;
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
    const schluessel = JSON.stringify([e, person?.id, Glas.bearbeiten]);
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
    if (!Glas.bearbeiten && e.insel?.an !== false) teile.push(this.kind("insel", "glas-insel-card", {}));
    teile.push(this.kind("kopf", "glas-kopf-card", { gruss_modus: e.gruss_modus || "name", gruss_text: e.gruss_text, untertitel: e.untertitel, personen: e.personen || [], chips: s.chips || [] }));
    const b = e.bereiche || {};
    const bearb = Glas.bearbeiten;
    if (b.hinweise?.an !== false && !bearb) {
      teile.push(this.kind("hinweise", "glas-hinweise-card", { wetter: b.wetter?.entity, regen: b.hinweise?.regen,
        personen: (e.personen || []).filter((p) => !p.tablet && p.entity).map((p) => p.entity) }));
    }
    if (bearb) {
      // Warnungen sind sonst unsichtbar: im Bearbeiten-Modus als Platzhalter zum Einstellen
      const w = document.createElement("button");
      w.className = `platzhalter glas warn-platz ${b.hinweise?.an === false ? "aus" : ""}`;
      w.innerHTML = `<ha-icon></ha-icon><span><b>Warnungen</b><span class="leise">${b.hinweise?.an === false ? "Ausgeblendet" : "Erscheinen nur, wenn etwas zutrifft"} · antippen zum Einstellen</span></span>`;
      w.querySelector("ha-icon").icon = "mdi:alert-outline";
      w.addEventListener("click", () => abschnittMenue(this, null, 0, "hinweise"));
      teile.push(w);
    }
    const abZugriff = listeZugriff({ art: "abschnitte", person });
    const raster = document.createElement("div");
    raster.className = "raster";
    for (const [ai, a] of s.abschnitte.entries()) {
      if (!a.an && !bearb) continue;
      let el = null;
      const info = ABSCHNITTE.find(([id]) => id === a.id) || [a.id, a.id, "mdi:card-outline"];
      const platz = (text) => {
        const p = document.createElement("div");
        p.className = "platzhalter glas";
        p.innerHTML = `<ha-icon></ha-icon><span><b>${esc(info[1])}</b><span class="leise">${esc(text)}</span></span>`;
        p.querySelector("ha-icon").icon = info[2];
        return p;
      };
      const umhuellen = (inhalt, griff) => {
        if (!bearb) return inhalt;
        const z = document.createElement("div");
        z.dataset.i = ai; z.dataset.name = info[1];
        if (griff) z.dataset.griff = "titel";
        if (!a.an) z.classList.add("aus");
        z.appendChild(inhalt);
        return z;
      };
      // Von null: offensichtliche Entitäten selbst finden (einzige Wetter-Entität, einziger Saugroboter)
      const erste = (d) => { const l = Object.keys(this._hass.states).filter((x) => x.startsWith(`${d}.`)); return l.length === 1 ? l[0] : null; };
      const wetterE = b.wetter?.entity || erste("weather"), robiE = b.robi?.entity || erste("vacuum");
      const alsWidget = (a.widget || a.id === "zuhause") && WIDGET_ARTEN.includes(a.id);
      const eingerichtet = { wetter: !!wetterE, planer: b.planer?.an !== false, drucker: !!(b.drucker?.geraet || b.drucker?.fortschritt), robi: !!robiE, zuhause: true, sicherheit: true }[a.id];
      if (alsWidget && eingerichtet) el = this.kind(`w-${a.id}`, "glas-widget-card", { art: a.id });
      else if (alsWidget) el = null;
      else if (a.id === "wetter" && wetterE) el = this.kind("wetter", "glas-wetter-card", { ...(b.wetter || {}), entity: wetterE });
      else if (a.id === "planer" && b.planer?.an !== false) el = this.kind("planer", "glas-planer-card", b.planer || {});
      else if (a.id === "sicherheit" && b.sicherheit && (b.sicherheit.alarm || b.sicherheit.fenster_auto !== false)) el = this.kind("sicherheit", "glas-sicherheit-card", { fenster_auto: true, ...(b.sicherheit || {}) });
      else if (a.id === "drucker" && (b.drucker?.geraet || b.drucker?.fortschritt)) el = this.kind("drucker", "glas-drucker-card", b.drucker);
      else if (a.id === "robi" && robiE) el = this.kind("robi", "glas-robi-card", { ...(b.robi || {}), entity: robiE });
      else if (a.id === "gaeste" && (b.gaeste?.ssid || b.gaeste?.ssid_entity)) el = this.kind("gaeste", "glas-gaeste-card", b.gaeste);
      else if (a.id === "favoriten" && (bearb || (s.favoriten || []).some((f) => f.an !== false && (f.entity || f.ordner || listenKarte(f.karte))))) {
        const wrap = document.createElement("div");
        wrap.innerHTML = `<h2 class="h2 abschnitt-titel">Favoriten</h2><div class="fav"></div>`;
        wrap.style.display = bearb ? "grid" : "contents";
        if (bearb) { wrap.style.gridTemplateColumns = "repeat(12,minmax(0,1fr))"; wrap.style.gap = "var(--g-a2)"; }
        const fav = wrap.querySelector(".fav");
        (s.favoriten || []).map((f, i) => ({ f, i })).filter(({ f }) => (bearb || f.an !== false) && (f.entity || f.ordner || listenKarte(f.karte))).forEach(({ f, i }, n) => {
          const kk = f.karte && listenKarte(f.karte);
          const kc = kk && (({ type, ...r }) => r)(listenKarteCfg(f));
          const k = kk ? this.kind(`fav${n}-${f.karte}`, kk[3], kc) : f.ordner ? this.kind(`fav${n}-ordner`, "glas-ordner-card", ordnerCfg(f)) : this.kind(`fav${n}`, "glas-kachel-card", kachelCfg(f));
          const z = document.createElement("div");
          z.style.gridColumn = `span ${SPANNE[f.groesse || "breit"] || 6}`;
          if (bearb) {
            z.dataset.i = i;
            z.dataset.name = kk ? listenKarteName(f) : f.ordner ? `Ordner ${f.name || ""}` : f.name || this._hass.states[f.entity]?.attributes.friendly_name || f.entity;
            if (f.an === false) z.classList.add("aus");
          }
          z.appendChild(k);
          fav.appendChild(z);
        });
        fav.style.gridColumn = "span 12";
        if (bearb) { bearbeitRaster(fav, listeZugriff({ art: "fav", person }), this); raster.appendChild(umhuellen(wrap, true)); wrap.parentElement.style.gridColumn = "span 12"; }
        else raster.append(...wrap.childNodes);
        continue;
      }
      if (!el && !bearb) continue;
      if (!el) el = platz(a.id === "favoriten" ? "Noch keine Favoriten" : !a.an ? "Ausgeblendet" : "Noch nicht eingerichtet · antippen");
      else if (bearb && !a.an) el = platz("Ausgeblendet");
      const z = umhuellen(el, false);
      el.classList.toggle("halb", a.breite === "halb" && !bearb && !alsWidget);
      z.classList.toggle("halb", a.breite === "halb" && !alsWidget);
      el.classList.toggle("widget", alsWidget && !bearb);
      z.classList.toggle("widget", alsWidget);
      raster.appendChild(z);
    }
    teile.push(raster);
    if (bearb) bearbeitRaster(raster, abZugriff, this, { mitNeu: false, menue: (i) => abschnittMenue(this, abZugriff, i) });
    seite.replaceChildren(...teile);
    // Räume: Leiste + Blätter (leben unsichtbar, öffnen über #raum)
    const raeume = (e.raeume || []).filter((r) => r.hash);
    const unten = [];
    if (raeume.length) {
      unten.push(this.kind("leiste", "glas-raumleiste-card", { zuhause_zeigen: true, raeume: raeume.map((r) => ({ name: r.name, icon: r.icon, hash: r.hash, bereich: r.bereich })) }));
      raeume.forEach((r) => unten.push(this.kind(`raum-${r.hash}`, "glas-raum-card", raumCfg(this._hass, r))));
    }
    // Nur umhängen, wenn sich etwas geändert hat: sonst würde ein offenes Raum-Blatt geschlossen
    const jetzt = [...ebene.children];
    if (jetzt.length !== unten.length || jetzt.some((el, i) => el !== unten[i])) ebene.replaceChildren(...unten);
    this._kinder = this._neu;
  }
}
// Ordner aus den Einstellungen → Ordner-Karte
function ordnerCfg(o) { return { name: o.name || "Ordner", groesse: o.groesse || "breit", eintraege: (o.eintraege || []).map((x) => kachelCfg(x)) }; }
// Gerät aus den Einstellungen → Kachel-Konfiguration
function kachelCfg(g) {
  const { an, gruppe, ...rest } = g;
  return { groesse: "breit", zweite_zeile: "zustand", ...rest };
}
// alle = Bearbeiten-Modus: auch Ausgeblendete, mit Index (_i) und Gruppe (_gruppe) für Ziehen und Menü
function raumCfg(hass, r, alle = false) {
  const geraete = (r.geraete || raumGeraeteVorschlag(hass, r.bereich)).map((g, i) => ({ g, i })).filter(({ g }) => (alle || g.an !== false) && (g.entity || g.karte || g.ordner));
  const cards = [];
  let gruppe = null;
  const extra = (g, i, gr) => (alle ? { _i: i, _aus: g.an === false, ...(gr ? { _gruppe: gr } : {}), ...(g.karte ? { _karte: g.karte } : {}) } : {});
  for (const { g, i } of geraete) {
    if (g.karte) {
      const k = listenKarteCfg(g);
      if (!k) continue;
      const gr = g.gruppe || `karte-${g.karte}`;
      if (gr !== gruppe) { gruppe = gr; cards.push({ type: "heading", heading: gruppenName(r, gr), heading_style: "subtitle", _gruppe: gr }); }
      cards.push({ ...k, ...extra(g, i) });
      continue;
    }
    if (g.ordner) {
      const gr = g.gruppe || (g.eintraege?.[0]?.entity && hass.states[g.eintraege[0].entity] ? gruppeVon(hass, g.eintraege[0].entity) : "sonstiges");
      if (gr !== gruppe) { gruppe = gr; cards.push({ type: "heading", heading: gruppenName(r, gr), heading_style: "subtitle", _gruppe: gr }); }
      cards.push({ type: "custom:glas-ordner-card", ...ordnerCfg(g), ...extra(g, i) });
      continue;
    }
    const gr = g.gruppe || gruppeVon(hass, g.entity);
    if (gr !== gruppe) { gruppe = gr; cards.push({ type: "heading", heading: gruppenName(r, gr), heading_style: "subtitle", _gruppe: gr }); }
    cards.push({ type: "custom:glas-kachel-card", ...kachelCfg(g), ...extra(g, i) });
  }
  // Im Bearbeiten-Modus auch leere eigene Abschnitte zeigen, damit man Kacheln hineinziehen kann
  if (alle) {
    const da = new Set(cards.filter((c) => c.type === "heading").map((c) => c._gruppe));
    Object.keys(r.gruppen_namen || {}).filter((g) => g.startsWith("eigen-") && !da.has(g))
      .forEach((g) => cards.push({ type: "heading", heading: gruppenName(r, g), heading_style: "subtitle", _gruppe: g, _leer: true }));
  }
  return { hash: r.hash, name: r.name, icon: r.icon, bereich: r.bereich, temperatur: r.temperatur, feuchte: r.feuchte,
    fenster_auto: r.fenster_auto !== false, fenster_aus: r.fenster_aus || [], alles_aus: r.alles_aus !== false, chips: [...(r.fenster || []), ...(r.bewegung || []), ...(r.chips || [])],
    verlauf_chip: r.verlauf_chip !== false, spalten: r.spalten || 1, cards };
}

class GlasZuhauseEditor extends GlasEditor {
  render() {
    if (!this._hass) return;
    this._gezeichnet = true;
    this.innerHTML = `<p style="line-height:1.45">Diese Karte baut alles aus den zentralen Einstellungen auf. Personen, Räume, Startseite und Aussehen stellst du in der Seitenleiste unter <a href="/glas-einstellungen">Glas</a> ein.</p>`;
  }
}
// ---------------------------------------------------------------------------
// glas-hinweise-card: sichtbare Warnungen ganz oben auf der Startseite
// · Fenster/Türen offen und Regen kommt (Wetter-Vorhersage der nächsten Stunden)
// · Fenster/Türen offen und keiner zu Hause (alle Personen abwesend)
// Erscheint nur, wenn etwas zutrifft – sonst ist die Karte unsichtbar.
// ---------------------------------------------------------------------------
const HINWEIS_CSS = `
:host{display:block}
:host([leer]){display:none}
.hinweise{display:flex;flex-direction:column;gap:var(--g-a2)}
.hinweis{display:flex;align-items:center;gap:var(--g-a3);width:100%;min-height:64px;padding:var(--g-a3) var(--g-a4);border-radius:var(--g-r);text-align:left;
  background:color-mix(in srgb,var(--hf) 16%,var(--g-glas));border:1.5px solid color-mix(in srgb,var(--hf) 55%,transparent);color:var(--g-text);
  animation:rein .4s cubic-bezier(.32,.72,0,1)}
.hinweis .sym{flex:none;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--hfv);color:#fff}
.hinweis .t{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.hinweis b{font-size:var(--g-s-name);font-weight:700}
.hinweis span.u{font-size:var(--g-s-klein);color:var(--g-text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hinweis .pfeil{flex:none;color:var(--g-text2)}
@keyframes rein{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
`;
const REGEN = ["rainy", "pouring", "lightning-rainy", "snowy-rainy", "hail", "snowy", "exceptional"];

class GlasHinweiseCard extends GlasKarte {
  static standard() { return { fenster_klassen: ["window", "door", "garage_door", "opening"] }; }
  getGridOptions() { return { columns: 12, rows: "auto" }; }
  css() { return HINWEIS_CSS; }
  fenster() {
    const h = this._hass, k = this._config.fenster_klassen;
    return Object.values(h.states).filter((st) => st.entity_id.startsWith("binary_sensor.") && k.includes(st.attributes.device_class)
      && st.state === "on" && !h.entities?.[st.entity_id]?.hidden && !(Glas.einst?.bereiche?.sicherheit?.ausgeblendet || []).includes(st.entity_id));
  }
  entitaeten() {
    const h = this._hass;
    return [this._config.regen || this._config.wetter, ...(this._config.personen || []), ...Object.keys(h?.states || {}).filter((e) => e.startsWith("binary_sensor."))].filter(Boolean);
  }
  // Regnet es gerade? Quelle wählbar: Wetter-Entität (Zustand), Regen-/Nässesensor (an) oder Niederschlagssensor (> 0)
  regnet() {
    const h = this._hass, id = this._config.regen || this._config.wetter, st = id && h.states[id];
    if (!st) return false;
    const d = domainVon(id);
    if (d === "weather") return REGEN.includes(st.state);
    if (d === "binary_sensor" || d === "input_boolean" || d === "switch") return st.state === "on";
    const n = Number(st.state);
    return !isNaN(n) ? n > 0 : ["rain", "rainy", "regen", "nass", "wet", "pouring"].includes(String(st.state).toLowerCase());
  }
  keinerDa() {
    const h = this._hass, p = (this._config.personen || []).map((e) => h.states[e]).filter(Boolean);
    return p.length > 0 && p.every((x) => x.state !== "home");
  }
  html() {
    const offen = this.fenster();
    const liste = [];
    if (offen.length) {
      const regen = this.regnet(), weg = this.keinerDa();
      const namen = offen.map((st) => { const a = bereichVon(this._hass, st.entity_id); const r = a && this._hass.areas?.[a]?.name; return r ? `${r}: ${st.attributes.friendly_name}` : st.attributes.friendly_name; }).join(", ");
      const n = `${offen.length} ${offen.length === 1 ? "Fenster/Tür" : "Fenster/Türen"} offen`;
      const wann = regen ? "Es regnet" : "";
      if (weg) liste.push({ farbe: "var(--g-rot)", voll: "var(--g-rot-voll)", icon: "mdi:home-alert", titel: `Keiner zu Hause · ${n}`, unter: [wann, namen].filter(Boolean).join(" · ") });
      else if (wann) liste.push({ farbe: "var(--g-akzent)", voll: "var(--g-akzent-voll)", icon: "mdi:weather-pouring", titel: `${wann} · ${n}`, unter: namen });
    }
    this.toggleAttribute("leer", !liste.length);
    if (!liste.length) return "";
    return `<div class="hinweise" role="status">${liste.map((x) => `<button class="hinweis k" data-fenster style="--hf:${x.farbe};--hfv:${x.voll}">
      <span class="sym"><ha-icon data-i="${x.icon}"></ha-icon></span><span class="t"><b>${esc(x.titel)}</b><span class="u">${esc(x.unter)}</span></span>
      <ha-icon class="pfeil" data-i="mdi:chevron-right"></ha-icon></button>`).join("")}</div>`;
  }
  binden() {
    this.iconsSetzen();
    this.$$("[data-fenster]").forEach((b) => b.addEventListener("click", () => fensterOeffnen(this, null, "")));
  }
}

class GlasHinweiseEditor extends GlasEditor {
  schema() {
    return [
      { name: "an", selector: { boolean: {} } },
      { name: "regen", selector: { entity: { filter: [{ domain: "weather" }, { domain: "binary_sensor", device_class: "moisture" }, { domain: "binary_sensor" }, { domain: "sensor" }] } } },
    ];
  }
  render() { if (this._config.an === undefined) this._config.an = true; super.render(); }
  labels() { return { an: "Warnungen oben auf der Startseite", regen: "Woran erkenne ich Regen? (leer = Wetter-Entität)" }; }
  hilfen() { return { regen: "Wetter-Entität (regnet laut Zustand), Regen-/Nässesensor (an = nass) oder Niederschlagssensor (über 0 = Regen).", an: "Rot: keiner zu Hause und Fenster offen. Blau: es regnet und ein Fenster ist offen. Wetter kommt aus „Wetter“, Personen aus „Personen“." }; }
}
// ---------------------------------------------------------------------------
// Kontrollzentrum wie iOS: an der Raumleiste hochziehen (oder Griff antippen).
// Die Leiste wächst zum dunklen Glas-Feld, die Räume bleiben unten erreichbar.
// Inhalt: Knopf-Block (2×2), Medien, hohe Schieber, Modus, runde Einzelknöpfe.
// ---------------------------------------------------------------------------
const KZ_CSS = `
.fest{position:fixed;left:50%;bottom:calc(20px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(560px,calc(100% - 32px));z-index:6;touch-action:none}
.fest .leiste{position:relative;z-index:2;transition:background-color .25s ease,border-color .25s ease,box-shadow .25s ease}
.kz-dimm{position:fixed;inset:0;z-index:5;background:rgba(0,0,0,.28);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);opacity:0;visibility:hidden;touch-action:none}
.kz-clip{position:absolute;left:0;right:0;bottom:0;height:var(--kz-h,0px);border-radius:34px;overflow:hidden;pointer-events:none;z-index:1}
.kz-panel{position:absolute;left:0;right:0;bottom:0;padding:var(--g-a2) var(--g-a3) 80px;border-radius:34px;container-type:inline-size;
  background:rgba(58,58,66,.72);-webkit-backdrop-filter:blur(34px) saturate(170%);backdrop-filter:blur(34px) saturate(170%);border:1px solid rgba(255,255,255,.12);
  box-shadow:0 20px 60px rgba(0,0,0,.3);transform:translateY(100%);color:#fff}
.offen .kz-clip{pointer-events:auto}
.kz-griff-oben{height:20px;display:flex;align-items:center;justify-content:center;margin-bottom:var(--g-a1)}
.kz-griff-oben span,.kz-griff span{width:36px;height:5px;border-radius:3px;background:currentColor;opacity:.45}
.kz-griff{position:absolute;left:50%;bottom:68px;z-index:3;width:88px;height:22px;margin-left:-44px;display:flex;align-items:center;justify-content:center;color:var(--g-text);transition:opacity .2s ease}
.kz-tipp{position:absolute;left:50%;bottom:92px;z-index:3;transform:translateX(-50%);padding:6px 12px;border-radius:var(--g-r-pille);white-space:nowrap;
  font-size:var(--g-s-klein);font-weight:600;color:var(--g-text);pointer-events:none;box-shadow:0 6px 20px rgba(0,0,0,.12);animation:kz-tipp 2.4s ease-in-out 3}
@keyframes kz-tipp{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,-4px)}}
.offen .kz-griff,.offen .kz-tipp,.zieht .kz-tipp{opacity:0;pointer-events:none}
.im-kz .leiste{background:transparent;border-color:transparent;box-shadow:none;-webkit-backdrop-filter:none;backdrop-filter:none}
.im-kz .raum{color:rgba(255,255,255,.88)}
.im-kz .raum[aria-current="page"]{background:#fff;color:#1c1c1e}
.kz-raster{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-auto-rows:calc((100cqw - 24px - 36px) / 4);gap:12px;grid-auto-flow:row dense}
.kz-raster > *{min-width:0}
.blk{border-radius:28px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.08)}
.b22{grid-column:span 2;grid-row:span 2}
.b12{grid-row:span 2}
.b21{grid-column:span 2}
.b41{grid-column:span 4}
.knoepfe4{display:grid;grid-template-columns:1fr 1fr;place-items:center;padding:8%}
.rk{width:min(64px,100%);aspect-ratio:1;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.16);color:#fff;
  transition:background-color .2s ease,color .2s ease,transform .16s cubic-bezier(.23,1,.32,1)}
.rk ha-icon,.rk ha-state-icon{--mdc-icon-size:26px}
.rk.an{background:#fff;color:var(--kf,#ff9f0a)}
.rk:active,.mod:active,.med-k button:active{transform:scale(.92)}
.med{display:flex;flex-direction:column;justify-content:space-between;padding:14px;gap:6px;overflow:hidden}
.med-kopf{display:flex;gap:10px;align-items:center;min-width:0}
.cover{flex:none;width:44px;height:44px;border-radius:10px;background:linear-gradient(160deg,#ff9f0a,#ff375f) center/cover}
.med-t{min-width:0;display:flex;flex-direction:column}
.med-t b{font-size:var(--g-s-name);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.med-t span{font-size:var(--g-s-klein);color:rgba(255,255,255,.65);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.med-k{display:flex;justify-content:space-around;align-items:center}
.med-k button{width:44px;height:44px;display:flex;align-items:center;justify-content:center;border-radius:50%;color:#fff;transition:transform .16s cubic-bezier(.23,1,.32,1)}
.med-k ha-icon{--mdc-icon-size:28px}
.sch{position:relative;overflow:hidden;border-radius:28px;background:rgba(255,255,255,.16);touch-action:none;cursor:ns-resize}
.sch .f{position:absolute;left:0;right:0;bottom:0;height:100%;background:#fff;transform-origin:50% 100%;transition:transform .2s cubic-bezier(.23,1,.32,1)}
.sch.zieht .f{transition:none}
.sch .sym{position:absolute;left:50%;bottom:16px;margin-left:-14px;color:var(--kf,#ff9f0a)}
.sch .sym ha-state-icon{--mdc-icon-size:28px}
.sch .wert{position:absolute;left:0;right:0;top:12px;text-align:center;font-size:var(--g-s-klein);font-weight:700;color:#fff;mix-blend-mode:difference;font-variant-numeric:tabular-nums}
.mod{display:flex;align-items:center;gap:10px;padding:0 16px;color:#fff;text-align:left;transition:background-color .2s ease,transform .16s cubic-bezier(.23,1,.32,1)}
.mod.an{background:#fff;color:#1c1c1e}
.mod .ic{flex:none;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.16)}
.mod.an .ic{background:var(--kf,#5e5ce6);color:#fff}
.mod span{display:flex;flex-direction:column;min-width:0}
.mod b{font-size:var(--g-s-name);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mod small{font-size:var(--g-s-klein);opacity:.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.reihe{display:flex;justify-content:space-around;align-items:center;padding:0 6px}
.reihe .rk{width:min(56px,44cqw)}
.kz-leer{grid-column:span 4;padding:var(--g-a3);font-size:var(--g-s-klein);color:rgba(255,255,255,.75);line-height:1.4;text-align:center}
@media (prefers-reduced-motion:reduce){.kz-tipp{animation:none}}
`;

// Was ins Kontrollzentrum kommt: aus den Einstellungen, sonst sinnvoll geraten
function kzInhalt(h, e) {
  const k = e?.kontrollzentrum || {};
  const alle = Object.keys(h.states);
  const erste = (f) => alle.find(f);
  const istHeizModus = (x) => /^(input_)?select\./.test(x) && /heiz|heat|modus/i.test(`${x} ${h.states[x].attributes.friendly_name || ""}`);
  const knoepfe = k.knoepfe?.length ? k.knoepfe : [
    alle.some((x) => x.startsWith("light.")) ? "lichter" : null,
    erste(istHeizModus), erste((x) => x.startsWith("alarm_control_panel.")), erste((x) => x.startsWith("vacuum.")),
  ].filter(Boolean);
  const medien = k.medien === "-" ? null : k.medien || erste((x) => x.startsWith("media_player.") && h.states[x].state === "playing") || erste((x) => x.startsWith("media_player.") && h.states[x].attributes.media_title);
  const regler = k.regler?.length ? k.regler : [erste((x) => x.startsWith("light.") && Geraet.istAn(h.states[x]) && Geraet.regler(h.states[x])) || erste((x) => x.startsWith("light.") && Geraet.regler(h.states[x])),
    erste((x) => x.startsWith("cover.") && Geraet.regler(h.states[x]))].filter(Boolean);
  const modus = k.modus === "-" ? null : k.modus || null;
  const rund = k.rund?.length ? k.rund : [...alle.filter((x) => x.startsWith("scene.")).slice(0, 3), ...(e?.bereiche?.gaeste?.ssid || e?.bereiche?.gaeste?.ssid_entity ? ["gaeste"] : [])];
  return { knoepfe: knoepfe.slice(0, 4), medien, regler: regler.slice(0, 2), modus, rund: rund.slice(0, 4) };
}
const lichterAn = (h) => Object.keys(h.states).filter((x) => x.startsWith("light.") && h.states[x].state === "on");

class Kontrollzentrum {
  constructor(leiste, root) {
    this.leiste = leiste; this.root = root; this.p = 0;
    this.w = root.querySelector(".w");
    this.fest = root.querySelector(".fest");
    this.clip = root.querySelector(".kz-clip");
    this.panel = root.querySelector(".kz-panel");
    this.dimm = root.querySelector(".kz-dimm");
    this.raster = root.querySelector(".kz-raster");
    this.griff = root.querySelector(".kz-griff");
    this.dimm.addEventListener("click", () => this.zu());
    this.griff.addEventListener("click", () => { if (performance.now() - (this.gezogen || 0) > 300) this.auf(); });
    this._taste = (e) => { if (e.key === "Escape" && this.offen && !GlasSchicht.stapel.length) { e.stopPropagation(); this.zu(); } };
    this._hass = () => { if (this.offen && !this._sperre) this.zeichnen(); };
    this.gesten();
  }
  get offen() { return this.p > 0.5; }
  hoehe() { return this.panel.offsetHeight || 400; }
  setzen(p) {
    this.p = p;
    const H = this.hoehe();
    this.panel.style.transform = `translateY(${(1 - p) * H}px)`;
    this.dimm.style.opacity = String(klemmen(p, 0, 1));
    this.dimm.style.visibility = p > 0.001 ? "visible" : "hidden";
    this.w.classList.toggle("im-kz", p > 0.35);
  }
  animieren(ziel, v = 0) {
    this.anim?.forEach((a) => a.cancel());
    const von = this.p, H = this.hoehe();
    this.p = ziel;
    this.w.classList.toggle("im-kz", ziel > 0.5);
    this.dimm.style.visibility = "visible";
    const opt = { von, nach: ziel, v: v / H, antwort: ziel ? 0.44 : 0.36, daempfung: ziel ? 0.82 : 1 };
    this.anim = [federAnim(this.panel, (p) => ({ transform: `translateY(${(1 - p) * H}px)` }), opt),
      federAnim(this.dimm, (p) => ({ opacity: String(klemmen(p, 0, 1)) }), opt)];
    this.anim[0].finished.then(() => { this.anim = null; if (!this.p) this.dimm.style.visibility = "hidden"; }, () => {});
  }
  auf(v = 0) {
    if (!this.offenGemerkt) { this.offenGemerkt = true; try { localStorage.setItem("glas-kz-gesehen", "1"); } catch (_) { /* */ } this.root.querySelector(".kz-tipp")?.remove(); }
    this.zeichnen();
    this.clip.style.setProperty("--kz-h", `${this.hoehe() + 2}px`);
    this.w.classList.add("offen");
    this.griff.setAttribute("aria-expanded", "true");
    Glas.hassHoerer.add(this._hass);
    document.addEventListener("keydown", this._taste, true);
    vibrieren(8);
    this.animieren(1, v);
    setTimeout(() => this.raster.querySelector("button")?.focus({ preventScroll: true }), 80);
  }
  zu(v = 0) {
    this.w.classList.remove("offen");
    this.griff.setAttribute("aria-expanded", "false");
    Glas.hassHoerer.delete(this._hass);
    document.removeEventListener("keydown", this._taste, true);
    this.animieren(0, v);
  }
  // aktuelle Lage (auch mitten in einer Feder) übernehmen
  greifen() {
    if (!this.anim) return;
    const m = new DOMMatrixReadOnly(getComputedStyle(this.panel).transform);
    this.anim.forEach((a) => a.cancel()); this.anim = null;
    this.setzen(klemmen(1 - m.m42 / this.hoehe(), 0, 1));
  }
  gesten() {
    let z = null;
    const start = (e) => {
      if (e.button > 0 || e.target.closest(".sch,.med-k,.kz-raster button")) return;
      z = { y: e.clientY, x: e.clientX, aktiv: false, punkte: [[performance.now(), e.clientY]], id: e.pointerId, ziel: e.currentTarget };
    };
    const bewegen = (e) => {
      if (!z || z.id !== e.pointerId) return;
      const dy = e.clientY - z.y, dx = e.clientX - z.x;
      if (!z.aktiv) {
        if (Math.abs(dy) < 8 || Math.abs(dy) < Math.abs(dx)) return;
        if (!this.offen && dy > 0) { z = null; return; }
        z.aktiv = true; z.y = e.clientY;
        this.greifen();
        if (!this.offen) { this.zeichnen(); this.clip.style.setProperty("--kz-h", `${this.hoehe() + 2}px`); }
        z.p0 = this.p; z.H = this.hoehe();
        this.w.classList.add("zieht");
        try { z.ziel.setPointerCapture(e.pointerId); } catch (_) { /* */ }
      }
      let p = z.p0 - (e.clientY - z.y) / z.H;
      if (p > 1) p = 1 + gummi((p - 1) * z.H, 60) / z.H;
      this.setzen(Math.max(0, p));
      const t = performance.now();
      z.punkte.push([t, e.clientY]);
      while (z.punkte.length > 2 && t - z.punkte[0][0] > 90) z.punkte.shift();
    };
    const ende = () => {
      if (!z) return;
      const s = z; z = null;
      if (!s.aktiv) return;
      this.gezogen = performance.now();
      this.w.classList.remove("zieht");
      const [t0, y0] = s.punkte[0], [t1, y1] = s.punkte[s.punkte.length - 1];
      const v = t1 - t0 > 0 ? ((y1 - y0) / (t1 - t0)) * 1000 : 0;
      const ziel = this.p - (v * 0.18) / s.H;
      if (ziel > 0.5 || v < -500) this.auf(-v); else this.zu(-v);
    };
    for (const el of [this.fest, this.panel]) {
      el.addEventListener("pointerdown", start);
      el.addEventListener("pointermove", bewegen);
      el.addEventListener("pointerup", ende);
      el.addEventListener("pointercancel", ende);
    }
    // Klick nach dem Ziehen nicht als Raumwechsel werten
    this.fest.addEventListener("click", (e) => { if (performance.now() - (this.gezogen || 0) < 300) { e.stopPropagation(); e.preventDefault(); } }, true);
  }
  zeichnen() {
    const h = Glas.hass;
    if (!h) return;
    const k = kzInhalt(h, Glas.einst);
    const name = (x) => h.states[x]?.attributes.friendly_name || x;
    const knopf = (x, i) => {
      if (x === "lichter") {
        const n = lichterAn(h).length;
        return `<button class="rk ${n ? "an" : ""}" data-kn="${i}" style="--kf:#ff9f0a" aria-label="${n ? `${n} Lichter an, alle ausschalten` : "Alle Lichter aus"}"><ha-icon data-i="mdi:lightbulb-group${n ? "" : "-off-outline"}"></ha-icon></button>`;
      }
      if (x === "gaeste") return `<button class="rk" data-kn="${i}" aria-label="Gäste-WLAN"><ha-icon data-i="mdi:qrcode"></ha-icon></button>`;
      const st = h.states[x];
      if (!st) return "";
      const d = domainVon(x);
      const an = d === "alarm_control_panel" ? st.state !== "disarmed" : /^(input_)?select$/.test(d) ? st.state !== (st.attributes.options || [])[0] : Geraet.istAn(st);
      const farbe = d === "alarm_control_panel" ? (an ? "#ff3b30" : "#34c759") : farbeAus(null, Geraet.farbe(st));
      return `<button class="rk ${an ? "an" : ""}" data-kn="${i}" style="--kf:${farbe}" aria-label="${esc(name(x))}: ${esc(zustandText(h, st))}"><ha-state-icon data-e="${esc(x)}"></ha-state-icon></button>`;
    };
    let html = "";
    if (k.knoepfe.length) html += `<div class="blk b22 knoepfe4" role="group" aria-label="Schnellknöpfe">${k.knoepfe.map((x, i) => knopf(x, i)).join("")}</div>`;
    const m = k.medien && h.states[k.medien];
    if (m) {
      const a = m.attributes, spielt = m.state === "playing";
      html += `<div class="blk b22 med"><div class="med-kopf"><span class="cover" ${a.entity_picture ? `style="background-image:url('${esc(a.entity_picture)}')"` : ""}></span>
        <span class="med-t"><b>${esc(a.media_title || a.friendly_name || k.medien)}</b><span>${esc(a.media_artist || (a.media_title ? a.friendly_name : zustandText(h, m)))}</span></span></div>
        <div class="med-k"><button data-med="media_previous_track" aria-label="Zurück"><ha-icon data-i="mdi:skip-previous"></ha-icon></button>
        <button data-med="media_play_pause" aria-label="${spielt ? "Pause" : "Abspielen"}"><ha-icon data-i="mdi:${spielt ? "pause" : "play"}"></ha-icon></button>
        <button data-med="media_next_track" aria-label="Weiter"><ha-icon data-i="mdi:skip-next"></ha-icon></button></div></div>`;
    }
    k.regler.forEach((x) => {
      const st = h.states[x], r = Geraet.regler(st);
      if (!st || !r) return;
      const pct = Geraet.istAn(st) || domainVon(x) === "cover" ? klemmen(r.pct, 0, 100) : 0;
      html += `<div class="blk b12 sch" data-r="${esc(x)}" role="slider" tabindex="0" aria-label="${esc(name(x))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct)}" aria-valuetext="${esc(r.text(pct))}"
        style="--kf:${domainVon(x) === "cover" ? "#0a84ff" : farbeAus(null, Geraet.farbe(st))}"><div class="f" style="transform:scaleY(${pct / 100})"></div><span class="wert">${Math.round(pct)} %</span>
        <span class="sym"><ha-state-icon data-e="${esc(x)}"></ha-state-icon></span></div>`;
    });
    const mo = k.modus && h.states[k.modus];
    if (mo) {
      const an = /^(input_)?select$/.test(domainVon(k.modus)) ? mo.state !== (mo.attributes.options || [])[0] : Geraet.istAn(mo);
      html += `<button class="blk b21 mod ${an ? "an" : ""}" data-modus aria-label="${esc(name(k.modus))}: ${esc(zustandText(h, mo))}"><span class="ic"><ha-state-icon data-e="${esc(k.modus)}"></ha-state-icon></span>
        <span><b>${esc(zustandText(h, mo))}</b><small>${esc(name(k.modus))}</small></span></button>`;
    }
    if (k.rund.length) html += `<div class="blk ${k.rund.length > 2 ? "b41" : "b21"} reihe" role="group" aria-label="Einzelknöpfe">${k.rund.map((x, i) => knopf(x, `r${i}`)).join("")}</div>`;
    if (!html) html = `<div class="kz-leer">Noch nichts eingerichtet. In den Glas-Einstellungen unter „Kontrollzentrum“ wählst du Knöpfe, Schieber und Medien.</div>`;
    if (html === this._html) return;
    this._html = html;
    this.raster.innerHTML = html;
    this.raster.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
    this.raster.querySelectorAll("ha-state-icon[data-e]").forEach((el) => { el.hass = h; el.stateObj = h.states[el.dataset.e]; });
    this.binden(k);
  }
  binden(k) {
    const h = () => Glas.hass;
    const tun = (x) => {
      const hs = h(); vibrieren(8);
      if (x === "lichter") { const l = lichterAn(hs); if (l.length) hs.callService("light", "turn_off", { entity_id: l }); return; }
      if (x === "gaeste") { kzKarteOeffnen(this.leiste, "glas-gaeste-card", Glas.einst?.bereiche?.gaeste || {}); return; }
      const st = hs.states[x], d = domainVon(x);
      if (!st) return;
      if (/^(input_)?select$/.test(d)) return hs.callService(d, "select_next", { entity_id: x, cycle: true });
      if (d === "alarm_control_panel") {
        if ((st.state === "disarmed" && st.attributes.code_arm_required) || (st.state !== "disarmed" && st.attributes.code_format)) return mehrInfo(this.leiste, x);
        return hs.callService(d, st.state === "disarmed" ? "alarm_arm_away" : "alarm_disarm", { entity_id: x });
      }
      if (d === "vacuum") return hs.callService(d, ["cleaning", "returning"].includes(st.state) ? "return_to_base" : "start", { entity_id: x });
      if (d === "camera") return mehrInfo(this.leiste, x);
      Geraet.schalten(hs, st);
    };
    this.raster.querySelectorAll("[data-kn]").forEach((b) => {
      const id = b.dataset.kn, x = id.startsWith("r") ? k.rund[Number(id.slice(1))] : k.knoepfe[Number(id)];
      let t = null, lang = false;
      b.addEventListener("pointerdown", () => { lang = false; t = setTimeout(() => { lang = true; if (Glas.hass.states[x]) { vibrieren(12); steuerungOeffnen(this.leiste, x, {}); } }, 480); });
      ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => b.addEventListener(ev, () => clearTimeout(t)));
      b.addEventListener("click", () => { if (!lang) tun(x); });
    });
    this.raster.querySelectorAll("[data-med]").forEach((b) => b.addEventListener("click", () => { vibrieren(8); h().callService("media_player", b.dataset.med, { entity_id: k.medien }); }));
    this.raster.querySelector("[data-modus]")?.addEventListener("click", () => tun(k.modus));
    // Hohe Schieber: Füllung wächst von unten, folgt dem Finger
    this.raster.querySelectorAll("[data-r]").forEach((el) => {
      const x = el.dataset.r, f = el.querySelector(".f"), w = el.querySelector(".wert");
      let z = null;
      el.addEventListener("pointerdown", (e) => {
        const st = h().states[x], r = Geraet.regler(st);
        if (!r) return;
        e.stopPropagation();
        el.setPointerCapture(e.pointerId);
        z = { y: e.clientY, p0: Geraet.istAn(st) || domainVon(x) === "cover" ? r.pct : 0, r, H: el.offsetHeight, bewegt: false, p: null };
        this._sperre = true;
      });
      el.addEventListener("pointermove", (e) => {
        if (!z) return;
        const d = z.y - e.clientY;
        if (!z.bewegt && Math.abs(d) < 4) return;
        z.bewegt = true; el.classList.add("zieht");
        const roh = z.p0 + (d / z.H) * 100;
        z.p = klemmen(roh, 0, 100);
        const ueber = roh > 100 ? gummi(roh - 100, 12) : roh < 0 ? gummi(roh, 12) : 0; // Gummiband am Ende
        f.style.transform = `scaleY(${z.p / 100}) translateY(${-ueber}px)`;
        w.textContent = `${Math.round(z.p)} %`;
        const stufe = Math.round(z.p / 25);
        if (stufe !== z.stufe) { if (z.stufe !== undefined && z.p % 25 < 3) vibrieren(4); z.stufe = stufe; }
      });
      const los = () => {
        if (!z) return;
        const s = z; z = null; this._sperre = false; el.classList.remove("zieht");
        if (s.bewegt) { s.r.setzen(h(), s.p ?? s.p0); el.setAttribute("aria-valuenow", Math.round(s.p ?? s.p0)); }
        else { vibrieren(8); Geraet.schalten(h(), h().states[x]); }
      };
      el.addEventListener("pointerup", los);
      el.addEventListener("pointercancel", los);
      el.addEventListener("keydown", (e) => {
        const d = { ArrowUp: 10, ArrowRight: 10, ArrowDown: -10, ArrowLeft: -10 }[e.key];
        const r = Geraet.regler(h().states[x]);
        if (d && r) { e.preventDefault(); r.setzen(h(), klemmen(r.pct + d, 0, 100)); }
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); Geraet.schalten(h(), h().states[x]); }
      });
    });
  }
}
// Eine Bereichskarte nur als Blatt öffnen (z. B. Gäste-QR aus dem Kontrollzentrum)
function kzKarteOeffnen(quelle, tag, cfg) {
  const el = document.createElement(tag);
  try { el.setConfig(cfg); } catch (_) { return; }
  el.hass = Glas.hass;
  const neu = () => { el.hass = Glas.hass; };
  Glas.hassHoerer.add(neu);
  el.blattOeffnen?.();
  const s = el._blatt;
  if (s) { const zu = s.zu; s.zu = () => { zu?.(); Glas.hassHoerer.delete(neu); }; } else Glas.hassHoerer.delete(neu);
  return el;
}
// ---------------------------------------------------------------------------
// Dynamic Island: schwarze Pille oben, zeigt was gerade läuft (Druck, Robi, Licht-Timer,
// Alarm scharf, Waschmaschine …). Antippen klappt sie auf. Verschwindet, wenn nichts läuft.
// ---------------------------------------------------------------------------
const INSEL_CSS = `
:host{display:contents}
.insel{position:fixed;z-index:5;color:#fff;visibility:hidden}
/* In der Kopfleiste von HA (mittig, wie die echte Insel in der Statusleiste) */
.insel[data-modus=leiste]{visibility:visible;top:calc(env(safe-area-inset-top,0px) + (var(--header-height,56px) - 36px) / 2);left:50%;transform:translateX(-50%)}
/* Ohne HA-Kopfleiste: in der freien Fläche neben „Hallo …“, scrollt mit */
.insel[data-modus=kopf]{visibility:visible;position:absolute;top:var(--iy);left:var(--ixx);transform:translate(-50%,-50%)}
/* Weggescrollt: oben rechts neben der Titel-Blase */
.insel[data-modus=oben]{visibility:visible;top:calc(env(safe-area-inset-top,0px) + var(--g-a2) + 4px);right:var(--g-a4)}
.eng .t,.mini .t,.mini .w,.mini .mehr{display:none}
.mini .ipille{padding:4px}
.ipille{display:flex;align-items:center;gap:10px;min-height:36px;max-width:calc(100vw - 32px);padding:4px 14px 4px 8px;border-radius:var(--g-r-pille);
  background:#000;box-shadow:0 6px 20px rgba(0,0,0,.25);font-size:var(--g-s-klein);font-weight:600;white-space:nowrap;transition:transform .16s cubic-bezier(.23,1,.32,1)}
.ipille:active{transform:scale(.96)}
.ipille .ic{flex:none;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--if)}
.ipille .ic ha-icon{--mdc-icon-size:18px}
.ipille .t{overflow:hidden;text-overflow:ellipsis}
.ipille .w{color:var(--if);font-variant-numeric:tabular-nums}
.ipille .mehr{flex:none;width:22px;height:22px;margin-right:-6px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#1c1c1e;font-size:var(--g-s-mini)}
.ring{flex:none;width:22px;height:22px}
.ring circle{fill:none;stroke-width:3}
.gross{position:fixed;z-index:6;top:calc(var(--header-height,0px) + env(safe-area-inset-top,0px) + var(--g-a2));left:50%;width:min(380px,calc(100vw - 24px));margin-left:calc(min(380px,calc(100vw - 24px)) / -2);
  padding:var(--g-a3) var(--g-a4) var(--g-a4);border-radius:30px;background:#000;color:#fff;box-shadow:0 18px 50px rgba(0,0,0,.35);transform-origin:50% 0;display:flex;flex-direction:column;gap:var(--g-a3)}
.akt{display:flex;flex-direction:column;gap:var(--g-a2)}
.akt + .akt{padding-top:var(--g-a3);border-top:1px solid rgba(255,255,255,.12)}
.akt-kopf{display:flex;align-items:center;gap:var(--g-a3)}
.akt-kopf .ic{flex:none;width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.1);color:var(--if)}
.akt-kopf span{min-width:0;display:flex;flex-direction:column}
.akt-kopf b{font-size:var(--g-s-name);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.akt-kopf small{font-size:var(--g-s-klein);color:rgba(255,255,255,.65)}
.akt-kopf .gw{margin-left:auto;font-size:var(--g-s-h2);font-weight:700;color:var(--if);font-variant-numeric:tabular-nums}
.balken{height:6px;border-radius:3px;background:rgba(255,255,255,.16);overflow:hidden}
.balken i{display:block;height:100%;border-radius:3px;background:var(--if);transform-origin:0 50%}
.knoepfe{display:flex;gap:var(--g-a2)}
.knoepfe button{flex:1;min-height:40px;border-radius:var(--g-r-pille);background:rgba(255,255,255,.14);color:#fff;font-size:var(--g-s-klein);font-weight:600;
  display:flex;align-items:center;justify-content:center;gap:6px;transition:transform .16s cubic-bezier(.23,1,.32,1)}
.knoepfe button:active{transform:scale(.95)}
.knoepfe ha-icon{--mdc-icon-size:18px}
`;
const LAEUFT = ["running", "run", "on", "washing", "drying", "rinsing", "spinning", "active", "program", "in_progress", "läuft"];
const GERAET_MUSTER = /wasch|spül|spuel|trockner|washer|dishwasher|dryer/i;

// Was läuft gerade? Liste von { id, icon, farbe, titel, wert, kurz, pct, knoepfe:[{icon,text,tun}] }
function inselAktivitaeten(h, e, helfer) {
  const l = [], b = e?.bereiche || {};
  // 3D-Drucker (über die Drucker-Karte, damit dieselben Entitäten gelten)
  if (b.drucker && (b.drucker.geraet || b.drucker.fortschritt)) {
    const d = helfer("glas-drucker-card", b.drucker);
    const w = d?.werte?.();
    if (w?.laeuft) {
      const knoepfe = [];
      const pause = d.e(w.pause ? "weiter" : "pause"), licht = d.e("licht");
      if (pause) knoepfe.push({ icon: w.pause ? "mdi:play" : "mdi:pause", text: w.pause ? "Weiter" : "Pause", tun: () => h.callService("button", "press", { entity_id: pause }) });
      if (licht && h.states[licht]) knoepfe.push({ icon: "mdi:lightbulb-outline", text: "Licht", tun: () => h.callService(domainVon(licht), "toggle", { entity_id: licht }) });
      knoepfe.push({ icon: "mdi:printer-3d-nozzle", text: "Öffnen", tun: () => d.blattOeffnen() });
      l.push({ id: "drucker", icon: "mdi:printer-3d-nozzle", farbe: w.pause ? "#ff9f0a" : "#34c759", titel: `${b.drucker.name || "Drucker"}${w.pause ? " pausiert" : ""}`,
        wert: [w.pct != null ? `${Math.round(w.pct)} %` : "", (w.rest.match(/noch ([^·]+)/) || [])[1]?.trim().replace(" Std. ", ":").replace(" Min.", " Min.") || ""].filter(Boolean).join(" · "),
        unter: w.rest, pct: w.pct, knoepfe });
    }
  }
  // Saugroboter
  const robiE = b.robi?.entity || Object.keys(h.states).find((x) => x.startsWith("vacuum."));
  const rs = robiE && h.states[robiE];
  if (rs && ["cleaning", "returning", "paused"].includes(rs.state)) {
    const ak = rs.attributes.battery_level;
    l.push({ id: "robi", icon: "mdi:robot-vacuum", farbe: "#bf5af2", titel: `${b.robi?.name || "Robi"} ${{ cleaning: "saugt", returning: "fährt heim", paused: "pausiert" }[rs.state]}`,
      wert: ak != null ? `${Math.round(ak)} %` : "", unter: ak != null ? `Akku ${Math.round(ak)} %` : "", knoepfe: [
        rs.state === "cleaning" ? { icon: "mdi:pause", text: "Pause", tun: () => h.callService("vacuum", "pause", { entity_id: robiE }) } : { icon: "mdi:play", text: "Weiter", tun: () => h.callService("vacuum", "start", { entity_id: robiE }) },
        { icon: "mdi:home-import-outline", text: "Zur Station", tun: () => h.callService("vacuum", "return_to_base", { entity_id: robiE }) },
        { icon: "mdi:robot-vacuum", text: "Öffnen", tun: () => helfer("glas-robi-card", { ...(b.robi || {}), entity: robiE })?.blattOeffnen() },
      ] });
  }
  // Ausschalt-Timer
  Object.keys(Glas.timer || {}).forEach((eid) => {
    const st = h.states[eid], rest = timerRest(eid);
    if (!st || !rest) return;
    l.push({ id: `timer-${eid}`, icon: "mdi:timer-outline", farbe: "#ff9f0a", titel: st.attributes.friendly_name || eid, wert: rest, unter: `Schaltet aus in ${rest}`,
      knoepfe: [{ icon: "mdi:timer-off-outline", text: "Timer stoppen", tun: () => Glas.timerSetzen(h, eid, 0) }, { icon: "mdi:power", text: "Jetzt aus", tun: () => { Glas.timerSetzen(h, eid, 0); h.callService("homeassistant", "turn_off", { entity_id: eid }); } }] });
  });
  // Alarm scharf
  const alarmE = b.sicherheit?.alarm || Object.keys(h.states).find((x) => x.startsWith("alarm_control_panel."));
  const as = alarmE && h.states[alarmE];
  if (as && as.state !== "disarmed" && !["unavailable", "unknown"].includes(as.state)) {
    const ausgeloest = as.state === "triggered";
    l.push({ id: "alarm", icon: ausgeloest ? "mdi:alarm-light" : "mdi:shield-lock", farbe: ausgeloest ? "#ff3b30" : "#34c759", titel: ausgeloest ? "Alarm ausgelöst!" : "Alarm scharf",
      wert: "", unter: ALARM_TEXT[as.state] || zustandText(h, as), knoepfe: [
        as.attributes.code_format ? { icon: "mdi:shield-home-outline", text: "Entschärfen …", tun: () => fire(document.querySelector("home-assistant") || window, "hass-more-info", { entityId: alarmE }) }
          : { icon: "mdi:shield-off-outline", text: "Unscharf", tun: () => h.callService("alarm_control_panel", "alarm_disarm", { entity_id: alarmE }) }] });
  }
  // Waschmaschine & Co.: selbst gewählt oder am Namen erkannt
  const weitere = e?.insel?.weitere?.length ? e.insel.weitere
    : Object.keys(h.states).filter((x) => /^(sensor|binary_sensor)\./.test(x) && GERAET_MUSTER.test(`${x} ${h.states[x].attributes.friendly_name || ""}`));
  weitere.forEach((x) => {
    const st = h.states[x];
    if (!st || !(LAEUFT.includes(String(st.state).toLowerCase()) || (e?.insel?.weitere?.length && Geraet.istAn(st)))) return;
    const ic = /trock|dryer/i.test(x) ? "mdi:tumble-dryer" : /spül|spuel|dish/i.test(x) ? "mdi:dishwasher" : "mdi:washing-machine";
    l.push({ id: x, icon: ic, farbe: "#0a84ff", titel: (st.attributes.friendly_name || x).replace(/ (status|zustand|state)$/i, ""), wert: "läuft", unter: zustandText(h, st), knoepfe: [] });
  });
  return l;
}

class GlasInselCard extends GlasKarte {
  constructor() {
    super();
    this._helfer = new Map();
    this._blase = () => this.platzieren();
    this._aussen = (e) => { if (this._auf && !e.composedPath().includes(this.$(".gross"))) this.zuklappen(); };
    this._taste = (e) => { if (e.key === "Escape" && this._auf) { e.stopPropagation(); this.zuklappen(); } };
  }
  static standard() { return {}; }
  getCardSize() { return 0; }
  connectedCallback() {
    super.connectedCallback();
    addEventListener("glas-blase", this._blase);
    addEventListener("resize", this._blase);
    addEventListener("glas-insel-platz", this._blase);
    this._takt = setInterval(() => { if (this._hass) this.render(); }, 30e3); // Restzeit der Timer
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    removeEventListener("glas-blase", this._blase);
    removeEventListener("resize", this._blase);
    removeEventListener("glas-insel-platz", this._blase);
    clearInterval(this._takt);
    this.zuklappen(true);
    Glas.inselAktiv = false; this._anzahl = undefined;
    window.dispatchEvent(new CustomEvent("glas-insel-aktiv"));
  }
  // Hilfskarten (unsichtbar) für Drucker/Robi: gleiche Logik und gleiches Blatt wie die großen Karten
  helfer(tag, cfg) {
    const json = JSON.stringify(cfg);
    let el = this._helfer.get(tag);
    if (!el || el._json !== json) {
      el = document.createElement(tag);
      try { el.setConfig(cfg); } catch (_) { return null; }
      el._json = json;
      this._helfer.set(tag, el);
    }
    el.hass = this._hass;
    return el;
  }
  // jede Zustandsänderung kann eine Aktivität betreffen; render() baut nur bei echter Änderung neu
  set hass(h) { this._hass = h; Glas.hassSetzen(h); if (this._config) this.render(); }
  get hass() { return this._hass; }
  css() { return INSEL_CSS; }
  aktivitaeten() { return Glas.einst?.insel?.an === false ? [] : inselAktivitaeten(this._hass, Glas.einst, (t, c) => this.helfer(t, c)); }
  html() {
    const a = this.aktivitaeten();
    this._akt = a;
    if (a.length !== this._anzahl) {
      this._anzahl = a.length;
      Glas.inselAktiv = a.length > 0;
      queueMicrotask(() => window.dispatchEvent(new CustomEvent("glas-insel-aktiv")));
    }
    if (!a.length) { if (this._auf) queueMicrotask(() => this.zuklappen(true)); return ""; }
    const x = a[0];
    const ring = x.pct != null ? `<svg class="ring" viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="9" stroke="rgba(255,255,255,.2)"/>
      <circle cx="11" cy="11" r="9" stroke="${x.farbe}" stroke-linecap="round" stroke-dasharray="${(56.5 * x.pct / 100).toFixed(1)} 57" transform="rotate(-90 11 11)"/></svg>` : "";
    const gross = this._auf ? `<div class="gross" role="dialog" aria-label="Was gerade läuft">${a.map((y, i) => `<div class="akt" style="--if:${y.farbe}">
      <div class="akt-kopf"><span class="ic"><ha-icon data-i="${y.icon}"></ha-icon></span><span><b>${esc(y.titel)}</b>${y.unter ? `<small>${esc(y.unter)}</small>` : ""}</span>
        ${y.pct != null ? `<span class="gw">${Math.round(y.pct)} %</span>` : ""}</div>
      ${y.pct != null ? `<div class="balken"><i style="transform:scaleX(${klemmen(y.pct, 0, 100) / 100})"></i></div>` : ""}
      ${y.knoepfe.length ? `<div class="knoepfe">${y.knoepfe.map((k, j) => `<button data-k="${i}-${j}"><ha-icon data-i="${k.icon}"></ha-icon>${esc(k.text)}</button>`).join("")}</div>` : ""}</div>`).join("")}</div>` : "";
    return `<div class="insel" style="--if:${x.farbe}"><button class="ipille" data-auf aria-expanded="${!!this._auf}" aria-label="${esc(x.titel)} ${esc(x.wert)}${a.length > 1 ? `, und ${a.length - 1} mehr` : ""}">
      <span class="ic">${ring || `<ha-icon data-i="${x.icon}"></ha-icon>`}</span><span class="t">${esc(x.titel)}</span>${x.wert ? `<span class="w">${esc(x.wert)}</span>` : ""}
      ${a.length > 1 ? `<span class="mehr" style="color:${a[1].farbe}"><ha-icon data-i="${a[1].icon}" style="--mdc-icon-size:14px"></ha-icon></span>` : ""}</button></div>${gross}`;
  }
  binden() {
    this.iconsSetzen();
    this.platzieren();
    this.$("[data-auf]")?.addEventListener("click", () => (this._auf ? this.zuklappen() : this.aufklappen()));
    this.$$("[data-k]").forEach((b) => b.addEventListener("click", () => {
      const [i, j] = b.dataset.k.split("-").map(Number);
      vibrieren(8);
      const k = this._akt?.[i]?.knoepfe[j];
      if (k) { Promise.resolve(k.tun()).catch(() => {}); if (/Öffnen|Entschärfen/.test(k.text)) this.zuklappen(); }
    }));
  }
  // Platz suchen: HA-Kopfleiste (falls da), sonst freie Fläche im Kopf, weggescrollt oben rechts.
  // Passt die volle Pille nicht, erst ohne Titel, dann nur das Symbol.
  platzieren() {
    const el = this.$(".insel");
    if (!el) return;
    const kopfH = parseFloat(getComputedStyle(this).getPropertyValue("--header-height")) || 0;
    const P = Glas.inselPlatz, seite = this.parentNode instanceof HTMLElement ? this.parentNode : null;
    let modus = kopfH > 0 ? "leiste" : !Glas.blaseZu && P && seite ? "kopf" : "oben";
    let platz = modus === "leiste" ? innerWidth - 240 : modus === "kopf" ? P.w - 8 : innerWidth * 0.42;
    if (modus === "kopf") {
      const r = seite.getBoundingClientRect();
      el.style.setProperty("--iy", `${P.y - (r.top + scrollY)}px`);
      el.style.setProperty("--ixx", `${P.x - (r.left + scrollX)}px`);
    }
    el.classList.remove("eng", "mini");
    const breite = () => el.querySelector(".ipille")?.offsetWidth || 0;
    el.dataset.modus = modus;
    if (breite() > platz) el.classList.add("eng");
    if (breite() > platz) { el.classList.remove("eng"); el.classList.add("mini"); }
    if (modus !== this._modus) {
      const neu = this._modus !== undefined;
      this._modus = modus;
      if (neu) federAnim(el, (p) => ({ opacity: String(klemmen(p, 0, 1)), scale: String(0.8 + 0.2 * p) }), { antwort: 0.34, daempfung: 0.8 });
    }
  }
  aufklappen() {
    this._auf = true; this._letztesHtml = null;
    const vorher = this.$(".ipille")?.getBoundingClientRect();
    this.render();
    vibrieren(10);
    const g = this.$(".gross");
    if (g && vorher) {
      const r = g.getBoundingClientRect();
      federAnim(g, (p) => ({ transform: `translateX(${(vorher.left + vorher.width / 2 - (r.left + r.width / 2)) * (1 - p)}px) scale(${vorher.width / r.width + (1 - vorher.width / r.width) * p},${vorher.height / r.height + (1 - vorher.height / r.height) * p})`,
        borderRadius: `${30 + (18 - 30) * (1 - p)}px` }), { antwort: 0.42, daempfung: 0.78 });
      [...g.children].forEach((c) => federAnim(c, (p) => ({ opacity: String(klemmen((p - 0.3) * 2, 0, 1)) }), { antwort: 0.4, daempfung: 1 }));
      this.$(".ipille").style.opacity = "0";
    }
    setTimeout(() => { document.addEventListener("pointerdown", this._aussen, true); document.addEventListener("keydown", this._taste, true); }, 0);
    setTimeout(() => this.$(".gross button")?.focus({ preventScroll: true }), 60);
  }
  zuklappen(sofort) {
    if (!this._auf) return;
    this._auf = false;
    document.removeEventListener("pointerdown", this._aussen, true);
    document.removeEventListener("keydown", this._taste, true);
    const g = this.$(".gross"), p = this.$(".ipille");
    if (sofort || !g || !p) { this._letztesHtml = null; this.render(); return; }
    const r = g.getBoundingClientRect(), z = p.getBoundingClientRect();
    [...g.children].forEach((c) => federAnim(c, (q) => ({ opacity: String(klemmen(1 - q * 3, 0, 1)) }), { antwort: 0.2, daempfung: 1 }));
    federAnim(g, (q) => ({ transform: `translateX(${(z.left + z.width / 2 - (r.left + r.width / 2)) * q}px) scale(${1 + (z.width / r.width - 1) * q},${1 + (z.height / r.height - 1) * q})` }),
      { antwort: 0.32, daempfung: 1 }).finished.catch(() => {}).then(() => { this._letztesHtml = null; this.render(); });
    p.style.opacity = "";
  }
}
class GlasInselEditor extends GlasEditor { render() { if (!this._hass) return; this._gezeichnet = true; this.innerHTML = `<p style="line-height:1.45">Die Insel braucht keine Einstellungen: sie findet Drucker, Robi, Timer, Alarm und Waschmaschine selbst. Feinheiten stellst du in der Seitenleiste unter <a href="/glas-einstellungen">Glas</a> › Aussehen ein.</p>`; } }
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
@media (hover:hover) and (pointer:fine){.menue-pop button:hover,.zeile:has(> button.weiter):hover{background:var(--g-fuell)}}
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
    this._seite = null; // null = Übersicht, sonst "raeume", "start", "personen", "aussehen", "dashboard", "karte:<id>", "assistent"
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
    this.shadowRoot.innerHTML = `<style>${TOKENS}${EINST_CSS}${EINR_CSS}</style><div class="hg"></div><div class="seite"><div class="leise">Lädt …</div></div>`;
    this.hintergrund();
    // HA lädt Formular-Bausteine erst bei Bedarf: einmal einen Karten-Editor anfordern
    // … parallel zu den Einstellungen, damit die Seite sofort steht
    const bausteine = (async () => {
      try {
        const hf = await window.loadCardHelpers();
        await Promise.all([{ type: "entities", entities: [] }, { type: "tile", entity: "sun.sun" }].map(async (cfg) => {
          const k = await hf.createCardElement(cfg);
          await k.constructor.getConfigElement?.();
        }));
      } catch (_) { /* geht auch ohne */ }
    })();
    const e = await Glas.einstLaden(this._hass);
    if (!e) {
      this.$(".seite").innerHTML = `<div class="gruppe leise-zeile">${Glas.einstFehler === "fehlt" ? "Die Integration „Glas-Dashboard“ ist nicht eingerichtet: Einstellungen › Geräte &amp; Dienste › Integration hinzufügen." : esc(Glas.einstFehler)}</div>`;
      return;
    }
    this._d = kopie(e);
    this._d.bereiche = this._d.bereiche || {};
    this._d.startseiten = this._d.startseiten || { alle: startseiteStandard() };
    // Erster Besuch: gleich der Assistent, der durch alles führt
    if (!this._d.eingerichtet && !(this._d.raeume || []).length && !(this._d.personen || []).length) this.assistentStarten();
    this.zeichnen();
    // Formular-Bausteine sind da: Seiten mit Formularen neu zeichnen
    bausteine.then(() => { if (this._seite && this._seite !== "assistent") this.zeichnen(); });
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
  html(box, s) { box.insertAdjacentHTML("beforeend", s); return box.lastElementChild; }

  // ---------------- Räume ----------------
  raeumeListe(box) {
    const r = this._d.raeume || [];
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
    this._d.raeume = [...(this._d.raeume || []), raumAusBereich(this._hass, bereich, this._d.raeume || [])];
  }
  raumDetail(box) {
    const i = this._raum, raum = this._d.raeume[i];
    if (!raum) { this._raum = null; this.raeumeListe(box); return; }
    if (!raum.geraete) raum.geraete = raumGeraeteVorschlag(this._hass, raum.bereich);
    const g = this.html(box, `<div class="gruppe form"></div>`);
    const { geraete, ...rest } = raum;
    this.form(g, { alles_aus: true, ...rest }, [
      { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "icon", selector: { icon: {} } }] },
      { name: "bereich", selector: { area: {} } },
      { type: "grid", name: "", schema: [
        { name: "temperatur", selector: { entity: { filter: { domain: "sensor", device_class: "temperature" } } } },
        { name: "feuchte", selector: { entity: { filter: { domain: "sensor", device_class: "humidity" } } } }] },
      { name: "alles_aus", selector: { boolean: {} } },
    ], { name: "Name", icon: "Symbol", bereich: "HA-Bereich", temperatur: "Temperatur im Kopf", feuchte: "Luftfeuchte im Kopf", alles_aus: "Knopf „Alles aus“" }, (v) => {
      const neuBereich = v.bereich && v.bereich !== raum.bereich;
      Object.assign(raum, v);
      ["temperatur", "feuchte", "bereich"].forEach((k) => { if (!(k in v)) delete raum[k]; });
      if (neuBereich && !raum.geraete.length) raum.geraete = raumGeraeteVorschlag(this._hass, v.bereich);
      this.speichern();
      if (neuBereich) this.zeichnen();
    });
    this.raumFensterGruppe(box, raum);
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
      if (x.ordner) {
        // Ordner: zeigen, Größe, auflösen (Inhalt bearbeitest du im Dashboard: Bearbeiten › Ordner antippen)
        const an = x.an !== false;
        const z = this.html(g, `<div class="zeile geraet ${an ? "" : "aus"}" data-i="${i}">
          <span class="griff" tabindex="0" role="button" aria-label="Ordner ${esc(x.name)} verschieben"><ha-icon data-i="mdi:drag-horizontal-variant"></ha-icon></span>
          <button class="schalter" role="switch" aria-checked="${an}" aria-label="Zeigen"></button>
          <span class="name"><b>${esc(x.name || "Ordner")}</b><span>Ordner · ${esc((x.eintraege || []).map((y) => y.name || h.states[y.entity]?.attributes.friendly_name || y.entity).join(", "))}</span></span>
          <span class="optionen"><span class="segment" role="group" aria-label="Größe">${GROESSEN.map(([id, k, t]) => `<button data-g="${id}" title="${t}" aria-label="${t}" aria-pressed="${(x.groesse || "breit") === id}">${k}</button>`).join("")}</span>
          <button class="klein-knopf" data-aufloesen aria-label="Ordner auflösen" title="Ordner auflösen"><ha-icon data-i="mdi:folder-remove-outline"></ha-icon></button></span></div>`);
        const neu = (teil) => { const l = [...liste]; l[i] = { ...l[i], ...teil }; setzen(l); liste = l; this.speichern(); };
        z.querySelector(".schalter").addEventListener("click", (e) => { const a = e.currentTarget.getAttribute("aria-checked") !== "true"; e.currentTarget.setAttribute("aria-checked", a); z.classList.toggle("aus", !a); neu({ an: a }); });
        z.querySelectorAll("[data-g]").forEach((b) => b.addEventListener("click", () => { z.querySelectorAll("[data-g]").forEach((o) => o.setAttribute("aria-pressed", o === b)); neu({ groesse: b.dataset.g }); }));
        z.querySelector("[data-aufloesen]").addEventListener("click", () => {
          const l = [...liste.slice(0, i), ...(x.eintraege || []).map((y) => ({ ...(gruppen ? geraetVorschlag(h, y.entity) : { groesse: "breit" }), ...y, an: true })), ...liste.slice(i + 1)];
          setzen(l); this.speichern(); this.zeichnen();
        });
        if (gruppen) letzte = null;
        return;
      }
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
    const freie = LISTEN_KARTEN.filter(([id, , , , eigen]) => eigen || !liste.some((y) => y.karte === id));
    if (freie.length) {
      const kz = this.html(g, `<div class="hinzu karten-hinzu"><span class="leise">Karte hinzufügen</span>${freie.map(([id, n, ic]) =>
        `<button class="knopf" data-karte="${id}"><ha-icon data-i="${ic}"></ha-icon>${n}</button>`).join("")}</div>`);
      kz.querySelectorAll("[data-karte]").forEach((b) => b.addEventListener("click", () => {
        setzen([...liste, { karte: b.dataset.karte, groesse: "breit", an: true, ...(listenKarte(b.dataset.karte)[4] ? { cfg: {} } : {}) }]); this.speichern(); this.zeichnen();
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
    const eigen = !!listenKarte(id)?.[4];
    const fertig = eigen ? true : id === "drucker" ? !!(b.geraet || b.fortschritt) : !!b.entity;
    const an = x.an !== false;
    const z = this.html(g, `<div class="zeile geraet karte-zeile ${an ? "" : "aus"}" data-i="${i}">
      <span class="griff" tabindex="0" role="button" aria-label="${esc(titel)} verschieben"><ha-icon data-i="mdi:drag-horizontal-variant"></ha-icon></span>
      <button class="schalter" role="switch" aria-checked="${an}" aria-label="Zeigen"></button>
      <span class="name"><b><ha-icon data-i="${icon}"></ha-icon>${esc(eigen ? listenKarteName(x) : `${titel}-Karte`)}</b><span>${eigen ? "Einstellen im Dashboard: Stift, dann Karte antippen" : fertig ? "Einstellungen unter Bereiche" : "Noch nicht eingerichtet: Bereiche öffnen"}</span></span>
      <span class="optionen"><span class="segment" role="group" aria-label="Größe">${[["breit", "M", "Halbe Breite"], ["ganz", "▭", "Ganze Breite"]].map(([gid, k, t]) =>
        `<button data-g="${gid}" title="${t}" aria-label="${t}" aria-pressed="${(x.groesse === "ganz" ? "ganz" : "breit") === gid}">${k}</button>`).join("")}</span>
        ${eigen ? "" : `<button class="klein-knopf" data-bereich aria-label="${esc(titel)} einstellen"><ha-icon data-i="mdi:cog-outline"></ha-icon></button>`}
        <button class="klein-knopf" data-weg aria-label="Entfernen"><ha-icon data-i="mdi:close"></ha-icon></button></span></div>`);
    const neu = (teil) => { const l = [...liste]; l[i] = { ...l[i], ...teil }; setzen(l); merken(l); liste = l; this.speichern(); };
    z.querySelector(".schalter").addEventListener("click", (e) => { const a = e.currentTarget.getAttribute("aria-checked") !== "true"; e.currentTarget.setAttribute("aria-checked", a); z.classList.toggle("aus", !a); neu({ an: a }); });
    z.querySelectorAll("[data-g]").forEach((bt) => bt.addEventListener("click", () => { z.querySelectorAll("[data-g]").forEach((o) => o.setAttribute("aria-pressed", o === bt)); neu({ groesse: bt.dataset.g }); }));
    z.querySelector("[data-bereich]")?.addEventListener("click", () => this.gehe(`karte:${id}`));
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
        <span class="segment" role="group" aria-label="Darstellung">${a.id === "zuhause" ? `<button aria-pressed="true" disabled>Widget</button>` : `<button data-b="halb" aria-pressed="${!a.widget && a.breite === "halb"}" title="Halbe Breite (am PC)">½</button><button data-b="ganz" aria-pressed="${!a.widget && a.breite !== "halb"}" title="Ganze Breite">Ganz</button>${WIDGET_ARTEN.includes(a.id) ? `<button data-b="widget" aria-pressed="${!!a.widget}" title="Quadratisches Widget wie am iPhone">Widget</button>` : ""}`}</span></div>`);
      z.querySelector(".schalter").addEventListener("click", (e) => { a.an = !a.an; e.currentTarget.setAttribute("aria-checked", a.an); z.classList.toggle("aus", !a.an); this.speichern(); });
      z.querySelectorAll("[data-b]").forEach((b) => b.addEventListener("click", () => { if (b.dataset.b === "widget") a.widget = true; else { a.breite = b.dataset.b; delete a.widget; } z.querySelectorAll("[data-b]").forEach((o) => o.setAttribute("aria-pressed", o === b)); this.speichern(); }));
    });
    ziehSortieren(g, (von, nach) => { s.abschnitte = verschieben(s.abschnitte, von, nach); this.speichern(); this.zeichnen(); });
    this.html(box, `<div class="fuss">Abschnitte ohne Einstellung (z. B. kein Saugroboter gewählt) bleiben automatisch weg. „½“ stellt am PC zwei nebeneinander. „Widget“ zeigt die Karte quadratisch wie auf dem iPhone-Homescreen.</div>`);
    this.html(box, `<h2>Favoriten</h2>`);
    this.geraeteListe(box, s.favoriten || [], (neu) => { s.favoriten = neu; });
    this.html(box, `<h2>Schnellzugriff</h2>`);
    const c = this.html(box, `<div class="gruppe form"></div>`);
    this.editor(c, "glas-chips-editor", { chips: s.chips || [] }, (cfg) => { s.chips = cfg.chips || []; this.speichern(); });
  }

  // ---------------- Personen ----------------
  personen(box) {
    const g = this.html(box, `<div class="gruppe form"></div>`);
    this.editor(g, "glas-personen-editor", { gruss_modus: this._d.gruss_modus || "name", gruss_text: this._d.gruss_text, untertitel: this._d.untertitel, personen: this._d.personen || [] }, (cfg) => {
      Object.assign(this._d, { gruss_modus: cfg.gruss_modus, gruss_text: cfg.gruss_text, untertitel: cfg.untertitel, personen: cfg.personen || [] });
      this.speichern();
    });
    // Von null: Personen aus Home Assistant vorschlagen (person.* mit verknüpftem Benutzer)
    const haPers = Object.keys(this._hass.states).filter((e) => e.startsWith("person.")).map((e) => this._hass.states[e]);
    if (!(this._d.personen || []).length && haPers.length) {
      const a = this.html(box, `<div class="aktionen"><button class="knopf" data-ha-pers>${haPers.length === 1 ? "Person" : `${haPers.length} Personen`} aus Home Assistant übernehmen</button></div>`);
      a.querySelector("button").addEventListener("click", () => {
        this._d.personen = [...haPers.map((p) => { const n = p.attributes.friendly_name || p.entity_id.slice(7);
          return { name: n, kurz: n.slice(0, 1).toUpperCase(), entity: p.entity_id, ...(p.attributes.user_id ? { benutzer: p.attributes.user_id } : {}) }; }), { tablet: true }];
        this.speichern(); this.zeichnen();
      });
    }
    this.html(box, `<div class="fuss">Jede Person kann unter „Startseite“ eine eigene Startseite bekommen. Welche Person ein Gerät zeigt, merkt sich jedes Gerät selbst (das Tablet bleibt Tablet).</div>`);
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
  }
  // ---------------- Kontrollzentrum & Dynamic Island ----------------
  kontrollSeite(box) {
    const d = this._d, h = this._hass;
    const K = (d.kontrollzentrum = { ...(d.kontrollzentrum || {}) });
    const I = (d.insel = { ...(d.insel || {}) });
    const vor = kzInhalt(h, { ...d, kontrollzentrum: {} });
    const name = (x) => (x === "lichter" ? "Alle Lichter aus" : x === "gaeste" ? "Gäste-WLAN" : h.states[x]?.attributes.friendly_name || x);
    const schalter = (g, titel, text, an, setzen) => {
      const z = this.html(g, `<div class="zeile"><span class="name"><b>${esc(titel)}</b><span>${esc(text)}</span></span><button class="schalter" role="switch" aria-checked="${an}" aria-label="${esc(titel)}"></button></div>`);
      z.querySelector(".schalter").addEventListener("click", (e) => { const a = e.currentTarget.getAttribute("aria-checked") !== "true"; e.currentTarget.setAttribute("aria-checked", a); setzen(a); this.speichern(); });
    };
    this.html(box, `<h2>Kontrollzentrum</h2>`);
    schalter(this.html(box, `<div class="gruppe"></div>`), "Kontrollzentrum", "An der Raumleiste unten hochziehen", K.an !== false, (a) => { if (a) delete K.an; else K.an = false; });
    const f = this.html(box, `<div class="gruppe form"></div>`);
    this.form(f, { knoepfe: (K.knoepfe || []).filter((x) => h.states[x]), lichter: (K.knoepfe || vor.knoepfe).includes("lichter"), medien: K.medien === "-" ? "" : K.medien || vor.medien || "", regler: K.regler, modus: K.modus === "-" ? "" : K.modus, rund: (K.rund || []).filter((x) => h.states[x]), gaeste: (K.rund || vor.rund).includes("gaeste") }, [
      { name: "lichter", selector: { boolean: {} } },
      { name: "knoepfe", selector: { entity: { multiple: true } } },
      { name: "regler", selector: { entity: { multiple: true, filter: [{ domain: "light" }, { domain: "cover" }, { domain: "fan" }, { domain: "media_player" }, { domain: "climate" }] } } },
      { name: "medien", selector: { entity: { filter: { domain: "media_player" } } } },
      { name: "modus", selector: { entity: { filter: [{ domain: "input_select" }, { domain: "select" }, { domain: "scene" }, { domain: "input_boolean" }, { domain: "script" }] } } },
      { name: "rund", selector: { entity: { multiple: true } } },
      { name: "gaeste", selector: { boolean: {} } },
    ], { lichter: "Knopf „Alle Lichter aus“", knoepfe: "Runde Knöpfe im 2×2-Block (bis 4)", regler: "Hohe Schieber (bis 2)", medien: "Medien-Kachel", modus: "Breite Modus-Kachel (z. B. Heizung Tag/Nacht)",
      rund: "Einzelknöpfe unten (Szenen, Steckdosen, Kamera)", gaeste: "Knopf für den Gäste-QR-Code" }, (v) => {
      const kn = [...(v.lichter ? ["lichter"] : []), ...(v.knoepfe || [])].slice(0, 4);
      K.knoepfe = kn;
      K.regler = (v.regler || []).slice(0, 2); if (!K.regler.length) delete K.regler;
      K.medien = v.medien || "-"; K.modus = v.modus || "-";
      K.rund = [...(v.rund || []), ...(v.gaeste ? ["gaeste"] : [])].slice(0, 4);
      this.speichern();
    }, { knoepfe: `Leer = automatisch: ${vor.knoepfe.map(name).join(", ") || "nichts gefunden"}`, regler: `Leer = automatisch: ${vor.regler.map(name).join(", ") || "nichts gefunden"}`,
      medien: "Leer = keine Medien-Kachel", modus: "Antippen springt zur nächsten Auswahl" });
    this.html(box, `<div class="fuss">Lange auf einen Knopf drücken öffnet die große Steuerung. Die Schieber regeln mit dem Finger von unten nach oben, Tippen schaltet.</div>`);
    this.html(box, `<h2>Dynamic Island</h2>`);
    const gi = this.html(box, `<div class="gruppe"></div>`);
    schalter(gi, "Insel oben", "Zeigt, was gerade läuft: Druck, Robi, Licht-Timer, Alarm, Waschmaschine", I.an !== false, (a) => { if (a) delete I.an; else I.an = false; });
    const fi = this.html(box, `<div class="gruppe form"></div>`);
    this.form(fi, { weitere: I.weitere || [] }, [{ name: "weitere", selector: { entity: { multiple: true } } }], { weitere: "Weitere Geräte (z. B. Waschmaschine)" }, (v) => {
      if ((v.weitere || []).length) I.weitere = v.weitere; else delete I.weitere;
      this.speichern();
    }, { weitere: "Erscheinen, solange sie an sind oder laufen. Leer = Waschmaschine, Spülmaschine und Trockner werden am Namen erkannt." });
  }
  async dashboardBlock(box) {
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
// Einrichtung: Übersicht wie die iOS-Einstellungen + Assistent, der durch alles führt
// Alles wird aus Home Assistant vorgeschlagen (Bereiche, Personen, Geräte, Karten)
// ---------------------------------------------------------------------------
const EINR_CSS = `
.oben .zurueck{margin-left:-6px}
.oben .luft{flex:1}
.gross-titel{text-wrap:balance;margin:var(--g-a1) 0 var(--g-a4);font-size:var(--g-s-titel);font-weight:800;letter-spacing:-.4px}
.zeile.weiter-zeile{cursor:pointer}
.zeile:has(> button.weiter) > :is(.name,.sym,.pfeil,.wert,.punkt){pointer-events:none}
.zeile:has(> button.weiter):active{background:var(--g-fuell)}
.zeile .wert{flex:none;max-width:45%;font-size:var(--g-s-klein);color:var(--g-text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sym.blau{background:var(--g-akzent-voll);color:#fff}.sym.gruen{background:var(--g-gruen-voll);color:#fff}.sym.orange{background:#c25e00;color:#fff}
.sym.lila{background:var(--g-lila-voll);color:#fff}.sym.rot{background:var(--g-rot-voll);color:#fff}.sym.grau{background:#6e6e73;color:#fff}
.punkt{flex:none;width:8px;height:8px;border-radius:50%;background:var(--g-fuell)}.punkt.an{background:var(--g-gruen-voll)}
.held{padding:var(--g-a5) var(--g-a4);border-radius:var(--g-r);text-align:center;background:var(--g-blatt);border:1px solid var(--g-glas-rand);margin-bottom:var(--g-a4)}
.held .as-sym{margin-top:0}
.held h3{margin:0 0 6px;font-size:var(--g-s-h2);font-weight:700}
.held p{margin:0 auto var(--g-a4);max-width:440px;color:var(--g-text2);font-size:var(--g-s-text);line-height:1.4}
.neu .knopf{min-height:34px;padding:0 var(--g-a3);font-size:var(--g-s-klein)}
.neu .knopf.haupt{flex:none}
.karte-info{margin:0 var(--g-a3) var(--g-a3);font-size:var(--g-s-text);color:var(--g-text2);line-height:1.4}
/* Assistent */
.as{display:flex;flex-direction:column;min-height:calc(100vh - 140px);min-height:calc(100dvh - 140px)}
.as-kopf{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:var(--g-a3);min-height:52px;padding-top:env(safe-area-inset-top)}
.fortschritt{flex:1;display:flex;gap:6px}
.fortschritt span{flex:1;height:4px;border-radius:2px;background:var(--g-fuell);transition:background-color .3s ease}
.fortschritt span.an{background:var(--g-akzent-voll)}
.as-schritt{font-size:var(--g-s-klein);color:var(--g-text2);white-space:nowrap}
.text-knopf{min-height:44px;padding:0 var(--g-a2);font-size:var(--g-s-text);color:var(--g-akzent)}
.as-inhalt{flex:1;animation:as-rein .26s cubic-bezier(.23,1,.32,1)}
.as-inhalt.rueck{animation-name:as-zurueck}
@keyframes as-rein{from{opacity:0;transform:translateX(28px)}}
@keyframes as-zurueck{from{opacity:0;transform:translateX(-28px)}}
@media (prefers-reduced-motion:reduce){.as-inhalt,.as-inhalt.rueck{animation:as-blende .2s ease}@keyframes as-blende{from{opacity:0}}}
.as-sym{width:64px;height:64px;margin:var(--g-a5) auto var(--g-a3);border-radius:18px;display:flex;align-items:center;justify-content:center;background:var(--g-akzent-voll);color:#fff;--mdc-icon-size:34px;box-shadow:0 8px 24px rgba(0,0,0,.15)}
.as-sym ha-icon,.held .as-sym ha-icon{--mdc-icon-size:34px}
.as-sym.gruen{background:var(--g-gruen-voll)}.as-sym.orange{background:#c25e00}.as-sym.lila{background:var(--g-lila-voll)}
.as h1{margin:0;text-align:center;text-wrap:balance;font-size:var(--g-s-titel);font-weight:800;letter-spacing:-.4px}
.as-text{text-wrap:pretty;max-width:520px;margin:var(--g-a2) auto var(--g-a5);text-align:center;font-size:var(--g-s-text);line-height:1.45;color:var(--g-text2)}
.as-gruppe-kopf{display:flex;align-items:baseline;justify-content:space-between;margin:var(--g-a4) var(--g-a3) var(--g-a2)}
.as-gruppe-kopf h2{margin:0}
.as-gruppe-kopf button{font-size:var(--g-s-klein);color:var(--g-akzent);min-height:32px}
.zeile.wahl{cursor:pointer;-webkit-tap-highlight-color:transparent}
.zeile.wahl:active{background:var(--g-fuell)}
.haken{flex:none;width:26px;height:26px;border-radius:50%;border:2px solid var(--g-text2);display:flex;align-items:center;justify-content:center;color:transparent;--mdc-icon-size:18px;
  transition:background-color .15s ease,border-color .15s ease,transform .15s cubic-bezier(.23,1,.32,1)}
.zeile.wahl:active .haken{transform:scale(.9)}
.haken[aria-checked="true"]{background:var(--g-akzent-voll);border-color:var(--g-akzent-voll);color:#fff}
.zeile.nicht{opacity:.55}
.tipp{display:flex;gap:var(--g-a3);align-items:flex-start;margin:var(--g-a4) var(--g-a1) 0;padding:var(--g-a3) var(--g-a4);border-radius:var(--g-r-klein);background:var(--g-fuell);font-size:var(--g-s-klein);line-height:1.4;color:var(--g-text)}
.tipp ha-icon{flex:none;--mdc-icon-size:20px;color:var(--g-akzent)}
.schritte{max-width:420px;margin:0 auto}
.schritte .zeile{min-height:56px}
.felder{display:grid;grid-template-columns:1fr 1fr;gap:var(--g-a2);padding:0 var(--g-a3) var(--g-a3) 56px;background:var(--g-blatt)}
.felder input{min-width:0;height:40px;padding:0 var(--g-a3);border-radius:10px;border:1px solid var(--g-glas-rand);background:var(--g-fuell);color:var(--g-text);font:inherit;font-size:16px}
@media (max-width:480px){.felder{grid-template-columns:1fr;padding-left:var(--g-a3)}}
.as-leiste{position:sticky;bottom:0;z-index:5;display:flex;align-items:center;gap:var(--g-a3);margin-top:var(--g-a5);padding:var(--g-a3) 0 calc(var(--g-a3) + env(safe-area-inset-bottom))}
.as-leiste::before{content:"";position:absolute;inset:calc(-1 * var(--g-a5)) calc(-1 * var(--g-a4)) 0;z-index:-1;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);
  -webkit-mask-image:linear-gradient(to bottom,transparent,#000 45%);mask-image:linear-gradient(to bottom,transparent,#000 45%)}
.as-leiste .knopf{box-shadow:0 6px 20px rgba(0,0,0,.12)}
.as-leiste .knopf.haupt{flex:1;justify-content:center;min-height:50px;font-size:var(--g-s-text)}
.as-leiste .knopf.zweit{min-height:50px}
.as-zweit{display:flex;justify-content:center;margin-top:var(--g-a2)}
.zusammen .name b{white-space:normal}
.zusammen .zeile .haken{border:0;background:var(--g-gruen-voll);color:#fff}
`;

const KARTEN_INFO = [
  ["hinweise", "Warnungen", "mdi:alert-outline", "glas-hinweise-card-editor", "rot", "Erscheinen nur, wenn etwas zutrifft: Fenster offen und es regnet, oder Fenster offen und keiner ist zu Hause."],
  ["wetter", "Wetter", "mdi:weather-partly-cloudy", "glas-wetter-card-editor", "blau", "Aktuelles Wetter mit Vorhersage für die nächsten Stunden und Tage."],
  ["planer", "Planer & Kalender", "mdi:calendar-check", "glas-planer-card-editor", "rot", "Aufgaben, Termine und Schichten aus deinem Planer, zum Durchwischen."],
  ["sicherheit", "Sicherheit", "mdi:shield-home-outline", "glas-sicherheit-card-editor", "gruen", "Alarmanlage, offene Fenster und Türen, Kamera."],
  ["drucker", "Drucker & Werkstatt", "mdi:printer-3d-nozzle", "glas-drucker-card-editor", "orange", "Druckfortschritt, Steuerung, Kamera, Warteschlange und knappes Filament."],
  ["robi", "Robi", "mdi:robot-vacuum", "glas-robi-card-editor", "lila", "Saugroboter starten, Räume wählen, Akku und Station."],
  ["gaeste", "Gäste", "mdi:qrcode", "glas-gaeste-card-editor", "grau", "QR-Code, mit dem Gäste ins WLAN kommen."],
];
const kartenInfo = (id) => KARTEN_INFO.find(([k]) => k === id);
const SEITEN = { raeume: ["Räume", "mdi:sofa-outline", "blau"], start: ["Startseite & Favoriten", "mdi:star-outline", "orange"], personen: ["Personen", "mdi:account-multiple-outline", "gruen"],
  aussehen: ["Aussehen", "mdi:palette-outline", "lila"], kontroll: ["Kontrollzentrum & Insel", "mdi:tune-vertical-variant", "grau"], dashboard: ["Dashboard „Zuhause“", "mdi:view-dashboard-outline", "grau"] };
const AS_SCHRITTE = ["start", "raeume", "personen", "karten", "favoriten", "fertig"];

// Neuer Raum aus einem HA-Bereich, mit vorgeschlagenen Geräten
function raumAusBereich(hass, bereich, vorhanden = []) {
  const a = hass.areas?.[bereich] || {};
  let hash = slug(a.name || bereich);
  while (vorhanden.some((r) => r.hash === hash)) hash += "-2";
  return { name: a.name || bereich, icon: a.icon || "mdi:door", bereich, hash, geraete: raumGeraeteVorschlag(hass, bereich) };
}
const haBereiche = (h) => Object.values(h.areas || {}).sort((a, b) => (a.floor_id || "").localeCompare(b.floor_id || "") || (a.name || "").localeCompare(b.name || "", "de"));
const haPersonen = (h) => Object.keys(h.states).filter((e) => e.startsWith("person.")).map((e) => h.states[e]);
function personAusHa(p) {
  const n = p.attributes.friendly_name || p.entity_id.slice(7);
  return { name: n, kurz: n.slice(0, 1).toUpperCase(), entity: p.entity_id, ...(p.attributes.user_id ? { benutzer: p.attributes.user_id } : {}) };
}
const ZAEHL_NAMEN = { light: ["Licht", "Lichter"], climate: ["Heizung", "Heizungen"], cover: ["Rollo", "Rollos"], fenster: ["Fenster", "Fenster"], media_player: ["Lautsprecher", "Lautsprecher"], switch: ["Steckdose", "Steckdosen"] };
function geraeteText(h, geraete) {
  const an = geraete.filter((g) => g.an !== false && g.entity);
  const z = {};
  an.forEach((g) => { const d = domainVon(g.entity), k = d === "binary_sensor" ? "fenster" : d; if (ZAEHL_NAMEN[k]) z[k] = (z[k] || 0) + 1; });
  const teile = Object.entries(z).map(([k, n]) => `${n} ${ZAEHL_NAMEN[k][n === 1 ? 0 : 1]}`);
  return an.length ? teile.slice(0, 3).join(", ") || `${an.length} ${an.length === 1 ? "Gerät" : "Geräte"}` : "Keine Geräte gefunden";
}

// Was gibt es bei dir? Pro Karte: gefunden ja/nein, was, und eine fertige Einstellung
function glasErkennen(h) {
  const alle = (d) => Object.keys(h.states).filter((e) => e.startsWith(`${d}.`) && !h.entities?.[e]?.hidden);
  const name = (e) => h.states[e]?.attributes.friendly_name || e;
  const fenster = Object.keys(h.states).filter((e) => e.startsWith("binary_sensor.") && ["window", "door", "garage_door"].includes(h.states[e].attributes.device_class));
  const wetter = alle("weather")[0], vac = alle("vacuum")[0], alarm = alle("alarm_control_panel")[0];
  const geraete = Object.values(h.devices || {});
  const drucker = geraete.find((d) => /bambu/i.test(`${d.manufacturer || ""} ${d.model || ""}`) && !d.via_device_id) || geraete.find((d) => /bambu/i.test(`${d.manufacturer || ""}`));
  const druckerKam = drucker && Object.keys(h.entities || {}).filter((e) => h.entities[e].device_id === drucker.id && e.startsWith("camera."));
  const kamera = alle("camera").find((e) => !(druckerKam || []).includes(e));
  const komp = h.config?.components || [];
  const planer = komp.includes("planer");
  const druckerName = drucker ? (drucker.name_by_user || drucker.name || "Drucker").replace(/^Bambu Lab\s*/i, "") : "";
  const stecker = drucker && alle("switch").find((e) => /drucker|printer|p1s|p1p|x1c|a1|bambu/i.test(`${e} ${name(e)}`) && h.entities?.[e]?.device_id !== drucker.id);
  const n = fenster.length;
  return {
    hinweise: { gefunden: n > 0, text: n ? `Achtet auf ${n} Fenster und Türen` : "Keine Fenster- oder Türsensoren gefunden", cfg: { an: true } },
    wetter: { gefunden: !!wetter, text: wetter ? name(wetter) : "Keine Wetter-Entität gefunden", cfg: { entity: wetter } },
    planer: { gefunden: planer, text: planer ? "Planer-Integration gefunden" : "Planer-Integration ist nicht installiert", cfg: {} },
    sicherheit: { gefunden: !!(alarm || n || kamera), text: [alarm && name(alarm), n && `${n} Fenster/Türen`, kamera && name(kamera)].filter(Boolean).join(" · ") || "Keine Alarmanlage, Fenster oder Kamera gefunden",
      cfg: { fenster_auto: true, scharf_modus: "away", verlauf: 6, ...(alarm ? { alarm } : {}), ...(kamera ? { kamera } : {}) } },
    drucker: { gefunden: !!drucker, text: drucker ? `${drucker.name_by_user || drucker.name}${stecker ? ` · Steckdose ${name(stecker)}` : ""}` : "Kein Bambu-Lab-Drucker gefunden",
      cfg: drucker ? { name: druckerName || "Drucker", geraet: drucker.id, knapp_g: 200, ...(komp.includes("filament_werkstatt") ? { werkstatt: true } : {}), ...(stecker ? { stecker } : {}) } : {} },
    robi: { gefunden: !!vac, text: vac ? name(vac) : "Kein Saugroboter gefunden", cfg: vac ? { entity: vac, name: "Robi", befehl: "spot_area" } : {} },
    gaeste: { gefunden: true, braucht: true, text: "Braucht WLAN-Name und Passwort", cfg: { verschluesselung: "WPA" } },
  };
}

// Favoriten-Vorschläge: Steuerbares aus den Räumen, Wichtigstes zuerst
const FAV_PRIO = { climate: 0, light: 1, cover: 2, lock: 2, fan: 3, media_player: 4, switch: 5, input_boolean: 6 };
const FAV_HOECHST = { climate: 2, light: 3, cover: 1, lock: 1, fan: 1, media_player: 1, switch: 1, input_boolean: 0 };
function favoritenKandidaten(h, bereiche) {
  const l = [];
  bereiche.forEach((b, ri) => entitaetenImBereich(h, b, Object.keys(FAV_PRIO)).forEach((e) => l.push({ e, b, ri, p: FAV_PRIO[domainVon(e)] })));
  return l.sort((a, b) => a.p - b.p || a.ri - b.ri);
}
function favoritenVorwahl(kandidaten) {
  const z = {}, wahl = [];
  kandidaten.forEach(({ e }) => { const d = domainVon(e); if (wahl.length < 6 && (z[d] || 0) < FAV_HOECHST[d]) { z[d] = (z[d] || 0) + 1; wahl.push(e); } });
  return wahl;
}

Object.assign(GlasEinstellungen.prototype, {
  gehe(seite) { this._seite = seite; this._raum = null; this._nachOben = true; this.zeichnen(); },
  abschnittAlle(id) {
    const S = this._d.startseiten;
    S.alle = startseiteVon(this._d, null);
    return S.alle.abschnitte.find((a) => a.id === id);
  },
  // Ist eine Karte eingerichtet und auf der Startseite?
  kartenStatus(id, erk) {
    const B = this._d.bereiche || {}, b = B[id], h = this._hass;
    const eine = (d) => Object.keys(h.states).filter((x) => x.startsWith(`${d}.`)).length === 1;
    const fertig = { hinweise: true, wetter: !!(b?.entity || eine("weather")), planer: !!erk.planer.gefunden, sicherheit: !!b, drucker: !!(b?.geraet || b?.fortschritt),
      robi: !!(b?.entity || eine("vacuum")), gaeste: !!(b?.ssid || b?.ssid_entity) }[id];
    const an = id === "hinweise" ? b?.an !== false : id === "planer" ? b?.an !== false && this.abschnittAlle(id)?.an !== false : this.abschnittAlle(id)?.an !== false;
    return { fertig, an: fertig && an };
  },

  zeichnen() {
    if (this._seite === "assistent") { this.assistentZeichnen(); return; }
    const S = this._seite, imRaum = S === "raeume" && this._raum !== null;
    const karte = S?.startsWith("karte:") ? kartenInfo(S.slice(6)) : null;
    const titel = S === null ? "Glas" : imRaum ? this._d.raeume[this._raum]?.name || "Raum" : karte ? karte[1] : SEITEN[S]?.[0] || "";
    const scroll = this._nachOben ? 0 : window.scrollY;
    this._nachOben = false;
    this.$(".seite").innerHTML = `<div class="oben"><button class="klein-knopf menue" aria-label="Seitenleiste"><ha-icon data-i="mdi:menu"></ha-icon></button>
      ${S === null ? "" : `<button class="zurueck"><ha-icon data-i="mdi:chevron-left"></ha-icon>${imRaum ? "Räume" : "Glas"}</button>`}<span class="luft"></span>
      <span class="status" aria-live="polite"></span></div><h1 class="gross-titel">${esc(titel)}</h1><div class="inhalt"></div>`;
    this.$(".menue").addEventListener("click", () => fire(this, "hass-toggle-menu"));
    this.$(".zurueck")?.addEventListener("click", () => { if (imRaum) { this._raum = null; this._nachOben = true; this.zeichnen(); } else this.gehe(null); });
    const box = this.$(".inhalt");
    if (S === null) this.uebersicht(box);
    else if (S === "raeume") (this._raum === null ? this.raeumeListe(box) : this.raumDetail(box));
    else if (S === "start") this.startseite(box);
    else if (S === "personen") this.personen(box);
    else if (S === "aussehen") this.aussehen(box);
    else if (S === "kontroll") this.kontrollSeite(box);
    else if (S === "dashboard") this.dashboardBlock(box);
    else if (karte) this.kartenSeite(box, karte);
    this.icons();
    window.scrollTo(0, scroll);
  },
  icons() {
    this.$$("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
    this.$$("ha-state-icon[data-e]").forEach((el) => { el.hass = this._hass; el.stateObj = this._hass.states[el.dataset.e]; });
  },
  zeilenLink(g, { seite, icon, farbe, titel, wert = "", punkt = null }) {
    const z = this.html(g, `<div class="zeile weiter-zeile"><button class="weiter" aria-label="${esc(titel)}"></button>
      <span class="sym ${farbe}"><ha-icon data-i="${icon}"></ha-icon></span><span class="name"><b>${esc(titel)}</b></span>
      ${wert ? `<span class="wert">${esc(wert)}</span>` : ""}${punkt === null ? "" : `<span class="punkt ${punkt ? "an" : ""}" aria-hidden="true"></span>`}
      <ha-icon class="pfeil" data-i="mdi:chevron-right"></ha-icon></div>`);
    z.querySelector(".weiter").addEventListener("click", () => this.gehe(seite));
  },

  // Fenster/Türen oben im Raum: jeden Sensor einzeln an/aus
  raumFensterGruppe(box, raum) {
    const h = this._hass, alle = raumFensterAlle(h, raum), auto = raumFensterAuto(h, raum.bereich);
    this.html(box, `<h2>Fenster und Türen oben im Raum</h2>`);
    const g = this.html(box, `<div class="gruppe"></div>`);
    if (!alle.length) g.innerHTML = `<div class="leise-zeile">Im Bereich gibt es keine Fenster- oder Türsensoren. Unten kannst du einen hinzufügen.</div>`;
    let gezeigt = raumFensterGezeigt(h, raum);
    alle.forEach((e) => {
      const st = h.states[e], an = gezeigt.includes(e), fremd = !auto.includes(e);
      const z = this.html(g, `<div class="zeile ${an ? "" : "aus"}"><span class="sym"><ha-state-icon data-e="${esc(e)}"></ha-state-icon></span>
        <span class="name"><b>${esc(st?.attributes.friendly_name || e)}</b><span>${st ? esc(Geraet.zustand(h, st, null)) : "nicht gefunden"}${fremd ? " · hinzugefügt" : ""}</span></span>
        <button class="schalter" role="switch" aria-checked="${an}" aria-label="${esc(st?.attributes.friendly_name || e)} oben anzeigen"></button></div>`);
      z.querySelector(".schalter").addEventListener("click", (ev) => {
        const neu = ev.currentTarget.getAttribute("aria-checked") !== "true";
        ev.currentTarget.setAttribute("aria-checked", neu); z.classList.toggle("aus", !neu);
        gezeigt = neu ? [...gezeigt, e] : gezeigt.filter((x) => x !== e);
        raumFensterSetzen(h, raum, gezeigt);
        this.speichern();
        if (fremd && !neu) this.zeichnen();
      });
    });
    const hinzu = this.html(g, `<div class="hinzu"></div>`);
    this.form(hinzu, {}, [{ name: "e", selector: { entity: { filter: { domain: "binary_sensor", device_class: CHIP_KLASSEN } } } }], { e: "Weiteren Sensor hinzufügen" }, (v) => {
      if (!v.e || gezeigt.includes(v.e)) return;
      raumFensterSetzen(h, raum, [...gezeigt, v.e]); this.speichern(); this.zeichnen();
    });
    this.html(box, `<div class="fuss">Ausgeschaltete Sensoren erscheinen nicht mehr als Chip oben im Raum. In „Fenster und Türen“ und bei den Warnungen bleiben sie.</div>`);
  },

  // ---------------- Übersicht ----------------
  uebersicht(box) {
    const d = this._d, h = this._hass, erk = glasErkennen(h);
    const leer = !(d.raeume || []).length && !(d.personen || []).length;
    if (leer) {
      const held = this.html(box, `<div class="held glas"><div class="as-sym"><ha-icon data-i="mdi:home-heart"></ha-icon></div>
        <h3>Los geht’s</h3><p>Der Assistent führt dich in vier kurzen Schritten durch alles. Räume, Personen und Geräte sind aus Home Assistant schon vorausgefüllt.</p>
        <button class="knopf haupt">Einrichtung starten</button></div>`);
      held.querySelector("button").addEventListener("click", () => { this.assistentStarten(); this.zeichnen(); });
    }
    if (!leer) this.neuGefunden(box, erk);
    this.html(box, `<h2>Zuhause</h2>`);
    let g = this.html(box, `<div class="gruppe"></div>`);
    const r = d.raeume || [], p = (d.personen || []).filter((x) => !x.tablet), s = startseiteVon(d, null);
    const favN = (s.favoriten || []).filter((f) => f.an !== false).length;
    this.zeilenLink(g, { seite: "raeume", ...this.seiteInfo("raeume"), wert: r.length ? `${r.length} ${r.length === 1 ? "Raum" : "Räume"}` : "Keine" });
    this.zeilenLink(g, { seite: "start", ...this.seiteInfo("start"), wert: `${favN} Favoriten` });
    this.zeilenLink(g, { seite: "personen", ...this.seiteInfo("personen"), wert: p.map((x) => x.name).join(", ") || "Keine" });
    this.html(box, `<h2>Karten auf der Startseite</h2>`);
    g = this.html(box, `<div class="gruppe"></div>`);
    KARTEN_INFO.forEach(([id, titel, icon, , farbe]) => {
      const st = this.kartenStatus(id, erk);
      this.zeilenLink(g, { seite: `karte:${id}`, icon, farbe, titel, wert: st.an ? "An" : st.fertig ? "Aus" : "Nicht eingerichtet", punkt: st.an });
    });
    this.html(box, `<h2>Darstellung</h2>`);
    g = this.html(box, `<div class="gruppe"></div>`);
    const A = { modus: "auto", hintergrund: "klassisch", ...(d.aussehen || {}) };
    this.zeilenLink(g, { seite: "aussehen", ...this.seiteInfo("aussehen"), wert: `${{ auto: "Automatisch", hell: "Hell", dunkel: "Dunkel" }[A.modus] || ""} · ${HINTERGRUENDE[A.hintergrund]?.name || (A.hintergrund === "tageszeit" ? "Nach Tageszeit" : "Wie HA")}` });
    this.zeilenLink(g, { seite: "kontroll", ...this.seiteInfo("kontroll"), wert: d.kontrollzentrum?.an === false ? "Aus" : "An" });
    this.zeilenLink(g, { seite: "dashboard", ...this.seiteInfo("dashboard") });
    if (!leer) {
      const a = this.html(box, `<div class="aktionen"><button class="knopf"><ha-icon data-i="mdi:auto-fix"></ha-icon>Assistent erneut durchgehen</button></div>`);
      a.querySelector("button").addEventListener("click", () => { this.assistentStarten(); this.zeichnen(); });
      this.html(box, `<div class="fuss">Der Assistent behält alles, was du schon eingestellt hast, und schlägt nur Neues vor.</div>`);
    }
  },
  seiteInfo(id) { const [titel, icon, farbe] = SEITEN[id]; return { titel, icon, farbe }; },

  // Neues in Home Assistant seit der Einrichtung: mit einem Tipp übernehmen oder ausblenden
  neuGefunden(box, erk) {
    const d = this._d, h = this._hass;
    const ig = (d.ignoriert = d.ignoriert || {});
    const igL = (k) => (ig[k] = ig[k] || []);
    const posten = [];
    const raeume = d.raeume || [];
    const bereiche = haBereiche(h).filter((a) => !raeume.some((r) => r.bereich === a.area_id) && !igL("bereiche").includes(a.area_id) && raumGeraeteVorschlag(h, a.area_id).some((g) => g.an));
    if (bereiche.length) posten.push({ icon: "mdi:sofa-outline", farbe: "blau", titel: bereiche.length === 1 ? `Neuer Bereich: ${bereiche[0].name}` : `${bereiche.length} neue Bereiche`, text: bereiche.map((a) => a.name).join(", "),
      los: () => { bereiche.forEach((a) => { d.raeume = [...(d.raeume || []), raumAusBereich(h, a.area_id, d.raeume || [])]; }); }, weg: () => igL("bereiche").push(...bereiche.map((a) => a.area_id)) });
    const fehlen = [];
    raeume.forEach((r) => { if (!r.bereich || !r.geraete) return; raumGeraeteVorschlag(h, r.bereich).filter((v) => v.an && !r.geraete.some((x) => x.entity === v.entity) && !igL("geraete").includes(v.entity)).forEach((v) => fehlen.push({ r, v })); });
    if (fehlen.length) posten.push({ icon: "mdi:lightbulb-on-outline", farbe: "orange", titel: `${fehlen.length} ${fehlen.length === 1 ? "neues Gerät" : "neue Geräte"} in deinen Räumen`,
      text: fehlen.slice(0, 3).map(({ v }) => h.states[v.entity]?.attributes.friendly_name || v.entity).join(", ") + (fehlen.length > 3 ? " …" : ""),
      los: () => fehlen.forEach(({ r, v }) => { r.geraete = [...r.geraete, v]; }), weg: () => igL("geraete").push(...fehlen.map(({ v }) => v.entity)) });
    const pers = haPersonen(h).filter((p) => !(d.personen || []).some((x) => x.entity === p.entity_id) && !igL("personen").includes(p.entity_id));
    if (pers.length && (d.personen || []).length) posten.push({ icon: "mdi:account-plus-outline", farbe: "gruen", titel: pers.length === 1 ? `Neue Person: ${pers[0].attributes.friendly_name}` : `${pers.length} neue Personen`, text: "Aus Home Assistant",
      los: () => { const t = (d.personen || []).filter((x) => x.tablet); d.personen = [...(d.personen || []).filter((x) => !x.tablet), ...pers.map(personAusHa), ...t]; }, weg: () => igL("personen").push(...pers.map((p) => p.entity_id)) });
    KARTEN_INFO.forEach(([id, titel, icon, , farbe]) => {
      const e = erk[id];
      if (!e.gefunden || e.braucht || id === "hinweise" || this.kartenStatus(id, erk).fertig || igL("karten").includes(id)) return;
      posten.push({ icon, farbe, titel: `${titel} gefunden`, text: e.text, los: () => { d.bereiche[id] = { ...e.cfg }; const a = this.abschnittAlle(id); if (a) a.an = true; }, weg: () => igL("karten").push(id) });
    });
    if (!posten.length) return;
    this.html(box, `<h2>Neu gefunden</h2>`);
    const g = this.html(box, `<div class="gruppe neu"></div>`);
    posten.forEach((x) => {
      const z = this.html(g, `<div class="zeile"><span class="sym ${x.farbe}"><ha-icon data-i="${x.icon}"></ha-icon></span>
        <span class="name"><b>${esc(x.titel)}</b><span>${esc(x.text)}</span></span>
        <button class="knopf haupt" data-los>Übernehmen</button><button class="klein-knopf" data-weg aria-label="Nicht übernehmen"><ha-icon data-i="mdi:close"></ha-icon></button></div>`);
      z.querySelector("[data-los]").addEventListener("click", () => { x.los(); this.speichern(); this.zeichnen(); });
      z.querySelector("[data-weg]").addEventListener("click", () => { x.weg(); this.speichern(); this.zeichnen(); });
    });
    this.html(box, `<div class="fuss">„×“ blendet den Vorschlag dauerhaft aus.</div>`);
  },

  // ---------------- Eine Karte ----------------
  kartenSeite(box, [id, titel, icon, tag, , info]) {
    const B = this._d.bereiche, erk = glasErkennen(this._hass), e = erk[id], st = this.kartenStatus(id, erk);
    this.html(box, `<p class="karte-info">${esc(info)}</p>`);
    const g = this.html(box, `<div class="gruppe"></div>`);
    const z = this.html(g, `<div class="zeile"><span class="name"><b>Auf der Startseite zeigen</b><span>${st.fertig ? "" : "Wird angezeigt, sobald sie eingerichtet ist"}</span></span>
      <button class="schalter" role="switch" aria-checked="${id === "hinweise" ? B.hinweise?.an !== false : (id === "planer" ? B.planer?.an !== false : true) && this.abschnittAlle(id)?.an !== false}" aria-label="Auf der Startseite zeigen"></button></div>`);
    z.querySelector(".schalter").addEventListener("click", (ev) => {
      const an = ev.currentTarget.getAttribute("aria-checked") !== "true";
      ev.currentTarget.setAttribute("aria-checked", an);
      if (id === "hinweise" || id === "planer") B[id] = { ...(B[id] || {}), an };
      if (id !== "hinweise") this.abschnittAlle(id).an = an;
      this.speichern();
    });
    if (e.gefunden && !e.braucht && id !== "hinweise" && JSON.stringify(e.cfg) !== JSON.stringify({}) && !st.fertig) {
      const v = this.html(g, `<div class="zeile"><span class="sym ${kartenInfo(id)[4]}"><ha-icon data-i="mdi:auto-fix"></ha-icon></span><span class="name"><b>Automatisch gefunden</b><span>${esc(e.text)}</span></span>
        <button class="knopf haupt">Übernehmen</button></div>`);
      v.querySelector("button").addEventListener("click", () => { B[id] = { ...e.cfg, ...(B[id] || {}) }; const a = this.abschnittAlle(id); if (a) a.an = true; this.speichern(); this.zeichnen(); });
    } else if (!e.gefunden) this.html(box, `<div class="fuss">${esc(e.text)}.</div>`);
    this.html(box, `<h2>Einstellungen</h2>`);
    const f = this.html(box, `<div class="gruppe form"></div>`);
    this.editor(f, tag, B[id] || {}, (cfg) => { B[id] = cfg; this.speichern(); });
    this.html(box, `<div class="fuss">Im Dashboard selbst geht es auch: Stift oben antippen, dann die Karte.</div>`);
  },

  // ---------------- Assistent ----------------
  assistentStarten() {
    const d = this._d, h = this._hass, erk = glasErkennen(h);
    const r = d.raeume || [];
    const bereiche = haBereiche(h);
    const raeume = {};
    // vorhandene Räume bleiben, neue Bereiche mit Geräten werden vorgeschlagen (außer ausgeblendete)
    bereiche.forEach((a) => { raeume[a.area_id] = r.some((x) => x.bereich === a.area_id) || (!(d.ignoriert?.bereiche || []).includes(a.area_id) && raumGeraeteVorschlag(h, a.area_id).some((g) => g.an)); });
    const personen = {};
    haPersonen(h).forEach((p) => { personen[p.entity_id] = (d.personen || []).length ? (d.personen || []).some((x) => x.entity === p.entity_id) : true; });
    const karten = {};
    KARTEN_INFO.forEach(([id]) => { const st = this.kartenStatus(id, erk); karten[id] = st.fertig ? st.an : erk[id].gefunden && !erk[id].braucht; });
    const favAlt = (startseiteVon(d, null).favoriten || []).filter((f) => f.entity).map((f) => f.entity);
    this._as = { schritt: 0, richtung: 1, raeume, personen, tablet: (d.personen || []).length ? (d.personen || []).some((x) => x.tablet) : true, karten,
      gaeste: { ssid: d.bereiche?.gaeste?.ssid || "", passwort: d.bereiche?.gaeste?.passwort || "" }, fav: favAlt.length ? new Set(favAlt) : null, favAlle: false, dashboard: true, ergebnis: null };
    this._seite = "assistent";
    this._nachOben = true;
  },
  asGewaehlteBereiche() { return haBereiche(this._hass).filter((a) => this._as.raeume[a.area_id]).map((a) => a.area_id); },
  asWeiter(n) {
    const A = this._as;
    A.richtung = n;
    A.schritt = Math.max(0, Math.min(AS_SCHRITTE.length - 1, A.schritt + n));
    this.zeichnen();
    window.scrollTo(0, 0);
  },
  assistentZeichnen() {
    const A = this._as, h = this._hass, schritt = AS_SCHRITTE[A.schritt];
    const zahl = A.schritt >= 1 && A.schritt <= 4;
    const seite = this.$(".seite");
    seite.innerHTML = `<div class="as"><div class="as-kopf">
        ${zahl ? `<div class="fortschritt" aria-hidden="true">${[1, 2, 3, 4].map((i) => `<span class="${i <= A.schritt ? "an" : ""}"></span>`).join("")}</div><span class="as-schritt">Schritt ${A.schritt} von 4</span>` : `<span class="luft" style="flex:1"></span>`}
        ${schritt === "fertig" ? "" : `<button class="text-knopf" data-abbruch>${(this._d.raeume || []).length ? "Abbrechen" : "Später"}</button>`}</div>
      <div class="as-inhalt ${A.richtung < 0 ? "rueck" : ""}"></div><div class="as-leiste"></div></div>`;
    seite.querySelector("[data-abbruch]")?.addEventListener("click", () => this.gehe(null));
    const box = seite.querySelector(".as-inhalt"), leiste = seite.querySelector(".as-leiste");
    const kopf = (icon, titel, text, farbe = "") => this.html(box, `<div><div class="as-sym ${farbe}"><ha-icon data-i="${icon}"></ha-icon></div><h1>${titel}</h1><p class="as-text">${text}</p></div>`);
    const knoepfe = (haupt, hauptText, zurueck = true) => {
      leiste.innerHTML = `${zurueck ? `<button class="knopf zweit" data-zurueck><ha-icon data-i="mdi:chevron-left"></ha-icon>Zurück</button>` : ""}<button class="knopf haupt" data-haupt>${hauptText}</button>`;
      leiste.querySelector("[data-zurueck]")?.addEventListener("click", () => this.asWeiter(-1));
      leiste.querySelector("[data-haupt]").addEventListener("click", haupt);
    };
    const wahlZeile = (g, { an, icon, sym, farbe = "", titel, text, klick, nicht = false }) => {
      const z = this.html(g, `<div class="zeile wahl ${nicht ? "nicht" : ""}" role="checkbox" tabindex="0" aria-checked="${an}">
        <span class="haken" aria-hidden="true" aria-checked="${an}"><ha-icon data-i="mdi:check-bold"></ha-icon></span>
        ${sym || `<span class="sym ${farbe}"><ha-icon data-i="${icon}"></ha-icon></span>`}<span class="name"><b>${esc(titel)}</b><span>${esc(text)}</span></span></div>`);
      const umschalten = () => { const neu = z.getAttribute("aria-checked") !== "true"; z.setAttribute("aria-checked", neu); z.querySelector(".haken").setAttribute("aria-checked", neu); klick(neu); };
      if (!nicht) {
        z.addEventListener("click", umschalten);
        z.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); umschalten(); } });
      }
      return z;
    };
    const gruppeKopf = (titel, alleSetzen) => {
      const k = this.html(box, `<div class="as-gruppe-kopf"><h2>${titel}</h2>${alleSetzen ? `<button data-alle>Alle</button>` : ""}</div>`);
      k.querySelector("[data-alle]")?.addEventListener("click", () => { alleSetzen(); this.assistentZeichnen(); });
    };
    const tipp = (text) => this.html(box, `<div class="tipp"><ha-icon data-i="mdi:lightbulb-on-outline"></ha-icon><span>${text}</span></div>`);

    if (schritt === "start") {
      kopf("mdi:home-heart", "Willkommen", "Ich begleite dich in vier kurzen Schritten durch die Einrichtung. Alles ist aus Home Assistant schon vorausgefüllt, du hakst nur ab, was du willst. Dauert etwa eine Minute.");
      const g = this.html(box, `<div class="gruppe schritte"></div>`);
      [["mdi:sofa-outline", "blau", "Räume", "Deine Bereiche mit Lichtern, Heizung, Rollos"], ["mdi:account-multiple-outline", "gruen", "Personen", "Wer hier wohnt, mit eigener Begrüßung"],
        ["mdi:view-grid-outline", "orange", "Karten", "Wetter, Planer, Drucker, Robi … was es bei dir gibt"], ["mdi:star-outline", "lila", "Favoriten", "Die wichtigsten Geräte ganz oben"]]
        .forEach(([ic, f, t, x], i) => this.html(g, `<div class="zeile"><span class="sym ${f}"><ha-icon data-i="${ic}"></ha-icon></span><span class="name"><b>${i + 1}. ${t}</b><span>${x}</span></span></div>`));
      knoepfe(() => this.asWeiter(1), "Los geht’s", false);
      const z = this.html(box, `<div class="as-zweit"><button class="text-knopf">Alles automatisch einrichten</button></div>`);
      z.querySelector("button").addEventListener("click", () => this.asAnwenden());
    } else if (schritt === "raeume") {
      kopf("mdi:sofa-outline", "Welche Räume gehören dazu?", "Das sind deine Bereiche aus Home Assistant. Jeder Raum bringt seine Lichter, Heizung, Rollos und Fenster gleich mit. Bereiche ohne Geräte habe ich abgewählt.");
      const bereiche = haBereiche(h);
      gruppeKopf(`${Object.values(A.raeume).filter(Boolean).length} von ${bereiche.length} gewählt`, bereiche.length ? () => { const alle = bereiche.every((a) => A.raeume[a.area_id]); bereiche.forEach((a) => { A.raeume[a.area_id] = !alle; }); } : null);
      const g = this.html(box, `<div class="gruppe"></div>`);
      if (!bereiche.length) g.innerHTML = `<div class="leise-zeile">In Home Assistant sind noch keine Bereiche angelegt. Du kannst Räume später auch ohne Bereich anlegen.</div>`;
      bereiche.forEach((a) => {
        const vorhanden = (this._d.raeume || []).find((r) => r.bereich === a.area_id);
        wahlZeile(g, { an: !!A.raeume[a.area_id], icon: vorhanden?.icon || a.icon || "mdi:door", farbe: "blau", titel: vorhanden?.name || a.name,
          text: geraeteText(h, vorhanden?.geraete || raumGeraeteVorschlag(h, a.area_id)), klick: (an) => { A.raeume[a.area_id] = an; this.$(".as-gruppe-kopf h2").textContent = `${Object.values(A.raeume).filter(Boolean).length} von ${bereiche.length} gewählt`; } });
      });
      tipp("Fehlt ein Raum? Lege ihn in Home Assistant unter Einstellungen › Bereiche an, dann taucht er hier auf. Welche Geräte ein Raum zeigt, stellst du später im Raum selbst ein.");
      knoepfe(() => this.asWeiter(1), "Weiter");
    } else if (schritt === "personen") {
      kopf("mdi:account-multiple-outline", "Wer wohnt hier?", "Jede Person wird mit Namen begrüßt und kann später eine eigene Startseite bekommen. Am blauen Häuschen siehst du, wer gerade zu Hause ist.", "gruen");
      const pers = haPersonen(h);
      const g = this.html(box, `<div class="gruppe"></div>`);
      if (!pers.length) g.innerHTML = `<div class="leise-zeile">Keine Personen in Home Assistant gefunden. Du kannst sie später unter „Personen“ von Hand anlegen.</div>`;
      pers.forEach((p) => {
        const n = p.attributes.friendly_name || p.entity_id.slice(7);
        wahlZeile(g, { an: !!A.personen[p.entity_id], sym: `<span class="sym gruen" style="border-radius:50%;font-weight:700">${esc(n.slice(0, 1).toUpperCase())}</span>`, titel: n,
          text: p.state === "home" ? "Gerade zu Hause" : p.attributes.user_id ? "Hat ein Benutzerkonto" : "Ohne Benutzerkonto", klick: (an) => { A.personen[p.entity_id] = an; } });
      });
      this.html(box, `<h2 style="margin-top:var(--g-a5)">Gemeinsames Gerät</h2>`);
      const t = this.html(box, `<div class="gruppe"></div>`);
      wahlZeile(t, { an: A.tablet, icon: "mdi:tablet", farbe: "grau", titel: "Tablet an der Wand", text: "Eigene Startseite, die keiner Person gehört", klick: (an) => { A.tablet = an; } });
      tipp("Jedes Handy merkt sich, wer es benutzt. Gewechselt wird oben über die Kreise mit den Anfangsbuchstaben.");
      knoepfe(() => this.asWeiter(1), "Weiter");
    } else if (schritt === "karten") {
      kopf("mdi:view-grid-outline", "Was soll auf die Startseite?", "Ich habe nachgeschaut, was es bei dir gibt. Was ich gefunden habe, ist schon eingeschaltet.", "orange");
      const erk = glasErkennen(h);
      const da = KARTEN_INFO.filter(([id]) => erk[id].gefunden), nicht = KARTEN_INFO.filter(([id]) => !erk[id].gefunden);
      gruppeKopf("Gefunden");
      const g = this.html(box, `<div class="gruppe"></div>`);
      da.forEach(([id, titel, icon, , farbe]) => {
        const st = this.kartenStatus(id, erk);
        const z = wahlZeile(g, { an: !!A.karten[id], icon, farbe, titel, text: this._d.bereiche?.[id] && st.fertig && id !== "hinweise" && id !== "planer" ? "Schon eingerichtet" : erk[id].text,
          klick: (an) => { A.karten[id] = an; if (id === "gaeste") this.assistentZeichnen(); } });
        if (id === "gaeste" && A.karten.gaeste) {
          const f = document.createElement("div");
          f.className = "felder";
          f.innerHTML = `<input placeholder="z. B. Gäste-WLAN…" aria-label="WLAN-Name" autocomplete="off" value="${esc(A.gaeste.ssid)}"><input placeholder="Passwort…" aria-label="WLAN-Passwort" type="password" autocomplete="off" value="${esc(A.gaeste.passwort)}">`;
          const [ssid, pw] = f.querySelectorAll("input");
          ssid.addEventListener("input", () => { A.gaeste.ssid = ssid.value; });
          pw.addEventListener("input", () => { A.gaeste.passwort = pw.value; });
          z.after(f);
        }
      });
      if (nicht.length) {
        gruppeKopf("Nicht gefunden");
        const n = this.html(box, `<div class="gruppe"></div>`);
        nicht.forEach(([id, titel, icon]) => wahlZeile(n, { an: false, icon, farbe: "grau", titel, text: erk[id].text, nicht: true, klick: () => {} }));
      }
      tipp("Jede Karte kannst du später genauer einstellen: Übersicht › Karten auf der Startseite, oder im Dashboard mit dem Stift.");
      knoepfe(() => this.asWeiter(1), "Weiter");
    } else if (schritt === "favoriten") {
      const kand = favoritenKandidaten(h, this.asGewaehlteBereiche());
      if (!A.fav) A.fav = new Set(favoritenVorwahl(kand));
      kopf("mdi:star-outline", "Deine Favoriten", `Die wichtigsten Geräte stehen ganz oben auf der Startseite, ein Tipp schaltet sie. ${A.fav.size ? `${A.fav.size} habe ich vorgeschlagen.` : ""}`, "lila");
      const zeigen = A.favAlle ? kand : kand.filter((k, i) => i < 12 || A.fav.has(k.e));
      gruppeKopf(`${A.fav.size} gewählt`);
      const g = this.html(box, `<div class="gruppe"></div>`);
      if (!kand.length) g.innerHTML = `<div class="leise-zeile">In den gewählten Räumen gibt es nichts zum Schalten. Favoriten kannst du später unter „Startseite“ hinzufügen.</div>`;
      zeigen.forEach(({ e, b }) => {
        const st = h.states[e];
        wahlZeile(g, { an: A.fav.has(e), sym: `<span class="sym"><ha-state-icon data-e="${esc(e)}"></ha-state-icon></span>`, titel: st?.attributes.friendly_name || e, text: h.areas?.[b]?.name || "",
          klick: (an) => { an ? A.fav.add(e) : A.fav.delete(e); this.$(".as-gruppe-kopf h2").textContent = `${A.fav.size} gewählt`; } });
      });
      if (zeigen.length < kand.length) {
        const m = this.html(box, `<div class="as-zweit"><button class="text-knopf">Alle ${kand.length} zeigen</button></div>`);
        m.querySelector("button").addEventListener("click", () => { A.favAlle = true; this.assistentZeichnen(); });
      }
      this.html(box, `<h2 style="margin-top:var(--g-a5)">Dashboard</h2>`);
      const dg = this.html(box, `<div class="gruppe"></div>`);
      wahlZeile(dg, { an: A.dashboard, icon: "mdi:view-dashboard-outline", farbe: "blau", titel: "Dashboard „Zuhause“ anlegen", text: "Erscheint in der Seitenleiste und baut sich aus allem hier auf", klick: (an) => { A.dashboard = an; } });
      knoepfe(() => this.asAnwenden(), "Fertig stellen");
    } else if (schritt === "fertig") {
      const E = A.ergebnis || {};
      kopf("mdi:check-bold", "Fertig!", "Dein Dashboard ist eingerichtet. Alles lässt sich jederzeit ändern, hier in der Übersicht oder direkt im Dashboard mit dem Stift.", "gruen");
      const g = this.html(box, `<div class="gruppe zusammen"></div>`);
      [[`${E.raeume} ${E.raeume === 1 ? "Raum" : "Räume"} mit ${E.geraete} Geräten`], [`${E.personen} ${E.personen === 1 ? "Person" : "Personen"}${E.tablet ? " und das Tablet" : ""}`],
        [`${E.karten} ${E.karten === 1 ? "Karte" : "Karten"} auf der Startseite`], [`${E.fav} Favoriten`], [E.dashboard]].filter(([t]) => t).forEach(([t]) =>
        this.html(g, `<div class="zeile"><span class="haken" aria-hidden="true"><ha-icon data-i="mdi:check-bold"></ha-icon></span><span class="name"><b>${esc(t)}</b></span></div>`));
      tipp("Im Dashboard: Stift oben antippen, dann Kacheln verschieben, Größen ändern oder eine Kachel antippen für alle Details.");
      leiste.innerHTML = `<button class="knopf zweit" data-ueb>Feinheiten</button>${E.dashboardDa ? `<a class="knopf haupt" href="/glas-zuhause" style="text-decoration:none">Dashboard öffnen</a>` : `<button class="knopf haupt" data-ueb2>Zur Übersicht</button>`}`;
      leiste.querySelectorAll("[data-ueb],[data-ueb2]").forEach((b) => b.addEventListener("click", () => this.gehe(null)));
    }
    this.icons();
    if (this._nachOben) { this._nachOben = false; window.scrollTo(0, 0); }
  },

  // Auswahl übernehmen: Vorhandenes bleibt, Neues kommt dazu, Abgewähltes geht
  async asAnwenden() {
    const A = this._as, d = this._d, h = this._hass, erk = glasErkennen(h);
    // Räume
    const alt = d.raeume || [], gewaehlt = this.asGewaehlteBereiche();
    const neu = alt.filter((r) => !r.bereich || !h.areas?.[r.bereich] || gewaehlt.includes(r.bereich));
    gewaehlt.forEach((b) => { if (!neu.some((r) => r.bereich === b)) neu.push(raumAusBereich(h, b, neu)); });
    neu.forEach((r) => { if (!r.geraete) r.geraete = raumGeraeteVorschlag(h, r.bereich); });
    d.raeume = neu;
    // Personen
    const altP = d.personen || [];
    d.personen = [...haPersonen(h).filter((p) => A.personen[p.entity_id]).map((p) => altP.find((x) => x.entity === p.entity_id) || personAusHa(p)),
      ...altP.filter((x) => !x.tablet && !x.entity), ...(A.tablet ? [altP.find((x) => x.tablet) || { tablet: true }] : [])];
    // Karten
    KARTEN_INFO.forEach(([id]) => {
      const an = !!A.karten[id];
      if (an && erk[id].gefunden) d.bereiche[id] = { ...erk[id].cfg, ...(d.bereiche[id] || {}) };
      if (id === "gaeste" && an) d.bereiche.gaeste = { ...d.bereiche.gaeste, ssid: A.gaeste.ssid.trim(), ...(A.gaeste.passwort ? { passwort: A.gaeste.passwort } : {}) };
      if (id === "hinweise" || id === "planer") d.bereiche[id] = { ...(d.bereiche[id] || {}), an };
      if (id !== "hinweise") { const a = this.abschnittAlle(id); if (a) a.an = an; }
    });
    // Favoriten (bei „Alles automatisch“ ohne Besuch der Seite: Vorschlag)
    const fav = A.fav || new Set(favoritenVorwahl(favoritenKandidaten(h, gewaehlt)));
    const s = d.startseiten.alle;
    const altF = s.favoriten || [];
    s.favoriten = [...altF.filter((f) => f.karte || fav.has(f.entity)), ...[...fav].filter((e) => !altF.some((f) => f.entity === e)).map((e) => ({ ...geraetVorschlag(h, e), an: true, groesse: "breit" }))];
    const a = this.abschnittAlle("favoriten");
    if (a) a.an = true;
    d.eingerichtet = true;
    A.schritt = AS_SCHRITTE.indexOf("fertig");
    A.richtung = 1;
    const st = KARTEN_INFO.filter(([id]) => this.kartenStatus(id, erk).an).length;
    A.ergebnis = { raeume: d.raeume.length, geraete: d.raeume.reduce((n, r) => n + (r.geraete || []).filter((g) => g.an !== false).length, 0),
      personen: d.personen.filter((p) => !p.tablet).length, tablet: d.personen.some((p) => p.tablet), karten: st, fav: s.favoriten.length, dashboard: "", dashboardDa: false };
    try { await Glas.einstSpeichern(h, kopie(d)); } catch (e) { A.ergebnis.dashboard = `Nicht gespeichert: ${e.message || e}`; }
    if (A.dashboard) {
      try {
        const liste = await h.callWS({ type: "lovelace/dashboards/list" });
        if (!liste.some((x) => x.url_path === "glas-zuhause")) {
          await h.callWS({ type: "lovelace/dashboards/create", url_path: "glas-zuhause", title: "Zuhause", icon: "mdi:home-outline", show_in_sidebar: true, require_admin: false, mode: "storage" });
          await h.callWS({ type: "lovelace/config/save", url_path: "glas-zuhause", config: { strategy: { type: "custom:glas" } } });
          A.ergebnis.dashboard = "Dashboard „Zuhause“ in der Seitenleiste angelegt";
        } else A.ergebnis.dashboard = "Dashboard „Zuhause“ ist bereit";
        A.ergebnis.dashboardDa = true;
      } catch (_) { A.ergebnis.dashboard = A.ergebnis.dashboard || "Dashboard konnte nicht angelegt werden (nur Admins)"; }
    }
    this._nachOben = true;
    this.zeichnen();
  },
});
// ---------------------------------------------------------------------------
// Registrieren: Karten erscheinen in „Karte hinzufügen“ mit Vorschau
// ---------------------------------------------------------------------------
const KARTEN = [
  ["glas-kachel-card", GlasKachelCard, GlasKachelEditor, "Glas · Kachel", "Eine Kachel für jede Entität: Tippen schaltet, seitlich wischen dimmt, Symbol öffnet die große Steuerung."],
  ["glas-kopf-card", GlasKopfCard, GlasKopfEditor, "Glas · Kopf", "Begrüßung, Personenwahl (wer schaut) und Schnellzugriff-Chips."],
  ["glas-planer-card", GlasPlanerCard, GlasPlanerEditor, "Glas · Planer & Kalender", "Wisch-Karte: Planer heute, Kalender der nächsten 7 Tage und Schichten der Woche, für die gewählte Person."],
  ["glas-wetter-card", GlasWetterCard, GlasWetterEditor, "Glas · Wetter", "Jetzt, die nächsten Stunden, aufklappbar 5 Tage, trocken oder nass."],
  ["glas-raumleiste-card", GlasRaumleisteCard, GlasRaumleisteEditor, "Glas · Raumleiste", "Schwebende Leiste unten mit allen Räumen."],
  ["glas-sicherheit-card", GlasSicherheitCard, GlasSicherheitEditor, "Glas · Sicherheit", "Alarmanlage scharf/unscharf, Fenster, Kamera, Verlauf."],
  ["glas-drucker-card", GlasDruckerCard, GlasDruckerEditor, "Glas · Drucker & Werkstatt", "3D-Drucker: Fortschritt, Kamera, Steuerung, Warteschlange und knappes Filament aus der Filament-Werkstatt."],
  ["glas-robi-card", GlasRobiCard, GlasRobiEditor, "Glas · Robi", "Saugroboter: Akku, alles oder einzelne Räume saugen, Saugstärke, Station."],
  ["glas-gaeste-card", GlasGaesteCard, GlasGaesteEditor, "Glas · Gäste", "WLAN-QR-Code zum Scannen, optional ein zweiter Code."],
  ["glas-bild-card", GlasBildCard, GlasBildEditor, "Glas · Bild & QR-Code", "Ein Bild oder QR-Code (z. B. Gäste-Login): hochladen, aus einer Entität oder als QR aus einem Link."],
  ["glas-kamera-card", GlasKameraCard, GlasKameraEditor, "Glas · Kamera", "Standbild einer Kamera, Tippen zeigt das Livebild groß."],
  ["glas-hinweise-card", GlasHinweiseCard, GlasHinweiseEditor, "Glas · Warnungen", "Fenster offen und Regen kommt / keiner zu Hause – nur sichtbar, wenn es zutrifft."],
  ["glas-zuhause-card", GlasZuhauseCard, GlasZuhauseEditor, "Glas · Zuhause (alles)", "Das ganze Dashboard aus den Glas-Einstellungen: Kopf, Startseite der gewählten Person, Räume."],
  ["glas-ordner-card", GlasOrdnerCard, GlasOrdnerEditor, "Glas · Ordner", "Mehrere Kacheln in einem Ordner: zeigt vier Mini-Symbole, Antippen öffnet ihn groß (wie am iPhone). Größe L = Stapel mit vier Geräten direkt bedienbar."],
  ["glas-insel-card", GlasInselCard, GlasInselEditor, "Glas · Dynamic Island", "Schwarze Pille oben: zeigt, was gerade läuft (Druck, Robi, Timer, Alarm, Waschmaschine). Antippen klappt sie auf."],
  ["glas-widget-card", GlasWidgetCard, GlasWidgetEditor, "Glas · Widget", "Quadratisches Widget wie auf dem iPhone: Wetter, Planer, 3D-Drucker, Zuhause oder Robi. Antippen öffnet die große Ansicht."],
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
