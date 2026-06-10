const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, '../public/templates/template.docx');
const content = fs.readFileSync(templatePath);
const zip = new PizZip(content);

let docXml = zip.file('word/document.xml').asText();

// Find PASAL 9 section
const pasal9Index = docXml.indexOf('PASAL 9');
console.log(`\n=== PASAL 9 SECTION ===`);

if (pasal9Index > -1) {
  // Get 2000 characters after PASAL 9
  const pasal9Section = docXml.substring(pasal9Index, pasal9Index + 2500);
  console.log(pasal9Section);
  
  // Check if there's hardcoded address text in Pasal 9
  if (pasal9Section.includes('Jl.') || pasal9Section.includes('Jalan')) {
    console.log('\n⚠️  Found hardcoded address in Pasal 9');
  } else {
    console.log('\n✅ No hardcoded address in Pasal 9');
  }
}

// Also check Lampiran I for address
const lampiranIndex = docXml.indexOf('Lampiran I');
console.log(`\n\n=== LAMPIRAN I SECTION ===`);
if (lampiranIndex > -1) {
  const lampiranSection = docXml.substring(lampiranIndex, lampiranIndex + 2500);
  console.log(lampiranSection);
}
