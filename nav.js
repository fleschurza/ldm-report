(function () {
  var PAGE   = document.body.dataset.page     || '';
  var SUB    = document.body.dataset.subtitle || '';

  var PAGES = [
    { id: 'report',    href: '/index.html',     label: 'Report' },
    { id: 'pricing',   href: '/pricing.html',   label: 'Pricing' },
    { id: 'docs',      href: '/docs.html',      label: 'FAQ' },
    { id: 'templates', href: '/templates.html', label: 'Templates' },
    { id: 'platforms', href: '/tools.html',     label: 'Platforms' },
    { id: 'help',      href: '/support.html',   label: 'Help' },
    { id: 'dataroom',  href: '/dataroom.html',  label: 'Data Room' },
  ];

  var S_INACTIVE = 'color:#94a3b8;font-size:12px;font-weight:500;text-decoration:none;padding:5px 12px;border-radius:6px;border:1px solid transparent;';
  var S_ACTIVE   = 'color:#fff;font-size:12px;font-weight:600;text-decoration:none;padding:5px 12px;border-radius:6px;background:rgba(0,158,219,0.25);border:1px solid #009EDB;';
  var S_TRY      = 'color:#009EDB;font-size:12px;font-weight:600;text-decoration:none;padding:5px 12px;border-radius:6px;border:1px solid rgba(0,158,219,0.4);';

  var navLinks = PAGES.map(function (p) {
    var s = p.id === PAGE ? S_ACTIVE : S_INACTIVE;
    return '<a href="' + p.href + '" style="' + s + '">' + p.label + '</a>';
  }).join('');

  var tryStyle = PAGE === 'register' ? S_ACTIVE : S_TRY;

  var subtitleHtml = SUB
    ? '<p style="color:#94a3b8;font-size:12px;margin-top:5px;max-width:640px;">' + SUB + '</p>'
    : '';

  var S_ACCOUNT = 'color:#94a3b8;font-size:12px;font-weight:500;text-decoration:none;display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:6px;border:1px solid transparent;transition:color 0.15s,border-color 0.15s;';
  var accountActive = PAGE === 'account';
  var S_ACCOUNT_FINAL = accountActive
    ? 'color:#fff;font-size:12px;font-weight:600;text-decoration:none;display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:6px;border:1px solid rgba(148,163,184,0.4);'
    : S_ACCOUNT;

  document.write(
    '<style>' +
    '#site-nav{background:#1a1a4e;color:#f1f5f9;padding:28px 40px 24px;border-bottom:3px solid #009EDB;}' +
    '@media(max-width:640px){#site-nav{padding:18px 16px 16px;}#site-nav h1{font-size:16px !important;}#site-nav svg.logo{width:32px !important;height:32px !important;}#site-nav .acct-label{display:none;}}' +
    '#site-nav a.acct:hover{color:#fff !important;border-color:rgba(148,163,184,0.4) !important;}' +
    '</style>' +
    '<header id="site-nav">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">' +
    '<div style="display:flex;align-items:center;gap:14px;">' +
    '<svg class="logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="44" height="44" style="flex-shrink:0;">' +
    '<path d="M64 4 L116 22 L116 68 C116 100 92 120 64 126 C36 120 12 100 12 68 L12 22 Z" fill="#3ec6f5" opacity="0.21" stroke="#3ec6f5" stroke-width="7" stroke-linejoin="round"/>' +
    '<text x="64" y="100" text-anchor="middle" font-family="Roboto,sans-serif" font-weight="900" font-size="94" fill="#ffffff">U</text>' +
    '</svg>' +
    '<h1 style="font-size:20px;font-weight:700;letter-spacing:-0.02em;">unmask<span style="color:#009EDB;font-weight:400;">.tools</span> &middot; Language Detection Intelligence</h1>' +
    '</div>' +
    '<a href="/account.html" class="acct" style="' + S_ACCOUNT_FINAL + '">' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>' +
    '<span class="acct-label">My Account</span>' +
    '</a>' +
    '</div>' +
    subtitleHtml +
    '<nav style="margin-top:14px;display:flex;gap:4px;flex-wrap:wrap;">' +
    navLinks +
    '<a href="/register.html" style="' + tryStyle + '">Try for free</a>' +
    '<a href="/feed.xml" style="color:#f97316;font-size:12px;font-weight:600;text-decoration:none;padding:5px 12px;border-radius:6px;border:1px solid rgba(249,115,22,0.4);display:flex;align-items:center;gap:5px;" title="Subscribe to RSS feed">' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/></svg>' +
    ' RSS</a>' +
    '</nav>' +
    '</header>'
  );
})();
