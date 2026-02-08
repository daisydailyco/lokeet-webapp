# Lokeet Naming Conventions - Quick Reference

**Last Updated:** 2026-01-10

---

## User-Facing Names (ALWAYS "Lokeet")

### Display Names
```
✅ Lokeet             (logo, brand name)
✅ Lokeet: Save & Share  (extension full name)
✅ Save & Share         (tagline)
```

### Page Titles
```html
<!-- Extension -->
<title>Lokeet</title>

<!-- Web App -->
<title>Lokeet - Save & Share Local Experiences</title>
<title>Dashboard - Lokeet</title>
<title>Log In - Lokeet</title>
<title>Sign Up - Lokeet</title>
<title>Shared List - Lokeet</title>
<title>{Category} - Lokeet</title>
```

### Buttons & UI Text
```
✅ "Save to Lokeet"
✅ "Saved to Lokeet!"
✅ "Create Your Own List"
```

### URLs & Domains
```
✅ lokeet.io
✅ https://lokeet.io/signup.html
✅ https://lokeet.io/share/{share_id}
```

---

## Internal Names (Code)

### File Names
```bash
# CSS
✅ lokeet-styles.css

# Database
✅ lokeet.db
✅ lokeet_backup_20260110_120000.db

# Extension Packages
✅ Lokeet-Extension-v1.4.9.zip
```

### Directory Names
```bash
# Current (after rebrand)
✅ ps-backend/
✅ ps-webapp/
✅ ps-webapp-next/

# Main folder (rename manually after session)
⚠️ lokeet-extension/  → lokeet-extension/
```

### localStorage Keys
```javascript
// JavaScript - Web App
const SESSION_KEY = 'lokeet_session';
const USER_KEY = 'lokeet_user';
```

### Service Worker
```javascript
// Cache naming
const CACHE_NAME = 'lokeet-v1';
```

### CSS Class Names
```javascript
// Internal (can keep as-is, not visible to users)
'lokeet-confirm-modal'  // Optional: change to lokeet-*
'lokeet-confirm-btn'    // Optional: change to lokeet-*
```

### Code Classes & Functions
```javascript
// PascalCase for classes
class LokeetAPI { }
class InstagramLokeet { }
class TikTokLokeet { }

// camelCase for variables
const paraSoshSession = getSession();
const paraSoshData = fetchData();
```

### Database
```python
# Python - Backend
conn = sqlite3.connect('lokeet.db')

# Backup files
backup_path = f"lokeet_backup_{timestamp}.db"
```

### API Configuration
```python
# FastAPI
app = FastAPI(
    title="Lokeet AI Backend",
    description="AI-powered social media content parsing..."
)

BASE_URL = "https://lokeet.io"
```

---

## Code Comments

```javascript
// Lokeet Extension
// Lokeet Authentication Helper
// Lokeet Dashboard JavaScript
// Lokeet Service Worker
```

```python
# Lokeet AI Backend
# Phase 0: Lokeet Persistence
```

---

## Git Commit Messages

```bash
# Format
"[Lokeet] {Description}"

# Examples
"[Lokeet] Rebrand from Lokeet to Lokeet"
"[Lokeet] Update database naming to lokeet.db"
"[Lokeet] Add Phase 0 persistence implementation"
```

---

## Manifest Files

### Extension (manifest.json)
```json
{
  "name": "Lokeet: Save & Share",
  "default_title": "Lokeet",
  "host_permissions": ["*://lokeet.io/*"]
}
```

### Web App PWA (manifest.json)
```json
{
  "name": "Lokeet",
  "short_name": "Lokeet",
  "description": "Save and share your favorite local spots"
}
```

---

## Environment Variables

```bash
# Backend .env
BASE_URL=https://lokeet.io
OPENAI_API_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
```

---

## Consistency Rules

### 1. User-Facing → Always "Lokeet"
- **Capitalization:** Lokeet (capital P, capital S)
- **Never:** lokeet, Parasosh, Lokeet!, PARASOSH
- **Always:** Lokeet

### 2. Internal Code → Use "lokeet"
- **Files:** `lokeet-styles.css`, `lokeet.db`
- **Variables:** `lokeet_session`, `lokeet_backup`
- **Cache:** `lokeet-v1`
- **Lowercase with underscores or hyphens**

### 3. Classes → PascalCase
- `LokeetAPI`
- `InstagramLokeet`
- `TikTokLokeet`

### 4. URLs → lowercase
- `lokeet.io`
- `lokeet.io/share/abc123`

---

## Platform-Specific

### Chrome Web Store
```
Name: Lokeet: Save & Share
Short Description: Save & share local spots from Instagram & TikTok
Category: Productivity
Website: https://lokeet.io
```

### Social Media
```
Twitter/X: @Lokeet (if available)
Instagram: @lokeet (if available)
Domain: lokeet.io
```

---

## Documentation

### File Headers
```markdown
# Lokeet {Feature Name}

## Overview
Lokeet is a Chrome extension and web app for...
```

### Code Documentation
```javascript
/**
 * Lokeet API Client
 * Handles communication with the Lokeet backend
 */
class LokeetAPI {
  // ...
}
```

---

## Branding Colors

```css
/* Primary Colors */
--primary-orange: #e7ac6d;
--primary-red: #db3f1d;

/* Gradient */
background: linear-gradient(135deg, #e7ac6d 0%, #db3f1d 100%);

/* Neutral */
--background: #f0f0f0;
--background-alt: #f9f8e5;
```

---

## Checklist for New Files

When creating new files, ensure:

- [ ] Display names use "Lokeet" (capital P, capital S)
- [ ] File names use lowercase: `lokeet-*`
- [ ] Code classes use PascalCase: `Lokeet*`
- [ ] Internal variables use snake_case: `lokeet_*`
- [ ] Cache names use kebab-case: `lokeet-v*`
- [ ] URLs use lowercase: `lokeet.io`
- [ ] Page titles include "Lokeet"
- [ ] Comments reference "Lokeet"

---

## Quick Find & Replace Rules

### When Adding New Code:

```bash
# DON'T use
Lokeet
lokeet
loop-local
loop_local

# DO use
Lokeet          # For display
lokeet          # For internal
lokeet-*        # For file names
lokeet_*        # For variables
Lokeet*         # For classes
```

---

## Examples by File Type

### HTML
```html
<title>Lokeet - Dashboard</title>
<div class="logo">Lokeet</div>
<button>Save to Lokeet</button>
<link rel="stylesheet" href="lokeet-styles.css">
```

### JavaScript
```javascript
// Lokeet Extension
const SESSION_KEY = 'lokeet_session';
class LokeetAPI { }
const cache = 'lokeet-v1';
```

### Python
```python
# Lokeet Backend
DB_PATH = 'lokeet.db'
BACKUP_PREFIX = 'lokeet_backup_'
app = FastAPI(title="Lokeet AI Backend")
```

### CSS
```css
/* lokeet-styles.css */
.lokeet-modal { }
.lokeet-button { }
```

### JSON
```json
{
  "name": "Lokeet",
  "title": "Lokeet: Save & Share"
}
```

---

**Remember:** Consistency is key! Always use "Lokeet" for user-facing elements and "lokeet" (lowercase) for internal code.

---

*Lokeet Naming Conventions v1.0*
*Updated: 2026-01-10*
