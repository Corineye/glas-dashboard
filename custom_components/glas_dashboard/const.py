"""Konstanten für Glas-Dashboard."""

DOMAIN = "glas_dashboard"
SPEICHER_SCHLUESSEL = "glas_dashboard.einstellungen"
SPEICHER_VERSION = 1
URL_BASIS = "/glas_dashboard_dateien"
PANEL_PFAD = "glas-einstellungen"
SIGNAL_GEAENDERT = "glas_dashboard_geaendert"
MAX_GROESSE = 512 * 1024  # Einstellungen sind klein; schützt vor versehentlich riesigen Daten
