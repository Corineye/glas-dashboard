// ---------------------------------------------------------------------------
// Registrieren: Karten erscheinen in „Karte hinzufügen“ mit Vorschau
// ---------------------------------------------------------------------------
const KARTEN = [
  ["glas-kachel-card", GlasKachelCard, GlasKachelEditor, "Glas · Kachel", "Eine Kachel für jede Entität: Tippen schaltet, seitlich wischen dimmt, Symbol öffnet die große Steuerung."],
  ["glas-kopf-card", GlasKopfCard, GlasKopfEditor, "Glas · Kopf", "Begrüßung, Personenwahl (wer schaut) und Schnellzugriff-Chips."],
  ["glas-planer-card", GlasPlanerCard, GlasPlanerEditor, "Glas · Planer & Kalender", "Wisch-Karte: Planer heute, Kalender der nächsten 7 Tage und Schichten der Woche, für die gewählte Person."],
  ["glas-wetter-card", GlasWetterCard, GlasWetterEditor, "Glas · Wetter", "Jetzt, die nächsten Stunden, aufklappbar 5 Tage, trocken oder nass."],
  ["glas-raumleiste-card", GlasRaumleisteCard, GlasRaumleisteEditor, "Glas · Raumleiste", "Schwebende Leiste unten mit allen Räumen."],
  ["glas-sicherheit-card", GlasSicherheitCard, GlasSicherheitEditor, "Glas · Sicherheit", "Alarmanlage scharf/unscharf, Fenster, Kamera, Verlauf."],
  ["glas-drucker-card", GlasDruckerCard, GlasDruckerEditor, "Glas · Drucker & Werkstatt", "3D-Drucker: Fortschritt, Kamera, Steuerung, Warteschlange und knappes Filament aus der Filament-Werkstatt."],
  ["glas-robi-card", GlasRobiCard, GlasRobiEditor, "Glas · Robi", "Saugroboter: Akku, alles oder einzelne Räume saugen, Saugstärke, Station."],
  ["glas-gaeste-card", GlasGaesteCard, GlasGaesteEditor, "Glas · Gäste", "WLAN-QR-Code zum Scannen, optional ein zweiter Code."],
  ["glas-bild-card", GlasBildCard, GlasBildEditor, "Glas · Bild & QR-Code", "Ein Bild oder QR-Code (z. B. Gäste-Login): hochladen, aus einer Entität oder als QR aus einem Link."],
  ["glas-kamera-card", GlasKameraCard, GlasKameraEditor, "Glas · Kamera", "Standbild einer Kamera, Tippen zeigt das Livebild groß."],
  ["glas-hinweise-card", GlasHinweiseCard, GlasHinweiseEditor, "Glas · Warnungen", "Fenster offen und Regen kommt / keiner zu Hause – nur sichtbar, wenn es zutrifft."],
  ["glas-zuhause-card", GlasZuhauseCard, GlasZuhauseEditor, "Glas · Zuhause (alles)", "Das ganze Dashboard aus den Glas-Einstellungen: Kopf, Startseite der gewählten Person, Räume."],
  ["glas-ordner-card", GlasOrdnerCard, GlasOrdnerEditor, "Glas · Ordner", "Mehrere Kacheln in einem Ordner: zeigt vier Mini-Symbole, Antippen öffnet ihn groß (wie am iPhone). Größe L = Stapel mit vier Geräten direkt bedienbar."],
  ["glas-insel-card", GlasInselCard, GlasInselEditor, "Glas · Dynamic Island", "Schwarze Pille oben: zeigt, was gerade läuft (Druck, Robi, Timer, Alarm, Waschmaschine). Antippen klappt sie auf."],
  ["glas-widget-card", GlasWidgetCard, GlasWidgetEditor, "Glas · Widget", "Quadratisches Widget wie auf dem iPhone: Wetter, Planer, 3D-Drucker, Zuhause oder Robi. Antippen öffnet die große Ansicht."],
  ["glas-raum-card", GlasRaumCard, GlasRaumEditor, "Glas · Raum-Blatt", "Blatt von unten mit beliebigen Karten, öffnet über die Raumleiste."],
];
window.customCards = window.customCards || [];
for (const [tag, Karte, Editor, name, beschreibung] of KARTEN) {
  if (!customElements.get(tag)) customElements.define(tag, Karte);
  if (!customElements.get(`${tag}-editor`)) customElements.define(`${tag}-editor`, Editor);
  if (!window.customCards.some((k) => k.type === tag)) window.customCards.push({ type: tag, name, description: beschreibung, preview: true, documentationURL: "https://github.com/Corineye/glas-dashboard" });
}
for (const [tag, K] of [["glas-personen-editor", GlasPersonenEditor], ["glas-chips-editor", GlasChipsEditor], ["glas-raeume-card", GlasRaeumeCard], ["glas-favordner-card", GlasFavordnerCard], ["glas-einstellungen", GlasEinstellungen], ["ll-strategy-dashboard-glas", GlasStrategie]]) {
  if (!customElements.get(tag)) customElements.define(tag, K);
}
console.info(`%c GLAS-DASHBOARD %c ${VERSION} `, "color:#fff;background:#0a84ff;font-weight:700;border-radius:4px 0 0 4px;padding:2px 6px", "color:#0a84ff;background:#e8f1ff;border-radius:0 4px 4px 0;padding:2px 6px");
