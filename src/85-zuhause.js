// ---------------------------------------------------------------------------
// glas-zuhause-card: das ganze Dashboard aus den zentralen Einstellungen.
// Kopf, Startseite der gewählten Person, Raumleiste und Raum-Blätter, mit Hintergrund.
// ---------------------------------------------------------------------------
const ZUHAUSE_CSS = `
:host{display:block;position:relative;min-height:100vh;min-height:100dvh}
.hg{position:fixed;inset:0;z-index:0;pointer-events:none}
.seite{position:relative;z-index:1;max-width:1320px;margin:0 auto;
  padding:var(--g-a4) var(--g-a4) calc(120px + env(safe-area-inset-bottom))}
.raster{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:var(--g-a2);margin-top:var(--g-a3);align-items:start}
.raster > *{grid-column:span 12;min-width:0}
.raster > .halb{grid-column:span 6}
.abschnitt-titel{grid-column:span 12;margin:var(--g-a4) var(--g-a1) var(--g-a1)}
.fav{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:var(--g-a2)}
.fav > *{min-width:0}
.leer{max-width:520px;margin:12vh auto 0;padding:var(--g-a5);border-radius:var(--g-r);text-align:center;color:var(--g-text)}
.leer h2{margin:0 0 var(--g-a2);font-size:var(--g-s-h2)}
.leer p{margin:0 0 var(--g-a4);color:var(--g-text2);font-size:var(--g-s-name);line-height:1.45}
.leer a{display:inline-flex;align-items:center;min-height:44px;padding:0 var(--g-a5);border-radius:var(--g-r-pille);background:var(--g-akzent-voll);color:#fff;font-weight:600;text-decoration:none}
.unsichtbar{display:none}
.warn-platz{width:100%;margin-top:var(--g-a3);text-align:left;font:inherit}
.warn-platz.aus{opacity:.5}
.platzhalter ha-icon{flex:none}
glas-hinweise-card:not([leer]){margin-top:var(--g-a3)}
`;
const SPANNE = { klein: 3, breit: 6, gross: 6, ganz: 12 };

class GlasZuhauseCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._kinder = new Map(); // Schlüssel → Element (wird wiederverwendet, damit nichts flackert)
    this._hoerer = () => this.aufbauen();
  }
  setConfig(c) { this._config = c || {}; this.aufbauen(); }
  getCardSize() { return 12; }
  getGridOptions() { return { columns: 12, rows: "auto" }; }
  connectedCallback() {
    Glas.hoerer.add(this._hoerer);
    this.themaSetzen(true);
    this._takt = setInterval(() => this.hintergrund(), 10 * 60e3);
    this.aufbauen();
  }
  disconnectedCallback() { Glas.hoerer.delete(this._hoerer); clearInterval(this._takt); this.themaSetzen(false); }
  // Wie das bisherige Glas-Thema: gläserne Kopfleiste, normale HA-Karten rund und durchscheinend
  themaSetzen(an) {
    const d = istDunkel(this._hass), r = document.documentElement.style;
    const werte = { "--app-header-background-color": d ? "rgba(22,22,28,.7)" : "rgba(246,246,250,.7)", "--app-header-text-color": d ? "#f2f2f7" : "#1c1c1e",
      "--ha-card-border-radius": "22px", "--ha-card-background": d ? "rgba(44,44,52,.55)" : "rgba(255,255,255,.55)",
      "--ha-card-border-color": d ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.7)", "--ha-card-box-shadow": "none" };
    if (!an) { if (this._thema) { Object.keys(werte).forEach((k) => r.removeProperty(k)); this._thema = false; } return; }
    if (Glas.einst?.aussehen?.hintergrund === "aus") return this.themaSetzen(false);
    Object.entries(werte).forEach(([k, v]) => r.setProperty(k, v));
    this._thema = true;
  }
  set hass(h) {
    const erst = !this._hass;
    this._hass = h;
    Glas.hassSetzen(h);
    if (erst) { Glas.einstLaden(h); this.aufbauen(); }
    this.hintergrund();
    this._kinder.forEach((el) => { el.hass = h; });
  }
  get hass() { return this._hass; }
  // Karten wiederverwenden (gleicher Schlüssel): geänderte Einstellungen per setConfig, damit offene Blätter offen bleiben
  kind(schluessel, tag, cfg) {
    const json = JSON.stringify(cfg);
    let el = this._kinder.get(schluessel);
    if (el && el.localName !== tag) el = null;
    if (!el) {
      el = document.createElement(tag);
      try { el.setConfig(cfg); } catch (e) { el = document.createElement("div"); el.className = "leise"; el.textContent = e.message; }
      el._cfgJson = json;
      if (this._hass) el.hass = this._hass;
    } else if (el._cfgJson !== json) {
      try { el.setConfig?.(cfg); el._cfgJson = json; } catch (e) { console.error(e); }
    }
    this._neu.set(schluessel, el);
    return el;
  }
  hintergrund() {
    const hg = this.shadowRoot.querySelector(".hg");
    if (!hg || !this._hass) return;
    const d = istDunkel(this._hass);
    this.toggleAttribute("dunkel", d);
    const css = hintergrundCss(Glas.einst?.aussehen?.hintergrund || "klassisch", d);
    if (hg._css !== css) { hg._css = css; hg.style.background = css; this.themaSetzen(true); }
  }
  aufbauen() {
    if (!this._hass || !this.isConnected) return;
    const e = Glas.einst;
    if (!this.shadowRoot.firstChild) this.shadowRoot.innerHTML = `<style>${TOKENS}${ZUHAUSE_CSS}${BEARB_CSS}</style><div class="hg"></div><div class="seite"></div><div class="ebene"></div>`;
    this.hintergrund();
    const seite = this.shadowRoot.querySelector(".seite"), ebene = this.shadowRoot.querySelector(".ebene");
    if (!e) {
      const fehlt = Glas.einstFehler === "fehlt";
      seite.innerHTML = Glas.einstFehler || !Glas._einstVersprechen ? `<div class="leer glas"><h2>${fehlt ? "Integration fehlt" : "Einstellungen nicht erreichbar"}</h2>
        <p>${fehlt ? "Füge unter Einstellungen › Geräte & Dienste die Integration „Glas-Dashboard“ hinzu." : esc(Glas.einstFehler || "")}</p></div>` : "";
      return;
    }
    if (this._baut) { this._nochmal = true; return; }
    // Personen gleich hier setzen (wie die Kopf-Karte), damit die richtige Startseite kommt
    Glas.personenSetzen((e.personen || []).map((p, i) => ({ ...p, id: p.benutzer || p.name || `p${i}`, kurz: p.kurz || (p.tablet ? "" : (p.name || "?")[0].toUpperCase()) })));
    const person = Glas.aktuellePerson(this._hass);
    const schluessel = JSON.stringify([e, person?.id, Glas.bearbeiten]);
    if (schluessel === this._schluessel) return;
    this._schluessel = schluessel;
    this._baut = true;
    try { this.bauen(e, person, seite, ebene); } finally { this._baut = false; }
    if (this._nochmal) { this._nochmal = false; queueMicrotask(() => this.aufbauen()); }
  }
  bauen(e, person, seite, ebene) {
    this._neu = new Map();
    if (!e.raeume?.length && !e.personen?.length && !(e.startseiten?.alle?.favoriten || []).length) {
      seite.innerHTML = `<div class="leer glas"><h2>Willkommen</h2><p>Richte zuerst Personen, Räume und deine Startseite ein. Danach baut sich dieses Dashboard von selbst auf.</p>
        <a href="/glas-einstellungen">Einstellungen öffnen</a></div>`;
      ebene.replaceChildren();
      this._kinder = this._neu;
      return;
    }
    const s = startseiteVon(e, person);
    const teile = [];
    teile.push(this.kind("kopf", "glas-kopf-card", { gruss_modus: e.gruss_modus || "name", gruss_text: e.gruss_text, untertitel: e.untertitel, personen: e.personen || [], chips: s.chips || [] }));
    const b = e.bereiche || {};
    const bearb = Glas.bearbeiten;
    if (b.hinweise?.an !== false && !bearb) {
      teile.push(this.kind("hinweise", "glas-hinweise-card", { wetter: b.wetter?.entity, regen: b.hinweise?.regen,
        personen: (e.personen || []).filter((p) => !p.tablet && p.entity).map((p) => p.entity) }));
    }
    if (bearb) {
      // Warnungen sind sonst unsichtbar: im Bearbeiten-Modus als Platzhalter zum Einstellen
      const w = document.createElement("button");
      w.className = `platzhalter glas warn-platz ${b.hinweise?.an === false ? "aus" : ""}`;
      w.innerHTML = `<ha-icon></ha-icon><span><b>Warnungen</b><span class="leise">${b.hinweise?.an === false ? "Ausgeblendet" : "Erscheinen nur, wenn etwas zutrifft"} · antippen zum Einstellen</span></span>`;
      w.querySelector("ha-icon").icon = "mdi:alert-outline";
      w.addEventListener("click", () => abschnittMenue(this, null, 0, "hinweise"));
      teile.push(w);
    }
    const abZugriff = listeZugriff({ art: "abschnitte", person });
    const raster = document.createElement("div");
    raster.className = "raster";
    for (const [ai, a] of s.abschnitte.entries()) {
      if (!a.an && !bearb) continue;
      let el = null;
      const info = ABSCHNITTE.find(([id]) => id === a.id) || [a.id, a.id, "mdi:card-outline"];
      const platz = (text) => {
        const p = document.createElement("div");
        p.className = "platzhalter glas";
        p.innerHTML = `<ha-icon></ha-icon><span><b>${esc(info[1])}</b><span class="leise">${esc(text)}</span></span>`;
        p.querySelector("ha-icon").icon = info[2];
        return p;
      };
      const umhuellen = (inhalt, griff) => {
        if (!bearb) return inhalt;
        const z = document.createElement("div");
        z.dataset.i = ai; z.dataset.name = info[1];
        if (griff) z.dataset.griff = "titel";
        if (!a.an) z.classList.add("aus");
        z.appendChild(inhalt);
        return z;
      };
      // Von null: offensichtliche Entitäten selbst finden (einzige Wetter-Entität, einziger Saugroboter)
      const erste = (d) => { const l = Object.keys(this._hass.states).filter((x) => x.startsWith(`${d}.`)); return l.length === 1 ? l[0] : null; };
      const wetterE = b.wetter?.entity || erste("weather"), robiE = b.robi?.entity || erste("vacuum");
      if (a.id === "wetter" && wetterE) el = this.kind("wetter", "glas-wetter-card", { ...(b.wetter || {}), entity: wetterE });
      else if (a.id === "planer" && b.planer?.an !== false) el = this.kind("planer", "glas-planer-card", b.planer || {});
      else if (a.id === "sicherheit" && b.sicherheit && (b.sicherheit.alarm || b.sicherheit.fenster_auto !== false)) el = this.kind("sicherheit", "glas-sicherheit-card", { fenster_auto: true, ...(b.sicherheit || {}) });
      else if (a.id === "drucker" && (b.drucker?.geraet || b.drucker?.fortschritt)) el = this.kind("drucker", "glas-drucker-card", b.drucker);
      else if (a.id === "robi" && robiE) el = this.kind("robi", "glas-robi-card", { ...(b.robi || {}), entity: robiE });
      else if (a.id === "gaeste" && (b.gaeste?.ssid || b.gaeste?.ssid_entity)) el = this.kind("gaeste", "glas-gaeste-card", b.gaeste);
      else if (a.id === "favoriten" && (bearb || (s.favoriten || []).some((f) => f.an !== false && (f.entity || listenKarte(f.karte))))) {
        const wrap = document.createElement("div");
        wrap.innerHTML = `<h2 class="h2 abschnitt-titel">Favoriten</h2><div class="fav"></div>`;
        wrap.style.display = bearb ? "grid" : "contents";
        if (bearb) { wrap.style.gridTemplateColumns = "repeat(12,minmax(0,1fr))"; wrap.style.gap = "var(--g-a2)"; }
        const fav = wrap.querySelector(".fav");
        (s.favoriten || []).map((f, i) => ({ f, i })).filter(({ f }) => (bearb || f.an !== false) && (f.entity || listenKarte(f.karte))).forEach(({ f, i }, n) => {
          const kk = f.karte && listenKarte(f.karte);
          const kc = kk && (({ type, ...r }) => r)(listenKarteCfg(f));
          const k = kk ? this.kind(`fav${n}-${f.karte}`, kk[3], kc) : this.kind(`fav${n}`, "glas-kachel-card", kachelCfg(f));
          const z = document.createElement("div");
          z.style.gridColumn = `span ${SPANNE[f.groesse || "breit"] || 6}`;
          if (bearb) {
            z.dataset.i = i;
            z.dataset.name = kk ? listenKarteName(f) : f.name || this._hass.states[f.entity]?.attributes.friendly_name || f.entity;
            if (f.an === false) z.classList.add("aus");
          }
          z.appendChild(k);
          fav.appendChild(z);
        });
        fav.style.gridColumn = "span 12";
        if (bearb) { bearbeitRaster(fav, listeZugriff({ art: "fav", person }), this); raster.appendChild(umhuellen(wrap, true)); wrap.parentElement.style.gridColumn = "span 12"; }
        else raster.append(...wrap.childNodes);
        continue;
      }
      if (!el && !bearb) continue;
      if (!el) el = platz(a.id === "favoriten" ? "Noch keine Favoriten" : !a.an ? "Ausgeblendet" : "Noch nicht eingerichtet · antippen");
      else if (bearb && !a.an) el = platz("Ausgeblendet");
      const z = umhuellen(el, false);
      el.classList.toggle("halb", a.breite === "halb" && !bearb);
      z.classList.toggle("halb", a.breite === "halb");
      raster.appendChild(z);
    }
    teile.push(raster);
    if (bearb) bearbeitRaster(raster, abZugriff, this, { mitNeu: false, menue: (i) => abschnittMenue(this, abZugriff, i) });
    seite.replaceChildren(...teile);
    // Räume: Leiste + Blätter (leben unsichtbar, öffnen über #raum)
    const raeume = (e.raeume || []).filter((r) => r.hash);
    const unten = [];
    if (raeume.length) {
      unten.push(this.kind("leiste", "glas-raumleiste-card", { zuhause_zeigen: true, raeume: raeume.map((r) => ({ name: r.name, icon: r.icon, hash: r.hash, bereich: r.bereich })) }));
      raeume.forEach((r) => unten.push(this.kind(`raum-${r.hash}`, "glas-raum-card", raumCfg(this._hass, r))));
    }
    // Nur umhängen, wenn sich etwas geändert hat: sonst würde ein offenes Raum-Blatt geschlossen
    const jetzt = [...ebene.children];
    if (jetzt.length !== unten.length || jetzt.some((el, i) => el !== unten[i])) ebene.replaceChildren(...unten);
    this._kinder = this._neu;
  }
}
// Gerät aus den Einstellungen → Kachel-Konfiguration
function kachelCfg(g) {
  const { an, gruppe, ...rest } = g;
  return { groesse: "breit", zweite_zeile: "zustand", ...rest };
}
// alle = Bearbeiten-Modus: auch Ausgeblendete, mit Index (_i) und Gruppe (_gruppe) für Ziehen und Menü
function raumCfg(hass, r, alle = false) {
  const geraete = (r.geraete || raumGeraeteVorschlag(hass, r.bereich)).map((g, i) => ({ g, i })).filter(({ g }) => (alle || g.an !== false) && (g.entity || g.karte));
  const cards = [];
  let gruppe = null;
  const extra = (g, i, gr) => (alle ? { _i: i, _aus: g.an === false, ...(gr ? { _gruppe: gr } : {}), ...(g.karte ? { _karte: g.karte } : {}) } : {});
  for (const { g, i } of geraete) {
    if (g.karte) {
      const k = listenKarteCfg(g);
      if (!k) continue;
      const gr = g.gruppe || `karte-${g.karte}`;
      if (gr !== gruppe) { gruppe = gr; cards.push({ type: "heading", heading: gruppenName(r, gr), heading_style: "subtitle", _gruppe: gr }); }
      cards.push({ ...k, ...extra(g, i) });
      continue;
    }
    const gr = g.gruppe || gruppeVon(hass, g.entity);
    if (gr !== gruppe) { gruppe = gr; cards.push({ type: "heading", heading: gruppenName(r, gr), heading_style: "subtitle", _gruppe: gr }); }
    cards.push({ type: "custom:glas-kachel-card", ...kachelCfg(g), ...extra(g, i) });
  }
  // Im Bearbeiten-Modus auch leere eigene Abschnitte zeigen, damit man Kacheln hineinziehen kann
  if (alle) {
    const da = new Set(cards.filter((c) => c.type === "heading").map((c) => c._gruppe));
    Object.keys(r.gruppen_namen || {}).filter((g) => g.startsWith("eigen-") && !da.has(g))
      .forEach((g) => cards.push({ type: "heading", heading: gruppenName(r, g), heading_style: "subtitle", _gruppe: g, _leer: true }));
  }
  return { hash: r.hash, name: r.name, icon: r.icon, bereich: r.bereich, temperatur: r.temperatur, feuchte: r.feuchte,
    fenster_auto: r.fenster_auto !== false, alles_aus: r.alles_aus !== false, chips: [...(r.fenster || []), ...(r.bewegung || []), ...(r.chips || [])],
    verlauf_chip: r.verlauf_chip !== false, spalten: r.spalten || 1, cards };
}

class GlasZuhauseEditor extends GlasEditor {
  render() {
    if (!this._hass) return;
    this._gezeichnet = true;
    this.innerHTML = `<p style="line-height:1.45">Diese Karte baut alles aus den zentralen Einstellungen auf. Personen, Räume, Startseite und Aussehen stellst du in der Seitenleiste unter <a href="/glas-einstellungen">Glas</a> ein.</p>`;
  }
}
