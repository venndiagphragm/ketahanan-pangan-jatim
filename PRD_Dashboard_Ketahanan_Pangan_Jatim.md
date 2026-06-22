# Product Requirements Document (PRD)
## Dashboard Analisis Spasial & Klasterisasi Ketahanan Pangan
### Kabupaten/Kota di Jawa Timur — Tahun 2021–2025

---

**Versi:** 1.0.0  
**Tanggal:** Juni 2025  
**Tim:** Kelompok A — Statistika Ofisial  
**Status:** Draft untuk Review

---

## 1. Executive Summary

Dashboard ini merupakan produk visualisasi data interaktif berbasis web yang menyajikan hasil analisis spasial dan klasterisasi K-Means terhadap 38 Kabupaten/Kota di Provinsi Jawa Timur selama periode 2021–2025. Analisis didasarkan pada sembilan variabel lintas dimensi — pertanian (produksi & produktivitas padi, luas panen), sosial-ekonomi (IPM, kemiskinan, TPT, kepadatan penduduk), dan kesehatan (prevalensi gizi kurang bayi) — yang dikompresi melalui PCA menjadi 5 Principal Component sebagai input K-Means (k=3).

Produk ini dirancang untuk menjawab satu pertanyaan utama: **apakah ketahanan pangan di Jawa Timur memiliki pola spasial yang terstruktur, dan seperti apa karakteristik tiap klaster wilayah?** Output dashboard harus mampu mengomunikasikan temuan ilmiah secara akurat kepada audiens akademis maupun pemangku kebijakan, dengan tampilan yang mencerminkan modernitas dan identitas kultural Jawa Timur.

---

## 2. Latar Belakang & Konteks Proyek

### 2.1 Konteks Akademis

Jawa Timur adalah provinsi dengan kompleksitas ketahanan pangan yang tinggi: terdapat disparitas tajam antara Kota metropolitan seperti Surabaya (IKP ~73, kemiskinan 3,5%) dengan kabupaten di Kepulauan Madura seperti Sampang (IKP ~63, kemiskinan 20,6%). Analisis statistik multivariate diperlukan untuk mengidentifikasi pola tersebut secara sistematis.

### 2.2 Metode Analisis yang Digunakan

**Tahap 1 — Reduksi Dimensi (PCA):**  
Lima variabel input (IPM, Kemiskinan, TPT, Kepadatan Penduduk, Prevalensi Gizi Kurang) distandarisasi lalu ditransformasi menjadi 5 Principal Component. PC1 dan PC2 menangkap keragaman terbesar dan menjadi basis clustering.

**Tahap 2 — Klasterisasi (K-Means, k=3):**  
Jumlah cluster optimal ditentukan melalui Elbow Method dan Silhouette Score. Tiga cluster yang terbentuk:
- **Cluster 1** — 28 observasi: wilayah dengan tekanan sosial-ekonomi tinggi (dominan 2024, tahun transisi data)
- **Cluster 2** — 117 observasi: wilayah dengan karakteristik tengah/tipikal Jawa Timur
- **Cluster 3** — 45 observasi: wilayah perkotaan dengan IPM tinggi dan kepadatan padat

**Tahap 3 — Analisis Spasial (Moran's I & LISA):**  
Uji autokorelasi spasial untuk IKP menggunakan bobot spasial berbasis ketetanggaan (queen contiguity). Jika H1 terbukti (ada pola spasial), dilanjutkan dengan LISA untuk pemetaan hotspot lokal.

### 2.3 Sumber Data

| File | Deskripsi | Cakupan |
|---|---|---|
| `data_offstat.xlsx` | Data primer BPS/Offstat — 14 variabel | 38 Kab/Kota x 5 Tahun |
| `hasil_cluster.xlsx` | Output K-Means — skor PCA, label Cluster | 38 Kab/Kota x 5 Tahun |
| `data_merged.csv` | Gabungan kedua file di atas | 190 baris x 29 kolom |
| `jatim_cluster_all_years.geojson` | Geometri batas Kab/Kota + semua atribut | EPSG:4326, 190 features |

**Rentang data aktual: 2021–2025** (5 tahun, 38 wilayah, 190 total observasi)

---

## 3. Tujuan Produk

### 3.1 Tujuan Primer
- Menyajikan persebaran spasial Indeks Ketahanan Pangan (IKP) secara interaktif dan dapat difilter per tahun
- Memvisualisasikan hasil klasterisasi K-Means pada peta Jawa Timur
- Menampilkan hasil uji Moran's I dan analisis LISA sebagai bukti validitas pola spasial
- Menyediakan profil komparatif per Kabupaten/Kota yang dapat diakses melalui interaksi peta

### 3.2 Tujuan Sekunder
- Membangun narasi visual yang memperkuat kredibilitas analisis kepada audiens akademis
- Menciptakan pengalaman eksplorasi data yang fluid dan modern sebagai representasi kualitas kerja tim

---

## 4. Target Pengguna

| Segmen | Karakteristik | Kebutuhan Utama |
|---|---|---|
| **Akademisi / Reviewer** | Statistikawan, dosen penguji | Validitas metodologi, angka akurat, sumber data jelas |
| **Mahasiswa Statistika** | Membaca laporan tim | Pemahaman visual alur analisis |
| **Pemangku Kebijakan** | Dinas Pertanian, Bappeda Jatim | Identifikasi daerah prioritas, perbandingan antar wilayah |
| **Publik Umum** | Mengakses via link laporan | Overview cepat, tampilan menarik |

---

## 5. Identitas Visual & Design System

### 5.1 Filosofi Desain

Dashboard ini menggabungkan dua nilai yang tampak bertentangan namun saling menguatkan: **rigoritas ilmiah** (data akurat, metodologi transparan, label yang presisi) dan **modernitas visual** (animasi fluid, tipografi kontemporer, layout dinamis). Identitas Jawa Timur hadir bukan sebagai ornamen dekoratif, tetapi sebagai konteks kultural yang memperkuat narasi data.

### 5.2 Palet Warna Utama

Warna diinspirasi dari elemen ikonik Jawa Timur: merah Suro-Boyo, hijau sawah, biru laut Selat Madura, dan emas batik Sidoarjo.

| Token | Hex | Penggunaan |
|---|---|---|
| `--color-primary` | `#C0392B` | CTA button, aksen utama, heading hero |
| `--color-primary-dark` | `#96281B` | Hover state primary |
| `--color-gold` | `#D4A017` | Highlight metrik kunci, border aksen |
| `--color-green-sawah` | `#2E7D32` | Indikator positif, Cluster berkinerja tinggi |
| `--color-blue-madura` | `#1565C0` | Link, elemen peta air |
| `--color-dark-bg` | `#0D1117` | Background utama (dark mode default) |
| `--color-surface` | `#161B22` | Card surface |
| `--color-surface-elevated` | `#21262D` | Hover card, tooltip |
| `--color-text-primary` | `#E6EDF3` | Teks utama |
| `--color-text-muted` | `#8B949E` | Label, caption, subtitle |
| `--color-border` | `#30363D` | Garis border halus |

### 5.3 Skema Warna Choropleth

**Peta IKP** — Sequential diverging dari rendah ke tinggi:
```
Merah tua (#7B1FA2) -> Oranye (#E65100) -> Kuning (#FDD835) -> Hijau muda (#81C784) -> Hijau tua (#2E7D32)
```
Breakpoint IKP: < 65 | 65–70 | 70–75 | 75–80 | > 80

**Peta Cluster** — Tiga warna diskret dengan kontras tinggi:
```
Cluster 1: #EF5350  (merah  — tekanan tinggi)
Cluster 2: #42A5F5  (biru   — karakteristik tengah)
Cluster 3: #66BB6A  (hijau  — perkotaan maju)
```

**Peta LISA** — Empat kategori standar:
```
High-High : #D32F2F    Low-Low  : #1976D2
High-Low  : #FF8F00    Low-High : #7B1FA2
Not Significant: #455A64
```

### 5.4 Tipografi

```
Font Heading : "Plus Jakarta Sans" (Google Fonts) — modern, Indonesian-made
Font Body    : "Inter"            — readability tinggi untuk data label
Font Mono    : "JetBrains Mono"   — angka statistik, nilai koordinat
```

### 5.5 Aset Visual Landmark Jawa Timur

Foto-foto berikut digunakan sebagai background visual pada Landing Page dan transisi antar halaman. Semua foto menggunakan lisensi bebas (Unsplash/Pexels/Wikimedia Commons) atau digantikan dengan ilustrasi SVG custom.

| Aset | Landmark | Penggunaan |
|---|---|---|
| `hero-bromo.jpg` | Kawah Gunung Bromo | Hero section background (parallax) |
| `surabaya-night.jpg` | Skyline Surabaya malam | Section statistik kota |
| `madura-bridge.jpg` | Jembatan Suramadu | Transisi ke halaman peta |
| `sawah-jatim.jpg` | Hamparan sawah padi | Background section pertanian |
| `tugu-pahlawan.jpg` | Tugu Pahlawan Surabaya | Footer / about section |

Semua foto diterapkan dengan `backdrop-blur` dan `overlay` gelap (`rgba(0,0,0,0.65)`) agar teks tetap terbaca dan data tetap menjadi fokus utama.

---

## 6. Arsitektur & Alur Website

### 6.1 Struktur Halaman

```
/              -> Landing Page (Hero + Metrik + CTA + Struktur Halaman)
/overview      -> Halaman 1: Overview Jawa Timur
/peta-ikp      -> Halaman 2: Choropleth Map IKP + Moran's I
/peta-cluster  -> Halaman 3: Choropleth Map Cluster + LISA
/profil        -> Halaman 4: Profil Kabupaten/Kota
```

### 6.2 Navigasi

- **Navbar** fixed di atas, transparan saat di hero, solid saat scroll — berisi logo proyek, link ke tiap halaman, dan badge "Kelompok A"
- **Progress indicator** berbentuk garis horizontal di bawah navbar yang menunjukkan posisi scroll
- **Side navigation dots** (kanan layar) untuk navigasi cepat antar section dalam satu halaman panjang

---

## 7. Spesifikasi Halaman — Landing Page

### 7.1 Section 1: Hero Full-Screen

**Layout:** Full viewport height (100vh), background foto Gunung Bromo dengan parallax scroll effect.

**Konten:**
```
[Logo / Nama Proyek — kecil, atas kiri]

ANALISIS SPASIAL &
KLASTERISASI KETAHANAN PANGAN
Jawa Timur 2021–2025

Subtitle: Mengungkap pola spasial ketahanan pangan
38 Kabupaten/Kota melalui K-Means Clustering,
Moran's I, dan analisis LISA berbasis data BPS.

[▼ Scroll untuk Menjelajahi]
```

**Animasi:** Teks masuk dengan `fade-in + translateY` staggered, kata "KETAHANAN PANGAN" di-highlight dengan warna `--color-gold`.

**Technical:** Background video loop subtle (awan bergerak di atas Bromo) sebagai fallback jika foto statis terasa kurang dinamis. Gunakan `<video>` dengan `autoplay muted loop playsinline`.

### 7.2 Section 2: Metrik Kunci (Key Statistics)

**Layout:** 4 kartu metrik horizontal, dengan counter animation saat masuk viewport (Intersection Observer).

| Kartu | Nilai | Label |
|---|---|---|
| 38 | Kabupaten/Kota | Total wilayah analisis |
| 74.2 | Rata-rata IKP | Indeks Ketahanan Pangan |
| 75.1 | Rata-rata IPM | Indeks Pembangunan Manusia |
| 11.8% | Rata-rata Kemiskinan | Persentase penduduk miskin |

> Nilai di atas adalah rata-rata keseluruhan 2021–2025 dari `data_merged.csv`. Tampilkan dengan animasi count-up dari 0 ke nilai akhir selama 1.5 detik saat kartu pertama kali masuk viewport.

**Detail tambahan per kartu:**
- IKP: Tampilkan range (min: 61.95 — Sampang 2021, max: 92.49)
- IPM: Tertinggi Kota Surabaya (85.65), terendah Sampang (66.72)
- Kemiskinan: Tertinggi Sampang (23.76%), terendah Kota Batu (2.86%)

### 7.3 Section 3: CTA Utama

**Layout:** Full-width section dengan background foto sawah padi Jawa Timur.

```
MULAI MENJELAJAHI DATA

[  Jelajahi Dashboard ->  ]     [ Lihat Metodologi ]
```

Tombol CTA utama: merah `--color-primary`, ukuran besar (padding 16px 48px), dengan efek ripple saat diklik dan hover glow effect.

### 7.4 Section 4: Panduan Struktur Dashboard

**Layout:** 4 kartu horizontal yang mendeskripsikan tiap halaman. Kartu muncul dengan stagger animation (delay 100ms antar kartu).

**Kartu 1 — Overview:**
```
[Icon: BarChart]
Overview Jawa Timur
Statistik agregat, distribusi IKP per tahun,
dan komposisi klaster di seluruh wilayah.
[-> Lihat Overview]
```

**Kartu 2 — Peta IKP:**
```
[Icon: Map]
Peta Ketahanan Pangan
Choropleth IKP interaktif dengan slider tahun
dan hasil uji autokorelasi spasial Moran's I.
[-> Lihat Peta IKP]
```

**Kartu 3 — Peta Cluster:**
```
[Icon: Layers]
Peta Klasterisasi
Persebaran 3 klaster K-Means dengan analisis
LISA untuk identifikasi hotspot lokal.
[-> Lihat Peta Cluster]
```

**Kartu 4 — Profil Wilayah:**
```
[Icon: Search]
Profil Kabupaten/Kota
Eksplorasi detail per wilayah dengan filter
tahun dan perbandingan antar kabupaten/kota.
[-> Lihat Profil]
```

### 7.5 Section 5: Tentang Proyek

**Layout:** Dua kolom — kiri teks, kanan foto Tugu Pahlawan.

```
Tentang Proyek Ini

Proyek ini merupakan tugas akhir mata kuliah Statistika
Ofisial yang menganalisis dimensi ketahanan pangan di
Jawa Timur secara komprehensif. Dengan mengintegrasikan
data pertanian, sosial-ekonomi, dan kesehatan dari BPS
selama 5 tahun, kami membangun model klasterisasi dan
analisis spasial untuk mengidentifikasi pola distribusi
ketahanan pangan antar wilayah.

Variabel: IKP, IPM, Kemiskinan, TPT, Kepadatan Penduduk,
Produksi Padi, Produktivitas Padi, Luas Panen, Gizi Kurang

Metode: PCA -> K-Means (k=3) -> Moran's I -> LISA

[Kelompok A — Statistika Ofisial 2025]
```

---

## 8. Spesifikasi Halaman 1 — Overview Jawa Timur

### 8.1 Layout

Sidebar kiri (filter) + konten utama (kanan). Filter: dropdown Tahun (2021–2025, default: "Semua Tahun").

### 8.2 Komponen Metrik Summary

4 kartu statistik yang berubah responsif terhadap filter tahun:

| Metrik | Kolom Sumber | Format |
|---|---|---|
| Jumlah Kabupaten/Kota | Count `Kabupaten/Kota` | Integer (38) |
| Rata-rata IKP | `IKP_offstat` | 2 desimal |
| Rata-rata IPM | `IPM` | 2 desimal |
| Rata-rata Kemiskinan | `Kemiskinan` | 2 desimal + "%" |

### 8.3 Komponen Chart

**Chart 1 — Tren IKP per Tahun (Line Chart):**
- X: Tahun (2021–2025), Y: Rata-rata IKP
- Series: Jawa Timur keseluruhan | Kabupaten | Kota
- Library: Recharts atau Chart.js

**Chart 2 — Distribusi IKP (Histogram/KDE):**
- Distribusi nilai IKP semua wilayah untuk tahun yang dipilih
- Tampilkan garis mean dan median

**Chart 3 — Komposisi Cluster (Donut Chart):**
- Proporsi Cluster 1 / 2 / 3 untuk tahun yang dipilih
- Warna sesuai design system

**Chart 4 — Scatter Plot PC1 vs PC2:**
- Warna titik berdasarkan cluster
- Hover tooltip: nama wilayah, nilai PC1/PC2, cluster
- Membantu pembaca memahami dasar visualisasi klasterisasi

**Chart 5 — Bar Chart IKP per Wilayah:**
- Horizontal bar chart, 38 wilayah, warna bar berdasarkan cluster
- Sort: ascending IKP, scrollable jika terlalu panjang

### 8.4 Komponen Tabel Ringkasan Cluster

| Cluster | IKP | IPM | Kemiskinan | TPT | Gizi Kurang | Produksi Padi | Karakteristik |
|---|---|---|---|---|---|---|---|
| 1 | rata-rata | rata-rata | rata-rata | rata-rata | rata-rata | rata-rata | Tekanan tinggi |
| 2 | rata-rata | rata-rata | rata-rata | rata-rata | rata-rata | rata-rata | Tipikal/menengah |
| 3 | rata-rata | rata-rata | rata-rata | rata-rata | rata-rata | rata-rata | Perkotaan maju |

> Nilai diambil dari rata-rata `data_merged.csv` dikelompokkan per `Cluster`.

---

## 9. Spesifikasi Halaman 2 — Peta IKP & Moran's I

### 9.1 Layout

Split screen: Peta kiri (65%) | Panel analisis kanan (35%).

### 9.2 Komponen Peta Choropleth IKP

**Library:** Leaflet.js atau Mapbox GL JS  
**Data:** `jatim_cluster_all_years.geojson` difilter per tahun  
**Kolom nilai:** `IKP_offstat`

**Kontrol Peta:**
- Slider tahun (2021–2025) dengan auto-play button (animasi peta bergerak per tahun)
- Toggle: tampilkan/sembunyikan label nama wilayah
- Zoom to extent button (reset ke bounding box Jawa Timur)

**Interaksi:**
- Hover: tooltip muncul dengan nama wilayah + nilai IKP + tahun
- Click: panel kanan menampilkan detail wilayah tersebut
- Highlight border saat hover (border menjadi `--color-gold`, 2px)

**Legend:** 5 kelas warna sequential (jenks natural breaks), posisi pojok kanan bawah.

### 9.3 Tooltip Peta IKP

```
+-----------------------------+
| Kabupaten Sampang           |
| Tahun : 2023                |
| IKP   : 63.85               |
| IPM   : 66.72               |
| Kemiskinan : 20.83%         |
| Cluster    : 2              |
+-----------------------------+
```

### 9.4 Panel Kanan: Hasil Moran's I

**Sub-panel A — Hipotesis:**
```
Uji Moran's I — Autokorelasi Spasial IKP

H0 : Tidak terdapat autokorelasi spasial
     (pola distribusi IKP bersifat acak)
H1 : Terdapat autokorelasi spasial
     (wilayah berdekatan memiliki nilai IKP serupa)

Bobot Spasial : Queen Contiguity
Tahun Dipilih : [dropdown]
```

**Sub-panel B — Hasil Uji:**
```
+---------------------------------+
|   HASIL UJI MORAN'S I           |
|                                 |
|   Moran's I  :  [nilai]         |
|   p-value    :  [nilai]         |
|   z-score    :  [nilai]         |
|                                 |
|   [SIGNIFIKAN / TIDAK]          |
|   pada alpha = 0.05             |
|                                 |
|   Kesimpulan : [teks otomatis]  |
+---------------------------------+
```

> Nilai Moran's I di-precompute menggunakan `pysal` / `libpysal` dan disimpan sebagai JSON statis per tahun.

**Sub-panel C — Moran Scatter Plot:**
- Scatter plot lag spasial vs nilai IKP (standarisasi)
- 4 kuadran dengan label: HH, LH, LL, HL
- Garis regresi OLS

**Logika Teks Kesimpulan Otomatis:**
```
Jika p_value < 0.05 AND morans_i > 0:
  -> "IKP menunjukkan pola pengelompokan spasial positif yang signifikan.
      Wilayah dengan IKP tinggi cenderung berdekatan dengan wilayah IKP
      tinggi lainnya, dan sebaliknya. H1 diterima."

Jika p_value < 0.05 AND morans_i < 0:
  -> "Terdapat pola spasial dispersi yang signifikan. H1 diterima."

Jika p_value >= 0.05:
  -> "Tidak cukup bukti untuk menolak H0. Pola IKP bersifat acak."
```

---

## 10. Spesifikasi Halaman 3 — Peta Cluster & LISA

### 10.1 Layout

Peta penuh atas (60vh) | Panel analisis bawah (2 kolom).

### 10.2 Komponen Peta Choropleth Cluster

**Kolom nilai:** `Cluster` (1, 2, atau 3)  
**Warna:** Cluster 1=#EF5350, Cluster 2=#42A5F5, Cluster 3=#66BB6A

**Toggle layer:**
- Layer A: Warna berdasarkan Cluster K-Means
- Layer B: Warna berdasarkan kategori LISA (HH/LL/HL/LH/NS)

Slider tahun konsisten dengan Halaman 2.

### 10.3 Tooltip Peta Cluster

```
+-----------------------------+
| Kota Surabaya               |
| Cluster    : 3              |
| IKP        : 73.28          |
| IPM        : 85.65          |
| LISA       : High-High      |
| Tahun      : 2025           |
+-----------------------------+
```

### 10.4 Panel Bawah Kiri: Profil Cluster

Tiga tab (satu per cluster), masing-masing menampilkan:
- Radar chart karakteristik (6 variabel utama: IKP, IPM, Kemiskinan, TPT, Gizi Kurang, Produksi Padi)
- List wilayah yang termasuk dalam cluster tersebut (untuk tahun yang dipilih)
- Interpretasi naratif singkat cluster

**Interpretasi default per cluster:**
- **Cluster 1:** "Wilayah dengan tekanan sosial-ekonomi tinggi: kemiskinan di atas rata-rata, IPM rendah, prevalensi gizi kurang elevated. Memerlukan intervensi kebijakan prioritas."
- **Cluster 2:** "Wilayah dengan karakteristik tipikal Jawa Timur: nilai variabel mendekati rata-rata provinsi, heterogenitas sedang."
- **Cluster 3:** "Wilayah perkotaan maju: IPM tertinggi, kepadatan penduduk tinggi, kemiskinan terendah. Namun ketergantungan pada impor pangan perlu diperhatikan."

### 10.5 Panel Bawah Kanan: Hasil LISA

**Kondisi tampil:** Panel aktif HANYA jika Moran's I signifikan (p < 0.05).  
Jika tidak: tampilkan notifikasi *"Analisis LISA tidak dilanjutkan karena uji Moran's I tidak signifikan (H0 tidak ditolak)."*

**Konten:**
- Legend LISA dengan jumlah wilayah per kategori
- Tabel: Wilayah | LISA Category | Nilai IKP | p-value lokal
- Highlight wilayah HH (perlu dipertahankan) dan LL (perlu perhatian khusus)

---

## 11. Spesifikasi Halaman 4 — Profil Kabupaten/Kota

### 11.1 Layout

Filter bar atas | Konten dinamis bawah (dua kolom: kiri detail, kanan komparasi).

### 11.2 Filter

```
[Pilih Wilayah (searchable) ▼]    [Pilih Tahun ▼]    [Bandingkan dengan ▼]
```

### 11.3 Panel Kiri: Profil Detail Wilayah

**Header kartu:**
```
Kabupaten Jember
Jawa Timur · Kabupaten · Cluster 2
IKP 2024: 67.67   (turun dari 68.52 pada 2023)
```

**Tabel variabel lengkap:**

| Variabel | Nilai | Satuan | Rata-rata Jatim | Status |
|---|---|---|---|---|
| IKP | 67.67 | Indeks | 74.2 | Bawah rata-rata |
| IPM | 70.93 | Indeks | 75.1 | Bawah rata-rata |
| Kemiskinan | 9.01 | % | 11.8 | Lebih baik dari rata-rata |
| TPT | 3.23 | % | 4.2 | Lebih baik dari rata-rata |
| Kepadatan | 786 | jiwa/km2 | 1.200 | Bawah rata-rata |
| Prevalensi Gizi Kurang | 54.17 | % | — | — |
| Produksi Padi | 623.264 | ton | — | — |
| Produktivitas Padi | 51.91 | ku/ha | — | — |
| Luas Panen | 120.069 | ha | — | — |

Status dihitung otomatis dengan membandingkan nilai terhadap rata-rata provinsi pada tahun yang sama.

### 11.4 Panel Kiri Bawah: Tren Historis

Line chart mini menampilkan tren IKP wilayah tersebut dari 2021–2025, dengan titik di tahun yang dipilih di-highlight menggunakan warna `--color-gold`.

### 11.5 Panel Kanan: Komparasi (Opsional)

Jika pengguna memilih wilayah pembanding, tampilkan tabel side-by-side. Nilai yang lebih baik diberi latar hijau muda, yang lebih buruk diberi latar merah muda.

---

## 12. Spesifikasi Teknis

### 12.1 Tech Stack yang Direkomendasikan

| Layer | Pilihan Utama | Alternatif |
|---|---|---|
| Frontend Framework | Next.js 14 (App Router) | React + Vite |
| Styling | Tailwind CSS + CSS Custom Properties | Styled Components |
| Peta Interaktif | Mapbox GL JS | Leaflet.js |
| Chart | Recharts | Chart.js / Nivo |
| Animasi | Framer Motion | GSAP |
| Data | Static JSON dari GeoJSON | API endpoint Python |
| Analisis Spasial | Pre-computed (Python offline) | PySAL via API |
| Deployment | Vercel | Netlify |

### 12.2 Struktur Data untuk Frontend

**`/public/data/summary.json`** — Statistik agregat per tahun:
```json
{
  "2024": {
    "avg_ikp": 70.79,
    "avg_ipm": 75.10,
    "avg_kemiskinan": 11.82,
    "total_wilayah": 38,
    "cluster_distribution": { "1": 12, "2": 20, "3": 6 }
  }
}
```

**`/public/data/morans.json`** — Hasil Moran's I per tahun:
```json
{
  "2024": {
    "morans_i": 0.312,
    "p_value": 0.021,
    "z_score": 2.34,
    "significant": true
  }
}
```

**`/public/data/lisa.json`** — Kategori LISA per wilayah per tahun:
```json
{
  "2024": {
    "Jember": { "category": "LL", "p_local": 0.03 },
    "Kota Surabaya": { "category": "HH", "p_local": 0.01 }
  }
}
```

**`/public/geojson/jatim_cluster_all_years.geojson`** — File GeoJSON utama (sudah tersedia).

### 12.3 Properti GeoJSON yang Digunakan di Frontend

```
nama_final              -> Key join dan display nama wilayah
Kategori                -> "kabupaten" / "kota"
Tahun                   -> Filter (2021–2025)
IKP_offstat             -> Nilai IKP untuk choropleth
IPM                     -> Tooltip dan profil
Kemiskinan              -> Tooltip dan profil
TPT                     -> Profil
Kepadatan_Penduduk      -> Profil
Prevalensi_Gizi_Kurang  -> Profil
Cluster                 -> Warna cluster
PC1, PC2                -> Scatter plot PCA
```

### 12.4 Performa & Aksesibilitas

- GeoJSON di-simplify menggunakan `mapshaper` (toleransi 0.001) untuk mengurangi ukuran file
- Lazy loading per halaman dengan Next.js dynamic import
- Semua warna memenuhi WCAG AA contrast ratio (minimum 4.5:1 untuk teks normal)
- Tooltip dan label peta memiliki `aria-label` yang deskriptif
- Loading state dengan skeleton UI di setiap komponen data

---

## 13. Spesifikasi Animasi & Interaksi

### 13.1 Prinsip Animasi

- **Purposeful:** animasi hanya memperkuat narasi, bukan sekadar dekorasi
- **Fluid:** easing `cubic-bezier(0.4, 0, 0.2, 1)` sebagai default (Material Design standard)
- **Consistent:** durasi 200ms untuk micro-interaction, 400ms untuk transisi halaman, 800ms untuk chart entrance

### 13.2 Daftar Animasi

| Elemen | Trigger | Animasi | Durasi |
|---|---|---|---|
| Hero text | Page load | `fadeIn + translateY(20px -> 0)` staggered | 600ms |
| Metrik kartu | Viewport enter | Count-up dari 0 + `scaleY(0 -> 1)` | 1500ms |
| Navigasi antar halaman | Route change | `opacity(0->1) + translateX` | 300ms |
| Choropleth map | Tahun berubah | Fill color transition | 500ms |
| Tooltip | Hover | `fadeIn + scale(0.95->1)` | 150ms |
| Bar chart bars | Viewport enter | `scaleX(0->1)` dari kiri, staggered | 800ms |
| Kartu panduan (landing) | Viewport enter | `translateY(30px->0) + opacity`, stagger 100ms | 400ms |
| Panel LISA | Tab click | `fadeIn` | 200ms |

### 13.3 Scroll Behavior

- **Smooth scroll** untuk navigasi internal (#section)
- **Parallax** pada foto hero Bromo: background bergerak 50% kecepatan scroll
- **Sticky** filter bar di halaman Profil saat scroll ke bawah
- **Intersection Observer** untuk trigger animasi entrance (threshold: 0.15)

---

## 14. Komponen Reusable

| Nama Komponen | Props Utama | Deskripsi |
|---|---|---|
| `<MetricCard>` | value, label, delta, unit | Kartu statistik dengan animasi count-up |
| `<ChoroplethMap>` | geojson, valueKey, colorScheme, year | Peta choropleth Leaflet/Mapbox |
| `<YearSlider>` | years, value, onChange | Slider tahun dengan tombol autoplay |
| `<MoransPanel>` | moransData, year | Panel hasil Moran's I + scatter plot |
| `<LisaPanel>` | lisaData, year | Panel hasil LISA + tabel |
| `<ClusterBadge>` | cluster | Badge warna sesuai cluster (1/2/3) |
| `<WilayahTooltip>` | feature, year | Tooltip peta dengan semua variabel |
| `<TrendLine>` | wilayah, metric | Mini line chart historis 5 tahun |
| `<CompareTable>` | wilayah1, wilayah2, year | Tabel perbandingan dua wilayah |
| `<LandmarkHero>` | image, title, subtitle | Hero section dengan parallax |

---

## 15. Kriteria Penerimaan (Acceptance Criteria)

### 15.1 Fungsional

- [ ] Filter tahun pada semua peta berfungsi dan mengubah data yang ditampilkan secara real-time
- [ ] Hover pada polygon peta memunculkan tooltip dengan data yang akurat
- [ ] Klik polygon pada Halaman 4 mengisi filter wilayah secara otomatis
- [ ] Moran's I panel menampilkan nilai numerik yang benar beserta interpretasi teks otomatis
- [ ] LISA panel hanya muncul jika Moran's I signifikan (p < 0.05)
- [ ] Dropdown wilayah di Halaman 4 dapat dicari (searchable)
- [ ] Semua chart merespons perubahan filter tanpa reload halaman
- [ ] Auto-play slider tahun di peta berjalan tanpa lag visual

### 15.2 Non-Fungsional

- [ ] First Contentful Paint (FCP) < 2 detik pada koneksi 4G
- [ ] Tidak ada error 404 untuk semua aset statis (foto, GeoJSON, JSON data)
- [ ] Dashboard dapat diakses di Chrome, Firefox, Safari, Edge (versi terbaru)
- [ ] Responsif di viewport 1280px–1920px (desktop); tabel di mobile menggunakan horizontal scroll

### 15.3 Visual

- [ ] Semua warna sesuai design system yang didefinisikan di Seksi 5
- [ ] Foto landmark tampil dengan overlay dan tidak mengganggu keterbacaan teks
- [ ] Tidak ada teks yang clipping atau overflow pada semua breakpoint desktop

---

## 16. Out of Scope (Versi 1.0)

- Tampilan mobile (breakpoint < 768px)
- Ekspor data ke CSV/Excel dari dashboard
- Login / autentikasi pengguna
- Komentar atau anotasi kolaboratif pada peta
- Analisis spasial real-time di browser (semua nilai statistik pre-computed)
- Integrasi API BPS secara langsung

---

## 17. Referensi & Sumber Data

- BPS Provinsi Jawa Timur — Data Susenas, Podes, Sakernas 2021–2025
- GADM v4.1 — Batas administrasi Indonesia Level 2 (Kab/Kota), CRS EPSG:4326
- Anselin, L. (1995). Local Indicators of Spatial Association — LISA. Geographical Analysis, 27(2), 93–115.
- PySAL / libpysal Documentation — Moran's I & LISA implementation
- Kelompok A (2025). Analisis Klasterisasi dan Spasial Ketahanan Pangan Jawa Timur. Laporan Akhir Statistika Ofisial.

---

*Dokumen ini adalah living document. Perubahan signifikan terhadap metodologi atau struktur data harus direfleksikan pada versi berikutnya.*

**PRD v1.0 — Kelompok A — Statistika Ofisial 2025**
