const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, '../public/templates/template.docx');
const content = fs.readFileSync(templatePath);
const zip = new PizZip(content);

let docXml = zip.file('word/document.xml').asText();

// Search for patterns with Address, Phone, or "Alamat", "Telp"
console.log('=== SEARCHING FOR ADDRESS/PHONE PATTERNS ===\n');

const addressPatterns = ['Alamat', 'alamat', 'Nomor Telp', 'telp', 'HP', 'Address'];
addressPatterns.forEach(pattern => {
  const index = docXml.indexOf(pattern);
  if (index > -1) {
    console.log(`Found "${pattern}" at position ${index}`);
    const context = docXml.substring(Math.max(0, index - 200), index + 300);
    console.log(`Context: ${context}\n`);
  }
});

// Also look for all placeholder patterns to understand what exists
console.log('\n=== ALL CURRENT PLACEHOLDERS ===');
const allPlaceholders = docXml.match(/\{[A-Z_]+\}/g) || [];
const unique = [...new Set(allPlaceholders)].sort();
console.log(unique.join('\n'));
