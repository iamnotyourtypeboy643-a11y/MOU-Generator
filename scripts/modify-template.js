const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, '../public/templates/template.docx');
const content = fs.readFileSync(templatePath);
const zip = new PizZip(content);

let docXml = zip.file('word/document.xml').asText();

// BACKUP original
fs.writeFileSync(
  path.join(__dirname, '../public/templates/template.docx.backup'),
  content
);
console.log('✅ Backup created: template.docx.backup\n');

// 1. Replace the payment section description with {PAYMENT_TERMS}
// Looking for the text about payment timing
const oldPaymentText = '100% (seratus persen) sebelum seluruh Kerja Sama diselesaikan Pihak Kedua, dengan ketentuan invoice beserta dokumen kelengkapan lainnya, termasuk salinan Perjanjian yang sudah ditandatangani telah diterima Pihak Pertama dengan benar dan lengkap';

const newPaymentText = '{PAYMENT_TERMS} Pihak Kedua, dengan ketentuan invoice beserta dokumen kelengkapan lainnya, termasuk salinan Perjanjian yang sudah ditandatangani telah diterima Pihak Pertama dengan benar dan lengkap';

if (docXml.includes(oldPaymentText)) {
  docXml = docXml.replace(oldPaymentText, newPaymentText);
  console.log('✅ Payment section updated with {PAYMENT_TERMS} placeholder');
} else {
  console.log('⚠️  Could not find exact payment text. Searching for alternative...');
  // Try alternative search
  if (docXml.includes('100% (seratus persen) sebelum')) {
    console.log('   Found partial match - updating with simpler approach');
    // Replace just the percentage part
    docXml = docXml.replace(
      '100% (seratus persen) sebelum seluruh Kerja Sama diselesaikan',
      '{PAYMENT_TERMS}'
    );
    console.log('✅ Payment section simplified to {PAYMENT_TERMS}');
  }
}

// 2. Add signature image section at the end, before closing body tag
const signatureSection = `<w:p w14:paraId="99999999" w14:textId="77777777" w:rsidR="007E4170" w:rsidRDefault="007E4170" w:rsidP="006E1C27">
  <w:pPr>
    <w:spacing w:after="200" w:line="240" w:lineRule="auto"/>
  </w:pPr>
  <w:r>
    <w:rPr>
      <w:rFonts w:asciiTheme="minorHAnsi" w:hAnsiTheme="minorHAnsi" w:cstheme="minorHAnsi"/>
      <w:sz w:val="20"/>
      <w:szCs w:val="20"/>
      <w:lang w:val="id-ID"/>
    </w:rPr>
    <w:t>{SIGNATURE_IMAGE}</w:t>
  </w:r>
</w:p>`;

// Find the closing body tag
const closingBodyTagIndex = docXml.lastIndexOf('</w:body>');
if (closingBodyTagIndex > -1) {
  docXml = docXml.slice(0, closingBodyTagIndex) + signatureSection + docXml.slice(closingBodyTagIndex);
  console.log('✅ Signature image section added at the end');
} else {
  console.log('⚠️  Could not find closing body tag');
}

// Save updated document.xml back to zip
zip.file('word/document.xml', docXml);

// Write the modified docx
fs.writeFileSync(templatePath, zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' }));

console.log('\n✅ Template updated successfully!');
console.log('\nNew placeholders added:');
console.log('  - {PAYMENT_TERMS} - Automatic payment timing text');
console.log('  - {SIGNATURE_IMAGE} - For signature/image insertion');
