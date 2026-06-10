import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import { readFileSync } from 'fs'
import { join } from 'path'
import { MOUFormData } from './validation'
import { formatFee, terbilangCapital } from './terbilang'

export function generateDocx(data: MOUFormData): Buffer {
  const content = readFileSync(join(process.cwd(), 'public', 'templates', 'template.docx'))
  const doc = new Docxtemplater(new PizZip(content), { paragraphLoop: true, linebreaks: true })

  const paymentText = data.paymentTiming === 'after' 
    ? '100% (seratus persen) sesudah seluruh Kerja Sama diselesaikan'
    : '100% (seratus persen) sebelum seluruh Kerja Sama diselesaikan'

  // For now, signature image is just a placeholder text
  // To embed actual images, you'd need to use docxtemplater's ImageModule
  const signatureText = data.signatureImage ? '[Gambar Tanda Tangan]' : ''

  doc.render({
    MOU_NUMBER:      data.mouNumber,
    DATE:            data.date,
    KOL_NAME:        data.kolName,
    KTP:             data.ktp || '-',
    NPWP:            data.npwp || '-',
    ADDRESS:         data.address,
    PHONE:           data.phone || '-',
    KOL_HANDLE:      data.kolHandle,
    KOL_ROLE:        data.kolRole || 'KOL',
    PRODUCT:         data.product,
    CAMPAIGN_PERIOD: data.campaignPeriod,
    SOW:             data.sow,
    FEE_FORMATTED:   formatFee(data.fee),
    FEE_TERBILANG:   terbilangCapital(data.fee),
    BANK:            data.bank,
    ACCOUNT_NUMBER:  data.accountNumber,
    ACCOUNT_NAME:    data.accountName,
    PAYMENT_TERMS:   paymentText,
    SIGNATURE_IMAGE: signatureText,
  })

  return doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' })
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-\s]/g, '').replace(/\s+/g, '_').slice(0, 40)
}
