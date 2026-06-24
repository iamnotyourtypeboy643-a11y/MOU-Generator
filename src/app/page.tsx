'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { mouSchema, MOUFormData, defaultValues } from '@/lib/validation'
import { formatFee, terbilangCapital } from '@/lib/terbilang'

const s = {
  body:    { fontFamily: 'system-ui,sans-serif', background: '#F1F5F9', minHeight: '100vh', color: '#1E293B' } as React.CSSProperties,
  header:  { background: '#1B3A6B', color: '#fff', padding: '13px 20px', display: 'flex', alignItems: 'center', gap: 10, position: 'sticky' as const, top: 0, zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,.2)' },
  main:    { maxWidth: 660, margin: '28px auto 100px', padding: '0 14px' },
  card:    { background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, marginBottom: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.05)' },
  head:    { padding: '11px 16px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' as const, letterSpacing: '.5px' },
  body2:   { padding: 16, display: 'flex', flexDirection: 'column' as const, gap: 12 },
  row2:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } as React.CSSProperties,
  row3:    { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 } as React.CSSProperties,
  label:   { fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase' as const, letterSpacing: '.4px' },
  bar:     { position: 'fixed' as const, bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #E2E8F0', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 -3px 12px rgba(0,0,0,.07)', zIndex: 50 },
  btn:     { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 7, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', background: '#1B3A6B', color: '#fff' } as React.CSSProperties,
}

function inp(err?: string): React.CSSProperties {
  return { padding: '8px 10px', border: `1.5px solid ${err ? '#DC2626' : '#E2E8F0'}`, borderRadius: 6, fontSize: 14, fontFamily: 'inherit', outline: 'none', width: '100%' }
}

function Field({ label, req, err, children }: { label: string; req?: boolean; err?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={s.label}>{label} {req && <span style={{ color: '#DC2626' }}>*</span>}</label>
      {children}
      {err && <span style={{ fontSize: 11, color: '#DC2626' }}>{err}</span>}
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={s.card}>
      <div style={s.head}>{title}</div>
      <div style={s.body2}>{children}</div>
    </div>
  )
}

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; err?: boolean } | null>(null)
  const [feePreview, setFeePreview] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<MOUFormData>({
    resolver: zodResolver(mouSchema),
    defaultValues,
  })

  const feeVal = watch('fee')

  const showToast = (msg: string, err?: boolean) => {
    setToast({ msg, err })
    setTimeout(() => setToast(null), 4000)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('File gambar maksimal 2MB', true)
        return
      }
      const reader = new FileReader()
      reader.onload = (evt) => {
        const result = evt.target?.result as string
        setImagePreview(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: MOUFormData) => {
    // If image was uploaded, add it to formData
    if (imagePreview) {
      data.signatureImage = imagePreview
    }
    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const cd = res.headers.get('Content-Disposition') || ''
      const filename = cd.match(/filename="?([^"]+)"?/)?.[1] || `MOU_${data.kolName}.docx`
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob); a.download = filename; a.click()
      showToast('✅ DOCX berhasil didownload!')
    } catch {
      showToast('Gagal generate dokumen', true)
    } finally {
      setLoading(false)
    }
  }

  const feeNum = feeVal ? parseInt(feeVal.replace(/[^0-9]/g, ''), 10) : 0
  const feeDisplay = feeNum ? `Rp ${formatFee(feeVal)} (${terbilangCapital(feeVal)} rupiah)` : ''

  return (
    <div style={s.body}>
      <header style={s.header}>
        <b style={{ fontSize: 14 }}>PT Eka Jaya Internasional</b>
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,.25)' }} />
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,.65)' }}>MOU Generator</span>
      </header>

      {toast && (
        <div style={{ position: 'fixed', top: 58, right: 14, background: '#fff', borderRadius: 8, padding: '11px 15px', boxShadow: '0 6px 20px rgba(0,0,0,.13)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, zIndex: 99, borderLeft: `3px solid ${toast.err ? '#DC2626' : '#16A34A'}`, minWidth: 240 }}>
          {toast.msg}
        </div>
      )}

      <main style={s.main}>
        <h1 style={{ fontSize: 19, fontWeight: 700, marginBottom: 4 }}>Buat MOU KOL</h1>
        <p style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>Pilih tipe pembayaran → isi form → klik Download. Field <b style={{ color: '#DC2626' }}>*</b> wajib diisi.</p>

        <Card title="Tipe Pembayaran">
          <div style={{ display: 'flex', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="radio" {...register('paymentType')} value="pribadi" style={{ cursor: 'pointer' }} />
              <span style={{ fontSize: 14 }}>Pribadi (Individual KOL)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="radio" {...register('paymentType')} value="nonpkp" style={{ cursor: 'pointer' }} />
              <span style={{ fontSize: 14 }}>Non-PKP (CV / Badan Usaha)</span>
            </label>
          </div>
        </Card>

        <Card title="Informasi MOU">
          <div style={s.row2}>
            <Field label="Nomor MOU" req err={errors.mouNumber?.message}>
              <input {...register('mouNumber')} style={inp(errors.mouNumber?.message)} placeholder="MOU/2026/KOL/06/001" />
            </Field>
            <Field label="Tanggal" req err={errors.date?.message}>
              <input {...register('date')} style={inp(errors.date?.message)} placeholder="10 Juni 2026" />
            </Field>
          </div>
        </Card>

        <Card title={watch('paymentType') === 'pribadi' ? 'Informasi Talent' : 'Informasi Perusahaan'}>
          {watch('paymentType') === 'pribadi' ? (
            <>
              <Field label="Nama Lengkap" req err={errors.kolName?.message}>
                <input {...register('kolName')} style={inp(errors.kolName?.message)} placeholder="Nama sesuai KTP" />
              </Field>
              <div style={s.row2}>
                <Field label="Nomor KTP">
                  <input {...register('ktp')} style={inp()} placeholder="3276022712010004" />
                </Field>
                <Field label="NPWP">
                  <input {...register('npwp')} style={inp()} placeholder="12.345.678.9-012.000" />
                </Field>
              </div>
              <Field label="Alamat (sesuai KTP)" req err={errors.address?.message}>
                <textarea {...register('address')} style={{ ...inp(errors.address?.message), minHeight: 68, resize: 'vertical' }} placeholder="Jl. Contoh No. 1, RT 003/010, Kel. Nama, Kec. Nama, Kota" />
              </Field>
            </>
          ) : (
            <>
              <Field label="Nama Perusahaan / CV" req err={errors.companyName?.message}>
                <input {...register('companyName')} style={inp(errors.companyName?.message)} placeholder="CV Maju Bersama Buzzlink" />
              </Field>
              <Field label="Nama Direktur Utama" req err={errors.companyDirector?.message}>
                <input {...register('companyDirector')} style={inp(errors.companyDirector?.message)} placeholder="Hasyim Rizki" />
              </Field>
              <Field label="NPWP Perusahaan" req err={errors.npwp?.message}>
                <input {...register('npwp')} style={inp(errors.npwp?.message)} placeholder="12.345.678.9-012.000" />
              </Field>
              <Field label="Alamat Kantor" req err={errors.address?.message}>
                <textarea {...register('address')} style={{ ...inp(errors.address?.message), minHeight: 68, resize: 'vertical' }} placeholder="Jl. Kantor No. 1, Kota, Provinsi" />
              </Field>
            </>
          )}
          <div style={s.row2}>
            <Field label="Nomor HP">
              <input {...register('phone')} style={inp()} placeholder="081234567890" />
            </Field>
            <Field label="Akun Handle" req err={errors.kolHandle?.message}>
              <input {...register('kolHandle')} style={inp(errors.kolHandle?.message)} placeholder="@nama_akun" />
            </Field>
          </div>
          <Field label="Platform / Role">
            <input {...register('kolRole')} style={inp()} placeholder="KOL TikTok" />
          </Field>
        </Card>

        <Card title="Informasi Campaign">
          <Field label="Nama Produk" req err={errors.product?.message}>
            <input {...register('product')} style={inp(errors.product?.message)} placeholder="Eomma Head to Toe, Hair Lotions…" />
          </Field>
          <div style={s.row2}>
            <Field label="Periode Campaign" req err={errors.campaignPeriod?.message}>
              <input {...register('campaignPeriod')} style={inp(errors.campaignPeriod?.message)} placeholder="11 - 30 Juni 2026" />
            </Field>
            <Field label="Fee (angka saja)" req err={errors.fee?.message}>
              <input {...register('fee')} style={inp(errors.fee?.message)} placeholder="10256410" />
            </Field>
          </div>
          {feeDisplay && (
            <div style={{ fontSize: 12, color: '#475569', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 6, padding: '8px 10px' }}>
              {feeDisplay}
            </div>
          )}
          <Field label="SOW / Deliverables" req err={errors.sow?.message}>
            <textarea {...register('sow')} style={{ ...inp(errors.sow?.message), minHeight: 68, resize: 'vertical' }} placeholder="1x TikTok Video, Mirroring IG & Facebook" />
          </Field>
        </Card>

        <Card title="Informasi Pembayaran">
          <div style={s.row3}>
            <Field label="Bank" req err={errors.bank?.message}>
              <input {...register('bank')} style={inp(errors.bank?.message)} placeholder="BCA" />
            </Field>
            <Field label="No. Rekening" req err={errors.accountNumber?.message}>
              <input {...register('accountNumber')} style={inp(errors.accountNumber?.message)} placeholder="7402004226" />
            </Field>
            <Field label="Atas Nama" req err={errors.accountName?.message}>
              <input {...register('accountName')} style={inp(errors.accountName?.message)} placeholder="Nama Pemilik" />
            </Field>
          </div>
          <Field label="Waktu Pembayaran">
            <select {...register('paymentTiming')} style={{ ...inp(), appearance: 'none', paddingRight: 30, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23475569' d='M6 8L0 0h12z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
              <option value="before">100% Sebelum Kerja Sama Diselesaikan</option>
              <option value="after">100% Sesudah Kerja Sama Diselesaikan</option>
            </select>
          </Field>
        </Card>

        <Card title="Tanda Tangan / Gambar">
          <Field label="Upload Tanda Tangan / Gambar (Opsional)">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ ...inp(), padding: '6px 10px', cursor: 'pointer' }}
            />
          </Field>
          {imagePreview && (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: 8 }}>Preview:</p>
              <img src={imagePreview} alt="Signature preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 6, border: '1px solid #E2E8F0' }} />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null)
                  const input = document.querySelector('input[type="file"]') as HTMLInputElement
                  if (input) input.value = ''
                  const hiddenInput = document.querySelector('input[name="signatureImage"]') as HTMLInputElement
                  if (hiddenInput) hiddenInput.value = ''
                }}
                style={{ marginTop: 8, padding: '6px 12px', fontSize: 12, background: '#EF4444', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
              >
                Hapus Gambar
              </button>
            </div>
          )}
          <input {...register('signatureImage')} type="hidden" />
        </Card>
      </main>

      <div style={s.bar}>
        <div style={{ flex: 1, fontSize: 13, color: '#64748B' }}>
          <strong style={{ display: 'block', fontSize: 14, color: '#1E293B' }}>Siap generate?</strong>
          Pastikan semua data sudah benar.
        </div>
        <button onClick={handleSubmit(onSubmit)} disabled={loading} style={{ ...s.btn, opacity: loading ? .6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '⏳' : '⬇'} Download DOCX
        </button>
      </div>
    </div>
  )
}
