// ---------------------------------------------------------------------------
// Einrichtung: Übersicht wie die iOS-Einstellungen + Assistent, der durch alles führt
// Alles wird aus Home Assistant vorgeschlagen (Bereiche, Personen, Geräte, Karten)
// ---------------------------------------------------------------------------
const EINR_CSS = `
.oben .zurueck{margin-left:-6px}
.oben .luft{flex:1}
.gross-titel{text-wrap:balance;margin:var(--g-a1) 0 var(--g-a4);font-size:var(--g-s-titel);font-weight:800;letter-spacing:-.4px}
.zeile.weiter-zeile{cursor:pointer}
.zeile:has(> button.weiter) > :is(.name,.sym,.pfeil,.wert,.punkt){pointer-events:none}
.zeile:has(> button.weiter):active{background:var(--g-fuell)}
.zeile .wert{flex:none;max-width:45%;font-size:var(--g-s-klein);color:var(--g-text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sym.blau{background:var(--g-akzent-voll);color:#fff}.sym.gruen{background:var(--g-gruen-voll);color:#fff}.sym.orange{background:#c25e00;color:#fff}
.sym.lila{background:var(--g-lila-voll);color:#fff}.sym.rot{background:var(--g-rot-voll);color:#fff}.sym.grau{background:#6e6e73;color:#fff}
.punkt{flex:none;width:8px;height:8px;border-radius:50%;background:var(--g-fuell)}.punkt.an{background:var(--g-gruen-voll)}
.held{padding:var(--g-a5) var(--g-a4);border-radius:var(--g-r);text-align:center;background:var(--g-blatt);border:1px solid var(--g-glas-rand);margin-bottom:var(--g-a4)}
.held .as-sym{margin-top:0}
.held h3{margin:0 0 6px;font-size:var(--g-s-h2);font-weight:700}
.held p{margin:0 auto var(--g-a4);max-width:440px;color:var(--g-text2);font-size:var(--g-s-text);line-height:1.4}
.neu .knopf{min-height:34px;padding:0 var(--g-a3);font-size:var(--g-s-klein)}
.neu .knopf.haupt{flex:none}
.karte-info{margin:0 var(--g-a3) var(--g-a3);font-size:var(--g-s-text);color:var(--g-text2);line-height:1.4}
/* Assistent */
.as{display:flex;flex-direction:column;min-height:calc(100vh - 140px);min-height:calc(100dvh - 140px)}
.as-kopf{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:var(--g-a3);min-height:52px;padding-top:env(safe-area-inset-top)}
.fortschritt{flex:1;display:flex;gap:6px}
.fortschritt span{flex:1;height:4px;border-radius:2px;background:var(--g-fuell);transition:background-color .3s ease}
.fortschritt span.an{background:var(--g-akzent-voll)}
.as-schritt{font-size:var(--g-s-klein);color:var(--g-text2);white-space:nowrap}
.text-knopf{min-height:44px;padding:0 var(--g-a2);font-size:var(--g-s-text);color:var(--g-akzent)}
.as-inhalt{flex:1;animation:as-rein .26s cubic-bezier(.23,1,.32,1)}
.as-inhalt.rueck{animation-name:as-zurueck}
@keyframes as-rein{from{opacity:0;transform:translateX(28px)}}
@keyframes as-zurueck{from{opacity:0;transform:translateX(-28px)}}
@media (prefers-reduced-motion:reduce){.as-inhalt,.as-inhalt.rueck{animation:as-blende .2s ease}@keyframes as-blende{from{opacity:0}}}
.as-sym{width:64px;height:64px;margin:var(--g-a5) auto var(--g-a3);border-radius:18px;display:flex;align-items:center;justify-content:center;background:var(--g-akzent-voll);color:#fff;--mdc-icon-size:34px;box-shadow:0 8px 24px rgba(0,0,0,.15)}
.as-sym ha-icon,.held .as-sym ha-icon{--mdc-icon-size:34px}
.as-sym.gruen{background:var(--g-gruen-voll)}.as-sym.orange{background:#c25e00}.as-sym.lila{background:var(--g-lila-voll)}
.as h1{margin:0;text-align:center;text-wrap:balance;font-size:var(--g-s-titel);font-weight:800;letter-spacing:-.4px}
.as-text{text-wrap:pretty;max-width:520px;margin:var(--g-a2) auto var(--g-a5);text-align:center;font-size:var(--g-s-text);line-height:1.45;color:var(--g-text2)}
.as-gruppe-kopf{display:flex;align-items:baseline;justify-content:space-between;margin:var(--g-a4) var(--g-a3) var(--g-a2)}
.as-gruppe-kopf h2{margin:0}
.as-gruppe-kopf button{font-size:var(--g-s-klein);color:var(--g-akzent);min-height:32px}
.zeile.wahl{cursor:pointer;-webkit-tap-highlight-color:transparent}
.zeile.wahl:active{background:var(--g-fuell)}
.haken{flex:none;width:26px;height:26px;border-radius:50%;border:2px solid var(--g-text2);display:flex;align-items:center;justify-content:center;color:transparent;--mdc-icon-size:18px;
  transition:background-color .15s ease,border-color .15s ease,transform .15s cubic-bezier(.23,1,.32,1)}
.zeile.wahl:active .haken{transform:scale(.9)}
.haken[aria-checked="true"]{background:var(--g-akzent-voll);border-color:var(--g-akzent-voll);color:#fff}
.zeile.nicht{opacity:.55}
.tipp{display:flex;gap:var(--g-a3);align-items:flex-start;margin:var(--g-a4) var(--g-a1) 0;padding:var(--g-a3) var(--g-a4);border-radius:var(--g-r-klein);background:var(--g-fuell);font-size:var(--g-s-klein);line-height:1.4;color:var(--g-text)}
.tipp ha-icon{flex:none;--mdc-icon-size:20px;color:var(--g-akzent)}
.schritte{max-width:420px;margin:0 auto}
.schritte .zeile{min-height:56px}
.felder{display:grid;grid-template-columns:1fr 1fr;gap:var(--g-a2);padding:0 var(--g-a3) var(--g-a3) 56px;background:var(--g-blatt)}
.felder input{min-width:0;height:40px;padding:0 var(--g-a3);border-radius:10px;border:1px solid var(--g-glas-rand);background:var(--g-fuell);color:var(--g-text);font:inherit;font-size:16px}
@media (max-width:480px){.felder{grid-template-columns:1fr;padding-left:var(--g-a3)}}
.as-leiste{position:sticky;bottom:0;z-index:5;display:flex;align-items:center;gap:var(--g-a3);margin-top:var(--g-a5);padding:var(--g-a3) 0 calc(var(--g-a3) + env(safe-area-inset-bottom))}
.as-leiste::before{content:"";position:absolute;inset:calc(-1 * var(--g-a5)) calc(-1 * var(--g-a4)) 0;z-index:-1;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);
  -webkit-mask-image:linear-gradient(to bottom,transparent,#000 45%);mask-image:linear-gradient(to bottom,transparent,#000 45%)}
.as-leiste .knopf{box-shadow:0 6px 20px rgba(0,0,0,.12)}
.as-leiste .knopf.haupt{flex:1;justify-content:center;min-height:50px;font-size:var(--g-s-text)}
.as-leiste .knopf.zweit{min-height:50px}
.as-zweit{display:flex;justify-content:center;margin-top:var(--g-a2)}
.zusammen .name b{white-space:normal}
.zusammen .zeile .haken{border:0;background:var(--g-gruen-voll);color:#fff}
`;

const KARTEN_INFO = [
  ["hinweise", "Warnungen", "mdi:alert-outline", "glas-hinweise-card-editor", "rot", "Erscheinen nur, wenn etwas zutrifft: Fenster offen und es regnet, oder Fenster offen und keiner ist zu Hause."],
  ["wetter", "Wetter", "mdi:weather-partly-cloudy", "glas-wetter-card-editor", "blau", "Aktuelles Wetter mit Vorhersage für die nächsten Stunden und Tage."],
  ["planer", "Planer & Kalender", "mdi:calendar-check", "glas-planer-card-editor", "rot", "Aufgaben, Termine und Schichten aus deinem Planer, zum Durchwischen."],
  ["sicherheit", "Sicherheit", "mdi:shield-home-outline", "glas-sicherheit-card-editor", "gruen", "Alarmanlage, offene Fenster und Türen, Kamera."],
  ["drucker", "Drucker & Werkstatt", "mdi:printer-3d-nozzle", "glas-drucker-card-editor", "orange", "Druckfortschritt, Steuerung, Kamera, Warteschlange und knappes Filament."],
  ["robi", "Robi", "mdi:robot-vacuum", "glas-robi-card-editor", "lila", "Saugroboter starten, Räume wählen, Akku und Station."],
  ["gaeste", "Gäste", "mdi:qrcode", "glas-gaeste-card-editor", "grau", "QR-Code, mit dem Gäste ins WLAN kommen."],
];
const kartenInfo = (id) => KARTEN_INFO.find(([k]) => k === id);
const SEITEN = { raeume: ["Räume", "mdi:sofa-outline", "blau"], start: ["Startseite & Favoriten", "mdi:star-outline", "orange"], personen: ["Personen", "mdi:account-multiple-outline", "gruen"],
  aussehen: ["Aussehen", "mdi:palette-outline", "lila"], kontroll: ["Kontrollzentrum & Insel", "mdi:tune-vertical-variant", "grau"], dashboard: ["Dashboard „Zuhause“", "mdi:view-dashboard-outline", "grau"] };
const AS_SCHRITTE = ["start", "raeume", "personen", "karten", "favoriten", "fertig"];

// Neuer Raum aus einem HA-Bereich, mit vorgeschlagenen Geräten
function raumAusBereich(hass, bereich, vorhanden = []) {
  const a = hass.areas?.[bereich] || {};
  let hash = slug(a.name || bereich);
  while (vorhanden.some((r) => r.hash === hash)) hash += "-2";
  return { name: a.name || bereich, icon: a.icon || "mdi:door", bereich, hash, geraete: raumGeraeteVorschlag(hass, bereich) };
}
const haBereiche = (h) => Object.values(h.areas || {}).sort((a, b) => (a.floor_id || "").localeCompare(b.floor_id || "") || (a.name || "").localeCompare(b.name || "", "de"));
const haPersonen = (h) => Object.keys(h.states).filter((e) => e.startsWith("person.")).map((e) => h.states[e]);
function personAusHa(p) {
  const n = p.attributes.friendly_name || p.entity_id.slice(7);
  return { name: n, kurz: n.slice(0, 1).toUpperCase(), entity: p.entity_id, ...(p.attributes.user_id ? { benutzer: p.attributes.user_id } : {}) };
}
const ZAEHL_NAMEN = { light: ["Licht", "Lichter"], climate: ["Heizung", "Heizungen"], cover: ["Rollo", "Rollos"], fenster: ["Fenster", "Fenster"], media_player: ["Lautsprecher", "Lautsprecher"], switch: ["Steckdose", "Steckdosen"] };
function geraeteText(h, geraete) {
  const an = geraete.filter((g) => g.an !== false && g.entity);
  const z = {};
  an.forEach((g) => { const d = domainVon(g.entity), k = d === "binary_sensor" ? "fenster" : d; if (ZAEHL_NAMEN[k]) z[k] = (z[k] || 0) + 1; });
  const teile = Object.entries(z).map(([k, n]) => `${n} ${ZAEHL_NAMEN[k][n === 1 ? 0 : 1]}`);
  return an.length ? teile.slice(0, 3).join(", ") || `${an.length} ${an.length === 1 ? "Gerät" : "Geräte"}` : "Keine Geräte gefunden";
}

// Was gibt es bei dir? Pro Karte: gefunden ja/nein, was, und eine fertige Einstellung
function glasErkennen(h) {
  const alle = (d) => Object.keys(h.states).filter((e) => e.startsWith(`${d}.`) && !h.entities?.[e]?.hidden);
  const name = (e) => h.states[e]?.attributes.friendly_name || e;
  const fenster = Object.keys(h.states).filter((e) => e.startsWith("binary_sensor.") && ["window", "door", "garage_door"].includes(h.states[e].attributes.device_class));
  const wetter = alle("weather")[0], vac = alle("vacuum")[0], alarm = alle("alarm_control_panel")[0];
  const geraete = Object.values(h.devices || {});
  const drucker = geraete.find((d) => /bambu/i.test(`${d.manufacturer || ""} ${d.model || ""}`) && !d.via_device_id) || geraete.find((d) => /bambu/i.test(`${d.manufacturer || ""}`));
  const druckerKam = drucker && Object.keys(h.entities || {}).filter((e) => h.entities[e].device_id === drucker.id && e.startsWith("camera."));
  const kamera = alle("camera").find((e) => !(druckerKam || []).includes(e));
  const komp = h.config?.components || [];
  const planer = komp.includes("planer");
  const druckerName = drucker ? (drucker.name_by_user || drucker.name || "Drucker").replace(/^Bambu Lab\s*/i, "") : "";
  const stecker = drucker && alle("switch").find((e) => /drucker|printer|p1s|p1p|x1c|a1|bambu/i.test(`${e} ${name(e)}`) && h.entities?.[e]?.device_id !== drucker.id);
  const n = fenster.length;
  return {
    hinweise: { gefunden: n > 0, text: n ? `Achtet auf ${n} Fenster und Türen` : "Keine Fenster- oder Türsensoren gefunden", cfg: { an: true } },
    wetter: { gefunden: !!wetter, text: wetter ? name(wetter) : "Keine Wetter-Entität gefunden", cfg: { entity: wetter } },
    planer: { gefunden: planer, text: planer ? "Planer-Integration gefunden" : "Planer-Integration ist nicht installiert", cfg: {} },
    sicherheit: { gefunden: !!(alarm || n || kamera), text: [alarm && name(alarm), n && `${n} Fenster/Türen`, kamera && name(kamera)].filter(Boolean).join(" · ") || "Keine Alarmanlage, Fenster oder Kamera gefunden",
      cfg: { fenster_auto: true, scharf_modus: "away", verlauf: 6, ...(alarm ? { alarm } : {}), ...(kamera ? { kamera } : {}) } },
    drucker: { gefunden: !!drucker, text: drucker ? `${drucker.name_by_user || drucker.name}${stecker ? ` · Steckdose ${name(stecker)}` : ""}` : "Kein Bambu-Lab-Drucker gefunden",
      cfg: drucker ? { name: druckerName || "Drucker", geraet: drucker.id, knapp_g: 200, ...(komp.includes("filament_werkstatt") ? { werkstatt: true } : {}), ...(stecker ? { stecker } : {}) } : {} },
    robi: { gefunden: !!vac, text: vac ? name(vac) : "Kein Saugroboter gefunden", cfg: vac ? { entity: vac, name: "Robi", befehl: "spot_area" } : {} },
    gaeste: { gefunden: true, braucht: true, text: "Braucht WLAN-Name und Passwort", cfg: { verschluesselung: "WPA" } },
  };
}

// Favoriten-Vorschläge: Steuerbares aus den Räumen, Wichtigstes zuerst
const FAV_PRIO = { climate: 0, light: 1, cover: 2, lock: 2, fan: 3, media_player: 4, switch: 5, input_boolean: 6 };
const FAV_HOECHST = { climate: 2, light: 3, cover: 1, lock: 1, fan: 1, media_player: 1, switch: 1, input_boolean: 0 };
function favoritenKandidaten(h, bereiche) {
  const l = [];
  bereiche.forEach((b, ri) => entitaetenImBereich(h, b, Object.keys(FAV_PRIO)).forEach((e) => l.push({ e, b, ri, p: FAV_PRIO[domainVon(e)] })));
  return l.sort((a, b) => a.p - b.p || a.ri - b.ri);
}
function favoritenVorwahl(kandidaten) {
  const z = {}, wahl = [];
  kandidaten.forEach(({ e }) => { const d = domainVon(e); if (wahl.length < 6 && (z[d] || 0) < FAV_HOECHST[d]) { z[d] = (z[d] || 0) + 1; wahl.push(e); } });
  return wahl;
}

Object.assign(GlasEinstellungen.prototype, {
  gehe(seite) { this._seite = seite; this._raum = null; this._nachOben = true; this.zeichnen(); },
  abschnittAlle(id) {
    const S = this._d.startseiten;
    S.alle = startseiteVon(this._d, null);
    return S.alle.abschnitte.find((a) => a.id === id);
  },
  // Ist eine Karte eingerichtet und auf der Startseite?
  kartenStatus(id, erk) {
    const B = this._d.bereiche || {}, b = B[id], h = this._hass;
    const eine = (d) => Object.keys(h.states).filter((x) => x.startsWith(`${d}.`)).length === 1;
    const fertig = { hinweise: true, wetter: !!(b?.entity || eine("weather")), planer: !!erk.planer.gefunden, sicherheit: !!b, drucker: !!(b?.geraet || b?.fortschritt),
      robi: !!(b?.entity || eine("vacuum")), gaeste: !!(b?.ssid || b?.ssid_entity) }[id];
    const an = id === "hinweise" ? b?.an !== false : id === "planer" ? b?.an !== false && this.abschnittAlle(id)?.an !== false : this.abschnittAlle(id)?.an !== false;
    return { fertig, an: fertig && an };
  },

  zeichnen() {
    if (this._seite === "assistent") { this.assistentZeichnen(); return; }
    const S = this._seite, imRaum = S === "raeume" && this._raum !== null;
    const karte = S?.startsWith("karte:") ? kartenInfo(S.slice(6)) : null;
    const titel = S === null ? "Glas" : imRaum ? this._d.raeume[this._raum]?.name || "Raum" : karte ? karte[1] : SEITEN[S]?.[0] || "";
    const scroll = this._nachOben ? 0 : window.scrollY;
    this._nachOben = false;
    this.$(".seite").innerHTML = `<div class="oben"><button class="klein-knopf menue" aria-label="Seitenleiste"><ha-icon data-i="mdi:menu"></ha-icon></button>
      ${S === null ? "" : `<button class="zurueck"><ha-icon data-i="mdi:chevron-left"></ha-icon>${imRaum ? "Räume" : "Glas"}</button>`}<span class="luft"></span>
      <span class="status" aria-live="polite"></span></div><h1 class="gross-titel">${esc(titel)}</h1><div class="inhalt"></div>`;
    this.$(".menue").addEventListener("click", () => fire(this, "hass-toggle-menu"));
    this.$(".zurueck")?.addEventListener("click", () => { if (imRaum) { this._raum = null; this._nachOben = true; this.zeichnen(); } else this.gehe(null); });
    const box = this.$(".inhalt");
    if (S === null) this.uebersicht(box);
    else if (S === "raeume") (this._raum === null ? this.raeumeListe(box) : this.raumDetail(box));
    else if (S === "start") this.startseite(box);
    else if (S === "personen") this.personen(box);
    else if (S === "aussehen") this.aussehen(box);
    else if (S === "kontroll") this.kontrollSeite(box);
    else if (S === "dashboard") this.dashboardBlock(box);
    else if (karte) this.kartenSeite(box, karte);
    this.icons();
    window.scrollTo(0, scroll);
  },
  icons() {
    this.$$("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
    this.$$("ha-state-icon[data-e]").forEach((el) => { el.hass = this._hass; el.stateObj = this._hass.states[el.dataset.e]; });
  },
  zeilenLink(g, { seite, icon, farbe, titel, wert = "", punkt = null }) {
    const z = this.html(g, `<div class="zeile weiter-zeile"><button class="weiter" aria-label="${esc(titel)}"></button>
      <span class="sym ${farbe}"><ha-icon data-i="${icon}"></ha-icon></span><span class="name"><b>${esc(titel)}</b></span>
      ${wert ? `<span class="wert">${esc(wert)}</span>` : ""}${punkt === null ? "" : `<span class="punkt ${punkt ? "an" : ""}" aria-hidden="true"></span>`}
      <ha-icon class="pfeil" data-i="mdi:chevron-right"></ha-icon></div>`);
    z.querySelector(".weiter").addEventListener("click", () => this.gehe(seite));
  },

  // Fenster/Türen oben im Raum: jeden Sensor einzeln an/aus
  raumFensterGruppe(box, raum) {
    const h = this._hass, alle = raumFensterAlle(h, raum), auto = raumFensterAuto(h, raum.bereich);
    this.html(box, `<h2>Fenster und Türen oben im Raum</h2>`);
    const g = this.html(box, `<div class="gruppe"></div>`);
    if (!alle.length) g.innerHTML = `<div class="leise-zeile">Im Bereich gibt es keine Fenster- oder Türsensoren. Unten kannst du einen hinzufügen.</div>`;
    let gezeigt = raumFensterGezeigt(h, raum);
    alle.forEach((e) => {
      const st = h.states[e], an = gezeigt.includes(e), fremd = !auto.includes(e);
      const z = this.html(g, `<div class="zeile ${an ? "" : "aus"}"><span class="sym"><ha-state-icon data-e="${esc(e)}"></ha-state-icon></span>
        <span class="name"><b>${esc(st?.attributes.friendly_name || e)}</b><span>${st ? esc(Geraet.zustand(h, st, null)) : "nicht gefunden"}${fremd ? " · hinzugefügt" : ""}</span></span>
        <button class="schalter" role="switch" aria-checked="${an}" aria-label="${esc(st?.attributes.friendly_name || e)} oben anzeigen"></button></div>`);
      z.querySelector(".schalter").addEventListener("click", (ev) => {
        const neu = ev.currentTarget.getAttribute("aria-checked") !== "true";
        ev.currentTarget.setAttribute("aria-checked", neu); z.classList.toggle("aus", !neu);
        gezeigt = neu ? [...gezeigt, e] : gezeigt.filter((x) => x !== e);
        raumFensterSetzen(h, raum, gezeigt);
        this.speichern();
        if (fremd && !neu) this.zeichnen();
      });
    });
    const hinzu = this.html(g, `<div class="hinzu"></div>`);
    this.form(hinzu, {}, [{ name: "e", selector: { entity: { filter: { domain: "binary_sensor", device_class: CHIP_KLASSEN } } } }], { e: "Weiteren Sensor hinzufügen" }, (v) => {
      if (!v.e || gezeigt.includes(v.e)) return;
      raumFensterSetzen(h, raum, [...gezeigt, v.e]); this.speichern(); this.zeichnen();
    });
    this.html(box, `<div class="fuss">Ausgeschaltete Sensoren erscheinen nicht mehr als Chip oben im Raum. In „Fenster und Türen“ und bei den Warnungen bleiben sie.</div>`);
  },

  // ---------------- Übersicht ----------------
  uebersicht(box) {
    const d = this._d, h = this._hass, erk = glasErkennen(h);
    const leer = !(d.raeume || []).length && !(d.personen || []).length;
    if (leer) {
      const held = this.html(box, `<div class="held glas"><div class="as-sym"><ha-icon data-i="mdi:home-heart"></ha-icon></div>
        <h3>Los geht’s</h3><p>Der Assistent führt dich in vier kurzen Schritten durch alles. Räume, Personen und Geräte sind aus Home Assistant schon vorausgefüllt.</p>
        <button class="knopf haupt">Einrichtung starten</button></div>`);
      held.querySelector("button").addEventListener("click", () => { this.assistentStarten(); this.zeichnen(); });
    }
    if (!leer) this.neuGefunden(box, erk);
    this.html(box, `<h2>Zuhause</h2>`);
    let g = this.html(box, `<div class="gruppe"></div>`);
    const r = d.raeume || [], p = (d.personen || []).filter((x) => !x.tablet), s = startseiteVon(d, null);
    const favN = (s.favoriten || []).filter((f) => f.an !== false).length;
    this.zeilenLink(g, { seite: "raeume", ...this.seiteInfo("raeume"), wert: r.length ? `${r.length} ${r.length === 1 ? "Raum" : "Räume"}` : "Keine" });
    this.zeilenLink(g, { seite: "start", ...this.seiteInfo("start"), wert: `${favN} Favoriten` });
    this.zeilenLink(g, { seite: "personen", ...this.seiteInfo("personen"), wert: p.map((x) => x.name).join(", ") || "Keine" });
    this.html(box, `<h2>Karten auf der Startseite</h2>`);
    g = this.html(box, `<div class="gruppe"></div>`);
    KARTEN_INFO.forEach(([id, titel, icon, , farbe]) => {
      const st = this.kartenStatus(id, erk);
      this.zeilenLink(g, { seite: `karte:${id}`, icon, farbe, titel, wert: st.an ? "An" : st.fertig ? "Aus" : "Nicht eingerichtet", punkt: st.an });
    });
    this.html(box, `<h2>Darstellung</h2>`);
    g = this.html(box, `<div class="gruppe"></div>`);
    const A = { modus: "auto", hintergrund: "klassisch", ...(d.aussehen || {}) };
    this.zeilenLink(g, { seite: "aussehen", ...this.seiteInfo("aussehen"), wert: `${{ auto: "Automatisch", hell: "Hell", dunkel: "Dunkel" }[A.modus] || ""} · ${HINTERGRUENDE[A.hintergrund]?.name || (A.hintergrund === "tageszeit" ? "Nach Tageszeit" : "Wie HA")}` });
    this.zeilenLink(g, { seite: "kontroll", ...this.seiteInfo("kontroll"), wert: d.kontrollzentrum?.an === false ? "Aus" : "An" });
    this.zeilenLink(g, { seite: "dashboard", ...this.seiteInfo("dashboard") });
    if (!leer) {
      const a = this.html(box, `<div class="aktionen"><button class="knopf"><ha-icon data-i="mdi:auto-fix"></ha-icon>Assistent erneut durchgehen</button></div>`);
      a.querySelector("button").addEventListener("click", () => { this.assistentStarten(); this.zeichnen(); });
      this.html(box, `<div class="fuss">Der Assistent behält alles, was du schon eingestellt hast, und schlägt nur Neues vor.</div>`);
    }
  },
  seiteInfo(id) { const [titel, icon, farbe] = SEITEN[id]; return { titel, icon, farbe }; },

  // Neues in Home Assistant seit der Einrichtung: mit einem Tipp übernehmen oder ausblenden
  neuGefunden(box, erk) {
    const d = this._d, h = this._hass;
    const ig = (d.ignoriert = d.ignoriert || {});
    const igL = (k) => (ig[k] = ig[k] || []);
    const posten = [];
    const raeume = d.raeume || [];
    const bereiche = haBereiche(h).filter((a) => !raeume.some((r) => r.bereich === a.area_id) && !igL("bereiche").includes(a.area_id) && raumGeraeteVorschlag(h, a.area_id).some((g) => g.an));
    if (bereiche.length) posten.push({ icon: "mdi:sofa-outline", farbe: "blau", titel: bereiche.length === 1 ? `Neuer Bereich: ${bereiche[0].name}` : `${bereiche.length} neue Bereiche`, text: bereiche.map((a) => a.name).join(", "),
      los: () => { bereiche.forEach((a) => { d.raeume = [...(d.raeume || []), raumAusBereich(h, a.area_id, d.raeume || [])]; }); }, weg: () => igL("bereiche").push(...bereiche.map((a) => a.area_id)) });
    const fehlen = [];
    raeume.forEach((r) => { if (!r.bereich || !r.geraete) return; raumGeraeteVorschlag(h, r.bereich).filter((v) => v.an && !r.geraete.some((x) => x.entity === v.entity) && !igL("geraete").includes(v.entity)).forEach((v) => fehlen.push({ r, v })); });
    if (fehlen.length) posten.push({ icon: "mdi:lightbulb-on-outline", farbe: "orange", titel: `${fehlen.length} ${fehlen.length === 1 ? "neues Gerät" : "neue Geräte"} in deinen Räumen`,
      text: fehlen.slice(0, 3).map(({ v }) => h.states[v.entity]?.attributes.friendly_name || v.entity).join(", ") + (fehlen.length > 3 ? " …" : ""),
      los: () => fehlen.forEach(({ r, v }) => { r.geraete = [...r.geraete, v]; }), weg: () => igL("geraete").push(...fehlen.map(({ v }) => v.entity)) });
    const pers = haPersonen(h).filter((p) => !(d.personen || []).some((x) => x.entity === p.entity_id) && !igL("personen").includes(p.entity_id));
    if (pers.length && (d.personen || []).length) posten.push({ icon: "mdi:account-plus-outline", farbe: "gruen", titel: pers.length === 1 ? `Neue Person: ${pers[0].attributes.friendly_name}` : `${pers.length} neue Personen`, text: "Aus Home Assistant",
      los: () => { const t = (d.personen || []).filter((x) => x.tablet); d.personen = [...(d.personen || []).filter((x) => !x.tablet), ...pers.map(personAusHa), ...t]; }, weg: () => igL("personen").push(...pers.map((p) => p.entity_id)) });
    KARTEN_INFO.forEach(([id, titel, icon, , farbe]) => {
      const e = erk[id];
      if (!e.gefunden || e.braucht || id === "hinweise" || this.kartenStatus(id, erk).fertig || igL("karten").includes(id)) return;
      posten.push({ icon, farbe, titel: `${titel} gefunden`, text: e.text, los: () => { d.bereiche[id] = { ...e.cfg }; const a = this.abschnittAlle(id); if (a) a.an = true; }, weg: () => igL("karten").push(id) });
    });
    if (!posten.length) return;
    this.html(box, `<h2>Neu gefunden</h2>`);
    const g = this.html(box, `<div class="gruppe neu"></div>`);
    posten.forEach((x) => {
      const z = this.html(g, `<div class="zeile"><span class="sym ${x.farbe}"><ha-icon data-i="${x.icon}"></ha-icon></span>
        <span class="name"><b>${esc(x.titel)}</b><span>${esc(x.text)}</span></span>
        <button class="knopf haupt" data-los>Übernehmen</button><button class="klein-knopf" data-weg aria-label="Nicht übernehmen"><ha-icon data-i="mdi:close"></ha-icon></button></div>`);
      z.querySelector("[data-los]").addEventListener("click", () => { x.los(); this.speichern(); this.zeichnen(); });
      z.querySelector("[data-weg]").addEventListener("click", () => { x.weg(); this.speichern(); this.zeichnen(); });
    });
    this.html(box, `<div class="fuss">„×“ blendet den Vorschlag dauerhaft aus.</div>`);
  },

  // ---------------- Eine Karte ----------------
  kartenSeite(box, [id, titel, icon, tag, , info]) {
    const B = this._d.bereiche, erk = glasErkennen(this._hass), e = erk[id], st = this.kartenStatus(id, erk);
    this.html(box, `<p class="karte-info">${esc(info)}</p>`);
    const g = this.html(box, `<div class="gruppe"></div>`);
    const z = this.html(g, `<div class="zeile"><span class="name"><b>Auf der Startseite zeigen</b><span>${st.fertig ? "" : "Wird angezeigt, sobald sie eingerichtet ist"}</span></span>
      <button class="schalter" role="switch" aria-checked="${id === "hinweise" ? B.hinweise?.an !== false : (id === "planer" ? B.planer?.an !== false : true) && this.abschnittAlle(id)?.an !== false}" aria-label="Auf der Startseite zeigen"></button></div>`);
    z.querySelector(".schalter").addEventListener("click", (ev) => {
      const an = ev.currentTarget.getAttribute("aria-checked") !== "true";
      ev.currentTarget.setAttribute("aria-checked", an);
      if (id === "hinweise" || id === "planer") B[id] = { ...(B[id] || {}), an };
      if (id !== "hinweise") this.abschnittAlle(id).an = an;
      this.speichern();
    });
    if (e.gefunden && !e.braucht && id !== "hinweise" && JSON.stringify(e.cfg) !== JSON.stringify({}) && !st.fertig) {
      const v = this.html(g, `<div class="zeile"><span class="sym ${kartenInfo(id)[4]}"><ha-icon data-i="mdi:auto-fix"></ha-icon></span><span class="name"><b>Automatisch gefunden</b><span>${esc(e.text)}</span></span>
        <button class="knopf haupt">Übernehmen</button></div>`);
      v.querySelector("button").addEventListener("click", () => { B[id] = { ...e.cfg, ...(B[id] || {}) }; const a = this.abschnittAlle(id); if (a) a.an = true; this.speichern(); this.zeichnen(); });
    } else if (!e.gefunden) this.html(box, `<div class="fuss">${esc(e.text)}.</div>`);
    this.html(box, `<h2>Einstellungen</h2>`);
    const f = this.html(box, `<div class="gruppe form"></div>`);
    this.editor(f, tag, B[id] || {}, (cfg) => { B[id] = cfg; this.speichern(); });
    this.html(box, `<div class="fuss">Im Dashboard selbst geht es auch: Stift oben antippen, dann die Karte.</div>`);
  },

  // ---------------- Assistent ----------------
  assistentStarten() {
    const d = this._d, h = this._hass, erk = glasErkennen(h);
    const r = d.raeume || [];
    const bereiche = haBereiche(h);
    const raeume = {};
    // vorhandene Räume bleiben, neue Bereiche mit Geräten werden vorgeschlagen (außer ausgeblendete)
    bereiche.forEach((a) => { raeume[a.area_id] = r.some((x) => x.bereich === a.area_id) || (!(d.ignoriert?.bereiche || []).includes(a.area_id) && raumGeraeteVorschlag(h, a.area_id).some((g) => g.an)); });
    const personen = {};
    haPersonen(h).forEach((p) => { personen[p.entity_id] = (d.personen || []).length ? (d.personen || []).some((x) => x.entity === p.entity_id) : true; });
    const karten = {};
    KARTEN_INFO.forEach(([id]) => { const st = this.kartenStatus(id, erk); karten[id] = st.fertig ? st.an : erk[id].gefunden && !erk[id].braucht; });
    const favAlt = (startseiteVon(d, null).favoriten || []).filter((f) => f.entity).map((f) => f.entity);
    this._as = { schritt: 0, richtung: 1, raeume, personen, tablet: (d.personen || []).length ? (d.personen || []).some((x) => x.tablet) : true, karten,
      gaeste: { ssid: d.bereiche?.gaeste?.ssid || "", passwort: d.bereiche?.gaeste?.passwort || "" }, fav: favAlt.length ? new Set(favAlt) : null, favAlle: false, dashboard: true, ergebnis: null };
    this._seite = "assistent";
    this._nachOben = true;
  },
  asGewaehlteBereiche() { return haBereiche(this._hass).filter((a) => this._as.raeume[a.area_id]).map((a) => a.area_id); },
  asWeiter(n) {
    const A = this._as;
    A.richtung = n;
    A.schritt = Math.max(0, Math.min(AS_SCHRITTE.length - 1, A.schritt + n));
    this.zeichnen();
    window.scrollTo(0, 0);
  },
  assistentZeichnen() {
    const A = this._as, h = this._hass, schritt = AS_SCHRITTE[A.schritt];
    const zahl = A.schritt >= 1 && A.schritt <= 4;
    const seite = this.$(".seite");
    seite.innerHTML = `<div class="as"><div class="as-kopf">
        ${zahl ? `<div class="fortschritt" aria-hidden="true">${[1, 2, 3, 4].map((i) => `<span class="${i <= A.schritt ? "an" : ""}"></span>`).join("")}</div><span class="as-schritt">Schritt ${A.schritt} von 4</span>` : `<span class="luft" style="flex:1"></span>`}
        ${schritt === "fertig" ? "" : `<button class="text-knopf" data-abbruch>${(this._d.raeume || []).length ? "Abbrechen" : "Später"}</button>`}</div>
      <div class="as-inhalt ${A.richtung < 0 ? "rueck" : ""}"></div><div class="as-leiste"></div></div>`;
    seite.querySelector("[data-abbruch]")?.addEventListener("click", () => this.gehe(null));
    const box = seite.querySelector(".as-inhalt"), leiste = seite.querySelector(".as-leiste");
    const kopf = (icon, titel, text, farbe = "") => this.html(box, `<div><div class="as-sym ${farbe}"><ha-icon data-i="${icon}"></ha-icon></div><h1>${titel}</h1><p class="as-text">${text}</p></div>`);
    const knoepfe = (haupt, hauptText, zurueck = true) => {
      leiste.innerHTML = `${zurueck ? `<button class="knopf zweit" data-zurueck><ha-icon data-i="mdi:chevron-left"></ha-icon>Zurück</button>` : ""}<button class="knopf haupt" data-haupt>${hauptText}</button>`;
      leiste.querySelector("[data-zurueck]")?.addEventListener("click", () => this.asWeiter(-1));
      leiste.querySelector("[data-haupt]").addEventListener("click", haupt);
    };
    const wahlZeile = (g, { an, icon, sym, farbe = "", titel, text, klick, nicht = false }) => {
      const z = this.html(g, `<div class="zeile wahl ${nicht ? "nicht" : ""}" role="checkbox" tabindex="0" aria-checked="${an}">
        <span class="haken" aria-hidden="true" aria-checked="${an}"><ha-icon data-i="mdi:check-bold"></ha-icon></span>
        ${sym || `<span class="sym ${farbe}"><ha-icon data-i="${icon}"></ha-icon></span>`}<span class="name"><b>${esc(titel)}</b><span>${esc(text)}</span></span></div>`);
      const umschalten = () => { const neu = z.getAttribute("aria-checked") !== "true"; z.setAttribute("aria-checked", neu); z.querySelector(".haken").setAttribute("aria-checked", neu); klick(neu); };
      if (!nicht) {
        z.addEventListener("click", umschalten);
        z.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); umschalten(); } });
      }
      return z;
    };
    const gruppeKopf = (titel, alleSetzen) => {
      const k = this.html(box, `<div class="as-gruppe-kopf"><h2>${titel}</h2>${alleSetzen ? `<button data-alle>Alle</button>` : ""}</div>`);
      k.querySelector("[data-alle]")?.addEventListener("click", () => { alleSetzen(); this.assistentZeichnen(); });
    };
    const tipp = (text) => this.html(box, `<div class="tipp"><ha-icon data-i="mdi:lightbulb-on-outline"></ha-icon><span>${text}</span></div>`);

    if (schritt === "start") {
      kopf("mdi:home-heart", "Willkommen", "Ich begleite dich in vier kurzen Schritten durch die Einrichtung. Alles ist aus Home Assistant schon vorausgefüllt, du hakst nur ab, was du willst. Dauert etwa eine Minute.");
      const g = this.html(box, `<div class="gruppe schritte"></div>`);
      [["mdi:sofa-outline", "blau", "Räume", "Deine Bereiche mit Lichtern, Heizung, Rollos"], ["mdi:account-multiple-outline", "gruen", "Personen", "Wer hier wohnt, mit eigener Begrüßung"],
        ["mdi:view-grid-outline", "orange", "Karten", "Wetter, Planer, Drucker, Robi … was es bei dir gibt"], ["mdi:star-outline", "lila", "Favoriten", "Die wichtigsten Geräte ganz oben"]]
        .forEach(([ic, f, t, x], i) => this.html(g, `<div class="zeile"><span class="sym ${f}"><ha-icon data-i="${ic}"></ha-icon></span><span class="name"><b>${i + 1}. ${t}</b><span>${x}</span></span></div>`));
      knoepfe(() => this.asWeiter(1), "Los geht’s", false);
      const z = this.html(box, `<div class="as-zweit"><button class="text-knopf">Alles automatisch einrichten</button></div>`);
      z.querySelector("button").addEventListener("click", () => this.asAnwenden());
    } else if (schritt === "raeume") {
      kopf("mdi:sofa-outline", "Welche Räume gehören dazu?", "Das sind deine Bereiche aus Home Assistant. Jeder Raum bringt seine Lichter, Heizung, Rollos und Fenster gleich mit. Bereiche ohne Geräte habe ich abgewählt.");
      const bereiche = haBereiche(h);
      gruppeKopf(`${Object.values(A.raeume).filter(Boolean).length} von ${bereiche.length} gewählt`, bereiche.length ? () => { const alle = bereiche.every((a) => A.raeume[a.area_id]); bereiche.forEach((a) => { A.raeume[a.area_id] = !alle; }); } : null);
      const g = this.html(box, `<div class="gruppe"></div>`);
      if (!bereiche.length) g.innerHTML = `<div class="leise-zeile">In Home Assistant sind noch keine Bereiche angelegt. Du kannst Räume später auch ohne Bereich anlegen.</div>`;
      bereiche.forEach((a) => {
        const vorhanden = (this._d.raeume || []).find((r) => r.bereich === a.area_id);
        wahlZeile(g, { an: !!A.raeume[a.area_id], icon: vorhanden?.icon || a.icon || "mdi:door", farbe: "blau", titel: vorhanden?.name || a.name,
          text: geraeteText(h, vorhanden?.geraete || raumGeraeteVorschlag(h, a.area_id)), klick: (an) => { A.raeume[a.area_id] = an; this.$(".as-gruppe-kopf h2").textContent = `${Object.values(A.raeume).filter(Boolean).length} von ${bereiche.length} gewählt`; } });
      });
      tipp("Fehlt ein Raum? Lege ihn in Home Assistant unter Einstellungen › Bereiche an, dann taucht er hier auf. Welche Geräte ein Raum zeigt, stellst du später im Raum selbst ein.");
      knoepfe(() => this.asWeiter(1), "Weiter");
    } else if (schritt === "personen") {
      kopf("mdi:account-multiple-outline", "Wer wohnt hier?", "Jede Person wird mit Namen begrüßt und kann später eine eigene Startseite bekommen. Am blauen Häuschen siehst du, wer gerade zu Hause ist.", "gruen");
      const pers = haPersonen(h);
      const g = this.html(box, `<div class="gruppe"></div>`);
      if (!pers.length) g.innerHTML = `<div class="leise-zeile">Keine Personen in Home Assistant gefunden. Du kannst sie später unter „Personen“ von Hand anlegen.</div>`;
      pers.forEach((p) => {
        const n = p.attributes.friendly_name || p.entity_id.slice(7);
        wahlZeile(g, { an: !!A.personen[p.entity_id], sym: `<span class="sym gruen" style="border-radius:50%;font-weight:700">${esc(n.slice(0, 1).toUpperCase())}</span>`, titel: n,
          text: p.state === "home" ? "Gerade zu Hause" : p.attributes.user_id ? "Hat ein Benutzerkonto" : "Ohne Benutzerkonto", klick: (an) => { A.personen[p.entity_id] = an; } });
      });
      this.html(box, `<h2 style="margin-top:var(--g-a5)">Gemeinsames Gerät</h2>`);
      const t = this.html(box, `<div class="gruppe"></div>`);
      wahlZeile(t, { an: A.tablet, icon: "mdi:tablet", farbe: "grau", titel: "Tablet an der Wand", text: "Eigene Startseite, die keiner Person gehört", klick: (an) => { A.tablet = an; } });
      tipp("Jedes Handy merkt sich, wer es benutzt. Gewechselt wird oben über die Kreise mit den Anfangsbuchstaben.");
      knoepfe(() => this.asWeiter(1), "Weiter");
    } else if (schritt === "karten") {
      kopf("mdi:view-grid-outline", "Was soll auf die Startseite?", "Ich habe nachgeschaut, was es bei dir gibt. Was ich gefunden habe, ist schon eingeschaltet.", "orange");
      const erk = glasErkennen(h);
      const da = KARTEN_INFO.filter(([id]) => erk[id].gefunden), nicht = KARTEN_INFO.filter(([id]) => !erk[id].gefunden);
      gruppeKopf("Gefunden");
      const g = this.html(box, `<div class="gruppe"></div>`);
      da.forEach(([id, titel, icon, , farbe]) => {
        const st = this.kartenStatus(id, erk);
        const z = wahlZeile(g, { an: !!A.karten[id], icon, farbe, titel, text: this._d.bereiche?.[id] && st.fertig && id !== "hinweise" && id !== "planer" ? "Schon eingerichtet" : erk[id].text,
          klick: (an) => { A.karten[id] = an; if (id === "gaeste") this.assistentZeichnen(); } });
        if (id === "gaeste" && A.karten.gaeste) {
          const f = document.createElement("div");
          f.className = "felder";
          f.innerHTML = `<input placeholder="z. B. Gäste-WLAN…" aria-label="WLAN-Name" autocomplete="off" value="${esc(A.gaeste.ssid)}"><input placeholder="Passwort…" aria-label="WLAN-Passwort" type="password" autocomplete="off" value="${esc(A.gaeste.passwort)}">`;
          const [ssid, pw] = f.querySelectorAll("input");
          ssid.addEventListener("input", () => { A.gaeste.ssid = ssid.value; });
          pw.addEventListener("input", () => { A.gaeste.passwort = pw.value; });
          z.after(f);
        }
      });
      if (nicht.length) {
        gruppeKopf("Nicht gefunden");
        const n = this.html(box, `<div class="gruppe"></div>`);
        nicht.forEach(([id, titel, icon]) => wahlZeile(n, { an: false, icon, farbe: "grau", titel, text: erk[id].text, nicht: true, klick: () => {} }));
      }
      tipp("Jede Karte kannst du später genauer einstellen: Übersicht › Karten auf der Startseite, oder im Dashboard mit dem Stift.");
      knoepfe(() => this.asWeiter(1), "Weiter");
    } else if (schritt === "favoriten") {
      const kand = favoritenKandidaten(h, this.asGewaehlteBereiche());
      if (!A.fav) A.fav = new Set(favoritenVorwahl(kand));
      kopf("mdi:star-outline", "Deine Favoriten", `Die wichtigsten Geräte stehen ganz oben auf der Startseite, ein Tipp schaltet sie. ${A.fav.size ? `${A.fav.size} habe ich vorgeschlagen.` : ""}`, "lila");
      const zeigen = A.favAlle ? kand : kand.filter((k, i) => i < 12 || A.fav.has(k.e));
      gruppeKopf(`${A.fav.size} gewählt`);
      const g = this.html(box, `<div class="gruppe"></div>`);
      if (!kand.length) g.innerHTML = `<div class="leise-zeile">In den gewählten Räumen gibt es nichts zum Schalten. Favoriten kannst du später unter „Startseite“ hinzufügen.</div>`;
      zeigen.forEach(({ e, b }) => {
        const st = h.states[e];
        wahlZeile(g, { an: A.fav.has(e), sym: `<span class="sym"><ha-state-icon data-e="${esc(e)}"></ha-state-icon></span>`, titel: st?.attributes.friendly_name || e, text: h.areas?.[b]?.name || "",
          klick: (an) => { an ? A.fav.add(e) : A.fav.delete(e); this.$(".as-gruppe-kopf h2").textContent = `${A.fav.size} gewählt`; } });
      });
      if (zeigen.length < kand.length) {
        const m = this.html(box, `<div class="as-zweit"><button class="text-knopf">Alle ${kand.length} zeigen</button></div>`);
        m.querySelector("button").addEventListener("click", () => { A.favAlle = true; this.assistentZeichnen(); });
      }
      this.html(box, `<h2 style="margin-top:var(--g-a5)">Dashboard</h2>`);
      const dg = this.html(box, `<div class="gruppe"></div>`);
      wahlZeile(dg, { an: A.dashboard, icon: "mdi:view-dashboard-outline", farbe: "blau", titel: "Dashboard „Zuhause“ anlegen", text: "Erscheint in der Seitenleiste und baut sich aus allem hier auf", klick: (an) => { A.dashboard = an; } });
      knoepfe(() => this.asAnwenden(), "Fertig stellen");
    } else if (schritt === "fertig") {
      const E = A.ergebnis || {};
      kopf("mdi:check-bold", "Fertig!", "Dein Dashboard ist eingerichtet. Alles lässt sich jederzeit ändern, hier in der Übersicht oder direkt im Dashboard mit dem Stift.", "gruen");
      const g = this.html(box, `<div class="gruppe zusammen"></div>`);
      [[`${E.raeume} ${E.raeume === 1 ? "Raum" : "Räume"} mit ${E.geraete} Geräten`], [`${E.personen} ${E.personen === 1 ? "Person" : "Personen"}${E.tablet ? " und das Tablet" : ""}`],
        [`${E.karten} ${E.karten === 1 ? "Karte" : "Karten"} auf der Startseite`], [`${E.fav} Favoriten`], [E.dashboard]].filter(([t]) => t).forEach(([t]) =>
        this.html(g, `<div class="zeile"><span class="haken" aria-hidden="true"><ha-icon data-i="mdi:check-bold"></ha-icon></span><span class="name"><b>${esc(t)}</b></span></div>`));
      tipp("Im Dashboard: Stift oben antippen, dann Kacheln verschieben, Größen ändern oder eine Kachel antippen für alle Details.");
      leiste.innerHTML = `<button class="knopf zweit" data-ueb>Feinheiten</button>${E.dashboardDa ? `<a class="knopf haupt" href="/glas-zuhause" style="text-decoration:none">Dashboard öffnen</a>` : `<button class="knopf haupt" data-ueb2>Zur Übersicht</button>`}`;
      leiste.querySelectorAll("[data-ueb],[data-ueb2]").forEach((b) => b.addEventListener("click", () => this.gehe(null)));
    }
    this.icons();
    if (this._nachOben) { this._nachOben = false; window.scrollTo(0, 0); }
  },

  // Auswahl übernehmen: Vorhandenes bleibt, Neues kommt dazu, Abgewähltes geht
  async asAnwenden() {
    const A = this._as, d = this._d, h = this._hass, erk = glasErkennen(h);
    // Räume
    const alt = d.raeume || [], gewaehlt = this.asGewaehlteBereiche();
    const neu = alt.filter((r) => !r.bereich || !h.areas?.[r.bereich] || gewaehlt.includes(r.bereich));
    gewaehlt.forEach((b) => { if (!neu.some((r) => r.bereich === b)) neu.push(raumAusBereich(h, b, neu)); });
    neu.forEach((r) => { if (!r.geraete) r.geraete = raumGeraeteVorschlag(h, r.bereich); });
    d.raeume = neu;
    // Personen
    const altP = d.personen || [];
    d.personen = [...haPersonen(h).filter((p) => A.personen[p.entity_id]).map((p) => altP.find((x) => x.entity === p.entity_id) || personAusHa(p)),
      ...altP.filter((x) => !x.tablet && !x.entity), ...(A.tablet ? [altP.find((x) => x.tablet) || { tablet: true }] : [])];
    // Karten
    KARTEN_INFO.forEach(([id]) => {
      const an = !!A.karten[id];
      if (an && erk[id].gefunden) d.bereiche[id] = { ...erk[id].cfg, ...(d.bereiche[id] || {}) };
      if (id === "gaeste" && an) d.bereiche.gaeste = { ...d.bereiche.gaeste, ssid: A.gaeste.ssid.trim(), ...(A.gaeste.passwort ? { passwort: A.gaeste.passwort } : {}) };
      if (id === "hinweise" || id === "planer") d.bereiche[id] = { ...(d.bereiche[id] || {}), an };
      if (id !== "hinweise") { const a = this.abschnittAlle(id); if (a) a.an = an; }
    });
    // Favoriten (bei „Alles automatisch“ ohne Besuch der Seite: Vorschlag)
    const fav = A.fav || new Set(favoritenVorwahl(favoritenKandidaten(h, gewaehlt)));
    const s = d.startseiten.alle;
    const altF = s.favoriten || [];
    s.favoriten = [...altF.filter((f) => f.karte || fav.has(f.entity)), ...[...fav].filter((e) => !altF.some((f) => f.entity === e)).map((e) => ({ ...geraetVorschlag(h, e), an: true, groesse: "breit" }))];
    const a = this.abschnittAlle("favoriten");
    if (a) a.an = true;
    d.eingerichtet = true;
    A.schritt = AS_SCHRITTE.indexOf("fertig");
    A.richtung = 1;
    const st = KARTEN_INFO.filter(([id]) => this.kartenStatus(id, erk).an).length;
    A.ergebnis = { raeume: d.raeume.length, geraete: d.raeume.reduce((n, r) => n + (r.geraete || []).filter((g) => g.an !== false).length, 0),
      personen: d.personen.filter((p) => !p.tablet).length, tablet: d.personen.some((p) => p.tablet), karten: st, fav: s.favoriten.length, dashboard: "", dashboardDa: false };
    try { await Glas.einstSpeichern(h, kopie(d)); } catch (e) { A.ergebnis.dashboard = `Nicht gespeichert: ${e.message || e}`; }
    if (A.dashboard) {
      try {
        const liste = await h.callWS({ type: "lovelace/dashboards/list" });
        if (!liste.some((x) => x.url_path === "glas-zuhause")) {
          await h.callWS({ type: "lovelace/dashboards/create", url_path: "glas-zuhause", title: "Zuhause", icon: "mdi:home-outline", show_in_sidebar: true, require_admin: false, mode: "storage" });
          await h.callWS({ type: "lovelace/config/save", url_path: "glas-zuhause", config: { strategy: { type: "custom:glas" } } });
          A.ergebnis.dashboard = "Dashboard „Zuhause“ in der Seitenleiste angelegt";
        } else A.ergebnis.dashboard = "Dashboard „Zuhause“ ist bereit";
        A.ergebnis.dashboardDa = true;
      } catch (_) { A.ergebnis.dashboard = A.ergebnis.dashboard || "Dashboard konnte nicht angelegt werden (nur Admins)"; }
    }
    this._nachOben = true;
    this.zeichnen();
  },
});
