const https = require('https');
const fs = require('fs');

const URL = 'https://josh-hub-two.vercel.app/apps';

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });
}

function extractApps(html) {
  const results = [];
  // Try to capture headings containing links: <h3><a href="...">Title</a></h3>
  const headingLinkRegex = /<h[23][^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>\s*<\/h[23]>/gim;
  let m;
  const seen = new Set();
  while ((m = headingLinkRegex.exec(html))) {
    const url = m[1].trim();
    const title = m[2].trim();
    const type = url.includes('/games/') ? 'game' : 'app';
    const key = `${title}::${url}`;
    if (!seen.has(key)) {
      results.push({ name: title, primaryUrl: url, type });
      seen.add(key);
    }
  }

  // Fallback: capture markdown-style titles that may appear in pre-rendered text (### [Title](url))
  const mdRegex = /###\s*\[([^\]]+)\]\((https?:[^)]+)\)/g;
  while ((m = mdRegex.exec(html))) {
    const title = m[1].trim();
    const url = m[2].trim();
    const type = url.includes('/games/') ? 'game' : 'app';
    const key = `${title}::${url}`;
    if (!seen.has(key)) {
      results.push({ name: title, primaryUrl: url, type });
      seen.add(key);
    }
  }

  // Additional heuristic: capture large anchor lists with titles and urls in the apps section
  const anchorRegex = /<a[^>]*href="(https?:[^"]+)"[^>]*>([^<]{3,200}?)<\/a>/gim;
  while ((m = anchorRegex.exec(html))) {
    const url = m[1].trim();
    const title = m[2].trim();
    if (title.length > 2 && url.includes('josh-hub-two.v')) {
      const type = url.includes('/games/') ? 'game' : 'app';
      const key = `${title}::${url}`;
      if (!seen.has(key)) {
        results.push({ name: title, primaryUrl: url, type });
        seen.add(key);
      }
    }
  }
  return results;
}

async function run() {
  try {
    console.log('Fetching', URL);
    const html = await fetchHtml(URL);
    const apps = extractApps(html);
    const outPath = 'src/data/apps.synced.json';
    fs.writeFileSync(outPath, JSON.stringify(apps, null, 2));
    console.log('Wrote', outPath, 'with', apps.length, 'items');
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
}

run();
