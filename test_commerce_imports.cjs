const fs = require('fs');
const content = fs.readFileSync('server/routers/commerce.ts', 'utf8');
console.log(content.slice(0, 1500));
