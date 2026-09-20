const fs = require('fs');
let content = fs.readFileSync('server/routers/commerce.ts', 'utf8');

if (!content.includes('import { asc, eq } from "drizzle-orm"')) {
  content = content.replace(
    /import \{ z \} from "zod";/,
    'import { z } from "zod";\nimport { asc, eq } from "drizzle-orm";'
  );
  fs.writeFileSync('server/routers/commerce.ts', content);
}
