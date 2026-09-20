const fs = require('fs');
let content = fs.readFileSync('client/src/pages/AdminDashboard.tsx', 'utf8');

if (!content.includes('<CategoriesSection />')) {
  content = content.replace(
    /\{activeTab === "products" && \([\s\S]*?<\/div>\n          \)\}/,
    `$&
          {activeTab === "categories" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="mb-6 text-3xl font-bold tracking-tight">Categorie</h2>
              <CategoriesSection />
            </div>
          )}`
  );
  fs.writeFileSync('client/src/pages/AdminDashboard.tsx', content);
}
