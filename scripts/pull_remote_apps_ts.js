const https = require('https');
const fs = require('fs');

const RAW_URL = 'https://raw.githubusercontent.com/joshualparris/JoshHub/main/src/data/apps.ts';
const OUT_PATH = 'src/data/apps.ts';

function fetchRaw(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 400) return reject(new Error('Failed to fetch: ' + res.statusCode));
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });
}

async function run() {
  try {
    console.log('Fetching', RAW_URL);
    const content = await fetchRaw(RAW_URL);
    fs.writeFileSync(OUT_PATH, content, 'utf8');
    console.log('Wrote', OUT_PATH);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
}

run();
