const fs = require('fs');
let content = fs.readFileSync('client/src/pages/AdminDashboard.tsx', 'utf8');

// 1. Find the UI block and remove it from where it currently is.
const uiBlockRegex = /<div className="mt-6 pt-6 border-t border-slate-200">\s*<div className="flex items-center justify-between mb-2">\s*<h3 className="font-bold text-lg">Avviso Negozio \(Sopra ai prodotti\)<\/h3>[\s\S]*?<div className=\{!noticeEnabled \? "opacity-50 pointer-events-none" : ""\}>\s*<RichTextEditor value=\{shopNotice\} onChange=\{setShopNotice\} \/>\s*<\/div>\s*<\/div>/;

const match = content.match(uiBlockRegex);
if (match) {
  content = content.replace(uiBlockRegex, '');
  
  // 2. Inject it into ShopSettingsSection just before the Button
  content = content.replace(
    /      <Button onClick=\{\(\) => updateSettings.mutate\(\{ shopTitle: title, shopDescription: description, shopNotice:/,
    `      ${match[0]}
      <Button onClick={() => updateSettings.mutate({ shopTitle: title, shopDescription: description, shopNotice:`
  );
}

// 3. Let's fix the unwanted mutate payloads in other sections.
content = content.replace(
  /paymentProvider: settings\?\.paymentProvider \|\| "nessuno",\s*checkoutFields: JSON\.stringify\(newFields\)\s*, shopNotice: JSON\.stringify\(\{ enabled: noticeEnabled, content: shopNotice \}\)\}/g,
  `paymentProvider: settings?.paymentProvider || "nessuno",
      checkoutFields: JSON.stringify(newFields)
    }`
);

content = content.replace(
  /updateSettings\.mutate\(\{ receiptConfig: JSON\.stringify\(config\) , shopNotice: JSON\.stringify\(\{ enabled: noticeEnabled, content: shopNotice \}\)\}\);/g,
  `updateSettings.mutate({ receiptConfig: JSON.stringify(config) });`
);

fs.writeFileSync('client/src/pages/AdminDashboard.tsx', content);
