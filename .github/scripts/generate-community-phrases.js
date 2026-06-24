const https = require('https');
const fs    = require('fs');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY');
  process.exit(1);
}

// Tiered promotion thresholds — must match promote-community-phrases.mjs
const TIER_THRESHOLDS = {
  critical: { confirms: 2, domains: 1 },
  high:     { confirms: 3, domains: 2 },
  medium:   { confirms: 3, domains: 3 },
};

function meetsThreshold(row) {
  const t = TIER_THRESHOLDS[row.severity] || TIER_THRESHOLDS.medium;
  return row.confirm_count >= t.confirms && row.domain_count >= t.domains;
}

// Read from global_index (not raw confirmation_events) so that:
// - active = false deactivations are respected
// - only enriched, curated phrases are distributed
// - phrases the promote script added are included automatically
const apiPath =
  `/rest/v1/global_index` +
  `?select=phrase,normalized_phrase,translation,legal_ref,severity,confirm_count,domain_count,confidence_score,active,lang` +
  `&active=eq.true` +
  `&confirm_count=gte.1` +  // exclude core-library phrases with no community signal
  `&order=confirm_count.desc` +
  `&limit=5000`;

const host = SUPABASE_URL.replace('https://', '');

const options = {
  hostname: host,
  path:     apiPath,
  headers: {
    'apikey':        SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
  },
};

https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    let rows;
    try {
      rows = JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse Supabase response:', data.slice(0, 200));
      process.exit(1);
    }

    if (!Array.isArray(rows)) {
      console.error('Unexpected response:', JSON.stringify(rows).slice(0, 200));
      process.exit(1);
    }

    console.log(`Fetched ${rows.length} active community phrases from global_index`);

    // Apply tiered threshold filter
    const promoted = rows
      .filter(meetsThreshold)
      .map(r => ({
        phrase:           r.phrase,
        normalizedPhrase: r.normalized_phrase,
        translation:      r.translation,
        legalRef:         r.legal_ref,
        severity:         r.severity,
        confirmCount:     r.confirm_count,
        domainCount:      r.domain_count,
        sourceLanguage:   r.lang || 'en',
        isGlobal:         true,
      }));

    console.log(`Included ${promoted.length} phrases after tiered threshold filter`);
    console.log(`  critical >= 2 confirms / 1 domain`);
    console.log(`  high     >= 3 confirms / 2 domains`);
    console.log(`  medium   >= 3 confirms / 3 domains`);

    const output = {
      generated:   new Date().toISOString(),
      count:       promoted.length,
      thresholds:  TIER_THRESHOLDS,
      phrases:     promoted,
    };

    fs.writeFileSync('community-phrases.json', JSON.stringify(output, null, 2));
    console.log('Written community-phrases.json');
  });
}).on('error', (e) => {
  console.error('HTTPS error:', e.message);
  process.exit(1);
});
