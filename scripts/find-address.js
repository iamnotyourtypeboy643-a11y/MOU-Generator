const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, '../public/templates/template.docx');
const content = fs.readFileSync(templatePath);
const zip = new PizZip(content);

let docXml = zip.file('word/document.xml').asText();

// Find all occurrences of {ADDRESS}
const addressRegex = /\{ADDRESS\}/g;
const matches = [...docXml.matchAll(addressRegex)];

console.log(`\n=== FOUND {ADDRESS} ${matches.length} TIMES ===\n`);

matches.forEach((match, idx) => {
  const pos = match.index;
  const context = docXml.substring(Math.max(0, pos - 300), pos + 300);
  console.log(`\n--- Occurrence ${idx + 1} at position ${pos} ---`);
  console.log(context);
  console.log('\n');
});

// Check for Pasal 9 / Lampiran
const pasal9Index = docXml.indexOf('PASAL 9');
const lampiranIndex = docXml.indexOf('Lampiran I');

console.log('\n=== KEY SECTIONS ===');
console.log(`PASAL 9 found at: ${pasal9Index}`);
console.log(`Lampiran I found at: ${lampiranIndex}`);

if (pasal9Index > -1) {
  const pasal9Context = docXml.substring(pasal9Index, pasal9Index + 800);
  console.log('\n--- PASAL 9 Context ---');
  console.log(pasal9Context);
}
