# Πρωτοσέλιδα RSS

Daily RSS feed generator for Greek newspaper front pages.

## What it does

Fetches daily front page images from protoselidaefimeridon.gr for 16 Greek newspapers, checks availability via HTTPS HEAD requests, and generates an RSS XML feed with embedded images.

## Newspapers

Καθημερινή, ΤΑ ΝΕΑ, Δημοκρατία, Εφημερίδα των Συντακτών, Αυγή, Ελεύθερος Τύπος, Ελεύθερη Ώρα, Εστία, Κόντρα, Μακελειό, Ναυτεμπορική, Πρώτο Θέμα, Ριζοσπάστης, Τα Παραπολιτικά, Real News, To Βήμα

## Structure

```
generate.js             - Core script (fetch, validate, generate RSS)
rss.xml                 - Generated output (committed to repo)
.github/workflows/      - GitHub Actions daily automation
```

## How it works

1. GitHub Actions triggers daily
2. `generate.js` runs: checks each newspaper image URL for the current date
3. Available front pages are included in `rss.xml`
4. Output is committed back to the repo

## Usage

```bash
node generate.js
```

Subscribe to the `rss.xml` file URL in any RSS reader (e.g., News Explorer, Feedly).
