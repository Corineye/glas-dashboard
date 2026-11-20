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
      <button class="link" data-werk>Werkstatt öffnen ›</button>`;
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
