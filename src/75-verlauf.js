// ---------------------------------------------------------------------------
// Verläufe: Sensor-Kurven und An/Aus-Zeitleisten aus der HA-Historie
// Einzeln in der großen Ansicht eines Sensors, gesammelt in der Raum-Verlaufsansicht
// ---------------------------------------------------------------------------
const VERLAUF_CSS = `
.zeitraum{display:flex;gap:var(--g-a2);margin:var(--g-a1) 0 var(--g-a2)}
.v-gruppe{display:flex;flex-direction:column;gap:var(--g-a2);margin-bottom:var(--g-a3)}
.v-gruppe-titel{margin:var(--g-a2) var(--g-a1) 0;font-size:var(--g-s-klein);font-weight:600;letter-spacing:.3px;text-transform:uppercase;color:var(--g-text2)}
.v-karte{display:flex;flex-direction:column;gap:6px;padding:var(--g-a3) var(--g-a4);border-radius:var(--g-r);text-align:left;width:100%;color:inherit;font:inherit}
.v-karte.fokus{box-shadow:0 0 0 2px var(--g-blau,#0a84ff)}
.v-kopf{display:flex;align-items:baseline;justify-content:space-between;gap:var(--g-a2)}
.v-kopf b{font-size:var(--g-s-name);font-weight:600;color:var(--g-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.v-kopf span{flex:none;font-size:var(--g-s-name);font-weight:600;color:var(--g-text2);font-variant-numeric:tabular-nums}
.v-kurve{display:block;width:100%;height:84px;overflow:visible}
.v-kurve .linie{fill:none;stroke:var(--vf);stroke-width:2;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke}
.v-kurve .flaeche{fill:var(--vf);opacity:.14}
.v-achse{display:flex;justify-content:space-between;font-size:var(--g-s-mini);color:var(--g-text2);font-variant-numeric:tabular-nums}
.v-minmax{display:flex;gap:var(--g-a3);font-size:var(--g-s-mini);color:var(--g-text2)}
.v-leiste{position:relative;height:14px;border-radius:7px;background:var(--g-fuell);overflow:hidden}
.v-leiste i{position:absolute;top:0;bottom:0;background:var(--vf);border-radius:3px}
.v-leer{font-size:var(--g-s-klein);color:var(--g-text2);padding:var(--g-a2) 0}
`;
// Historie holen: { entity_id: [{ t: ms, s: zustand }] }
async function verlaufHolen(h, ids, stunden) {
  const bis = Date.now(), von = bis - stunden * 36e5;
  if (!ids.length) return { von, bis, daten: {} };
  let r = {};
  try {
    r = await h.callWS({ type: "history/history_during_period", start_time: new Date(von).toISOString(), end_time: new Date(bis).toISOString(),
      entity_ids: ids, minimal_response: true, no_attributes: true, significant_changes_only: false });
  } catch (e) { console.warn("Glas: Verlauf", e); }
  const daten = {};
  for (const id of ids) {
    daten[id] = (r[id] || []).map((x) => ({ t: (x.lu ?? x.lc) != null ? (x.lu ?? x.lc) * 1000 : Date.parse(x.last_updated || x.last_changed), s: x.s ?? x.state }))
      .filter((x) => !isNaN(x.t)).map((x) => ({ ...x, t: Math.max(x.t, von) }));
  }
  return { von, bis, daten };
}
const zahl = (v, st) => {
  const n = Number(v);
  if (isNaN(n)) return "–";
  const stellen = Math.abs(n) >= 100 ? 0 : 1;
  return `${n.toFixed(stellen).replace(".", ",")}${st?.attributes.unit_of_measurement ? ` ${st.attributes.unit_of_measurement}` : ""}`;
};
const istZahlSensor = (st) => st && domainVon(st.entity_id) === "sensor" && (st.attributes.unit_of_measurement != null || st.attributes.state_class) && !isNaN(Number(st.state));
const VERLAUF_FARBE = { temperature: "#ff9f0a", humidity: "#0a84ff", carbon_dioxide: "#34c759", pm25: "#af52de", illuminance: "#ffcc00", power: "#ff375f", energy: "#ff375f" };
function achseHtml(von, bis) {
  const tage = (bis - von) / 864e5 > 1.5;
  const n = tage ? 7 : 5;
  const teile = [...Array(n)].map((_, i) => {
    const d = new Date(von + (bis - von) * i / (n - 1));
    return tage ? d.toLocaleDateString("de-DE", { weekday: "short" }) : (i === n - 1 ? "jetzt" : `${String(d.getHours()).padStart(2, "0")}:00`);
  });
  return `<div class="v-achse">${teile.map((t) => `<span>${t}</span>`).join("")}</div>`;
}
// Linie für Zahlensensoren
function kurveHtml(punkte, von, bis, st) {
  const p = punkte.map((x) => ({ t: x.t, v: Number(x.s) })).filter((x) => !isNaN(x.v));
  if (st && !isNaN(Number(st.state))) p.push({ t: bis, v: Number(st.state) });
  if (p.length < 2) return `<div class="v-leer">Noch kein Verlauf in diesem Zeitraum.</div>`;
  let min = Math.min(...p.map((x) => x.v)), max = Math.max(...p.map((x) => x.v));
  const spanne = max - min || 1, unten = min - spanne * 0.1, oben = max + spanne * 0.1;
  const X = (t) => ((t - von) / (bis - von)) * 300, Y = (v) => 80 - ((v - unten) / (oben - unten)) * 76;
  // Stufen statt Schrägen: Messwert gilt bis zum nächsten
  let d = `M${X(p[0].t).toFixed(1)},${Y(p[0].v).toFixed(1)}`;
  for (let i = 1; i < p.length; i++) d += ` L${X(p[i].t).toFixed(1)},${Y(p[i - 1].v).toFixed(1)} L${X(p[i].t).toFixed(1)},${Y(p[i].v).toFixed(1)}`;
  const flaeche = `${d} L${X(p[p.length - 1].t).toFixed(1)},80 L${X(p[0].t).toFixed(1)},80 Z`;
  return `<svg class="v-kurve" viewBox="0 0 300 80" preserveAspectRatio="none" aria-hidden="true"><path class="flaeche" d="${flaeche}"/><path class="linie" d="${d}"/></svg>
    ${achseHtml(von, bis)}<div class="v-minmax"><span>Tief ${zahl(min, st)}</span><span>Hoch ${zahl(max, st)}</span></div>`;
}
// Zeitleiste für An/Aus, Offen/Zu
const istAktivZustand = (s) => ["on", "open", "heat", "heating", "cool", "playing", "home", "detected", "unlocked"].includes(String(s).toLowerCase());
function leisteHtml(punkte, von, bis, st) {
  const p = [...punkte];
  if (!p.length && st) p.push({ t: von, s: st.state });
  const teile = [];
  let anzahl = 0, dauer = 0;
  p.forEach((x, i) => {
    if (!istAktivZustand(x.s)) return;
    const ende = p[i + 1]?.t ?? bis;
    if (i === 0 || !istAktivZustand(p[i - 1].s)) anzahl++;
    dauer += ende - x.t;
    teile.push(`<i style="left:${((x.t - von) / (bis - von)) * 100}%;width:${Math.max(0.6, ((ende - x.t) / (bis - von)) * 100)}%"></i>`);
  });
  const std = dauer / 36e5;
  const summe = !anzahl ? "nie" : `${anzahl}× · ${std >= 1 ? `${std.toFixed(1).replace(".", ",")} Std.` : `${Math.max(1, Math.round(dauer / 6e4))} Min.`}`;
  return { html: `<div class="v-leiste" aria-hidden="true">${teile.join("")}</div>${achseHtml(von, bis)}`, summe };
}
function verlaufKarteHtml(h, eid, v, fokus) {
  const st = h.states[eid];
  if (!st) return "";
  const dc = st.attributes.device_class;
  const name = esc(st.attributes.friendly_name || eid);
  const tag = fokus !== undefined ? "button" : "div";
  if (istZahlSensor(st)) {
    return `<${tag} class="v-karte glas ${fokus ? "fokus" : ""}" data-ve="${esc(eid)}" style="--vf:${VERLAUF_FARBE[dc] || "#0a84ff"}"><div class="v-kopf"><b>${name}</b><span>${esc(zustandText(h, st))}</span></div>
      ${kurveHtml(v.daten[eid] || [], v.von, v.bis, st)}</${tag}>`;
  }
  const l = leisteHtml(v.daten[eid] || [], v.von, v.bis, st);
  const farbe = domainVon(eid) === "light" ? "#ffcc00" : ["window", "door", "garage_door", "opening"].includes(dc) ? "#ff9f0a" : ["motion", "occupancy", "presence"].includes(dc) ? "#5e5ce6" : "#34c759";
  return `<${tag} class="v-karte glas ${fokus ? "fokus" : ""}" data-ve="${esc(eid)}" style="--vf:${farbe}"><div class="v-kopf"><b>${name}</b><span>${esc(zustandText(h, st))} · ${l.summe}</span></div>${l.html}</${tag}>`;
}
const ZEITRAEUME = [[24, "24 Std."], [168, "7 Tage"]];
const zeitraumHtml = (stunden) => `<div class="zeitraum" role="group" aria-label="Zeitraum">${ZEITRAEUME.map(([s, n]) =>
  `<button class="pille fuell ${stunden === s ? "aktiv" : ""}" data-zeitraum="${s}" aria-pressed="${stunden === s}">${n}</button>`).join("")}</div>`;

// Raum-Verlauf: Luft, Fenster & Türen, Licht, Bewegung, Heizung – alles aus dem HA-Bereich
const RAUM_VERLAUF_GRUPPEN = [
  ["Luft", (st) => istZahlSensor(st) && ["temperature", "humidity", "carbon_dioxide", "pm25", "pm10", "volatile_organic_compounds", "illuminance"].includes(st.attributes.device_class)],
  ["Fenster & Türen", (st) => istFenster(st)],
  ["Licht", (st) => domainVon(st.entity_id) === "light"],
  ["Bewegung & Anwesenheit", (st) => domainVon(st.entity_id) === "binary_sensor" && ["motion", "occupancy", "presence"].includes(st.attributes.device_class)],
  ["Heizung & Klima", (st) => ["climate", "fan", "humidifier"].includes(domainVon(st.entity_id))],
  ["Strom", (st) => istZahlSensor(st) && st.attributes.device_class === "power"],
];
function raumVerlaufOeffnen(quelle, bereich, raumName, fokus) {
  const s = new GlasSchicht({ quelle, hoch: true, titel: `Verlauf ${raumName || ""}`.trim() });
  let stunden = 24, v = null, laedt = false;
  const h0 = Glas.hass || quelle._hass;
  const alle = bereich ? Object.keys(h0.states).filter((e) => bereichVon(h0, e) === bereich && !h0.entities?.[e]?.hidden && h0.entities?.[e]?.entity_category !== "diagnostic") : [];
  if (fokus && !alle.includes(fokus)) alle.unshift(fokus);
  const gruppen = RAUM_VERLAUF_GRUPPEN.map(([n, f]) => [n, alle.filter((e) => h0.states[e] && f(h0.states[e]))]).filter(([, l]) => l.length);
  const ids = [...new Set(gruppen.flatMap(([, l]) => l))];
  const zeichnen = () => {
    const h = Glas.hass || quelle._hass;
    s.dunkel(istDunkel(h));
    s.inhalt.innerHTML = `<style>${VERLAUF_CSS}</style>${s.kopfHtml("Verlauf", [raumName, stunden === 24 ? "letzte 24 Stunden" : "letzte 7 Tage"].filter(Boolean).join(" · "))}${zeitraumHtml(stunden)}
      ${!ids.length ? `<div class="v-leer">In diesem Raum gibt es keine Sensoren mit Verlauf.</div>` : !v ? `<div class="v-leer">Lade Verlauf …</div>`
        : gruppen.map(([n, l]) => `<div class="v-gruppe-titel">${esc(n)}</div><div class="v-gruppe">${l.map((e) => verlaufKarteHtml(h, e, v, e === fokus)).join("")}</div>`).join("")}`;
    s.kopfBinden();
    s.inhalt.querySelectorAll("[data-zeitraum]").forEach((b) => b.addEventListener("click", () => { stunden = Number(b.dataset.zeitraum); laden(); }));
    s.inhalt.querySelectorAll("button[data-ve]").forEach((b) => b.addEventListener("click", () => mehrInfo(quelle, b.dataset.ve)));
    if (fokus && v && !s._gescrollt) { s._gescrollt = true; s.inhalt.querySelector(".fokus")?.scrollIntoView({ block: "center" }); }
  };
  const laden = async () => {
    if (laedt) return;
    laedt = true; v = null; zeichnen();
    v = await verlaufHolen(Glas.hass || quelle._hass, ids, stunden);
    laedt = false; zeichnen();
  };
  s.oeffnen();
  laden();
  return s;
}
