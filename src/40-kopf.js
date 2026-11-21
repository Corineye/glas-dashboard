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
.rechts{display:flex;align-items:center;gap:var(--g-a2);flex:none}
.bearb-zeile{display:flex;align-items:center;gap:var(--g-a2);margin-top:var(--g-a3);padding:var(--g-a2) var(--g-a3);border-radius:var(--g-r-klein);
  font-size:var(--g-s-klein);line-height:1.4;color:var(--g-text)}
.bearb-zeile ha-icon{flex:none;color:var(--g-akzent)}
.chip ha-state-icon,.chip ha-icon{--mdc-icon-size:16px;color:var(--cf)}
`;

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
    return `<div class="oben"><div class="gruss"><h1>${esc(gruss)}</h1>${c.untertitel ? `<div class="leise">${esc(c.untertitel)}</div>` : ""}</div><div class="rechts">${stift}
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
