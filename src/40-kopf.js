// ---------------------------------------------------------------------------
// glas-kopf-card: „Hallo Corin“, Personenwahl (C · L · Tablet), Schnellzugriff-Chips
// ---------------------------------------------------------------------------
const KOPF_CSS = `
:host{display:block}
.oben{display:flex;align-items:center;justify-content:space-between;gap:var(--g-a3);padding:0 var(--g-a1)}
.gruss{display:flex;flex-direction:column;gap:2px;min-width:0}
h1{margin:0;font-size:var(--g-s-titel);font-weight:800;letter-spacing:-.4px;color:var(--g-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.personen{flex:none;display:flex;gap:2px;padding:3px;border-radius:var(--g-r-pille)}
.person{position:relative;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-size:var(--g-s-klein);font-weight:700;color:var(--g-text);transition:background-color .2s ease}
.person[aria-pressed="true"]{background:var(--g-aktiv);color:var(--g-aktiv-text)}
.haus{position:absolute;right:-2px;bottom:-2px;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  background:var(--g-akzent);color:#fff;box-shadow:0 0 0 2px var(--g-ring,#fff)}
:host([dunkel]) .haus{--g-ring:#1c1c1e}
.haus ha-icon{--mdc-icon-size:10px}
.chips{display:flex;flex-wrap:wrap;gap:var(--g-a2);margin-top:var(--g-a3)}
.chip{min-height:36px}
.aktiv-rund{background:var(--g-akzent-voll);color:#fff}
.insel-platz{flex:1;min-width:0;align-self:stretch;margin-left:calc(-1 * var(--g-a3))}
/* Läuft etwas, bleibt mindestens Platz für die kleine Insel (nur das Symbol) */
:host([insel]) .insel-platz{min-width:44px;margin-left:0}
.rechts{display:flex;align-items:center;gap:var(--g-a2);flex:none}
.bearb-zeile{display:flex;align-items:center;gap:var(--g-a2);margin-top:var(--g-a3);padding:var(--g-a2) var(--g-a3);border-radius:var(--g-r-klein);
  font-size:var(--g-s-klein);line-height:1.4;color:var(--g-text)}
.bearb-zeile ha-icon{flex:none;color:var(--g-akzent)}
.chip ha-state-icon,.chip ha-icon{--mdc-icon-size:16px;color:var(--cf)}
/* Großer Titel: schrumpft beim Scrollen (nur transform/opacity, folgt dem Finger) */
.gruss{transform-origin:0 50%}
/* Kleine Glas-Blase oben links: Avatar + Name, kein Stift, keine volle Leiste */
.blase{position:fixed;z-index:5;top:calc(var(--header-height,0px) + env(safe-area-inset-top,0px) + var(--g-a2));left:var(--blase-x,var(--g-a4));
  display:flex;align-items:center;gap:var(--g-a2);max-width:calc(100vw - 32px);min-height:44px;padding:5px var(--g-a4) 5px 5px;border-radius:var(--g-r-pille);
  box-shadow:0 6px 24px rgba(0,0,0,.12);color:var(--g-text);font-size:var(--g-s-name);font-weight:650;letter-spacing:-.2px;white-space:nowrap;
  transform-origin:0 50%;opacity:0;visibility:hidden;pointer-events:none;transform:translate3d(0,-6px,0) scale(.72);
  transition:transform .32s cubic-bezier(.32,.72,0,1),opacity .16s ease,visibility 0s linear .32s}
.blase.zu{opacity:1;visibility:visible;pointer-events:auto;transform:none;
  transition:transform .42s cubic-bezier(.34,1.3,.64,1),opacity .16s ease,visibility 0s}
@supports (transition-timing-function:linear(0,1)){
  /* echte Feder (leichtes Nachschwingen wie iOS) */
  .blase.zu{transition-timing-function:linear(0,.009,.035 2.1%,.141 4.4%,.723 12.9%,.938 16.7%,1.017 19.6%,1.067 22.4%,1.088 25.4%,1.084 28.6%,1.064 32.1%,1.017 40.5%,.998 47.5%,.995 54.5%,1 70%,1),ease,linear}
}
:host([dunkel]) .blase{box-shadow:0 6px 24px rgba(0,0,0,.4)}
.blase .ava{flex:none;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  background:var(--g-aktiv);color:var(--g-aktiv-text);font-size:var(--g-s-klein);font-weight:700}
.blase .ava ha-icon{--mdc-icon-size:18px}
.blase.zu:active{transform:scale(.96);transition-duration:.12s}
.blase .bt{overflow:hidden;text-overflow:ellipsis}
`;
const BEWEGUNG_REDUZIERT = matchMedia("(prefers-reduced-motion: reduce)");

class GlasKopfCard extends GlasKarte {
  static standard() { return { gruss_modus: "name", personen: [], chips: [] }; }
  static getConfigElement() { return document.createElement("glas-kopf-card-editor"); }
  static getStubConfig(hass) { return { personen: [{ name: hass.user?.name || "Ich", kurz: (hass.user?.name || "I")[0], benutzer: hass.user?.id }], chips: [] }; }
  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }
  entitaeten() { return [...(this._config.personen || []).map((p) => p.entity), ...(this._config.chips || []).map((c) => c.entity)].filter(Boolean); }
  personen() {
    return (this._config.personen || []).map((p, i) => ({ ...p, id: p.benutzer || p.name || `p${i}`, kurz: p.kurz || (p.tablet ? "" : (p.name || "?")[0].toUpperCase()) }));
  }
  render() { Glas.personenSetzen(this.personen()); super.render(); }
  connectedCallback() {
    super.connectedCallback();
    if (!this._scrollHoerer) {
      let wartet = false;
      this._scrollHoerer = () => { if (!wartet) { wartet = true; requestAnimationFrame(() => { wartet = false; this.titelFolgen(); }); } };
      this._groesseHoerer = () => { this._kopfH = null; this._scrollHoerer(); };
    }
    if (!this._inselHoerer) this._inselHoerer = () => { const an = !!Glas.inselAktiv && !(parseFloat(getComputedStyle(this).getPropertyValue("--header-height")) || 0); if (an !== this.hasAttribute("insel")) { this.toggleAttribute("insel", an); } this._scrollHoerer(); };
    addEventListener("glas-insel-aktiv", this._inselHoerer);
    requestAnimationFrame(() => this._inselHoerer());
    addEventListener("scroll", this._scrollHoerer, { passive: true });
    addEventListener("resize", this._groesseHoerer, { passive: true });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    removeEventListener("scroll", this._scrollHoerer);
    removeEventListener("glas-insel-aktiv", this._inselHoerer);
    removeEventListener("resize", this._groesseHoerer);
  }
  // Großer Titel folgt dem Scrollen (wird kleiner und blasser); ab der Hälfte federt die Blase oben links heraus.
  // Pro Bild nur ein Messen (getBoundingClientRect), danach nur transform/opacity schreiben.
  titelFolgen() {
    const g = this.$(".gruss"), b = this.$(".blase");
    if (!g || !b) return;
    if (this._kopfH == null) this._kopfH = parseFloat(getComputedStyle(this).getPropertyValue("--header-height")) || 0;
    const r = g.parentNode.getBoundingClientRect(); // .oben wird nicht verwandelt, misst also ehrlich
    if (!r.height) return; // gerade nicht sichtbar
    const ruhe = r.top + scrollY; // Lage des Titels ohne Scrollen
    const weg = scrollY - Math.max(0, ruhe - this._kopfH - 24); // wie weit der Titel schon nach oben gewandert ist
    const p = klemmen(weg / 64, 0, 1);
    if (p !== this._p) {
      this._p = p;
      g.style.transform = p && !BEWEGUNG_REDUZIERT.matches ? `scale(${(1 - p * 0.18).toFixed(4)})` : "";
      g.style.opacity = p ? (1 - p).toFixed(3) : "";
    }
    // Freie Fläche zwischen Begrüßung und Knöpfen: dort sitzt die Dynamic Island (keine eigene Zeile)
    const pl = this.$(".insel-platz")?.getBoundingClientRect();
    if (pl) {
      const P = { x: Math.round(pl.left + pl.width / 2 + scrollX), y: Math.round(pl.top + pl.height / 2 + scrollY), w: Math.round(pl.width) };
      if (JSON.stringify(P) !== JSON.stringify(Glas.inselPlatz)) { Glas.inselPlatz = P; window.dispatchEvent(new CustomEvent("glas-insel-platz")); }
    }
    const x = Math.round(Math.max(8, r.left - 4));
    if (x !== this._x) { this._x = x; b.style.setProperty("--blase-x", x + "px"); }
    // Kleiner Abstand (Hysterese), damit die Blase am Umschaltpunkt nicht flackert
    const zu = this._zu ? p > 0.4 : p > 0.6;
    if (zu !== this._zu) { this._zu = zu; Glas.blaseZu = zu; window.dispatchEvent(new CustomEvent("glas-blase", { detail: zu })); b.classList.toggle("zu", zu); b.setAttribute("aria-hidden", String(!zu)); b.tabIndex = zu ? 0 : -1; }
  }
  css() { return KOPF_CSS; }
  chipSichtbar(ch, st) {
    const z = ch.zeigen || "immer";
    if (z === "immer") return true;
    if (!st) return false;
    if (z === "an") return Geraet.istAn(st) || !!Geraet.istWarnung(st);
    if (z === "aus") return !Geraet.istAn(st);
    if (z === "wert") return String(st.state) === String(ch.wert ?? "");
    return true;
  }
  html() {
    const h = this._hass, c = this._config;
    const ich = Glas.aktuellePerson(h);
    const ps = this.personen();
    const std = new Date().getHours();
    const tz = std < 11 ? "Guten Morgen" : std < 18 ? "Hallo" : "Guten Abend";
    const vorname = ich?.tablet ? "" : (ich?.name || "").split(" ")[0];
    const gruss = c.gruss_modus === "text" ? (c.gruss_text || "Zuhause") : `${c.gruss_modus === "tageszeit" ? tz : "Hallo"}${vorname ? ", " + vorname : ""}`.replace("Hallo, ", "Hallo ");
    const chips = (c.chips || []).map((ch, i) => ({ ch, i, st: h.states[ch.entity] })).filter((x) => this.chipSichtbar(x.ch, x.st));
    const stift = istAdmin(h) && Glas.einst && c.bearbeiten_knopf !== false
      ? (Glas.bearbeiten ? `<button class="rund aktiv-rund" data-bearb aria-label="Bearbeiten beenden"><ha-icon data-i="mdi:check"></ha-icon></button>` : `<button class="rund glas" data-bearb aria-label="Dashboard bearbeiten"><ha-icon data-i="mdi:pencil-outline"></ha-icon></button>`) : "";
    const ava = ich?.tablet ? `<ha-icon data-i="mdi:tablet"></ha-icon>` : ich ? esc(String(ich.kurz || "").slice(0, 2)) : `<ha-icon data-i="mdi:home"></ha-icon>`;
    const blase = `<button class="blase glas" data-blase aria-hidden="true" tabindex="-1" aria-label="${esc(gruss)}, nach oben"><span class="ava" aria-hidden="true">${ava}</span><span class="bt">${esc(gruss)}</span></button>`;
    return `${blase}<div class="oben"><div class="gruss"><h1>${esc(gruss)}</h1>${c.untertitel ? `<div class="leise">${esc(c.untertitel)}</div>` : ""}</div><span class="insel-platz" aria-hidden="true"></span><div class="rechts">${stift}
      ${ps.length > 1 ? `<div class="personen glas" role="group" aria-label="Wer schaut gerade?">${ps.map((p) => {
        const da = p.entity && h.states[p.entity]?.state === "home";
        return `<button class="person" data-p="${esc(p.id)}" aria-pressed="${ich?.id === p.id}" aria-label="${esc(p.name || "Tablet")}${da ? ", zu Hause" : ""}">
          ${p.tablet ? `<ha-icon data-i="mdi:tablet"></ha-icon>` : esc(p.kurz)}${da ? `<span class="haus" aria-hidden="true"><ha-icon data-i="mdi:home"></ha-icon></span>` : ""}</button>`;
      }).join("")}</div>` : ""}</div></div>
      ${chips.length ? `<div class="chips">${chips.map(({ ch, i, st }) => {
        const farbe = farbeAus(ch.farbe, st ? Geraet.farbe(st) : "#8e8e93");
        const text = [ch.name || st?.attributes.friendly_name || ch.entity, ch.zustand_zeigen === false || !st ? "" : Geraet.zustand(h, st, Geraet.regler(st))].filter(Boolean).join(" ");
        const sym = ch.icon ? `<ha-icon data-i="${esc(ch.icon)}"></ha-icon>` : st ? `<ha-state-icon data-e="${esc(ch.entity)}"></ha-state-icon>` : `<span class="punkt" style="background:${farbe}"></span>`;
        return `<button class="pille glas chip k" data-c="${i}" style="--cf:${farbe}">${sym}${esc(text)}</button>`;
      }).join("")}</div>` : ""}`;
  }
  binden() {
    this.iconsSetzen();
    // Nach dem Neuzeichnen Zustand sofort (ohne Animation) wiederherstellen
    this._p = this._zu = this._x = undefined;
    this.titelFolgen();
    this.$("[data-blase]").addEventListener("click", () => scrollTo({ top: 0, behavior: BEWEGUNG_REDUZIERT.matches ? "auto" : "smooth" }));
    this.$$("[data-p]").forEach((b) => b.addEventListener("click", () => Glas.personWaehlen(b.dataset.p)));
    this.$("[data-bearb]")?.addEventListener("click", () => Glas.bearbeitenSetzen(!Glas.bearbeiten));
    this.$$("[data-c]").forEach((b) => b.addEventListener("click", () => {
      const ch = this._config.chips[b.dataset.c], st = this._hass.states[ch.entity];
      if (ch.tap_action?.action) return aktion(this, { entity: ch.entity, tap_action: ch.tap_action }, "tap");
      if (!st) return;
      const d = domainVon(ch.entity);
      if (d === "input_select" || d === "select") return this.dienst(d, "select_next", { entity_id: ch.entity, cycle: true });
      if (Geraet.schaltbar(st) || Geraet.ausloesbar(st)) return Geraet.schalten(this._hass, st);
      mehrInfo(this, ch.entity);
    }));
  }
}

class GlasKopfEditor extends GlasEditor {
  async render() {
    if (this._hass && !this._benutzer) {
      this._benutzer = [];
      try {
        const l = await this._hass.callWS({ type: "config/auth/list" });
        this._benutzer = l.filter((u) => !u.system_generated && u.is_active).map((u) => ({ value: u.id, label: u.name }));
      } catch (_) { this._benutzer = this._hass.user ? [{ value: this._hass.user.id, label: this._hass.user.name }] : []; }
    }
    super.render();
  }
  schema() {
    return [
      { name: "gruss_modus", selector: { select: { mode: "dropdown", options: [
        { value: "name", label: "Hallo + Vorname" }, { value: "tageszeit", label: "Guten Morgen/Abend + Vorname" }, { value: "text", label: "Eigener Text" }] } } },
      ...(this._config.gruss_modus === "text" ? [{ name: "gruss_text", selector: { text: {} } }] : []),
      { name: "untertitel", selector: { text: {} } },
    ];
  }
  labels() { return { gruss_modus: "Begrüßung", gruss_text: "Text", untertitel: "Untertitel (optional)" }; }
  listen() {
    return [
      { key: "personen", titel: "Personen", neuText: "Person", hinweis: "Wer am Dashboard wählbar ist. Die Planer-Karte zeigt die Aufgaben und Termine der gewählten Person. Ein Tablet bekommt keine eigene Person.",
        neu: () => ({ name: "" }), name: (p) => (p.tablet ? "Tablet" : p.name || "Neue Person"),
        labels: { name: "Name", kurz: "Kürzel (z. B. C)", benutzer: "Home-Assistant-Benutzer", entity: "Personen-Entität (für „zu Hause“)", tablet: "Ist ein Tablet (keine Person)", kalender: "Kalender (leer = wie im Planer)" },
        schema: (p) => [
          { name: "tablet", selector: { boolean: {} } },
          ...(p.tablet ? [] : [
            { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "kurz", selector: { text: {} } }] },
            { name: "benutzer", selector: { select: { mode: "dropdown", options: this._benutzer || [] } } },
            { name: "entity", selector: { entity: { filter: { domain: ["person", "device_tracker"] } } } },
            { name: "kalender", selector: { entity: { multiple: true, filter: { domain: "calendar" } } } },
          ]),
        ] },
      { key: "chips", titel: "Schnellzugriff", neuText: "Chip", hinweis: "Kleine Knöpfe unter der Begrüßung. Tippen schaltet, Auswahllisten (z. B. Heizung Tag/Nacht) springen weiter.",
        neu: () => ({ zeigen: "immer" }), name: (c) => c.name || c.entity || "Neuer Chip",
        labels: { entity: "Entität", name: "Text (leer = Name aus HA)", icon: "Symbol", zeigen: "Wann zeigen", wert: "Zustand", zustand_zeigen: "Zustand anhängen", farbe: "Farbe", tap_action: "Tippen" },
        schema: (c) => [
          { name: "entity", selector: { entity: {} } },
          { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "icon", selector: { icon: {} } }] },
          { type: "grid", name: "", schema: [
            { name: "zeigen", selector: { select: { mode: "dropdown", options: [
              { value: "immer", label: "Immer" }, { value: "an", label: "Nur wenn an/aktiv" }, { value: "aus", label: "Nur wenn aus" }, { value: "wert", label: "Bei bestimmtem Zustand" }] } } },
            { name: "farbe", selector: { select: { mode: "dropdown", options: FARB_OPTIONEN.map(([value, label]) => ({ value, label })) } } },
          ] },
          ...(c.zeigen === "wert" ? [{ name: "wert", selector: { text: {} } }] : []),
          { name: "zustand_zeigen", selector: { boolean: {} } },
          { name: "tap_action", selector: { ui_action: {} } },
        ] },
    ];
  }
}
