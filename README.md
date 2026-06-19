# BigQuery Release Notes Explorer

A beautiful, premium web application built using Python Flask, vanilla HTML, JavaScript, and CSS that fetches the BigQuery Release Notes XML feed, parses it dynamically, and presents them in an interactive timeline interface.

## Features
- **Live Feed Parsing**: Fetches directly from the official Google Cloud BigQuery Release Notes feed (`https://docs.cloud.google.com/feeds/bigquery-release-notes.xml`).
- **Dynamic Timeline View**: Grouped by date, listing specific release items sequentially.
- **Categorization**: Automatically splits multi-item updates and parses categories like `Feature`, `Fix`, `Changed`, `Deprecated`, and `Announcement`.
- **Search & Highlighting**: Instantly search release note contents. Matching keywords are highlighted dynamically without breaking HTML structure.
- **Filtering**: Filter releases by type (e.g. show only features, only fixes).
- **Interactive Stats**: Real-time stats dashboard displays counts and breakdown charts of the update types.
- **Share to X / Twitter**: Select any specific release note update and tweet about it using an in-app premium Tweet composer. The composer features:
  - Automatic formatting with metadata and hashtags.
  - Automatic safe truncation within 280 characters.
  - An interactive SVG character progress circle showing remaining characters.
  - A real X/Twitter post live preview card.
- **Refresh with Spinner**: Simple one-click manual refresh button that re-fetches and bypasses server caching.
- **Responsive Premium UI**: Custom typography (Inter & Outfit fonts) and custom scrollbars, tailored dark-blue cloud theme, cards with scale & hover border glow animations.

## Directory Structure
- [app.py](file:///G:/DESARROLLO2026/cursoKagle/agy-cli-projects/bq-releases-notes/app.py): The Python Flask application server. Handles XML fetching, parsing, and caching.
- [templates/index.html](file:///G:/DESARROLLO2026/cursoKagle/agy-cli-projects/bq-releases-notes/templates/index.html): The main web page UI.
- [static/css/styles.css](file:///G:/DESARROLLO2026/cursoKagle/agy-cli-projects/bq-releases-notes/static/css/styles.css): Premium CSS styling.
- [static/js/app.js](file:///G:/DESARROLLO2026/cursoKagle/agy-cli-projects/bq-releases-notes/static/js/app.js): Client-side interactions, searching, filtering, and X/Twitter modal logic.
- [requirements.txt](file:///G:/DESARROLLO2026/cursoKagle/agy-cli-projects/bq-releases-notes/requirements.txt): Python dependencies.

## How to Run

1. **Activate the Virtual Environment**:
   - On Windows (PowerShell):
     ```pwsh
     .\venv\Scripts\Activate.ps1
     ```
   - On Linux/macOS:
     ```bash
     source venv/bin/activate
     ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Server**:
   ```bash
   python app.py
   ```

4. **Access the App**:
   Open [http://localhost:5000](http://localhost:5000) in your web browser.
