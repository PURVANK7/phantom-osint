# ⬡ PHANTOM — OSINT Intelligence Platform

## 🚀 Quick Start

Open `index.html` directly in any browser — NO server required for most features.

---

## 🔑 Login Credentials

### Operator Login
- **Username:** `operator` | **Password:** `phantom2024`
- **Team:** Blue Team (Defender)

### Red Team Login
- **Username:** `redteam1` | **Password:** `phantom2024`

### Admin Panel
- **Admin ID:** `PHANTOM_ADMIN`
- **Master Password:** `admin@phantom2024`

---

## 🌐 Deploying to Render (Free)

1. **Create a GitHub repo** and push these 3 files:
   - `index.html`
   - `styles.css`
   - `app.js`

2. **Sign up at** [render.com](https://render.com)

3. **New Static Site:**
   - Connect your GitHub repo
   - Build Command: _(leave empty)_
   - Publish Directory: `.`
   - Click **Deploy**

4. Your URL: `https://your-site-name.onrender.com`

---

## 🛠️ Tools & Features

### Reconnaissance
| Tool | API Used | Auth Required |
|------|----------|---------------|
| WHOIS Lookup | whoisjson.com + RDAP | No |
| DNS Recon | Google DNS over HTTPS | No |
| IP Intelligence | ipinfo.io + ipapi.co | No |
| Subdomain Enum | crt.sh (cert transparency) | No |
| HTTP Headers | allorigins proxy | No |

### Social OSINT
| Tool | Method | Auth |
|------|--------|------|
| Username Hunt | 33 platforms URL check | No |
| Email Intel | DNS MX/SPF/DMARC | No |
| Phone Lookup | abstractapi.com | Free tier |

### Threat Intelligence
| Tool | API | Auth |
|------|-----|------|
| Breach Check | HaveIBeenPwned v3 | API Key (free) |
| Shodan Search | Shodan API | API Key needed |
| VirusTotal | VT API v3 | API Key (free 500/day) |
| URL Scan | urlscan.io | API Key (free) |

### Advanced
| Tool | Method | Notes |
|------|--------|-------|
| Metadata Extract | Browser FileReader API | Works offline |
| GeoIP Map | ipinfo.io + OpenStreetMap | No key needed |
| SSL Inspector | crt.sh | No key needed |
| Dark Web Monitor | Passive aggregation | Links to tools |
| Report Builder | Local generation | Download TXT |

---

## 🔑 Getting Free API Keys

### HaveIBeenPwned (Breach Check)
→ https://haveibeenpwned.com/API/Key
→ Free for personal use

### Shodan
→ https://account.shodan.io/register
→ Free tier: 100 query credits/month

### VirusTotal
→ https://virustotal.com/gui/join-us
→ Free: 500 requests/day, 4 requests/minute

### URLScan.io
→ https://urlscan.io/user/signup
→ Free: 5000 scans/month

---

## 👤 Admin Panel Features
- User management (view, add, ban users)
- Audit logs (all user actions logged)
- API key configuration
- Platform config (rate limits, 2FA, session timeout)
- Usage statistics + charts

---

## ⚠️ Legal Disclaimer
This tool is for **authorized security research only**.
Always obtain proper authorization before scanning targets.
User activity is logged for compliance purposes.

---

## 📁 File Structure
```
phantom-osint/
├── index.html    # Main app (all panels, login, admin)
├── styles.css    # Dark cyberpunk theme
├── app.js        # All logic + API integrations
└── README.md     # This file
```
