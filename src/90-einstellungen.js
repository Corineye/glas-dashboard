// ---------------------------------------------------------------------------
// Einstellungsseite „Glas“ (Seitenleiste): alles an einer Stelle, gilt auf allen Geräten
// ---------------------------------------------------------------------------
const EINST_CSS = `
:host{display:block;position:relative;min-height:100vh;min-height:100dvh;color:var(--g-text)}
.hg{position:fixed;inset:0;z-index:0;pointer-events:none}
.seite{position:relative;z-index:1;max-width:780px;margin:0 auto;padding:calc(12px + env(safe-area-inset-top)) var(--g-a4) 120px}
.oben{display:flex;align-items:center;gap:var(--g-a2);min-height:56px}
.oben h1{flex:1;margin:0;font-size:var(--g-s-titel);font-weight:800;letter-spacing:-.4px}
.status{font-size:var(--g-s-klein);color:var(--g-text2);transition:opacity .3s ease}
.menue{display:none}
:host([schmal]) .menue{display:flex}
h2{margin:var(--g-a5) var(--g-a3) var(--g-a2);font-size:var(--g-s-klein);font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:var(--g-text2)}
h2:first-child{margin-top:0}
.gruppe{border-radius:var(--g-r-klein);overflow:hidden;background:var(--g-blatt);border:1px solid var(--g-glas-rand)}
.gruppe.form{padding:var(--g-a2) var(--g-a4) var(--g-a4)}
.fuss{margin:var(--g-a2) var(--g-a3) 0;font-size:var(--g-s-klein);color:var(--g-text2);line-height:1.4}
.zeile{position:relative;display:flex;align-items:center;gap:var(--g-a3);min-height:52px;padding:var(--g-a2) var(--g-a3) var(--g-a2) var(--g-a2);background:var(--g-blatt);
  transition:transform .2s cubic-bezier(.23,1,.32,1)}
.zeile + .zeile, .kopfzeile + .zeile{box-shadow:inset 0 1px 0 var(--g-trenn)}
.zeile.zieht{z-index:3;transition:none;box-shadow:0 10px 30px rgba(0,0,0,.22);border-radius:var(--g-r-klein)}
.zeile.aus .name{opacity:.45}
.zeile button.weiter{position:absolute;inset:0;z-index:0}
.zeile > *:not(.weiter){position:relative;z-index:1}
.griff{flex:none;width:32px;height:40px;display:flex;align-items:center;justify-content:center;color:var(--g-text2);cursor:grab;touch-action:none}
.griff:active{cursor:grabbing}
.sym{flex:none;width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:var(--g-fuell);color:var(--g-text)}
.name{flex:1;min-width:0}
.name b{display:block;font-size:var(--g-s-name);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.name span{display:block;font-size:var(--g-s-klein);color:var(--g-text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pfeil{flex:none;color:var(--g-text2)}
.kopfzeile{padding:var(--g-a2) var(--g-a4) 4px;font-size:var(--g-s-mini);font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--g-text2);background:var(--g-blatt)}
.segment{flex:none;display:flex;padding:2px;border-radius:9px;background:var(--g-fuell)}
.segment button{min-width:34px;height:30px;padding:0 8px;border-radius:7px;font-size:var(--g-s-klein);font-weight:600;color:var(--g-text)}
.segment button[aria-pressed="true"]{background:var(--g-an);color:#1c1c1e;box-shadow:0 1px 3px rgba(0,0,0,.15)}
.auswahl{flex:none;height:34px;padding:0 var(--g-a2);border-radius:9px;border:0;background:var(--g-fuell);color:var(--g-text);font:inherit;font-size:var(--g-s-klein)}
.schalter{flex:none;position:relative;width:51px;height:31px;border-radius:16px;background:var(--g-fuell);transition:background-color .2s ease}
.schalter::after{content:"";position:absolute;top:2px;left:2px;width:27px;height:27px;border-radius:50%;background:#fff;box-shadow:0 2px 4px rgba(0,0,0,.2);transition:transform .2s cubic-bezier(.23,1,.32,1)}
.schalter[aria-checked="true"]{background:var(--g-gruen-voll)}
.schalter[aria-checked="true"]::after{transform:translateX(20px)}
.klein-knopf{flex:none;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--g-text2)}
.extra{padding:0 var(--g-a4) var(--g-a4) 52px;background:var(--g-blatt)}
.aktionen{display:flex;flex-wrap:wrap;gap:var(--g-a2);margin-top:var(--g-a3)}
.knopf{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 var(--g-a4);border-radius:var(--g-r-pille);font-size:var(--g-s-name);font-weight:600;background:var(--g-fuell);color:var(--g-text)}
.knopf.haupt{background:var(--g-akzent-voll);color:#fff}
.knopf.rot{color:var(--g-rot-text)}
.zurueck{display:inline-flex;align-items:center;min-height:44px;margin-left:-8px;font-size:var(--g-s-text);color:var(--g-akzent)}
.personen-wahl{display:flex;flex-wrap:wrap;gap:var(--g-a2);margin-bottom:var(--g-a3)}
.hgs{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:var(--g-a3);padding:var(--g-a3)}
.hg-wahl{display:flex;flex-direction:column;gap:6px;align-items:stretch;font-size:var(--g-s-klein);font-weight:600;color:var(--g-text)}
.hg-wahl .muster{height:84px;border-radius:var(--g-r-klein);border:1px solid var(--g-glas-rand);display:flex;align-items:center;justify-content:center}
.hg-wahl .muster span{width:56%;height:38%;border-radius:10px;background:var(--g-glas);border:1px solid var(--g-glas-rand);-webkit-backdrop-filter:var(--g-blur);backdrop-filter:var(--g-blur)}
.hg-wahl[aria-pressed="true"] .muster{outline:3px solid var(--g-akzent);outline-offset:2px}
.hinzu{padding:var(--g-a2) var(--g-a4) var(--g-a3);background:var(--g-blatt);box-shadow:inset 0 1px 0 var(--g-trenn)}
.karten-hinzu{display:flex;flex-wrap:wrap;align-items:center;gap:var(--g-a2)}
.karten-hinzu .knopf ha-icon,.karte-zeile .name b ha-icon{--mdc-icon-size:18px}
.karte-zeile .name b{display:inline-flex;align-items:center;gap:6px}
.leise-zeile{padding:var(--g-a4);font-size:var(--g-s-klein);color:var(--g-text2);background:var(--g-blatt)}
@media (max-width:560px){
  .zeile.geraet{flex-wrap:wrap}
  .zeile.geraet .name{flex-basis:calc(100% - 140px)}
  .zeile.geraet .optionen{flex-basis:100%;min-width:0;padding-left:40px;display:flex;gap:var(--g-a2);align-items:center}
  .zeile.geraet .optionen .auswahl{flex:1;min-width:0}
}
.optionen{display:flex;gap:var(--g-a2);align-items:center}
.seite{position:relative}
.anzeige-knopf{display:inline-flex;align-items:center;gap:4px;cursor:pointer;white-space:nowrap;max-width:170px;overflow:hidden;text-overflow:ellipsis}
.anzeige-knopf ha-icon{--mdc-icon-size:16px;flex:none}
.menue-pop{position:absolute;z-index:30;min-width:220px;padding:6px;border-radius:var(--g-r-klein);background:var(--g-blatt);border:1px solid var(--g-glas-rand);
  box-shadow:0 12px 40px rgba(0,0,0,.2);-webkit-backdrop-filter:var(--g-blur);backdrop-filter:var(--g-blur);animation:pop-auf .16s cubic-bezier(.23,1,.32,1)}
@keyframes pop-auf{from{opacity:0;transform:scale(.96) translateY(-4px)}}
.menue-pop button{display:flex;align-items:center;gap:10px;width:100%;min-height:44px;padding:0 10px;border-radius:9px;font-size:var(--g-s-name);color:var(--g-text);text-align:left}
.menue-pop button:hover{background:var(--g-fuell)}
.menue-pop button[aria-checked="true"] ha-icon{color:var(--g-akzent)}
.menue-pop button[aria-checked="false"] ha-icon{color:var(--g-text2)}
`;
const GROESSEN = [["klein", "S", "Klein (1×1)"], ["breit", "M", "Breit (2×1)"], ["gross", "L", "Groß (2×2)"], ["ganz", "▭", "Ganze Breite"]];
const ANZEIGEN = [["zustand", "Zustand"], ["zustand_zuletzt", "Zustand + Zeit"], ["zuletzt", "Zuletzt geändert"], ["aus", "Nur Name"]];
const ANZEIGE_TEILE = [["name", "Name"], ["symbol", "Symbol"], ["zustand", "Zustand"], ["zuletzt", "Zuletzt geändert"], ["raum", "Raum / Bereich"]];
// alte Einstellung (zweite_zeile, name_zeigen …) in die Häkchen-Liste übersetzen
function anzeigeVon(x) {
  if (Array.isArray(x.anzeige)) return x.anzeige;
  const z = x.zweite_zeile || "zustand";
  return [x.name_zeigen !== false && "name", x.icon_zeigen !== false && "symbol", (z === "zustand" || z === "zustand_zuletzt") && "zustand", (z === "zuletzt" || z === "zustand_zuletzt") && "zuletzt"].filter(Boolean);
}
function anzeigeText(l) {
  const teile = ANZEIGE_TEILE.filter(([id]) => l.includes(id) && id !== "symbol" && id !== "name").map(([, t]) => (t === "Raum / Bereich" ? "Raum" : t === "Zuletzt geändert" ? "Zeit" : t));
  return teile.length ? teile.join(" + ") : l.includes("name") ? "Nur Name" : "Nur Symbol";
}
const slug = (s) => String(s || "").toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "raum";
const kopie = (o) => JSON.parse(JSON.stringify(o));

// Teile der vorhandenen Karten-Editoren wiederverwenden
class GlasPersonenEditor extends GlasKopfEditor { listen() { return super.listen().filter((l) => l.key === "personen"); } }
class GlasChipsEditor extends GlasKopfEditor { schema() { return []; } listen() { return super.listen().filter((l) => l.key === "chips"); } }

// Zeilen per Griff verschieben: folgt dem Finger 1:1, die anderen weichen aus
function ziehSortieren(liste, fertig) {
  liste.querySelectorAll(".griff").forEach((griff) => {
    griff.addEventListener("pointerdown", (ev) => {
      const zeile = griff.closest(".zeile");
      const zeilen = [...liste.querySelectorAll(":scope > .zeile[data-i]")];
      const von = zeilen.indexOf(zeile);
      if (von < 0) return;
      ev.preventDefault();
      griff.setPointerCapture(ev.pointerId);
      const start = ev.clientY, boxen = zeilen.map((z) => z.getBoundingClientRect()), hoehe = boxen[von].height;
      let nach = von;
      zeile.classList.add("zieht");
      const bewegen = (e) => {
        const dy = e.clientY - start;
        zeile.style.transform = `translateY(${dy}px)`;
        const mitte = boxen[von].top + hoehe / 2 + dy;
        nach = von;
        boxen.forEach((b, i) => { if (i < von && mitte < b.top + b.height / 2) nach = Math.min(nach, i); if (i > von && mitte > b.top + b.height / 2) nach = Math.max(nach, i); });
        zeilen.forEach((z, i) => {
          if (i === von) return;
          const weg = von < nach && i > von && i <= nach ? -hoehe : von > nach && i < von && i >= nach ? hoehe : 0;
          z.style.transform = weg ? `translateY(${weg}px)` : "";
        });
      };
      const los = () => {
        griff.removeEventListener("pointermove", bewegen);
        zeilen.forEach((z) => { z.style.transform = ""; z.classList.remove("zieht"); });
        if (nach !== von) fertig(von, nach);
      };
      griff.addEventListener("pointermove", bewegen);
      griff.addEventListener("pointerup", los, { once: true });
      griff.addEventListener("pointercancel", los, { once: true });
    });
    // Tastatur: Griff fokussieren, Pfeil hoch/runter
    griff.addEventListener("keydown", (e) => {
      const i = Number(griff.closest(".zeile").dataset.i), n = liste.querySelectorAll(":scope > .zeile[data-i]").length;
      if (e.key === "ArrowUp" && i > 0) { e.preventDefault(); fertig(i, i - 1); }
      if (e.key === "ArrowDown" && i < n - 1) { e.preventDefault(); fertig(i, i + 1); }
    });
  });
}
const verschieben = (arr, von, nach) => { const a = [...arr]; const [x] = a.splice(von, 1); a.splice(nach, 0, x); return a; };

class GlasEinstellungen extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._seite = null; // null = Übersicht, sonst "raeume", "start", "personen", "aussehen", "dashboard", "karte:<id>", "assistent"
    this._raum = null; // geöffneter Raum (Index)
    this._fuer = "alle";
    this._offen = new Set(); // aufgeklappte Geräte-Zeilen
  }
  set narrow(n) { this.toggleAttribute("schmal", !!n); }
  set panel(_) { /* */ }
  set route(_) { /* */ }
  set hass(h) {
    const erst = !this._hass;
    this._hass = h;
    Glas.hassSetzen(h);
    if (erst) this.start();
    else {
      this.shadowRoot.querySelectorAll("ha-form, .editor").forEach((f) => { f.hass = h; });
      this.shadowRoot.querySelectorAll("ha-state-icon[data-e]").forEach((el) => { el.hass = h; });
      this.hintergrund();
    }
  }
  get hass() { return this._hass; }
  async start() {
    this.shadowRoot.innerHTML = `<style>${TOKENS}${EINST_CSS}${EINR_CSS}</style><div class="hg"></div><div class="seite"><div class="leise">Lädt …</div></div>`;
    this.hintergrund();
    // HA lädt Formular-Bausteine erst bei Bedarf: einmal einen Karten-Editor anfordern
    // … parallel zu den Einstellungen, damit die Seite sofort steht
    const bausteine = (async () => {
      try {
        const hf = await window.loadCardHelpers();
        await Promise.all([{ type: "entities", entities: [] }, { type: "tile", entity: "sun.sun" }].map(async (cfg) => {
          const k = await hf.createCardElement(cfg);
          await k.constructor.getConfigElement?.();
        }));
      } catch (_) { /* geht auch ohne */ }
    })();
    const e = await Glas.einstLaden(this._hass);
    if (!e) {
      this.$(".seite").innerHTML = `<div class="gruppe leise-zeile">${Glas.einstFehler === "fehlt" ? "Die Integration „Glas-Dashboard“ ist nicht eingerichtet: Einstellungen › Geräte &amp; Dienste › Integration hinzufügen." : esc(Glas.einstFehler)}</div>`;
      return;
    }
    this._d = kopie(e);
    this._d.bereiche = this._d.bereiche || {};
    this._d.startseiten = this._d.startseiten || { alle: startseiteStandard() };
    // Erster Besuch: gleich der Assistent, der durch alles führt
    if (!this._d.eingerichtet && !(this._d.raeume || []).length && !(this._d.personen || []).length) this.assistentStarten();
    this.zeichnen();
    // Formular-Bausteine sind da: Seiten mit Formularen neu zeichnen
    bausteine.then(() => { if (this._seite && this._seite !== "assistent") this.zeichnen(); });
  }
  $(s) { return this.shadowRoot.querySelector(s); }
  $$(s) { return [...this.shadowRoot.querySelectorAll(s)]; }
  hintergrund() {
    const d = istDunkel(this._hass);
    this.toggleAttribute("dunkel", d);
    const hg = this.$(".hg");
    if (hg) hg.style.background = hintergrundCss(this._d?.aussehen?.hintergrund || Glas.einst?.aussehen?.hintergrund || "klassisch", d);
  }
  speichern() {
    clearTimeout(this._speicherT);
    const st = this.$(".status");
    if (st) st.textContent = "…";
    this._speicherT = setTimeout(async () => {
      try { await Glas.einstSpeichern(this._hass, kopie(this._d)); if (this.$(".status")) this.$(".status").textContent = "Gespeichert"; }
      catch (e) { if (this.$(".status")) this.$(".status").textContent = `Nicht gespeichert: ${e.message || e}`; }
    }, 450);
  }
  form(box, data, schema, labels, aendern, hilfen = {}) {
    const f = document.createElement("ha-form");
    f.hass = this._hass; f.data = data; f.schema = schema;
    f.computeLabel = (s) => labels[s.name] ?? s.name;
    f.computeHelper = (s) => hilfen[s.name];
    f.addEventListener("value-changed", (e) => { e.stopPropagation(); const v = { ...e.detail.value }; Object.keys(v).forEach((k) => { if (v[k] === "" || v[k] === undefined) delete v[k]; }); f.data = v; aendern(v, f); });
    box.appendChild(f);
    return f;
  }
  editor(box, tag, cfg, aendern) {
    const ed = document.createElement(tag);
    ed.classList.add("editor");
    ed.hass = this._hass;
    ed.setConfig({ type: `custom:${tag.replace("-editor", "")}`, ...cfg });
    ed.addEventListener("config-changed", (e) => { e.stopPropagation(); const { type, ...rest } = e.detail.config; aendern(rest); });
    box.appendChild(ed);
    return ed;
  }
  html(box, s) { box.insertAdjacentHTML("beforeend", s); return box.lastElementChild; }

  // ---------------- Räume ----------------
  raeumeListe(box) {
    const r = this._d.raeume || [];
    const g = this.html(box, `<div class="gruppe"></div>`);
    if (!r.length) g.innerHTML = `<div class="leise-zeile">Noch keine Räume. Übernimm sie aus Home Assistant oder füge einzeln hinzu.</div>`;
    r.forEach((raum, i) => {
      const n = (raum.geraete || []).filter((x) => x.an !== false).length;
      this.html(g, `<div class="zeile" data-i="${i}"><button class="weiter" data-raum="${i}" aria-label="${esc(raum.name)} bearbeiten"></button>
        <span class="griff" tabindex="0" role="button" aria-label="${esc(raum.name)} verschieben"><ha-icon data-i="mdi:drag-horizontal-variant"></ha-icon></span>
        <span class="sym"><ha-icon data-i="${esc(raum.icon || "mdi:door")}"></ha-icon></span>
        <span class="name"><b>${esc(raum.name)}</b><span>${n} ${n === 1 ? "Gerät" : "Geräte"}${raum.bereich ? ` · Bereich ${esc(this._hass.areas?.[raum.bereich]?.name || raum.bereich)}` : ""}</span></span>
        <ha-icon class="pfeil" data-i="mdi:chevron-right"></ha-icon></div>`);
    });
    ziehSortieren(g, (von, nach) => { this._d.raeume = verschieben(this._d.raeume, von, nach); this.speichern(); this.zeichnen(); });
    g.querySelectorAll("[data-raum]").forEach((b) => b.addEventListener("click", () => { this._raum = Number(b.dataset.raum); this.zeichnen(); window.scrollTo(0, 0); }));
    const hinzu = this.html(g, `<div class="hinzu"></div>`);
    this.form(hinzu, {}, [{ name: "bereich", selector: { area: {} } }], { bereich: "Raum aus HA-Bereich hinzufügen" }, (v) => {
      if (v.bereich) { this.raumNeu(v.bereich); this.speichern(); this._raum = this._d.raeume.length - 1; this.zeichnen(); }
    });
    const frei = Object.values(this._hass.areas || {}).filter((a) => !r.some((x) => x.bereich === a.area_id));
    const akt = this.html(box, `<div class="aktionen">${frei.length ? `<button class="knopf" data-alle>Alle ${frei.length} HA-Bereiche übernehmen</button>` : ""}
      <button class="knopf" data-leer>Raum ohne Bereich</button></div>`);
    akt.querySelector("[data-alle]")?.addEventListener("click", () => { frei.forEach((a) => this.raumNeu(a.area_id)); this.speichern(); this.zeichnen(); });
    akt.querySelector("[data-leer]").addEventListener("click", () => {
      this._d.raeume = [...r, { name: "Neuer Raum", hash: slug(`raum-${r.length + 1}`), icon: "mdi:door", geraete: [] }];
      this.speichern(); this._raum = this._d.raeume.length - 1; this.zeichnen();
    });
    this.html(box, `<div class="fuss">Die Geräte jedes Raums werden aus dem HA-Bereich vorgeschlagen. Im Raum kannst du sie an- und abwählen, verschieben und die Größe einstellen.</div>`);
  }
  raumNeu(bereich) {
    this._d.raeume = [...(this._d.raeume || []), raumAusBereich(this._hass, bereich, this._d.raeume || [])];
  }
  raumDetail(box) {
    const i = this._raum, raum = this._d.raeume[i];
    if (!raum) { this._raum = null; this.raeumeListe(box); return; }
    if (!raum.geraete) raum.geraete = raumGeraeteVorschlag(this._hass, raum.bereich);
    const g = this.html(box, `<div class="gruppe form"></div>`);
    const { geraete, ...rest } = raum;
    this.form(g, { fenster_auto: true, alles_aus: true, ...rest }, [
      { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "icon", selector: { icon: {} } }] },
      { name: "bereich", selector: { area: {} } },
      { type: "grid", name: "", schema: [
        { name: "temperatur", selector: { entity: { filter: { domain: "sensor", device_class: "temperature" } } } },
        { name: "feuchte", selector: { entity: { filter: { domain: "sensor", device_class: "humidity" } } } }] },
      { name: "fenster_auto", selector: { boolean: {} } },
      { name: "alles_aus", selector: { boolean: {} } },
    ], { name: "Name", icon: "Symbol", bereich: "HA-Bereich", temperatur: "Temperatur im Kopf", feuchte: "Luftfeuchte im Kopf", fenster_auto: "Fenster und Türen oben als Chips", alles_aus: "Knopf „Alles aus“" }, (v) => {
      const neuBereich = v.bereich && v.bereich !== raum.bereich;
      Object.assign(raum, v);
      ["temperatur", "feuchte", "bereich"].forEach((k) => { if (!(k in v)) delete raum[k]; });
      if (neuBereich && !raum.geraete.length) raum.geraete = raumGeraeteVorschlag(this._hass, v.bereich);
      this.speichern();
      if (neuBereich) this.zeichnen();
    });
    this.html(box, `<h2>Geräte im Raum</h2>`);
    this.geraeteListe(box, raum.geraete, (neu) => { raum.geraete = neu; }, { gruppen: true, bereich: raum.bereich });
    const akt = this.html(box, `<div class="aktionen"><button class="knopf rot" data-weg>Raum entfernen</button></div>`);
    akt.querySelector("[data-weg]").addEventListener("click", () => {
      if (this._weg !== i) { this._weg = i; akt.querySelector("[data-weg]").textContent = "Wirklich entfernen?"; return; }
      this._weg = null; this._d.raeume.splice(i, 1); this._raum = null; this.speichern(); this.zeichnen();
    });
  }

  // Geräte-Liste (Räume und Favoriten): an/aus, verschieben, Größe, Anzeige, alles Weitere aufklappbar
  geraeteListe(box, liste, setzen, { gruppen = false, bereich = null } = {}) {
    const g = this.html(box, `<div class="gruppe"></div>`);
    const h = this._hass;
    if (!liste.length) g.innerHTML = `<div class="leise-zeile">Noch keine Geräte.</div>`;
    let letzte = null;
    liste.forEach((x, i) => {
      if (x.karte) { this.kartenZeile(g, liste, i, setzen, (l) => { liste = l; }); if (gruppen) letzte = null; return; }
      const st = h.states[x.entity];
      const gr = x.gruppe || gruppeVon(h, x.entity);
      if (gruppen && gr !== letzte) { letzte = gr; this.html(g, `<div class="kopfzeile">${esc((GRUPPEN.find(([id]) => id === gr) || [, "Sonstiges"])[1])}</div>`); }
      const an = x.an !== false, offen = this._offen.has(`${x.entity}|${i}`);
      const z = this.html(g, `<div class="zeile geraet ${an ? "" : "aus"}" data-i="${i}">
        <span class="griff" tabindex="0" role="button" aria-label="${esc(x.name || st?.attributes.friendly_name || x.entity)} verschieben"><ha-icon data-i="mdi:drag-horizontal-variant"></ha-icon></span>
        <button class="schalter" role="switch" aria-checked="${an}" aria-label="Zeigen"></button>
        <span class="name"><b>${esc(x.name || st?.attributes.friendly_name || x.entity)}</b><span>${st ? esc(Geraet.zustand(h, st, Geraet.regler(st))) : "nicht gefunden"}</span></span>
        <span class="optionen"><span class="segment" role="group" aria-label="Größe">${GROESSEN.map(([id, k, t]) => `<button data-g="${id}" title="${t}" aria-label="${t}" aria-pressed="${(x.groesse || "breit") === id}">${k}</button>`).join("")}</span>
        <span class="menue-wrap"><button class="auswahl anzeige-knopf" data-anzeige aria-haspopup="true" aria-expanded="false">${esc(anzeigeText(anzeigeVon(x)))}<ha-icon data-i="mdi:chevron-down"></ha-icon></button></span>
        <button class="klein-knopf" data-mehr aria-expanded="${offen}" aria-label="Mehr Einstellungen"><ha-icon data-i="mdi:${offen ? "chevron-up" : "dots-horizontal"}"></ha-icon></button></span></div>`);
      const neu = (teil) => { const l = [...liste]; l[i] = { ...l[i], ...teil }; setzen(l); liste = l; this.speichern(); };
      z.querySelector(".schalter").addEventListener("click", (e) => { const a = e.currentTarget.getAttribute("aria-checked") !== "true"; e.currentTarget.setAttribute("aria-checked", a); z.classList.toggle("aus", !a); neu({ an: a }); });
      z.querySelectorAll("[data-g]").forEach((b) => b.addEventListener("click", () => { z.querySelectorAll("[data-g]").forEach((o) => o.setAttribute("aria-pressed", o === b)); neu({ groesse: b.dataset.g }); }));
      z.querySelector("[data-anzeige]").addEventListener("click", (e) => {
        e.stopPropagation();
        const knopf = e.currentTarget;
        this.anzeigeMenue(knopf, anzeigeVon(liste[i]), (wahl) => { neu({ anzeige: wahl }); knopf.firstChild.textContent = anzeigeText(wahl); });
      });
      z.querySelector("[data-mehr]").addEventListener("click", () => { const k = `${x.entity}|${i}`; this._offen.has(k) ? this._offen.delete(k) : this._offen.add(k); this.zeichnen(); });
      if (offen) {
        const ex = this.html(g, `<div class="extra"></div>`);
        if (gruppen) this.form(ex, { gruppe: gr }, [{ name: "gruppe", selector: { select: { mode: "dropdown", options: GRUPPEN.map(([value, label]) => ({ value, label })) } } }], { gruppe: "Gruppe" }, (v) => { neu({ gruppe: v.gruppe }); this.zeichnen(); });
        this.editor(ex, "glas-kachel-card-editor", kachelCfg(x), (cfg) => { const l = [...liste]; l[i] = { an: x.an, gruppe: x.gruppe, ...cfg }; setzen(l); liste = l; this.speichern(); });
        const w = this.html(ex, `<div class="aktionen"><button class="knopf rot">Aus der Liste entfernen</button></div>`);
        w.querySelector("button").addEventListener("click", () => { const l = [...liste]; l.splice(i, 1); setzen(l); this.speichern(); this.zeichnen(); });
      }
    });
    ziehSortieren(g, (von, nach) => {
      const l = verschieben(liste, von, nach);
      // In eine andere Gruppe gezogen: Gerät übernimmt die Gruppe seines neuen Nachbarn
      if (gruppen && !l[nach].karte) { const n = [l[nach - 1], l[nach + 1]].find((y) => y?.entity); if (n) l[nach] = { ...l[nach], gruppe: n.gruppe || gruppeVon(h, n.entity) }; }
      setzen(l); this.speichern(); this.zeichnen();
    });
    const hinzu = this.html(g, `<div class="hinzu"></div>`);
    this.form(hinzu, {}, [{ name: "entity", selector: { entity: {} } }], { entity: "Gerät hinzufügen" }, (v) => {
      if (!v.entity) return;
      setzen([...liste, geraetVorschlag(h, v.entity)].map((y, k, a) => (k === a.length - 1 ? { ...y, an: true } : y)));
      this.speichern(); this.zeichnen();
    });
    const freie = LISTEN_KARTEN.filter(([id, , , , eigen]) => eigen || !liste.some((y) => y.karte === id));
    if (freie.length) {
      const kz = this.html(g, `<div class="hinzu karten-hinzu"><span class="leise">Karte hinzufügen</span>${freie.map(([id, n, ic]) =>
        `<button class="knopf" data-karte="${id}"><ha-icon data-i="${ic}"></ha-icon>${n}</button>`).join("")}</div>`);
      kz.querySelectorAll("[data-karte]").forEach((b) => b.addEventListener("click", () => {
        setzen([...liste, { karte: b.dataset.karte, groesse: "breit", an: true, ...(listenKarte(b.dataset.karte)[4] ? { cfg: {} } : {}) }]); this.speichern(); this.zeichnen();
      }));
    }
    if (bereich) {
      const fehlen = raumGeraeteVorschlag(h, bereich).filter((v) => !liste.some((x) => x.entity === v.entity));
      if (fehlen.length) {
        const a = this.html(box, `<div class="aktionen"><button class="knopf">${fehlen.length} neue Geräte im Bereich übernehmen</button></div>`);
        a.querySelector("button").addEventListener("click", () => { setzen([...liste, ...fehlen]); this.speichern(); this.zeichnen(); });
      }
    }
  }

  // Zeile für eine ganze Karte (3D-Drucker, Robi): zeigen, verschieben, Größe, entfernen
  kartenZeile(g, liste, i, setzen, merken) {
    const x = liste[i], [id, titel, icon] = listenKarte(x.karte) || [x.karte, x.karte, "mdi:card-outline"];
    const b = (this._d.bereiche || {})[id] || {};
    const eigen = !!listenKarte(id)?.[4];
    const fertig = eigen ? true : id === "drucker" ? !!(b.geraet || b.fortschritt) : !!b.entity;
    const an = x.an !== false;
    const z = this.html(g, `<div class="zeile geraet karte-zeile ${an ? "" : "aus"}" data-i="${i}">
      <span class="griff" tabindex="0" role="button" aria-label="${esc(titel)} verschieben"><ha-icon data-i="mdi:drag-horizontal-variant"></ha-icon></span>
      <button class="schalter" role="switch" aria-checked="${an}" aria-label="Zeigen"></button>
      <span class="name"><b><ha-icon data-i="${icon}"></ha-icon>${esc(eigen ? listenKarteName(x) : `${titel}-Karte`)}</b><span>${eigen ? "Einstellen im Dashboard: Stift, dann Karte antippen" : fertig ? "Einstellungen unter Bereiche" : "Noch nicht eingerichtet: Bereiche öffnen"}</span></span>
      <span class="optionen"><span class="segment" role="group" aria-label="Größe">${[["breit", "M", "Halbe Breite"], ["ganz", "▭", "Ganze Breite"]].map(([gid, k, t]) =>
        `<button data-g="${gid}" title="${t}" aria-label="${t}" aria-pressed="${(x.groesse === "ganz" ? "ganz" : "breit") === gid}">${k}</button>`).join("")}</span>
        ${eigen ? "" : `<button class="klein-knopf" data-bereich aria-label="${esc(titel)} einstellen"><ha-icon data-i="mdi:cog-outline"></ha-icon></button>`}
        <button class="klein-knopf" data-weg aria-label="Entfernen"><ha-icon data-i="mdi:close"></ha-icon></button></span></div>`);
    const neu = (teil) => { const l = [...liste]; l[i] = { ...l[i], ...teil }; setzen(l); merken(l); liste = l; this.speichern(); };
    z.querySelector(".schalter").addEventListener("click", (e) => { const a = e.currentTarget.getAttribute("aria-checked") !== "true"; e.currentTarget.setAttribute("aria-checked", a); z.classList.toggle("aus", !a); neu({ an: a }); });
    z.querySelectorAll("[data-g]").forEach((bt) => bt.addEventListener("click", () => { z.querySelectorAll("[data-g]").forEach((o) => o.setAttribute("aria-pressed", o === bt)); neu({ groesse: bt.dataset.g }); }));
    z.querySelector("[data-bereich]")?.addEventListener("click", () => this.gehe(`karte:${id}`));
    z.querySelector("[data-weg]").addEventListener("click", () => { const l = [...liste]; l.splice(i, 1); setzen(l); this.speichern(); this.zeichnen(); });
  }

  // Kleines Menü mit Häkchen, schwebt unter dem Knopf
  anzeigeMenue(knopf, wahl, fertig) {
    this.$(".menue-pop")?.remove();
    const pop = document.createElement("div");
    pop.className = "menue-pop glas";
    pop.setAttribute("role", "menu");
    let aktuell = [...wahl];
    const zeichnen = () => {
      pop.innerHTML = ANZEIGE_TEILE.map(([id, t]) => `<button role="menuitemcheckbox" aria-checked="${aktuell.includes(id)}" data-t="${id}">
        <ha-icon data-i="${aktuell.includes(id) ? "mdi:check-circle" : "mdi:circle-outline"}"></ha-icon>${t}</button>`).join("");
      pop.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
      pop.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = b.dataset.t;
        aktuell = aktuell.includes(id) ? aktuell.filter((x) => x !== id) : ANZEIGE_TEILE.map(([k]) => k).filter((k) => k === id || aktuell.includes(k));
        if (!aktuell.length) aktuell = ["symbol"];
        fertig(aktuell);
        zeichnen();
      }));
    };
    zeichnen();
    const r = knopf.getBoundingClientRect(), seite = this.$(".seite").getBoundingClientRect();
    pop.style.top = `${r.bottom - seite.top + 6}px`;
    pop.style.right = `${Math.max(8, seite.right - r.right)}px`;
    this.$(".seite").appendChild(pop);
    knopf.setAttribute("aria-expanded", "true");
    pop.querySelector("button")?.focus();
    const zu = (e) => {
      if (e.type === "keydown" && e.key !== "Escape") return;
      if (e.type === "pointerdown" && pop.contains(e.composedPath()[0])) return;
      pop.remove(); knopf.setAttribute("aria-expanded", "false");
      this.shadowRoot.removeEventListener("pointerdown", zu, true); this.shadowRoot.removeEventListener("keydown", zu, true);
      if (e.type === "keydown") knopf.focus();
    };
    setTimeout(() => { this.shadowRoot.addEventListener("pointerdown", zu, true); this.shadowRoot.addEventListener("keydown", zu, true); }, 0);
  }

  // ---------------- Startseite ----------------
  startseite(box) {
    const leute = (this._d.personen || []).map((p, i) => ({ id: p.benutzer || p.name || `p${i}`, name: p.tablet ? "Tablet" : p.name || "Person" }));
    if (!leute.some((p) => p.id === this._fuer)) this._fuer = "alle";
    const wahl = this.html(box, `<div class="personen-wahl">${[{ id: "alle", name: "Für alle" }, ...leute].map((p) => `<button class="pille ${this._fuer === p.id ? "aktiv" : "glas"}" data-fuer="${esc(p.id)}" aria-pressed="${this._fuer === p.id}">${esc(p.name)}</button>`).join("")}</div>`);
    wahl.querySelectorAll("[data-fuer]").forEach((b) => b.addEventListener("click", () => { this._fuer = b.dataset.fuer; this.zeichnen(); }));
    const S = this._d.startseiten;
    if (this._fuer !== "alle") {
      const eigen = !!S[this._fuer] && S[this._fuer].eigen !== false;
      const g = this.html(box, `<div class="gruppe"><div class="zeile"><span class="name"><b>Eigene Startseite</b><span>${eigen ? "Diese Person hat eine eigene Startseite" : "Nutzt gerade „Für alle“"}</span></span>
        <button class="schalter" role="switch" aria-checked="${eigen}" aria-label="Eigene Startseite"></button></div></div>`);
      g.querySelector(".schalter").addEventListener("click", () => {
        if (eigen) S[this._fuer] = { ...S[this._fuer], eigen: false };
        else S[this._fuer] = { ...kopie(startseiteVon(this._d, null)), ...(S[this._fuer]?.abschnitte ? S[this._fuer] : {}), eigen: true };
        this.speichern(); this.zeichnen();
      });
      if (!eigen) return;
    }
    const s = (S[this._fuer] = startseiteVon(this._d, this._fuer === "alle" ? null : { id: this._fuer }));
    if (this._fuer !== "alle") s.eigen = true;
    this.html(box, `<h2>Abschnitte</h2>`);
    const g = this.html(box, `<div class="gruppe"></div>`);
    s.abschnitte.forEach((a, i) => {
      const [, name, icon] = ABSCHNITTE.find(([id]) => id === a.id) || [a.id, a.id, "mdi:square-outline"];
      const z = this.html(g, `<div class="zeile ${a.an ? "" : "aus"}" data-i="${i}">
        <span class="griff" tabindex="0" role="button" aria-label="${esc(name)} verschieben"><ha-icon data-i="mdi:drag-horizontal-variant"></ha-icon></span>
        <button class="schalter" role="switch" aria-checked="${!!a.an}" aria-label="${esc(name)} zeigen"></button>
        <span class="sym"><ha-icon data-i="${icon}"></ha-icon></span><span class="name"><b>${esc(name)}</b></span>
        <span class="segment" role="group" aria-label="Breite"><button data-b="halb" aria-pressed="${a.breite === "halb"}" title="Halbe Breite (am PC)">½</button><button data-b="ganz" aria-pressed="${a.breite !== "halb"}" title="Ganze Breite">Ganz</button></span></div>`);
      z.querySelector(".schalter").addEventListener("click", (e) => { a.an = !a.an; e.currentTarget.setAttribute("aria-checked", a.an); z.classList.toggle("aus", !a.an); this.speichern(); });
      z.querySelectorAll("[data-b]").forEach((b) => b.addEventListener("click", () => { a.breite = b.dataset.b; z.querySelectorAll("[data-b]").forEach((o) => o.setAttribute("aria-pressed", o === b)); this.speichern(); }));
    });
    ziehSortieren(g, (von, nach) => { s.abschnitte = verschieben(s.abschnitte, von, nach); this.speichern(); this.zeichnen(); });
    this.html(box, `<div class="fuss">Abschnitte ohne Einstellung (z. B. kein Saugroboter gewählt) bleiben automatisch weg. „½“ stellt am PC zwei nebeneinander.</div>`);
    this.html(box, `<h2>Favoriten</h2>`);
    this.geraeteListe(box, s.favoriten || [], (neu) => { s.favoriten = neu; });
    this.html(box, `<h2>Schnellzugriff</h2>`);
    const c = this.html(box, `<div class="gruppe form"></div>`);
    this.editor(c, "glas-chips-editor", { chips: s.chips || [] }, (cfg) => { s.chips = cfg.chips || []; this.speichern(); });
  }

  // ---------------- Personen ----------------
  personen(box) {
    const g = this.html(box, `<div class="gruppe form"></div>`);
    this.editor(g, "glas-personen-editor", { gruss_modus: this._d.gruss_modus || "name", gruss_text: this._d.gruss_text, untertitel: this._d.untertitel, personen: this._d.personen || [] }, (cfg) => {
      Object.assign(this._d, { gruss_modus: cfg.gruss_modus, gruss_text: cfg.gruss_text, untertitel: cfg.untertitel, personen: cfg.personen || [] });
      this.speichern();
    });
    // Von null: Personen aus Home Assistant vorschlagen (person.* mit verknüpftem Benutzer)
    const haPers = Object.keys(this._hass.states).filter((e) => e.startsWith("person.")).map((e) => this._hass.states[e]);
    if (!(this._d.personen || []).length && haPers.length) {
      const a = this.html(box, `<div class="aktionen"><button class="knopf" data-ha-pers>${haPers.length === 1 ? "Person" : `${haPers.length} Personen`} aus Home Assistant übernehmen</button></div>`);
      a.querySelector("button").addEventListener("click", () => {
        this._d.personen = [...haPers.map((p) => { const n = p.attributes.friendly_name || p.entity_id.slice(7);
          return { name: n, kurz: n.slice(0, 1).toUpperCase(), entity: p.entity_id, ...(p.attributes.user_id ? { benutzer: p.attributes.user_id } : {}) }; }), { tablet: true }];
        this.speichern(); this.zeichnen();
      });
    }
    this.html(box, `<div class="fuss">Jede Person kann unter „Startseite“ eine eigene Startseite bekommen. Welche Person ein Gerät zeigt, merkt sich jedes Gerät selbst (das Tablet bleibt Tablet).</div>`);
  }

  // ---------------- Aussehen ----------------
  aussehen(box) {
    const A = (this._d.aussehen = { modus: "auto", hintergrund: "klassisch", ...(this._d.aussehen || {}) });
    this.html(box, `<h2>Hell oder dunkel</h2>`);
    const m = this.html(box, `<div class="gruppe"><div class="zeile"><span class="name"><b>Darstellung</b><span>Automatisch folgt dem Handy bzw. HA</span></span>
      <span class="segment" role="group" aria-label="Darstellung">${[["auto", "Auto"], ["hell", "Hell"], ["dunkel", "Dunkel"]].map(([id, t]) => `<button data-m="${id}" aria-pressed="${A.modus === id}">${t}</button>`).join("")}</span></div></div>`);
    m.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { A.modus = b.dataset.m; Glas.einst = { ...(Glas.einst || {}), aussehen: { ...A } }; this.speichern(); this.hintergrund(); this.zeichnen(); }));
    this.html(box, `<h2>Hintergrund</h2>`);
    const d = istDunkel(this._hass);
    const hg = this.html(box, `<div class="gruppe"><div class="hgs">${[...Object.entries(HINTERGRUENDE).map(([id, x]) => [id, x.name]), ["tageszeit", "Nach Tageszeit"], ["aus", "Wie Home Assistant"]]
      .map(([id, n]) => `<button class="hg-wahl" data-hg="${id}" aria-pressed="${A.hintergrund === id}"><span class="muster" style="background:${hintergrundCss(id, d)}"><span></span></span>${esc(n)}</button>`).join("")}</div></div>`);
    hg.querySelectorAll("[data-hg]").forEach((b) => b.addEventListener("click", () => { A.hintergrund = b.dataset.hg; this.speichern(); this.hintergrund(); this.zeichnen(); }));
    this.html(box, `<div class="fuss">„Nach Tageszeit“: morgens warm, tagsüber wie bisher, abends See, nachts ruhig.</div>`);
  }
  async dashboardBlock(box) {
    const g = this.html(box, `<div class="gruppe"><div class="zeile"><span class="name"><b>Dashboard „Zuhause“</b><span class="info">Prüfe …</span></span><span class="knopf-platz"></span></div></div>`);
    this.html(box, `<div class="fuss">Baut sich komplett aus diesen Einstellungen auf. Du kannst die Glas-Karten aber auch weiterhin einzeln in jedes andere Dashboard legen.</div>`);
    const info = g.querySelector(".info"), platz = g.querySelector(".knopf-platz");
    let liste = [];
    try { liste = await this._hass.callWS({ type: "lovelace/dashboards/list" }); } catch (_) { info.textContent = "Nur Admins können Dashboards anlegen."; return; }
    const da = liste.find((x) => x.url_path === "glas-zuhause");
    if (da) { info.textContent = "Ist angelegt und in der Seitenleiste"; platz.innerHTML = `<a class="knopf haupt" href="/glas-zuhause" style="text-decoration:none">Öffnen</a>`; return; }
    info.textContent = "Noch nicht angelegt";
    platz.innerHTML = `<button class="knopf haupt">Anlegen</button>`;
    platz.querySelector("button").addEventListener("click", async () => {
      try {
        await this._hass.callWS({ type: "lovelace/dashboards/create", url_path: "glas-zuhause", title: "Zuhause", icon: "mdi:home-outline", show_in_sidebar: true, require_admin: false, mode: "storage" });
        await this._hass.callWS({ type: "lovelace/config/save", url_path: "glas-zuhause", config: { strategy: { type: "custom:glas" } } });
        info.textContent = "Angelegt – steht jetzt in der Seitenleiste";
        platz.innerHTML = `<a class="knopf haupt" href="/glas-zuhause" style="text-decoration:none">Öffnen</a>`;
      } catch (e) { info.textContent = `Ging nicht: ${e.message || e}`; }
    });
  }
}

// ---------------------------------------------------------------------------
// Dashboard-Strategie „custom:glas“: eine Seite, die sich aus den Einstellungen aufbaut
// ---------------------------------------------------------------------------
class GlasStrategie extends HTMLElement {
  static async generate() {
    return { title: "Zuhause", views: [{ title: "Zuhause", path: "zuhause", icon: "mdi:home-outline", type: "panel", cards: [{ type: "custom:glas-zuhause-card" }] }] };
  }
}
