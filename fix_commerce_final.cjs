const fs = require('fs');
let content = fs.readFileSync('server/routers/commerce.ts', 'utf8');

// Insert import if missing
if (!content.includes('categories, productCategories')) {
  content = content.replace(
    /import \{ asc, eq \} from "drizzle-orm";/,
    `$&
import { categories, productCategories } from "../../drizzle/schema";`
  );
}

fs.writeFileSync('server/routers/commerce.ts', content);
