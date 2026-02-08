# ParaSosh Naming Conventions - Quick Reference

**Last Updated:** 2026-01-10

---

## User-Facing Names (ALWAYS "ParaSosh")

### Display Names
```
✅ ParaSosh             (logo, brand name)
✅ ParaSosh: Save & Share  (extension full name)
✅ Save & Share         (tagline)
```

### Page Titles
```html
<!-- Extension -->
<title>ParaSosh</title>

<!-- Web App -->
<title>ParaSosh - Save & Share Local Experiences</title>
<title>Dashboard - ParaSosh</title>
<title>Log In - ParaSosh</title>
<title>Sign Up - ParaSosh</title>
<title>Shared List - ParaSosh</title>
<title>{Category} - ParaSosh</title>
```

### Buttons & UI Text
```
✅ "Save to ParaSosh"
✅ "Saved to ParaSosh!"
✅ "Create Your Own List"
```

### URLs & Domains
```
✅ parasosh.io
✅ https://parasosh.io/signup.html
✅ https://parasosh.io/share/{share_id}
```

---

## Internal Names (Code)

### File Names
```bash
# CSS
✅ parasosh-styles.css

# Database
✅ parasosh.db
✅ parasosh_backup_20260110_120000.db

# Extension Packages
✅ ParaSosh-Extension-v1.4.9.zip
```

### Directory Names
```bash
# Current (after rebrand)
✅ ps-backend/
✅ ps-webapp/
✅ ps-webapp-next/

# Main folder (rename manually after session)
⚠️ looplocal-extension/  → parasosh-extension/
```

### localStorage Keys
```javascript
// JavaScript - Web App
const SESSION_KEY = 'parasosh_session';
const USER_KEY = 'parasosh_user';
```

### Service Worker
```javascript
// Cache naming
const CACHE_NAME = 'parasosh-v1';
```

### CSS Class Names
```javascript
// Internal (can keep as-is, not visible to users)
'looplocal-confirm-modal'  // Optional: change to parasosh-*
'looplocal-confirm-btn'    // Optional: change to parasosh-*
```

### Code Classes & Functions
```javascript
// PascalCase for classes
class ParaSoshAPI { }
class InstagramParaSosh { }
class TikTokParaSosh { }

// camelCase for variables
const paraSoshSession = getSession();
const paraSoshData = fetchData();
```

### Database
```python
# Python - Backend
conn = sqlite3.connect('parasosh.db')

# Backup files
backup_path = f"parasosh_backup_{timestamp}.db"
```

### API Configuration
```python
# FastAPI
app = FastAPI(
    title="ParaSosh AI Backend",
    description="AI-powered social media content parsing..."
)

BASE_URL = "https://parasosh.io"
```

---

## Code Comments

```javascript
// ParaSosh Extension
// ParaSosh Authentication Helper
// ParaSosh Dashboard JavaScript
// ParaSosh Service Worker
```

```python
# ParaSosh AI Backend
# Phase 0: ParaSosh Persistence
```

---

## Git Commit Messages

```bash
# Format
"[ParaSosh] {Description}"

# Examples
"[ParaSosh] Rebrand from LoopLocal to ParaSosh"
"[ParaSosh] Update database naming to parasosh.db"
"[ParaSosh] Add Phase 0 persistence implementation"
```

---

## Manifest Files

### Extension (manifest.json)
```json
{
  "name": "ParaSosh: Save & Share",
  "default_title": "ParaSosh",
  "host_permissions": ["*://parasosh.io/*"]
}
```

### Web App PWA (manifest.json)
```json
{
  "name": "ParaSosh",
  "short_name": "ParaSosh",
  "description": "Save and share your favorite local spots"
}
```

---

## Environment Variables

```bash
# Backend .env
BASE_URL=https://parasosh.io
OPENAI_API_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
```

---

## Consistency Rules

### 1. User-Facing → Always "ParaSosh"
- **Capitalization:** ParaSosh (capital P, capital S)
- **Never:** parasosh, Parasosh, ParaSosh!, PARASOSH
- **Always:** ParaSosh

### 2. Internal Code → Use "parasosh"
- **Files:** `parasosh-styles.css`, `parasosh.db`
- **Variables:** `parasosh_session`, `parasosh_backup`
- **Cache:** `parasosh-v1`
- **Lowercase with underscores or hyphens**

### 3. Classes → PascalCase
- `ParaSoshAPI`
- `InstagramParaSosh`
- `TikTokParaSosh`

### 4. URLs → lowercase
- `parasosh.io`
- `parasosh.io/share/abc123`

---

## Platform-Specific

### Chrome Web Store
```
Name: ParaSosh: Save & Share
Short Description: Save & share local spots from Instagram & TikTok
Category: Productivity
Website: https://parasosh.io
```

### Social Media
```
Twitter/X: @ParaSosh (if available)
Instagram: @parasosh (if available)
Domain: parasosh.io
```

---

## Documentation

### File Headers
```markdown
# ParaSosh {Feature Name}

## Overview
ParaSosh is a Chrome extension and web app for...
```

### Code Documentation
```javascript
/**
 * ParaSosh API Client
 * Handles communication with the ParaSosh backend
 */
class ParaSoshAPI {
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

- [ ] Display names use "ParaSosh" (capital P, capital S)
- [ ] File names use lowercase: `parasosh-*`
- [ ] Code classes use PascalCase: `ParaSosh*`
- [ ] Internal variables use snake_case: `parasosh_*`
- [ ] Cache names use kebab-case: `parasosh-v*`
- [ ] URLs use lowercase: `parasosh.io`
- [ ] Page titles include "ParaSosh"
- [ ] Comments reference "ParaSosh"

---

## Quick Find & Replace Rules

### When Adding New Code:

```bash
# DON'T use
LoopLocal
looplocal
loop-local
loop_local

# DO use
ParaSosh          # For display
parasosh          # For internal
parasosh-*        # For file names
parasosh_*        # For variables
ParaSosh*         # For classes
```

---

## Examples by File Type

### HTML
```html
<title>ParaSosh - Dashboard</title>
<div class="logo">ParaSosh</div>
<button>Save to ParaSosh</button>
<link rel="stylesheet" href="parasosh-styles.css">
```

### JavaScript
```javascript
// ParaSosh Extension
const SESSION_KEY = 'parasosh_session';
class ParaSoshAPI { }
const cache = 'parasosh-v1';
```

### Python
```python
# ParaSosh Backend
DB_PATH = 'parasosh.db'
BACKUP_PREFIX = 'parasosh_backup_'
app = FastAPI(title="ParaSosh AI Backend")
```

### CSS
```css
/* parasosh-styles.css */
.parasosh-modal { }
.parasosh-button { }
```

### JSON
```json
{
  "name": "ParaSosh",
  "title": "ParaSosh: Save & Share"
}
```

---

**Remember:** Consistency is key! Always use "ParaSosh" for user-facing elements and "parasosh" (lowercase) for internal code.

---

*ParaSosh Naming Conventions v1.0*
*Updated: 2026-01-10*
