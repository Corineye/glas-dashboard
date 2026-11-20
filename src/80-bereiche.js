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
  entitaeten() { return [this._config.entity, this._config.akku, ...(this._config.auswahl || [])].filter(Boolean); }
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
  blattHtml(s) {
    const h = this._hass, c = this._config, st = h.states[c.entity], ak = this.akku();
    if (!st) return s.kopfHtml("Robi", "nicht gefunden");
    const gew = this._gewaehlt || new Set();
    const putzt = st.state === "cleaning";
    const stufen = st.attributes.fan_speed_list || [];
    return `${s.kopfHtml(c.name || "Robi", `${ROBI_STATUS[st.state] || zustandText(h, st)}${ak != null ? ` · Akku ${Math.round(ak)} %` : ""}`)}
      ${ak != null ? `<div class="balken"><i style="width:${ak}%"></i></div>` : ""}
      <div class="raster2"><button class="aktion haupt" data-start>${putzt ? "Pause" : st.state === "paused" ? "Fortsetzen" : "Alles saugen"}</button>
        <button class="aktion glas" data-station>Zur Station</button></div>
      ${(c.raeume || []).length ? `<div class="karte glas"><div class="karte-kopf"><h3 class="karte-titel">Räume saugen</h3></div>
        <div class="chips" style="padding:var(--g-a1) 0 var(--g-a2)">${c.raeume.map((r, i) =>
          `<button class="pille fuell ${gew.has(i) ? "aktiv" : ""}" data-raum="${i}" aria-pressed="${gew.has(i)}">${esc(r.name)}</button>`).join("")}</div>
        <button class="aktion haupt" data-raeume ${gew.size ? "" : "disabled"} style="margin-bottom:var(--g-a2)">${gew.size ? `${gew.size} ${gew.size === 1 ? "Raum" : "Räume"} saugen` : "Räume auswählen"}</button></div>` : ""}
      ${stufen.length ? `<div class="karte glas"><div class="karte-kopf"><h3 class="karte-titel">Saugstärke</h3></div><div class="chips" style="padding:var(--g-a1) 0 var(--g-a2)">${stufen.map((f) =>
        `<button class="pille fuell ${st.attributes.fan_speed === f ? "aktiv" : ""}" data-stufe="${esc(f)}">${esc(f)}</button>`).join("")}</div></div>` : ""}
      ${(c.auswahl || []).map((e) => h.states[e]).filter(Boolean).map((a) => `<div class="karte glas"><div class="karte-kopf"><h3 class="karte-titel">${esc(a.attributes.friendly_name)}</h3></div>
        <div class="chips" style="padding:var(--g-a1) 0 var(--g-a2)">${(a.attributes.options || []).map((o) =>
          `<button class="pille fuell ${a.state === o ? "aktiv" : ""}" data-wahl="${esc(a.entity_id)}" data-o="${esc(o)}">${esc(attributText(h, { ...a, attributes: { ...a.attributes, x: o } }, "x") || o)}</button>`).join("")}</div></div>`).join("")}
      ${(c.knoepfe || []).length ? `<div class="raster2">${c.knoepfe.map((b) => h.states[b]).filter(Boolean).map((b) =>
        `<button class="aktion glas" data-btn="${esc(b.entity_id)}">${esc(b.attributes.friendly_name)}</button>`).join("")}</div>` : ""}`;
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
      const ids = [...(this._gewaehlt || [])].map((i) => c.raeume[i].id).filter((x) => x !== undefined && x !== "");
      if (!ids.length) return;
      h.callService("vacuum", "send_command", { entity_id: c.entity, command: c.befehl || "spot_area", params: { rooms: ids.join(","), cleanings: 1 } });
      this._gewaehlt = new Set(); this.blattZeichnen();
    });
    $$("[data-stufe]").forEach((b) => b.addEventListener("click", () => h.callService("vacuum", "set_fan_speed", { entity_id: c.entity, fan_speed: b.dataset.stufe })));
    $$("[data-wahl]").forEach((b) => b.addEventListener("click", () => h.callService("select", "select_option", { entity_id: b.dataset.wahl, option: b.dataset.o })));
    $$("[data-btn]").forEach((b) => b.addEventListener("click", () => h.callService("button", "press", { entity_id: b.dataset.btn })));
  }
}
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
