# Analisis Spasial & Klasterisasi Ketahanan Pangan Jawa Timur 2021-2025

Proyek ini merupakan **Tugas Akhir Mata Kuliah Statistika Ofisial** yang menganalisis dimensi ketahanan pangan di 38 Kabupaten/Kota Provinsi Jawa Timur secara komprehensif. Melalui integrasi data pertanian, sosial-ekonomi, dan kesehatan yang bersumber dari BPS (Badan Pusat Statistik) selama 5 tahun (2021-2025), proyek ini membangun model klasterisasi serta analisis spasial untuk mengidentifikasi pola distribusi ketahanan pangan antar wilayah.

## 🚀 Fitur Utama

- **Dashboard Interaktif**: Dashboard interaktif yang dibangun secara Native (Vanilla JS) dengan berbagai visualisasi mulai dari Overview Provinsi, Peta Klaster, hingga Komparasi Profil per-Wilayah.
- **Klasterisasi K-Means**: Pengelompokan (K-Means dengan k=3) performa ketahanan pangan Kabupaten/Kota yang direduksi dimensinya menggunakan PCA (Principal Component Analysis).
- **Analisis Spasial**: Pengukuran tingkat dependensi keruangan menggunakan **Moran's I** dan pemetaan *Local Indicator of Spatial Association (LISA)*.
- **Peta Choropleth**: Peta tematik interaktif (berbasis Leaflet.js) yang dapat dikontrol menurut rentang waktu (2021-2025) menggunakan *slider* & *autoplay*.

## 📊 Variabel Data

Data utama yang digunakan (bersumber dari BPS Jawa Timur):
1. **IKP (Indeks Ketahanan Pangan)**
2. **IPM (Indeks Pembangunan Manusia)**
3. **Persentase Penduduk Miskin (%)**
4. **TPT (Tingkat Pengangguran Terbuka) (%)**
5. **Kepadatan Penduduk**
6. **Prevalensi Gizi Kurang**
7. **Luas Panen Padi (Ha)**
8. **Produktivitas Tanaman Padi (Ku/Ha)**
9. **Produksi Padi (Ton)**

## 🛠️ Tech Stack & Dependencies

Proyek ini dibangun secara *lightweight* tanpa perlu proses kompilasi bundler yang kompleks (seperti Webpack/Vite).

### **Frontend (Dashboard)**
- **HTML5 & CSS3** (Vanilla / Tanpa Framework Tailwind, Custom Design System)
- **JavaScript (ES6+)**
- **Leaflet.js** (Library pemetaan spasial open-source)
- **Chart.js** (Library visualisasi data statistik)
- **Aset Ikonografi SVG Modern**

### **Data Processing & Machine Learning**
- **Python 3.x**
- `pandas`, `numpy` (Manipulasi Data)
- `scikit-learn` (PCA & K-Means Clustering)
- `geopandas`, `pysal` (Pemrosesan GeoJSON & Analisis Spasial)

## 📁 Struktur Repositori

```text
├── dashboard/                 # Source code untuk Frontend Dashboard Interaktif
│   ├── css/                   # Stylesheet (.css)
│   ├── js/                    # Logika aplikasi (.js)
│   ├── data/                  # Data JSON hasil komputasi dan script pre-processing
│   ├── img/                   # Aset gambar dan ilustrasi
│   └── index.html             # Entry point Dashboard
├── data_merged.csv            # Data mentah gabungan untuk pre-processing
├── jatim_cluster_all_years.geojson # Data spatial (GeoJSON) original
├── offstat_FP.ipynb           # Jupyter Notebook eksperimen awal
├── PROJECT_OFFSTAT_KELOMPOK_A_.ipynb # Notebook pemrosesan Machine Learning utama
└── README.md                  # Dokumentasi ini
```

## ⚡ Cara Menjalankan (How to Run)

Anda tidak memerlukan proses instalasi dependensi (NPM/Yarn) untuk menjalankan dashboard.

1. **Clone Repositori ini:**
   ```bash
   git clone <url-repo-anda>
   cd <nama-repo>/dashboard
   ```

2. **Jalankan *Local Web Server*:**
   Karena menggunakan modul ES6 dan Fetch API (`fetch()` untuk mengambil data JSON), Anda perlu menjalankannya melalui HTTP server lokal untuk menghindari isu CORS, misalnya menggunakan Python:
   ```bash
   python -m http.server 8080
   ```
   Atau jika menggunakan Node.js:
   ```bash
   npx http-server -p 8080
   ```

3. **Akses Dashboard:**
   Buka peramban (browser) dan akses `http://localhost:8080`.

## 👥 Tim Kelompok A (Statistika Ofisial)
* Proyek ini dikembangkan oleh Kelompok A dalam rangka memenuhi Tugas Akhir Mata Kuliah Statistika Ofisial.
