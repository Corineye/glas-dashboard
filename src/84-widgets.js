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
    const fenster = Object.keys(h.states).filter((x) => x.startsWith("binary_sensor.") && ["window", "door"].includes(h.states[x].attributes.device_class) && h.states[x].state === "on").length;
    const unter = [al ? (al.state === "disarmed" ? "Alarm aus" : "Alarm scharf") : "", fenster ? `${fenster} ${fenster === 1 ? "Fenster offen" : "Fenster offen"}` : "Alles zu"].filter(Boolean).join(" · ");
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
