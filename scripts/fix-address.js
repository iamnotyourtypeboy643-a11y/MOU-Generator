const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, '../public/templates/template.docx');
const content = fs.readFileSync(templatePath);
const zip = new PizZip(content);

let docXml = zip.file('word/document.xml').asText();

// Replace the hardcoded address with {ADDRESS} placeholder
const hardcodedAddress = 'Jl. Raya Leuwinanggung RT/RW 003/010, kelurahan LeuwiNanggung, Kec. Tapos, Kota Depok, Jawa Barat';

if (docXml.includes(hardcodedAddress)) {
  docXml = docXml.replace(hardcodedAddress, '{ADDRESS}');
  console.log('✅ Replaced hardcoded address with {ADDRESS} placeholder');
  
  // Update the zip
  zip.file('word/document.xml', docXml);
  
  // Save back
  fs.writeFileSync(templatePath, zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' }));
  
  console.log('✅ Template updated successfully!');
  console.log('\nNow both locations will use the same ADDRESS field:');
  console.log('  1. Pihak Kedua: "beralamat di {ADDRESS}"');
  console.log('  2. Lampiran I: "{ADDRESS}" (before Nomor telp/HP)');
} else {
  console.log('❌ Hardcoded address not found. It may have already been replaced.');
}
