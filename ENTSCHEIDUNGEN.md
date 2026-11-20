# Entscheidungen, die Claude allein getroffen hat (Version 0.2.0, 20.11.2026)

Bitte drüberschauen. Alles hier lässt sich ändern.

## Aufbau
1. **Kartenpaket statt Integration.** Ein HACS-„Dashboard“-Paket mit eigenen Karten. Grund: Du willst die Karten selbst im HA-Editor anlegen und einstellen (wie bei Bubble Card). Eine Integration bräuchte man nur für Daten im Hintergrund, das erledigen Planer und Werkstatt schon.
2. **Name „Glas-Dashboard“**, Karten heißen „Glas · …“. „Apple“ steht bewusst nicht im Namen (Markenname).
3. **Eine JS-Datei ohne Build-Werkzeuge.** Quellen in `src/`, zusammengefügt per `build.sh`. Weniger, was kaputtgehen kann, und später leicht zu ändern.
4. **Mehrere kleine Karten statt einer Riesenkarte.** So kannst du sie in den HA-„Abschnitte“-Ansichten frei anordnen, ausblenden (HA-Sichtbarkeit) und mit normalen HA-Karten mischen.
5. **Räume sind Blätter über `#kurzname`**, wie Bubble-Pop-ups. Die Raumleiste öffnet sie, der Zurück-Knopf am Handy schließt sie. In ein Raum-Blatt passt jede Karte, auch die von HA. Der Editor nutzt dafür den normalen HA-Stapel-Editor.

## Bedienung
6. **Kachel: Tippen schaltet, seitlich wischen regelt, Symbol antippen oder lange drücken öffnet die große Steuerung.** Wie besprochen. Den Dialog von HA erreichst du dort über „Verlauf und Einstellungen ›“. Jede Aktion lässt sich pro Kachel ändern.
7. **Kleine Kacheln (¼) lassen sich nicht wischen.** Sie sind zu schmal, man würde zu leicht aus Versehen dimmen.
8. **Schnellzugriff-Chips springen bei Auswahllisten weiter.** So wird „Heizung Tag/Nacht“ ein Tipp. Jeder Chip lässt sich auf „nur zeigen, wenn an“ stellen, damit es ruhig bleibt.
9. **Personenwahl wird pro Gerät gemerkt.** Das Tablet bleibt also „Tablet“. Ohne Wahl gilt die angemeldete Person.
10. **Planer-Karte nach Person:** C zeigt Corins Aufgaben, Gemeinsames, Corins Schicht und die Kalender, die Corin im Planer eingeblendet hat; L entsprechend für Linda. Das Tablet zeigt Gemeinsames und die Kalender aller. Schicht-Termine, die der Planer selbst einträgt, werden ausgeblendet (sonst doppelt). Pro Person kann man im Kopf-Editor eigene Kalender festlegen.
11. **Zugeklappt zeigt der Planer nur das Nächste** (nächster Termin, sonst wichtigste Aufgabe), aufgeklappt den ganzen Tag mit „Jetzt“-Linie. Überfällige Aufgaben werden rot.
12. **„Alles aus“ im Raum** schaltet ohne Einstellung alles aus, was im HA-Bereich an ist (Licht, Schalter, Medien, Lüfter), Heizung und Rollos nicht. Man kann stattdessen eine eigene Liste festlegen.

## Grafikprüfung (vereinheitlicht)
13. **Abstände** nur noch 4 / 8 / 12 / 16 / 20 px. Im Prototyp gab es auch 6, 10, 14 und 18.
14. **Radien:** 22 px für alle Karten und Kacheln, 14 px für innere Zeilen und Felder, 32 px für Blätter, Pillen rund. Im Prototyp gab es 16, 18, 20, 22, 24 und 26 durcheinander.
15. **Schriftgrößen:** 11 / 13 / 15 / 17 / 20 / 28 px. Im Prototyp gab es auch 14, 16, 22 und 24.
16. **Hintergründe:** eine Glas-Fläche für alles, was aus ist, und reines Weiß für alles, was an ist. Gedimmte Lampen sind weiß gefüllt bis zum Helligkeitswert. Gleiche Werte hell und dunkel.
17. **Bedienflächen mindestens 36–44 px**, Tastatur bedienbar (Tab, Enter, Pfeiltasten regeln), Beschriftungen für Screenreader, „Bewegung reduzieren“ wird beachtet.

## Runde 2 (0.2.0)
18. **Bereichs-Karten (Sicherheit, Drucker, Robi, Gäste) sind kompakte Zeilen**, Tippen öffnet ein Blatt mit allem. Halbe oder ganze Breite einstellbar.
19. **Alarm mit Code:** Der Knopf öffnet dann den HA-Dialog (Code-Eingabe), statt den Code im Dashboard zu speichern.
20. **Drucker:** Du wählst nur das Gerät, alle Werte werden gesucht (Namen der Bambu-Lab-Integration). Werkstatt-Daten kommen über den Dienst `filament_werkstatt.lesen`, neue Modelle über `warteschlange_hinzufuegen` (Quelle „glas-dashboard“). Knapp = unter 200 g (einstellbar).
21. **Robi-Räume** gehen über `vacuum.send_command` mit `spot_area` (Ecovacs). Die Raum-Nummern trägst du einmal im Editor ein.
22. **Gäste-QR** wird im Browser erzeugt (kleine eingebaute Bibliothek), nichts geht ins Internet. Passwort am besten in einem input_text-Helfer.

## Prüflauf mit den Skills (Barrierefreiheit, Gesten, Handy, Animationen)
23. **Automatische Prüfung (axe, WCAG 2.2 AA):** 0 Verstöße hell und dunkel, auch in den Blättern. Dafür weiße Schrift nur noch auf kräftigeren Tönen (Grün #1f7a35, Rot #d70015, Blau #0067d6), die hellen Apple-Töne bleiben für Symbole.
24. **Keine verschachtelten Knöpfe mehr:** Kachel = Symbol-Knopf + Text-Knopf. Tastatur: Tab, Enter schaltet, Pfeile regeln, Alt+Enter öffnet die große Steuerung. Blätter halten den Fokus, Escape schließt.
25. **Gesten:** Blatt am Griff oder Kopf ziehen, Abdunklung folgt dem Finger, nach oben mit Widerstand, schließt bei 30 % Weg oder schnellem Wischen. Wischen auf Kacheln schreibt direkt (kein Ruckeln), Wert wird beim Loslassen gesendet.
26. **Animationen nur mit transform/opacity** (Füllstand der Kachel und Regler-Säule umgestellt), iOS-Kurve für Blätter, Druck-Feedback 160 ms. „Bewegung reduzieren“ lässt nur Überblendungen übrig.
27. **Handy:** kein grauer Tipp-Blitz, kein 300-ms-Verzug, Eingaben ≥ 16 px (kein Zoom), Blätter scrollen nicht die Seite dahinter, Abstand zur Home-Leiste.

## Bewusst noch nicht drin (nächste Runde)
- Bearbeiten direkt im Dashboard (Stift wie im Prototyp). Bis dahin bearbeitest du im HA-Editor, der viel mehr Einstellungen hat.
- Kacheln per Ziehen über Abschnitte hinweg verschieben: das macht HA im Bearbeiten-Modus der Abschnitte-Ansicht schon selbst.

## Noch nicht auf deinem echten Home Assistant getestet
Getestet wurde in einer Testseite mit nachgebauten HA-Daten (Bilder in `vorschau/`). Unsicher sind vor allem: das Verstecken der Raumleiste/Raum-Blatt im Raster, der eingebettete Stapel-Editor und die Kalenderabfrage für Linda, wenn du als Corin angemeldet bist (klappt nur mit Admin-Rechten, die hast du).
