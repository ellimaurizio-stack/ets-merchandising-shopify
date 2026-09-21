const fs = require('fs');
let content = fs.readFileSync('client/src/pages/AdminDashboard.tsx', 'utf8');

// 1. Remove the misplaced UI block from CheckoutFieldsSection (around line 1327)
content = content.replace(
  /<div className="mt-6 pt-6 border-t border-slate-200">\s*<div className="flex items-center justify-between mb-2">\s*<h3 className="font-bold text-lg">Avviso Negozio \(Sopra ai prodotti\)<\/h3>[\s\S]*?<div className=\{!noticeEnabled \? "opacity-50 pointer-events-none" : ""\}>\s*<RichTextEditor value=\{shopNotice\} onChange=\{setShopNotice\} \/>\s*<\/div>\s*<\/div>/,
  ''
);

// 2. Remove all those bogus `, shopNotice: JSON.stringify({ enabled: noticeEnabled, content: shopNotice })});` injections from other components
content = content.replace(
  /, shopNotice: JSON\.stringify\(\{ enabled: noticeEnabled, content: shopNotice \}\)\}\);/g,
  '});'
);

// 3. Inject the UI block into ShopSettingsSection (which is around line 1595)
// Let's find where to put it inside ShopSettingsSection.
// We can place it right before the Save button of ShopSettingsSection.
content = content.replace(
  /<Button onClick=\{\(\) => updateSettings.mutate\(\{ shopTitle: title, shopDescription: description \}\)\}/,
  `<div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg">Avviso Negozio (Sopra ai prodotti)</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={noticeEnabled} onChange={e => setNoticeEnabled(e.target.checked)} className="rounded" />
            Mostra avviso
          </label>
        </div>
        <p className="text-sm text-slate-500 mb-4">Usa questo editor per formattare messaggi importanti (es. tempistiche, resi). Il testo apparirà in Vetrina sopra la lista dei prodotti.</p>
        <div className={!noticeEnabled ? "opacity-50 pointer-events-none" : ""}>
          <RichTextEditor value={shopNotice} onChange={setShopNotice} />
        </div>
      </div>
      <Button onClick={() => updateSettings.mutate({ shopTitle: title, shopDescription: description, shopNotice: JSON.stringify({ enabled: noticeEnabled, content: shopNotice }) })}`
);

fs.writeFileSync('client/src/pages/AdminDashboard.tsx', content);
