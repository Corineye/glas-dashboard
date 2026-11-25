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
  entitaeten() {
    const doms = this._config?.ordner ? ["weather", "vacuum", "alarm_control_panel", "binary_sensor", "sensor", "switch", "image"] : ["light", "switch", "media_player", "fan"];
    return Object.keys(this._hass?.states || {}).filter((e) => doms.includes(domainVon(e)));
  }
  css() { return LEISTE_CSS + LEISTE_ORDNER_CSS; }
  inhalt(fest) {
    return `<nav class="leiste glas ${fest ? "fest" : ""}" aria-label="Räume">${this.knoepfeHtml()}</nav>`;
  }
  knoepfeHtml() {
    const h = this._hass, c = this._config, jetzt = hashJetzt();
    // Ordner-Stil: vier wählbare Plätze (Wetter, Planer, Termin, Suche …) statt der Räume
    if (c.ordner) {
      this._planerNeu = this._planerNeu || (() => { clearTimeout(this._pt); this._pt = setTimeout(() => this.render(), 50); });
      return (c.plaetze || []).map((id) => leistePlatzHtml(this, id)).join("");
    }
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
    // Nur solange das Dashboard wirklich offen ist: HA reicht hass auch an zwischengespeicherte,
    // abgehängte Panels weiter – sonst schwebt die Leiste über anderen Seiten (z. B. Planer)
    if (!this.isConnected || (this._pfad && location.pathname.split("/")[1] !== this._pfad)) {
      this._portal?.remove(); this._portal = null; this._kz = null;
      return;
    }
    this._pfad = this._pfad || location.pathname.split("/")[1];
    const bearbeiten = istBearbeiten();
    karteVerstecken(this, !bearbeiten);
    if (bearbeiten) {
      this._portal?.remove(); this._portal = null; this._kz = null;
      this.shadowRoot.innerHTML = `<style>${TOKENS}${LEISTE_CSS}${LEISTE_ORDNER_CSS}</style>${this.inhalt(false)}<div class="leise hinweis">Raumleiste · schwebt außerhalb des Bearbeitens unten über dem Dashboard</div>`;
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
    if (!r.querySelector(".fest") || r.querySelector(".fest")._ordner !== !!this._config.ordner) {
      const kz = this._config.kontrollzentrum !== false && Glas.einst?.kontrollzentrum?.an !== false;
      let gesehen = false;
      try { gesehen = !!localStorage.getItem("glas-kz-gesehen"); } catch (_) { gesehen = true; }
      r.innerHTML = `<style>${TOKENS.replace(":host{", ".w{").replace(":host([dunkel]){", ".w.dunkel{")}${LEISTE_CSS}${KZ_CSS}${LEISTE_ORDNER_CSS}</style>
        <div class="w"><div class="kz-dimm"></div><div class="fest">
        ${kz ? `<div class="kz-clip"><div class="kz-panel" role="dialog" aria-label="Kontrollzentrum"><div class="kz-griff-oben" aria-hidden="true"><span></span></div><div class="kz-raster"></div></div></div>
        <button class="kz-griff" aria-label="Kontrollzentrum öffnen" aria-expanded="false"><span></span></button>
        ${gesehen ? "" : `<div class="kz-tipp glas" aria-hidden="true">Hochziehen für Schnellzugriff</div>`}` : ""}
        <nav class="leiste glas" aria-label="Räume"></nav></div></div>`;
      this._kz = kz ? new Kontrollzentrum(this, r) : null;
      const f = r.querySelector(".fest");
      f._ordner = !!this._config.ordner;
      f.classList.toggle("ordner", f._ordner);
      r.querySelector("nav.leiste").setAttribute("aria-label", f._ordner ? "Schnellzugriff" : "Räume");
    }
    r.querySelector(".w").classList.toggle("dunkel", istDunkel(this._hass));
    const nav = r.querySelector("nav.leiste"), neu = this.knoepfeHtml();
    nav.style.setProperty("--n", Math.max(1, (this._config.plaetze || []).length));
    if (nav._html !== neu) { nav._html = neu; nav.innerHTML = neu; this.verdrahten(nav); }
  }
  verdrahten(r) {
    r.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
    r.querySelectorAll("[data-platz]").forEach((b) => b.addEventListener("click", () => {
      if (this._kz?.offen) this._kz.zu();
      leistePlatzOeffnen(this, b.dataset.platz);
    }));
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
    // Von einer Raum-Kachel (Räume als Ordner) geöffnet: Blatt wächst aus der Kachel
    const hk = Glas.raumHerkunft;
    Glas.raumHerkunft = null;
    const herkunft = hk && hk.hash === this._config.hash && Date.now() - hk.zeit < 2000 ? hk.el : null;
    const s = new GlasSchicht({ quelle: this, hoch: true, herkunft, titel: this._config.name || this._config.hash,
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
