import os
import time
import requests
import xml.etree.ElementTree as ET
from flask import Flask, jsonify, render_template, request
from bs4 import BeautifulSoup

app = Flask(__name__)

# Cache structure
FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"
cache = {
    "data": None,
    "last_updated": 0
}
CACHE_DURATION = 300 # 5 minutes

def parse_html_content(html_content):
    if not html_content:
        return []
    
    # Using html.parser
    soup = BeautifulSoup(html_content, 'html.parser')
    items = []
    
    h3_tags = soup.find_all('h3')
    if not h3_tags:
        # No h3 tags, treat the whole content as one update
        items.append({
            "type": "Update",
            "description": str(soup)
        })
        return items
        
    for h3 in h3_tags:
        tag_type = h3.get_text().strip()
        
        # Collect all siblings until the next h3
        desc_parts = []
        sibling = h3.next_sibling
        while sibling and sibling.name != 'h3':
            desc_parts.append(str(sibling))
            sibling = sibling.next_sibling
            
        items.append({
            "type": tag_type,
            "description": "".join(desc_parts).strip()
        })
        
    return items

def fetch_and_parse_feed():
    try:
        # Fetch xml feed
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(FEED_URL, headers=headers, timeout=15)
        response.raise_for_status()
        xml_data = response.content
        
        # Parse XML
        # Atom feed namespace
        ns = {'atom': 'http://www.w3.org/2005/Atom'}
        root = ET.fromstring(xml_data)
        
        feed_title_el = root.find('atom:title', ns)
        feed_title = feed_title_el.text if feed_title_el is not None else "BigQuery Release Notes"
        
        feed_updated_el = root.find('atom:updated', ns)
        feed_updated = feed_updated_el.text if feed_updated_el is not None else ""
        
        entries = []
        for entry_el in root.findall('atom:entry', ns):
            id_el = entry_el.find('atom:id', ns)
            title_el = entry_el.find('atom:title', ns)
            updated_el = entry_el.find('atom:updated', ns)
            content_el = entry_el.find('atom:content', ns)
            link_el = entry_el.find('atom:link', ns)
            
            entry_id = id_el.text if id_el is not None else ""
            title = title_el.text if title_el is not None else ""
            updated = updated_el.text if updated_el is not None else ""
            html_content = content_el.text if content_el is not None else ""
            link = link_el.attrib.get('href', '') if link_el is not None else ""
            
            # Parse individual items in the release note
            items = parse_html_content(html_content)
            
            entries.append({
                "id": entry_id,
                "title": title,
                "updated": updated,
                "link": link,
                "html_content": html_content,
                "items": items
            })
            
        return {
            "success": True,
            "title": feed_title,
            "updated": feed_updated,
            "entries": entries
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/releases')
def get_releases():
    force_refresh = request.args.get('refresh', 'false').lower() == 'true'
    now = time.time()
    
    if force_refresh or cache["data"] is None or (now - cache["last_updated"]) > CACHE_DURATION:
        result = fetch_and_parse_feed()
        if result.get("success"):
            cache["data"] = result
            cache["last_updated"] = now
        else:
            # If fetch fails but we have cached data, return cached data with warning
            if cache["data"] is not None:
                warning_data = dict(cache["data"])
                warning_data["warning"] = f"Failed to fetch fresh data: {result.get('error')}. Showing cached data."
                return jsonify(warning_data)
            return jsonify(result), 500
            
    return jsonify(cache["data"])

if __name__ == '__main__':
    app.run(debug=True, port=5000)
