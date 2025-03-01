const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const INPUT_DIR = './html_docs'; // Folder containing HTML files
const OUTPUT_FILE = './snippets.json';

function extractSnippetsFromHTML(html) {
    const $ = cheerio.load(html);
    let snippets = {};

    $('pre code').each((i, element) => {
        const code = $(element).text().trim();
        const title = `snippet_${i + 1}`; // Generate a generic title

        snippets[title] = {
            prefix: title, // You can modify this to be more meaningful
            body: code.split('\n'),
            description: "Extracted OpenEdge ABL snippet"
        };
    });

    return snippets;
}

function processFiles() {
    let allSnippets = {};

    fs.readdirSync(INPUT_DIR).forEach(file => {
        if (path.extname(file) === '.html') {
            const filePath = path.join(INPUT_DIR, file);
            const htmlContent = fs.readFileSync(filePath, 'utf8');
            const snippets = extractSnippetsFromHTML(htmlContent);
            allSnippets = { ...allSnippets, ...snippets };
        }
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allSnippets, null, 2), 'utf8');
    console.log(`Snippets saved to ${OUTPUT_FILE}`);
}

processFiles();