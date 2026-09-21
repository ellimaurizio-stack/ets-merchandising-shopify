const fs = require('fs');
let content = fs.readFileSync('client/src/pages/AdminDashboard.tsx', 'utf8');

content = content.replace(
  /updateSettings\.mutate\(\{ shopTitle: title, shopDescription: description\}\)/g,
  `updateSettings.mutate({ shopTitle: title, shopDescription: description, shopNotice: JSON.stringify({ enabled: noticeEnabled, content: shopNotice }) })`
);

fs.writeFileSync('client/src/pages/AdminDashboard.tsx', content);
