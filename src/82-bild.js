// ---------------------------------------------------------------------------
// Bild & QR-Code · Kamera: ganze Karten, die man mehrfach in Räume und Favoriten legt.
// Die Einstellungen stehen im Listeneintrag selbst ({ karte: "bild", cfg: {…} }).
// ---------------------------------------------------------------------------
const BILD_CSS = `
.bild-karte{position:relative;display:flex;flex-direction:column;align-items:center;gap:var(--g-a2);width:100%;height:100%;padding:var(--g-a3);border-radius:var(--g-r);text-align:center}
.bild-karte .qr-mini{width:min(148px,100%);aspect-ratio:1;padding:10px;border-radius:var(--g-r-klein);background:#fff;display:flex}
.bild-karte .qr-mini svg,.bild-karte .qr-mini img{width:100%;height:100%;object-fit:contain}
.bild-karte .foto{width:100%;aspect-ratio:4/3;border-radius:var(--g-r-klein);overflow:hidden;background:var(--g-fuell)}
.bild-karte .foto img{display:block;width:100%;height:100%;object-fit:cover}
.bild-karte .leer{display:flex;align-items:center;justify-content:center;color:var(--g-text2)}
.bild-karte .leer ha-icon{--mdc-icon-size:40px}
.bild-karte .texte{align-items:center;width:100%}
.mini{flex:none;width:40px;height:40px;border-radius:10px;overflow:hidden;background:#fff;display:flex;padding:3px}
.mini svg,.mini img{width:100%;height:100%;object-fit:contain}
.mini.foto{padding:0;background:var(--g-fuell)} .mini.foto img{object-fit:cover}
.kamera-karte{position:relative;display:block;width:100%;height:100%;min-height:var(--g-kachel-h);padding:0;border-radius:var(--g-r);overflow:hidden;background:#1c232d}
.kamera-karte img{display:block;width:100%;height:100%;aspect-ratio:16/9;object-fit:cover}
.kamera-karte .unten{position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;gap:var(--g-a2);padding:var(--g-a4) var(--g-a3) var(--g-a2);
  background:linear-gradient(transparent,rgba(0,0,0,.55));color:#fff;font-size:var(--g-s-name);font-weight:600;text-align:left}
.kamera-karte .unten span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.kamera-karte .zeit{font-size:var(--g-s-klein);font-weight:500;opacity:.85}
.kamera-karte .weg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.7)}
.kamera-karte .weg ha-icon{--mdc-icon-size:36px}
`;
const BILD_BLATT_CSS = `
.bild-gross{display:flex;flex-direction:column;align-items:center;gap:var(--g-a3);padding:var(--g-a2) 0 var(--g-a4)}
.bild-gross .qr-weiss{width:min(280px,100%);aspect-ratio:1;padding:16px;border-radius:var(--g-r);background:#fff;display:flex}
.bild-gross .qr-weiss svg,.bild-gross .qr-weiss img{width:100%;height:100%;object-fit:contain}
.bild-gross .foto-gross{width:100%;max-height:70vh;border-radius:var(--g-r);object-fit:contain;background:var(--g-fuell)}
.kamera-gross{display:block;width:100%;aspect-ratio:16/9;border-radius:var(--g-r);overflow:hidden;background:#1c232d}
.mehr-ha{width:100%;margin-top:var(--g-a3)}
.kamera-gross img{display:block;width:100%;height:100%;object-fit:contain}
`;

// Bild zu HA hochladen (Medien › Bilder). Ohne Upload-API (Demo) als Daten-URL.
async function bildHochladen(hass, datei) {
  if (hass?.fetchWithAuth) {
    const fd = new FormData();
    fd.append("file", datei);
    const r = await hass.fetchWithAuth("/api/image/upload", { method: "POST", body: fd });
    if (!r.ok) throw new Error(r.status === 413 ? "Das Bild ist zu groß." : `Hochladen fehlgeschlagen (${r.status}).`);
    const j = await r.json();
    return `/api/image/serve/${j.id}/original`;
  }
  return new Promise((ok, fehler) => { const l = new FileReader(); l.onload = () => ok(l.result); l.onerror = fehler; l.readAsDataURL(datei); });
}

class GlasBildCard extends GlasBereichKarte {
  static standard() { return { quelle: "qr", ansicht: "bild" }; }
  static getConfigElement() { return document.createElement("glas-bild-card-editor"); }
  static getStubConfig() { return { titel: "Gäste-Login", quelle: "qr", text: "https://" }; }
  getGridOptions() { return { columns: 6, rows: "auto", min_columns: 3 }; }
  css() { return BEREICH_CSS + BILD_CSS; }
  entitaeten() { return this._config.quelle === "entitaet" && this._config.entity ? [this._config.entity] : []; }
  istQr() { const c = this._config; return c.quelle === "qr" || (c.scan ?? c.quelle === "hochladen"); }
  url() {
    const c = this._config;
    if (c.quelle === "entitaet") return this._hass.states[c.entity]?.attributes.entity_picture || "";
    if (c.quelle === "hochladen" || c.quelle === "link") return c.bild || "";
    return "";
  }
  inhaltHtml() {
    const c = this._config;
    if (c.quelle === "qr") return c.text ? qrSvg(c.text) : "";
    const u = this.url();
    return u ? `<img alt="" src="${esc(u)}">` : "";
  }
  titel() {
    const c = this._config;
    return c.titel || (c.quelle === "entitaet" && this._hass.states[c.entity]?.attributes.friendly_name) || (c.quelle === "qr" ? "QR-Code" : "Bild");
  }
  blattTitel() { return this.titel(); }
  html() {
    const c = this._config, innen = this.inhaltHtml(), qr = this.istQr();
    const leer = `<ha-icon data-i="${qr ? "mdi:qrcode" : "mdi:image-outline"}"></ha-icon>`;
    if (c.ansicht === "zeile") {
      return `<div class="kompakt k glas"><button class="oeffnen" aria-haspopup="dialog" aria-label="${esc(this.titel())} groß zeigen">
        <span class="mini ${qr ? "" : "foto"}" aria-hidden="true">${innen || leer}</span>
        <span class="texte"><span class="t1">${esc(this.titel())}</span>${c.unter ? `<span class="t2">${esc(c.unter)}</span>` : ""}</span></button></div>`;
    }
    return `<button class="bild-karte glas kompakt" aria-haspopup="dialog" aria-label="${esc(this.titel())} groß zeigen">
      <span class="${qr ? "qr-mini" : "foto"} ${innen ? "" : "leer"}" aria-hidden="true">${innen || leer}</span>
      <span class="texte"><span class="t1">${esc(this.titel())}</span>${c.unter ? `<span class="t2">${esc(c.unter)}</span>` : ""}</span></button>`;
  }
  binden() {
    this.iconsSetzen();
    (this.$(".oeffnen") || this.$(".bild-karte"))?.addEventListener("click", () => this.blattOeffnen());
  }
  blattHtml(s) {
    const c = this._config, innen = this.inhaltHtml(), qr = this.istQr();
    return `<style>${BILD_BLATT_CSS}</style>${s.kopfHtml(this.titel(), c.unter || "")}
      <div class="bild-gross">${!innen ? `<span class="leise">Noch kein Bild eingestellt.</span>`
        : qr ? `<div class="qr-weiss">${innen}</div><span class="leise">Mit der Handykamera scannen.</span>`
        : `<img class="foto-gross" alt="${esc(this.titel())}" src="${esc(this.url())}">`}</div>`;
  }
  blattBinden() {}
}

class GlasBildEditor extends GlasEditor {
  setConfig(c) { super.setConfig({ quelle: "qr", ansicht: "bild", ...c }); }
  schemaSchluessel(c) { return [c.quelle]; }
  schema() {
    const q = this._config.quelle || "qr";
    return [
      { type: "grid", name: "", schema: [{ name: "titel", selector: { text: {} } }, { name: "unter", selector: { text: {} } }] },
      { name: "quelle", selector: { select: { mode: "dropdown", options: [{ value: "qr", label: "QR-Code aus Link oder Text erzeugen" },
        { value: "hochladen", label: "Bild hochladen (z. B. Foto vom QR-Code)" }, { value: "entitaet", label: "Bild- oder Kamera-Entität" }, { value: "link", label: "Bild-Adresse (z. B. /local/gast.png)" }] } } },
      ...(q === "qr" ? [{ name: "text", selector: { text: { multiline: true } } }] : []),
      ...(q === "entitaet" ? [{ name: "entity", selector: { entity: { filter: [{ domain: "image" }, { domain: "camera" }] } } }] : []),
      ...(q === "link" ? [{ name: "bild", selector: { text: {} } }] : []),
      { type: "grid", name: "", schema: [
        { name: "ansicht", selector: { select: { mode: "dropdown", options: [{ value: "bild", label: "Bild in der Karte" }, { value: "zeile", label: "Klein, als Zeile" }] } } },
        ...(q === "qr" ? [] : [{ name: "scan", selector: { boolean: {} } }])] },
    ];
  }
  labels() { return { titel: "Titel", unter: "Untertitel", quelle: "Woher kommt das Bild?", text: "Link oder Text im QR-Code", entity: "Entität", bild: "Bild-Adresse",
    ansicht: "Darstellung", scan: "Ist ein QR-Code (weißer Rand, Scan-Hinweis)" }; }
  hilfen() { return { text: "Für das WLAN gibt es die Gäste-Karte. Hier z. B. den Link für den Home-Assistant-Gastzugang einfügen.", bild: "Dateien aus /config/www/ heißen /local/…" }; }
  extra(box) {
    if ((this._config.quelle || "qr") !== "hochladen") return;
    box.innerHTML = `<div class="ge-liste"><div class="ge-kopf">Bild</div>
      ${this._config.bild ? `<img alt="" src="${esc(this._config.bild)}" style="display:block;max-width:180px;max-height:180px;border-radius:12px;margin-bottom:8px;background:#fff">` : ""}
      <label class="ge-neu" style="display:inline-block">${this._config.bild ? "Anderes Bild wählen" : "Bild wählen"}<input type="file" accept="image/*" hidden></label>
      <div class="ge-hinweis" data-st>Wird in Home Assistant unter Medien › Bilder gespeichert.</div></div>`;
    const inp = box.querySelector("input"), st = box.querySelector("[data-st]");
    inp.addEventListener("change", async () => {
      const d = inp.files?.[0]; if (!d) return;
      st.textContent = "Wird hochgeladen …";
      try { const bild = await bildHochladen(this._hass, d); this.aendern({ ...this._config, bild }); this.render(); }
      catch (e) { st.textContent = e.message || "Hochladen fehlgeschlagen."; }
    });
  }
}

// Kamera: Standbild in der Karte (alle 10 s neu), Tippen = Livebild groß
class GlasKameraCard extends GlasBereichKarte {
  static getConfigElement() { return document.createElement("glas-kamera-card-editor"); }
  static getStubConfig(hass) { return { entity: Object.keys(hass.states).find((e) => e.startsWith("camera.")) || "" }; }
  css() { return BEREICH_CSS + BILD_CSS; }
  entitaeten() { return [this._config.entity].filter(Boolean); }
  st() { return this._hass.states[this._config.entity]; }
  titel() { return this._config.name || this.st()?.attributes.friendly_name || "Kamera"; }
  blattTitel() { return this.titel(); }
  blattHoch() { return false; }
  connectedCallback() {
    super.connectedCallback();
    clearInterval(this._takt);
    this._takt = setInterval(() => { const img = this.$(".kamera-karte img"); if (img && !document.hidden) img.src = this.standbild(true); }, 10000);
  }
  disconnectedCallback() { super.disconnectedCallback(); clearInterval(this._takt); }
  standbild(neu = false) {
    const p = this.st()?.attributes.entity_picture;
    if (!p) return "";
    return neu ? `${p}${p.includes("?") ? "&" : "?"}t=${Date.now()}` : p;
  }
  html() {
    const st = this.st(), b = this.standbild();
    const weg = !st || st.state === "unavailable";
    return `<button class="kamera-karte" aria-haspopup="dialog" aria-label="${esc(this.titel())} live öffnen">
      ${b && !weg ? `<img alt="" src="${esc(b)}">` : `<span class="weg"><ha-icon data-i="mdi:cctv-off"></ha-icon></span>`}
      <span class="unten"><span>${esc(this.titel())}</span>${weg ? `<span class="zeit">Nicht erreichbar</span>` : ""}</span></button>`;
  }
  binden() { this.iconsSetzen(); this.$(".kamera-karte")?.addEventListener("click", () => this.blattOeffnen()); }
  blattHtml(s) {
    return `<style>${BILD_BLATT_CSS}</style>${s.kopfHtml(this.titel(), "Kamera")}<div class="kamera-platz"></div><button class="aktion glas mehr-ha" data-mehr>Mehr in Home Assistant<ha-icon class="pfeil-r" data-i="mdi:chevron-right" aria-hidden="true"></ha-icon></button>`;
  }
  blattOeffnen() {
    super.blattOeffnen();
    const s = this._blatt, alt = s?.zu;
    if (s) s.zu = () => { alt?.(); this._live?.querySelector("img").removeAttribute("src"); }; // Stream beenden
  }
  blattBinden(s, $) {
    const st = this.st();
    if (!this._live) {
      this._live = document.createElement("div");
      this._live.className = "kamera-gross";
      this._live.innerHTML = `<img alt="Livebild">`;
    }
    const src = st?.attributes.access_token ? `/api/camera_proxy_stream/${st.entity_id}?token=${st.attributes.access_token}` : this.standbild();
    const img = this._live.querySelector("img");
    if (img.getAttribute("src") !== src) img.setAttribute("src", src);
    $(".kamera-platz").appendChild(this._live);
    $("[data-mehr]")?.addEventListener("click", () => mehrInfo(this, this._config.entity));
  }
}
class GlasKameraEditor extends GlasEditor {
  schema() { return [{ name: "entity", selector: { entity: { filter: [{ domain: "camera" }, { domain: "image" }] } } }, { name: "name", selector: { text: {} } }]; }
  labels() { return { entity: "Kamera", name: "Name (leer = aus HA)" }; }
}
