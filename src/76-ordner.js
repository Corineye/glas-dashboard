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
