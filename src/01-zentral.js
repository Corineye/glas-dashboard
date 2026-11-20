// ---------------------------------------------------------------------------
// Zentrale Einstellungen (Integration „Glas-Dashboard“, gespeichert auf dem Pi)
// Personen · Räume mit Geräten · Startseite pro Person · Bereiche · Aussehen
// ---------------------------------------------------------------------------
const ABSCHNITTE = [
  ["wetter", "Wetter", "mdi:weather-partly-cloudy", "ganz"], ["planer", "Planer heute", "mdi:calendar-check", "ganz"],
  ["favoriten", "Favoriten", "mdi:star-outline", "ganz"], ["sicherheit", "Sicherheit", "mdi:shield-home-outline", "ganz"],
  ["drucker", "Drucker & Werkstatt", "mdi:printer-3d-nozzle", "halb"], ["robi", "Robi", "mdi:robot-vacuum", "halb"],
  ["gaeste", "Gäste", "mdi:qrcode", "ganz"],
];
// Ganze Karten, die man wie ein Gerät in Räume und Favoriten legen kann (eingestellt unter Bereiche)
const LISTEN_KARTEN = [["drucker", "3D-Drucker", "mdi:printer-3d-nozzle", "glas-drucker-card"], ["robi", "Robi", "mdi:robot-vacuum", "glas-robi-card"]];
const listenKarte = (id) => LISTEN_KARTEN.find(([k]) => k === id);
function listenKarteCfg(x) {
  const k = listenKarte(x.karte);
  return k ? { type: `custom:${k[3]}`, ...((Glas.einst?.bereiche || {})[x.karte] || {}) } : null;
}
const GRUPPEN = [
  ["licht", "Licht"], ["klima", "Klima"], ["rollos", "Rollos"], ["schalter", "Steckdosen & Schalter"],
  ["medien", "Medien"], ["fenster", "Fenster & Türen"], ["sensoren", "Sensoren"], ["sonstiges", "Sonstiges"],
];
const gruppeVon = (hass, eid) => {
  const d = domainVon(eid), dc = hass.states[eid]?.attributes.device_class;
  if (d === "light") return "licht";
  if (["climate", "fan", "humidifier", "water_heater"].includes(d) || (d === "sensor" && ["temperature", "humidity"].includes(dc))) return "klima";
  if (d === "cover") return "rollos";
  if (["switch", "input_boolean"].includes(d)) return "schalter";
  if (d === "media_player") return "medien";
  if (d === "binary_sensor" && ["window", "door", "garage_door", "opening"].includes(dc)) return "fenster";
  if (["sensor", "binary_sensor"].includes(d)) return "sensoren";
  return "sonstiges";
};
// Was ein Raum anfangs zeigt: alles Steuerbare + Temperatur/Feuchte, aber kein Kleinkram
const RAUM_DOMAINS = ["light", "switch", "input_boolean", "fan", "cover", "climate", "media_player", "vacuum", "lock", "humidifier", "scene", "script", "button", "sensor", "binary_sensor", "camera", "select", "input_select", "number"];
function geraetVorschlag(hass, eid) {
  const d = domainVon(eid), dc = hass.states[eid]?.attributes.device_class;
  const wichtig = ["light", "switch", "fan", "cover", "climate", "media_player", "lock", "humidifier", "input_boolean"].includes(d)
    || (d === "sensor" && ["temperature", "humidity"].includes(dc)) || (d === "binary_sensor" && ["window", "door"].includes(dc));
  return { entity: eid, an: wichtig, gruppe: gruppeVon(hass, eid),
    groesse: d === "climate" ? "ganz" : d === "sensor" ? "klein" : "breit", zweite_zeile: "zustand" };
}
function raumGeraeteVorschlag(hass, bereich) {
  if (!bereich) return [];
  const reihen = GRUPPEN.map(([g]) => g);
  return entitaetenImBereich(hass, bereich, RAUM_DOMAINS).map((e) => geraetVorschlag(hass, e))
    .sort((a, b) => reihen.indexOf(a.gruppe) - reihen.indexOf(b.gruppe));
}
function einstStandard() {
  return { version: 1, personen: [], gruss_modus: "name", raeume: [], startseiten: { alle: startseiteStandard() }, bereiche: {},
    aussehen: { modus: "auto", hintergrund: "klassisch" } };
}
function startseiteStandard() {
  return { abschnitte: ABSCHNITTE.map(([id, , , breite]) => ({ id, an: true, breite })), favoriten: [], chips: [] };
}
// Startseite der gerade gewählten Person (eigene, sonst „Für alle“)
function startseiteVon(einst, person) {
  const s = einst?.startseiten || {};
  const eigen = person && s[person.id];
  const basis = eigen && eigen.eigen !== false ? eigen : s.alle || startseiteStandard();
  const bekannt = new Set((basis.abschnitte || []).map((a) => a.id));
  // neue Abschnitte aus späteren Versionen hinten anhängen
  return { ...startseiteStandard(), ...basis, abschnitte: [...(basis.abschnitte || []), ...startseiteStandard().abschnitte.filter((a) => !bekannt.has(a.id)).map((a) => ({ ...a, an: false }))] };
}

Glas.einst = Glas.einst || null;
Glas.einstFehler = null;
Glas.einstLaden = function (hass) {
  if (this._einstVersprechen || !hass?.connection) return this._einstVersprechen;
  this._einstVersprechen = hass.callWS({ type: "glas_dashboard/lesen" }).then((r) => {
    this.einst = { ...einstStandard(), ...(r.daten || {}) };
    this.timer = r.timer || {};
    this.einstFehler = null;
    hass.connection.subscribeMessage((m) => {
      if (m.timer) { this.timer = m.timer; this.hassHoerer.forEach((f) => { try { f(); } catch (e) { console.error(e); } }); }
      if (m.daten) { this.einst = { ...einstStandard(), ...m.daten }; this.melden(); }
    }, { type: "glas_dashboard/abonnieren" }).catch(() => {});
    this.melden();
    return this.einst;
  }).catch((e) => {
    this.einstFehler = e?.code === "unknown_command" ? "fehlt" : (e?.message || "Fehler");
    this._einstVersprechen = null;
    this.melden();
    return null;
  });
  return this._einstVersprechen;
};
Glas.einstSpeichern = function (hass, daten) {
  this.einst = daten;
  this.melden();
  return hass.callWS({ type: "glas_dashboard/speichern", daten });
};
// Ausschalt-Timer (läuft in der Integration, übersteht Neustarts)
Glas.timer = Glas.timer || {};
Glas.timerSetzen = function (hass, entity_id, minuten) {
  return hass.callWS({ type: "glas_dashboard/timer", entity_id, minuten }).then((r) => { this.timer = r.timer || {}; this.hassHoerer.forEach((f) => f()); });
};
function timerRest(eid) {
  const t = Glas.timer?.[eid];
  if (!t) return null;
  const min = Math.max(0, Math.round((new Date(t).getTime() - Date.now()) / 60000));
  return min >= 60 ? `${Math.floor(min / 60)} Std. ${min % 60 ? `${min % 60} Min.` : ""}`.trim() : `${min} Min.`;
}
// Hell/Dunkel: folgt HA bzw. dem Handy, außer in den Einstellungen fest gewählt
function istDunkel(h) {
  const m = Glas.einst?.aussehen?.modus;
  if (m === "hell") return false;
  if (m === "dunkel") return true;
  return !!h?.themes?.darkMode;
}

// ---------------------------------------------------------------------------
// Hintergründe: weiche Farbflächen hinter dem Glas (ruhig, ohne Bewegung)
// ---------------------------------------------------------------------------
const HINTERGRUENDE = {
  klassisch: { name: "Glas (wie bisher)", verlauf: true, hell: ["#dfe9f7", "#eee3f1", "#f8eadb"], dunkel: ["#1b2742", "#0d111c", "#271c33"] },
  aurora: { name: "Aurora", hell: ["#eef1f8", "#bcd6ff", "#e2d3ff", "#ffdcc4", "#c9efe2"], dunkel: ["#0b0d14", "#1b3566", "#36225a", "#4a2a1c", "#0f3b37"] },
  morgen: { name: "Morgenrot", hell: ["#fbf1ec", "#ffd3c2", "#ffe6b3", "#f6c9de", "#e4dcff"], dunkel: ["#120c0e", "#4a1f1b", "#4a3510", "#45193a", "#26204a"] },
  see: { name: "See", hell: ["#ecf4f6", "#b9e3ef", "#cfe7ff", "#d5f2e6", "#e6e0fa"], dunkel: ["#081114", "#0f3a48", "#132f57", "#0f3d2f", "#262150"] },
  wald: { name: "Wald", hell: ["#eff4ee", "#cfe8c8", "#e4efc0", "#c7e6dc", "#f0e3cc"], dunkel: ["#0b100c", "#1d3a1f", "#36391a", "#123832", "#3a2e18"] },
  ruhig: { name: "Ruhig", hell: ["#f1f1f4", "#e3e5ec", "#ecebf0", "#e8e6e3", "#e5e9ea"], dunkel: ["#111114", "#1f2129", "#23222a", "#24221f", "#1e2326"] },
};
// „Nach Tageszeit“: morgens warm, tagsüber Aurora, abends See, nachts ruhig
const tageszeitHg = () => { const s = new Date().getHours(); return s < 6 ? "ruhig" : s < 10 ? "morgen" : s < 17 ? "klassisch" : s < 21 ? "see" : "ruhig"; };
function hintergrundCss(id, dunkel) {
  const wahl = id === "tageszeit" ? tageszeitHg() : id;
  const h = HINTERGRUENDE[wahl];
  if (!h) return "var(--primary-background-color)";
  if (h.verlauf) { const [a, b, c] = h[dunkel ? "dunkel" : "hell"]; return `linear-gradient(160deg, ${a} 0%, ${b} 55%, ${c} 100%)`; }
  const [b, c1, c2, c3, c4] = h[dunkel ? "dunkel" : "hell"];
  const a = dunkel ? "cc" : "ff";
  return `radial-gradient(70% 55% at 8% 0%, ${c1}${a} 0%, transparent 70%),radial-gradient(55% 50% at 100% 12%, ${c2}${a} 0%, transparent 70%),`
    + `radial-gradient(65% 55% at 85% 100%, ${c3}${a} 0%, transparent 72%),radial-gradient(60% 50% at 0% 92%, ${c4}${a} 0%, transparent 70%),${b}`;
}
