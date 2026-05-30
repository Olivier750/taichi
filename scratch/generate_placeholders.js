const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'images');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

// 1x1 transparent PNG base64
const base64Data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const buffer = Buffer.from(base64Data, 'base64');

fs.writeFileSync(path.join(dir, 'icon-192.png'), buffer);
fs.writeFileSync(path.join(dir, 'icon-512.png'), buffer);
console.log("PWA Icons generated successfully!");
