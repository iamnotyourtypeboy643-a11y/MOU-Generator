import { NextRequest, NextResponse } from 'next/server'
import { mouSchema } from '@/lib/validation'
import { generateDocx, sanitizeFilename } from '@/lib/generateDocx'
import { writeFileSync, readFileSync, unlinkSync } from 'fs'
import { execSync } from 'child_process'
import { join } from 'path'
import { tmpdir } from 'os'

export async function POST(req: NextRequest) {
  const ts = Date.now()
  const tmpDocx = join(tmpdir(), `mou_${ts}.docx`)
  const tmpPdf = join(tmpdir(), `mou_${ts}.pdf`)

  try {
    const body = await req.json()
    
    const parsed = mouSchema.safeParse(body)
    if (!parsed.success) {
      const fields = parsed.error.issues.map(i => i.path[0])
      return NextResponse.json(
        { error: 'Validasi gagal', fields },
        { status: 400 }
      )
    }

    const data = parsed.data
    const docxBuffer = generateDocx(data)
    
    // Write DOCX to temp
    writeFileSync(tmpDocx, docxBuffer)
    
    // Convert to PDF with LibreOffice
    execSync(
      `python3 /mnt/skills/public/docx/scripts/office/soffice.py --headless --convert-to pdf --outdir "${tmpdir()}" "${tmpDocx}"`,
      { timeout: 30000 }
    )

    const pdfBuffer = readFileSync(tmpPdf)
    const safeName = sanitizeFilename(data.kolName)
    const filename = `MOU_${safeName}_${data.mouNumber.replace(/\//g, '-')}.pdf`

    // Cleanup
    try { unlinkSync(tmpDocx) } catch {}
    try { unlinkSync(tmpPdf) } catch {}

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.length),
      },
    })
  } catch (err) {
    console.error('Generate PDF error:', err)
    try { unlinkSync(tmpDocx) } catch {}
    try { unlinkSync(tmpPdf) } catch {}
    return NextResponse.json(
      { error: 'Gagal membuat PDF. Pastikan LibreOffice terinstall di server.' },
      { status: 500 }
    )
  }
}
