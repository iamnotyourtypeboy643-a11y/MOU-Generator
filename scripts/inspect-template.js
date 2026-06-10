const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

// Load the template
const templatePath = path.join(__dirname, '../public/templates/template.docx');
const content = fs.readFileSync(templatePath);
const zip = new PizZip(content);

let docXml = zip.file('word/document.xml').asText();

// Save full XML to file for inspection
fs.writeFileSync(path.join(__dirname, 'template-debug.xml'), docXml);

// Extract text content to understand structure
const lines = docXml.split('<w:p ');
console.log('=== TEMPLATE STRUCTURE (Paragraphs) ===\n');

lines.slice(0, 50).forEach((line, idx) => {
  if (idx === 0) return;
  // Extract text content from this paragraph
  const textMatch = line.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
  if (textMatch) {
    const texts = textMatch.map(t => t.replace(/<w:t[^>]*>|<\/w:t>/g, '')).join('');
    if (texts.trim()) {
      console.log(`[P${idx}] ${texts.substring(0, 100)}`);
    }
  }
});

console.log('\n✅ Full XML saved to: scripts/template-debug.xml');
console.log('   Open it to see the full structure.');
