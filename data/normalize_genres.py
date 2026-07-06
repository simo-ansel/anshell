import json
import sys
from pathlib import Path

# =====================================================================================
# MAPPING SINONIMI / VARIANTI → GENERE CANONICO (ITALIANO)
# =====================================================================================

GENRE_MAP = {
    # Varianti italiane
    "Drammatico": "Dramma",
    "Drammatici": "Dramma",
    "Fantascientifico": "Fantascienza",
    "Psicologico": "Psicologico",

    # Varianti inglesi → italiano
    "Mystery": "Mistero",
    "Science Fiction": "Fantascienza",
    "Sci-Fi": "Fantascienza",
    "Post Apocalyptic": "Post-apocalittico",
    "Postapocalittico": "Post-apocalittico",
    "Strategy": "Strategia",
    "Simulation": "Simulazione",
    "Racing": "Corse",
    "Rhythm": "Ritmico",
    "Fighting": "Picchiaduro",
    "Card Game": "Gioco di Carte",
    "Board Game": "Gioco da Tavolo",

    # Varianti tipografiche
    "Hack & Slash": "Hack and Slash",
    "Beat em up": "Beat 'em up"
}

SCHEMA_PATH = Path("genres.schema.json")

# =====================================================================================
# LOAD SCHEMA
# =====================================================================================

def load_schema():
    if not SCHEMA_PATH.exists():
        raise FileNotFoundError(f"Schema non trovato: {SCHEMA_PATH}")
    with open(SCHEMA_PATH, encoding="utf-8") as f:
        return json.load(f)

def collect_allowed_genres(schema, media_type):
    if media_type not in schema:
        raise ValueError(f"Tipo media non valido: {media_type}")

    allowed = set()
    for group in schema[media_type].values():
        allowed.update(group)
    return allowed

# =====================================================================================
# NORMALIZZAZIONE
# =====================================================================================

def normalize_opera(opera, allowed_genres):
    normalized = []
    invalid = []

    for g in opera.get("genere", []):
        g_norm = GENRE_MAP.get(g, g)

        if g_norm in allowed_genres:
            normalized.append(g_norm)
        else:
            invalid.append(g_norm)

    opera["genere"] = normalized
    return invalid

def normalize_file(json_path, media_type):
    schema = load_schema()
    allowed_genres = collect_allowed_genres(schema, media_type)

    with open(json_path, encoding="utf-8") as f:
        data = json.load(f)

    errors = []

    for opera in data:
        invalid = normalize_opera(opera, allowed_genres)
        if invalid:
            errors.append({
                "titolo": opera.get("titolo", "<senza titolo>"),
                "generi_invalidi": invalid
            })

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    return errors

# =====================================================================================
# CLI
# =====================================================================================

def main():
    if len(sys.argv) != 3:
        print("Uso:")
        print("  python normalize_genres.py <file.json> <tipo>")
        print()
        print("Esempi:")
        print("  python normalize_genres.py manga.json manga")
        print("  python normalize_genres.py anime.json anime")
        print("  python normalize_genres.py serieTV.json serieTV")
        print("  python normalize_genres.py videogiochi.json videogiochi")
        print("  python normalize_genres.py libri.json libri")
        sys.exit(1)

    json_file = Path(sys.argv[1])
    media_type = sys.argv[2]

    if not json_file.exists():
        print(f"[ERRORE] File non trovato: {json_file}")
        sys.exit(1)

    errors = normalize_file(json_file, media_type)

    if errors:
        print("\n⚠️ GENERI NON CANONICI TROVATI:")
        for e in errors:
            print(f"- {e['titolo']}: {e['generi_invalidi']}")
        print("\n👉 Correggi lo schema o i dati.")
    else:
        print("✅ Tutti i generi sono canonici e normalizzati.")

# =====================================================================================

if __name__ == "__main__":
    main()
