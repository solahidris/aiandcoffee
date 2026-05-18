#!/usr/bin/env python3
"""
Scrapes petakopi.my for coffee shops in Kuala Lumpur and Selangor.
Uses the Inertia.js XHR protocol to get paginated JSON data.
Run from repo root: python3 scripts/scrape-petakopi.py
"""

import urllib.request
import urllib.error
import json
import time
import sys
import os

INERTIA_VERSION = "a49ad7feab775aa775960b9b00b8be64ecb220b9"
STATES = ["Kuala Lumpur", "Selangor"]
OUTPUT = "data/coffee-shops.json"
DELAY = 0.3  # seconds between requests

DAY_SHORT = {
    "Sunday": "Sun", "Monday": "Mon", "Tuesday": "Tue",
    "Wednesday": "Wed", "Thursday": "Thu", "Friday": "Fri", "Saturday": "Sat"
}
ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def fetch_page(state, page):
    url = f"https://petakopi.my/?state={state.replace(' ', '+')}&page={page}"
    req = urllib.request.Request(url)
    req.add_header("X-Inertia", "true")
    req.add_header("X-Inertia-Version", INERTIA_VERSION)
    req.add_header("Accept", "application/json")
    req.add_header("User-Agent", "Mozilla/5.0 (compatible; aiandcoffee-scraper)")
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read().decode())


def fmt_time(t):
    if t == "00:00":
        return "12am"
    h, m = map(int, t.split(":"))
    suffix = "am" if h < 12 else "pm"
    h = h % 12 or 12
    return f"{h}:{m:02d}{suffix}" if m else f"{h}{suffix}"


def format_hours(periods):
    if not periods:
        return None

    # Group consecutive days with the same open/close times
    groups = []
    for p in periods:
        key = (p["open"]["time"], p["close"]["time"])
        if groups and groups[-1]["key"] == key and groups[-1]["days"][-1] == p["open"]["day"]:
            # extend current group only if consecutive
            last_idx = ALL_DAYS.index(groups[-1]["days"][-1])
            curr_idx = ALL_DAYS.index(p["open"]["day"])
            if curr_idx == (last_idx + 1) % 7:
                groups[-1]["days"].append(p["open"]["day"])
                continue
        groups.append({"key": key, "days": [p["open"]["day"]]})

    parts = []
    for g in groups:
        open_t, close_t = g["key"]
        days = g["days"]
        if len(days) == 7:
            day_str = "Daily"
        elif len(days) == 1:
            day_str = DAY_SHORT[days[0]]
        else:
            day_str = f"{DAY_SHORT[days[0]]}–{DAY_SHORT[days[-1]]}"
        parts.append(f"{day_str} {fmt_time(open_t)}–{fmt_time(close_t)}")

    return ", ".join(parts)


def derive_vibe(tags):
    slugs = {t["slug"] for t in tags}
    if "work-friendly" in slugs:
        return "study-friendly"
    if "night-owl" in slugs:
        return "late-night"
    if "pour-over" in slugs or "bean-options" in slugs:
        return "specialty"
    if "outdoor-seating" in slugs:
        return "outdoor"
    if "instagrammable" in slugs:
        return "instagrammable"
    if "cosy" in slugs or "cozy" in slugs:
        return "cozy"
    return None


def map_shop(shop):
    links = shop.get("links", [])
    google_link = next((l["url"] for l in links if l["name"] == "Google"), None)
    lat = shop.get("lat")
    lng = shop.get("lng")
    waze_link = f"https://waze.com/ul?ll={lat},{lng}&navigate=yes" if lat and lng else None

    district = shop.get("district") or ""
    state = shop.get("state") or ""
    area = f"{district}, {state}" if district else state

    hours_data = shop.get("business_hours") or shop.get("opening_hours") or {}
    hours = format_hours(hours_data.get("periods", []))

    tags = shop.get("tags", [])

    return {
        "id": shop["slug"],
        "name": shop["name"],
        "area": area,
        "petakopi_url": f"https://petakopi.my/{shop['slug']}",
        "google_maps": google_link,
        "waze": waze_link,
        "machine": None,
        "grinder": None,
        "capacity_pax": None,
        "size_sqft": None,
        "hours": hours,
        "food": None,
        "toilet": None,
        "surau": None,
        "wifi": None,
        "vibe": derive_vibe(tags),
        "petakopi_tags": [t["slug"] for t in tags],
        "rating": shop.get("rating"),
    }


def main():
    all_shops = []
    seen = set()

    for state in STATES:
        print(f"\nFetching {state}...")
        try:
            page1 = fetch_page(state, 1)
        except Exception as e:
            print(f"  ERROR on page 1: {e}")
            sys.exit(1)

        pagination = page1["props"]["pagination"]
        total_pages = pagination["total_pages"]
        total_count = pagination["total_count"]
        print(f"  {total_count} shops across {total_pages} pages")

        pages = [page1]
        for page in range(2, total_pages + 1):
            time.sleep(DELAY)
            try:
                pages.append(fetch_page(state, page))
                print(f"  page {page}/{total_pages}   ", end="\r", flush=True)
            except Exception as e:
                print(f"\n  ERROR on page {page}: {e} — skipping")

        print(f"  done ({total_pages} pages fetched)     ")

        for page_data in pages:
            for shop in page_data["props"]["coffee_shops"]:
                if shop["slug"] not in seen:
                    seen.add(shop["slug"])
                    all_shops.append(map_shop(shop))

    # Sort by state then name
    all_shops.sort(key=lambda s: (s["area"].split(", ")[-1], s["name"].lower()))

    os.makedirs("data", exist_ok=True)
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(all_shops, f, indent=2, ensure_ascii=False)

    print(f"\nSaved {len(all_shops)} shops to {OUTPUT}")

    # Quick stats
    vibes = {}
    for s in all_shops:
        v = s["vibe"] or "—"
        vibes[v] = vibes.get(v, 0) + 1
    print("\nVibe breakdown:")
    for v, count in sorted(vibes.items(), key=lambda x: -x[1]):
        print(f"  {v}: {count}")


if __name__ == "__main__":
    main()
