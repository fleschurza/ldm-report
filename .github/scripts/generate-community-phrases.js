const https = require('https');
const fs    = require('fs');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY');
  process.exit(1);
}

const path = `/rest/v1/confirmation_events?select=normalized_phrase,phrase,translation,legal_ref,severity,isic_section,isic_label,domain&order=normalized_phrase&limit=5000`;
const host = SUPABASE_URL.replace('https://', '');

const options = {
  hostname: host,
  path,
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    let events;
    try {
      events = JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse Supabase response:', data.slice(0, 200));
      process.exit(1);
    }

    if (!Array.isArray(events)) {
      console.error('Unexpected response:', JSON.stringify(events).slice(0, 200));
      process.exit(1);
    }

    console.log(`Fetched ${events.length} confirmation events`);

    // Aggregate by normalized_phrase
    const map = {};
    for (const e of events) {
      const key = e.normalized_phrase;
      if (!key) continue;
      if (!map[key]) {
        map[key] = {
          phrase:      e.phrase,
          translation: e.translation || '',
          legalRef:    e.legal_ref   || '',
          severity:    e.severity    || 'medium',
          isicSection: e.isic_section || null,
          isicLabel:   e.isic_label   || null,
          confirmCount: 0,
          domains: new Set(),
        };
      }
      map[key].confirmCount++;
      if (e.domain) map[key].domains.add(e.domain);
    }

    // Promote: confirmed >= 3 times across >= 3 distinct domains
    const promoted = Object.entries(map)
      .filter(([, p]) => p.confirmCount >= 3 && p.domains.size >= 3)
      .map(([key, p]) => ({
        phrase:         p.phrase,
        normalizedPhrase: key,
        translation:    p.translation,
        legalRef:       p.legalRef,
        severity:       p.severity,
        isicSection:    p.isicSection,
        isicLabel:      p.isicLabel,
        confirmCount:   p.confirmCount,
        domainCount:    p.domains.size,
        sourceLanguage: 'en',
        isGlobal:       true,
      }))
      .sort((a, b) => b.confirmCount - a.confirmCount);

    console.log(`Promoted ${promoted.length} phrases (>= 3 confirms, >= 3 domains)`);

    const output = {
      generated:  new Date().toISOString(),
      count:      promoted.length,
      minConfirms: 3,
      minDomains:  3,
      phrases:    promoted,
    };

    fs.writeFileSync('community-phrases.json', JSON.stringify(output, null, 2));
    console.log('Written community-phrases.json');
  });
}).on('error', (e) => {
  console.error('HTTPS error:', e.message);
  process.exit(1);
});
