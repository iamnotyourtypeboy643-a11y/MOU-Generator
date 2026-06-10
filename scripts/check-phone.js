const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, '../public/templates/template.docx');
const content = fs.readFileSync(templatePath);
const zip = new PizZip(content);

let docXml = zip.file('word/document.xml').asText();

// Find the section around "Nomor telp/HP" which is around position 95284
const phoneSectionIndex = docXml.indexOf('Nomor telp/HP');
console.log(`\n=== SECTION AROUND PHONE (Position ${phoneSectionIndex}) ===\n`);

if (phoneSectionIndex > -1) {
  const before = docXml.substring(Math.max(0, phoneSectionIndex - 2000), phoneSectionIndex);
  const after = docXml.substring(phoneSectionIndex, phoneSectionIndex + 1500);
  
  // Extract text from before section
  const textBefore = before.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || [];
  console.log('=== BEFORE PHONE (last 10 text nodes) ===');
  textBefore.slice(-10).forEach((t, i) => {
    const text = t.replace(/<w:t[^>]*>|<\/w:t>/g, '');
    console.log(`${i}: ${text}`);
  });
  
  console.log('\n=== AROUND PHONE SECTION ===');
  console.log(after.substring(0, 1000));
}
