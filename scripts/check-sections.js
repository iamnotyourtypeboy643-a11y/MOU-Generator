const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, '../public/templates/template.docx');
const content = fs.readFileSync(templatePath);
const zip = new PizZip(content);

let docXml = zip.file('word/document.xml').asText();

// Find the Pihak Kedua section (contains {KOL_NAME})
const kolNameIndex = docXml.indexOf('{KOL_NAME}');
const paymentIndex = docXml.indexOf('CARA PEMBAYARAN');

console.log('=== PASAL/SECTION SEARCH RESULTS ===\n');
console.log(`KOL_NAME found at position: ${kolNameIndex}`);
console.log(`CARA PEMBAYARAN found at position: ${paymentIndex}`);

// Extract context around {KOL_NAME}
console.log('\n=== CONTEXT AROUND {KOL_NAME} (Pihak Kedua) ===');
const kolContext = docXml.substring(Math.max(0, kolNameIndex - 800), kolNameIndex + 800);
console.log(kolContext);

// Extract context around payment section
if (paymentIndex > -1) {
  console.log('\n=== CONTEXT AROUND PEMBAYARAN ===');
  const paymentContext = docXml.substring(Math.max(0, paymentIndex - 400), paymentIndex + 600);
  console.log(paymentContext);
}

// Check if {SIGNATURE_IMAGE} already exists
if (docXml.includes('{SIGNATURE_IMAGE}')) {
  console.log('\n✅ {SIGNATURE_IMAGE} placeholder already exists');
} else {
  console.log('\n❌ {SIGNATURE_IMAGE} placeholder NOT found - needs to be added');
}

// Check if {PAYMENT_TERMS} already exists
if (docXml.includes('{PAYMENT_TERMS}')) {
  console.log('✅ {PAYMENT_TERMS} placeholder already exists');
} else {
  console.log('❌ {PAYMENT_TERMS} placeholder NOT found - needs to be added');
}
