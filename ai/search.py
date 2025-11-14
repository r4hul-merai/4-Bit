# # search.py

# import requests
# from bs4 import BeautifulSoup
# from urllib.parse import quote_plus
# import time
# import json
# from datetime import datetime

# # ---------- CONFIG ----------
# # If you have merchant/API credentials for Tata 1mg, use them here
# ONE_MG_SEARCH_BASE = "https://onedoc.1mg.com/public_docs/docs/merchant/1.0.0/search-ap-is/"  # doc page (see docs)
# # Fallback search urls
# PHARMEASY_SEARCH = "https://pharmeasy.in/search/all?name={q}"
# ONE_MG_WEB_SEARCH = "https://www.1mg.com/search/all?name={q}"
# NETMEDS_SEARCH = "https://www.netmeds.com/catalogsearch/result?q={q}"
# HEADERS = {"User-Agent": "Medic-OCR-Bot/1.0 (+contact@example.com)"}

# # ---------- HELPERS ----------
# def timestamp():
#     return datetime.now().astimezone().isoformat()

# def search_1mg_api(salt_or_name):
#     """
#     Placeholder: if you have real merchant API credentials, call the search API.
#     Docs: Tata 1mg merchant docs provide Search APIs for product listing & search.
#     (If you don't have access, return None to fall back to scraping.)
#     """
#     # In practice you would call an authenticated endpoint like:
#     # GET https://api.1mg.com/search?q=...
#     return None  # no credentials by default

# def scrape_pharmeasy(q):
#     url = PHARMEASY_SEARCH.format(q=quote_plus(q))
#     r = requests.get(url, headers=HEADERS, timeout=10)
#     r.raise_for_status()
#     soup = BeautifulSoup(r.text, "html.parser")
#     results = []
#     # PharmEasy shows "generic alternates" and product cards — parse conservatively
#     for card in soup.select(".Card, .product-card, .search-result"):  # site CSS varies
#         title = card.select_one("h2, .product-title, .Card__title")
#         if not title: continue
#         name = title.get_text(strip=True)
#         link = card.select_one("a")
#         href = (link["href"] if link else "")
#         # attempt to extract strength/brand heuristically
#         meta = card.get_text(" ", strip=True)
#         results.append({"name": name, "brand": "", "strength": "", "url": href, "meta": meta})
#         if len(results) >= 8:
#             break
#     return results

# def scrape_1mg_web(q):
#     url = ONE_MG_WEB_SEARCH.format(q=quote_plus(q))
#     r = requests.get(url, headers=HEADERS, timeout=10)
#     r.raise_for_status()
#     soup = BeautifulSoup(r.text, "html.parser")
#     results = []
#     for card in soup.select(".style__product, .ProductCard, .search__card"):
#         name_tag = card.select_one("h2, .DrugName, .card__title")
#         if not name_tag: continue
#         name = name_tag.get_text(strip=True)
#         href = card.select_one("a")["href"] if card.select_one("a") else ""
#         results.append({"name": name, "brand": "", "strength": "", "url": href})
#         if len(results) >= 8:
#             break
#     return results

# # ---------- MAIN FUNCTION ----------
# def find_substitutes(extracted_salt, extracted_medicine=None, limit=5):
#     """
#     Returns a structured list of substitutes for India.
#     """
#     query = extracted_salt or extracted_medicine
#     if not query:
#         return {"error": "no input"}

#     # 1) Try 1mg API (recommended, if you have credentials)
#     api_resp = search_1mg_api(query)
#     substitutes = []
#     if api_resp:
#         # parse API response -> standardized substitutes
#         for item in api_resp.get("products", [])[:limit]:
#             substitutes.append({
#                 "name": item.get("title"),
#                 "salt": extracted_salt,
#                 "strength": item.get("pack_size") or "",
#                 "brand": item.get("manufacturer") or "",
#                 "source": "1mg_api",
#                 "url": item.get("url", "")
#             })

#     # 2) Fallback: scrape 1mg website
#     if not substitutes:
#         try:
#             web_results = scrape_1mg_web(query)
#             for r in web_results[:limit]:
#                 substitutes.append({
#                     "name": r["name"],
#                     "salt": extracted_salt,
#                     "strength": r.get("strength",""),
#                     "brand": r.get("brand",""),
#                     "source": "1mg_web",
#                     "url": r.get("url","")
#                 })
#         except Exception as e:
#             # continue to next fallback
#             pass

#     # 3) Fallback: PharmEasy for generic alternates
#     if not substitutes:
#         try:
#             web_results = scrape_pharmeasy(query)
#             for r in web_results[:limit]:
#                 substitutes.append({
#                     "name": r["name"],
#                     "salt": extracted_salt,
#                     "strength": r.get("strength",""),
#                     "brand": r.get("brand",""),
#                     "source": "pharmeasy",
#                     "url": r.get("url","")
#                 })
#         except Exception as e:
#             pass

#     # Output JSON
#     output = {
#         "Medicine_name": extracted_medicine or "",
#         "Salt": extracted_salt or "",
#         "Strength": "",
#         "Substitutes": substitutes,
#         "timestamp": timestamp(),
#         "disclaimer": "Cross-check with certified pharmacist/physician before substitution; regulatory lists (CDSCO/NLEM) should be consulted for controlled drugs."
#     }
#     return output

# # ---------- USAGE ----------
# if __name__ == "__main__":
#     # Example: after OCR
#     salt = "paracetamol"
#     med = "Crocin Advance"
#     res = find_substitutes(salt, med)
#     print(json.dumps(res, indent=2, ensure_ascii=False))


#!/usr/bin/env python3
"""
medicine_substitutes_search.py

Improved script to search substitutes for a medicine or salt from 1mg / PharmEasy.
Outputs structured JSON that includes: Uses, Side Effect, Dosages, Working, url, source, brand, strength.

Notes:
- The script uses best-effort HTML parsing of public pages. Websites change frequently; adjust selectors if parsing breaks.
- Be polite: this script sets a User-Agent header and a short delay when fetching detail pages.

Usage: run as a script or import find_substitutes() in other code.
"""

import requests
from bs4 import BeautifulSoup
from urllib.parse import quote_plus, urljoin
import json
from datetime import datetime
import time
import re

# --- Constants & headers ---
HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}
REQUEST_TIMEOUT = 10
DETAIL_FETCH_DELAY = 0.6


def timestamp():
    return datetime.now().astimezone().isoformat()


# ---------- Helper fetch/parsing utilities ----------

def fetch_soup(url):
    """Fetch URL and return BeautifulSoup object or None on failure."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        return BeautifulSoup(resp.text, "html.parser")
    except Exception:
        return None


def extract_text_after_heading(soup, heading_regex_list):
    """Search soup for elements whose text matches any regex in heading_regex_list,
    and return the next block of text (joined)."""
    if not soup:
        return ""
    # search by headings (h2,h3,h4,strong,b) or text nodes
    patterns = [re.compile(r, re.I) for r in heading_regex_list]

    # look for headings first
    for tag in soup.find_all(['h1', 'h2', 'h3', 'h4', 'strong', 'b', 'p', 'div']):
        text = tag.get_text(separator=' ', strip=True)
        if not text:
            continue
        for pat in patterns:
            if pat.search(text):
                # try to gather following sibling contents
                collected = []
                # check following siblings
                sib = tag.find_next_sibling()
                depth = 0
                while sib and depth < 10:
                    txt = sib.get_text(separator=' ', strip=True)
                    if txt:
                        collected.append(txt)
                    sib = sib.find_next_sibling()
                    depth += 1
                # if nothing found in siblings, try parent next elements
                if not collected:
                    parent = tag.parent
                    if parent:
                        for el in parent.find_all(['p', 'li', 'div']):
                            t = el.get_text(separator=' ', strip=True)
                            if t and t != text:
                                collected.append(t)
                result = ' '.join(collected).strip()
                # truncate if extremely long
                return result[:5000]

    # fallback: search for paragraphs containing key words directly
    for p in soup.find_all('p'):
        ptext = p.get_text(separator=' ', strip=True)
        for pat in patterns:
            if pat.search(ptext):
                return ptext

    return ""


# ---------- Site-specific scrapers (best-effort) ----------

def search_1mg_api(query):
    """Best-effort attempt to call a JSON endpoint used by 1mg (may fail if endpoint changes).
    Returns dict or None.
    """
    try:
        q = quote_plus(query)
        # 1mg often uses an internal search endpoint; try a commonly observed pattern
        api_url = f"https://www.1mg.com/search/all?name={q}"
        soup = fetch_soup(api_url)
        if not soup:
            return None
        # fallback: parse the HTML search results like scrape_1mg_web
        results = scrape_1mg_web(query)
        return {"products": results}
    except Exception:
        return None


def scrape_1mg_web(query, limit=8):
    """Scrape 1mg search results for query and return product list of dicts.
    This is a heuristic parser – update selectors if site changes.
    """
    base = "https://www.1mg.com"
    q = quote_plus(query)
    search_url = f"{base}/search/all?name={q}"
    soup = fetch_soup(search_url)
    results = []
    if not soup:
        return results

    # common card container
    cards = soup.select(".style__card , .style_card, .product__item, .lrp-card, .drug-card, .srp-card")
    if not cards:
        # try generic product anchors
        anchors = soup.select("a[href*='/drug/'], a[href*='/product/'], a[href*='/medicine/']")
        seen = set()
        for a in anchors:
            href = a.get('href')
            name = a.get_text(strip=True)
            if not href or not name:
                continue
            url = urljoin(base, href)
            if url in seen:
                continue
            seen.add(url)
            results.append({"name": name, "url": url, "brand": "", "strength": ""})
            if len(results) >= limit:
                break
        return results

    for card in cards[:limit*2]:
        try:
            a = card.find('a', href=True)
            if not a:
                continue
            href = a['href']
            url = urljoin(base, href)
            name = a.get_text(separator=' ', strip=True)
            # brand/strength attempts
            brand = ""
            strength = ""
            # try to find small / span text inside card
            small = card.get_text(separator='|', strip=True)
            # heuristic: last token may be strength
            parts = [p.strip() for p in small.split('|') if p.strip()]
            if parts:
                # try regex for strength like '500 mg'
                for p in parts:
                    if re.search(r"\d+\s*mg|\d+\s*mcg|\d+\s*g", p, re.I):
                        strength = p
                        break
                # brand guess
                if len(parts) >= 2:
                    brand = parts[-1]

            results.append({"name": name, "url": url, "brand": brand, "strength": strength})
            if len(results) >= limit:
                break
        except Exception:
            continue

    # enrich with details (uses / side effects / dosage / working)
    enriched = []
    for r in results[:limit]:
        time.sleep(DETAIL_FETCH_DELAY)
        detail = fetch_soup(r['url'])
        uses = extract_text_after_heading(detail, [r"Uses?", r"Indication", r"What is it used for"]) or ""
        side = extract_text_after_heading(detail, [r"Side effects?", r"Side Effects", r"Adverse"]) or ""
        dosage = extract_text_after_heading(detail, [r"Dosage", r"How to take", r"Direction for use"]) or ""
        working = extract_text_after_heading(detail, [r"How it works", r"Working", r"Mechanism", r"Mechanism of action"]) or ""
        enriched.append({
            "name": r.get('name', ''),
            "salt": "",
            "strength": r.get('strength', ''),
            "brand": r.get('brand', ''),
            "source": "1mg_web",
            "Uses": uses,
            "Side Effect": side,
            "Dosages": dosage,
            "Working": working,
            "url": r.get('url', '')
        })
    return enriched


def scrape_pharmeasy(query, limit=8):
    """Scrape PharmEasy search results for query and return product list of dicts.
    """
    base = "https://pharmeasy.in"
    q = quote_plus(query)
    search_url = f"{base}/search/all?name={q}"
    soup = fetch_soup(search_url)
    results = []
    if not soup:
        # fallback simple search path
        search_url = f"{base}/search?search={q}"
        soup = fetch_soup(search_url)
        if not soup:
            return results

    # look for product tiles
    cards = soup.select("a[href*='/online-medicine-order'], .ProductCard__root, .product-list-item, .c-card")
    seen = set()
    for a in cards:
        try:
            href = a.get('href')
            if not href:
                continue
            url = urljoin(base, href)
            if url in seen:
                continue
            seen.add(url)
            name = a.get_text(separator=' ', strip=True)
            # attempt to extract brand / strength
            brand = ""
            strength = ""
            # within card, small spans may exist
            txt = a.get_text(separator='|', strip=True)
            parts = [p.strip() for p in txt.split('|') if p.strip()]
            for p in parts:
                if re.search(r"\d+\s*mg|\d+\s*mcg|\d+\s*g", p, re.I):
                    strength = p
                    break
            results.append({"name": name, "url": url, "brand": brand, "strength": strength})
            if len(results) >= limit:
                break
        except Exception:
            continue

    # enrich each product by visiting its product page
    enriched = []
    for r in results[:limit]:
        time.sleep(DETAIL_FETCH_DELAY)
        detail = fetch_soup(r['url'])
        uses = extract_text_after_heading(detail, [r"Uses?", r"Indication", r"Indicated for"]) or ""
        side = extract_text_after_heading(detail, [r"Side effects?", r"Side Effects", r"Adverse"]) or ""
        dosage = extract_text_after_heading(detail, [r"Dosage", r"How to take", r"Directions for use"]) or ""
        working = extract_text_after_heading(detail, [r"How it works", r"Mechanism", r"Mechanism of action"]) or ""
        enriched.append({
            "name": r.get('name', ''),
            "salt": "",
            "strength": r.get('strength', ''),
            "brand": r.get('brand', ''),
            "source": "pharmeasy",
            "Uses": uses,
            "Side Effect": side,
            "Dosages": dosage,
            "Working": working,
            "url": r.get('url', '')
        })
    return enriched


# ---------- Public search functions ----------

def search_medicine(name, limit=5):
    """
    Search substitutes by medicine name.
    Falls back through 1mg (attempt) then 1mg web scraping, then PharmEasy scraping.
    Returns list of substitute dicts with the extra fields.
    """
    substitutes = []
    query = name.strip() if name else ""
    if not query:
        return substitutes

    # 1) Try 1mg API (best-effort)
    api_resp = search_1mg_api(query)
    if api_resp and api_resp.get('products'):
        for item in api_resp.get('products', [])[:limit]:
            substitutes.append({
                "name": item.get("name") or item.get("title") or "",
                "salt": "",
                "strength": item.get("strength") or "",
                "brand": item.get("brand") or item.get("manufacturer") or "",
                "source": "1mg_api",
                "Uses": item.get('Uses', ""),
                "Side Effect": item.get('Side Effect', ""),
                "Dosages": item.get('Dosages', ""),
                "Working": item.get('Working', ""),
                "url": item.get("url", "")
            })

    # 2) Fallback: scrape 1mg website
    if not substitutes:
        try:
            web_results = scrape_1mg_web(query, limit=limit)
            for r in web_results[:limit]:
                substitutes.append(r)
        except Exception:
            pass

    # 3) Fallback: PharmEasy
    if not substitutes:
        try:
            web_results = scrape_pharmeasy(query, limit=limit)
            for r in web_results[:limit]:
                substitutes.append(r)
        except Exception:
            pass

    return substitutes


def search_salt(salt_name, limit=5):
    """
    Search substitutes by salt name (tries same fallbacks).
    """
    substitutes = []
    query = salt_name.strip() if salt_name else ""
    if not query:
        return substitutes

    # 1) Try 1mg API
    api_resp = search_1mg_api(query)
    if api_resp and api_resp.get('products'):
        for item in api_resp.get('products', [])[:limit]:
            substitutes.append({
                "name": item.get("name") or item.get("title") or "",
                "salt": salt_name,
                "strength": item.get("strength") or "",
                "brand": item.get("brand") or item.get("manufacturer") or "",
                "source": "1mg_api",
                "Uses": item.get('Uses', ""),
                "Side Effect": item.get('Side Effect', ""),
                "Dosages": item.get('Dosages', ""),
                "Working": item.get('Working', ""),
                "url": item.get("url", "")
            })

    # 2) Fallback: scrape 1mg website
    if not substitutes:
        try:
            web_results = scrape_1mg_web(query, limit=limit)
            for r in web_results[:limit]:
                r['salt'] = salt_name
                substitutes.append(r)
        except Exception:
            pass

    # 3) Fallback: PharmEasy
    if not substitutes:
        try:
            web_results = scrape_pharmeasy(query, limit=limit)
            for r in web_results[:limit]:
                r['salt'] = salt_name
                substitutes.append(r)
        except Exception:
            pass

    return substitutes


def find_substitutes(extracted_salt, extracted_medicine=None, limit=5):
    """
    Uses search_salt or search_medicine accordingly, returns structured JSON output.
    """
    substitutes = []
    if extracted_salt:
        substitutes = search_salt(extracted_salt, limit)
    elif extracted_medicine:
        substitutes = search_medicine(extracted_medicine, limit)

    return substitutes


# ---------- Example usage ----------
# if __name__ == "__main__":
#     # salt = "paracetamol"
#     med = "Crocin Advance"
#     res = find_substitutes(med, limit=5)
#     print(json.dumps(res, indent=2, ensure_ascii=False))
