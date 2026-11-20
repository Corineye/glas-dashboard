# Glas-Dashboard

Karten im ruhigen Glas-Look für Home Assistant: hell und dunkel automatisch, ein Maßsystem für alle Karten, alles im normalen Karten-Editor einstellbar (kein YAML nötig).

## Installation (HACS)

1. HACS › ⋮ › **Benutzerdefinierte Repositories** › `https://github.com/Corineye/glas-dashboard`, Typ **Dashboard**.
2. „Glas-Dashboard“ herunterladen, Seite neu laden (Strg+F5 bzw. App neu öffnen).
3. Optional das Thema `themes/glas.yaml` nach `/config/themes/` kopieren (Anleitung steht oben in der Datei) und „Glas“ wählen. Es setzt den Verlauf im Hintergrund und rundet auch normale HA-Karten passend.
4. Dashboard › Bearbeiten › **Karte hinzufügen** › nach „Glas“ suchen. Ein komplettes Beispiel steht in `beispiel-dashboard.yaml`.

## Die Karten

| Karte | Wofür |
|---|---|
| **Glas · Kopf** | „Hallo Corin“, Personenwahl C · L · Tablet (blaues Haus = zu Hause), Schnellzugriff-Chips (brechen automatisch um) |
| **Glas · Kachel** | Eine Karte für jede Entität. Tippen schaltet, seitlich wischen dimmt/fährt/regelt, Symbol oder lange drücken öffnet die große Steuerung |
| **Glas · Planer heute** | Aufgaben, Schicht und Termine von heute aus dem Planer, für die Person, die in der Kopf-Karte gewählt ist |
| **Glas · Wetter** | Jetzt, nächste Stunden, aufklappbar 5 Tage, trocken/nass (auch über eigenen Regensensor) |
| **Glas · Raumleiste** | Schwebende Leiste unten; der Punkt zeigt, ob im Raum etwas an ist |
| **Glas · Sicherheit** | Alarm scharf/unscharf (mit Code → HA-Dialog), Taster zuletzt gedrückt, alle Fenster/Türen, Kamera, Verlauf 24 Std. |
| **Glas · Drucker & Werkstatt** | Drucker-Gerät wählen, Rest wird gefunden: Fortschritt, Restzeit, Kamera, Pause/Licht/Strom, geladene Rolle, Warteschlange (+ hinzufügen), knappes Filament |
| **Glas · Robi** | Akku, alles saugen, einzelne Räume, Saugstärke, Auswahlen (Wasser, Modus), Stationsknöpfe |
| **Glas · Gäste** | WLAN-QR-Code (Text oder Helfer), optional zweiter Code |
| **Glas · Raum-Blatt** | Blatt von unten mit beliebigen Karten, Kopf bleibt beim Scrollen stehen, Temperatur/Feuchte, Fenster-Chips, „Alles aus“ |

### Kachel: was sie erkennt

Lampen (Helligkeit, Farbe, Weißtöne), Schalter, Steckdosen, Ventilatoren (Stufe), Rollos (Position, Auf/Stopp/Zu), Heizungen (Solltemperatur, Modi, Voreinstellungen), Medien (Lautstärke, Wiedergabe), Schlösser, Saugroboter, Szenen/Skripte/Knöpfe, Zahlen-Helfer, Sensoren (große Zahl bei Größe „Groß“), Fenster/Türen/Wasser/Rauch (färben die Kachel orange bzw. rot, wenn ausgelöst).

Einstellbar pro Kachel: Größe (klein ¼, breit ½, groß 2×2, ganze Breite), Verhalten, Name, Symbol, Farbe, zweite Zeile (Zustand, zuletzt geändert, Attribut, eigener Text), weitere Entitäten als kleine Chips, eigene Aktionen für Tippen / Symbol / Halten / Doppeltippen.

## Entwickeln

Quellen liegen in `src/`, `./build.sh` fügt sie zu `glas-dashboard.js` zusammen. Kein Build-Werkzeug nötig.
