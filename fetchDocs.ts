import * as https from 'https';
import * as fs from 'fs-extra';
import * as path from 'path';

const OUTPUT_DIR = path.join(__dirname, "saved_docs");

interface JsonDocEntry {
  bundle_id: string;
  title: string;
  url: string;
  childEntries: JsonDocEntry[];
}

async function fetchData() {
  const prefix = 'https://progress-be-prod.zoominsoftware.io/api/bundle/';
  const urls = [
    `${prefix}openedge-abl-reference-117/toc?language=enus`,
    `${prefix}openedge-abl-reference-122/toc?language=enus`,
    `${prefix}abl-reference/toc?language=enus`
  ];

  for (const url of urls) {
    try {
      const text = await fetchUrl(url);
      const docData = JSON.parse(text) as JsonDocEntry[];
      await saveDocs(docData);
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
    }
  }
}

async function saveDocs(docData: JsonDocEntry[]) {
  await fs.ensureDir(OUTPUT_DIR);

  for (const entry of docData) {
    await saveDocEntry(entry);
  }
}

async function saveDocEntry(entry: JsonDocEntry) {
  if (entry.url && entry.url.endsWith(".html")) {
    try {
      const html = await fetchUrl(entry.url);
      const filePath = path.join(OUTPUT_DIR, path.basename(entry.url));
      await fs.outputFile(filePath, html);
      console.log(`Saved: ${filePath}`);
    } catch (error) {
      console.error(`Error saving file from ${entry.url}:`, error);
    }
  }

  if (entry.childEntries) {
    for (const child of entry.childEntries) {
      await saveDocEntry(child);
    }
  }
}

function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

fetchData();