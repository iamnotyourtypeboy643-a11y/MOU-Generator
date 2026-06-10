# MOU Generator — System Architecture & Implementation Guide
**PT Eka Jaya Internasional | KOL Specialist Internal Tool**

---

## 1. What We Learned from Your Real MOU (qia_152)

From analysing the approved MOU, the template has these fill-in points:

| Location in Doc | What Goes There | Field Name |
|---|---|---|
| `Nomor:` (header & lampiran) | `MOU/2026/KOL/04/820` | `MOU_NUMBER` |
| `ditandatangani pada tanggal ____` | `8 Juni 2026` | `DATE` |
| Bold name of KOL (Pihak Kedua) | `Citra Bunga Putri S.S` | `KOL_NAME` |
| `...nomor pokok wajib pajak _____` | `3171064904941001` | `NPWP` |
| `[alamat sesuai KTP]` | Full address | `ADDRESS` |
| `[alamat]` in Pasal 9 Korespondensi | Full address | `ADDRESS` |
| `Nomor telp/HP:` | `085769199996` | `PHONE` |
| KOL signature block name | `Citra Bunga Putri` | `KOL_NAME` |
| KOL signature block title | `KOL Tiktok` | `KOL_ROLE` |
| Lampiran Row 1 — Produk | `Head to Toe, Nutrilocks…` | `PRODUCT` |
| Lampiran Row 2 — Periode | `1 - 30 Juni 2026` | `CAMPAIGN_PERIOD` |
| Lampiran Row 3 — Kerja Sama (SOW) | `1x Video TikTok, Mirroring IG & Facebook…` | `SOW` |
| Lampiran Row 4 — Biaya | `Rp 8.205.128` | `FEE` |
| Lampiran Row 6 — Bank | `BCA` | `BANK` |
| Lampiran Row 6 — Nomor Rekening | `8780121433` | `ACCOUNT_NUMBER` |
| Lampiran Row 6 — Atas Nama | `Citra Bunga Putri` | `ACCOUNT_NAME` |

**Key insight:** The template uses `_____` for KTP/name, `[alamat sesuai KTP]` and `[alamat]` for address, and blank cells in the Lampiran table. The backend replaces these specific strings.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (User)                        │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Next.js Frontend (React)                        │   │
│  │  - Input Form (3 sections)                       │   │
│  │  - Validation (client-side)                      │   │
│  │  - Download buttons (.docx / .pdf)               │   │
│  └──────────────┬──────────────────────────────────┘   │
└─────────────────┼───────────────────────────────────────┘
                  │ POST /api/generate
                  ▼
┌─────────────────────────────────────────────────────────┐
│                 Next.js Backend (API Routes)              │
│                                                          │
│  /api/generate                                           │
│  1. Receive form JSON                                    │
│  2. Load template.docx from /public/templates/           │
│  3. docxtemplater.setData(fields)                        │
│  4. docxtemplater.render() → Buffer                      │
│  5. Stream .docx response                                │
│                                                          │
│  /api/generate-pdf                                       │
│  1. Same as above                                        │
│  2. Write .docx to /tmp/                                 │
│  3. LibreOffice → .pdf                                   │
│  4. Stream .pdf response                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Folder Structure

```
mou-generator/
├── public/
│   └── templates/
│       └── template.docx          ← Master template (your file, modified)
├── src/
│   ├── app/
│   │   ├── page.tsx               ← Main form page
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── api/
│   │   ├── generate/
│   │   │   └── route.ts           ← POST → returns .docx
│   │   └── generate-pdf/
│   │       └── route.ts           ← POST → returns .pdf
│   ├── components/
│   │   ├── MOUForm.tsx            ← Main form component
│   │   ├── FormSection.tsx        ← Reusable section wrapper
│   │   └── FieldError.tsx         ← Inline error display
│   └── lib/
│       ├── generateDocx.ts        ← docxtemplater logic
│       ├── generatePdf.ts         ← LibreOffice conversion
│       └── validation.ts          ← Field validation rules
├── package.json
├── next.config.js
└── .env.local                     ← (empty for now, ready for Supabase)
```

---

## 4. Template Modification Strategy

The current template uses informal blanks (`_____`, `[alamat sesuai KTP]`).
We convert these to **docxtemplater tags** (`{FIELD_NAME}`).

### Replacements to make in template.docx XML:

| Find (in document.xml) | Replace with |
|---|---|
| `Nomor: ` *(both occurrences)* | `Nomor: {MOU_NUMBER}` |
| `tanggal ____,` | `tanggal {DATE},` |
| `_____, ` *(bold KOL name)* | `{KOL_NAME}, ` |
| `nomor pokok wajib pajak _____,` | `nomor pokok wajib pajak {KTP_NPWP},` |
| `[alamat sesuai KTP]` *(highlighted)* | `{ADDRESS}` |
| `[nama]` in Pasal 9 | `{KOL_NAME}` |
| `[alamat]` in Pasal 9 | `{ADDRESS}` |
| `Nomor telp/HP: ` → next cell | `Nomor telp/HP: {PHONE}` |
| `_______` *(signature KOL)* | `{KOL_NAME}` |
| Lampiran table cell 1 (Produk) | `{PRODUCT}` |
| Lampiran table cell 2 (Periode) | `{CAMPAIGN_PERIOD}` |
| Lampiran table cell 3 (SOW addendum) | add `{SOW}` after fixed text |
| Lampiran table cell 4 (Biaya amount) | `Rp {FEE}` |
| `Bank   :` row | `Bank   : {BANK}` |
| `Nomor Rekening  :` row | `Nomor Rekening  : {ACCOUNT_NUMBER}` |
| `Atas Nama  :` row | `Atas Nama  : {ACCOUNT_NAME}` |
| Lampiran signature KOL | `{KOL_NAME}` |

---

## 5. API Design

### POST `/api/generate` (DOCX)

**Request body:**
```json
{
  "mouNumber": "MOU/2026/KOL/04/001",
  "date": "9 Juni 2026",
  "kolName": "Nama KOL",
  "ktp": "3171064904941001",
  "npwp": "12.345.678.9-012.000",
  "address": "Jl. Contoh No. 1, Jakarta",
  "phone": "081234567890",
  "product": "Head to Toe, Sunny Sunscreen",
  "campaignPeriod": "1 - 30 Juni 2026",
  "sow": "1x Video TikTok, Mirroring IG & Facebook pada akun @handle",
  "fee": "5.000.000",
  "bank": "BCA",
  "accountNumber": "1234567890",
  "accountName": "Nama Pemilik Rekening",
  "kolRole": "KOL TikTok"
}
```

**Response:** Binary `.docx` stream with headers:
```
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
Content-Disposition: attachment; filename="MOU_NamaKOL_2026.docx"
```

### POST `/api/generate-pdf`
Same body. Returns `Content-Type: application/pdf`.

### Validation (both endpoints):
```json
{
  "required": ["mouNumber", "date", "kolName", "address", "product", "campaignPeriod", "sow", "fee", "bank", "accountNumber", "accountName"],
  "optional": ["ktp", "npwp", "phone", "kolRole"]
}
```

Error response (400):
```json
{ "error": "Validation failed", "fields": ["kolName", "product"] }
```

---

## 6. MOU Generation Workflow

```
User fills form
      ↓
Client-side validation (instant feedback)
      ↓ (all required fields valid)
Click "Generate DOCX" or "Generate PDF"
      ↓
POST /api/generate (or /generate-pdf)
      ↓
Backend: Load template.docx from /public/templates/
      ↓
Docxtemplater: replace {FIELD} tags
      ↓
Return binary buffer as download
      ↓
Browser auto-downloads file
      ↓
Done ✓ (< 3 seconds total)
```

---

## 7. PDF Generation Workflow

```
Backend receives POST /api/generate-pdf
      ↓
Generate .docx buffer (same as above)
      ↓
Write to /tmp/mou_{timestamp}.docx
      ↓
Spawn: libreoffice --headless --convert-to pdf /tmp/mou_xxx.docx
      ↓
Read /tmp/mou_{timestamp}.pdf
      ↓
Stream PDF to client
      ↓
Cleanup /tmp files
```

**Vercel note:** LibreOffice is NOT available on Vercel free tier.
Options:
- A) Use `docx-pdf` npm package (limited formatting fidelity)
- B) Deploy to Railway/Render/VPS with LibreOffice installed
- C) Use a PDF conversion API (CloudConvert, pdfcrowd — ~$0.01/page)
- D) **Recommended MVP shortcut**: Download DOCX → user prints to PDF manually

---

## 8. Recommended Libraries

| Package | Purpose | Install |
|---|---|---|
| `docxtemplater` | Template engine for .docx | `npm i docxtemplater` |
| `pizzip` | ZIP handler (required by docxtemplater) | `npm i pizzip` |
| `react-hook-form` | Form state + validation | `npm i react-hook-form` |
| `@hookform/resolvers` + `zod` | Schema validation | `npm i @hookform/resolvers zod` |
| `lucide-react` | Icons | `npm i lucide-react` |

**For PDF (optional):**
| Package | Purpose |
|---|---|
| `docx-pdf` | Node.js PDF conversion (no LibreOffice needed) |
| OR deploy with LibreOffice | Best quality |

---

## 9. Database Schema (Optional — for MOU history)

If you want to track generated MOUs (Supabase/PostgreSQL):

```sql
CREATE TABLE mou_records (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mou_number   TEXT NOT NULL UNIQUE,
  kol_name     TEXT NOT NULL,
  product      TEXT NOT NULL,
  campaign_period TEXT NOT NULL,
  fee          TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now(),
  created_by   TEXT,              -- email of KOL Specialist
  status       TEXT DEFAULT 'draft'  -- draft | sent | signed
);
```

For MVP (no database needed): files are generated on-the-fly, not stored.

---

## 10. Step-by-Step Build Plan (3–5 Days)

### Day 1 — Template Preparation & Backend Core
- [ ] Modify `template.docx`: replace all blanks with `{FIELD}` tags using XML editing
- [ ] Set up Next.js project: `npx create-next-app mou-generator --typescript`
- [ ] Install `docxtemplater`, `pizzip`
- [ ] Build `/api/generate` route — test with Postman/Thunder Client
- [ ] Verify DOCX output preserves formatting

### Day 2 — Frontend Form
- [ ] Build 3-section form (Talent / Campaign / Payment)
- [ ] Add Zod validation schema
- [ ] Wire form to `/api/generate`
- [ ] Test download in browser

### Day 3 — PDF + Polish
- [ ] Add PDF generation (docx-pdf or LibreOffice)
- [ ] Add loading states, error toasts
- [ ] Responsive layout (mobile-friendly)
- [ ] Test end-to-end with real KOL data

### Day 4 — Edge Cases & QA
- [ ] Test with long SOW text (table cell overflow)
- [ ] Test with/without NPWP field
- [ ] Verify Rupiah formatting (Rp 8.205.128)
- [ ] Test all required field validations

### Day 5 — Deployment
- [ ] Deploy to Vercel (DOCX only) OR Railway (DOCX + PDF)
- [ ] Share URL with team
- [ ] Internal walkthrough + feedback

---

## 11. UI Design Description

**Design philosophy:** Clean internal tool. No distractions. The form is the product.

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  [PT EJI logo]    MOU Generator           [?] Help   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  📋 Informasi MOU                                    │
│  ┌─────────────────────┬──────────────────────────┐ │
│  │ Nomor MOU           │ Tanggal                  │ │
│  └─────────────────────┴──────────────────────────┘ │
│                                                      │
│  👤 Informasi Talent                                 │
│  ┌────────────────────────────────────────────────┐ │
│  │ Nama Lengkap *                                  │ │
│  ├─────────────────────┬──────────────────────────┤ │
│  │ Nomor KTP           │ NPWP (opsional)          │ │
│  ├─────────────────────┴──────────────────────────┤ │
│  │ Alamat *                                        │ │
│  ├────────────────────────────────────────────────┤ │
│  │ Nomor HP (opsional)                             │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  📣 Informasi Campaign                               │
│  ┌────────────────────────────────────────────────┐ │
│  │ Produk *                                        │ │
│  ├─────────────────────┬──────────────────────────┤ │
│  │ Periode Campaign *  │ Fee (Rp) *               │ │
│  ├─────────────────────┴──────────────────────────┤ │
│  │ SOW / Deliverables *                            │ │
│  │ (textarea)                                      │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  🏦 Informasi Pembayaran                             │
│  ┌──────────┬─────────────────┬───────────────────┐ │
│  │ Bank *   │ No. Rekening *  │ Atas Nama *       │ │
│  └──────────┴─────────────────┴───────────────────┘ │
│                                                      │
│  [⬇ Download DOCX]        [⬇ Download PDF]          │
└──────────────────────────────────────────────────────┘
```

**Colors:** White bg, #1B4F72 primary (trustworthy, corporate), #E74C3C error red.
**Font:** Inter (system-ui fallback).
**Required fields:** marked with `*`, red border on error.

---

## 12. Critical Notes for Implementation

1. **Template tags must be in a single XML `<w:t>` run** — docxtemplater can't span `{` across runs. Use the unpack/pack scripts to merge split runs first.

2. **Rupiah formatting** — Store as text in the form (e.g., "8.205.128"). Don't auto-format on the backend; let the KOL Specialist type exactly what should appear.

3. **Date format** — Use Indonesian format: "9 Juni 2026" not "2026-06-09".

4. **NPWP blank handling** — If NPWP is empty, the template line reads "pemegang Kartu Tanda Penduduk dan nomor pokok wajib pajak {NPWP}" → replace with empty string. Consider using `{#NPWP}...{/NPWP}` conditional block.

5. **SOW field** — Append to existing standard text in the template, don't replace it. The fixed text ("Pihak Pertama membuat...") stays; `{SOW}` is appended as "Kerjasama dengan SOW {SOW}".

6. **File naming** — `MOU_{kolName}_{mouNumber}.docx` — sanitize special characters for filename safety.
