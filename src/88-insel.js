// ---------------------------------------------------------------------------
// Dynamic Island: schwarze Pille oben, zeigt was gerade läuft (Druck, Robi, Licht-Timer,
// Alarm scharf, Waschmaschine …). Antippen klappt sie auf. Verschwindet, wenn nichts läuft.
// ---------------------------------------------------------------------------
const INSEL_CSS = `
:host{display:contents}
.insel{position:fixed;z-index:5;top:calc(var(--header-height,0px) + env(safe-area-inset-top,0px) + var(--g-a2));left:50%;
  transform:translateX(calc(-50% + var(--ix,0px)));transition:transform .45s cubic-bezier(.32,.72,0,1);color:#fff}
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
    this._blase = (e) => this.verschieben(e.detail);
    this._aussen = (e) => { if (this._auf && !e.composedPath().includes(this.$(".gross"))) this.zuklappen(); };
    this._taste = (e) => { if (e.key === "Escape" && this._auf) { e.stopPropagation(); this.zuklappen(); } };
  }
  static standard() { return {}; }
  getCardSize() { return 0; }
  connectedCallback() {
    super.connectedCallback();
    addEventListener("glas-blase", this._blase);
    addEventListener("resize", this._blase);
    this._takt = setInterval(() => { if (this._hass) this.render(); }, 30e3); // Restzeit der Timer
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    removeEventListener("glas-blase", this._blase);
    removeEventListener("resize", this._blase);
    clearInterval(this._takt);
    this.zuklappen(true);
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
    if (a.length !== this._anzahl) { this._anzahl = a.length; fire(this, "glas-insel", { anzahl: a.length }); }
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
    this.verschieben(Glas.blaseZu);
    this.$("[data-auf]")?.addEventListener("click", () => (this._auf ? this.zuklappen() : this.aufklappen()));
    this.$$("[data-k]").forEach((b) => b.addEventListener("click", () => {
      const [i, j] = b.dataset.k.split("-").map(Number);
      vibrieren(8);
      const k = this._akt?.[i]?.knoepfe[j];
      if (k) { Promise.resolve(k.tun()).catch(() => {}); if (/Öffnen|Entschärfen/.test(k.text)) this.zuklappen(); }
    }));
  }
  // Wenn oben links die Titel-Blase erscheint, rückt die Insel nach rechts (sie sollen sich nicht überdecken)
  verschieben(zu) {
    const el = this.$(".insel");
    if (!el) return;
    const rechts = (typeof zu === "boolean" ? zu : Glas.blaseZu) && innerWidth < 700 && !this._auf;
    el.style.setProperty("--ix", rechts ? `${Math.max(0, innerWidth / 2 - el.offsetWidth / 2 - 16)}px` : "0px");
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
