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
