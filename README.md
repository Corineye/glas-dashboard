# Glas-Dashboard

Karten im ruhigen Glas-Look für Home Assistant: hell und dunkel automatisch, ein Maßsystem für alle Karten, alles im normalen Karten-Editor einstellbar (kein YAML nötig).

## Installation (HACS)

1. HACS › ⋮ › **Benutzerdefinierte Repositories** › `https://github.com/Corineye/glas-dashboard`, Typ **Integration**.
2. „Glas-Dashboard“ herunterladen, Home Assistant **neu starten**.
3. Einstellungen › Geräte & Dienste › **Integration hinzufügen** › „Glas-Dashboard“.
4. In der Seitenleiste erscheint **Glas**. Dort Räume, Startseite, Personen, Bereiche und Aussehen einstellen.
5. Unter Glas › Aussehen › Dashboard auf **Anlegen** tippen: Das Dashboard „Zuhause“ baut sich aus den Einstellungen selbst auf.

Die Karten werden automatisch geladen (keine Ressource, kein Thema nötig). Einzelne Glas-Karten lassen sich weiterhin in jedes Dashboard legen.

### Umstieg von 0.2 (Typ Dashboard)

HACS › Glas-Dashboard › ⋮ › **Entfernen**, dann unter Einstellungen › Dashboards › ⋮ › Ressourcen den Eintrag `glas-dashboard.js` löschen. Danach wie oben als **Integration** hinzufügen.

## Einstellungsseite „Glas“

| Reiter | Was |
|---|---|
| **Räume** | Räume aus HA-Bereichen übernehmen. Geräte werden vorgeschlagen; an-/abwählen, am Griff verschieben, Größe S/M/L/ganz, Anzeige (Zustand, Zeit, nur Name), ⋯ für alles Weitere (Name, Symbol, Farbe, Aktionen) |
| **Startseite** | Für alle oder pro Person: Abschnitte an/aus, Reihenfolge, halbe/ganze Breite, Favoriten, Schnellzugriff |
| **Personen** | Wer wählbar ist (C · L · Tablet), Begrüßung |
| **Bereiche** | Wetter, Planer, Sicherheit, Drucker & Werkstatt, Robi, Gäste |
| **Aussehen** | Hell/Dunkel/Automatisch, Hintergrund (Aurora, Morgenrot, See, Wald, Ruhig, nach Tageszeit), Dashboard anlegen |

Alles wird auf dem Home-Assistant-Server gespeichert und gilt auf allen Geräten.

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
