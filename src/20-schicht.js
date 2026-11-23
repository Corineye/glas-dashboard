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
@media (max-width:899px){.blatt{transition:scale .5s cubic-bezier(.32,.72,0,1)}.blatt.hinten{scale:.94}}
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
`;

class GlasSchicht {
  constructor({ quelle, hoch = false, titel = "", zu }) {
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
      <div class="kopf-knoepfe">${knoepfe}<button class="rund" data-zu aria-label="Schließen"><ha-icon data-i="mdi:close"></ha-icon></button></div></div>`;
  }
  kopfBinden() {
    const kopf = this.inhalt.querySelector(".kopf");
    if (kopf) {
      this.kopfPlatz.replaceChildren(kopf);
      kopf.querySelector("[data-zu]")?.addEventListener("click", () => this.schliessen());
      kopf.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
    }
    this.inhalt.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
  }
  // Suche im ganzen Blatt (Kopf + Inhalt)
  $(q) { return this.kopfPlatz.querySelector(q) || this.inhalt.querySelector(q); }
}
GlasSchicht.stapel = [];
