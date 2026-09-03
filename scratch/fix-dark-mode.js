import fs from 'fs';
import path from 'path';

const shapesDir = path.join(import.meta.dirname, '../src/shapes');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace hardcoded backgrounds
    content = content.replace(/backgroundColor:\s*['"]#(fff|ffffff)['"]/gi, "backgroundColor: 'var(--bg-color)'");
    content = content.replace(/background:\s*['"]#(fff|ffffff)['"]/gi, "background: 'var(--bg-color)'");
    
    // Replace text color (usually #000 or #000000)
    content = content.replace(/color:\s*['"]#(000|000000)['"]/gi, "color: 'var(--text-main)'");
    
    // Replace borders
    content = content.replace(/border:\s*['"](.*?) solid #(000|000000)['"]/gi, "border: '$1 solid var(--border-color)'");
    content = content.replace(/borderBottom:\s*['"](.*?) solid #(000|000000)['"]/gi, "borderBottom: '$1 solid var(--border-color)'");
    content = content.replace(/borderTop:\s*['"](.*?) solid #(000|000000)['"]/gi, "borderTop: '$1 solid var(--border-color)'");
    content = content.replace(/borderLeft:\s*['"](.*?) solid #(000|000000)['"]/gi, "borderLeft: '$1 solid var(--border-color)'");
    content = content.replace(/borderRight:\s*['"](.*?) solid #(000|000000)['"]/gi, "borderRight: '$1 solid var(--border-color)'");

    // Also replace box shadow hardcoded to #000 (neo-brutalism style)
    content = content.replace(/boxShadow:\s*['"](.*?) #(000|000000)['"]/gi, "boxShadow: '$1 var(--shadow-color)'");
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Processed: ${path.basename(filePath)}`);
}

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            processFile(fullPath);
        }
    });
}

walkDir(shapesDir);
console.log("Done fixing dark mode colors!");
