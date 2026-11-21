"""Glas-Dashboard: Karten im Glas-Look plus zentrale Einstellungsseite."""

from __future__ import annotations

import json
import logging
from datetime import timedelta
from pathlib import Path

import voluptuous as vol

from homeassistant.components import frontend, panel_custom, websocket_api
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect, async_dispatcher_send
from homeassistant.helpers.event import async_track_point_in_utc_time
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util
import homeassistant.helpers.config_validation as cv

from .const import (
    DOMAIN, MAX_GROESSE, PANEL_PFAD, SIGNAL_GEAENDERT, SPEICHER_SCHLUESSEL, SPEICHER_VERSION, URL_BASIS,
)

_LOGGER = logging.getLogger(__name__)
ORDNER = Path(__file__).parent / "frontend"


def _version() -> str:
    try:
        return json.loads((Path(__file__).parent / "manifest.json").read_text(encoding="utf-8"))["version"]
    except (OSError, ValueError, KeyError):
        return "0"


async def async_setup(hass: HomeAssistant, config) -> bool:
    websocket_api.async_register_command(hass, ws_lesen)
    websocket_api.async_register_command(hass, ws_speichern)
    websocket_api.async_register_command(hass, ws_abonnieren)
    websocket_api.async_register_command(hass, ws_timer_setzen)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    store = Store(hass, SPEICHER_VERSION, SPEICHER_SCHLUESSEL)
    daten = await store.async_load() or {}
    timer_store = Store(hass, SPEICHER_VERSION, f"{SPEICHER_SCHLUESSEL}_timer")
    hass.data[DOMAIN] = {"store": store, "daten": daten, "timer_store": timer_store, "timer": {}, "abbruch": {}}
    # Ausschalt-Timer nach einem Neustart wieder aufnehmen
    for eid, ende in ((await timer_store.async_load()) or {}).items():
        zeit = dt_util.parse_datetime(ende)
        if zeit:
            _timer_planen(hass, eid, zeit)

    version = await hass.async_add_executor_job(_version)
    if not hass.data.get(f"{DOMAIN}_pfad"):
        await hass.http.async_register_static_paths([StaticPathConfig(URL_BASIS, str(ORDNER), False)])
        hass.data[f"{DOMAIN}_pfad"] = True
    url = f"{URL_BASIS}/glas-dashboard.js?v={version}"
    hass.data[f"{DOMAIN}_url"] = url
    # Karten auf jeder Seite laden: keine Ressource und kein Thema von Hand nötig
    frontend.add_extra_js_url(hass, url)
    await panel_custom.async_register_panel(
        hass,
        webcomponent_name="glas-einstellungen",
        frontend_url_path=PANEL_PFAD,
        sidebar_title="Glas",
        sidebar_icon="mdi:view-dashboard-variant-outline",
        module_url=url,
        require_admin=False,
        config={},
    )
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    for ab in (hass.data.get(DOMAIN) or {}).get("abbruch", {}).values():
        ab()
    frontend.async_remove_panel(hass, PANEL_PFAD)
    url = hass.data.pop(f"{DOMAIN}_url", None)
    if url:
        frontend.remove_extra_js_url(hass, url)
    hass.data.pop(DOMAIN, None)
    return True


def _zustand(hass: HomeAssistant) -> dict | None:
    return hass.data.get(DOMAIN)


@websocket_api.websocket_command({vol.Required("type"): "glas_dashboard/lesen"})
@callback
def ws_lesen(hass: HomeAssistant, connection, msg) -> None:
    z = _zustand(hass)
    if z is None:
        connection.send_error(msg["id"], "nicht_eingerichtet", "Glas-Dashboard ist nicht eingerichtet")
        return
    connection.send_result(msg["id"], {"daten": z["daten"], "timer": z["timer"]})


@websocket_api.websocket_command({vol.Required("type"): "glas_dashboard/speichern", vol.Required("daten"): dict})
@websocket_api.async_response
async def ws_speichern(hass: HomeAssistant, connection, msg) -> None:
    z = _zustand(hass)
    if z is None:
        connection.send_error(msg["id"], "nicht_eingerichtet", "Glas-Dashboard ist nicht eingerichtet")
        return
    daten = msg["daten"]
    if len(json.dumps(daten)) > MAX_GROESSE:
        connection.send_error(msg["id"], "zu_gross", "Einstellungen sind zu groß")
        return
    z["daten"] = daten
    await z["store"].async_save(daten)
    async_dispatcher_send(hass, SIGNAL_GEAENDERT, daten)
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command({vol.Required("type"): "glas_dashboard/abonnieren"})
@callback
def ws_abonnieren(hass: HomeAssistant, connection, msg) -> None:
    @callback
    def geaendert(daten) -> None:
        connection.send_message(websocket_api.event_message(msg["id"], {"daten": daten}))

    @callback
    def timer_geaendert(timer) -> None:
        connection.send_message(websocket_api.event_message(msg["id"], {"timer": timer}))

    ab1 = async_dispatcher_connect(hass, SIGNAL_GEAENDERT, geaendert)
    ab2 = async_dispatcher_connect(hass, f"{SIGNAL_GEAENDERT}_timer", timer_geaendert)

    @callback
    def abmelden() -> None:
        ab1()
        ab2()

    connection.subscriptions[msg["id"]] = abmelden
    connection.send_result(msg["id"])


# ---------------------------------------------------------------------------
# Ausschalt-Timer: „Ausschalten in 30 min“ für Lampen, Steckdosen, Heizungen …
# ---------------------------------------------------------------------------
@callback
def _timer_melden(hass: HomeAssistant) -> None:
    z = hass.data[DOMAIN]
    z["timer_store"].async_delay_save(lambda: dict(z["timer"]), 1)
    async_dispatcher_send(hass, f"{SIGNAL_GEAENDERT}_timer", dict(z["timer"]))


@callback
def _timer_planen(hass: HomeAssistant, entity_id: str, ende) -> None:
    z = hass.data[DOMAIN]
    if (alt := z["abbruch"].pop(entity_id, None)) is not None:
        alt()
    if ende <= dt_util.utcnow():
        ende = dt_util.utcnow()

    async def ablaufen(_now) -> None:
        z["abbruch"].pop(entity_id, None)
        z["timer"].pop(entity_id, None)
        _timer_melden(hass)
        domain = entity_id.split(".")[0]
        try:
            if domain == "climate":
                await hass.services.async_call("climate", "set_hvac_mode", {"entity_id": entity_id, "hvac_mode": "off"}, blocking=False)
            else:
                await hass.services.async_call("homeassistant", "turn_off", {"entity_id": entity_id}, blocking=False)
        except Exception:  # noqa: BLE001 – Gerät weg oder kann nicht aus: nur protokollieren
            _LOGGER.warning("Timer: %s ließ sich nicht ausschalten", entity_id)

    z["timer"][entity_id] = ende.isoformat()
    z["abbruch"][entity_id] = async_track_point_in_utc_time(hass, ablaufen, ende)


@websocket_api.websocket_command({
    vol.Required("type"): "glas_dashboard/timer",
    vol.Required("entity_id"): cv.entity_id,
    vol.Required("minuten"): vol.All(vol.Coerce(float), vol.Range(min=0, max=24 * 60)),
})
@callback
def ws_timer_setzen(hass: HomeAssistant, connection, msg) -> None:
    """minuten = 0 hebt den Timer auf."""
    z = _zustand(hass)
    if z is None:
        connection.send_error(msg["id"], "nicht_eingerichtet", "Glas-Dashboard ist nicht eingerichtet")
        return
    eid = msg["entity_id"]
    if msg["minuten"] <= 0:
        if (ab := z["abbruch"].pop(eid, None)) is not None:
            ab()
        z["timer"].pop(eid, None)
    else:
        _timer_planen(hass, eid, dt_util.utcnow() + timedelta(minutes=msg["minuten"]))
    _timer_melden(hass)
    connection.send_result(msg["id"], {"timer": z["timer"]})
