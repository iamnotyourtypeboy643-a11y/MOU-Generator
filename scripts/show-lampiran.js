const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, '../public/templates/template.docx');
const content = fs.readFileSync(templatePath);
const zip = new PizZip(content);

let docXml = zip.file('word/document.xml').asText();

// Extract all text to understand flow
const lines = docXml.split('<w:p ');
console.log('=== TEMPLATE TEXT STRUCTURE ===\n');

let inLampiran = false;
let count = 0;

lines.slice(1).forEach((line, idx) => {
  // Extract text from this paragraph
  const textMatch = line.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
  if (textMatch) {
    const texts = textMatch.map(t => t.replace(/<w:t[^>]*>|<\/w:t>/g, '')).join('');
    
    if (texts.includes('Lampiran')) inLampiran = true;
    if (inLampiran && count < 50) {
      if (texts.trim()) {
        console.log(`${texts.substring(0, 120)}`);
        count++;
      }
    }
  }
});

console.log('\n✅ Looking for address field display location');
