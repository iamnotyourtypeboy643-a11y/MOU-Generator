const satuan = ['','satu','dua','tiga','empat','lima','enam','tujuh','delapan','sembilan',
  'sepuluh','sebelas','dua belas','tiga belas','empat belas','lima belas','enam belas',
  'tujuh belas','delapan belas','sembilan belas']
const puluhan = ['','','dua puluh','tiga puluh','empat puluh','lima puluh',
  'enam puluh','tujuh puluh','delapan puluh','sembilan puluh']

function ratusan(n: number): string {
  if (n < 20) return satuan[n]
  if (n < 100) return puluhan[Math.floor(n/10)] + (n%10 ? ' ' + satuan[n%10] : '')
  const h = Math.floor(n/100)
  const r = n % 100
  return (h === 1 ? 'seratus' : satuan[h] + ' ratus') + (r ? ' ' + ratusan(r) : '')
}

export function terbilang(n: number): string {
  if (n === 0) return 'nol'
  if (n < 0) return 'minus ' + terbilang(-n)
  if (n < 100) return ratusan(n)
  if (n < 1_000) return ratusan(n)
  if (n < 1_000_000) {
    const r = Math.floor(n/1000)
    const s = n % 1000
    return (r === 1 ? 'seribu' : ratusan(r) + ' ribu') + (s ? ' ' + ratusan(s) : '')
  }
  if (n < 1_000_000_000) {
    const r = Math.floor(n/1_000_000)
    const s = n % 1_000_000
    return ratusan(r) + ' juta' + (s ? ' ' + terbilang(s) : '')
  }
  const r = Math.floor(n/1_000_000_000)
  const s = n % 1_000_000_000
  return ratusan(r) + ' miliar' + (s ? ' ' + terbilang(s) : '')
}

// "8205128" → "8,205,128" (format dengan koma, sesuai MOU)
export function formatFee(raw: string): string {
  const n = parseInt(raw.replace(/[^0-9]/g, ''), 10)
  if (isNaN(n)) return raw
  return n.toLocaleString('en-US') // → "8,205,128"
}

// capitalize first letter
export function terbilangCapital(raw: string): string {
  const n = parseInt(raw.replace(/[^0-9]/g, ''), 10)
  if (isNaN(n)) return ''
  const t = terbilang(n)
  return t.charAt(0).toUpperCase() + t.slice(1)
}
