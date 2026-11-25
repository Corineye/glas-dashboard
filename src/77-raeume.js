// ---------------------------------------------------------------------------
// Räume als Ordner (Startseite wie ein iPhone-Homescreen):
// oben ein Favoriten-Ordner, darunter jeder Raum als Ordner-Kachel (Name, Temperatur,
// Luftfeuchte, offene Fenster, vier gewählte Geräte, „x von y an“). Antippen öffnet den Raum.
// Die untere Leiste zeigt statt der Räume vier wählbare Plätze (Wetter, Planer, Termin, Suche …).
// Alles baut auf den bestehenden Raum-Einstellungen auf (Geräte, Sensoren, Fenster-Chips).
// ---------------------------------------------------------------------------
const RO_PLAETZE = [
  ["wetter", "Wetter", "mdi:weather-partly-cloudy"], ["planer", "Planer (offene Aufgaben)", "mdi:format-list-checks"],
  ["termin", "Nächster Termin", "mdi:calendar-blank-outline"], ["suche", "Suche", "mdi:magnify"],
  ["sicherheit", "Zuhause & Sicherheit", "mdi:shield-home-outline"], ["drucker", "3D-Drucker", "mdi:printer-3d-nozzle"], ["robi", "Robi", "mdi:robot-vacuum"],
];
const RO_STANDARD = { an: true, anwesenheit_oben: true, leiste: ["wetter", "planer", "termin", "suche"] };
const raeumeOrdner = (e) => ({ ...RO_STANDARD, ...(e?.raeume_ordner || {}) });
const ordnerStil = (e) => raeumeOrdner(e).an !== false;
const RO_WICHTIG = ["light", "switch", "cover", "climate", "fan", "media_player", "lock", "humidifier", "input_boolean", "vacuum", "water_heater"];
const ANWESEND_KLASSEN = ["motion", "occupancy", "presence"];

// Messwert eines Raums: eingestellter Sensor, sonst der erste passende im HA-Bereich (wie im Raum-Kopf)
function raumMesswert(h, r, dc) {
  // Automatisch: Raumsensor, nicht Kühlschrank/Gefrierfach/Drucker
  const geraetIst = (e) => /k[uü]hl|gefrier|fridge|freez|p1s|nozzle|bed|d[uü]se/i.test(`${e} ${h.states[e].attributes.friendly_name || ""}`);
  const auto = r.bereich ? entitaetenImBereich(h, r.bereich, ["sensor"]).filter((e) => h.states[e].attributes.device_class === dc && !geraetIst(e)) : [];
  const id = r[dc === "temperature" ? "temperatur" : "feuchte"] || auto[0];
  return id && h.states[id] ? h.states[id] : null;
}
// Geräte, die der Raum zeigt (eingestellte Liste bzw. Vorschlag, ohne Ausgeblendete)
function raumSichtbareGeraete(h, r) {
  return (r.geraete || raumGeraeteVorschlag(h, r.bereich)).filter((g) => g.an !== false && g.entity && h.states[g.entity]);
}
// Kandidaten für die vier Plätze: alles Steuerbare zuerst, Messwerte (Temperatur/Feuchte) nicht
function raumOrdnerKandidaten(h, r) {
  const alle = raumSichtbareGeraete(h, r);
  const istMess = (g) => domainVon(g.entity) === "sensor" && ["temperature", "humidity"].includes(h.states[g.entity].attributes.device_class);
  return [...alle.filter((g) => RO_WICHTIG.includes(domainVon(g.entity))), ...alle.filter((g) => !RO_WICHTIG.includes(domainVon(g.entity)) && !istMess(g))];
}
function raumOrdnerVier(h, r) {
  const k = raumOrdnerKandidaten(h, r);
  const gew = r.ordner?.geraete;
  if (Array.isArray(gew)) return gew.map((id) => k.find((g) => g.entity === id) || (h.states[id] ? { entity: id } : null)).filter(Boolean).slice(0, 4);
  return k.slice(0, 4);
}
function raumOrdnerZustand(h, r) {
  const o = r.ordner || {};
  const alle = raumSichtbareGeraete(h, r);
  const schaltbar = alle.filter((g) => Geraet.schaltbar(h.states[g.entity]) || domainVon(g.entity) === "climate");
  const an = schaltbar.filter((g) => Geraet.istAn(h.states[g.entity])).length;
  const offen = raumFensterGezeigt(h, r).map((e) => h.states[e]).filter((st) => st && st.state === "on" && ["window", "door", "opening", "garage_door"].includes(st.attributes.device_class));
  const klimas = [...new Set([...alle.map((g) => g.entity), ...(r.bereich ? entitaetenImBereich(h, r.bereich, ["climate"]) : [])])].filter((e) => domainVon(e) === "climate");
  const heizt = klimas.some((e) => h.states[e]?.attributes.hvac_action === "heating");
  const melder = [...new Set([...(r.bewegung || []), ...(r.bereich ? entitaetenImBereich(h, r.bereich, ["binary_sensor"]).filter((e) => ANWESEND_KLASSEN.includes(h.states[e].attributes.device_class)) : [])])];
  const belegt = melder.some((e) => h.states[e]?.state === "on");
  return {
    temp: o.temperatur !== false ? raumMesswert(h, r, "temperature") : null,
    feuchte: o.feuchte !== false ? raumMesswert(h, r, "humidity") : null,
    offen: o.fenster !== false ? offen : [], heizt, belegt, an, gesamt: schaltbar.length,
    ids: [...alle.map((g) => g.entity), ...raumFensterGezeigt(h, r), ...melder, ...klimas, raumMesswert(h, r, "temperature")?.entity_id, raumMesswert(h, r, "humidity")?.entity_id].filter(Boolean),
  };
}
const zahlDe = (v, stellen = 1) => Number(v).toLocaleString("de-DE", { minimumFractionDigits: stellen, maximumFractionDigits: stellen });
const tempText = (st) => (st && !isNaN(Number(st.state)) ? `${zahlDe(st.state, 1)}°` : "");
const feuchteText = (st) => (st && !isNaN(Number(st.state)) ? `${Math.round(Number(st.state))} %` : "");
// Gerätename ohne den Raumnamen davor („Wohnzimmer Decke“ → „Decke“)
function kurzName(st, x, raumName) {
  const n = x?.name || st?.attributes.friendly_name || x?.entity || "";
  if (!raumName) return n;
  const ohne = n.replace(new RegExp(`^${raumName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`, "i"), "").trim();
  return ohne ? ohne[0].toUpperCase() + ohne.slice(1) : n;
}
// Kurzer Zustand für die kleinen Kacheln
function kurzZustand(h, st) {
  const d = domainVon(st.entity_id), a = st.attributes;
  if (d === "climate") return st.state === "off" ? "Aus" : a.temperature != null ? `${zahlDe(a.temperature, Number.isInteger(Number(a.temperature)) ? 0 : 1)}°` : zustandText(h, st);
  if (["scene", "script", "button", "input_button"].includes(d)) return "Starten";
  if (d === "sensor" && !isNaN(Number(st.state))) return `${zahlDe(st.state, Number.isInteger(Number(st.state)) ? 0 : 1)}${a.unit_of_measurement === "°C" ? "°" : a.unit_of_measurement ? ` ${a.unit_of_measurement}` : ""}`;
  return Geraet.zustand(h, st, Geraet.regler(st));
}
// Kleine Gerätekachel (Symbol, Name, Zustand): Tippen schaltet, lange drücken öffnet die große Steuerung
function miniKachelHtml(h, x, raumName) {
  const st = h.states[x.entity], an = Geraet.istAn(st);
  const name = kurzName(st, x, raumName), z = kurzZustand(h, st);
  return `<button class="mk k ${an ? "an" : ""}" data-e="${esc(x.entity)}" aria-label="${esc(name)}: ${esc(z)}">
    <span class="mi" style="--sf:${farbeAus(x.farbe, Geraet.farbe(st))}"><ha-state-icon data-e="${esc(x.entity)}" ${x.icon ? `data-i="${esc(x.icon)}"` : ""}></ha-state-icon></span>
    <b>${esc(name)}</b><small>${esc(z)}</small></button>`;
}
function miniKachelnBinden(karte, liste) {
  karte.$$(".mk[data-e]").forEach((b) => {
    let t = null, lang = false;
    b.addEventListener("pointerdown", (ev) => { ev.stopPropagation(); lang = false; t = setTimeout(() => { lang = true; vibrieren(12); steuerungOeffnen(karte, b.dataset.e, liste.find((x) => x.entity === b.dataset.e) || {}); }, 480); });
    ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => b.addEventListener(ev, () => clearTimeout(t)));
    b.addEventListener("contextmenu", (ev) => ev.preventDefault());
    b.addEventListener("click", (ev) => {
      ev.stopPropagation();
      if (lang) return;
      const st = karte._hass.states[b.dataset.e];
      if (Geraet.schaltbar(st) || Geraet.ausloesbar(st)) { vibrieren(8); Geraet.schalten(karte._hass, st); } else steuerungOeffnen(karte, b.dataset.e, liste.find((x) => x.entity === b.dataset.e) || {});
    });
  });
}

const RAEUME_CSS = `
:host{display:block}
.mk{display:flex;flex-direction:column;align-items:flex-start;gap:1px;min-width:0;padding:8px;border-radius:16px;background:var(--g-fuell);color:var(--g-text);text-align:left;
  transition:background-color .2s ease,transform .16s cubic-bezier(.23,1,.32,1)}
.mk.an{background:var(--g-an);color:var(--g-text-an)}
.mi{width:28px;height:28px;margin-bottom:4px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(120,120,128,.2);color:var(--g-fuell-text)}
.mi ha-state-icon{--mdc-icon-size:17px}
.mk.an .mi{background:var(--sf);color:#fff}
.mk b{max-width:100%;font-size:var(--g-s-klein);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mk small{max-width:100%;font-size:12px;color:var(--g-text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-variant-numeric:tabular-nums}
.mk.an small{color:var(--g-text2-an)}
.titel{display:flex;align-items:center;justify-content:space-between;margin:var(--g-a4) var(--g-a1) var(--g-a2)}
.titel .rund{width:32px;height:32px}
.raeume{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;align-items:stretch}
@media (min-width:900px){.raeume{grid-template-columns:repeat(4,minmax(0,1fr))}}
.raum{position:relative;display:flex;flex-direction:column;gap:8px;min-width:0;padding:12px;border-radius:24px;cursor:pointer;
  transition:box-shadow .25s ease,transform .16s cubic-bezier(.23,1,.32,1)}
.raum.offen{box-shadow:inset 0 0 0 2px var(--g-akzent)}
.raum.heizt{box-shadow:inset 0 0 0 2px var(--g-orange)}
.raum.offen.heizt{box-shadow:inset 0 0 0 2px var(--g-akzent),0 0 0 2px var(--g-orange)}
.raum.gedrueckt{transform:scale(.97)}
.rk{display:flex;align-items:flex-start;gap:4px;padding:2px 2px 0;color:var(--g-text);text-align:left;width:100%}
.rname{flex:1;min-width:0;font-size:var(--g-s-text);font-weight:700;line-height:1.2;letter-spacing:-.3px;overflow-wrap:break-word}
.rname.lang{font-size:15px;letter-spacing:-.2px}
.rname.sehrlang{font-size:14px;letter-spacing:-.1px}
.rk ha-icon{margin-right:-4px}
.rk ha-icon{flex:none;color:var(--g-text2);--mdc-icon-size:20px}
.anw{flex:none;width:8px;height:8px;margin:7px 2px 0;border-radius:50%;background:var(--g-gruen)}
.rwerte{display:flex;flex-wrap:wrap;gap:4px 10px;padding:0 2px;font-size:var(--g-s-klein);font-weight:600;color:var(--g-text2);font-variant-numeric:tabular-nums}
.rwerte span{display:inline-flex;align-items:center;gap:2px}
.rwerte ha-icon{--mdc-icon-size:15px;opacity:.8}
.warn{display:flex;align-items:center;gap:4px;padding:0 2px;font-size:var(--g-s-klein);font-weight:600;color:var(--g-akzent-voll);min-width:0}
.warn span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.warn ha-icon{--mdc-icon-size:16px;flex:none}
:host([dunkel]) .warn{color:#64b5ff}
.rgrid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.rfuss{margin-top:auto;padding:0 4px;font-size:12px;font-weight:600;color:var(--g-text2)}
.bearb-hinweis{position:absolute;top:8px;right:8px;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--g-akzent-voll);color:#fff}
.bearb-hinweis ha-icon{--mdc-icon-size:17px}
.leer{padding:var(--g-a4);border-radius:var(--g-r);text-align:center}
`;

// ---------------------------------------------------------------------------
// glas-raeume-card: alle Räume als Ordner-Kacheln (liest die zentralen Einstellungen)
// ---------------------------------------------------------------------------
class GlasRaeumeCard extends GlasKarte {
  static standard() { return { titel: "Räume" }; }
  getGridOptions() { return { columns: 12, rows: "auto" }; }
  entitaeten() { return this._ids || []; }
  css() { return RAEUME_CSS; }
  html() {
    const h = this._hass, e = Glas.einst || {}, ro = raeumeOrdner(e);
    const raeume = (e.raeume || []).filter((r) => r.hash);
    const bearb = Glas.bearbeiten;
    const ids = [];
    let liste = raeume.map((r, i) => ({ r, i, z: raumOrdnerZustand(h, r) }));
    liste.forEach(({ z }) => ids.push(...z.ids));
    // Räume, in denen gerade jemand ist, rücken nach oben (Reihenfolge sonst wie eingestellt)
    if (ro.anwesenheit_oben !== false && !bearb) liste = [...liste.filter((x) => x.z.belegt), ...liste.filter((x) => !x.z.belegt)];
    const kopf = `<div class="titel"><h2 class="h2">${esc(this._config.titel || "Räume")}</h2>${bearb && istAdmin(h) ? `<button class="rund glas" data-einst aria-label="Räume und untere Leiste einstellen"><ha-icon data-i="mdi:cog-outline"></ha-icon></button>` : ""}</div>`;
    if (!liste.length) {
      this._ids = ids;
      return `${kopf}<div class="leer glas leise">Noch keine Räume. Lege sie unter Einstellungen › Räume an.</div>`;
    }
    const kacheln = liste.map(({ r, z }) => {
      const vier = raumOrdnerVier(h, r);
      ids.push(...vier.map((g) => g.entity));
      const offenText = z.offen.length === 1 ? `${kurzName(z.offen[0], null, r.name)} offen` : z.offen.length ? `${z.offen.length} Fenster/Türen offen` : "";
      const werte = [z.temp && tempText(z.temp) ? `<span><ha-icon data-i="mdi:thermometer"></ha-icon>${tempText(z.temp)}</span>` : "",
        z.feuchte && feuchteText(z.feuchte) ? `<span><ha-icon data-i="mdi:water-percent"></ha-icon>${feuchteText(z.feuchte)}</span>` : ""].join("");
      const zusatz = [z.offen.length ? offenText : "", z.heizt ? "Heizung läuft" : "", z.belegt ? "Jemand im Raum" : ""].filter(Boolean).join(", ");
      return `<div class="raum glas ${z.offen.length ? "offen" : ""} ${z.heizt ? "heizt" : ""}" data-h="${esc(r.hash)}">
        <button class="rk" data-auf aria-label="${esc(r.name || r.hash)} ${bearb ? "einstellen" : "öffnen"}${zusatz ? `. ${esc(zusatz)}` : ""}">
          <span class="rname ${(r.name || r.hash).length > 15 ? "sehrlang" : (r.name || r.hash).length > 10 ? "lang" : ""}">${esc(r.name || r.hash)}</span>${z.belegt ? `<span class="anw" aria-hidden="true" title="Jemand im Raum"></span>` : ""}<ha-icon data-i="mdi:chevron-right" aria-hidden="true"></ha-icon></button>
        ${werte ? `<div class="rwerte">${werte}</div>` : ""}
        ${offenText ? `<div class="warn"><ha-icon data-i="${z.offen.some((s) => s.attributes.device_class === "window") ? "mdi:window-open-variant" : "mdi:door-open"}"></ha-icon><span>${esc(offenText)}</span></div>` : ""}
        ${vier.length ? `<div class="rgrid">${vier.map((g) => miniKachelHtml(h, g, r.name)).join("")}</div>` : ""}
        ${z.gesamt ? `<div class="rfuss">${z.an} von ${z.gesamt} an</div>` : ""}
        ${bearb ? `<span class="bearb-hinweis" aria-hidden="true"><ha-icon data-i="mdi:tune-variant"></ha-icon></span>` : ""}</div>`;
    }).join("");
    this._ids = [...new Set(ids)];
    return `${kopf}<div class="raeume">${kacheln}</div>`;
  }
  binden() {
    this.iconsSetzen();
    const e = Glas.einst || {};
    this.$("[data-einst]")?.addEventListener("click", () => raeumeEinstMenue(this));
    this.$$(".raum").forEach((k) => {
      const r = (e.raeume || []).find((x) => x.hash === k.dataset.h);
      if (!r) return;
      miniKachelnBinden(this, raumOrdnerVier(this._hass, r));
      const auf = () => {
        if (Glas.bearbeiten) { if (istAdmin(this._hass)) ordnerKachelMenue(this, r.hash); return; }
        vibrieren(8);
        Glas.raumHerkunft = { hash: r.hash, el: () => this.shadowRoot.querySelector(`.raum[data-h="${CSS.escape(r.hash)}"]`), zeit: Date.now() };
        hashOeffnen(r.hash);
      };
      // Lange drücken (Admins): Ordner-Kachel einstellen
      let t = null, lang = false;
      k.addEventListener("pointerdown", (ev) => {
        if (ev.button > 0) return;
        lang = false; k.classList.add("gedrueckt");
        if (istAdmin(this._hass)) t = setTimeout(() => { lang = true; k.classList.remove("gedrueckt"); vibrieren(12); ordnerKachelMenue(this, r.hash); }, 520);
      });
      ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => k.addEventListener(ev, () => { clearTimeout(t); k.classList.remove("gedrueckt"); }));
      k.addEventListener("contextmenu", (ev) => ev.preventDefault());
      k.addEventListener("click", (ev) => { if (lang || ev.target.closest?.(".mk")) return; auf(); });
    });
  }
}

// ---------------------------------------------------------------------------
// glas-favordner-card: die Favoriten als Ordner oben (vier direkt, Rest im Blatt)
// ---------------------------------------------------------------------------
const FAVORDNER_CSS = `
.fav{display:flex;flex-direction:column;gap:10px;padding:12px;border-radius:24px}
.fk{display:flex;align-items:center;justify-content:space-between;gap:var(--g-a2);padding:2px 4px 0;color:var(--g-text);width:100%;text-align:left}
.fn{display:flex;align-items:center;gap:6px;font-size:var(--g-s-text);font-weight:700}
.fn ha-icon{color:#ff9f0a;--mdc-icon-size:22px}
.fz{display:flex;align-items:center;font-size:var(--g-s-name);font-weight:600;color:var(--g-text2)}
.fz ha-icon{--mdc-icon-size:20px}
.fgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
@media (min-width:900px){.fgrid{grid-template-columns:repeat(8,minmax(0,1fr))}}
`;
const FAV_BLATT_CSS = `.fav-raster{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:var(--g-a2)}.fav-raster > *{min-width:0}`;
class GlasFavordnerCard extends GlasKarte {
  static standard() { return { favoriten: [] }; }
  getGridOptions() { return { columns: 12, rows: "auto" }; }
  entitaeten() { return this.direkt().map((f) => f.entity); }
  sichtbar() { return (this._config.favoriten || []).filter((f) => f.an !== false && (f.entity || f.ordner || listenKarte(f.karte))); }
  direkt() { const h = this._hass; return this.sichtbar().filter((f) => f.entity && h.states[f.entity]).slice(0, SCHICHT_BREIT.matches ? 8 : 4); }
  css() { return RAEUME_CSS + FAVORDNER_CSS; }
  html() {
    const h = this._hass, alle = this.sichtbar(), d = this.direkt();
    if (!alle.length) return "";
    return `<div class="fav glas"><button class="fk" data-auf aria-haspopup="dialog" aria-label="Alle ${alle.length} Favoriten öffnen">
      <span class="fn"><ha-icon data-i="mdi:star"></ha-icon>Favoriten</span><span class="fz">${alle.length}<ha-icon data-i="mdi:chevron-right"></ha-icon></span></button>
      ${d.length ? `<div class="fgrid">${d.map((f) => miniKachelHtml(h, f, "")).join("")}</div>` : ""}</div>`;
  }
  binden() {
    this.iconsSetzen();
    miniKachelnBinden(this, this.direkt());
    this.$("[data-auf]")?.addEventListener("click", () => this.blattOeffnen());
  }
  // Alle Favoriten in voller Größe (wie bisher auf der Startseite), auch Ordner und ganze Karten
  blattOeffnen() {
    const h = this._hass, kinder = [];
    const neu = () => kinder.forEach((k) => { k.hass = Glas.hass; });
    const s = new GlasSchicht({ quelle: this, hoch: true, titel: "Favoriten", zu: () => Glas.hassHoerer.delete(neu) });
    s.dunkel(istDunkel(h));
    s.inhalt.innerHTML = `<style>${FAV_BLATT_CSS}</style>${s.kopfHtml("Favoriten", `${this.sichtbar().length} Einträge`)}<div class="fav-raster"></div>`;
    s.kopfBinden();
    const raster = s.inhalt.querySelector(".fav-raster");
    this.sichtbar().forEach((f) => {
      const kk = f.karte && listenKarte(f.karte);
      const tag = kk ? kk[3] : f.ordner ? "glas-ordner-card" : "glas-kachel-card";
      const cfg = kk ? (({ type, ...r }) => r)(listenKarteCfg(f)) : f.ordner ? ordnerCfg(f) : kachelCfg(f);
      const el = document.createElement(tag);
      try { el.setConfig(cfg); } catch (_) { return; }
      el.hass = h;
      const z = document.createElement("div");
      z.style.gridColumn = `span ${SPANNE[f.groesse || "breit"] || 6}`;
      z.appendChild(el);
      raster.appendChild(z);
      kinder.push(el);
    });
    Glas.hassHoerer.add(neu);
    s.oeffnen();
  }
}

// ---------------------------------------------------------------------------
// Untere Leiste im Ordner-Stil: vier Plätze statt der Raumknöpfe
// ---------------------------------------------------------------------------
const LEISTE_ORDNER_CSS = `
.fest.ordner .leiste{height:auto;min-height:76px;padding:12px 6px 8px;border-radius:30px;display:grid;grid-template-columns:repeat(var(--n,4),minmax(0,1fr));gap:2px}
.fest.ordner .kz-griff{bottom:56px}
.fest.ordner .kz-tipp{bottom:100px}
.fest.ordner .kz-clip,.fest.ordner .kz-panel{border-radius:30px}
.platz{display:flex;flex-direction:column;align-items:center;gap:1px;min-width:0;min-height:56px;padding:2px;border-radius:18px;color:var(--g-text);transition:transform .16s cubic-bezier(.23,1,.32,1)}
.platz:active{transform:scale(.94)}
.li{position:relative;width:34px;height:34px;margin-bottom:2px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(10,132,255,.14);color:var(--g-akzent)}
.li ha-icon{--mdc-icon-size:21px}
.li em{position:absolute;top:-4px;right:-7px;min-width:18px;height:18px;padding:0 4px;border-radius:9px;background:var(--g-rot-voll);color:#fff;font-size:11px;font-style:normal;font-weight:700;display:flex;align-items:center;justify-content:center}
.platz b{max-width:100%;font-size:var(--g-s-name);font-weight:700;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-variant-numeric:tabular-nums}
.platz small{max-width:100%;font-size:var(--g-s-mini);color:var(--g-text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.im-kz .platz{color:#fff}
.im-kz .platz small{color:rgba(255,255,255,.7)}
.im-kz .li{background:rgba(255,255,255,.16);color:#fff}
`;
// Planer-Karte als unsichtbare Datenquelle (Aufgaben, Termine) – wie beim Planer-Widget
function leistePlaner(leiste) {
  const cfg = Glas.einst?.bereiche?.planer || {};
  const json = JSON.stringify(cfg);
  let p = leiste._planer;
  if (!p || p._json !== json) {
    p = document.createElement("glas-planer-card");
    try { p.setConfig(cfg); } catch (_) { return null; }
    p._json = json;
    const orig = p.render.bind(p);
    p.render = () => { orig(); leiste._planerNeu?.(); };
    const ot = p.termineLaden.bind(p);
    p.termineLaden = () => ot().then(() => leiste._planerNeu?.());
    leiste._planer = p;
  }
  if (p._hass !== leiste._hass) p.hass = leiste._hass;
  return p;
}
function naechsterTermin(p) {
  const jetzt = new Date();
  const heute0 = new Date(); heute0.setHours(0, 0, 0, 0);
  const l = (p?._termine || []).filter((t) => (t.ganztag ? t.ende > jetzt && t.start >= heute0 : t.ende > jetzt)).sort((a, b) => a.start - b.start);
  return l.find((t) => !t.ganztag && t.start >= heute0) || l[0] || null;
}
function terminZeit(t) {
  const heute = isoTag(new Date()), tag = isoTag(t.start);
  const morgen = heuteIso(1);
  const vorne = tag === heute ? "" : tag === morgen ? "Morgen " : `${TAGE[t.start.getDay()]} `;
  if (t.ganztag) return tag === heute ? "Heute" : vorne.trim();
  return `${vorne}${uhr(t.start)}`;
}
function leistePlatzHtml(leiste, id) {
  const h = leiste._hass, b = Glas.einst?.bereiche || {};
  const platz = (icon, gross, klein, label, badge) => `<button class="platz" data-platz="${id}" aria-label="${esc(label)}">
    <span class="li"><ha-icon data-i="${icon}"></ha-icon>${badge ? `<em aria-hidden="true">${badge}</em>` : ""}</span><b>${esc(gross)}</b>${klein ? `<small>${esc(klein)}</small>` : ""}</button>`;
  if (id === "wetter") {
    const e = b.wetter?.entity || Object.keys(h.states).find((x) => x.startsWith("weather.")), st = e && h.states[e];
    if (!st) return platz("mdi:weather-partly-cloudy", "Wetter", "", "Wetter");
    const [text, icon] = WETTER[st.state] || [zustandText(h, st), "mdi:weather-partly-cloudy"];
    const t = st.attributes.temperature;
    return platz(icon, t != null ? `${Math.round(t)}°` : text, "Wetter", `Wetter: ${t != null ? `${Math.round(t)} Grad, ` : ""}${text}`);
  }
  if (id === "planer" || id === "termin") {
    const p = b.planer?.an === false ? null : leistePlaner(leiste);
    if (id === "planer") {
      const n = p ? p.aufgaben(Glas.aktuellePerson(h)).filter((a) => a.status === "offen").length : 0;
      return platz("mdi:format-list-checks", "Planer", p?._daten ? (n ? `${n} offen` : "Alles erledigt") : "", `Planer, ${n} offene Aufgaben`, n ? (n > 9 ? "9+" : n) : "");
    }
    const t = naechsterTermin(p);
    return platz("mdi:calendar-blank-outline", t ? terminZeit(t) : "Kalender", t ? t.titel : "Nichts geplant", t ? `Nächster Termin ${terminZeit(t)}: ${t.titel}` : "Kalender, nichts geplant");
  }
  if (id === "suche") return platz("mdi:magnify", "Suche", "Räume, Geräte", "Suche");
  if (id === "sicherheit") {
    const alarm = b.sicherheit?.alarm || Object.keys(h.states).find((x) => x.startsWith("alarm_control_panel."));
    const al = alarm && h.states[alarm];
    const offen = Object.keys(h.states).filter((x) => x.startsWith("binary_sensor.") && ["window", "door", "garage_door", "opening"].includes(h.states[x].attributes.device_class) && h.states[x].state === "on" && !(b.sicherheit?.ausgeblendet || []).includes(x)).length;
    return platz(al && al.state !== "disarmed" ? "mdi:shield-lock" : "mdi:shield-home-outline", al ? (al.state === "disarmed" ? "Aus" : "Scharf") : "Zuhause", offen ? `${offen} offen` : "Alles zu", `Sicherheit: ${al ? (al.state === "disarmed" ? "Alarm aus" : "Alarm scharf") : ""}, ${offen ? `${offen} offen` : "alles zu"}`);
  }
  if (id === "drucker") {
    const w = (leiste._drucker = leiste._drucker || (() => { const d = document.createElement("glas-drucker-card"); try { d.setConfig(b.drucker || {}); } catch (_) { return null; } return d; })());
    if (w && w._hass !== h) w.hass = h;
    const v = w?.werte?.();
    const pct = v?.laeuft && v.pct != null ? `${Math.round(v.pct)} %` : null;
    return platz("mdi:printer-3d-nozzle", pct || b.drucker?.name || "Drucker", pct ? b.drucker?.name || "Drucker" : v?.status || "", `${b.drucker?.name || "Drucker"}: ${pct || v?.status || ""}`);
  }
  if (id === "robi") {
    const e = b.robi?.entity || Object.keys(h.states).find((x) => x.startsWith("vacuum.")), st = e && h.states[e];
    const s = st ? ROBI_STATUS[st.state] || zustandText(h, st) : "Nicht da";
    return platz("mdi:robot-vacuum", b.robi?.name || "Robi", s, `${b.robi?.name || "Robi"}: ${s}`);
  }
  return "";
}
function leistePlaetze(e) { return (raeumeOrdner(e).leiste || RO_STANDARD.leiste).filter((id) => RO_PLAETZE.some(([k]) => k === id)).slice(0, 4); }
function leistePlatzOeffnen(leiste, id) {
  const b = Glas.einst?.bereiche || {}, h = leiste._hass;
  vibrieren(8);
  if (id === "suche") return sucheOeffnen(leiste);
  if (id === "termin" || id === "planer") {
    const c = b.planer || {};
    const el = document.createElement("glas-planer-card");
    try { el.setConfig(c); } catch (_) { return; }
    // Termin: gleich auf der Seite „Kalender“ starten
    if (id === "termin") el._seite = c.seite_planer === false ? 0 : c.seite_kalender === false ? 0 : 1;
    el.hass = h;
    const neu = () => { el.hass = Glas.hass; };
    const s = new GlasSchicht({ quelle: leiste, titel: id === "termin" ? "Kalender" : "Planer", zu: () => Glas.hassHoerer.delete(neu) });
    s.dunkel(istDunkel(h));
    s.inhalt.innerHTML = s.kopfHtml(id === "termin" ? "Kalender" : "Planer", "");
    s.kopfBinden();
    s.inhalt.appendChild(el);
    Glas.hassHoerer.add(neu);
    s.oeffnen();
    return;
  }
  const w = document.createElement("glas-widget-card");
  w.setConfig({ art: id });
  w._hass = h;
  w.oeffnen();
}

// ---------------------------------------------------------------------------
// Suche: Räume und Geräte finden (antippen öffnet Raum bzw. Steuerung)
// ---------------------------------------------------------------------------
const SUCHE_CSS = `
.suchfeld{display:flex;align-items:center;gap:var(--g-a2);min-height:44px;padding:0 var(--g-a3);border-radius:var(--g-r-klein);background:var(--g-fuell);color:var(--g-text2)}
.suchfeld input{flex:1;min-width:0;border:0;background:none;font:inherit;font-size:17px;color:var(--g-text);outline:none}
.treffer{display:flex;flex-direction:column;border-radius:var(--g-r);overflow:hidden}
.treffer button{display:flex;align-items:center;gap:var(--g-a3);min-height:52px;padding:6px var(--g-a3);text-align:left;color:var(--g-text);width:100%}
.treffer button + button{border-top:1px solid var(--g-trenn)}
.treffer .sym{flex:none;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--g-fuell)}
.treffer .sym ha-icon,.treffer .sym ha-state-icon{--mdc-icon-size:18px}
.treffer span.t{display:flex;flex-direction:column;min-width:0;flex:1}
.treffer b{font-size:var(--g-s-name);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.treffer small{font-size:var(--g-s-klein);color:var(--g-text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gruppe-t{margin:var(--g-a2) var(--g-a1) 0;font-size:var(--g-s-klein);font-weight:700;letter-spacing:.3px;text-transform:uppercase;color:var(--g-text2)}
`;
function sucheOeffnen(quelle) {
  const h = Glas.hass, e = Glas.einst || {};
  const s = new GlasSchicht({ quelle, hoch: true, titel: "Suche" });
  s.dunkel(istDunkel(h));
  s.inhalt.innerHTML = `<style>${SUCHE_CSS}</style>${s.kopfHtml("Suche", "")}
    <label class="suchfeld"><ha-icon data-i="mdi:magnify"></ha-icon><input type="search" placeholder="Raum oder Gerät" aria-label="Raum oder Gerät suchen" enterkeyhint="search" autocomplete="off"></label>
    <div data-erg></div>`;
  s.kopfBinden();
  s.inhalt.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
  const raumVon = (eid) => (e.raeume || []).find((r) => (r.bereich && bereichVon(h, eid) === r.bereich) || (r.geraete || []).some((g) => g.entity === eid));
  const norm = (t) => String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const zeigen = (q) => {
    const erg = s.inhalt.querySelector("[data-erg]");
    const w = norm(q).trim();
    if (!w) { erg.innerHTML = `<div class="leise" style="padding:0 4px">Tippe einen Namen, z. B. „Decke“ oder „Küche“.</div>`; return; }
    const raeume = (e.raeume || []).filter((r) => r.hash && norm(r.name).includes(w));
    const geraete = Object.values(h.states).filter((st) => [...RO_WICHTIG, "sensor", "binary_sensor", "scene", "script", "camera"].includes(domainVon(st.entity_id))
      && !h.entities?.[st.entity_id]?.hidden && !h.entities?.[st.entity_id]?.entity_category
      && (norm(st.attributes.friendly_name).includes(w) || norm(raumVon(st.entity_id)?.name).includes(w))).slice(0, 40);
    erg.innerHTML = `${raeume.length ? `<div class="gruppe-t">Räume</div><div class="treffer glas">${raeume.map((r) => `<button data-raum="${esc(r.hash)}"><span class="sym"><ha-icon data-i="${esc(r.icon || "mdi:door")}"></ha-icon></span><span class="t"><b>${esc(r.name)}</b></span></button>`).join("")}</div>` : ""}
      ${geraete.length ? `<div class="gruppe-t">Geräte</div><div class="treffer glas">${geraete.map((st) => `<button data-e="${esc(st.entity_id)}"><span class="sym"><ha-state-icon data-e="${esc(st.entity_id)}"></ha-state-icon></span>
        <span class="t"><b>${esc(st.attributes.friendly_name || st.entity_id)}</b><small>${esc([raumVon(st.entity_id)?.name, kurzZustand(h, st)].filter(Boolean).join(" · "))}</small></span></button>`).join("")}</div>` : ""}
      ${!raeume.length && !geraete.length ? `<div class="leise" style="padding:0 4px">Nichts gefunden.</div>` : ""}`;
    erg.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
    erg.querySelectorAll("ha-state-icon[data-e]").forEach((el) => { el.hass = h; el.stateObj = h.states[el.dataset.e]; });
    erg.querySelectorAll("[data-raum]").forEach((b) => b.addEventListener("click", () => { s.schliessen(); setTimeout(() => hashOeffnen(b.dataset.raum), 120); }));
    erg.querySelectorAll("[data-e]").forEach((b) => b.addEventListener("click", () => steuerungOeffnen(quelle, b.dataset.e, {})));
  };
  const inp = s.inhalt.querySelector("input");
  inp.addEventListener("input", () => zeigen(inp.value));
  zeigen("");
  s.oeffnen();
  setTimeout(() => inp.focus({ preventScroll: true }), 380);
}

// ---------------------------------------------------------------------------
// Einstellungen: Ordner-Kachel eines Raums (Werte, vier Geräte per Ziehen sortiert)
// ---------------------------------------------------------------------------
const OK_CSS = `
.liste{display:flex;flex-direction:column;border-radius:var(--g-r-klein);overflow:hidden}
.zeile{display:flex;align-items:center;gap:var(--g-a3);min-height:52px;padding:0 var(--g-a2) 0 var(--g-a3);background:transparent;touch-action:pan-y}
.zeile + .zeile{border-top:1px solid var(--g-trenn)}
.zeile.zieht{position:relative;z-index:2;background:var(--g-an);box-shadow:0 8px 24px rgba(0,0,0,.18);border-radius:var(--g-r-klein)}
.ck{flex:none;width:26px;height:26px;border-radius:50%;border:2px solid var(--g-text2);opacity:.9;display:flex;align-items:center;justify-content:center;color:#fff}
.ck[aria-checked="true"]{background:var(--g-akzent-voll);border-color:var(--g-akzent-voll)}
.ck ha-icon{--mdc-icon-size:16px}
.ck[aria-checked="false"] ha-icon{visibility:hidden}
.zeile .sym{flex:none;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--g-fuell)}
.zeile .sym ha-state-icon{--mdc-icon-size:18px}
.zeile .n{flex:1;min-width:0;font-size:var(--g-s-name);color:var(--g-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pos{flex:none;min-width:16px;font-size:var(--g-s-klein);font-weight:700;color:var(--g-akzent-voll);text-align:right}
:host([dunkel]) .pos,.wurzel.dunkel .pos{color:#64b5ff}
.griff2{flex:none;width:44px;height:44px;display:flex;align-items:center;justify-content:center;color:var(--g-text2);touch-action:none;cursor:grab;border-radius:12px}
.griff2 ha-icon{--mdc-icon-size:20px}
.wert{margin-left:auto;margin-right:var(--g-a2);font-size:var(--g-s-klein);color:var(--g-text2);white-space:nowrap}
.haken .lbl{display:flex;align-items:center;gap:var(--g-a2)}
.haken .lbl ha-icon{--mdc-icon-size:20px;color:var(--g-akzent)}
.platz-wahl{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:var(--g-a2) var(--g-a3)}
.platz-wahl label{font-size:var(--g-s-name);color:var(--g-text)}
.platz-wahl select{min-height:44px;padding:0 var(--g-a3);border-radius:var(--g-r-klein);border:1px solid var(--g-glas-rand);background:var(--g-fuell);color:var(--g-text);font:inherit;font-size:16px}
`;
// Raum in den Einstellungen ändern (verzögert speichern, damit Tippen flüssig bleibt)
function raumAendern(hash, fn) {
  if (!Glas.einst) return;
  const e = kopieJ(Glas.einst), r = (e.raeume || []).find((x) => x.hash === hash);
  if (!r) return;
  fn(r, e);
  clearTimeout(raumAendern._t);
  Glas.einst = e; Glas.melden();
  raumAendern._t = setTimeout(() => Glas.einstSpeichern(Glas.hass, Glas.einst).catch((err) => console.error("Glas: speichern", err)), 350);
}
function ordnerKachelMenue(quelle, hash) {
  const h = Glas.hass;
  const r0 = (Glas.einst?.raeume || []).find((r) => r.hash === hash);
  if (!r0) return;
  const s = new GlasSchicht({ quelle, hoch: true, titel: `${r0.name} – Ordner-Kachel` });
  s.dunkel(istDunkel(h));
  const o = { ...(r0.ordner || {}) };
  const kand = raumOrdnerKandidaten(h, r0);
  let gewaehlt = raumOrdnerVier(h, r0).map((g) => g.entity);
  // Reihenfolge der Liste: Gewählte vorne (in ihrer Reihenfolge), dann der Rest
  let reihe = [...gewaehlt, ...kand.map((g) => g.entity).filter((x) => !gewaehlt.includes(x))];
  const temp = raumMesswert(h, r0, "temperature"), feuchte = raumMesswert(h, r0, "humidity");
  const schalter = (k, icon, name, wert) => `<button class="haken" role="switch" data-k="${k}" aria-checked="${o[k] !== false}"><span class="lbl"><ha-icon data-i="${icon}"></ha-icon>${name}</span>
    ${wert ? `<span class="wert">${esc(wert)}</span>` : ""}<span class="sw" aria-hidden="true"></span></button>`;
  s.inhalt.innerHTML = `<style>${MENUE_CSS}${OK_CSS}</style>${s.kopfHtml(r0.name, "Ordner-Kachel einstellen")}
    <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:eye-outline"></ha-icon>Werte in der Kachel</div>
      ${schalter("temperatur", "mdi:thermometer", "Temperatur", temp ? `${temp.attributes.friendly_name || ""} · ${tempText(temp)}` : "kein Sensor")}
      ${schalter("feuchte", "mdi:water-percent", "Luftfeuchtigkeit", feuchte ? `${feuchte.attributes.friendly_name || ""} · ${feuchteText(feuchte)}` : "kein Sensor")}
      ${schalter("fenster", "mdi:window-open-variant", "Offene Fenster/Türen", "")}
      <div class="m-hinweis">Welche Sensoren das sind, stellst du wie bisher im Raum über das Zahnrad ein (Kopfzeile: Messwerte, Fenster und Türen).</div></div>
    <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:view-grid-outline"></ha-icon>Direkt in der Kachel (bis zu 4)</div>
      <div class="liste" role="list"></div>
      <div class="m-hinweis">Antippen wählt aus, am Griff ziehen ändert die Reihenfolge. Die Liste zeigt alle Geräte, die im Raum sichtbar sind.</div></div>`;
  s.kopfBinden();
  s.inhalt.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
  const speichern = () => raumAendern(hash, (r) => {
    const neu = { ...o, geraete: [...gewaehlt] };
    ["temperatur", "feuchte", "fenster"].forEach((k) => { if (neu[k] !== false) delete neu[k]; });
    r.ordner = neu;
  });
  s.inhalt.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("click", () => {
    const k = b.dataset.k; o[k] = o[k] === false; b.setAttribute("aria-checked", o[k] !== false); speichern();
  }));
  const liste = s.inhalt.querySelector(".liste");
  const zeichnen = () => {
    liste.innerHTML = reihe.map((eid) => {
      const st = h.states[eid], i = gewaehlt.indexOf(eid);
      const name = kurzName(st, kand.find((g) => g.entity === eid), r0.name);
      return `<div class="zeile" role="listitem" data-e="${esc(eid)}">
        <button class="ck" role="checkbox" aria-checked="${i >= 0}" aria-label="${esc(name)} in der Kachel zeigen"><ha-icon data-i="mdi:check"></ha-icon></button>
        <span class="sym"><ha-state-icon data-e="${esc(eid)}"></ha-state-icon></span><span class="n">${esc(name)}</span>
        <span class="pos" aria-hidden="true">${i >= 0 ? i + 1 : ""}</span>
        <span class="griff2" tabindex="0" role="button" aria-label="${esc(name)} verschieben, Pfeiltasten hoch und runter"><ha-icon data-i="mdi:drag"></ha-icon></span></div>`;
    }).join("") || `<div class="leise" style="padding:12px">In diesem Raum gibt es keine steuerbaren Geräte.</div>`;
    liste.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
    liste.querySelectorAll("ha-state-icon[data-e]").forEach((el) => { el.hass = h; el.stateObj = h.states[el.dataset.e]; });
    liste.querySelectorAll(".zeile").forEach((z) => {
      const eid = z.dataset.e;
      z.querySelector(".ck").addEventListener("click", () => {
        if (gewaehlt.includes(eid)) gewaehlt = gewaehlt.filter((x) => x !== eid);
        else if (gewaehlt.length >= 4) { vibrieren(30); z.animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }], { duration: 240 }); return; }
        else gewaehlt.push(eid);
        reihe = [...gewaehlt, ...reihe.filter((x) => !gewaehlt.includes(x))];
        zeichnen(); speichern();
      });
      const griff = z.querySelector(".griff2");
      griff.addEventListener("keydown", (ev) => {
        if (ev.key !== "ArrowUp" && ev.key !== "ArrowDown") return;
        ev.preventDefault();
        const i = reihe.indexOf(eid), j = klemmen(i + (ev.key === "ArrowUp" ? -1 : 1), 0, reihe.length - 1);
        if (i === j) return;
        reihe = verschiebenListe(reihe, i, j); nachZiehen();
        liste.querySelector(`.zeile[data-e="${CSS.escape(eid)}"] .griff2`)?.focus();
      });
      // Ziehen am Griff: Zeile folgt dem Finger, die anderen rücken weich nach
      griff.addEventListener("pointerdown", (ev) => {
        ev.preventDefault();
        const zeilen = [...liste.querySelectorAll(".zeile")], hoehe = z.offsetHeight + 1, start = ev.clientY, von = zeilen.indexOf(z);
        let nach = von;
        z.classList.add("zieht");
        try { griff.setPointerCapture(ev.pointerId); } catch (_) { /* */ }
        const bewegen = (m) => {
          const dy = m.clientY - start;
          z.style.transform = `translateY(${dy}px)`;
          nach = klemmen(von + Math.round(dy / hoehe), 0, zeilen.length - 1);
          zeilen.forEach((x, k) => {
            if (x === z) return;
            const ver = von < nach && k > von && k <= nach ? -hoehe : von > nach && k < von && k >= nach ? hoehe : 0;
            x.style.transition = "transform .2s cubic-bezier(.23,1,.32,1)"; x.style.transform = ver ? `translateY(${ver}px)` : "";
          });
        };
        const los = () => {
          griff.removeEventListener("pointermove", bewegen); griff.removeEventListener("pointerup", los); griff.removeEventListener("pointercancel", los);
          zeilen.forEach((x) => { x.style.transform = ""; x.style.transition = ""; });
          z.classList.remove("zieht");
          if (nach !== von) { vibrieren(8); reihe = verschiebenListe(reihe, von, nach); nachZiehen(); }
        };
        griff.addEventListener("pointermove", bewegen); griff.addEventListener("pointerup", los); griff.addEventListener("pointercancel", los);
      });
    });
  };
  // Nach dem Verschieben: die obersten gewählten bleiben gewählt, Reihenfolge = Listenreihenfolge
  const nachZiehen = () => { gewaehlt = reihe.filter((x) => gewaehlt.includes(x)); reihe = [...gewaehlt, ...reihe.filter((x) => !gewaehlt.includes(x))]; zeichnen(); speichern(); };
  zeichnen();
  s.oeffnen();
}
function verschiebenListe(l, von, nach) { const k = [...l]; const [x] = k.splice(von, 1); k.splice(nach, 0, x); return k; }

// ---------------------------------------------------------------------------
// Einstellungen: Räume als Ordner an/aus, Anwesenheit, Plätze der unteren Leiste
// ---------------------------------------------------------------------------
function raeumeEinstMenue(quelle, nachher) {
  const h = Glas.hass;
  if (!Glas.einst) return;
  const ro = raeumeOrdner(Glas.einst);
  const s = new GlasSchicht({ quelle, hoch: true, titel: "Räume als Ordner", zu: () => nachher?.() });
  s.dunkel(istDunkel(h));
  const plaetze = [...leistePlaetze(Glas.einst)];
  while (plaetze.length < 4) plaetze.push("-");
  s.inhalt.innerHTML = `<style>${MENUE_CSS}${OK_CSS}</style>${s.kopfHtml("Räume als Ordner", "Startseite und untere Leiste")}
    <div class="m-gruppe glas">
      <button class="haken" role="switch" data-k="an" aria-checked="${ro.an !== false}">Räume als Ordner auf der Startseite<span class="sw" aria-hidden="true"></span></button>
      <button class="haken" role="switch" data-k="anwesenheit_oben" aria-checked="${ro.anwesenheit_oben !== false}">Räume mit Anwesenheit nach oben<span class="sw" aria-hidden="true"></span></button>
      <div class="m-hinweis">Aus: Startseite und Raumleiste wie bisher. Anwesenheit kommt von den Bewegungs- und Präsenzmeldern im Raum.</div></div>
    <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:dock-bottom"></ha-icon>Untere Leiste</div>
      <div class="platz-wahl">${plaetze.map((p, i) => `<label for="pl${i}">Platz ${i + 1}</label><select id="pl${i}" data-i="${i}">
        <option value="-" ${p === "-" ? "selected" : ""}>Leer</option>${RO_PLAETZE.map(([id, n]) => `<option value="${id}" ${p === id ? "selected" : ""}>${n}</option>`).join("")}</select>`).join("")}</div>
      <div class="m-hinweis">Was in der Leiste steht, erscheint nicht noch einmal als Karte auf der Startseite (Wetter, Planer). Hochziehen öffnet weiter das Kontrollzentrum.</div></div>
    <div class="m-gruppe glas"><div class="m-hinweis">Welche vier Geräte, Temperatur und Fenster ein Raum zeigt, stellst du direkt an der Raum-Kachel ein: lange drücken oder im Bearbeiten-Modus antippen.</div></div>`;
  s.kopfBinden();
  s.inhalt.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
  const speichern = () => {
    const e = kopieJ(Glas.einst);
    e.raeume_ordner = { ...ro, leiste: plaetze.filter((p) => p !== "-") };
    nachher?.(e.raeume_ordner, true);
    Glas.einstSpeichern(h, e).catch((err) => console.error("Glas: speichern", err));
  };
  s.inhalt.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("click", () => {
    const k = b.dataset.k; ro[k] = ro[k] === false; b.setAttribute("aria-checked", ro[k] !== false); speichern();
  }));
  s.inhalt.querySelectorAll("select[data-i]").forEach((sel) => sel.addEventListener("change", () => { plaetze[Number(sel.dataset.i)] = sel.value; speichern(); }));
  s.oeffnen();
}
