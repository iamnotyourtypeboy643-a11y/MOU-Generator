import { z } from 'zod'

export const mouSchema = z.object({
  mouNumber:      z.string().min(1, 'Nomor MOU wajib diisi'),
  date:           z.string().min(1, 'Tanggal wajib diisi'),
  kolName:        z.string().min(1, 'Nama lengkap wajib diisi'),
  ktp:            z.string().optional().default(''),
  npwp:           z.string().optional().default(''),
  address:        z.string().min(1, 'Alamat wajib diisi'),
  phone:          z.string().optional().default(''),
  kolHandle:      z.string().min(1, 'Akun handle wajib diisi'),
  kolRole:        z.string().optional().default(''),
  product:        z.string().min(1, 'Produk wajib diisi'),
  campaignPeriod: z.string().min(1, 'Periode wajib diisi'),
  sow:            z.string().min(1, 'SOW wajib diisi'),
  fee:            z.string().min(1, 'Fee wajib diisi').regex(/^[0-9.,]+$/, 'Fee harus berupa angka'),
  bank:           z.string().min(1, 'Bank wajib diisi'),
  accountNumber:  z.string().min(1, 'No. rekening wajib diisi'),
  accountName:    z.string().min(1, 'Atas nama wajib diisi'),
  paymentTiming:  z.string().default('before'),
  signatureImage: z.string().optional().default(''),
})

export type MOUFormData = z.infer<typeof mouSchema>

export const defaultValues: MOUFormData = {
  mouNumber: '', date: '', kolName: '', ktp: '', npwp: '',
  address: '', phone: '', kolHandle: '', kolRole: '',
  product: '', campaignPeriod: '', sow: '', fee: '',
  bank: '', accountNumber: '', accountName: '',
  paymentTiming: 'before', signatureImage: '',
}
