const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

//'https://progress-be-prod.zoominsoftware.io/api/bundle/openedge-abl-reference-117/toc?language=enus'
//'https://progress-be-prod.zoominsoftware.io/api/bundle/openedge-abl-reference-122/toc?language=enus' 

// Load JSON file
const JSON_FILE = "progress_117.json"; // Change this if the filename is different
const OUTPUT_DIR = path.join(__dirname, "html_files");

async function loadJson() {
    try {
        const rawData = await fs.readFile(JSON_FILE, "utf8");
        return JSON.parse(rawData);
    } catch (error) {
        console.error("Error loading JSON:", error);
        return null;
    }
}

async function downloadFile(url, filename) {
    try {
        const response = await axios.get(url, { responseType: "arraybuffer" });
        const filePath = path.join(OUTPUT_DIR, filename);
        await fs.outputFile(filePath, response.data);
        console.log(`Saved: ${filename}`);
    } catch (error) {
        console.error(`Error downloading ${url}:`, error);
    }
}

async function scrapeHTMLFiles() {
    const jsonData = await loadJson();
    if (!jsonData) return;

    await fs.ensureDir(OUTPUT_DIR);

    for (const item of jsonData[0].childEntries) {
        if (item.url && item.url.endsWith(".html")) {
            const filename = path.basename(item.url);
            await downloadFile(item.url, filename);
        }
    }

    console.log("Scraping completed.");
}

scrapeHTMLFiles();
