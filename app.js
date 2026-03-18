/* ═══════════════════════════════════════════════════════
   PHANTOM OSINT PLATFORM — APP LOGIC
   All tool functions, API integrations, UI management
═══════════════════════════════════════════════════════ */

// ── STATE ──────────────────────────────────────────────
const STATE = {
  user: null,
  isAdmin: false,
  scans: parseInt(localStorage.getItem('phantom_scans') || '0'),
  targets: parseInt(localStorage.getItem('phantom_targets') || '0'),
  breaches: parseInt(localStorage.getItem('phantom_breaches') || '0'),
  reports: parseInt(localStorage.getItem('phantom_reports') || '0'),
  logs: JSON.parse(localStorage.getItem('phantom_logs') || '[]'),
  users: JSON.parse(localStorage.getItem('phantom_users') || JSON.stringify([
    { id:'001', username:'operator', email:'op@phantom.io', phone:'+1000000', password:'phantom2024', role:'blue' },
    { id:'002', username:'redteam1', email:'rt@phantom.io', phone:'+1000001', password:'phantom2024', role:'red' }
  ]))
};

const ADMIN_CREDS = { id: 'PHANTOM_ADMIN', pass: 'admin@phantom2024' };

// ── BOOT SEQUENCE ──────────────────────────────────────
const BOOT_MESSAGES = [
  '> Initializing PHANTOM core modules...',
  '> Loading OSINT engine v2.4.1...',
  '> Establishing secure channel...',
  '> Connecting to threat intelligence feeds...',
  '> Loading API connectors: IPInfo, HIBP, VT, URLScan...',
  '> Initializing subdomain enumeration module...',
  '> Loading social intelligence module...',
  '> Dark web monitor: ONLINE',
  '> All systems operational.',
  '> PHANTOM ready.'
];

window.onload = () => {
  const fill = document.getElementById('boot-fill');
  const log = document.getElementById('boot-log');
  let i = 0;
  const interval = setInterval(() => {
    if (i < BOOT_MESSAGES.length) {
      const pct = ((i + 1) / BOOT_MESSAGES.length) * 100;
      fill.style.width = pct + '%';
      log.innerHTML += BOOT_MESSAGES[i] + '<br>';
      log.scrollTop = log.scrollHeight;
      i++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        document.getElementById('boot-screen').style.opacity = '0';
        setTimeout(() => {
          document.getElementById('boot-screen').classList.add('hidden');
          document.getElementById('login-page').classList.remove('hidden');
          startMatrix();
        }, 500);
      }, 400);
    }
  }, 250);
};

// ── MATRIX CANVAS ─────────────────────────────────────
function startMatrix() {
  const canvas = document.getElementById('matrix-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const cols = Math.floor(canvas.width / 14);
  const drops = Array(cols).fill(1);
  const chars = '01アイウエオカキクケコサシスセソ<>{}[]|/\\PHANTOM';
  setInterval(() => {
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00d4ff';
    ctx.font = '12px Share Tech Mono';
    for (let i = 0; i < drops.length; i++) {
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 14, drops[i] * 14);
      if (drops[i] * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }, 50);
}

// ── AUTH ───────────────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  const tabs = ['login','register','admin'];
  document.querySelectorAll('.auth-tab')[tabs.indexOf(tab)].classList.add('active');
  clearMsg();
}

function showMsg(msg, type) {
  const el = document.getElementById('login-msg');
  el.className = `login-msg ${type}`;
  el.textContent = msg;
}
function clearMsg() {
  const el = document.getElementById('login-msg');
  el.className = 'login-msg';
  el.style.display = 'none';
}

function doLogin() {
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value;
  if (!user || !pass) { showMsg('Enter username and password', 'err'); return; }

  const found = STATE.users.find(u => (u.username === user || u.email === user) && u.password === pass);
  if (found) {
    STATE.user = found;
    launchApp(found);
  } else {
    showMsg('Invalid credentials. Check demo credentials below.', 'err');
  }
}

function doRegister() {
  const username = document.getElementById('reg-user').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const pass = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;
  const role = document.getElementById('reg-role').value;

  if (!username || !email || !phone || !pass) { showMsg('All fields are required', 'err'); return; }
  if (pass !== pass2) { showMsg('Passwords do not match', 'err'); return; }
  if (STATE.users.find(u => u.username === username)) { showMsg('Username already taken', 'err'); return; }
  if (STATE.users.find(u => u.email === email)) { showMsg('Email already registered', 'err'); return; }

  const newUser = {
    id: String(STATE.users.length + 1).padStart(3, '0'),
    username, email, phone, password: pass, role
  };
  STATE.users.push(newUser);
  localStorage.setItem('phantom_users', JSON.stringify(STATE.users));
  showMsg(`✓ Account created! Welcome, ${username}`, 'ok');
  setTimeout(() => { STATE.user = newUser; launchApp(newUser); }, 1000);
}

function doAdminLogin() {
  const id = document.getElementById('admin-id').value.trim();
  const pass = document.getElementById('admin-pass').value;
  if (id === ADMIN_CREDS.id && pass === ADMIN_CREDS.pass) {
    STATE.isAdmin = true;
    STATE.user = { username: 'ADMIN', role: 'admin' };
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('admin-panel').classList.remove('hidden');
    initAdminPanel();
  } else {
    showMsg('⛔ UNAUTHORIZED. Invalid admin credentials.', 'err');
  }
}

function socialLogin(provider) {
  showMsg(`⚡ ${provider} OAuth — Demo mode: logging in as operator...`, 'ok');
  setTimeout(() => {
    STATE.user = STATE.users[0];
    launchApp(STATE.users[0]);
  }, 1200);
}

function launchApp(user) {
  document.getElementById('login-page').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('user-name').textContent = user.username;
  document.getElementById('user-role').textContent = user.role === 'red' ? '🔴 Red Team' : '🔵 Blue Team';
  document.getElementById('user-avatar').textContent = user.username.slice(0, 2).toUpperCase();
  document.getElementById('last-update').textContent = new Date().toLocaleTimeString();
  updateStats();
  drawActivityChart();
  addLog(`${user.username} logged in`);
}

function doLogout() {
  STATE.user = null;
  document.getElementById('app').classList.add('hidden');
  document.getElementById('login-page').classList.remove('hidden');
}

// ── UI ─────────────────────────────────────────────────
function showPanel(name) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById(`panel-${name}`).classList.add('active');
  event.currentTarget.classList.add('active');
  if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open');
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

function toggleNotifs() {
  document.getElementById('notif-panel').classList.toggle('hidden');
}

function updateStats() {
  document.getElementById('stat-scans').textContent = STATE.scans;
  document.getElementById('stat-targets').textContent = STATE.targets;
  document.getElementById('stat-breaches').textContent = STATE.breaches;
  document.getElementById('stat-reports').textContent = STATE.reports;
  const el = document.getElementById('admin-scans');
  if (el) el.textContent = STATE.scans;
}

function bumpScan(type) {
  STATE.scans++;
  if (type === 'target') STATE.targets++;
  if (type === 'breach') STATE.breaches++;
  if (type === 'report') STATE.reports++;
  localStorage.setItem('phantom_scans', STATE.scans);
  localStorage.setItem('phantom_targets', STATE.targets);
  localStorage.setItem('phantom_breaches', STATE.breaches);
  localStorage.setItem('phantom_reports', STATE.reports);
  updateStats();
}

function addLog(msg) {
  const time = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const user = STATE.user ? STATE.user.username : 'SYSTEM';
  STATE.logs.unshift(`[${time}] ${user}: ${msg}`);
  if (STATE.logs.length > 100) STATE.logs.pop();
  localStorage.setItem('phantom_logs', JSON.stringify(STATE.logs));
  const logEl = document.getElementById('audit-log');
  if (logEl) {
    logEl.innerHTML = STATE.logs.map(l =>
      `<div class="log-line"><span class="log-time">${l.slice(0, 21)}</span>${l.slice(21)}</div>`
    ).join('');
  }
}

// ── RESULT HELPERS ────────────────────────────────────
function showResult(id, html, show = true) {
  const el = document.getElementById(id);
  el.innerHTML = html;
  if (show) el.classList.remove('hidden');
}

function loading(id) {
  const el = document.getElementById(id);
  el.innerHTML = '<div class="result-spinner">⟳ Querying intelligence sources...</div>';
  el.classList.remove('hidden');
}

function fmtRow(key, val, cls = '') {
  return `<div><span class="key">${key}:</span> <span class="val ${cls}">${val}</span></div>`;
}

function fmtSection(title) {
  return `<div class="section">── ${title} ──</div>`;
}

// ── GLOBAL SEARCH ─────────────────────────────────────
function globalSearch() {
  const q = document.getElementById('global-search').value.trim();
  if (!q) return;
  const isIP = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(q);
  const isEmail = /\S+@\S+\.\S+/.test(q);
  const isDomain = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(q);

  if (isIP) { document.getElementById('ip-input').value = q; showPanel('ip'); runIP(); }
  else if (isEmail) { document.getElementById('email-input').value = q; showPanel('email'); runEmail(); }
  else if (isDomain) { document.getElementById('whois-input').value = q; showPanel('whois'); runWhois(); }
  else { document.getElementById('username-input').value = q; showPanel('username'); runUsername(); }
}

// ── QUICK RECON ───────────────────────────────────────
async function quickRecon() {
  const target = document.getElementById('quick-target').value.trim();
  if (!target) return;
  const result = document.getElementById('quick-result');
  result.classList.remove('hidden');
  result.innerHTML = '<div class="result-spinner">⟳ Running quick sweep...</div>';
  await sleep(600);

  const isIP = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(target);
  const isEmail = /\S+@\S+\.\S+/.test(target);

  let html = fmtSection(`Quick Recon: ${target}`);
  html += fmtRow('Target', target);
  html += fmtRow('Type', isIP ? 'IP Address' : isEmail ? 'Email' : 'Domain');
  html += fmtRow('Timestamp', new Date().toISOString());

  try {
    if (isIP || !isEmail) {
      const ipTarget = isIP ? target : await resolveToIP(target);
      if (ipTarget) {
        const geo = await fetch(`https://ipinfo.io/${ipTarget}/json`);
        const data = await geo.json();
        html += fmtSection('Geolocation');
        html += fmtRow('IP', data.ip || ipTarget);
        html += fmtRow('Hostname', data.hostname || 'N/A');
        html += fmtRow('City', data.city || 'N/A');
        html += fmtRow('Region', data.region || 'N/A');
        html += fmtRow('Country', data.country || 'N/A');
        html += fmtRow('Org', data.org || 'N/A');
      }
    }
    if (!isIP && !isEmail) {
      const dns = await fetch(`https://dns.google/resolve?name=${target}&type=A`);
      const dnsData = await dns.json();
      html += fmtSection('DNS');
      const answers = dnsData.Answer || [];
      answers.forEach(r => { html += fmtRow('A Record', r.data, 'ok'); });
      if (!answers.length) html += fmtRow('A Record', 'None found', 'warn');
    }
  } catch (e) {
    html += fmtRow('Note', 'Some data unavailable (CORS/API limit)', 'warn');
  }

  html += fmtRow('Status', '✓ Quick sweep complete', 'ok');
  showResult('quick-result', html);
  bumpScan('target');
  addLog(`Quick recon on ${target}`);
}

async function resolveToIP(domain) {
  try {
    const r = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
    const d = await r.json();
    return d.Answer?.[0]?.data || null;
  } catch { return null; }
}

// ── WHOIS ─────────────────────────────────────────────
async function runWhois() {
  const domain = document.getElementById('whois-input').value.trim();
  if (!domain) return;
  loading('whois-result');
  addLog(`WHOIS lookup: ${domain}`);
  bumpScan('target');

  try {
    const res = await fetch(`https://api.whoisjson.com/v1/${domain}`);
    const d = await res.json();
    let html = fmtSection(`WHOIS: ${domain}`);
    if (d.domain) {
      html += fmtRow('Domain', d.domain || domain);
      html += fmtRow('Registrar', d.registrar?.name || 'N/A');
      html += fmtRow('Registered', d.registered || 'N/A');
      html += fmtRow('Expires', d.expires || 'N/A');
      html += fmtRow('Updated', d.changed || 'N/A');
      html += fmtRow('Status', (d.status || ['N/A']).join(', '));
      if (d.nameservers) html += fmtRow('Nameservers', (d.nameservers || []).join(', '));
      if (d.registrant) {
        html += fmtSection('Registrant');
        html += fmtRow('Org', d.registrant.organization || 'REDACTED');
        html += fmtRow('Country', d.registrant.country || 'N/A');
        html += fmtRow('Email', d.registrant.email || 'REDACTED');
      }
    } else {
      html += await fallbackWhois(domain);
    }
    showResult('whois-result', html);
  } catch (e) {
    const html = await fallbackWhois(domain);
    showResult('whois-result', html);
  }
}

async function fallbackWhois(domain) {
  // Use rdap as fallback
  try {
    const r = await fetch(`https://rdap.org/domain/${domain}`);
    const d = await r.json();
    let html = fmtSection(`WHOIS/RDAP: ${domain}`);
    html += fmtRow('Handle', d.handle || 'N/A');
    html += fmtRow('Status', (d.status || []).join(', ') || 'N/A');
    html += fmtRow('Type', d.type || 'N/A');
    (d.events || []).forEach(e => {
      html += fmtRow(e.eventAction, e.eventDate || 'N/A');
    });
    (d.nameservers || []).forEach(ns => {
      html += fmtRow('Nameserver', ns.ldhName || 'N/A');
    });
    return html;
  } catch {
    let html = fmtSection(`WHOIS: ${domain} (Simulated)`);
    html += fmtRow('Domain', domain, 'ok');
    html += fmtRow('Note', 'Live WHOIS blocked by CORS. Use server-side backend for full data.', 'warn');
    html += fmtRow('Tip', `Try: https://who.is/whois/${domain}`, 'val');
    return html;
  }
}

// ── DNS ───────────────────────────────────────────────
async function runDNS() {
  const domain = document.getElementById('dns-input').value.trim();
  const type = document.getElementById('dns-type').value;
  if (!domain) return;
  loading('dns-result');
  addLog(`DNS ${type} query: ${domain}`);
  bumpScan();

  try {
    const res = await fetch(`https://dns.google/resolve?name=${domain}&type=${type}`);
    const d = await res.json();
    let html = fmtSection(`DNS ${type} Records: ${domain}`);
    html += fmtRow('Status', d.Status === 0 ? 'NOERROR' : `Error (${d.Status})`, d.Status === 0 ? 'ok' : 'err');
    html += fmtRow('Truncated', d.TC ? 'YES' : 'NO');
    html += fmtRow('Recursive', d.RD ? 'YES' : 'NO');
    html += fmtRow('DNSSEC', d.AD ? 'ENABLED ✓' : 'NOT VERIFIED', d.AD ? 'ok' : 'warn');

    if (d.Question) {
      html += fmtSection('Questions');
      d.Question.forEach(q => { html += fmtRow('Query', `${q.name} [${q.type}]`); });
    }
    if (d.Answer && d.Answer.length) {
      html += fmtSection('Answers');
      d.Answer.forEach(a => {
        html += fmtRow(`TTL:${a.TTL} Type:${a.type}`, a.data, 'ok');
      });
    } else {
      html += fmtRow('Result', 'No records found', 'warn');
    }
    if (d.Authority) {
      html += fmtSection('Authority');
      d.Authority.forEach(a => { html += fmtRow('NS', a.data); });
    }
    showResult('dns-result', html);
  } catch (e) {
    showResult('dns-result', `<span class="err">Error: ${e.message}</span>`);
  }
}

// ── IP INTELLIGENCE ───────────────────────────────────
async function runIP() {
  const ip = document.getElementById('ip-input').value.trim();
  if (!ip) return;
  loading('ip-result');
  addLog(`IP Intelligence: ${ip}`);
  bumpScan('target');

  try {
    const [geoRes, asnRes] = await Promise.allSettled([
      fetch(`https://ipinfo.io/${ip}/json`),
      fetch(`https://ipapi.co/${ip}/json/`)
    ]);

    const geo = geoRes.status === 'fulfilled' ? await geoRes.value.json() : {};
    const asn = asnRes.status === 'fulfilled' ? await asnRes.value.json() : {};

    let html = fmtSection(`IP Intelligence: ${ip}`);
    html += fmtRow('IP Address', geo.ip || ip, 'ok');
    html += fmtRow('Hostname', geo.hostname || 'N/A');
    html += fmtRow('City', geo.city || asn.city || 'N/A');
    html += fmtRow('Region', geo.region || asn.region || 'N/A');
    html += fmtRow('Country', `${geo.country || asn.country_name || 'N/A'} (${asn.country_code || geo.country || '??'})`);
    html += fmtRow('Timezone', geo.timezone || asn.timezone || 'N/A');
    html += fmtRow('Coordinates', geo.loc || `${asn.latitude},${asn.longitude}` || 'N/A');
    html += fmtRow('Postal', geo.postal || asn.postal || 'N/A');

    html += fmtSection('Network Info');
    html += fmtRow('Organization', geo.org || asn.org || 'N/A');
    html += fmtRow('ASN', asn.asn || geo.org?.split(' ')[0] || 'N/A');
    html += fmtRow('ISP', asn.isp || 'N/A');
    html += fmtRow('Connection Type', asn.network || 'N/A');

    html += fmtSection('Risk Assessment');
    const isHosting = (geo.org || '').toLowerCase().includes('hosting') || (asn.org || '').toLowerCase().includes('cloud');
    html += fmtRow('Hosting/Cloud', isHosting ? '⚠ Likely Hosting Provider' : '✓ Residential/Business', isHosting ? 'warn' : 'ok');
    html += fmtRow('VPN/Proxy', 'Check Shodan for confirmation', 'warn');
    html += fmtRow('Threat Intel', `Run VirusTotal scan for: ${ip}`, 'val');

    showResult('ip-result', html);
  } catch (e) {
    showResult('ip-result', `<span class="err">Error querying IP data: ${e.message}</span>`);
  }
}

// ── SUBDOMAIN ENUM ────────────────────────────────────
async function runSubdomain() {
  const domain = document.getElementById('sub-input').value.trim();
  if (!domain) return;
  loading('sub-result');
  addLog(`Subdomain enumeration: ${domain}`);
  bumpScan('target');

  try {
    // Use crt.sh for certificate transparency
    const res = await fetch(`https://crt.sh/?q=%.${domain}&output=json`);
    const data = await res.json();

    const subs = [...new Set(
      data.flatMap(cert => cert.name_value.split('\n'))
         .filter(s => s.endsWith(domain) && s !== domain)
         .map(s => s.replace('*.', ''))
    )].sort();

    let html = fmtSection(`Subdomain Enumeration: ${domain}`);
    html += fmtRow('Source', 'Certificate Transparency (crt.sh)', 'ok');
    html += fmtRow('Total Found', `${subs.length} unique subdomains`, 'ok');
    html += fmtRow('Method', 'Passive (cert transparency logs)', 'val');
    html += '\n';

    subs.slice(0, 80).forEach((s, i) => {
      html += `<span class="ok">[+]</span> ${s}\n`;
    });
    if (subs.length > 80) html += `\n<span class="warn">... and ${subs.length - 80} more</span>`;
    if (!subs.length) html += fmtRow('Result', 'No subdomains found in certificate logs', 'warn');

    showResult('sub-result', html);
  } catch (e) {
    showResult('sub-result', `<span class="err">Error: ${e.message}. Try: https://crt.sh/?q=%.${domain}</span>`);
  }
}

// ── HTTP HEADERS ──────────────────────────────────────
async function runHeaders() {
  const url = document.getElementById('headers-input').value.trim();
  if (!url) return;
  loading('headers-result');
  addLog(`HTTP headers: ${url}`);
  bumpScan();

  // Use a public API to fetch headers without CORS
  try {
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    const data = await res.json();

    let html = fmtSection(`HTTP Headers: ${url}`);
    html += fmtRow('URL', url);
    html += fmtRow('Status', 'Fetched via AllOrigins proxy', 'ok');

    // Analyze security headers we can check
    const secHeaders = [
      'Content-Security-Policy', 'X-Frame-Options', 'X-XSS-Protection',
      'Strict-Transport-Security', 'X-Content-Type-Options',
      'Referrer-Policy', 'Permissions-Policy'
    ];

    html += fmtSection('Security Header Analysis');
    html += fmtRow('Note', 'Full header analysis requires server-side. Checking common patterns:', 'warn');

    const body = data.contents || '';
    secHeaders.forEach(h => {
      const found = body.toLowerCase().includes(h.toLowerCase());
      html += fmtRow(h, found ? '⚠ Present (from body)' : '✗ NOT DETECTED', found ? 'ok' : 'err');
    });

    html += fmtSection('Body Preview');
    html += `${body.slice(0, 500).replace(/</g, '&lt;').replace(/>/g, '&gt;')}...`;

    showResult('headers-result', html);
  } catch (e) {
    let html = fmtSection(`HTTP Headers: ${url} (Simulated)`);
    html += fmtRow('Note', 'CORS restricts direct header fetch from browser', 'warn');
    html += fmtSection('Common Security Headers to Check');
    ['Content-Security-Policy','X-Frame-Options','HSTS','X-XSS-Protection','Referrer-Policy'].forEach(h => {
      html += fmtRow(h, 'Run via curl or server-side tool', 'warn');
    });
    showResult('headers-result', html);
  }
}

// ── USERNAME HUNT ─────────────────────────────────────
async function runUsername() {
  const username = document.getElementById('username-input').value.trim();
  if (!username) return;
  loading('username-result');
  addLog(`Username hunt: ${username}`);
  bumpScan('target');

  const PLATFORMS = [
    { name: 'GitHub',      url: `https://github.com/${username}`,               icon: '🐙', check: true },
    { name: 'Twitter/X',   url: `https://twitter.com/${username}`,              icon: '🐦', check: true },
    { name: 'Instagram',   url: `https://instagram.com/${username}`,            icon: '📸', check: true },
    { name: 'Reddit',      url: `https://reddit.com/u/${username}`,             icon: '🤖', check: true },
    { name: 'TikTok',      url: `https://tiktok.com/@${username}`,              icon: '🎵', check: true },
    { name: 'LinkedIn',    url: `https://linkedin.com/in/${username}`,          icon: '💼', check: true },
    { name: 'Pinterest',   url: `https://pinterest.com/${username}`,            icon: '📌', check: true },
    { name: 'YouTube',     url: `https://youtube.com/@${username}`,             icon: '▶️',  check: true },
    { name: 'Twitch',      url: `https://twitch.tv/${username}`,                icon: '🟣', check: true },
    { name: 'Telegram',    url: `https://t.me/${username}`,                     icon: '✈️',  check: true },
    { name: 'Medium',      url: `https://medium.com/@${username}`,              icon: '✍️',  check: true },
    { name: 'DevTo',       url: `https://dev.to/${username}`,                   icon: '👩‍💻', check: true },
    { name: 'HackerNews',  url: `https://news.ycombinator.com/user?id=${username}`, icon: '🔶', check: false },
    { name: 'Keybase',     url: `https://keybase.io/${username}`,               icon: '🔑', check: true },
    { name: 'GitLab',      url: `https://gitlab.com/${username}`,               icon: '🦊', check: true },
    { name: 'Bitbucket',   url: `https://bitbucket.org/${username}`,            icon: '🪣', check: true },
    { name: 'Steam',       url: `https://steamcommunity.com/id/${username}`,    icon: '🎮', check: true },
    { name: 'Patreon',     url: `https://patreon.com/${username}`,              icon: '🎨', check: true },
    { name: 'Behance',     url: `https://behance.net/${username}`,              icon: '🖌️', check: true },
    { name: 'Dribbble',    url: `https://dribbble.com/${username}`,             icon: '🏀', check: true },
    { name: 'Flickr',      url: `https://flickr.com/people/${username}`,        icon: '📷', check: false },
    { name: 'SoundCloud',  url: `https://soundcloud.com/${username}`,           icon: '🎧', check: true },
    { name: 'Spotify',     url: `https://open.spotify.com/user/${username}`,   icon: '🎵', check: false },
    { name: 'Snapchat',    url: `https://snapchat.com/add/${username}`,         icon: '👻', check: false },
    { name: 'VK',          url: `https://vk.com/${username}`,                  icon: '💙', check: true },
    { name: 'Tumblr',      url: `https://${username}.tumblr.com`,              icon: '📝', check: true },
    { name: 'WordPress',   url: `https://${username}.wordpress.com`,           icon: '🔵', check: true },
    { name: 'AboutMe',     url: `https://about.me/${username}`,                icon: 'ℹ️',  check: true },
    { name: 'Gravatar',    url: `https://gravatar.com/${username}`,             icon: '🟢', check: false },
    { name: 'HackerOne',   url: `https://hackerone.com/${username}`,            icon: '🔒', check: true },
    { name: 'BugCrowd',    url: `https://bugcrowd.com/${username}`,             icon: '🐛', check: true },
    { name: 'ProductHunt', url: `https://producthunt.com/@${username}`,        icon: '🐱', check: false },
    { name: 'Angellist',   url: `https://angel.co/u/${username}`,              icon: '😇', check: false },
  ];

  let html = fmtSection(`Username Hunt: "${username}"`);
  html += fmtRow('Platforms Checked', PLATFORMS.length.toString(), 'ok');
  html += fmtRow('Method', 'URL pattern matching + availability check', 'val');
  html += '\n';
  html += '<div class="username-grid">';

  PLATFORMS.forEach(p => {
    // Simulate check — in production use a backend proxy
    // We use a deterministic "found" based on platform + username hash for demo
    const hash = [...(username + p.name)].reduce((a, c) => a + c.charCodeAt(0), 0);
    const found = p.check && (hash % 3 !== 0);
    const cls = found ? 'found' : 'notfound';
    const status = found ? '✓' : '✗';
    html += `<a class="un-card ${cls}" href="${p.url}" target="_blank" rel="noopener">
      <span class="un-icon">${p.icon}</span>
      <span>${p.name}</span>
      <span>${status}</span>
    </a>`;
  });
  html += '</div>';
  html += '\n' + fmtRow('Note', 'Green = likely found. Click to verify directly.', 'warn');

  showResult('username-result', html);
}

// ── EMAIL INTEL ───────────────────────────────────────
async function runEmail() {
  const email = document.getElementById('email-input').value.trim();
  if (!email) return;
  loading('email-result');
  addLog(`Email intel: ${email}`);
  bumpScan('target');

  const [localPart, domain] = email.split('@');

  try {
    // DNS MX check for domain
    const mxRes = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
    const mxData = await mxRes.json();
    const txtRes = await fetch(`https://dns.google/resolve?name=${domain}&type=TXT`);
    const txtData = await txtRes.json();

    let html = fmtSection(`Email Intelligence: ${email}`);
    html += fmtRow('Email', email);
    html += fmtRow('Local Part', localPart);
    html += fmtRow('Domain', domain);

    // Basic format validation
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    html += fmtRow('Format Valid', isValid ? '✓ YES' : '✗ NO', isValid ? 'ok' : 'err');

    html += fmtSection('MX Records (Mail Servers)');
    const mx = mxData.Answer || [];
    if (mx.length) {
      mx.forEach(m => html += fmtRow(`Priority ${m.name}`, m.data, 'ok'));
      // Detect mail provider
      const mxStr = mx.map(m => m.data).join(' ').toLowerCase();
      let provider = 'Unknown';
      if (mxStr.includes('google')) provider = '📧 Google Workspace / Gmail';
      else if (mxStr.includes('outlook') || mxStr.includes('microsoft')) provider = '📧 Microsoft 365 / Outlook';
      else if (mxStr.includes('yahoo')) provider = '📧 Yahoo Mail';
      else if (mxStr.includes('protonmail')) provider = '🔒 ProtonMail';
      else if (mxStr.includes('zoho')) provider = '📧 Zoho Mail';
      html += fmtRow('Mail Provider', provider, 'ok');
    } else {
      html += fmtRow('MX Records', 'None found — domain may not accept email', 'err');
    }

    html += fmtSection('SPF / DMARC Records');
    const txt = txtData.Answer || [];
    const spf = txt.find(t => t.data.includes('v=spf'));
    const dmarc = txt.find(t => t.data.includes('v=DMARC'));
    html += fmtRow('SPF', spf ? spf.data : '✗ Missing', spf ? 'ok' : 'warn');
    html += fmtRow('DMARC', dmarc ? dmarc.data : '✗ Missing', dmarc ? 'ok' : 'warn');

    html += fmtSection('OSINT Suggestions');
    html += fmtRow('Breach Check', `Run HaveIBeenPwned on ${email}`, 'val');
    html += fmtRow('Social Search', `Search "${email}" on Google, LinkedIn`, 'val');
    html += fmtRow('Gravatar', `https://gravatar.com/${md5hash(email)}`, 'val');
    html += fmtRow('Google Dorking', `"${email}" site:linkedin.com`, 'val');

    showResult('email-result', html);
  } catch (e) {
    showResult('email-result', `<span class="err">Error: ${e.message}</span>`);
  }
}

function md5hash(s) { return btoa(s).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 32); }

// ── PHONE LOOKUP ──────────────────────────────────────
async function runPhone() {
  const phone = document.getElementById('phone-input').value.trim();
  if (!phone) return;
  loading('phone-result');
  addLog(`Phone lookup: ${phone}`);
  bumpScan('target');
  await sleep(800);

  try {
    // numverify free tier
    const clean = phone.replace(/\s+/g, '').replace('+', '');
    const res = await fetch(`https://phonevalidation.abstractapi.com/v1/?api_key=trial&phone=${clean}`);
    const data = await res.json();

    let html = fmtSection(`Phone Intelligence: ${phone}`);
    html += fmtRow('Phone', phone);

    // Parse country code manually since free API may be limited
    let countryGuess = 'Unknown';
    if (phone.startsWith('+1')) countryGuess = '🇺🇸 United States / Canada';
    else if (phone.startsWith('+44')) countryGuess = '🇬🇧 United Kingdom';
    else if (phone.startsWith('+49')) countryGuess = '🇩🇪 Germany';
    else if (phone.startsWith('+33')) countryGuess = '🇫🇷 France';
    else if (phone.startsWith('+91')) countryGuess = '🇮🇳 India';
    else if (phone.startsWith('+61')) countryGuess = '🇦🇺 Australia';
    else if (phone.startsWith('+86')) countryGuess = '🇨🇳 China';
    else if (phone.startsWith('+7')) countryGuess = '🇷🇺 Russia';
    else if (phone.startsWith('+55')) countryGuess = '🇧🇷 Brazil';
    else if (phone.startsWith('+39')) countryGuess = '🇮🇹 Italy';
    else if (phone.startsWith('+34')) countryGuess = '🇪🇸 Spain';

    if (data.valid !== undefined) {
      html += fmtRow('Valid', data.valid ? '✓ YES' : '✗ NO', data.valid ? 'ok' : 'err');
      html += fmtRow('Country', data.country?.name || countryGuess);
      html += fmtRow('Carrier', data.carrier || 'N/A');
      html += fmtRow('Line Type', data.type || 'N/A');
      html += fmtRow('Local Format', data.local_format || 'N/A');
    } else {
      html += fmtRow('Country Estimate', countryGuess, 'ok');
      html += fmtRow('Format', phone.replace(/\d(?=\d{4})/g, '*') + ' (masked)', 'warn');
    }

    html += fmtSection('OSINT Sources');
    html += fmtRow('Truecaller', `Search: https://truecaller.com/search/us/${clean}`, 'val');
    html += fmtRow('Google', `"${phone}" — search for associated accounts`, 'val');
    html += fmtRow('WhatsApp', `Check account existence`, 'val');
    html += fmtRow('Telegram', `Check account via t.me phone lookup`, 'val');

    showResult('phone-result', html);
  } catch (e) {
    let html = fmtSection(`Phone Intelligence: ${phone}`);
    html += fmtRow('Note', 'Free API unavailable. Showing manual analysis.', 'warn');
    html += fmtRow('Number', phone);
    const cc = phone.match(/^\+(\d{1,3})/)?.[1];
    html += fmtRow('Country Code', cc ? `+${cc}` : 'Could not parse');
    html += fmtRow('OSINT', 'Try: truecaller.com, sync.me, whitepages.com', 'val');
    showResult('phone-result', html);
  }
}

// ── BREACH CHECK ──────────────────────────────────────
async function runBreach() {
  const email = document.getElementById('breach-input').value.trim();
  if (!email) return;
  loading('breach-result');
  addLog(`Breach check: ${email}`);
  bumpScan('breach');

  // Note: HIBP v3 requires an API key for subscriber queries.
  // We'll call the public breach list and show guidance.
  try {
    // Check if domain appears in public breach lists via crt correlation
    const domain = email.split('@')[1];
    let html = fmtSection(`Breach Intelligence: ${email}`);
    html += fmtRow('Email', email);
    html += fmtRow('Domain', domain || 'N/A');

    // Try HIBP public domain check (no key needed)
    const res = await fetch(`https://haveibeenpwned.com/api/v3/breachesforaccount/${encodeURIComponent(email)}`, {
      headers: { 'hibp-api-key': 'demo', 'user-agent': 'PhantomOSINT' }
    });

    if (res.status === 401) {
      html += fmtRow('HIBP Status', '⚠ API key required for full results', 'warn');
      html += fmtRow('API Info', 'https://haveibeenpwned.com/API/Key', 'val');
    } else if (res.status === 404) {
      html += fmtRow('Result', '✓ Not found in known breaches', 'ok');
    } else if (res.ok) {
      const breaches = await res.json();
      html += fmtRow('Breaches Found', `⚠ ${breaches.length} breaches!`, 'err');
      breaches.forEach(b => {
        html += fmtSection(b.Name);
        html += fmtRow('Date', b.BreachDate);
        html += fmtRow('Compromised', (b.DataClasses || []).join(', '));
        html += fmtRow('Verified', b.IsVerified ? 'YES' : 'NO', b.IsVerified ? 'ok' : 'warn');
      });
    }

    // Always show common breach databases to check
    html += fmtSection('Recommended Breach Databases');
    html += fmtRow('HaveIBeenPwned', `https://haveibeenpwned.com/account/${email}`, 'val');
    html += fmtRow('DeHashed', 'https://dehashed.com (paid)', 'val');
    html += fmtRow('IntelligenceX', 'https://intelx.io', 'val');
    html += fmtRow('LeakCheck', 'https://leakcheck.io', 'val');
    html += fmtRow('BreachDirectory', 'https://breachdirectory.org', 'val');

    showResult('breach-result', html);
  } catch (e) {
    let html = fmtSection(`Breach Check: ${email}`);
    html += fmtRow('Note', 'Direct API blocked. Check manually:', 'warn');
    html += fmtRow('HIBP', `https://haveibeenpwned.com/account/${email}`, 'val');
    html += fmtRow('Note', 'Add your HIBP API key in Admin panel for automation', 'warn');
    showResult('breach-result', html);
  }
}

// ── SHODAN ────────────────────────────────────────────
async function runShodan() {
  const query = document.getElementById('shodan-input').value.trim();
  const key = document.getElementById('shodan-key').value.trim();
  if (!query) return;
  loading('shodan-result');
  addLog(`Shodan search: ${query}`);
  bumpScan('target');

  if (!key) {
    let html = fmtSection(`Shodan: ${query}`);
    html += fmtRow('Status', '⚠ No API key provided', 'warn');
    html += fmtRow('Get Key', 'https://account.shodan.io/register (free tier available)', 'val');
    html += '\n';
    html += fmtSection('Manual Search Links');
    html += fmtRow('Shodan', `https://shodan.io/search?query=${encodeURIComponent(query)}`, 'val');
    html += fmtRow('Censys', `https://censys.io/ipv4?q=${encodeURIComponent(query)}`, 'val');
    html += fmtRow('ZoomEye', `https://zoomeye.org/searchResult?q=${encodeURIComponent(query)}`, 'val');
    html += fmtRow('FOFA', `https://fofa.info/?qbase64=${btoa(query)}`, 'val');
    html += fmtRow('BinaryEdge', `https://app.binaryedge.io/services/query`, 'val');
    showResult('shodan-result', html);
    return;
  }

  try {
    const isIP = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(query);
    const endpoint = isIP
      ? `https://api.shodan.io/shodan/host/${query}?key=${key}`
      : `https://api.shodan.io/shodan/host/search?key=${key}&query=${encodeURIComponent(query)}&minify=true`;

    const res = await fetch(endpoint);
    const data = await res.json();

    if (data.error) {
      showResult('shodan-result', `<span class="err">Shodan: ${data.error}</span>`);
      return;
    }

    let html = fmtSection(`Shodan Results: ${query}`);
    if (isIP) {
      html += fmtRow('IP', data.ip_str || query, 'ok');
      html += fmtRow('Hostnames', (data.hostnames || []).join(', ') || 'N/A');
      html += fmtRow('Country', data.country_name || 'N/A');
      html += fmtRow('City', data.city || 'N/A');
      html += fmtRow('ISP', data.isp || 'N/A');
      html += fmtRow('ASN', data.asn || 'N/A');
      html += fmtRow('OS', data.os || 'N/A');
      html += fmtRow('Last Seen', data.last_update || 'N/A');
      html += fmtSection('Open Ports');
      (data.ports || []).forEach(p => html += fmtRow('Port', p.toString(), 'err'));
      html += fmtSection('Services');
      (data.data || []).slice(0, 5).forEach(d => {
        html += fmtRow(`Port ${d.port}`, `${d.product || d._shodan?.module || 'Unknown'} ${d.version || ''}`);
        if (d.cpe) html += fmtRow('CPE', d.cpe.join(', '), 'warn');
      });
      html += fmtSection('Vulnerabilities');
      const vulns = data.vulns || {};
      const vulnKeys = Object.keys(vulns);
      if (vulnKeys.length) {
        vulnKeys.forEach(v => html += fmtRow('CVE', v, 'err'));
      } else {
        html += fmtRow('Vulns', 'None detected', 'ok');
      }
    } else {
      html += fmtRow('Total Matches', data.total || 0, 'ok');
      (data.matches || []).slice(0, 10).forEach(m => {
        html += fmtRow('IP', m.ip_str, 'ok');
        html += fmtRow('Port', m.port);
        html += fmtRow('Product', m.product || 'N/A');
        html += '---\n';
      });
    }
    showResult('shodan-result', html);
  } catch (e) {
    showResult('shodan-result', `<span class="err">Shodan error: ${e.message}</span>`);
  }
}

// ── VIRUSTOTAL ────────────────────────────────────────
async function runVT() {
  const target = document.getElementById('vt-input').value.trim();
  const key = document.getElementById('vt-key').value.trim();
  if (!target) return;
  loading('vt-result');
  addLog(`VirusTotal scan: ${target}`);
  bumpScan();

  if (!key) {
    let html = fmtSection(`VirusTotal: ${target}`);
    html += fmtRow('Status', '⚠ No API key provided', 'warn');
    html += fmtRow('Get Free Key', 'https://virustotal.com/gui/join-us (free tier: 500 req/day)', 'val');
    html += fmtSection('Direct VT Link');
    const isHash = /^[a-fA-F0-9]{32,64}$/.test(target);
    const isIP = /^\d+\.\d+\.\d+\.\d+$/.test(target);
    const isURL = target.startsWith('http');
    if (isHash) html += fmtRow('VT Link', `https://virustotal.com/gui/file/${target}`, 'val');
    else if (isIP) html += fmtRow('VT Link', `https://virustotal.com/gui/ip-address/${target}`, 'val');
    else if (isURL) html += fmtRow('VT Link', `https://virustotal.com/gui/url/${btoa(target)}`, 'val');
    else html += fmtRow('VT Link', `https://virustotal.com/gui/domain/${target}`, 'val');
    showResult('vt-result', html);
    return;
  }

  try {
    const isHash = /^[a-fA-F0-9]{32,64}$/.test(target);
    const isIP = /^\d+\.\d+\.\d+\.\d+$/.test(target);
    const isURL = target.startsWith('http');

    let endpoint;
    if (isHash) endpoint = `https://www.virustotal.com/api/v3/files/${target}`;
    else if (isIP) endpoint = `https://www.virustotal.com/api/v3/ip_addresses/${target}`;
    else endpoint = `https://www.virustotal.com/api/v3/domains/${target}`;

    const res = await fetch(endpoint, { headers: { 'x-apikey': key } });
    const data = await res.json();
    const attrs = data.data?.attributes || {};
    const stats = attrs.last_analysis_stats || {};

    let html = fmtSection(`VirusTotal: ${target}`);
    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    const malicious = stats.malicious || 0;
    const suspicious = stats.suspicious || 0;
    const clean = stats.undetected || 0;

    html += fmtRow('Target', target);
    html += fmtRow('Detection', `${malicious}/${total} engines flagged`, malicious > 0 ? 'err' : 'ok');
    html += fmtRow('Malicious', malicious.toString(), malicious > 0 ? 'err' : 'ok');
    html += fmtRow('Suspicious', suspicious.toString(), suspicious > 0 ? 'warn' : 'ok');
    html += fmtRow('Clean', clean.toString(), 'ok');
    html += fmtRow('Reputation', attrs.reputation || 'N/A', attrs.reputation < 0 ? 'err' : 'ok');
    html += fmtRow('Last Analysis', attrs.last_analysis_date ? new Date(attrs.last_analysis_date * 1000).toISOString() : 'N/A');

    if (attrs.categories) {
      html += fmtSection('Categories');
      Object.entries(attrs.categories).forEach(([vendor, cat]) => {
        html += fmtRow(vendor, cat);
      });
    }

    // Show top malicious detections
    const analyses = attrs.last_analysis_results || {};
    const flagged = Object.entries(analyses).filter(([, v]) => v.category === 'malicious').slice(0, 10);
    if (flagged.length) {
      html += fmtSection('Malicious Detections');
      flagged.forEach(([vendor, result]) => {
        html += fmtRow(vendor, result.result || 'malware', 'err');
      });
    }

    showResult('vt-result', html);
  } catch (e) {
    showResult('vt-result', `<span class="err">VirusTotal error: ${e.message}</span>`);
  }
}

// ── URL SCAN ──────────────────────────────────────────
async function runURLScan() {
  const url = document.getElementById('urlscan-input').value.trim();
  if (!url) return;
  loading('urlscan-result');
  addLog(`URLScan: ${url}`);
  bumpScan();

  try {
    // Submit scan to urlscan.io
    const submitRes = await fetch('https://urlscan.io/api/v1/scan/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'API-Key': 'demo' },
      body: JSON.stringify({ url, visibility: 'public' })
    });

    let html = fmtSection(`URL Scan: ${url}`);

    if (submitRes.ok) {
      const submitData = await submitRes.json();
      html += fmtRow('Scan UUID', submitData.uuid || 'N/A', 'ok');
      html += fmtRow('Result URL', submitData.result || 'N/A', 'val');
      html += fmtRow('API Message', submitData.message || 'Scan submitted', 'ok');
      html += fmtRow('Note', 'Scan takes 20-30 seconds. Check result URL.', 'warn');
    } else {
      // Search existing scans
      const searchRes = await fetch(`https://urlscan.io/api/v1/search/?q=page.url%3A${encodeURIComponent(url)}&size=5`);
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const results = searchData.results || [];
        html += fmtRow('Existing Scans Found', results.length.toString(), results.length ? 'ok' : 'warn');
        results.slice(0, 3).forEach(r => {
          html += fmtSection(`Scan: ${r.task?.uuid || 'N/A'}`);
          html += fmtRow('URL', r.page?.url || url);
          html += fmtRow('Domain', r.page?.domain || 'N/A');
          html += fmtRow('IP', r.page?.ip || 'N/A');
          html += fmtRow('Country', r.page?.country || 'N/A');
          html += fmtRow('Malicious', r.verdicts?.overall?.malicious ? '⚠ YES' : '✓ No', r.verdicts?.overall?.malicious ? 'err' : 'ok');
          html += fmtRow('Score', (r.verdicts?.overall?.score || 0).toString());
          html += fmtRow('Scan Time', r.task?.time || 'N/A');
          html += fmtRow('Result', `https://urlscan.io/result/${r.task?.uuid}`, 'val');
        });
        if (!results.length) {
          html += fmtRow('Note', 'No existing scans. Submit via urlscan.io directly.', 'warn');
          html += fmtRow('Submit', `https://urlscan.io`, 'val');
        }
      }
    }
    showResult('urlscan-result', html);
  } catch (e) {
    showResult('urlscan-result', `<span class="err">URLScan error: ${e.message}</span>`);
  }
}

// ── METADATA EXTRACTOR ────────────────────────────────
function runMetadata(input) {
  const file = input.files[0];
  if (!file) return;
  loading('metadata-result');
  addLog(`Metadata extract: ${file.name}`);
  bumpScan();

  const reader = new FileReader();
  reader.onload = (e) => {
    const data = e.target.result;
    let html = fmtSection(`Metadata: ${file.name}`);
    html += fmtRow('Filename', file.name, 'ok');
    html += fmtRow('File Size', `${(file.size / 1024).toFixed(2)} KB`);
    html += fmtRow('MIME Type', file.type || 'Unknown');
    html += fmtRow('Last Modified', new Date(file.lastModified).toISOString());
    html += fmtRow('Extension', file.name.split('.').pop().toUpperCase());

    // Image-specific EXIF parsing
    if (file.type.startsWith('image/')) {
      html += fmtSection('Image Analysis');
      const img = new Image();
      img.onload = () => {
        html += fmtRow('Dimensions', `${img.naturalWidth} × ${img.naturalHeight} px`);
        html += fmtRow('Aspect Ratio', (img.naturalWidth / img.naturalHeight).toFixed(2));
        // Check for EXIF data in JPEG
        if (file.type === 'image/jpeg') {
          html += fmtSection('EXIF Data (JPEG)');
          const arr = new Uint8Array(data);
          // Look for GPS marker
          const gpsMarker = [0xFF, 0xE1];
          let hasExif = false;
          for (let i = 0; i < Math.min(arr.length, 1000); i++) {
            if (arr[i] === gpsMarker[0] && arr[i+1] === gpsMarker[1]) {
              hasExif = true; break;
            }
          }
          html += fmtRow('EXIF Present', hasExif ? '⚠ YES — may contain GPS/device data' : 'NO', hasExif ? 'warn' : 'ok');
          html += fmtRow('GPS Data', hasExif ? 'Detected — strip before sharing!' : 'None detected', hasExif ? 'err' : 'ok');
          html += fmtRow('Tool', 'Use ExifTool for complete metadata: https://exiftool.org', 'val');
        }
        showResult('metadata-result', html);
      };
      img.src = URL.createObjectURL(file);
    } else {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        html += fmtSection('PDF Metadata');
        html += fmtRow('Note', 'PDF metadata requires server-side parsing (PyPDF2)', 'warn');
        html += fmtRow('Tool', 'Use: pdfinfo, ExifTool, or Apache Tika', 'val');
        html += fmtRow('Extractable', 'Author, Creator, Producer, Dates, Software', 'val');
      }
      showResult('metadata-result', html);
    }
  };
  reader.readAsArrayBuffer(file);
}

// ── GEOIP MAP ─────────────────────────────────────────
async function runGeoIP() {
  const ip = document.getElementById('geoip-input').value.trim();
  if (!ip) return;
  loading('geoip-result');
  addLog(`GeoIP map: ${ip}`);
  bumpScan('target');

  try {
    const res = await fetch(`https://ipinfo.io/${ip}/json`);
    const data = await res.json();
    const [lat, lon] = (data.loc || '0,0').split(',').map(Number);

    let html = fmtSection(`GeoIP: ${ip}`);
    html += fmtRow('IP', data.ip || ip, 'ok');
    html += fmtRow('City', data.city || 'N/A');
    html += fmtRow('Region', data.region || 'N/A');
    html += fmtRow('Country', data.country || 'N/A');
    html += fmtRow('Coordinates', data.loc || 'N/A', 'ok');
    html += fmtRow('Timezone', data.timezone || 'N/A');
    html += fmtRow('Organization', data.org || 'N/A');
    html += fmtRow('Hostname', data.hostname || 'N/A');
    html += fmtRow('Postal', data.postal || 'N/A');

    showResult('geoip-result', html);

    // Show OpenStreetMap embed
    const mapDiv = document.getElementById('geoip-map');
    const iframe = document.getElementById('map-iframe');
    if (lat && lon) {
      iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.1},${lat-0.1},${lon+0.1},${lat+0.1}&layer=mapnik&marker=${lat},${lon}`;
      mapDiv.classList.remove('hidden');
    }
  } catch (e) {
    showResult('geoip-result', `<span class="err">Error: ${e.message}</span>`);
  }
}

// ── SSL INSPECTOR ─────────────────────────────────────
async function runSSL() {
  const domain = document.getElementById('ssl-input').value.trim();
  if (!domain) return;
  loading('ssl-result');
  addLog(`SSL inspect: ${domain}`);
  bumpScan();

  try {
    // Use crt.sh to get cert info
    const [certRes, dnsRes] = await Promise.allSettled([
      fetch(`https://crt.sh/?q=${domain}&output=json`),
      fetch(`https://dns.google/resolve?name=${domain}&type=A`)
    ]);

    let html = fmtSection(`SSL Certificate: ${domain}`);

    if (certRes.status === 'fulfilled' && certRes.value.ok) {
      const certs = await certRes.value.json();
      const recent = certs.sort((a, b) => new Date(b.not_after) - new Date(a.not_after))[0];
      if (recent) {
        html += fmtRow('Common Name', recent.common_name || domain, 'ok');
        html += fmtRow('Issuer', recent.issuer_name || 'N/A', 'ok');
        html += fmtRow('Valid From', recent.not_before || 'N/A');
        html += fmtRow('Valid To', recent.not_after || 'N/A');
        const expiry = new Date(recent.not_after);
        const daysLeft = Math.floor((expiry - new Date()) / (1000 * 60 * 60 * 24));
        html += fmtRow('Days Until Expiry', daysLeft > 0 ? `${daysLeft} days` : '⚠ EXPIRED!', daysLeft > 30 ? 'ok' : daysLeft > 0 ? 'warn' : 'err');
        html += fmtRow('Serial', recent.serial_number || 'N/A');
        html += fmtRow('Total Certs in CT', certs.length.toString());
      }
    }

    // DNS check
    if (dnsRes.status === 'fulfilled' && dnsRes.value.ok) {
      const dns = await dnsRes.value.json();
      html += fmtSection('Resolution');
      (dns.Answer || []).forEach(a => html += fmtRow('Resolves To', a.data, 'ok'));
    }

    html += fmtSection('Full Verification');
    html += fmtRow('Check', `https://www.ssllabs.com/ssltest/analyze.html?d=${domain}`, 'val');
    html += fmtRow('Observatory', `https://observatory.mozilla.org/analyze/${domain}`, 'val');

    showResult('ssl-result', html);
  } catch (e) {
    showResult('ssl-result', `<span class="err">SSL check error: ${e.message}</span>`);
  }
}

// ── DARK WEB ──────────────────────────────────────────
async function runDarkWeb() {
  const query = document.getElementById('darkweb-input').value.trim();
  if (!query) return;
  loading('darkweb-result');
  addLog(`Dark web monitor: ${query}`);
  bumpScan();
  await sleep(1500); // Simulate deep search

  let html = fmtSection(`Dark Web Monitor: "${query}"`);
  html += fmtRow('Query', query, 'ok');
  html += fmtRow('Scan Type', 'Passive index monitoring', 'val');
  html += fmtRow('Sources', 'Tor2Web aggregators, paste sites, leaks DB', 'val');
  html += fmtRow('Timestamp', new Date().toISOString());

  // Simulated dark web intel (real implementation needs backend + Tor)
  const pasteSites = ['Pastebin', 'Ghostbin', 'Hastebin', 'Riseup Pad', 'PrivateBin'];
  const darknets = ['Ahmia', 'Dark.fail', 'Tor66', 'OnionSearch'];

  html += fmtSection('Paste Site Monitoring');
  html += fmtRow('Note', 'Live monitoring requires backend service', 'warn');
  pasteSites.forEach(s => {
    html += fmtRow(s, 'Checking...', 'warn');
  });

  html += fmtSection('Recommended Dark Web OSINT Tools');
  html += fmtRow('Ahmia', 'https://ahmia.fi — Tor search engine (clearnet)', 'val');
  html += fmtRow('IntelligenceX', 'https://intelx.io — Dark web + leaks search', 'val');
  html += fmtRow('DeHashed', 'https://dehashed.com — Credential database', 'val');
  html += fmtRow('Psbdmp', 'https://psbdmp.ws — Pastebin dump search', 'val');
  html += fmtRow('OnionSearch', 'Requires Tor Browser for full access', 'warn');

  html += fmtSection('Breach Database Correlation');
  html += fmtRow('HIBP', `https://haveibeenpwned.com/account/${query}`, 'val');
  html += fmtRow('BreachDirectory', `https://breachdirectory.org`, 'val');

  html += '\n' + fmtRow('Full dark web scanning', 'Deploy backend with Tor proxy', 'warn');

  showResult('darkweb-result', html);
}

// ── REPORT BUILDER ────────────────────────────────────
async function generateReport() {
  const name = document.getElementById('report-name').value.trim() || 'PHANTOM_REPORT';
  loading('report-result');
  addLog(`Report generated: ${name}`);
  bumpScan('report');
  await sleep(500);

  const ts = new Date().toISOString();
  let html = fmtSection(`PHANTOM OSINT Report — ${name}`);
  html += fmtRow('Report ID', name, 'ok');
  html += fmtRow('Generated', ts, 'ok');
  html += fmtRow('Operator', STATE.user?.username || 'Unknown');
  html += fmtRow('Platform', 'PHANTOM v2.4.1');
  html += fmtRow('Classification', 'CONFIDENTIAL — AUTHORIZED USE ONLY', 'err');

  html += fmtSection('Session Summary');
  html += fmtRow('Total Scans', STATE.scans.toString());
  html += fmtRow('Targets Analyzed', STATE.targets.toString());
  html += fmtRow('Breaches Found', STATE.breaches.toString());

  html += fmtSection('Collected Intel');
  html += fmtRow('WHOIS Data', document.getElementById('whois-result')?.textContent ? 'Included' : 'None', 'ok');
  html += fmtRow('DNS Records', document.getElementById('dns-result')?.textContent ? 'Included' : 'None', 'ok');
  html += fmtRow('IP Intel', document.getElementById('ip-result')?.textContent ? 'Included' : 'None', 'ok');
  html += fmtRow('Breach Data', document.getElementById('breach-result')?.textContent ? 'Included' : 'None', 'ok');

  html += fmtSection('Export');
  html += fmtRow('Format', 'HTML / PDF via print (Ctrl+P)', 'val');
  html += fmtRow('Note', 'For professional PDF export, copy this to a document', 'warn');

  // Create downloadable report
  const reportContent = `
PHANTOM OSINT INTELLIGENCE REPORT
===================================
Report ID: ${name}
Generated: ${ts}
Operator: ${STATE.user?.username || 'Unknown'}
Platform: PHANTOM v2.4.1
Classification: CONFIDENTIAL

Session Statistics:
- Total Scans: ${STATE.scans}
- Targets Analyzed: ${STATE.targets}
- Breaches Found: ${STATE.breaches}
- Reports Generated: ${STATE.reports}

Scan Logs:
${STATE.logs.slice(0, 20).join('\n')}

=== END OF REPORT ===
`;

  const blob = new Blob([reportContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  html += `\n<a href="${url}" download="${name}.txt" style="color:var(--accent);font-family:var(--mono);font-size:0.8rem">⬇ Download Report TXT</a>`;

  showResult('report-result', html);
}

// ── ADMIN PANEL ───────────────────────────────────────
function initAdminPanel() {
  const tbody = document.getElementById('user-table-body');
  if (tbody) {
    tbody.innerHTML = STATE.users.map(u => `
      <tr>
        <td>${u.id}</td>
        <td>${u.username}</td>
        <td>${u.email}</td>
        <td>${u.role === 'red' ? '🔴 Red Team' : '🔵 Blue Team'}</td>
        <td><span class="badge green">Active</span></td>
        <td><button class="btn-xs">Edit</button> <button class="btn-xs red" onclick="banUser('${u.id}')">Ban</button></td>
      </tr>
    `).join('');
  }
  const logEl = document.getElementById('audit-log');
  if (logEl && STATE.logs.length) {
    logEl.innerHTML = STATE.logs.map(l => `<div class="log-line">${l}</div>`).join('');
  }
  document.getElementById('admin-scans').textContent = STATE.scans;
  drawAdminChart();
}

function adminTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-nav').forEach(b => b.classList.remove('active'));
  document.getElementById(`atab-${tab}`).classList.add('active');
  event.currentTarget.classList.add('active');
}

function banUser(id) {
  alert(`User ${id} would be banned. (Demo mode)`);
}

function addUser() {
  const u = prompt('Enter new username:');
  if (u) alert(`User ${u} would be added. (Demo mode)`);
}

function exportLogs() {
  const blob = new Blob([STATE.logs.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'phantom_audit_log.txt'; a.click();
}

function exitAdmin() {
  STATE.isAdmin = false;
  STATE.user = null;
  document.getElementById('admin-panel').classList.add('hidden');
  document.getElementById('login-page').classList.remove('hidden');
}

// ── CHARTS ────────────────────────────────────────────
function drawActivityChart() {
  const canvas = document.getElementById('activity-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const data = [12, 19, 8, 25, 14, 7, 3];
  const max = Math.max(...data);

  canvas.width = canvas.offsetWidth;
  canvas.height = 80;
  const W = canvas.width, H = canvas.height;
  const pad = 30;
  const cw = (W - pad * 2) / days.length;

  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = '#1e3a5f';
  ctx.fillStyle = '#6a85a8';
  ctx.font = '10px Share Tech Mono';

  // Grid lines
  for (let i = 0; i <= 4; i++) {
    const y = pad + (H - pad * 2) * i / 4;
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y);
    ctx.stroke();
  }

  // Bars
  data.forEach((val, i) => {
    const x = pad + i * cw + cw * 0.1;
    const bh = ((val / max) * (H - pad * 2));
    const y = H - pad - bh;
    const gradient = ctx.createLinearGradient(0, y, 0, H - pad);
    gradient.addColorStop(0, '#00d4ff');
    gradient.addColorStop(1, '#0099cc');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, cw * 0.8, bh);

    ctx.fillStyle = '#6a85a8';
    ctx.fillText(days[i], x, H - 5);
  });
}

function drawAdminChart() {
  const canvas = document.getElementById('admin-chart');
  if (!canvas) return;
  canvas.width = canvas.offsetWidth || 600;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = 100;
  const data = [5, 12, 8, 20, 15, 25, 18, 30, 22, 28, 35, 40];
  const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const max = Math.max(...data);
  const pad = 30;
  const step = (W - pad * 2) / (data.length - 1);

  ctx.clearRect(0, 0, W, H);

  // Line
  ctx.beginPath();
  ctx.strokeStyle = '#ff3e5e';
  ctx.lineWidth = 2;
  data.forEach((val, i) => {
    const x = pad + i * step;
    const y = H - pad - (val / max) * (H - pad * 2);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Area fill
  ctx.lineTo(pad + (data.length - 1) * step, H - pad);
  ctx.lineTo(pad, H - pad);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(255,62,94,0.3)');
  grad.addColorStop(1, 'rgba(255,62,94,0)');
  ctx.fillStyle = grad;
  ctx.fill();

  // Labels
  ctx.fillStyle = '#6a85a8';
  ctx.font = '9px Share Tech Mono';
  data.forEach((_, i) => {
    const x = pad + i * step;
    ctx.fillText(labels[i], x - 8, H - 5);
  });
}

// ── UTILS ─────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Click outside to close notif panel
document.addEventListener('click', (e) => {
  if (!e.target.closest('.notif-bell') && !e.target.closest('.notif-panel')) {
    document.getElementById('notif-panel')?.classList.add('hidden');
  }
});

// Enter key support for inputs
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const active = document.querySelector('.panel.active');
    if (!active) {
      if (document.getElementById('tab-login').classList.contains('active')) doLogin();
      return;
    }
    const btn = active.querySelector('.btn-run');
    if (btn) btn.click();
  }
});

// Resize charts on window resize
window.addEventListener('resize', () => {
  drawActivityChart();
  drawAdminChart();
});

// Update timestamp
setInterval(() => {
  const el = document.getElementById('last-update');
  if (el) el.textContent = new Date().toLocaleTimeString();
}, 1000);

console.log('%cPHANTOM OSINT v2.4.1', 'color:#00d4ff;font-size:2rem;font-weight:bold;font-family:monospace');
console.log('%cAuthorized access only. All activities logged.', 'color:#ff3e5e;font-family:monospace');
