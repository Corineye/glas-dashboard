// ---------------------------------------------------------------------------
// Bearbeiten direkt im Dashboard
// · Stift oben (nur Admins) schaltet den Bearbeiten-Modus für alle Karten an
// · Kacheln in Räumen und Favoriten verschieben: Maus ziehen, am Handy kurz halten und ziehen
// · Kachel antippen: ausführliches Menü (Gerät, Größe, Anzeige, Verhalten, Verlauf, Platz)
// Alles wird sofort in den zentralen Einstellungen gespeichert.
// ---------------------------------------------------------------------------
Glas.bearbeiten = Glas.bearbeiten || false;
Glas.bearbeitenSetzen = function (an) { this.bearbeiten = !!an; this.melden(); };
const kopieJ = (o) => JSON.parse(JSON.stringify(o));
const istAdmin = (h) => !!h?.user?.is_admin;

// Zugriff auf eine Geräteliste in den Einstellungen: Raum (#hash) oder Favoriten der Person
function listeZugriff(ort) {
  const startId = (e) => (ort.person && e.startseiten?.[ort.person.id] && e.startseiten[ort.person.id].eigen !== false ? ort.person.id : "alle");
  const z = {
    ort,
    lesen(h) {
      const e = Glas.einst;
      if (!e) return [];
      if (ort.art === "raum") { const r = (e.raeume || []).find((x) => x.hash === ort.hash); return r ? r.geraete || raumGeraeteVorschlag(h, r.bereich) : []; }
      return startseiteVon(e, ort.person).favoriten || [];
    },
    raum() { return ort.art === "raum" ? (Glas.einst?.raeume || []).find((x) => x.hash === ort.hash) : null; },
    schreiben(h, fn) {
      if (!Glas.einst) return Promise.resolve();
      const e = kopieJ(Glas.einst);
      if (ort.art === "raum") {
        const r = (e.raeume || []).find((x) => x.hash === ort.hash);
        if (!r) return Promise.resolve();
        r.geraete = fn(r.geraete || raumGeraeteVorschlag(h, r.bereich), e);
      } else {
        e.startseiten = e.startseiten || {};
        const id = startId(e);
        const s = (e.startseiten[id] = { ...startseiteStandard(), ...(e.startseiten[id] || {}) });
        s.favoriten = fn(s.favoriten || [], e);
      }
      return Glas.einstSpeichern(h, e).catch((err) => console.error("Glas: speichern", err));
    },
  };
  return z;
}

const BEARB_CSS = `
.bearb > [data-i]{position:relative}
.bearb > [data-i] > :not(.deckel){pointer-events:none}
.deckel{position:absolute;inset:0;z-index:2;border-radius:var(--g-r);background:transparent;cursor:grab;touch-action:pan-y;
  box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--g-akzent) 50%,transparent)}
.deckel .marke{position:absolute;top:-6px;right:-6px;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  background:var(--g-akzent-voll);color:#fff;box-shadow:0 2px 6px rgba(0,0,0,.2)}
.deckel .marke ha-icon{--mdc-icon-size:14px}
.bearb > .aus > :not(.deckel){opacity:.4}
.bearb > .aus .deckel .marke{background:#636366}
.bearb > .zieht{z-index:5}
.bearb > .zieht > :first-child{transform:scale(1.04);border-radius:var(--g-r);box-shadow:0 14px 34px rgba(0,0,0,.28);transition:transform .18s cubic-bezier(.23,1,.32,1)}
.bearb > .zieht .deckel{cursor:grabbing}
.bearb > .gehalten > :first-child{transform:scale(1.03);transition:transform .18s cubic-bezier(.23,1,.32,1)}
.neu-kachel{display:flex;align-items:center;justify-content:center;gap:var(--g-a2);width:100%;min-height:var(--g-kachel-h);border-radius:var(--g-r);
  border:1.5px dashed var(--g-text2);color:var(--g-text);font-size:var(--g-s-name);font-weight:600}
.bearb-hinweis{grid-column:span 12;display:flex;align-items:center;gap:var(--g-a2);padding:var(--g-a2) var(--g-a3);border-radius:var(--g-r-klein);
  font-size:var(--g-s-klein);color:var(--g-text2)}
`;

// FLIP: Nachbarn gleiten weich an ihren neuen Platz
function flip(kinder, aendern) {
  const vorher = new Map(kinder.map((k) => [k, k.getBoundingClientRect()]));
  aendern();
  kinder.forEach((k) => {
    if (k.classList.contains("zieht")) return;
    const a = vorher.get(k), b = k.getBoundingClientRect();
    const dx = a.left - b.left, dy = a.top - b.top;
    if (!dx && !dy) return;
    k.style.transition = "none";
    k.style.transform = `translate(${dx}px,${dy}px)`;
    requestAnimationFrame(() => { k.style.transition = "transform .26s cubic-bezier(.23,1,.32,1)"; k.style.transform = ""; });
  });
}

// Kacheln eines Rasters bearbeitbar machen (Kinder mit data-i = Index in der Liste)
function bearbeitRaster(raster, zugriff, quelle, { scroller = null, mitNeu = true } = {}) {
  raster.classList.add("bearb");
  const kinder = () => [...raster.children].filter((z) => z.dataset.i != null);
  const reihenfolgeSpeichern = () => {
    const neu = kinder().map((z) => {
      // Gruppe = letzte Überschrift davor (nur in Räumen)
      let v = z.previousElementSibling;
      while (v && !v.dataset.gruppe) v = v.previousElementSibling;
      return { i: Number(z.dataset.i), gruppe: v?.dataset.gruppe };
    });
    zugriff.schreiben(Glas.hass, (liste) => {
      const l = neu.map(({ i, gruppe }) => (liste[i] ? { ...liste[i], ...(gruppe && liste[i].entity ? { gruppe } : {}) } : null)).filter(Boolean);
      return [...l, ...liste.filter((_, i) => !neu.some((x) => x.i === i))];
    });
  };
  kinder().forEach((z) => {
    const d = document.createElement("button");
    d.className = "deckel";
    d.setAttribute("aria-label", `${z.dataset.name || "Kachel"} bearbeiten. Pfeiltasten verschieben.`);
    d.innerHTML = `<span class="marke" aria-hidden="true"><ha-icon></ha-icon></span>`;
    d.querySelector("ha-icon").icon = z.classList.contains("aus") ? "mdi:eye-off" : "mdi:pencil";
    z.appendChild(d);
    let g = null, halteT = null;
    const menue = () => kachelMenue(quelle, zugriff, Number(z.dataset.i));
    const ende = (ok) => {
      clearTimeout(halteT);
      const x = g; g = null;
      z.classList.remove("gehalten");
      if (!x) return;
      if (!x.zieht) { if (ok && !x.weg) menue(); return; }
      z.classList.remove("zieht");
      z.style.transition = "transform .26s cubic-bezier(.23,1,.32,1)";
      z.style.transform = "";
      if (x.bewegt) reihenfolgeSpeichern();
    };
    d.addEventListener("pointerdown", (e) => {
      if (e.button > 0) return;
      g = { x: e.clientX, y: e.clientY, tx: 0, ty: 0, zieht: false, weg: false, maus: e.pointerType === "mouse", ziel: null, bewegt: false };
      try { d.setPointerCapture(e.pointerId); } catch (_) { /* */ }
      if (!g.maus) halteT = setTimeout(() => { if (g && !g.weg) { g.bereit = true; z.classList.add("gehalten"); if (navigator.vibrate) navigator.vibrate(10); } }, 260);
    });
    d.addEventListener("pointermove", (e) => {
      if (!g) return;
      const dist = Math.hypot(e.clientX - g.x, e.clientY - g.y);
      if (!g.zieht) {
        if (dist < 7) return;
        if (!g.maus && !g.bereit) { g.weg = true; clearTimeout(halteT); return; } // Finger scrollt
        if (g.weg) return;
        g.zieht = true;
        const r = z.getBoundingClientRect();
        g.gx = g.x - r.left; g.gy = g.y - r.top;
        z.style.transition = "none";
        z.classList.add("zieht");
      }
      // Ziel unter dem Finger: davor oder dahinter einsortieren
      const ziel = kinder().find((k) => { if (k === z) return false; const r = k.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; });
      if (ziel && ziel !== g.ziel) {
        const r = ziel.getBoundingClientRect(), vor = e.clientX < r.left + r.width / 2;
        const ref = vor ? ziel : ziel.nextElementSibling;
        if (ref !== z && z.nextElementSibling !== ref) { flip([...raster.children], () => raster.insertBefore(z, ref)); g.bewegt = true; }
      }
      g.ziel = ziel || null;
      // Am Rand automatisch scrollen
      const sc = scroller || document.scrollingElement;
      const box = scroller ? scroller.getBoundingClientRect() : { top: 0, bottom: innerHeight };
      if (e.clientY > box.bottom - 56) sc.scrollTop += 10; else if (e.clientY < box.top + 56) sc.scrollTop -= 10;
      const r = z.getBoundingClientRect(), bl = r.left - g.tx, bt = r.top - g.ty;
      g.tx = e.clientX - g.gx - bl; g.ty = e.clientY - g.gy - bt;
      z.style.transform = `translate(${g.tx}px,${g.ty}px)`;
    });
    // Nach dem Halten darf der Finger nicht mehr scrollen
    d.addEventListener("touchmove", (e) => { if (g && (g.bereit || g.zieht) && e.cancelable) e.preventDefault(); }, { passive: false });
    d.addEventListener("pointerup", () => ende(true));
    d.addEventListener("pointercancel", () => ende(false));
    d.addEventListener("click", (e) => { if (e.detail === 0) menue(); });
    d.addEventListener("contextmenu", (e) => e.preventDefault());
    d.addEventListener("keydown", (e) => {
      const schritt = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
      if (!schritt) return;
      e.preventDefault();
      const l = kinder(), pos = l.indexOf(z), nach = l[pos + schritt];
      if (!nach) return;
      raster.insertBefore(z, schritt < 0 ? nach : nach.nextElementSibling);
      d.focus();
      reihenfolgeSpeichern();
    });
  });
  if (mitNeu) {
    const z = document.createElement("div");
    z.style.gridColumn = "span 6";
    z.innerHTML = `<button class="neu-kachel"><ha-icon></ha-icon>Hinzufügen</button>`;
    z.querySelector("ha-icon").icon = "mdi:plus";
    z.querySelector("button").addEventListener("click", () => neuMenue(quelle, zugriff));
    raster.appendChild(z);
  }
}

// ha-form wird von HA erst bei Bedarf geladen: einmal einen Karten-Editor anfordern, dann ist es da
async function haFormLaden() {
  if (customElements.get("ha-form")) return;
  try {
    const hf = await window.loadCardHelpers?.();
    const c = await hf?.createCardElement({ type: "entities", entities: [] });
    await c?.constructor?.getConfigElement?.();
  } catch (_) { /* */ }
  await Promise.race([customElements.whenDefined("ha-form"), new Promise((r) => setTimeout(r, 1500))]);
}
function felderVon(schema) { return schema.flatMap((x) => (x.schema ? felderVon(x.schema) : [x.name])).filter(Boolean); }
function haForm(box, data, schema, labels, aendern, hilfen = {}) {
  const f = document.createElement("ha-form");
  f.hass = Glas.hass; f.data = data; f.schema = schema;
  f.computeLabel = (s) => labels[s.name] ?? s.title ?? s.name;
  f.computeHelper = (s) => hilfen[s.name];
  f.addEventListener("value-changed", (e) => { e.stopPropagation(); const v = { ...e.detail.value }; f.data = v; aendern(v, felderVon(schema)); });
  box.appendChild(f);
  return f;
}

const MENUE_CSS = `
.vorschau{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:var(--g-a2);padding:var(--g-a2) 0}
.vorschau > *{min-width:0}
.m-gruppe{display:flex;flex-direction:column;gap:var(--g-a2);padding:var(--g-a3) var(--g-a4);border-radius:var(--g-r)}
.m-titel{display:flex;align-items:center;gap:var(--g-a2);font-size:var(--g-s-klein);font-weight:700;letter-spacing:.3px;text-transform:uppercase;color:var(--g-text2)}
.m-titel ha-icon{--mdc-icon-size:16px}
.segment{display:flex;gap:2px;padding:3px;border-radius:var(--g-r-klein);background:var(--g-fuell)}
.segment button{flex:1;min-height:40px;border-radius:11px;font-size:var(--g-s-klein);font-weight:600;color:var(--g-text2);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px}
.segment button small{font-size:var(--g-s-mini);font-weight:500}
.segment button[aria-pressed="true"]{background:var(--g-an);color:var(--g-text-an);box-shadow:0 1px 4px rgba(0,0,0,.12)}
.haken{display:flex;align-items:center;justify-content:space-between;min-height:44px;font-size:var(--g-s-name);color:var(--g-text);text-align:left;width:100%}
.haken + .haken{border-top:1px solid var(--g-trenn)}
.sw{position:relative;flex:none;width:51px;height:31px;border-radius:16px;background:var(--g-fuell);transition:background-color .2s ease}
.sw::after{content:"";position:absolute;top:2px;left:2px;width:27px;height:27px;border-radius:50%;background:#fff;box-shadow:0 2px 4px rgba(0,0,0,.2);transition:transform .22s cubic-bezier(.32,.72,0,1)}
[aria-checked="true"] .sw{background:var(--g-gruen)}
[aria-checked="true"] .sw::after{transform:translateX(20px)}
.knoepfe{display:flex;gap:var(--g-a2);flex-wrap:wrap}
.knoepfe button{flex:1;min-height:48px;padding:0 var(--g-a4);border-radius:var(--g-r-klein);font-size:var(--g-s-name);font-weight:600;color:var(--g-text)}
.knoepfe .rot{color:var(--g-rot-text)}
.m-hinweis{font-size:var(--g-s-klein);color:var(--g-text2);line-height:1.4}
`;
const GROESSEN_M = [["klein", "S", "1×1"], ["breit", "M", "2×1"], ["gross", "L", "2×2"], ["ganz", "Ganz", "Breite"]];
const SPANNE_M = { klein: 3, breit: 6, gross: 6, ganz: 12 };

// Ausführliches Menü für eine Kachel
async function kachelMenue(quelle, zugriff, i) {
  await haFormLaden();
  const h0 = Glas.hass;
  let eintrag = kopieJ(zugriff.lesen(h0)[i] || {});
  if (!eintrag.entity && !eintrag.karte) return;
  const s = new GlasSchicht({ quelle, hoch: true, titel: "Kachel bearbeiten" });
  let speicherT = null, wegFrage = false;
  const speichern = (sofort) => {
    clearTimeout(speicherT);
    const los = () => zugriff.schreiben(Glas.hass, (l) => { l[i] = kopieJ(eintrag); return l; });
    if (sofort) los(); else speicherT = setTimeout(los, 380);
  };
  // Formularwerte übernehmen: Felder, die fehlen oder leer sind, werden gelöscht
  const uebernehmen = (v, felder) => {
    felder.forEach((k) => { if (v[k] === "" || v[k] === undefined || v[k] === null || (Array.isArray(v[k]) && !v[k].length)) delete eintrag[k]; else eintrag[k] = v[k]; });
  };
  const vorschau = () => {
    const box = s.inhalt.querySelector(".vorschau");
    if (!box || eintrag.karte) return;
    const el = box.firstElementChild?.firstElementChild || document.createElement("glas-kachel-card");
    try { el.setConfig(kachelCfg(eintrag)); } catch (_) { return; }
    el.hass = Glas.hass;
    if (!el.isConnected) { const z = document.createElement("div"); z.appendChild(el); box.appendChild(z); }
    el.parentElement.style.gridColumn = `span ${SPANNE_M[eintrag.groesse || "breit"] || 6}`;
  };
  const zeichnen = () => {
    const h = Glas.hass, x = eintrag, st = x.entity && h.states[x.entity];
    s.dunkel(istDunkel(h));
    const karte = x.karte && listenKarte(x.karte);
    const name = karte ? `${karte[1]}-Karte` : x.name || st?.attributes.friendly_name || x.entity;
    const an = x.an !== false;
    const raum = zugriff.raum();
    const groessen = karte ? GROESSEN_M.filter(([g]) => g === "breit" || g === "ganz") : GROESSEN_M;
    const anzeige = anzeigeVon(x);
    const scroll = s.inhalt.scrollTop;
    s.inhalt.innerHTML = `<style>${MENUE_CSS}</style>${s.kopfHtml(name, karte ? "Ganze Karte" : x.entity)}
      ${karte ? "" : `<div class="vorschau" aria-hidden="true"></div>`}
      ${karte ? "" : `<div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:link-variant"></ha-icon>Gerät</div><div data-f="geraet"></div></div>`}
      <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:resize"></ha-icon>Größe</div>
        <div class="segment" role="group" aria-label="Größe">${groessen.map(([g, k, t]) => `<button data-g="${g}" aria-pressed="${(x.groesse || "breit") === g || (karte && g === "breit" && x.groesse !== "ganz")}">${k}<small>${t}</small></button>`).join("")}</div></div>
      ${karte ? `<div class="m-gruppe glas"><div class="m-hinweis">Was die ${esc(karte[1])}-Karte zeigt, stellst du in den Glas-Einstellungen unter „Bereiche“ ein.</div></div>` : `
      <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:eye-outline"></ha-icon>Anzeige in der Kachel</div>
        ${ANZEIGE_TEILE.map(([id, t]) => `<button class="haken" role="switch" data-a="${id}" aria-checked="${anzeige.includes(id)}">${t}<span class="sw" aria-hidden="true"></span></button>`).join("")}</div>
      <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:gesture-tap"></ha-icon>Verhalten</div><div data-f="verhalten"></div></div>
      <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:chart-timeline-variant"></ha-icon>Große Ansicht &amp; Verlauf</div><div data-f="verlauf"></div></div>`}
      ${raum ? `<div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:map-marker-outline"></ha-icon>Platz</div><div data-f="platz"></div></div>` : ""}
      <div class="knoepfe"><button class="glas" data-aus>${an ? "Ausblenden" : "Wieder zeigen"}</button><button class="glas rot" data-weg>${wegFrage ? "Wirklich entfernen?" : "Entfernen"}</button></div>`;
    s.kopfBinden();
    const $ = (q) => s.inhalt.querySelector(q);
    if (!karte) {
      haForm($("[data-f=geraet]"), { entity: x.entity, name: x.name, icon: x.icon }, [
        { name: "entity", selector: { entity: {} } },
        { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } }] },
      ], { entity: "Entität", name: "Name (leer = aus HA)", icon: "Symbol (leer = automatisch)" }, (v, f) => {
        const neuE = v.entity && v.entity !== x.entity;
        uebernehmen(v, f); speichern(); vorschau();
        if (neuE) zeichnen();
      });
      const klima = domainVon(x.entity) === "climate";
      haForm($("[data-f=verhalten]"), { typ: x.typ || "auto", farbe: x.farbe || "auto", wischen: x.wischen !== false, hell_wenn_an: x.hell_wenn_an !== false }, [
        { name: "typ", selector: { select: { mode: "dropdown", options: [{ value: "auto", label: "Automatisch" }, { value: "schalter", label: "Schalter (Tippen schaltet)" },
          { value: "regler", label: "Regler (seitlich wischen)" }, { value: "anzeige", label: "Nur anzeigen" }] } } },
        { name: "farbe", selector: { select: { mode: "dropdown", options: FARB_OPTIONEN.map(([value, label]) => ({ value, label })) } } },
        { type: "grid", name: "", schema: [{ name: "wischen", selector: { boolean: {} } }, { name: "hell_wenn_an", selector: { boolean: {} } }] },
        { type: "expandable", flatten: true, name: "akt", title: "Eigene Aktionen (Tippen, Halten …)", icon: "mdi:gesture-double-tap", schema: AKTIONEN_SCHEMA },
      ], { typ: "Verhalten", farbe: "Farbe, wenn an", wischen: "Seitlich wischen regelt", hell_wenn_an: "Hell, wenn an", ...AKTIONEN_LABELS }, (v, f) => {
        uebernehmen(v, f);
        ["wischen", "hell_wenn_an"].forEach((k) => { if (eintrag[k] === true) delete eintrag[k]; });
        if (eintrag.typ === "auto") delete eintrag.typ;
        if (eintrag.farbe === "auto") delete eintrag.farbe;
        speichern(); vorschau();
      });
      haForm($("[data-f=verlauf]"), { verlauf: x.verlauf !== false, verlauf_offen: !!x.verlauf_offen, verlauf_tage: !!x.verlauf_tage, temp_sensor: x.temp_sensor, feuchte_sensor: x.feuchte_sensor, zusatz: x.zusatz }, [
        { type: "grid", name: "", schema: [{ name: "verlauf", selector: { boolean: {} } }, { name: "verlauf_offen", selector: { boolean: {} } }] },
        { name: "verlauf_tage", selector: { boolean: {} } },
        ...(klima ? [{ type: "grid", name: "", schema: [
          { name: "temp_sensor", selector: { entity: { filter: { domain: "sensor", device_class: "temperature" } } } },
          { name: "feuchte_sensor", selector: { entity: { filter: { domain: "sensor", device_class: "humidity" } } } }] }] : []),
        { name: "zusatz", selector: { entity: { multiple: true } } },
      ], { verlauf: "Verlauf zeigen", verlauf_offen: "Verlauf gleich aufgeklappt", verlauf_tage: "7 Tage statt 24 Std.", temp_sensor: "Eigener Temperatursensor", feuchte_sensor: "Eigener Feuchtesensor",
        zusatz: "Weitere Werte als Chips in der Kachel" }, (v, f) => {
        uebernehmen(v, f);
        if (eintrag.verlauf === true) delete eintrag.verlauf;
        ["verlauf_offen", "verlauf_tage"].forEach((k) => { if (!eintrag[k]) delete eintrag[k]; });
        speichern(); vorschau();
      }, { verlauf: "Aufklappbar unten in der großen Ansicht (Symbol antippen oder lange drücken)." });
    }
    if (raum) {
      const andere = (Glas.einst.raeume || []).filter((r) => r.hash !== raum.hash);
      haForm($("[data-f=platz]"), { gruppe: x.gruppe || (x.entity ? gruppeVon(h, x.entity) : undefined), raum: "" }, [
        ...(x.entity ? [{ name: "gruppe", selector: { select: { mode: "dropdown", options: GRUPPEN.map(([value, label]) => ({ value, label })) } } }] : []),
        ...(andere.length ? [{ name: "raum", selector: { select: { mode: "dropdown", options: [{ value: "", label: "–" }, ...andere.map((r) => ({ value: r.hash, label: r.name }))] } } }] : []),
      ], { gruppe: "Abschnitt im Raum", raum: "In anderen Raum verschieben" }, (v) => {
        if (v.raum) {
          clearTimeout(speicherT);
          zugriff.schreiben(Glas.hass, (l, e) => {
            const ziel = e.raeume.find((r) => r.hash === v.raum);
            if (ziel) ziel.geraete = [...(ziel.geraete || raumGeraeteVorschlag(Glas.hass, ziel.bereich)), { ...kopieJ(eintrag), gruppe: undefined }];
            return l.filter((_, k) => k !== i);
          });
          s.schliessen();
          return;
        }
        if (v.gruppe && v.gruppe !== eintrag.gruppe) { eintrag.gruppe = v.gruppe; speichern(true); }
      });
    }
    s.inhalt.querySelectorAll("[data-g]").forEach((b) => b.addEventListener("click", () => {
      eintrag.groesse = b.dataset.g;
      s.inhalt.querySelectorAll("[data-g]").forEach((o) => o.setAttribute("aria-pressed", o === b));
      speichern(true); vorschau();
    }));
    s.inhalt.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => {
      const id = b.dataset.a, l = anzeigeVon(eintrag);
      let neu = l.includes(id) ? l.filter((y) => y !== id) : ANZEIGE_TEILE.map(([k]) => k).filter((k) => k === id || l.includes(k));
      if (!neu.length) neu = ["symbol"];
      eintrag.anzeige = neu;
      s.inhalt.querySelectorAll("[data-a]").forEach((o) => o.setAttribute("aria-checked", neu.includes(o.dataset.a)));
      speichern(true); vorschau();
    }));
    $("[data-aus]").addEventListener("click", () => { eintrag.an = eintrag.an === false; speichern(true); zeichnen(); });
    $("[data-weg]").addEventListener("click", () => {
      if (!wegFrage) { wegFrage = true; $("[data-weg]").textContent = "Wirklich entfernen?"; return; }
      clearTimeout(speicherT);
      zugriff.schreiben(Glas.hass, (l) => l.filter((_, k) => k !== i));
      s.schliessen();
    });
    s.inhalt.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
    vorschau();
    s.inhalt.scrollTop = scroll;
  };
  zeichnen();
  s.oeffnen();
}

// Neues Gerät oder ganze Karte hinzufügen
async function neuMenue(quelle, zugriff) {
  await haFormLaden();
  const s = new GlasSchicht({ quelle, titel: "Hinzufügen" });
  const h = Glas.hass, liste = zugriff.lesen(h);
  s.dunkel(istDunkel(h));
  const frei = LISTEN_KARTEN.filter(([id]) => !liste.some((y) => y.karte === id));
  s.inhalt.innerHTML = `<style>${MENUE_CSS}</style>${s.kopfHtml("Hinzufügen", zugriff.raum()?.name || "Favoriten")}
    <div class="m-gruppe glas"><div class="m-titel">Gerät</div><div data-f></div></div>
    ${frei.length ? `<div class="m-gruppe glas"><div class="m-titel">Ganze Karte</div><div class="knoepfe">${frei.map(([id, n]) => `<button class="glas" data-karte="${id}">${esc(n)}</button>`).join("")}</div></div>` : ""}`;
  s.kopfBinden();
  const fertig = (neu) => { zugriff.schreiben(Glas.hass, (l) => [...l, neu]); s.schliessen(); };
  haForm(s.inhalt.querySelector("[data-f]"), {}, [{ name: "entity", selector: { entity: {} } }], { entity: "Entität wählen" }, (v) => {
    if (!v.entity) return;
    fertig(zugriff.ort.art === "raum" ? { ...geraetVorschlag(h, v.entity), an: true } : { entity: v.entity, groesse: "breit" });
  });
  s.inhalt.querySelectorAll("[data-karte]").forEach((b) => b.addEventListener("click", () => fertig({ karte: b.dataset.karte, groesse: "breit", an: true })));
  s.oeffnen();
}
