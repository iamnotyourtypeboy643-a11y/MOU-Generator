const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

// Load the template
const templatePath = path.join(__dirname, '../public/templates/template.docx');
const content = fs.readFileSync(templatePath);
const zip = new PizZip(content);

// Extract document.xml
let docXml = zip.file('word/document.xml').asText();

console.log('=== CURRENT TEMPLATE CONTENT ===\n');
// Pretty print first 2000 chars to inspect
console.log(docXml.substring(0, 3000));
console.log('\n... (truncated)\n');

// Check what placeholders exist
const placeholders = docXml.match(/\{[A-Z_]+\}/g) || [];
console.log('=== FOUND PLACEHOLDERS ===');
console.log([...new Set(placeholders)].sort());

// Count occurrences of KOL_NAME and ADDRESS
const kolNameCount = (docXml.match(/\{KOL_NAME\}/g) || []).length;
const addressCount = (docXml.match(/\{ADDRESS\}/g) || []).length;
const ktpCount = (docXml.match(/\{KTP\}/g) || []).length;
const npwpCount = (docXml.match(/\{NPWP\}/g) || []).length;

console.log('\n=== PLACEHOLDER USAGE ===');
console.log(`{KOL_NAME}: ${kolNameCount} times`);
console.log(`{ADDRESS}: ${addressCount} times`);
console.log(`{KTP}: ${ktpCount} times`);
console.log(`{NPWP}: ${npwpCount} times`);

console.log('\n✅ Analysis complete. Check if all required placeholders are present.');
console.log('   If missing, you need to manually edit template.docx in MS Word or LibreOffice.');
