const fs = require('fs');
const path = require('path');

let apiBase = process.env.API_BASE || 'http://localhost:8080/api';
if (apiBase && !apiBase.endsWith('/api')) {
    apiBase = apiBase.replace(/\/$/, '') + '/api';
}

const configContent = `var API_BASE = "${apiBase}";\n`;
fs.writeFileSync(path.join(__dirname, 'frontend', 'config.js'), configContent);
console.log(`Generated config.js with API_BASE: ${apiBase}`);
