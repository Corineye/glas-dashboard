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
.kachel.klein{justify-content:center;padding:0}
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
    const farbe = farbeAus(c.farbe, Geraet.farbe(st));
    const pct = v.regler && an ? klemmen(v.regler.pct, 0, 100) : 0;
    const hell = an && c.hell_wenn_an !== false;
    const fuellen = v.regler && hell && g !== "klein";
    const grossWert = g === "gross" && v.anzeige && st ? zustandText(h, st) : "";
    const zusatz = (c.zusatz || []).map((z) => h.states[z]).filter(Boolean);
    const klassen = ["kachel", "k", g, hell ? "an" : "glas", fuellen ? "regelbar" : "", warn ? "warn" : "", Geraet.verfuegbar(st) ? "" : "weg"].join(" ");
    const icon = c.icon ? `data-i="${esc(c.icon)}"` : "";
    const klein = g === "klein" || c.name_zeigen === false && !zweite;
    const druck = v.schalten && !v.anzeige ? `aria-pressed="${an}"` : "";
    return `<div class="${klassen}" style="--sf:${farbe};--warn:${warn ? FARBEN[warn] : "transparent"}">
      ${fuellen ? `<div class="fuell" style="transform:scaleX(${pct / 100})"></div>` : ""}
      ${c.icon_zeigen === false ? "" : `<button class="symbol" data-zone="${klein ? "tap" : "icon"}" ${klein ? druck : ""} aria-label="${klein ? `${esc(name)}: ${esc(zweite)}` : `Steuerung ${esc(name)}`}"><ha-state-icon data-e="${esc(c.entity)}" ${icon}></ha-state-icon></button>`}
      ${g === "klein" ? "" : `<button class="text" data-zone="tap" ${druck} aria-label="${esc(name)}: ${esc(zweite)}">
        ${grossWert ? `<div class="grosswert">${esc(grossWert)}</div>` : ""}
        ${c.name_zeigen === false ? "" : `<div class="name">${esc(name)}</div>`}
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
