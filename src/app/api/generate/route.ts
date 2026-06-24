import { NextRequest, NextResponse } from 'next/server'
import { mouSchema } from '@/lib/validation'
import { generateDocx, sanitizeFilename } from '@/lib/generateDocx'

export async function POST(req: NextRequest) {
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

    const displayName = data.paymentType === 'pribadi'
      ? data.kolName
      : data.companyName || data.kolName
    const safeName = sanitizeFilename(displayName)
    const filename = `MOU_${safeName}_${data.mouNumber.replace(/\//g, '-')}.docx`

    return new NextResponse(new Uint8Array(docxBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(docxBuffer.length),
      },
    })
  } catch (err) {
    console.error('Generate DOCX error:', err)
    return NextResponse.json({ error: 'Gagal membuat dokumen' }, { status: 500 })
  }
}
