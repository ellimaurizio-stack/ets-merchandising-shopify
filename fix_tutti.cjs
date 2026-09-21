const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Shop.tsx', 'utf8');

content = content.replace(
  /const \[activeCategoryId, setActiveCategoryId\] = useState<string>\("all"\);/,
  `const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [hasSetDefault, setHasSetDefault] = useState(false);`
);

content = content.replace(
  /useEffect\(\(\) => \{\n    if \(categories\.length > 0 && activeCategoryId === "all"\) \{\n      const defaultCat = categories\.find\(c => c\.isDefault === 1\);\n      if \(defaultCat\) setActiveCategoryId\(defaultCat\.id\);\n    \}\n  \}, \[categories, activeCategoryId\]\);/,
  `useEffect(() => {
    if (categories.length > 0 && !hasSetDefault) {
      const defaultCat = categories.find(c => c.isDefault === 1);
      if (defaultCat) {
        setActiveCategoryId(defaultCat.id);
      }
      setHasSetDefault(true);
    }
  }, [categories, hasSetDefault]);`
);

fs.writeFileSync('client/src/pages/Shop.tsx', content);
