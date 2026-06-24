import { z } from 'zod'

export const mouSchema = z.object({
  paymentType:    z.enum(['pribadi', 'nonpkp']).default('pribadi'),
  mouNumber:      z.string().min(1, 'Nomor MOU wajib diisi'),
  date:           z.string().min(1, 'Tanggal wajib diisi'),
  kolName:        z.string().optional().default(''),
  companyName:    z.string().optional().default(''),
  companyDirector: z.string().optional().default(''),
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
  paymentTiming:  z.string().default('after'),
  signatureImage: z.string().optional().default(''),
}).refine(
  (data) => data.paymentType === 'pribadi' ? data.kolName.length > 0 : true,
  { message: 'Nama lengkap wajib diisi', path: ['kolName'] }
).refine(
  (data) => data.paymentType === 'nonpkp' ? data.companyName.length > 0 : true,
  { message: 'Nama perusahaan wajib diisi', path: ['companyName'] }
).refine(
  (data) => data.paymentType === 'nonpkp' ? data.companyDirector.length > 0 : true,
  { message: 'Nama direktur wajib diisi', path: ['companyDirector'] }
).refine(
  (data) => data.paymentType === 'nonpkp' ? data.npwp.length > 0 : true,
  { message: 'NPWP perusahaan wajib diisi', path: ['npwp'] }
)

export type MOUFormData = z.infer<typeof mouSchema>

export const defaultValues: MOUFormData = {
  paymentType: 'pribadi', mouNumber: '', date: '', kolName: '', companyName: '', companyDirector: '',
  ktp: '', npwp: '', address: '', phone: '', kolHandle: '', kolRole: '',
  product: '', campaignPeriod: '', sow: '', fee: '',
  bank: '', accountNumber: '', accountName: '',
  paymentTiming: 'after', signatureImage: '',
}
