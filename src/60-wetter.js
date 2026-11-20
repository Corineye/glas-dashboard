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
