// ---------------------------------------------------------------------------
// Gerätewissen: was ist "an", was lässt sich dimmen, wie schaltet man es
// Eine Stelle für alle Karten, damit sich jede Entität überall gleich verhält
// ---------------------------------------------------------------------------
const AN_ZUSTAENDE = ["on", "open", "opening", "closing", "playing", "paused", "buffering", "cleaning", "returning", "home",
  "unlocked", "unlocking", "open", "heat", "cool", "auto", "heat_cool", "dry", "fan_only", "armed_home", "armed_away",
  "armed_night", "armed_vacation", "armed_custom_bypass", "triggered", "active"];
const WARN_KLASSEN = { door: "orange", window: "orange", opening: "orange", garage_door: "orange", lock: "orange",
  moisture: "rot", smoke: "rot", gas: "rot", carbon_monoxide: "rot", problem: "rot", safety: "rot", tamper: "rot", heat: "rot", cold: "blau" };
const SCHALTBAR = ["light", "switch", "input_boolean", "fan", "cover", "climate", "media_player", "lock", "vacuum",
  "automation", "humidifier", "valve", "siren", "water_heater", "remote", "group"];
const AUSLOESBAR = ["scene", "script", "button", "input_button"];

const Geraet = {
  istAn(st) {
    if (!st) return false;
    const d = domainVon(st.entity_id);
    if (d === "lock") return st.state === "unlocked" || st.state === "open";
    if (d === "climate") return st.state !== "off" && st.state !== "unavailable";
    if (d === "media_player") return ["playing", "paused", "on", "buffering"].includes(st.state);
    if (d === "sensor" || d === "weather" || d === "input_number" || d === "number") return false;
    return AN_ZUSTAENDE.includes(st.state);
  },
  istWarnung(st) {
    if (!st || domainVon(st.entity_id) !== "binary_sensor" || st.state !== "on") return null;
    return WARN_KLASSEN[st.attributes.device_class] || null;
  },
  verfuegbar(st) { return st && st.state !== "unavailable" && st.state !== "unknown"; },
  schaltbar(st) { return st && SCHALTBAR.includes(domainVon(st.entity_id)); },
  ausloesbar(st) { return st && AUSLOESBAR.includes(domainVon(st.entity_id)); },

  // Regler: Wert 0–100 und wie man ihn setzt. null = nicht regelbar
  regler(st) {
    if (!st) return null;
    const d = domainVon(st.entity_id), a = st.attributes, f = Number(a.supported_features || 0);
    if (d === "light") {
      const modes = a.supported_color_modes || [];
      if (!modes.length || (modes.length === 1 && modes[0] === "onoff")) return null;
      const pct = st.state === "on" ? Math.round(((a.brightness ?? 255) / 255) * 100) : 0;
      return { pct, text: (p) => (p > 0 ? `${Math.round(p)} %` : "Aus"),
        setzen: (h, p) => (p <= 0 ? h.callService("light", "turn_off", { entity_id: st.entity_id })
          : h.callService("light", "turn_on", { entity_id: st.entity_id, brightness_pct: Math.max(1, Math.round(p)) })) };
    }
    if (d === "fan" && f & 1) {
      const pct = st.state === "on" ? Number(a.percentage ?? 100) : 0;
      return { pct, text: (p) => (p > 0 ? `${Math.round(p)} %` : "Aus"),
        setzen: (h, p) => h.callService("fan", "set_percentage", { entity_id: st.entity_id, percentage: Math.round(p) }) };
    }
    if (d === "cover" && f & 4) {
      const pct = Number(a.current_position ?? (st.state === "open" ? 100 : 0));
      return { pct, text: (p) => (p <= 0 ? "Geschlossen" : `Offen ${Math.round(p)} %`),
        setzen: (h, p) => h.callService("cover", "set_cover_position", { entity_id: st.entity_id, position: Math.round(p) }) };
    }
    if (d === "climate" && a.temperature != null) {
      const min = Number(a.min_temp ?? 7), max = Number(a.max_temp ?? 30), schritt = Number(a.target_temp_step || 0.5);
      const zuT = (p) => Math.round((min + (p / 100) * (max - min)) / schritt) * schritt;
      return { pct: ((Number(a.temperature) - min) / (max - min)) * 100, text: (p) => `${String(zuT(p)).replace(".", ",")}°`,
        setzen: (h, p) => h.callService("climate", "set_temperature", { entity_id: st.entity_id, temperature: zuT(p) }) };
    }
    if (d === "media_player" && f & 4) {
      return { pct: Math.round(Number(a.volume_level ?? 0) * 100), text: (p) => `Lautstärke ${Math.round(p)} %`,
        setzen: (h, p) => h.callService("media_player", "volume_set", { entity_id: st.entity_id, volume_level: Math.round(p) / 100 }) };
    }
    if (d === "input_number" || d === "number") {
      const min = Number(a.min ?? 0), max = Number(a.max ?? 100), schritt = Number(a.step || 1);
      const zuW = (p) => Math.round((min + (p / 100) * (max - min)) / schritt) * schritt;
      return { pct: ((Number(st.state) - min) / (max - min)) * 100, text: (p) => `${zuW(p)} ${a.unit_of_measurement || ""}`.trim(),
        setzen: (h, p) => h.callService(d, "set_value", { entity_id: st.entity_id, value: zuW(p) }) };
    }
    return null;
  },

  schalten(h, st) {
    const d = domainVon(st.entity_id), id = st.entity_id;
    if (d === "lock") return h.callService("lock", st.state === "locked" ? "unlock" : "lock", { entity_id: id });
    if (d === "cover") return h.callService("cover", "toggle", { entity_id: id });
    if (d === "vacuum") return h.callService("vacuum", st.state === "cleaning" ? "return_to_base" : "start", { entity_id: id });
    if (d === "media_player") return h.callService("media_player", "media_play_pause", { entity_id: id });
    if (d === "scene" || d === "script") return h.callService(d, "turn_on", { entity_id: id });
    if (d === "button" || d === "input_button") return h.callService(d, "press", { entity_id: id });
    if (d === "climate") return h.callService("climate", st.state === "off" ? "turn_on" : "turn_off", { entity_id: id });
    if (d === "light" && st.state !== "on") return h.callService("light", "turn_on", { entity_id: id }); // HA merkt sich die letzte Helligkeit
    return h.callService("homeassistant", "toggle", { entity_id: id });
  },

  // Akzentfarbe des Symbols, wenn aktiv
  farbe(st) {
    if (!st) return "#8e8e93";
    const d = domainVon(st.entity_id), a = st.attributes;
    if (d === "light") {
      if (a.rgb_color && a.color_mode && !["color_temp", "brightness", "onoff"].includes(a.color_mode)) return `rgb(${a.rgb_color.join(",")})`;
      return "#ff9f0a";
    }
    if (d === "climate") return st.state === "cool" ? "#30b0c7" : "#ff6b3d";
    if (d === "cover") return "#0a84ff";
    if (d === "fan" || d === "humidifier") return "#30b0c7";
    if (d === "media_player" || d === "vacuum") return "#5e5ce6";
    if (d === "lock") return "#ff9f0a";
    if (d === "person" || d === "device_tracker") return "#0a84ff";
    if (d === "alarm_control_panel") return st.state === "disarmed" ? "#34c759" : "#ff3b30";
    const w = this.istWarnung(st);
    if (w) return FARBEN[w];
    return "#34c759";
  },

  // Kurzer Zustand für Kacheln
  zustand(h, st, reg) {
    if (!st) return "Nicht gefunden";
    if (!this.verfuegbar(st)) return st.state === "unknown" ? "Unbekannt" : "Nicht erreichbar";
    const d = domainVon(st.entity_id), a = st.attributes;
    if (d === "light" && reg && st.state === "on") return `${reg.pct} %`;
    if (d === "cover" && a.current_position != null) return reg ? reg.text(reg.pct) : zustandText(h, st);
    if (d === "climate") {
      const ist = (a.current_temperature != null ? ` · ${String(a.current_temperature).replace(".", ",")}°` : "") + (a.current_humidity != null ? ` · ${Math.round(a.current_humidity)} %` : "");
      if (st.state === "off") return `Aus${ist}`;
      const soll = a.temperature != null ? `${String(a.temperature).replace(".", ",")}°` : zustandText(h, st);
      const was = a.hvac_action === "heating" ? "Heizt " : a.hvac_action === "cooling" ? "Kühlt " : "";
      return was + soll + ist;
    }
    if (d === "fan" && st.state === "on" && a.percentage != null) return `${a.percentage} %`;
    if (d === "media_player" && a.media_title && st.state === "playing") return a.media_title;
    if (d === "scene" || d === "script" || d === "button" || d === "input_button") return "Antippen zum Starten";
    return zustandText(h, st);
  },
};
