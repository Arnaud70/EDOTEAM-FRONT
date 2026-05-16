const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\DARK PHAMTOM (-_-)\\Documents\\PROJECT ME\\PRESTATAIRE\\FRONTEND\\src\\pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  if (['Dashboard.tsx', 'Bookings.tsx'].includes(file)) continue;

  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes("import Sidebar") && !content.includes("MobileMenuButton")) {
    // Replace import
    content = content.replace(/import Sidebar from ['"](\.\.\/components\/Sidebar)['"];/, "import Sidebar, { MobileMenuButton } from '$1';");

    // Add MobileMenuButton inside header
    // Some headers look like: <header className="flex ... mb-12">\n          <div>
    // We want to wrap the content inside the first header with a flex container or just insert it.
    // Simplest is to find <header ...> and if the next line has <div> or <motion.div>, wrap them.
    // Actually, replacing <header ...> with <header ...>\n<div className="flex items-center gap-4">\n<MobileMenuButton />\n is sometimes breaking if there's flex-col.
    
    // Let's use a regex that matches <header ...> up to the first closing >
    const headerRegex = /(<header[^>]*>)\s*/;
    content = content.replace(headerRegex, `$1\n          <div className="flex items-center gap-4 mb-4 md:mb-0">\n            <MobileMenuButton />\n            <div className="flex-1">\n`);
    
    // Now we need to close these two divs before the closing </header>
    // Wait, the header might have other children (like the buttons on the right in Wallet).
    // This is getting too complex with regex because of varying header structures.
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Modified', file);
  }
}
