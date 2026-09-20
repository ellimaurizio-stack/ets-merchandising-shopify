const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Shop.tsx', 'utf8');

content = content.replace(
  /const \{ useEffect \} = await import\("react"\);/,
  'const { data: settings } = trpc.commerce.settings.useQuery();'
);

content = content.replace(
  /const rawTitle = settings\?\.shopTitle \|\| "Oggetti con un\\nsignificato\.";\n  const titleParts = rawTitle\.split\("\\n"\);\n  const description = settings\?\.shopDescription \|\| "Scegli un oggetto da portare con te ogni giorno\. Il tuo acquisto contribuisce a sostenere il lavoro e le iniziative di A-Tono ETS\.";\n/,
  ''
);

fs.writeFileSync('client/src/pages/Shop.tsx', content);
