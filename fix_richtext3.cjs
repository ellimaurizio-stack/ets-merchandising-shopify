const fs = require('fs');
let content = fs.readFileSync('client/src/pages/AdminDashboard.tsx', 'utf8');

const injection = `
      <div className="mt-6 pt-6 border-t border-slate-200">
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
`;

content = content.replace(
  /      <Button onClick=\{\(\) => updateSettings.mutate\(\{ shopTitle: title, shopDescription: description,/,
  injection + '$&'
);

// We still need to remove `, shopNotice: JSON.stringify({ enabled: noticeEnabled, content: shopNotice }) })} disabled=` from ShopSettingsSection and replace it with `}) })} disabled=`
content = content.replace(
  /, shopNotice: JSON.stringify\(\{ enabled: noticeEnabled, content: shopNotice \}\) \}\)/g,
  '})'
);
// Fix the exact string on line 1638
content = content.replace(
  /updateSettings\.mutate\(\{ shopTitle: title, shopDescription: description, shopNotice: JSON\.stringify\(\{ enabled: noticeEnabled, content: shopNotice \}\) \}\)/g,
  `updateSettings.mutate({ shopTitle: title, shopDescription: description, shopNotice: JSON.stringify({ enabled: noticeEnabled, content: shopNotice }) })`
);

fs.writeFileSync('client/src/pages/AdminDashboard.tsx', content);
