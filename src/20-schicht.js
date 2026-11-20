// ---------------------------------------------------------------------------
// Blatt von unten (wie iOS): eine Ebene über dem Dashboard
// – folgt dem Finger am Griff, schließt bei Wischen nach unten, Escape, Tippen daneben
// ---------------------------------------------------------------------------
const SCHICHT_CSS = `
.dimm{position:fixed;inset:0;z-index:7;background:rgba(0,0,0,.28);opacity:0;transition:opacity .38s cubic-bezier(.32,.72,0,1);touch-action:none}
.dimm.auf{opacity:1}
.blatt{position:fixed;left:0;right:0;bottom:0;z-index:8;margin:0 auto;max-width:560px;max-height:calc(100% - 48px);
  display:flex;flex-direction:column;border-radius:var(--g-r-blatt) var(--g-r-blatt) 0 0;background:var(--g-blatt);
  border-top:1px solid var(--g-glas-rand);-webkit-backdrop-filter:var(--g-blur);backdrop-filter:var(--g-blur);
  box-shadow:var(--g-schatten-gross);transform:translateY(105%);transition:transform .38s cubic-bezier(.32,.72,0,1);
  padding-bottom:env(safe-area-inset-bottom)}
.blatt.auf{transform:translateY(0)}
.blatt.breit{max-width:min(1000px,100%)}
.blatt.hoch{height:calc(100% - 48px)}
@media (min-width:900px){.blatt{bottom:auto;top:50%;border-radius:var(--g-r-blatt);transform:translateY(-40%) scale(.96);opacity:0;
  transition:transform .3s cubic-bezier(.32,.72,0,1),opacity .2s ease}.blatt.auf{transform:translateY(-50%);opacity:1}
  .blatt.hoch{height:auto;max-height:min(86vh,900px);min-height:320px}.griff{height:16px;visibility:hidden}}
.griff{flex:none;height:32px;display:flex;align-items:center;justify-content:center;touch-action:none;cursor:grab}
.griff span{width:38px;height:5px;border-radius:3px;background:var(--g-text2);opacity:.45}
.inhalt{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:0 var(--g-a4) var(--g-a5);display:flex;flex-direction:column;gap:var(--g-a4);scrollbar-width:none}
.inhalt::-webkit-scrollbar{display:none}
/* Kopf steht fest über dem Inhalt (eigene Zeile im Blatt), der Inhalt läuft darunter weich aus – keine Farbfläche, nichts springt */
.kopf-platz{flex:none;padding:0 var(--g-a4)}
.kopf{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--g-a3);padding:0 var(--g-a1) var(--g-a2);touch-action:none}
.kopf-text{display:flex;flex-direction:column;gap:2px;min-width:0;padding-top:2px}
.titel{margin:0;font-size:var(--g-s-titel);font-weight:800;letter-spacing:-.4px;line-height:1.15;color:var(--g-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.unter{font-size:var(--g-s-name);font-weight:500;color:var(--g-text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.inhalt{-webkit-mask-image:linear-gradient(transparent 0,#000 14px);mask-image:linear-gradient(transparent 0,#000 14px);padding-top:var(--g-a2)}
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
    this.inhalt = this.root.querySelector(".inhalt");
    this.kopfPlatz = this.root.querySelector(".kopf-platz");
    this.root.querySelector(".dimm").addEventListener("click", () => this.schliessen());
    // Escape schließt nur das oberste Blatt
    this._taste = (e) => { if (e.key === "Escape" && GlasSchicht.stapel[GlasSchicht.stapel.length - 1] === this) { e.stopImmediatePropagation(); this.schliessen(); } };
    this.ziehen();
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
  oeffnen() {
    portalWurzel().appendChild(this.host);
    GlasSchicht.stapel.push(this);
    this._vorher = document.activeElement;
    document.addEventListener("keydown", this._taste);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      this.root.querySelector(".dimm").classList.add("auf");
      this.blatt.classList.add("auf");
      this.blatt.querySelector("[data-zu]")?.focus({ preventScroll: true, focusVisible: false });
    }));
  }
  schliessen() {
    if (this._weg) return;
    this._weg = true;
    GlasSchicht.stapel = GlasSchicht.stapel.filter((x) => x !== this);
    document.removeEventListener("keydown", this._taste);
    this.root.querySelector(".dimm").classList.remove("auf");
    this.blatt.style.transform = "";
    this.blatt.classList.remove("auf");
    setTimeout(() => { this.host.remove(); this.zu?.(); }, 340);
    try { this._vorher?.focus?.({ preventScroll: true }); } catch (_) { /* */ }
  }
  // Am Griff ziehen: Blatt folgt dem Finger, ab 120 px oder schnellem Wischen zu
  ziehen() {
    const griff = this.root.querySelector(".griff"), dimm = this.root.querySelector(".dimm");
    let start = null;
    const bewegen = (e) => {
      if (!start) return;
      const roh = e.clientY - start.y;
      if (!start.aktiv) { if (Math.abs(roh) < 6) return; start.aktiv = true; this.blatt.style.transition = "none"; dimm.style.transition = "none"; }
      const dy = roh < 0 ? roh * 0.2 : roh; // nach oben nur mit Widerstand
      const now = performance.now();
      start.v = (roh - (start.letzt || 0)) / Math.max(1, now - (start.t2 || start.t)); // Geschwindigkeit der letzten Bewegung
      start.letzt = roh; start.t2 = now;
      this.blatt.style.transform = `translateY(${dy}px)`;
      dimm.style.opacity = String(klemmen(1 - Math.max(0, dy) / Math.max(1, this.blatt.offsetHeight), 0, 1));
    };
    const los = () => {
      if (!start) return;
      const s = start; start = null;
      this.blatt.style.transition = ""; dimm.style.transition = ""; dimm.style.opacity = "";
      if (!s.aktiv) return;
      this._gezogen = performance.now();
      if ((s.letzt || 0) > this.blatt.offsetHeight * 0.3 || (s.v || 0) > 0.5) this.schliessen();
      else this.blatt.style.transform = "";
    };
    const runter = (e) => {
      if (e.button > 0) return;
      if (e.target.closest("button,input,select,textarea,a,[role=button]")) return;
      if (e.currentTarget === this.inhalt && this.inhalt.scrollTop > 0) return;
      start = { y: e.clientY, t: performance.now() };
      e.currentTarget.setPointerCapture(e.pointerId);
    };
    for (const el of [griff, this.kopfPlatz, this.inhalt]) {
      el.addEventListener("pointerdown", (e) => { if (el !== this.inhalt) runter(e); });
      el.addEventListener("pointermove", bewegen);
      el.addEventListener("pointerup", los);
      el.addEventListener("pointercancel", los);
    }
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
