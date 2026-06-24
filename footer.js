(function () {
  var LS = 'color:#009EDB;text-decoration:none;';

  var footer = document.createElement('footer');
  footer.style.cssText = 'border-top:1px solid #e2e8f0;color:#64748b;font-size:11px;margin-top:40px;padding:20px;text-align:center;';
  footer.innerHTML =
    '<div style="margin-bottom:10px;">' +
      '<a href="https://unmask.tools" title="institutional language tracker">' +
        '<img src="https://api.unmask.tools/counter"' +
            ' alt="phrases unmasked — unmask.tools"' +
            ' height="20" style="vertical-align:middle;">' +
      '</a>' +
      '<span id="footer-counter" style="margin-left:10px;font-size:11px;color:#64748b;vertical-align:middle;"></span>' +
    '</div>' +
    'unmask.tools &nbsp;·&nbsp; Data collected with user consent &nbsp;·&nbsp; No personal data stored &nbsp;·&nbsp;' +
    '<br style="display:none;" class="footer-br">' +
    ' Legal anchors: Geneva AP I &nbsp;·&nbsp; Rome Statute &nbsp;·&nbsp; UDHR &nbsp;·&nbsp; Planetary Boundaries &nbsp;·&nbsp;' +
    '<br>' +
    '<a href="/privacy.html" style="' + LS + '">Privacy Policy</a> &nbsp;·&nbsp;' +
    '<a href="/terms.html"   style="' + LS + '">Terms of Service</a> &nbsp;·&nbsp;' +
    '<a href="/imprint.html" style="' + LS + '">Imprint</a>';

  document.body.appendChild(footer);

  // Distinct URL so browser cache doesn't collide with the SVG badge request
  fetch('https://api.unmask.tools/counter?format=json',
        { headers: { Accept: 'application/json' } })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      var el = document.getElementById('footer-counter');
      if (el && d.unique_phrases != null)
        el.textContent =
          d.unique_phrases.toLocaleString('en') + ' unique phrases · ' +
          d.total_detected.toLocaleString('en') + ' total detections';
    })
    .catch(function () {});
})();
