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
      if (ort.art === "abschnitte") return startseiteVon(e, ort.person).abschnitte || [];
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
        const s = (e.startseiten[id] = { ...startseiteVon(e, ort.person), ...(id !== "alle" ? { eigen: true } : {}) });
        if (ort.art === "abschnitte") s.abschnitte = fn(s.abschnitte || [], e);
        else s.favoriten = fn(s.favoriten || [], e);
      }
      return Glas.einstSpeichern(h, e).catch((err) => console.error("Glas: speichern", err));
    },
  };
  return z;
}

const BEARB_CSS = `
.bearb [data-i]{position:relative}
.bearb [data-i]:not([data-griff]) > :not(.deckel){pointer-events:none}
.bearb [data-griff] > .deckel{bottom:auto;height:52px;box-shadow:none}
.deckel{position:absolute;inset:0;z-index:2;border-radius:var(--g-r);background:transparent;cursor:grab;touch-action:pan-y;
  box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--g-akzent) 50%,transparent)}
.deckel .marke{position:absolute;top:-6px;right:-6px;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  background:var(--g-akzent-voll);color:#fff;box-shadow:0 2px 6px rgba(0,0,0,.2)}
.deckel .marke ha-icon{--mdc-icon-size:14px}
.bearb .aus > :not(.deckel){opacity:.4}
.bearb .aus > .deckel .marke{background:#636366}
.bearb .zieht{z-index:5}
.bearb .zieht > :first-child{transform:scale(1.04);border-radius:var(--g-r);box-shadow:0 14px 34px rgba(0,0,0,.28);transition:transform .18s cubic-bezier(.23,1,.32,1)}
.bearb .zieht > .deckel{cursor:grabbing}
.bearb .ordner-ziel > :first-child{transform:scale(1.07);border-radius:var(--g-r);box-shadow:0 0 0 3px var(--g-akzent),0 10px 30px rgba(0,0,0,.2);transition:transform .22s cubic-bezier(.34,1.4,.64,1)}
.bearb .gehalten > :first-child{transform:scale(1.03);transition:transform .18s cubic-bezier(.23,1,.32,1)}
.bearb .abschn-raster:not(:has([data-i]))::after{content:"Kacheln hierher ziehen";grid-column:span 12;min-height:64px;display:flex;align-items:center;justify-content:center;
  border:1.5px dashed var(--g-text2);border-radius:var(--g-r);color:var(--g-text2);font-size:var(--g-s-klein)}
.neu-kachel{display:flex;align-items:center;justify-content:center;gap:var(--g-a2);width:100%;min-height:var(--g-kachel-h);border-radius:var(--g-r);
  border:1.5px dashed var(--g-text2);color:var(--g-text);font-size:var(--g-s-name);font-weight:600}
.platzhalter{display:flex;align-items:center;gap:var(--g-a3);min-height:72px;padding:var(--g-a3) var(--g-a4);border-radius:var(--g-r);color:var(--g-text)}
.platzhalter .leise{display:block}
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
function bearbeitRaster(raster, zugriff, quelle, { scroller = null, mitNeu = true, menue: eigenesMenue = null } = {}) {
  raster.classList.add("bearb");
  const ordnerErlaubt = zugriff?.ort && zugriff.ort.art !== "abschnitte";
  if (ordnerErlaubt) {
    const l = zugriff.lesen(Glas.hass);
    raster.querySelectorAll("[data-i]").forEach((z) => { const x = l[Number(z.dataset.i)]; if (x && (x.entity || x.ordner)) z.dataset.ordnerbar = "1"; });
  }
  // eigene Kacheln: auch in Abschnitt-Kästen (Räume), aber nicht die eines inneren Rasters (Favoriten in der Startseite)
  const kinder = () => [...raster.querySelectorAll("[data-i]")].filter((z) => z.parentElement.closest(".bearb") === raster);
  const reihenfolgeSpeichern = () => {
    const neu = kinder().map((z) => ({ i: Number(z.dataset.i), gruppe: z.parentElement.closest("[data-gruppe]")?.dataset.gruppe || undefined }));
    zugriff.schreiben(Glas.hass, (liste) => {
      const l = neu.map(({ i, gruppe }) => (liste[i] ? { ...liste[i], ...(gruppe ? { gruppe } : {}) } : null)).filter(Boolean);
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
    const menue = () => (eigenesMenue ? eigenesMenue(Number(z.dataset.i)) : kachelMenue(quelle, zugriff, Number(z.dataset.i)));
    const ende = (ok) => {
      clearTimeout(halteT);
      const x = g; g = null;
      z.classList.remove("gehalten");
      if (!x) return;
      if (!x.zieht) { if (ok && !x.weg) menue(); return; }
      clearTimeout(x.ordnerT);
      z.classList.remove("zieht");
      if (x.ordnerZiel && ok) {
        x.ordnerZiel.classList.remove("ordner-ziel");
        const von = Number(z.dataset.i), auf = Number(x.ordnerZiel.dataset.i);
        z.style.transition = "transform .2s ease, opacity .2s ease"; z.style.opacity = "0";
        zugriff.schreiben(Glas.hass, (l) => ordnerBilden(l, von, auf));
        vibrieren(15);
        return;
      }
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
      // Mitte einer Kachel kurz halten = Ordner anlegen (wie am iPhone); Rand = davor/dahinter einsortieren
      let mitte = false;
      if (ziel && ordnerErlaubt && ziel.dataset.ordnerbar && z.dataset.ordnerbar) {
        const r = ziel.getBoundingClientRect(), rx = (e.clientX - r.left) / r.width;
        mitte = rx > 0.26 && rx < 0.74;
      }
      if (mitte) {
        if (g.ordnerKand !== ziel) {
          clearTimeout(g.ordnerT); g.ordnerZiel?.classList.remove("ordner-ziel"); g.ordnerZiel = null; g.ordnerKand = ziel;
          g.ordnerT = setTimeout(() => { if (g && g.ordnerKand === ziel) { g.ordnerZiel = ziel; ziel.classList.add("ordner-ziel"); vibrieren(10); } }, 420);
        }
      } else if (g.ordnerKand) { clearTimeout(g.ordnerT); g.ordnerZiel?.classList.remove("ordner-ziel"); g.ordnerZiel = null; g.ordnerKand = null; }
      if (ziel && !mitte && ziel !== g.ziel) {
        const r = ziel.getBoundingClientRect(), vor = e.clientX < r.left + r.width / 2;
        const ref = vor ? ziel : ziel.nextElementSibling;
        if (ref !== z && (z.nextElementSibling !== ref || z.parentNode !== ziel.parentNode)) { flip(kinder(), () => ziel.parentNode.insertBefore(z, ref)); g.bewegt = true; }
      }
      if (!ziel) {
        // leerer Abschnitt unter dem Finger: dort hinein
        const box = [...raster.querySelectorAll(".abschn-raster")].find((b) => { const r = b.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; });
        if (box && box !== z.parentNode && !kinder().some((k) => k !== z && k.parentNode === box)) { flip(kinder(), () => box.appendChild(z)); g.bewegt = true; }
      }
      g.ziel = mitte ? g.ziel : ziel || null;
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
      nach.parentNode.insertBefore(z, schritt < 0 ? nach : nach.nextElementSibling);
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
.karten-wahl{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:var(--g-a2)}
.karten-wahl button{display:flex;align-items:center;gap:var(--g-a2);min-height:52px;padding:0 var(--g-a3);border-radius:var(--g-r-klein);font-size:var(--g-s-name);font-weight:600;color:var(--g-text);text-align:left}
.karten-wahl button span{display:flex;flex-direction:column}
.karten-wahl small{font-size:var(--g-s-mini);font-weight:500;color:var(--g-text2)}
.karten-wahl button:disabled{opacity:.5}
.karten-wahl ha-icon{--mdc-icon-size:22px;color:var(--g-akzent)}
.neu-zeile{display:flex;gap:var(--g-a2);margin-top:var(--g-a2)}
.neu-zeile input{flex:1;min-width:0;min-height:44px;padding:0 var(--g-a3);border-radius:var(--g-r-klein);border:1px solid var(--g-glas-rand);background:var(--g-fuell);
  font:inherit;font-size:16px;color:var(--g-text);outline-color:var(--g-akzent)}
.neu-zeile button{flex:none;min-height:44px;padding:0 var(--g-a4);border-radius:var(--g-r-klein);font-size:var(--g-s-name);font-weight:600;color:#fff;background:var(--g-akzent-voll)}
.neu-zeile button:disabled{opacity:.45}
.m-hinweis{font-size:var(--g-s-klein);color:var(--g-text2);line-height:1.4}
`;
const GROESSEN_M = [["klein", "S", "1×1"], ["breit", "M", "2×1"], ["gross", "L", "2×2"], ["ganz", "Ganz", "Breite"]];
const SPANNE_M = { klein: 3, breit: 6, gross: 6, ganz: 12 };

// Ausführliches Menü für eine Kachel
async function kachelMenue(quelle, zugriff, i) {
  await haFormLaden();
  const h0 = Glas.hass;
  let eintrag = kopieJ(zugriff.lesen(h0)[i] || {});
  if (eintrag.ordner) return ordnerMenue(quelle, zugriff, i);
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
    const name = karte ? (karte[4] ? listenKarteName(x) : `${karte[1]}-Karte`) : x.name || st?.attributes.friendly_name || x.entity;
    const an = x.an !== false;
    const raum = zugriff.raum();
    const groessen = karte ? GROESSEN_M.filter(([g]) => g === "breit" || g === "ganz" || (karte[4] && g === "gross")) : GROESSEN_M;
    const anzeige = anzeigeVon(x);
    const scroll = s.inhalt.scrollTop;
    s.inhalt.innerHTML = `<style>${MENUE_CSS}</style>${s.kopfHtml(name, karte ? "Ganze Karte" : x.entity)}
      ${karte ? "" : `<div class="vorschau" aria-hidden="true"></div>`}
      ${karte ? "" : `<div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:link-variant"></ha-icon>Gerät</div><div data-f="geraet"></div></div>`}
      <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:resize"></ha-icon>Größe</div>
        <div class="segment" role="group" aria-label="Größe">${groessen.map(([g, k, t]) => `<button data-g="${g}" aria-pressed="${(x.groesse || "breit") === g || (karte && !karte[4] && g === "breit" && x.groesse !== "ganz")}">${k}<small>${t}</small></button>`).join("")}</div></div>
      ${karte ? `<div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:tune-variant"></ha-icon>Einstellungen</div>
        ${karte[4] ? "" : `<div class="m-hinweis">Gilt für die ${esc(karte[1])}-Karte überall im Dashboard.</div>`}<div data-ked></div></div>` : `
      <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:eye-outline"></ha-icon>Anzeige in der Kachel</div>
        ${ANZEIGE_TEILE.map(([id, t]) => `<button class="haken" role="switch" data-a="${id}" aria-checked="${anzeige.includes(id)}">${t}<span class="sw" aria-hidden="true"></span></button>`).join("")}</div>
      <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:gesture-tap"></ha-icon>Verhalten</div><div data-f="verhalten"></div></div>
      <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:chart-timeline-variant"></ha-icon>Große Ansicht &amp; Verlauf</div><div data-f="verlauf"></div></div>`}
      ${raum ? `<div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:map-marker-outline"></ha-icon>Platz</div><div data-f="platz"></div></div>` : ""}
      ${karte ? "" : `<div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:folder-outline"></ha-icon>In Ordner legen</div>
        <div class="karten-wahl">${zugriff.lesen(h).map((y, k) => (y.ordner ? `<button class="glas" data-in-ordner="${k}"><ha-icon data-i="mdi:folder-outline"></ha-icon><span>${esc(y.name || "Ordner")}<small>${(y.eintraege || []).length} Geräte</small></span></button>` : "")).join("")}
          <button class="glas" data-in-ordner="neu"><ha-icon data-i="mdi:folder-plus-outline"></ha-icon><span>Neuer Ordner</span></button></div>
        <div class="m-hinweis">Oder im Bearbeiten-Modus eine Kachel auf die Mitte einer anderen ziehen und kurz halten.</div></div>`}
      <div class="knoepfe"><button class="glas" data-aus>${an ? "Ausblenden" : "Wieder zeigen"}</button><button class="glas rot" data-weg>${wegFrage ? "Wirklich entfernen?" : "Entfernen"}</button></div>`;
    s.kopfBinden();
    const $ = (q) => s.inhalt.querySelector(q);
    if (karte) {
      // Einstellungen der ganzen Karte direkt hier (eigene Karten im Eintrag, Drucker/Robi gemeinsam unter Bereiche)
      const tag = `${karte[3]}-editor`, box = $("[data-ked]");
      customElements.whenDefined(tag).then(() => {
        if (!box.isConnected) return;
        const ed = document.createElement(tag);
        ed.hass = Glas.hass;
        ed.setConfig({ type: `custom:${karte[3]}`, ...(karte[4] ? x.cfg || {} : (Glas.einst.bereiche || {})[x.karte] || {}) });
        let t = null;
        ed.addEventListener("config-changed", (ev) => {
          ev.stopPropagation();
          const { type, ...rest } = ev.detail.config;
          if (karte[4]) { eintrag.cfg = rest; speichern(); const tt = s.kopfPlatz.querySelector(".titel"); if (tt) tt.textContent = listenKarteName(eintrag); }
          else { clearTimeout(t); t = setTimeout(() => bereichSpeichern(x.karte, rest), 400); }
        });
        box.appendChild(ed);
      });
    }
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
      const eigene = Object.keys(raum.gruppen_namen || {}).filter((k) => !GRUPPEN.some(([g]) => g === k));
      const gStandard = x.entity ? gruppeVon(h, x.entity) : `karte-${x.karte}`;
      haForm($("[data-f=platz]"), { gruppe: x.gruppe || gStandard, raum: "" }, [
        { name: "gruppe", selector: { select: { mode: "dropdown", options: [...new Set([...(x.karte ? [gStandard] : []), ...GRUPPEN.map(([g]) => g), ...eigene])].map((g) => ({ value: g, label: gruppenName(raum, g) })) } } },
        { name: "neu_gruppe", selector: { text: {} } },
        ...(andere.length ? [{ name: "raum", selector: { select: { mode: "dropdown", options: [{ value: "", label: "–" }, ...andere.map((r) => ({ value: r.hash, label: r.name }))] } } }] : []),
      ], { gruppe: "Abschnitt im Raum", neu_gruppe: "Oder neuer Abschnitt (Name eintippen)", raum: "In anderen Raum verschieben" }, (v) => {
        if (v.neu_gruppe && v.neu_gruppe.trim()) {
          clearTimeout(speicherT);
          const name = v.neu_gruppe.trim(), key = `eigen-${slug(name)}`;
          eintrag.gruppe = key;
          zugriff.schreiben(Glas.hass, (l, e) => { const r = e.raeume.find((y) => y.hash === raum.hash); r.gruppen_namen = { ...(r.gruppen_namen || {}), [key]: name }; l[i] = kopieJ(eintrag); return l; });
          return;
        }
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
    s.inhalt.querySelectorAll("[data-in-ordner]").forEach((b) => b.addEventListener("click", () => {
      clearTimeout(speicherT);
      const ziel = b.dataset.inOrdner, { gruppe, an: _an, ...rein } = kopieJ(eintrag);
      zugriff.schreiben(Glas.hass, (l) => {
        if (ziel === "neu") { l[i] = { ordner: true, name: "Neuer Ordner", groesse: "breit", an: true, ...(gruppe ? { gruppe } : {}), eintraege: [rein] }; return l; }
        const k = Number(ziel);
        l[k] = { ...l[k], eintraege: [...(l[k].eintraege || []), rein] };
        return l.filter((_, n) => n !== i);
      });
      s.schliessen();
      if (ziel === "neu") setTimeout(() => ordnerMenue(quelle, zugriff, i), 250);
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
  const da = (id) => !listenKarte(id)[4] && liste.some((y) => y.karte === id);
  s.inhalt.innerHTML = `<style>${MENUE_CSS}</style>${s.kopfHtml("Hinzufügen", zugriff.raum()?.name || "Favoriten")}
    <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:link-variant"></ha-icon>Gerät</div><div data-f></div></div>
    <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:card-outline"></ha-icon>Ganze Karte</div><div class="karten-wahl">${LISTEN_KARTEN.map(([id, n, ic]) =>
      `<button class="glas" data-karte="${id}" ${da(id) ? "disabled" : ""}><ha-icon data-i="${ic}"></ha-icon><span>${esc(n)}${da(id) ? `<small>Schon hier</small>` : ""}</span></button>`).join("")}</div></div>`;
  s.kopfBinden();
  const fertig = (neu) => {
    const n = liste.length;
    zugriff.schreiben(Glas.hass, (l) => [...l, neu]);
    s.schliessen();
    if (neu.karte && listenKarte(neu.karte)[4]) setTimeout(() => kachelMenue(quelle, zugriff, n), 200); // gleich einstellen
  };
  haForm(s.inhalt.querySelector("[data-f]"), {}, [{ name: "entity", selector: { entity: {} } }], { entity: "Entität wählen" }, (v) => {
    if (!v.entity) return;
    fertig(zugriff.ort.art === "raum" ? { ...geraetVorschlag(h, v.entity), an: true } : { entity: v.entity, groesse: "breit" });
  });
  s.inhalt.querySelectorAll("[data-karte]").forEach((b) => b.addEventListener("click", () => fertig({ karte: b.dataset.karte, groesse: listenKarte(b.dataset.karte)[4] ? "gross" : "breit", an: true, ...(listenKarte(b.dataset.karte)[4] ? { cfg: {} } : {}) })));
  s.oeffnen();
}

// Name eines Abschnitts im Raum: eigener Name, sonst Standardname
function gruppenName(raum, g) {
  if (!raum?.gruppen_namen?.[g] && g?.startsWith("karte-")) return listenKarte(g.slice(6))?.[1] || "Karte";
  return raum?.gruppen_namen?.[g] || (GRUPPEN.find(([id]) => id === g) || [, g && g.startsWith("eigen-") ? g.slice(6) : "Sonstiges"])[1];
}

// ---------------------------------------------------------------------------
// Startseiten-Abschnitt bearbeiten: zeigen, Breite, alle Einstellungen der Karte
// ---------------------------------------------------------------------------
const ABSCHNITT_EDITOR = { wetter: "glas-wetter-card-editor", planer: "glas-planer-card-editor", sicherheit: "glas-sicherheit-card-editor",
  drucker: "glas-drucker-card-editor", robi: "glas-robi-card-editor", gaeste: "glas-gaeste-card-editor", hinweise: "glas-hinweise-card-editor" };
function bereichSpeichern(id, cfg) {
  const e = kopieJ(Glas.einst);
  e.bereiche = { ...(e.bereiche || {}), [id]: cfg };
  return Glas.einstSpeichern(Glas.hass, e).catch((err) => console.error("Glas: speichern", err));
}
async function abschnittMenue(quelle, zugriff, i, festId = null) {
  await haFormLaden();
  const liste = festId ? [] : zugriff.lesen(Glas.hass);
  const a = festId ? { id: festId } : kopieJ(liste[i] || {});
  const info = ABSCHNITTE.find(([id]) => id === a.id) || [a.id, a.id === "hinweise" ? "Warnungen" : a.id, "mdi:card-outline"];
  const s = new GlasSchicht({ quelle, hoch: true, titel: `${info[1]} bearbeiten` });
  s.dunkel(istDunkel(Glas.hass));
  const zeigenAn = festId ? (Glas.einst.bereiche?.[festId]?.an !== false) : a.an !== false;
  s.inhalt.innerHTML = `<style>${MENUE_CSS}</style>${s.kopfHtml(info[1], "Abschnitt der Startseite")}
    <div class="m-gruppe glas"><button class="haken" role="switch" data-zeigen aria-checked="${zeigenAn}">Auf der Startseite zeigen<span class="sw" aria-hidden="true"></span></button></div>
    ${festId || a.id === "zuhause" ? "" : `<div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:resize"></ha-icon>Darstellung</div>
      <div class="segment" role="group" aria-label="Darstellung">${[["halb", "Halb", "Karte"], ["ganz", "Ganz", "Karte"], ...(WIDGET_ARTEN.includes(a.id) ? [["widget", "Widget", "Quadrat"]] : [])]
        .map(([b, n, k]) => `<button data-b="${b}" aria-pressed="${b === "widget" ? !!a.widget : !a.widget && (a.breite || "ganz") === b}">${n}<small>${k}</small></button>`).join("")}</div>
      ${WIDGET_ARTEN.includes(a.id) ? `<div class="m-hinweis">Widget: quadratisch wie auf dem iPhone-Homescreen, zwei nebeneinander. Antippen öffnet die große Ansicht.</div>` : ""}</div>`}
    ${ABSCHNITT_EDITOR[a.id] ? `<div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:tune-variant"></ha-icon>Einstellungen</div><div data-ed></div></div>`
      : a.id === "favoriten" ? `<div class="m-gruppe glas"><div class="m-hinweis">Die Favoriten bearbeitest du direkt: Kachel antippen oder verschieben, unten „Hinzufügen“.</div></div>` : ""}`;
  s.kopfBinden();
  const abschnittSetzen = (teil) => zugriff.schreiben(Glas.hass, (l) => { l[i] = { ...l[i], ...teil }; return l; });
  s.inhalt.querySelector("[data-zeigen]").addEventListener("click", (ev) => {
    const b = ev.currentTarget, an = b.getAttribute("aria-checked") !== "true";
    b.setAttribute("aria-checked", an);
    if (festId) bereichSpeichern(festId, { ...(Glas.einst.bereiche?.[festId] || {}), an }); else abschnittSetzen({ an });
  });
  s.inhalt.querySelectorAll("[data-b]").forEach((b) => b.addEventListener("click", () => {
    s.inhalt.querySelectorAll("[data-b]").forEach((o) => o.setAttribute("aria-pressed", o === b));
    abschnittSetzen(b.dataset.b === "widget" ? { widget: true } : { breite: b.dataset.b, widget: false });
  }));
  const box = s.inhalt.querySelector("[data-ed]");
  if (box) {
    const tag = ABSCHNITT_EDITOR[a.id];
    await customElements.whenDefined(tag);
    const ed = document.createElement(tag);
    ed.hass = Glas.hass;
    ed.setConfig({ type: `custom:${tag.replace("-editor", "")}`, ...((Glas.einst.bereiche || {})[a.id] || {}) });
    let t = null;
    ed.addEventListener("config-changed", (ev) => {
      ev.stopPropagation();
      const { type, ...rest } = ev.detail.config;
      clearTimeout(t); t = setTimeout(() => bereichSpeichern(a.id, rest), 400);
    });
    box.appendChild(ed);
  }
  s.inhalt.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
  s.oeffnen();
}

// ---------------------------------------------------------------------------
// Raum bearbeiten: Name, Sensoren im Kopf, Chips, Abschnitte umbenennen, Anordnung
// ---------------------------------------------------------------------------
async function raumMenue(quelle, hash) {
  await haFormLaden();
  const raum0 = (Glas.einst?.raeume || []).find((r) => r.hash === hash);
  if (!raum0) return;
  const s = new GlasSchicht({ quelle, hoch: true, titel: `${raum0.name} einstellen` });
  s.dunkel(istDunkel(Glas.hass));
  let r = kopieJ(raum0), t = null;
  const speichern = () => {
    clearTimeout(t);
    t = setTimeout(() => {
      const e = kopieJ(Glas.einst), k = e.raeume.findIndex((x) => x.hash === hash);
      if (k < 0) return;
      e.raeume[k] = { ...e.raeume[k], ...r, geraete: e.raeume[k].geraete };
      Glas.einstSpeichern(Glas.hass, e).catch(() => {});
      quelle.rasterZeichnen?.(); // z. B. neuer leerer Abschnitt sofort sichtbar
    }, 400);
  };
  const h = Glas.hass;
  const benutzt = () => [...new Set((r.geraete || raumGeraeteVorschlag(h, r.bereich)).filter((g) => g.entity || g.karte || g.ordner).map((g) => g.gruppe || (g.entity ? gruppeVon(h, g.entity) : g.ordner ? (g.eintraege?.[0]?.entity && h.states[g.eintraege[0].entity] ? gruppeVon(h, g.eintraege[0].entity) : "sonstiges") : `karte-${g.karte}`)))];
  s.inhalt.innerHTML = `<style>${MENUE_CSS}</style>${s.kopfHtml(r.name, "Raum einstellen")}
    <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:door"></ha-icon>Raum</div><div data-f="raum"></div></div>
    <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:thermometer"></ha-icon>Kopfzeile: Messwerte</div><div data-f="mess"></div></div>
    <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:window-open-variant"></ha-icon>Kopfzeile: Fenster und Türen</div><div data-f="fenster"></div></div>
    <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:motion-sensor"></ha-icon>Kopfzeile: weitere Chips</div><div data-f="chips"></div></div>
    <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:view-grid-outline"></ha-icon>Anordnung</div>
      <div class="segment" role="group" aria-label="Anordnung">${[[1, "Untereinander"], [2, "Nebeneinander"]].map(([n, l]) => `<button data-sp="${n}" aria-pressed="${(r.spalten || 1) === n}">${l}<small>${n === 1 ? "eine Spalte" : "Abschnitte versetzt"}</small></button>`).join("")}</div>
      <div class="m-hinweis">Nebeneinander gilt auf breiten Bildschirmen (PC, Tablet quer). Am Handy bleibt es eine Spalte.</div></div>
    <div class="m-gruppe glas"><div class="m-titel"><ha-icon data-i="mdi:format-title"></ha-icon>Abschnitte</div><div data-f="namen"></div>
      <form class="neu-zeile" data-neu><input type="text" placeholder="Neuer Abschnitt, z. B. Sofa-Ecke" aria-label="Name des neuen Abschnitts" enterkeyhint="done"><button type="submit" disabled>Hinzufügen</button></form>
      <div class="m-hinweis">Ein neuer Abschnitt erscheint leer im Raum. Kacheln ziehst du im Bearbeiten-Modus hinein. Leere Abschnitte ohne Namen verschwinden.</div></div>`;
  s.kopfBinden();
  const $ = (q) => s.inhalt.querySelector(q);
  const nimm = (v, f) => { f.forEach((k) => { if (v[k] === "" || v[k] === undefined || (Array.isArray(v[k]) && !v[k].length)) delete r[k]; else r[k] = v[k]; }); speichern(); };
  haForm($("[data-f=raum]"), { name: r.name, icon: r.icon, bereich: r.bereich }, [
    { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "icon", selector: { icon: {} } }] },
    { name: "bereich", selector: { area: {} } },
  ], { name: "Name", icon: "Symbol", bereich: "HA-Bereich" }, nimm);
  haForm($("[data-f=mess]"), { temperatur: r.temperatur, feuchte: r.feuchte }, [
    { name: "temperatur", selector: { entity: { filter: { domain: "sensor", device_class: "temperature" } } } },
    { name: "feuchte", selector: { entity: { filter: { domain: "sensor", device_class: "humidity" } } } },
  ], { temperatur: "Temperatursensor (leer = automatisch)", feuchte: "Luftfeuchtesensor (leer = automatisch)" }, nimm);
  const fensterForm = () => {
    const box = $("[data-f=fenster]");
    box.replaceChildren();
    const alle = raumFensterAlle(h, r);
    haForm(box, { fenster_zeigen: raumFensterGezeigt(h, r) }, [
      ...(alle.length ? [{ name: "fenster_zeigen", selector: { select: { multiple: true, mode: "list", options: alle.map((e) => ({ value: e, label: `${h.states[e]?.attributes.friendly_name || e}${raumFensterAuto(h, r.bereich).includes(e) ? "" : " (hinzugefügt)"}` })) } } }] : []),
      { name: "fenster_neu", selector: { entity: { filter: { domain: "binary_sensor", device_class: CHIP_KLASSEN } } } },
    ], { fenster_zeigen: "Oben anzeigen", fenster_neu: "Weiteren Sensor hinzufügen" }, (v) => {
      const gezeigt = [...(v.fenster_zeigen || []), ...(v.fenster_neu && !(v.fenster_zeigen || []).includes(v.fenster_neu) ? [v.fenster_neu] : [])];
      raumFensterSetzen(h, r, gezeigt);
      speichern();
      if (v.fenster_neu) fensterForm();
    }, alle.length ? {} : { fenster_neu: "Im Bereich gibt es keine Fenster- oder Türsensoren." });
  };
  fensterForm();
  haForm($("[data-f=chips]"), { bewegung: r.bewegung, chips: r.chips, verlauf_chip: r.verlauf_chip !== false, alles_aus: r.alles_aus !== false }, [
    { name: "bewegung", selector: { entity: { multiple: true, filter: { domain: "binary_sensor", device_class: ["motion", "occupancy", "presence"] } } } },
    { name: "chips", selector: { entity: { multiple: true } } },
    { type: "grid", name: "", schema: [{ name: "verlauf_chip", selector: { boolean: {} } }, { name: "alles_aus", selector: { boolean: {} } }] },
  ], { bewegung: "Bewegungsmelder", chips: "Weitere Chips (beliebige Entitäten)",
    verlauf_chip: "Chip „Verlauf“", alles_aus: "Knopf „Alles aus“" }, (v, f) => {
    nimm(v, f);
    ["verlauf_chip", "alles_aus"].forEach((k) => { if (r[k] === true) delete r[k]; });
  });
  const namenZeichnen = () => {
    const genutzt = benutzt();
    const alle = [...genutzt, ...Object.keys(r.gruppen_namen || {}).filter((g) => g.startsWith("eigen-") && !genutzt.includes(g))];
    const box = $("[data-f=namen]");
    box.replaceChildren();
    haForm(box, Object.fromEntries(alle.map((g) => [`gn_${g}`, r.gruppen_namen?.[g] || ""])), alle.map((g) => ({ name: `gn_${g}`, selector: { text: {} } })),
      Object.fromEntries(alle.map((g) => [`gn_${g}`, g.startsWith("eigen-") ? `Eigener Abschnitt${genutzt.includes(g) ? "" : " (noch leer)"}` : `${gruppenName(null, g)} heißt …`])), (v) => {
        const gn = { ...(r.gruppen_namen || {}) };
        alle.forEach((g) => { const w = (v[`gn_${g}`] || "").trim(); if (w) gn[g] = w; else if (!g.startsWith("eigen-") || !genutzt.includes(g)) delete gn[g]; });
        r.gruppen_namen = gn; speichern();
      });
  };
  namenZeichnen();
  const neuForm = $("[data-neu]"), neuIn = neuForm.querySelector("input"), neuKnopf = neuForm.querySelector("button");
  neuIn.addEventListener("input", () => { neuKnopf.disabled = !neuIn.value.trim(); });
  neuForm.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const name = neuIn.value.trim(); if (!name) return;
    let key = `eigen-${slug(name)}`, n = 2;
    while (r.gruppen_namen?.[key] || benutzt().includes(key)) key = `eigen-${slug(name)}-${n++}`;
    r.gruppen_namen = { ...(r.gruppen_namen || {}), [key]: name };
    neuIn.value = ""; neuKnopf.disabled = true;
    speichern(); namenZeichnen();
  });
  s.inhalt.querySelectorAll("[data-sp]").forEach((b) => b.addEventListener("click", () => {
    s.inhalt.querySelectorAll("[data-sp]").forEach((o) => o.setAttribute("aria-pressed", o === b));
    r.spalten = Number(b.dataset.sp); if (r.spalten === 1) delete r.spalten; speichern();
  }));
  s.inhalt.querySelectorAll("ha-icon[data-i]").forEach((el) => { el.icon = el.dataset.i; });
  s.oeffnen();
}
