// ---------------------------------------------------------------------------
// glas-hinweise-card: sichtbare Warnungen ganz oben auf der Startseite
// · Fenster/Türen offen und Regen kommt (Wetter-Vorhersage der nächsten Stunden)
// · Fenster/Türen offen und keiner zu Hause (alle Personen abwesend)
// Erscheint nur, wenn etwas zutrifft – sonst ist die Karte unsichtbar.
// ---------------------------------------------------------------------------
const HINWEIS_CSS = `
:host{display:block}
:host([leer]){display:none}
.hinweise{display:flex;flex-direction:column;gap:var(--g-a2)}
.hinweis{display:flex;align-items:center;gap:var(--g-a3);width:100%;min-height:64px;padding:var(--g-a3) var(--g-a4);border-radius:var(--g-r);text-align:left;
  background:color-mix(in srgb,var(--hf) 16%,var(--g-glas));border:1.5px solid color-mix(in srgb,var(--hf) 55%,transparent);color:var(--g-text);
  animation:rein .4s cubic-bezier(.32,.72,0,1)}
.hinweis .sym{flex:none;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--hfv);color:#fff}
.hinweis .t{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.hinweis b{font-size:var(--g-s-name);font-weight:700}
.hinweis span.u{font-size:var(--g-s-klein);color:var(--g-text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hinweis .pfeil{flex:none;color:var(--g-text2)}
@keyframes rein{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
`;
const REGEN = ["rainy", "pouring", "lightning-rainy", "snowy-rainy", "hail", "snowy", "exceptional"];

class GlasHinweiseCard extends GlasKarte {
  static standard() { return { fenster_klassen: ["window", "door", "garage_door", "opening"] }; }
  getGridOptions() { return { columns: 12, rows: "auto" }; }
  css() { return HINWEIS_CSS; }
  fenster() {
    const h = this._hass, k = this._config.fenster_klassen;
    return Object.values(h.states).filter((st) => st.entity_id.startsWith("binary_sensor.") && k.includes(st.attributes.device_class)
      && st.state === "on" && !h.entities?.[st.entity_id]?.hidden);
  }
  entitaeten() {
    const h = this._hass;
    return [this._config.regen || this._config.wetter, ...(this._config.personen || []), ...Object.keys(h?.states || {}).filter((e) => e.startsWith("binary_sensor."))].filter(Boolean);
  }
  // Regnet es gerade? Quelle wählbar: Wetter-Entität (Zustand), Regen-/Nässesensor (an) oder Niederschlagssensor (> 0)
  regnet() {
    const h = this._hass, id = this._config.regen || this._config.wetter, st = id && h.states[id];
    if (!st) return false;
    const d = domainVon(id);
    if (d === "weather") return REGEN.includes(st.state);
    if (d === "binary_sensor" || d === "input_boolean" || d === "switch") return st.state === "on";
    const n = Number(st.state);
    return !isNaN(n) ? n > 0 : ["rain", "rainy", "regen", "nass", "wet", "pouring"].includes(String(st.state).toLowerCase());
  }
  keinerDa() {
    const h = this._hass, p = (this._config.personen || []).map((e) => h.states[e]).filter(Boolean);
    return p.length > 0 && p.every((x) => x.state !== "home");
  }
  html() {
    const offen = this.fenster();
    const liste = [];
    if (offen.length) {
      const regen = this.regnet(), weg = this.keinerDa();
      const namen = offen.map((st) => { const a = bereichVon(this._hass, st.entity_id); const r = a && this._hass.areas?.[a]?.name; return r ? `${r}: ${st.attributes.friendly_name}` : st.attributes.friendly_name; }).join(", ");
      const n = `${offen.length} ${offen.length === 1 ? "Fenster/Tür" : "Fenster/Türen"} offen`;
      const wann = regen ? "Es regnet" : "";
      if (weg) liste.push({ farbe: "var(--g-rot)", voll: "var(--g-rot-voll)", icon: "mdi:home-alert", titel: `Keiner zu Hause · ${n}`, unter: [wann, namen].filter(Boolean).join(" · ") });
      else if (wann) liste.push({ farbe: "var(--g-akzent)", voll: "var(--g-akzent-voll)", icon: "mdi:weather-pouring", titel: `${wann} · ${n}`, unter: namen });
    }
    this.toggleAttribute("leer", !liste.length);
    if (!liste.length) return "";
    return `<div class="hinweise" role="status">${liste.map((x) => `<button class="hinweis k" data-fenster style="--hf:${x.farbe};--hfv:${x.voll}">
      <span class="sym"><ha-icon data-i="${x.icon}"></ha-icon></span><span class="t"><b>${esc(x.titel)}</b><span class="u">${esc(x.unter)}</span></span>
      <ha-icon class="pfeil" data-i="mdi:chevron-right"></ha-icon></button>`).join("")}</div>`;
  }
  binden() {
    this.iconsSetzen();
    this.$$("[data-fenster]").forEach((b) => b.addEventListener("click", () => fensterOeffnen(this, null, "")));
  }
}

class GlasHinweiseEditor extends GlasEditor {
  schema() {
    return [
      { name: "an", selector: { boolean: {} } },
      { name: "regen", selector: { entity: { filter: [{ domain: "weather" }, { domain: "binary_sensor", device_class: "moisture" }, { domain: "binary_sensor" }, { domain: "sensor" }] } } },
    ];
  }
  render() { if (this._config.an === undefined) this._config.an = true; super.render(); }
  labels() { return { an: "Warnungen oben auf der Startseite", regen: "Woran erkenne ich Regen? (leer = Wetter-Entität)" }; }
  hilfen() { return { regen: "Wetter-Entität (regnet laut Zustand), Regen-/Nässesensor (an = nass) oder Niederschlagssensor (über 0 = Regen).", an: "Rot: keiner zu Hause und Fenster offen. Blau: es regnet und ein Fenster ist offen. Wetter kommt aus „Wetter“, Personen aus „Personen“." }; }
}
