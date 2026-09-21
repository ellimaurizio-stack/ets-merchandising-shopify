const fs = require('fs');
let content = fs.readFileSync('server/routers/commerce.ts', 'utf8');

if (!content.includes('import { getDb } from "../db";')) {
  content = content.replace(
    /import \{ publicProcedure, router \} from "\.\.\/_core\/trpc";/,
    `$&
import { getDb } from "../db";`
  );
}

fs.writeFileSync('server/routers/commerce.ts', content);
