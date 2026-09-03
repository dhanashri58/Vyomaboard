const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/Krrish/OneDrive/Desktop/projects/moodboard/src/shapes';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace soft box shadows with hard shadow
  content = content.replace(/boxShadow:\s*['"][^'"]*rgba\(0,0,0,0\.\d+\)[^'"]*['"]/g, "boxShadow: '4px 4px 0px #000'");
  content = content.replace(/boxShadow:\s*['"]0 [^'"]*(rgba|#)[^'"]*['"]/g, "boxShadow: '4px 4px 0px #000'");
  
  // Replace soft borders with hard borders
  content = content.replace(/border:\s*['"]1px solid rgba[^'"]*['"]/g, "border: '3px solid #000'");
  content = content.replace(/borderRight:\s*['"]1px solid rgba[^'"]*['"]/g, "borderRight: '3px solid #000'");
  content = content.replace(/borderBottom:\s*['"]1px solid rgba[^'"]*['"]/g, "borderBottom: '3px solid #000'");
  content = content.replace(/border:\s*['"]1px solid #eaeaea['"]/g, "border: '3px solid #000'");
  content = content.replace(/border:\s*['"]none['"]/g, "border: '3px solid #000'");

  fs.writeFileSync(filePath, content);
}

console.log("Replaced soft shadows and borders in shapes.");
