"""Glas-Dashboard: Karten im Glas-Look plus zentrale Einstellungsseite."""

from __future__ import annotations

import json
import logging
from pathlib import Path

import voluptuous as vol

from homeassistant.components import frontend, panel_custom, websocket_api
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect, async_dispatcher_send
from homeassistant.helpers.storage import Store

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
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    store = Store(hass, SPEICHER_VERSION, SPEICHER_SCHLUESSEL)
    daten = await store.async_load() or {}
    hass.data[DOMAIN] = {"store": store, "daten": daten}

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
    connection.send_result(msg["id"], {"daten": z["daten"]})


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

    connection.subscriptions[msg["id"]] = async_dispatcher_connect(hass, SIGNAL_GEAENDERT, geaendert)
    connection.send_result(msg["id"])
