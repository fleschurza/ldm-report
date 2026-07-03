/**
 * unmask stub test core
 * Shared by all platform stubs. Each stub defines:
 *   window.STUB_CONFIG = {
 *     platform:    string,
 *     readSels:    string[],
 *     composeSels: string[],
 *     composeInIframeSel: string|null,  // e.g. Proton Mail
 *     noCompose:   bool,                // e.g. SharePoint
 *   }
 */

const TEST_PHRASES = [
  { phrase: 'collateral damage',                severity: 'critical' },
  { phrase: 'enhanced interrogation techniques', severity: 'critical' },
  { phrase: 'enhanced interrogation',            severity: 'critical' },
  { phrase: 'targeted killing',                  severity: 'high'     },
  { phrase: 'neutralise',                        severity: 'medium'   },
];

const AUTO_INJECT_PHRASE = 'collateral damage';

// ── DOM helpers ────────────────────────────────────────────────────────

function findFirst(sels, root = document) {
  for (const s of sels) {
    const el = root.querySelector(s);
    if (el) return el;
  }
  return null;
}

function highlightIn(root) {
  const phrases = [...TEST_PHRASES].sort((a, b) => b.phrase.length - a.phrase.length);
  let count = 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let n;
  while ((n = walker.nextNode())) nodes.push(n);

  for (const node of nodes) {
    let remaining = node.textContent;
    let matched = null;
    for (const p of phrases) {
      const idx = remaining.toLowerCase().indexOf(p.phrase.toLowerCase());
      if (idx === -1) continue;
      matched = { p, idx };
      break;
    }
    if (!matched) continue;
    const { p, idx } = matched;
    const frag = document.createDocumentFragment();
    if (idx > 0) frag.appendChild(document.createTextNode(remaining.slice(0, idx)));
    const mark = document.createElement('mark');
    mark.className = 'ldm-flagged';
    mark.dataset.severity = p.severity;
    mark.textContent = remaining.slice(idx, idx + p.phrase.length);
    frag.appendChild(mark);
    frag.appendChild(document.createTextNode(remaining.slice(idx + p.phrase.length)));
    node.parentNode.replaceChild(frag, node);
    count++;
  }
  return count;
}

function scanText(text) {
  const phrases = [...TEST_PHRASES].sort((a, b) => b.phrase.length - a.phrase.length);
  return phrases.filter(p => text.toLowerCase().includes(p.phrase.toLowerCase()));
}

// ── UI helpers ─────────────────────────────────────────────────────────

function setResult(id, pass, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'result ' + (pass ? 'pass' : 'fail');
  el.textContent = (pass ? '✓ ' : '✗ ') + msg;
}

function setBadge(count) {
  const b = document.getElementById('compose-badge');
  if (!b) return;
  b.textContent = count;
  b.classList.toggle('visible', count > 0);
  const counter = document.getElementById('badge-count');
  if (counter) counter.textContent = count;
}

// ── Main runner ────────────────────────────────────────────────────────

function runStub() {
  const cfg = window.STUB_CONFIG;

  // 1. readSel
  const readRoot = findFirst(cfg.readSels);
  setResult('result-read-sel', !!readRoot, readRoot ? 'readSel matches DOM' : 'readSel found nothing — selector broken');

  // 2. Read scan
  let readCount = 0;
  if (readRoot) {
    readCount = highlightIn(readRoot);
    setResult('result-read-scan', readCount > 0, readCount > 0 ? `${readCount} phrase(s) highlighted` : 'no phrases flagged — check readSel scope');
  }

  function report(rc, cc) {
    window.parent?.postMessage({
      unmaskTest: true,
      platform:     cfg.platform,
      readPass:     rc > 0,
      composePass:  cc > 0,
      readCount:    rc,
      composeCount: cc,
    }, '*');
  }
  setTimeout(() => report(readCount, 0), 800);

  // 3. Compose (auto-pass for general sites; defer if compose is in an iframe)
  if (cfg.noCompose) {
    setResult('result-compose-sel', true, 'composeSel — general site (n/a)');
    setResult('result-compose',     true, 'compose — general site (n/a)');
    return;
  }

  function doCompose(composeBox) {
    setResult('result-compose-sel', !!composeBox, composeBox ? 'composeSel matches DOM' : 'composeSel found nothing — selector broken');
    if (!composeBox) return;

    const update = () => {
      const found = scanText(composeBox.innerText || composeBox.textContent || '');
      setBadge(found.length);
      setResult('result-compose', found.length > 0,
        found.length > 0 ? `"${found[0].phrase}" detected in compose` : 'compose: no phrase detected');
      report(readCount, found.length);
    };
    composeBox.addEventListener('input', update);

    // Auto-inject after short delay so the observer is wired up first
    setTimeout(() => {
      composeBox.textContent = AUTO_INJECT_PHRASE;
      composeBox.dispatchEvent(new Event('input', { bubbles: true }));
    }, 600);
  }

  if (cfg.composeInIframeSel) {
    const iframe = document.querySelector(cfg.composeInIframeSel);
    if (!iframe) {
      setResult('result-compose-sel', false, 'composeSel — compose iframe not found');
      return;
    }
    const tryIframe = () => {
      try {
        const iDoc = iframe.contentDocument || iframe.contentWindow?.document;
        doCompose(findFirst(cfg.composeSels, iDoc));
      } catch (_) {
        setResult('result-compose-sel', false, 'composeSel — iframe access failed');
      }
    };
    // srcdoc iframes may or may not be ready synchronously — check first
    if (iframe.contentDocument?.readyState === 'complete') {
      tryIframe();
    } else {
      iframe.addEventListener('load', tryIframe);
    }
  } else {
    doCompose(findFirst(cfg.composeSels));
  }
}

function injectBanner() {
  var banner = document.createElement('div');
  banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#1a1a4e;color:#fff;font-size:12px;padding:8px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;font-family:-apple-system,sans-serif;';
  banner.innerHTML =
    '<span>🧪 <strong>unmask.shield test page</strong> — this simulates ' + (window.STUB_CONFIG?.platform || 'a platform') + '. ' +
    'If unmask.shield is installed, you should see phrases highlighted below and counts in the extension popup.</span>' +
    '<a href="/support.html" style="color:#009EDB;text-decoration:none;white-space:nowrap;font-weight:600;">← Back to support</a>';
  document.body.insertBefore(banner, document.body.firstChild);
  document.body.style.paddingTop = '37px';
}

// stub-core.js loads at end of <body> — DOM is already parsed, call directly
injectBanner();
runStub();
