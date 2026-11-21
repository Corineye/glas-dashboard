// ---------------------------------------------------------------------------
// glas-planer-card: Heute aus dem Planer – für die Person, die gerade schaut
// C zeigt Corins Planer, L Lindas (Aufgaben, Schicht, Termine aus ihren Kalendern)
// ---------------------------------------------------------------------------
const PLANER_CSS = `
:host{display:block}
.karte{display:flex;flex-direction:column;gap:var(--g-a3)}
.oben{display:flex;align-items:center;justify-content:space-between;gap:var(--g-a3)}
.datum{margin:0;font-size:var(--g-s-h2);font-weight:800;letter-spacing:-.3px;color:var(--g-akzent)}
.schicht{align-self:flex-start;display:inline-flex;align-items:center;gap:var(--g-a2);min-height:32px;padding:4px 12px 4px 4px;border-radius:var(--g-r-pille);
  font-size:var(--g-s-name);color:var(--g-text);background:color-mix(in srgb,var(--sc) 16%,transparent);border:1.5px solid color-mix(in srgb,var(--sc) 45%,transparent)}
.schicht b{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:var(--g-s-klein);color:#fff;background:var(--sc)}
.zeile{display:flex;align-items:center;gap:var(--g-a3);min-height:56px;padding:var(--g-a2) var(--g-a2) var(--g-a2) var(--g-a3);border-radius:var(--g-r-klein);
  background:var(--g-zeile);box-shadow:inset 4px 0 0 var(--bf,#8e8e93);transition:opacity .25s ease}
:host{--g-zeile:rgba(255,255,255,.85)} :host([dunkel]){--g-zeile:rgba(255,255,255,.08)}
.zeile.fertig{opacity:.55}
.zeile.vorbei{opacity:.6;background:var(--g-fuell)}
.kreis{flex:none;width:28px;height:28px;border-radius:50%;border:2.5px solid var(--g-text2);display:flex;align-items:center;justify-content:center;transition:background-color .2s ease}
.kreis.rot{border-color:var(--g-rot)}
.kreis[aria-pressed="true"]{background:var(--g-akzent);border-color:var(--g-akzent);color:#fff}
.kreis ha-icon{--mdc-icon-size:16px}
.mitte{flex:1;min-width:0;display:flex;flex-direction:column;gap:var(--g-a1)}
.titel{font-size:var(--g-s-text);color:var(--g-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.termin .titel{font-weight:600}
.fertig .titel{text-decoration:line-through}
.chips{display:flex;gap:var(--g-a1);flex-wrap:wrap}
.mini{display:inline-flex;align-items:center;gap:var(--g-a1);padding:2px 8px;border-radius:var(--g-r-pille);font-size:var(--g-s-klein);color:var(--g-text2);background:var(--g-fuell)}
.mini.rot{color:var(--g-rot-text);background:rgba(255,59,48,.14)}
.zeit{flex:none;width:92px;font-size:var(--g-s-klein);color:var(--g-text2);font-variant-numeric:tabular-nums}
.morgen{flex:none;min-height:36px;padding:0 var(--g-a3);border-radius:var(--g-r-pille);font-size:var(--g-s-klein);font-weight:600;color:var(--g-text);background:var(--g-fuell)}
.jetzt{display:flex;align-items:center;gap:var(--g-a2)}
.jetzt i{display:block;height:2px;background:var(--g-rot)}
.jetzt span{font-size:var(--g-s-klein);font-weight:700;color:var(--g-rot-text)}
.unten{display:flex;justify-content:space-between;align-items:center;gap:var(--g-a2);flex-wrap:wrap}
.klapp{min-height:44px;padding:0 var(--g-a1);font-size:var(--g-s-name);font-weight:600;color:var(--g-text)}
.leer{padding:var(--g-a2) var(--g-a1)}
.seg{display:flex;gap:2px;padding:3px;border-radius:var(--g-r-pille);background:var(--g-fuell);align-self:flex-start}
.seg button{min-height:32px;padding:0 var(--g-a3);border-radius:var(--g-r-pille);font-size:var(--g-s-klein);font-weight:600;color:var(--g-text2);transition:background-color .2s ease,color .2s ease}
.seg button[aria-selected="true"]{background:var(--g-an);color:var(--g-text-an);box-shadow:0 1px 4px rgba(0,0,0,.12)}
.bahn{display:flex;align-items:flex-start;overflow-x:auto;overflow-y:hidden;transition:height .32s cubic-bezier(.32,.72,0,1);scroll-snap-type:x mandatory;overscroll-behavior-x:contain;scrollbar-width:none;margin:0 calc(-1 * var(--g-a4))}
.bahn::-webkit-scrollbar{display:none}
.seite{flex:0 0 100%;min-width:0;scroll-snap-align:start;scroll-snap-stop:always;padding:0 var(--g-a4);display:flex;flex-direction:column;gap:var(--g-a3)}
.punkte{display:flex;justify-content:center;gap:6px}
.punkte i{width:6px;height:6px;border-radius:50%;background:var(--g-text2);opacity:.3;transition:opacity .2s ease}
.punkte i.an{opacity:.9}
.tag-titel{margin:var(--g-a1) var(--g-a1) 0;font-size:var(--g-s-klein);font-weight:700;color:var(--g-text2)}
.tag-titel.heute{color:var(--g-akzent)}
.woche{display:grid;grid-template-columns:auto repeat(7,minmax(0,1fr));gap:6px;align-items:center}
.woche .kopf-t{font-size:var(--g-s-mini);font-weight:600;line-height:1.3;color:var(--g-text2);text-align:center;padding:2px 0;border-radius:8px}
.woche .kopf-t.heute{background:var(--g-akzent-voll);color:#fff}
.woche .wer{font-size:var(--g-s-klein);font-weight:700;color:var(--g-text);padding-right:var(--g-a1)}
.woche .sch{height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:var(--g-s-klein);font-weight:700;
  color:#fff;background:var(--sc);text-shadow:0 1px 2px rgba(0,0,0,.3)}
.woche .sch.frei{background:var(--g-fuell);color:var(--g-text2);font-weight:500;text-shadow:none}
.woche .sch.heute{box-shadow:0 0 0 2px var(--g-akzent)}
.klapp{display:inline-flex;align-items:center;gap:var(--g-a1)}
.klapp ha-icon{--mdc-icon-size:20px;transition:transform .25s cubic-bezier(.32,.72,0,1)}
.klapp[aria-expanded="true"] ha-icon{transform:rotate(180deg)}
.monat{display:flex;flex-direction:column;gap:4px}
.mkopf,.mraster{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px}
.mkopf span{text-align:center;font-size:var(--g-s-mini);font-weight:600;color:var(--g-text2)}
.mtag{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;height:44px;border-radius:12px;color:var(--g-text);transition:background-color .2s ease}
.mtag.vorbei{color:var(--g-text2)}
.mzahl{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:var(--g-s-name);font-variant-numeric:tabular-nums}
.mtag.heute .mzahl{color:var(--g-rot-text);font-weight:700}
.mtag[aria-pressed="true"] .mzahl{background:var(--g-aktiv);color:var(--g-aktiv-text);font-weight:700}
.mtag.heute[aria-pressed="true"] .mzahl{background:var(--g-rot-voll);color:#fff}
.mpunkte{display:flex;gap:2px;height:5px}
.mpunkte i{width:5px;height:5px;border-radius:50%}
.mpunkte i.t{background:var(--g-orange)}
.legende{display:flex;flex-wrap:wrap;gap:var(--g-a2)}
.feld{width:100%;min-height:48px;padding:10px 14px;border-radius:var(--g-r-klein);font:inherit;font-size:var(--g-s-text);color:var(--g-text);
  background:var(--g-fuell);border:1px solid var(--g-glas-rand);outline-color:var(--g-akzent)}
.gruppe{display:flex;flex-direction:column;gap:var(--g-a2)}
.haupt{min-height:52px;border-radius:var(--g-r-klein);font-size:var(--g-s-text);font-weight:600;color:#fff;background:var(--g-akzent-voll)}
.haupt:disabled{opacity:.45}
`;
const MONATE = ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sept.", "Okt.", "Nov.", "Dez."];

class GlasPlanerCard extends GlasKarte {
  static standard() { return { titel: "", ohne_datum: true, planer_pfad: "/planer", max_aufgaben: 6, seite_planer: true, seite_kalender: true, seite_monat: true, seite_schichten: true }; }
  static getConfigElement() { return document.createElement("glas-planer-card-editor"); }
  static getStubConfig() { return {}; }
  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }
  getCardSize() { return 4; }
  css() { return PLANER_CSS; }
  connectedCallback() {
    super.connectedCallback();
    this._takt = setInterval(() => { this._termineZeit = 0; this.laden(); }, 5 * 60 * 1000);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this._takt);
    this._abo?.then((f) => f()).catch(() => {});
    this._abo = null;
  }
  set hass(h) {
    const erst = !this._hass;
    super.hass = h;
    if (erst || !this._abo) this.laden();
  }
  get hass() { return this._hass; }
  async laden() {
    const h = this._hass;
    if (!h || this._laedt) return;
    this._laedt = true;
    try {
      this._daten = await h.callWS({ type: "planer/lesen" });
      this._fehler = null;
      if (!this._abo) {
        this._abo = h.connection.subscribeMessage(() => { clearTimeout(this._neuT); this._neuT = setTimeout(() => this.neuLesen(), 400); }, { type: "planer/abonnieren" });
        this._abo.catch(() => { this._abo = null; });
      }
    } catch (e) { this._fehler = e?.code === "unknown_command" ? "Die Planer-Integration ist nicht installiert." : (e?.message || "Planer nicht erreichbar"); }
    this._laedt = false;
    await this.termineLaden();
    this.render();
  }
  async neuLesen() { try { this._daten = await this._hass.callWS({ type: "planer/lesen" }); this.render(); } catch (_) { /* */ } }
  person() { return Glas.aktuellePerson(this._hass); }
  kalenderFuer(p) {
    const d = this._daten || {}, h = this._hass;
    if (!p) return [];
    if (p.tablet) {
      const alle = new Set();
      Glas.personen.filter((x) => !x.tablet).forEach((x) => this.kalenderFuer(x).forEach((k) => alle.add(k)));
      return [...alle];
    }
    if (p.kalender?.length) return p.kalender;
    const pid = p.benutzer;
    const e = d.einstellungen?.[pid];
    if (e) {
      return Object.keys(h.states).filter((x) => x.startsWith("calendar.") && (e.kalender_sehen == null || e.kalender_sehen.includes(x)) && !(e.kalender_aus || []).includes(x));
    }
    return (d.kalender || []).filter((k) => k.angezeigt).map((k) => k.id);
  }
  async termineLaden() {
    const p = this.person();
    const ids = this.kalenderFuer(p);
    const schluessel = heuteIso() + ids.join(",");
    if (schluessel === this._termineSchl && Date.now() - (this._termineZeit || 0) < 5 * 60 * 1000) return;
    this._termineSchl = schluessel; this._termineZeit = Date.now();
    // Vom Monatsanfang bis mindestens 7 Tage voraus (Seiten „Kalender“ und „Monat“)
    const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(1);
    const ende = new Date(); ende.setHours(0, 0, 0, 0); ende.setDate(ende.getDate() + 7);
    const monatsEnde = new Date(start); monatsEnde.setMonth(monatsEnde.getMonth() + 1);
    if (monatsEnde > ende) ende.setTime(monatsEnde.getTime());
    const q = `?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(ende.toISOString())}`;
    const listen = await Promise.all(ids.map((id) => this._hass.callApi("GET", `calendars/${id}${q}`).then((l) => l.map((t) => ({ ...t, kalender: id }))).catch(() => [])));
    const gesehen = new Set();
    this._termine = listen.flat()
      .filter((t) => !String(t.description || "").includes("planer-schicht"))
      .filter((t) => { const k = `${t.summary}|${t.start.dateTime || t.start.date}`; if (gesehen.has(k)) return false; gesehen.add(k); return true; })
      .map((t) => ({ titel: t.summary, ganztag: !t.start.dateTime, start: new Date(t.start.dateTime || t.start.date + "T00:00"), ende: new Date(t.end.dateTime || t.end.date + "T00:00"),
        kalender: t.kalender, ort: t.location || "" }))
      .sort((a, b) => (b.ganztag - a.ganztag) || (a.start - b.start));
  }
  render() {
    const p = this.person();
    if (p && this._personVorher !== p.id) { this._personVorher = p.id; this._termineZeit = 0; this.termineLaden().then(() => super.render()); }
    super.render();
  }
  aufgaben(p) {
    const d = this._daten;
    if (!d || !p) return [];
    const heute = heuteIso();
    const wer = p.tablet ? ["gemeinsam"] : [p.benutzer, "gemeinsam"];
    return (d.aufgaben || [])
      .filter((a) => a.status === "offen" || this._erledigt?.has(a.id))
      .filter((a) => wer.includes(a.person))
      .filter((a) => (a.datum ? a.datum <= heute : this._config.ohne_datum))
      .sort((a, b) => (a.datum || "9") .localeCompare(b.datum || "9") || (a.uhrzeit || "99").localeCompare(b.uhrzeit || "99"));
  }
  html() {
    const c = this._config;
    const jetzt = new Date();
    const titel = c.titel || `Heute, ${jetzt.getDate()}. ${MONATE[jetzt.getMonth()]}`;
    if (this._fehler) return `<div class="karte glas"><div class="oben"><h2 class="datum">${esc(titel)}</h2></div><div class="leise leer">${esc(this._fehler)}</div></div>`;
    if (!this._daten) return `<div class="karte glas"><div class="oben"><h2 class="datum">${esc(titel)}</h2></div><div class="leise leer">Lade Planer …</div></div>`;
    const p = this.person();
    const d = this._daten, heute = heuteIso();
    const farben = d.farben || {};
    const auf = this.aufgaben(p);
    const offen = auf.filter((a) => a.status === "offen");
    const morgen0 = new Date(jetzt); morgen0.setHours(24, 0, 0, 0);
    const heute0 = new Date(jetzt); heute0.setHours(0, 0, 0, 0);
    const termine = (this._termine || []).filter((t) => t.start < morgen0 && t.ende > heute0);
    // Schicht der Person heute
    let schicht = "";
    const plan = p && !p.tablet ? d.schichten?.[p.benutzer] : null;
    const art = plan && plan.arten?.find((x) => x.id === plan.tage?.[heute]);
    if (art) schicht = `<div class="schicht" style="--sc:${art.farbe}"><b aria-hidden="true">${esc(art.kurz)}</b><span>${esc(art.name)}${art.von ? ` ${art.von}–${art.bis}` : ""}</span></div>`;
    const tageSeit = (iso) => Math.round((new Date(heute) - new Date(iso)) / 86400000);
    const aufgabeHtml = (a) => {
      const fertig = a.status !== "offen";
      const seit = a.datum && a.datum < heute ? tageSeit(a.datum) : 0;
      const bf = farben[a.bereich] || (a.bereich ? "#8e8e93" : "var(--g-akzent)");
      return `<div class="zeile ${fertig ? "fertig" : ""}" style="--bf:${bf}">
        <button class="kreis ${seit ? "rot" : ""}" data-fertig="${esc(a.id)}" aria-pressed="${fertig}" aria-label="${esc(a.titel)} abhaken">${fertig ? `<ha-icon data-i="mdi:check-bold"></ha-icon>` : ""}</button>
        <div class="mitte"><span class="titel">${esc(a.titel)}</span><span class="chips">
          ${seit && !fertig ? `<span class="mini rot">${seit === 1 ? "seit gestern" : `seit ${seit} Tagen`}</span>` : ""}
          ${a.uhrzeit ? `<span class="mini">${esc(a.uhrzeit)} Uhr</span>` : ""}
          ${a.bereich ? `<span class="mini"><span class="punkt" style="background:${bf}"></span>${esc(a.bereich)}</span>` : ""}
          ${a.person === "gemeinsam" && !p?.tablet ? `<span class="mini">Gemeinsam</span>` : ""}</span></div>
        ${fertig ? "" : `<button class="morgen k" data-morgen="${esc(a.id)}">Morgen</button>`}</div>`;
    };
    const terminHtml = (t) => {
      const vorbei = !t.ganztag && t.ende < jetzt;
      const zeit = t.ganztag ? "Ganztägig" : `${uhr(t.start)}–${uhr(t.ende)}`;
      return `<div class="zeile termin ${vorbei ? "vorbei" : ""}" style="--bf:var(--g-orange)"><span class="zeit">${zeit}</span>
        <div class="mitte"><span class="titel">${esc(t.titel)}</span>${t.ort ? `<span class="leise">${esc(t.ort)}</span>` : ""}</div></div>`;
    };
    let koerper = "";
    if (this._auf) {
      const liste = auf.slice(0, c.max_aufgaben === 0 ? 999 : Math.max(c.max_aufgaben, offen.length)).map(aufgabeHtml);
      const zeitlinie = [];
      let jetztGesetzt = false;
      termine.forEach((t) => {
        if (!jetztGesetzt && !t.ganztag && t.start > jetzt) { zeitlinie.push(`<div class="jetzt"><i style="width:14px"></i><span>Jetzt ${uhr(jetzt)}</span><i style="flex:1"></i></div>`); jetztGesetzt = true; }
        zeitlinie.push(terminHtml(t));
      });
      koerper = liste.join("") + zeitlinie.join("") || `<div class="leise leer">Heute steht nichts an.</div>`;
    } else {
      const naechster = termine.find((t) => !t.ganztag && t.ende > jetzt);
      if (naechster) {
        const min = Math.round((naechster.start - jetzt) / 60000);
        const bis = min > 0 ? (min >= 60 ? ` · in ${Math.floor(min / 60)} Std. ${min % 60} Min.` : ` · in ${min} Min.`) : " · läuft gerade";
        koerper = terminHtml(naechster).replace(/<\/div><\/div>$/, `<span class="leise">${bis.slice(3)}</span></div></div>`);
      } else if (offen.length) koerper = aufgabeHtml(offen[0]);
      else koerper = `<div class="leise leer">Heute steht nichts mehr an.</div>`;
    }
    const anz = offen.length + termine.filter((t) => t.ganztag || t.ende > jetzt).length;
    const seite1 = `<section class="seite" aria-label="Planer">
      <div class="oben"><h2 class="datum">${esc(titel)}</h2><button class="rund" data-neu aria-label="Aufgabe hinzufügen"><ha-icon data-i="mdi:plus"></ha-icon></button></div>
      ${schicht}${koerper}
      <div class="unten"><button class="klapp" data-klapp aria-expanded="${!!this._auf}">${this._auf ? "Weniger" : `Ganzer Tag · ${anz} ${anz === 1 ? "Eintrag" : "Einträge"}`}<ha-icon data-i="mdi:chevron-down"></ha-icon></button>
      <button class="link" data-oeffnen>Planer öffnen<ha-icon class="pfeil-r" data-i="mdi:chevron-right" aria-hidden="true"></ha-icon></button></div></section>`;
    const seiten = [["planer", "Planer", seite1], ["kalender", "Kalender", this.kalenderSeite(terminHtml)], ["monat", "Monat", this.monatSeite(terminHtml)], ["schichten", "Schichten", this.schichtSeite()]]
      .filter(([id]) => c[`seite_${id}`] !== false);
    if (seiten.length <= 1) return `<div class="karte glas">${(seiten[0] || [, , seite1])[2].replace('class="seite"', 'class="seite" style="padding:0"')}</div>`;
    const akt = klemmen(this._seite || 0, 0, seiten.length - 1);
    return `<div class="karte glas" style="gap:var(--g-a2)">
      <div class="seg" role="tablist" aria-label="Ansicht">${seiten.map(([, n], i) => `<button role="tab" data-seite="${i}" aria-selected="${i === akt}">${n}</button>`).join("")}</div>
      <div class="bahn">${seiten.map(([, , html]) => html).join("")}</div>
      <div class="punkte" aria-hidden="true">${seiten.map((_, i) => `<i class="${i === akt ? "an" : ""}"></i>`).join("")}</div></div>`;
  }
  // Seite 2: die nächsten 7 Tage aus den Kalendern der Person
  kalenderSeite(terminHtml) {
    const alle = this._termine || [];
    const tage = [...Array(7)].map((_, i) => {
      const a = new Date(); a.setHours(0, 0, 0, 0); a.setDate(a.getDate() + i);
      const b = new Date(a); b.setDate(b.getDate() + 1);
      return { i, a, liste: alle.filter((t) => t.start < b && t.ende > a) };
    }).filter((t) => t.liste.length);
    const name = (t) => (t.i === 0 ? "Heute" : t.i === 1 ? "Morgen" : t.a.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "short" }));
    return `<section class="seite" aria-label="Kalender"><div class="oben"><h2 class="datum">Nächste 7 Tage</h2></div>
      ${tage.length ? tage.map((t) => `<div class="tag-titel ${t.i === 0 ? "heute" : ""}">${esc(name(t))}</div>${t.liste.map(terminHtml).join("")}`).join("")
        : `<div class="leise leer">Keine Termine in den nächsten 7 Tagen.</div>`}</section>`;
  }
  // Seite Monat: kleiner Monatskalender mit Punkten, Tag antippen zeigt die Termine darunter groß
  monatSeite(terminHtml) {
    const jetzt = new Date(), heute = heuteIso();
    const wahl = this._tagWahl || heute;
    const erster = new Date(jetzt.getFullYear(), jetzt.getMonth(), 1);
    const versatz = (erster.getDay() + 6) % 7;
    const tageImMonat = new Date(jetzt.getFullYear(), jetzt.getMonth() + 1, 0).getDate();
    const alle = this._termine || [];
    const termineAm = (iso) => { const a = new Date(`${iso}T00:00`), b = new Date(a); b.setDate(b.getDate() + 1); return alle.filter((t) => t.start < b && t.ende > a); };
    const p = this.person(), d = this._daten || {};
    const plan = p && !p.tablet ? d.schichten?.[p.benutzer] : null;
    const zellen = [];
    for (let i = 0; i < versatz; i++) zellen.push(`<span></span>`);
    for (let t = 1; t <= tageImMonat; t++) {
      const iso = isoTag(new Date(jetzt.getFullYear(), jetzt.getMonth(), t));
      const n = termineAm(iso).length, art = plan?.arten?.find((x) => x.id === plan.tage?.[iso]);
      zellen.push(`<button class="mtag ${iso === heute ? "heute" : ""} ${iso < heute ? "vorbei" : ""}" data-tag="${iso}" aria-pressed="${iso === wahl}" aria-label="${t}.${n ? `, ${n} Termine` : ""}${art ? `, ${esc(art.name)}` : ""}">
        <span class="mzahl">${t}</span><span class="mpunkte">${art ? `<i style="background:${esc(art.farbe)}"></i>` : ""}${n ? `<i class="t"></i>` : ""}${n > 1 ? `<i class="t"></i>` : ""}</span></button>`);
    }
    const liste = termineAm(wahl);
    const titel = wahl === heute ? "Heute" : new Date(`${wahl}T00:00`).toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
    return `<section class="seite" aria-label="Monat"><div class="oben"><h2 class="datum">${jetzt.toLocaleDateString("de-DE", { month: "long", year: "numeric" })}</h2></div>
      <div class="monat"><div class="mkopf">${["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((x) => `<span>${x}</span>`).join("")}</div><div class="mraster">${zellen.join("")}</div></div>
      <div class="tag-titel ${wahl === heute ? "heute" : ""}">${esc(titel)}</div>
      ${liste.length ? liste.map(terminHtml).join("") : `<div class="leise leer">Keine Termine.</div>`}</section>`;
  }
  // Seite 3: Schichten der Woche für alle Personen (Mo–So), heute markiert
  schichtSeite() {
    const d = this._daten || {};
    const mo = new Date(); mo.setHours(0, 0, 0, 0); mo.setDate(mo.getDate() - ((mo.getDay() + 6) % 7));
    const tage = [...Array(7)].map((_, i) => { const x = new Date(mo); x.setDate(x.getDate() + i); return x; });
    const heute = heuteIso();
    const leute = Glas.personen.filter((p) => !p.tablet && p.benutzer && d.schichten?.[p.benutzer]);
    if (!leute.length) return `<section class="seite" aria-label="Schichten"><div class="oben"><h2 class="datum">Schichten</h2></div><div class="leise leer">Noch keine Schichten im Planer eingetragen.</div></section>`;
    const kw = (() => { const t = new Date(tage[3]); const j = new Date(t.getFullYear(), 0, 4); return 1 + Math.round(((t - j) / 864e5 - 3 + ((j.getDay() + 6) % 7)) / 7); })();
    const benutzt = new Map();
    const zeilen = leute.map((p) => {
      const plan = d.schichten[p.benutzer];
      return `<span class="wer">${esc(p.kurz || (p.name || "?")[0])}</span>${tage.map((t) => {
        const iso = isoTag(t), art = plan.arten?.find((x) => x.id === plan.tage?.[iso]);
        if (art) benutzt.set(art.id + art.name, art);
        const lab = `${p.name} ${t.toLocaleDateString("de-DE", { weekday: "long" })}: ${art ? `${art.name}${art.von ? ` ${art.von}–${art.bis}` : ""}` : "frei"}`;
        return `<span class="sch ${art ? "" : "frei"} ${iso === heute ? "heute" : ""}" style="--sc:${art ? esc(art.farbe) : "transparent"}" role="img" aria-label="${esc(lab)}">${art ? esc(art.kurz) : "–"}</span>`;
      }).join("")}`;
    }).join("");
    return `<section class="seite" aria-label="Schichten"><div class="oben"><h2 class="datum">Schichten · KW ${kw}</h2></div>
      <div class="woche"><span></span>${tage.map((t) => `<span class="kopf-t ${isoTag(t) === heute ? "heute" : ""}">${t.toLocaleDateString("de-DE", { weekday: "short" }).replace(".", "")}<br>${t.getDate()}</span>`).join("")}${zeilen}</div>
      ${benutzt.size ? `<div class="legende">${[...benutzt.values()].map((a) => `<span class="mini"><span class="punkt" style="background:${esc(a.farbe)}"></span>${esc(a.kurz)} ${esc(a.name)}${a.von ? ` ${a.von}–${a.bis}` : ""}</span>`).join("")}</div>` : ""}</section>`;
  }
  binden() {
    this.iconsSetzen();
    const h = this._hass;
    const bahn = this.$(".bahn");
    if (bahn) {
      const breite = () => bahn.clientWidth || 1;
      // Höhe folgt der sichtbaren Seite (kein Leerraum unter kurzen Seiten)
      const hoehe = (i) => { const sec = bahn.children[i]; if (sec?.offsetHeight) bahn.style.height = `${sec.offsetHeight}px`; };
      bahn.scrollLeft = (this._seite || 0) * breite();
      this._seiteAnzeige = this._seite || 0;
      hoehe(this._seiteAnzeige);
      let t = null;
      bahn.addEventListener("scroll", () => {
        const i = Math.round(bahn.scrollLeft / breite());
        if (i === this._seiteAnzeige) return;
        this._seiteAnzeige = i;
        hoehe(i);
        this.$$("[data-seite]").forEach((b, k) => b.setAttribute("aria-selected", k === i));
        this.$$(".punkte i").forEach((p, k) => p.classList.toggle("an", k === i));
        clearTimeout(t); t = setTimeout(() => { this._seite = i; }, 120);
      }, { passive: true });
      this.$$("[data-seite]").forEach((b) => b.addEventListener("click", () => {
        this._seite = Number(b.dataset.seite);
        bahn.scrollTo({ left: this._seite * breite(), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      }));
    }
    this.$$("[data-tag]").forEach((b) => b.addEventListener("click", () => { this._tagWahl = b.dataset.tag; this._seite = this._seiteAnzeige; this.render(); }));
    this.$("[data-klapp]")?.addEventListener("click", () => { this._auf = !this._auf; this.render(); });
    this.$("[data-oeffnen]")?.addEventListener("click", () => navigieren(this._config.planer_pfad || "/planer"));
    this.$("[data-neu]")?.addEventListener("click", () => this.neu());
    this.$$("[data-fertig]").forEach((b) => b.addEventListener("click", async () => {
      const id = b.dataset.fertig, a = this._daten.aufgaben.find((x) => x.id === id);
      const erledigt = a.status === "offen";
      this._erledigt = this._erledigt || new Set();
      erledigt ? this._erledigt.add(id) : this._erledigt.delete(id);
      a.status = erledigt ? "erledigt" : "offen"; // sofort zeigen, Planer bestätigt per Abo
      this.render();
      try { await h.callWS({ type: "planer/erledigen", aufgabe_id: id, erledigt }); } catch (e) { this.neuLesen(); }
    }));
    this.$$("[data-morgen]").forEach((b) => b.addEventListener("click", async () => {
      try { await h.callWS({ type: "planer/speichern", aufgabe: { id: b.dataset.morgen, datum: heuteIso(1) } }); } catch (_) { /* */ }
      this.neuLesen();
    }));
  }
  neu() {
    const p = this.person();
    const st = { text: "", wann: "heute", fuer: p?.tablet ? "gemeinsam" : p?.benutzer || "gemeinsam" };
    const s = new GlasSchicht({ quelle: this, titel: "Neue Aufgabe" });
    s.dunkel(istDunkel(this._hass));
    const fuerOpt = [...Glas.personen.filter((x) => !x.tablet && x.benutzer).map((x) => [x.benutzer, x.name]), ["gemeinsam", "Gemeinsam"]];
    const zeichnen = () => {
      s.inhalt.innerHTML = `<style>${PLANER_CSS.replace(":host{display:block}", "")}</style>${s.kopfHtml("Neue Aufgabe", "")}
        <label class="gruppe"><span class="leise">Was ist zu tun?</span><input class="feld" placeholder="z. B. Filament bestellen" value="${esc(st.text)}" enterkeyhint="done"></label>
        <div class="gruppe"><span class="leise">Wann</span><div class="chips">${[["heute", "Heute"], ["morgen", "Morgen"], ["ohne", "Ohne Datum"]].map(([k, n]) =>
          `<button class="pille fuell ${st.wann === k ? "aktiv" : ""}" data-w="${k}" aria-pressed="${st.wann === k}">${n}</button>`).join("")}</div></div>
        <div class="gruppe"><span class="leise">Für</span><div class="chips">${fuerOpt.map(([k, n]) =>
          `<button class="pille fuell ${st.fuer === k ? "aktiv" : ""}" data-f="${esc(k)}" aria-pressed="${st.fuer === k}">${esc(n)}</button>`).join("")}</div></div>
        <button class="haupt" data-ok ${st.text.trim() ? "" : "disabled"}>Hinzufügen</button>`;
      s.kopfBinden();
      const feld = s.inhalt.querySelector("input");
      feld.addEventListener("input", () => { st.text = feld.value; s.inhalt.querySelector("[data-ok]").disabled = !st.text.trim(); });
      feld.addEventListener("keydown", (e) => { if (e.key === "Enter") speichern(); });
      s.inhalt.querySelectorAll("[data-w]").forEach((b) => b.addEventListener("click", () => { st.wann = b.dataset.w; zeichnen(); }));
      s.inhalt.querySelectorAll("[data-f]").forEach((b) => b.addEventListener("click", () => { st.fuer = b.dataset.f; zeichnen(); }));
      s.inhalt.querySelector("[data-ok]").addEventListener("click", () => speichern());
      return feld;
    };
    const speichern = async () => {
      if (!st.text.trim()) return;
      const datum = st.wann === "heute" ? heuteIso() : st.wann === "morgen" ? heuteIso(1) : null;
      try { await this._hass.callWS({ type: "planer/speichern", aufgabe: { titel: st.text.trim(), datum, person: st.fuer } }); } catch (_) { /* */ }
      s.schliessen(); this.neuLesen();
    };
    zeichnen();
    s.oeffnen();
    setTimeout(() => s.inhalt.querySelector("input")?.focus(), 350);
  }
}

class GlasPlanerEditor extends GlasEditor {
  render() {
    // Standardwerte sichtbar machen (nicht gesetzt = an)
    for (const k of ["ohne_datum", "seite_planer", "seite_kalender", "seite_monat", "seite_schichten"]) if (this._config[k] === undefined) this._config[k] = true;
    if (this._config.max_aufgaben === undefined) this._config.max_aufgaben = 6;
    super.render();
  }
  schema() {
    return [
      { name: "titel", selector: { text: {} } },
      { name: "ohne_datum", selector: { boolean: {} } },
      { name: "max_aufgaben", selector: { number: { min: 0, max: 30, mode: "box" } } },
      { name: "planer_pfad", selector: { text: {} } },
      { type: "grid", name: "", schema: [{ name: "seite_planer", selector: { boolean: {} } }, { name: "seite_kalender", selector: { boolean: {} } }] },
      { type: "grid", name: "", schema: [{ name: "seite_monat", selector: { boolean: {} } }, { name: "seite_schichten", selector: { boolean: {} } }] },
    ];
  }
  labels() { return { titel: "Titel (leer = „Heute, 20. Nov.“)", ohne_datum: "Aufgaben ohne Datum mitzeigen", max_aufgaben: "Höchstens so viele erledigte+offene Aufgaben (0 = alle)", planer_pfad: "Pfad zum Planer", seite_planer: "Seite Planer", seite_kalender: "Seite Kalender (7 Tage)", seite_monat: "Seite Monat (kleiner Kalender)", seite_schichten: "Seite Schichten (Woche)" }; }
  hilfen() { return { titel: "Welche Person gezeigt wird, steuert die Personenwahl in der Kopf-Karte (C, L, Tablet)." }; }
}
