const fs = require("fs");
const path = require("path");

const DIRECTORY = path.join(__dirname, "html_files");

fs.readdir(DIRECTORY, (err, files) => {
    if (err) {
        console.error("Error reading directory:", err);
        return;
    }

    files.forEach(file => {
        if (file.endsWith(".html")) {
            const oldPath = path.join(DIRECTORY, file);
            const newPath = path.join(DIRECTORY, file.replace(".html", ".json"));

            fs.rename(oldPath, newPath, err => {
                if (err) {
                    console.error(`Error renaming ${file}:`, err);
                } else {
                    console.log(`Renamed: ${file} -> ${path.basename(newPath)}`);
                }
            });
        }
    });
});
