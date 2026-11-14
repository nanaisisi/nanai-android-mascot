"""
scripts/compliance/config.py

Constants and configuration definitions for spec compliance verification.
"""

GENERIC_KEYWORDS = {
    "number", "bytes", "format", "add", "convert", "sign", "encrypt", "decrypt",
    "digest", "compare", "protect", "loop", "path", "playing", "position", "pause",
    "name", "duration", "error", "preload", "version", "meta.", "type", "id", "file",
    "title", "text", "value", "width", "height", "x", "y", "status", "index", "key",
    "data", "mode", "scope", "time", "open", "close", "save", "load", "clear", "reset",
    "set", "get", "item", "list", "count", "string", "bool", "boolean", "int", "integer",
    "float", "array", "map", "object", "null", "none", "true", "false", "default", "initial",
    "final", "temp", "line", "row", "col", "column", "size", "len", "length"
}

LAYER_ORDER = ("core", "backend", "ui_logic", "ui_view", "tests", "other")
KNOWN_LAYERS = ("core", "backend", "ui_logic", "ui_view", "tests")
MAX_MATCHES_PER_LAYER = 5
MAX_IMPL_LOCATIONS = 6
