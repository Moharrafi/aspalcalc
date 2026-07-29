'use client';

import React from 'react';
import Image from 'next/image';
import {
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Droplets,
  Factory,
  Handshake,
  Home,
  Layers,
  Mail,
  MapPin,
  Package,
  Phone,
  Printer,
  ShieldCheck,
  SprayCan,
  Wrench,
} from 'lucide-react';

const products = [
  {
    size: '1 KG',
    name: 'Kemasan 1 KG',
    image: '/porto_aspal/1kg.png',
    coverage: '+/-1 m2',
    layers: '1-2 lapis',
    use: 'Perbaikan kecil, kamar mandi, dan area rembes ringan',
    price: 'Rp 35.000',
  },
  {
    size: '5 KG',
    name: 'Kemasan 5 KG',
    image: '/porto_aspal/5kg.png',
    coverage: '+/-5 m2',
    layers: '2-3 lapis',
    use: 'Rumah tinggal, teras, dak kecil, dan renovasi',
    price: 'Rp 135.000',
  },
  {
    size: '20 KG',
    name: 'Kemasan 20 KG',
    image: '/porto_aspal/20kg.png',
    coverage: '+/-20 m2',
    layers: '2-3 lapis',
    use: 'Gedung, ruko, proyek komersial, dan aplikator',
    price: 'Rp 600.000',
  },
  {
    size: '25 KG',
    name: 'Kemasan 25 KG',
    image: '/porto_aspal/25kg.png',
    coverage: '+/-25 m2',
    layers: '2-3 lapis',
    use: 'Pabrik, fasilitas industri, dan proyek volume besar',
    price: 'Rp 680.000',
  },
];

const valuePoints = [
  {
    icon: ShieldCheck,
    title: 'Pelapis Anti Bocor',
    description: 'Membentuk membran pelindung untuk membantu menahan rembesan air pada permukaan bangunan.',
  },
  {
    icon: Layers,
    title: 'Fleksibel',
    description: 'Lapisan emulsi aspal tetap elastis menghadapi perubahan suhu, panas, dan hujan.',
  },
  {
    icon: SprayCan,
    title: 'Mudah Diaplikasikan',
    description: 'Dapat diaplikasikan dengan kuas, roller, atau spray tanpa proses pemanasan material.',
  },
  {
    icon: Wrench,
    title: 'Untuk Retakan Halus',
    description: 'Membantu menutup pori dan retakan rambut setelah permukaan dibersihkan dan disiapkan.',
  },
];

const applicationAreas = [
  'Dak beton dan atap datar',
  'Kamar mandi dan toilet',
  'Teras, balkon, dan kanopi',
  'Dinding luar dan area rembes',
  'Basement dan ruang bawah tanah',
  'Kolam, water tank, dan area basah',
  'Ruko, gudang, pabrik, dan fasilitas industri',
  'Bangunan publik dan fasilitas komersial',
];

const serviceSteps = [
  'Survey kondisi permukaan, sumber rembesan, dan area pekerjaan.',
  'Pembersihan area dari debu, minyak, lumut, dan lapisan rapuh.',
  'Perbaikan retakan atau sambungan kritis bila diperlukan.',
  'Aplikasi lapis awal sebagai primer atau lapisan pengikat.',
  'Aplikasi 2-3 lapis sampai membentuk membran pelindung merata.',
  'Pemeriksaan akhir, dokumentasi, dan rekomendasi perawatan.',
];

const portfolio = [
  {
    image: '/porto_aspal/hasil.png',
    title: 'Dak fasilitas industri',
    note: 'Aplikasi lapisan pelindung pada area terbuka.',
  },
  {
    image: '/porto_aspal/masjid.png',
    title: 'Bangunan publik',
    note: 'Pekerjaan waterproofing untuk area bangunan beraktivitas tinggi.',
  },
  {
    image: '/porto_aspal/tembok.png',
    title: 'Tembok dan bidang vertikal',
    note: 'Pelapisan area rembes untuk membantu menjaga struktur.',
  },
  {
    image: '/porto_aspal/kolam.png',
    title: 'Area kolam dan water tank',
    note: 'Perlindungan bidang yang sering kontak dengan air.',
  },
];

const cooperationModels = [
  {
    title: 'Supply Material',
    description: 'Penyediaan produk ASPAL Emulsion Waterproofing untuk kontraktor, toko bangunan, aplikator, dan proyek.',
  },
  {
    title: 'Material + Aplikasi',
    description: 'Paket pekerjaan all-in mulai dari survey, material, tenaga aplikasi, sampai pemeriksaan akhir.',
  },
  {
    title: 'Kemitraan Distribusi',
    description: 'Kerja sama penjualan produk untuk wilayah atau kanal tertentu dengan dukungan materi promosi.',
  },
];

const contacts = [
  { icon: Phone, label: 'WhatsApp', value: '+62 895-1725-9583' },
  { icon: Phone, label: 'Telepon', value: '+62 895-1725-9583' },
  { icon: Mail, label: 'Email', value: 'aspallinfo@gmail.com' },
  { icon: MapPin, label: 'Alamat', value: 'Jl. Pahlawan No.41, Limus Nunggal, Cileungsi, Bogor' },
];

function PdfFooter({ page }: { page: string }) {
  return (
    <div className="absolute inset-x-10 bottom-8 flex items-center justify-between border-t border-[#d9d1bd] pt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#82765c]">
      <span>ASPAL Emulsion Waterproofing</span>
      <span>{page}</span>
    </div>
  );
}

function PageTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8 max-w-[620px]">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#8d7215]">{eyebrow}</p>
      <h2 className="mt-3 text-[36px] font-black leading-[1.05] text-[#161713]">{title}</h2>
      {description && <p className="mt-4 text-[14px] leading-7 text-[#55544d]">{description}</p>}
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-[13px] leading-6 text-[#4b4b45]">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#a98712]" />
      <span>{children}</span>
    </li>
  );
}

export default function CompanyProfilePage() {
  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-[#ddd7c7] text-[#171817]">
      <div className="no-print sticky top-0 z-50 border-b border-black/10 bg-[#f7f3e9]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Image src="/porto_aspal/logo.png" alt="Aspal Cair" width={80} height={80} className="h-10 w-10 object-contain" />
            <div className="min-w-0">
              <p className="truncate text-sm font-black uppercase">Company Profile ASPAL</p>
              <p className="truncate text-xs font-semibold text-[#766516]">Preview dokumen PDF kerja sama</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#171817] px-5 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5"
          >
            <Printer size={17} />
            Cetak / Simpan PDF
          </button>
        </div>
      </div>

      <main className="printable-area mx-auto flex max-w-[calc(210mm+48px)] flex-col gap-8 px-4 py-8 print:block print:max-w-none print:p-0">
        <section className="pdf-page relative mx-auto min-h-[297mm] w-[210mm] max-w-full overflow-hidden bg-[#111] text-white shadow-2xl print:shadow-none">
          <Image src="/porto_aspal/hasil.png" alt="Aplikasi waterproofing" fill priority sizes="210mm" className="object-cover opacity-55" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(0,0,0,0.94),rgba(0,0,0,0.68),rgba(0,0,0,0.22))]" />
          <div className="absolute left-10 right-10 top-10 flex items-start justify-between">
            <Image src="/porto_aspal/logo.png" alt="Aspal Cair" width={180} height={140} className="h-20 w-auto object-contain" />
            <div className="text-right text-[11px] font-bold uppercase tracking-[0.22em] text-[#f6cf31]">
              Company Profile
              <br />
              Cooperation Proposal
            </div>
          </div>

          <div className="absolute left-10 top-[245px] w-[470px]">
            <p className="mb-5 inline-flex rounded-full border border-[#f6cf31]/50 bg-[#f6cf31]/15 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#f6cf31]">
              Pelapis Anti Bocor
            </p>
            <h1 className="text-[54px] font-black leading-[0.98] tracking-tight">
              ASPAL Emulsion Waterproofing
            </h1>
            <p className="mt-6 text-[17px] font-medium leading-8 text-white/82">
              Solusi material dan jasa aplikasi waterproofing berbasis emulsi aspal untuk hunian,
              bangunan komersial, dan proyek industri.
            </p>
          </div>

          <div className="absolute bottom-28 right-6">
            <Image
              src="/porto_aspal/20kg.png"
              alt="Kemasan Aspal Cair 20 KG"
              width={420}
              height={580}
              priority
              className="h-[430px] w-auto object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.75)]"
            />
          </div>

          <div className="absolute bottom-12 left-10 right-10 grid grid-cols-3 gap-3">
            {[
              ['Produk', '1 KG, 5 KG, 20 KG, 25 KG'],
              ['Aplikasi', 'Material supply dan jasa all-in'],
              ['Kontak', '+62 895-1725-9583'],
            ].map(([label, value]) => (
              <div key={label} className="border-l-2 border-[#f6cf31] bg-white/8 px-4 py-3 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f6cf31]">{label}</p>
                <p className="mt-1 text-[13px] font-bold leading-5 text-white">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="pdf-page relative mx-auto min-h-[297mm] w-[210mm] max-w-full overflow-hidden bg-[#f8f4ea] p-10 shadow-2xl print:shadow-none">
          <PageTitle
            eyebrow="01 / Profil Perusahaan"
            title="Mitra material dan aplikasi waterproofing untuk proyek bangunan."
            description="ASPAL Emulsion Waterproofing berfokus pada penyediaan produk pelapis anti bocor berbasis emulsi aspal serta layanan aplikasi di lapangan untuk kebutuhan bangunan residensial, komersial, dan industri."
          />

          <div className="grid grid-cols-[1fr_260px] gap-7">
            <div className="space-y-5">
              <div className="rounded-lg border border-[#ddd4bf] bg-white p-6">
                <h3 className="text-[18px] font-black text-[#171817]">Ringkasan</h3>
                <p className="mt-3 text-[13.5px] leading-7 text-[#515049]">
                  Produk ini digunakan untuk membantu mengurangi kebocoran, rembesan, dan kerusakan akibat
                  air pada dak beton, atap, dinding, kamar mandi, kolam, water tank, hingga fasilitas industri.
                  Formula emulsi aspal memberikan lapisan fleksibel yang dapat diaplikasikan secara praktis
                  tanpa pemanasan.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {valuePoints.map((point) => {
                  const Icon = point.icon;
                  return (
                    <div key={point.title} className="rounded-lg border border-[#ddd4bf] bg-white p-5">
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-[#f1c91b] text-[#171817]">
                        <Icon size={22} />
                      </div>
                      <h3 className="text-[15px] font-black text-[#171817]">{point.title}</h3>
                      <p className="mt-2 text-[12px] leading-6 text-[#5a5a53]">{point.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg bg-[#171817] p-5 text-white">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#f6cf31]">Nilai Utama</p>
              <div className="mt-6 space-y-5">
                {[
                  ['4', 'varian kemasan'],
                  ['+/-1 m2', 'cakupan 1 kg untuk 2 lapis'],
                  ['2-3', 'lapis aplikasi standar'],
                  ['Rp120.000/m2', 'jasa all-in referensi'],
                ].map(([value, label]) => (
                  <div key={label} className="border-b border-white/12 pb-4 last:border-b-0">
                    <p className="text-[28px] font-black text-[#f6cf31]">{value}</p>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white/65">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-7 rounded-lg border border-[#ddd4bf] bg-white p-6">
            <h3 className="text-[18px] font-black text-[#171817]">Area Aplikasi</h3>
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2">
              {applicationAreas.map((area) => (
                <Bullet key={area}>{area}</Bullet>
              ))}
            </div>
          </div>
          <PdfFooter page="02" />
        </section>

        <section className="pdf-page relative mx-auto min-h-[297mm] w-[210mm] max-w-full overflow-hidden bg-white p-10 shadow-2xl print:shadow-none">
          <PageTitle
            eyebrow="02 / Produk"
            title="Lini kemasan untuk kebutuhan eceran, aplikator, dan proyek."
            description="Kemasan disiapkan untuk berbagai skala pekerjaan. Estimasi cakupan mengikuti referensi 1 kg untuk sekitar 1 m2 pada aplikasi 2 lapis, dengan hasil aktual menyesuaikan pori permukaan dan metode aplikasi."
          />

          <div className="grid grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product.size} className="rounded-lg border border-[#ddd4bf] bg-[#f8f4ea] p-4">
                <div className="relative h-[175px]">
                  <Image src={product.image} alt={product.name} fill sizes="25vw" className="object-contain" />
                </div>
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#8d7215]">{product.size}</p>
                <h3 className="mt-1 text-[15px] font-black text-[#171817]">{product.name}</h3>
                <p className="mt-2 min-h-[48px] text-[11px] leading-5 text-[#5a5a53]">{product.use}</p>
                <div className="mt-4 space-y-2 border-t border-[#ddd4bf] pt-3 text-[11px]">
                  <div className="flex justify-between gap-2">
                    <span className="text-[#82765c]">Cakupan</span>
                    <strong>{product.coverage}</strong>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#82765c]">Lapis</span>
                    <strong>{product.layers}</strong>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#82765c]">Harga</span>
                    <strong>{product.price}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-[1fr_280px] gap-6">
            <div className="rounded-lg border border-[#ddd4bf] p-6">
              <h3 className="text-[18px] font-black text-[#171817]">Catatan Teknis</h3>
              <ul className="mt-4 space-y-2">
                <Bullet>Estimasi kebutuhan standar: +/-1 kg untuk +/-1 m2 pada 2 lapis aplikasi.</Bullet>
                <Bullet>Tambahkan toleransi +/-10% untuk permukaan berpori, area luas, atau risiko kehilangan material.</Bullet>
                <Bullet>Permukaan harus bersih, kering sesuai rekomendasi, dan bebas debu/minyak agar daya lekat optimal.</Bullet>
                <Bullet>Harga bersifat referensi dan dapat berubah mengikuti volume pembelian serta lokasi pengiriman.</Bullet>
              </ul>
            </div>

            <div className="rounded-lg bg-[#171817] p-6 text-white">
              <Package className="h-9 w-9 text-[#f6cf31]" />
              <h3 className="mt-5 text-[20px] font-black leading-tight">Tersedia untuk supply dan proyek.</h3>
              <p className="mt-4 text-[12px] leading-6 text-white/70">
                Tim dapat membantu menghitung kebutuhan material berdasarkan luas area, jumlah lapisan,
                kondisi permukaan, dan jenis pekerjaan.
              </p>
            </div>
          </div>
          <PdfFooter page="03" />
        </section>

        <section className="pdf-page relative mx-auto min-h-[297mm] w-[210mm] max-w-full overflow-hidden bg-[#f8f4ea] p-10 shadow-2xl print:shadow-none">
          <PageTitle
            eyebrow="03 / Layanan Aplikasi"
            title="Paket pekerjaan waterproofing dari survey sampai finishing."
            description="Selain produk, ASPAL Emulsion Waterproofing dapat diposisikan sebagai mitra pelaksanaan pekerjaan waterproofing all-in untuk perusahaan, kontraktor, pengelola fasilitas, dan pemilik proyek."
          />

          <div className="grid grid-cols-[1fr_280px] gap-6">
            <div className="rounded-lg border border-[#ddd4bf] bg-white p-6">
              <h3 className="text-[18px] font-black text-[#171817]">Standar Alur Pekerjaan</h3>
              <div className="mt-5 grid gap-3">
                {serviceSteps.map((step, index) => (
                  <div key={step} className="grid grid-cols-[38px_1fr] gap-3 rounded-md bg-[#f8f4ea] p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#171817] text-[12px] font-black text-white">
                      {index + 1}
                    </div>
                    <p className="pt-1 text-[12.5px] leading-6 text-[#4f4e48]">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg bg-[#171817] p-6 text-white">
                <ClipboardCheck className="h-9 w-9 text-[#f6cf31]" />
                <p className="mt-5 text-[11px] font-black uppercase tracking-[0.16em] text-[#f6cf31]">
                  Paket All-in
                </p>
                <p className="mt-2 text-[28px] font-black">Rp120.000/m2</p>
                <p className="mt-3 text-[11px] leading-5 text-white/65">
                  Referensi material + jasa. Nilai akhir mengikuti survey, volume, akses kerja, dan lokasi proyek.
                </p>
              </div>
              <div className="rounded-lg border border-[#ddd4bf] bg-white p-6">
                <h3 className="text-[16px] font-black text-[#171817]">Kontrol Kualitas</h3>
                <ul className="mt-4 space-y-2">
                  <Bullet>Dokumentasi kondisi sebelum dan sesudah.</Bullet>
                  <Bullet>Ketebalan dan jumlah lapisan mengikuti kebutuhan area.</Bullet>
                  <Bullet>Evaluasi detail sambungan, sudut, retakan, dan titik drainase.</Bullet>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-4 gap-4">
            {[
              { icon: Home, title: 'Hunian' },
              { icon: Building2, title: 'Komersial' },
              { icon: Factory, title: 'Industri' },
              { icon: Droplets, title: 'Area Basah' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-lg border border-[#ddd4bf] bg-white p-5 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-[#f1c91b]">
                    <Icon size={24} />
                  </div>
                  <p className="mt-4 text-[14px] font-black">{item.title}</p>
                </div>
              );
            })}
          </div>
          <PdfFooter page="04" />
        </section>

        <section id="portfolio-page" className="pdf-page relative mx-auto min-h-[297mm] w-[210mm] max-w-full overflow-hidden bg-white p-10 shadow-2xl print:shadow-none">
          <PageTitle
            eyebrow="04 / Portofolio"
            title="Dokumentasi pekerjaan dan contoh aplikasi lapangan."
            description="Galeri berikut memperlihatkan tipe area aplikasi yang relevan untuk kebutuhan waterproofing perusahaan, bangunan publik, hunian, dan fasilitas industri."
          />

          <div className="grid grid-cols-2 gap-4">
            {portfolio.map((item) => (
              <div key={item.title} className="overflow-hidden rounded-lg border border-[#ddd4bf] bg-[#f8f4ea]">
                <div className="relative h-[150px]">
                  <Image src={item.image} alt={item.title} fill sizes="50vw" className="object-cover" />
                </div>
                <div className="p-3">
                  <h3 className="text-[15px] font-black text-[#171817]">{item.title}</h3>
                  <p className="mt-1 text-[11px] leading-5 text-[#5a5a53]">{item.note}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 grid grid-cols-[240px_1fr] gap-10 rounded-lg bg-[#171817] p-6 text-white">
            <div className="pr-2">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#f6cf31]">Kesiapan Proyek</p>
              <h3 className="mt-4 text-[20px] font-black leading-[1.15]">Pendekatan kerja berbasis survey.</h3>
            </div>
            <p className="pt-7 text-[12px] leading-6 text-white/72">
              Untuk kerja sama perusahaan, rekomendasi teknis sebaiknya diawali dengan survey area,
              identifikasi titik rembes, estimasi kebutuhan material, jadwal pekerjaan, dan batasan
              ruang lingkup agar penawaran lebih akurat.
            </p>
          </div>
          <PdfFooter page="05" />
        </section>

        <section id="cooperation-page" className="pdf-page relative mx-auto min-h-[297mm] w-[210mm] max-w-full overflow-hidden bg-[#f8f4ea] p-10 shadow-2xl print:shadow-none">
          <PageTitle
            eyebrow="05 / Skema Kerja Sama"
            title="Peluang kerja sama untuk supply, aplikasi, dan distribusi."
            description="Dokumen ini dapat digunakan sebagai pengantar awal kepada perusahaan calon mitra. Detail penawaran, harga final, dan ruang lingkup pekerjaan dapat disusun setelah diskusi dan survey kebutuhan."
          />

          <div className="grid grid-cols-3 gap-4">
            {cooperationModels.map((model) => (
              <div key={model.title} className="rounded-lg border border-[#ddd4bf] bg-white p-4">
                <Handshake className="h-7 w-7 text-[#a98712]" />
                <h3 className="mt-4 text-[15px] font-black leading-tight text-[#171817]">{model.title}</h3>
                <p className="mt-2 text-[11px] leading-5 text-[#5a5a53]">{model.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-[1fr_290px] gap-5">
            <div className="rounded-lg border border-[#ddd4bf] bg-white p-5">
              <h3 className="text-[17px] font-black text-[#171817]">Tahap Lanjutan yang Disarankan</h3>
              <ul className="mt-4 space-y-2">
                <Bullet>Diskusi kebutuhan perusahaan, lokasi proyek, dan jenis kerja sama yang diinginkan.</Bullet>
                <Bullet>Survey teknis untuk menghitung luasan, kondisi permukaan, dan titik risiko.</Bullet>
                <Bullet>Penyusunan penawaran resmi berisi volume, harga, durasi, dan lingkup pekerjaan.</Bullet>
                <Bullet>Pelaksanaan pekerjaan atau pengiriman material sesuai kesepakatan.</Bullet>
              </ul>
            </div>

            <div className="rounded-lg bg-[#171817] p-4 text-white">
              <Image src="/porto_aspal/logo.png" alt="Aspal Cair" width={150} height={120} className="h-12 w-auto object-contain" />
              <div className="mt-4 space-y-2">
                {contacts.map((contact) => {
                  const Icon = contact.icon;
                  return (
                    <div key={contact.label} className="flex gap-2.5 border-b border-white/10 pb-2 last:border-0">
                      <Icon className="mt-1 h-4 w-4 shrink-0 text-[#f6cf31]" />
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/45">{contact.label}</p>
                        <p className="mt-1 text-[11px] font-bold leading-4 text-white">{contact.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-[#ddd4bf] bg-white p-5">
            <div className="grid grid-cols-[1fr_220px] gap-6">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7215]">Penutup</p>
                <p className="mt-3 text-[12px] leading-6 text-[#4f4e48]">
                  ASPAL Emulsion Waterproofing siap menjadi mitra material dan aplikasi untuk kebutuhan
                  perlindungan bangunan dari kebocoran dan rembesan air.
                </p>
              </div>
              <div className="text-center">
                <p className="text-[12px] text-[#6f6a5b]">Hormat kami,</p>
                <div className="mt-10 border-t border-[#171817]" />
                <p className="mt-2 text-[12px] font-black">ASPAL Emulsion Waterproofing</p>
              </div>
            </div>
          </div>
          <PdfFooter page="06" />
        </section>
      </main>
    </div>
  );
}
