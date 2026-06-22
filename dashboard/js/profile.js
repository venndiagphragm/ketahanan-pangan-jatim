/**
 * profile.js — Profile Page Module
 * Handles region selection, detail display, comparison, and trend charts.
 */

let profileInitialized = false;
let profileTrendChart = null;

function initProfile() {
  if (!AppState.data.regions) return;
  
  if (!profileInitialized) {
    populateRegionDropdowns();
    setupProfileListeners();
    profileInitialized = true;
  }
}

function populateRegionDropdowns() {
  const regions = getAllRegionNames();
  const select1 = document.getElementById('profile-region-select');
  const select2 = document.getElementById('profile-compare-select');
  
  // Clear existing options
  select1.innerHTML = '<option value="">-- Pilih Wilayah --</option>';
  select2.innerHTML = '<option value="">-- Tidak ada --</option>';
  
  regions.forEach(name => {
    const opt1 = document.createElement('option');
    opt1.value = name;
    opt1.textContent = name;
    select1.appendChild(opt1);
    
    const opt2 = document.createElement('option');
    opt2.value = name;
    opt2.textContent = name;
    select2.appendChild(opt2);
  });
}

function setupProfileListeners() {
  const regionSelect = document.getElementById('profile-region-select');
  const yearSelect = document.getElementById('profile-year-select');
  const compareSelect = document.getElementById('profile-compare-select');
  
  regionSelect.addEventListener('change', updateProfile);
  yearSelect.addEventListener('change', updateProfile);
  compareSelect.addEventListener('change', updateProfile);
}

function updateProfile() {
  const regionName = document.getElementById('profile-region-select').value;
  const year = document.getElementById('profile-year-select').value;
  const compareName = document.getElementById('profile-compare-select').value;
  
  if (!regionName) {
    document.getElementById('profile-name').textContent = 'Pilih Wilayah';
    document.getElementById('profile-subtitle').textContent = 'Gunakan dropdown di atas untuk memilih wilayah.';
    document.getElementById('profile-ikp-box').innerHTML = '';
    document.getElementById('profile-table-container').innerHTML = '';
    return;
  }
  
  renderProfileDetail(regionName, year);
  renderProfileTrend(regionName, year);
  
  if (compareName && compareName !== regionName) {
    renderComparison(regionName, compareName, year);
  } else {
    document.getElementById('compare-name').textContent = 'Perbandingan';
    document.getElementById('compare-subtitle').textContent = 'Pilih wilayah pembanding untuk melihat tabel komparasi.';
    document.getElementById('compare-table-container').innerHTML = '';
  }
}

function renderProfileDetail(regionName, year) {
  const regions = AppState.data.regions;
  const summary = AppState.data.summary;
  const regionData = regions[regionName];
  
  if (!regionData) return;
  
  const yearData = regionData.years[year];
  if (!yearData) {
    document.getElementById('profile-name').textContent = regionName;
    document.getElementById('profile-subtitle').textContent = `Data tidak tersedia untuk tahun ${year}.`;
    return;
  }
  
  const kategori = regionData.kategori === 'kabupaten' ? 'Kabupaten' : 'Kota';
  
  // Header
  document.getElementById('profile-name').textContent = regionName;
  document.getElementById('profile-subtitle').innerHTML = `
    Jawa Timur &bull; ${kategori} &bull; 
    <span class="cluster-badge cluster-${yearData.cluster}">Cluster ${yearData.cluster}</span>
  `;
  
  // IKP Highlight
  const prevYear = String(parseInt(year) - 1);
  const prevData = regionData.years[prevYear];
  let trendText = '';
  if (prevData) {
    const diff = yearData.ikp - prevData.ikp;
    const arrow = diff >= 0 ? '&#9650;' : '&#9660;';
    const color = diff >= 0 ? 'var(--color-green-light)' : 'var(--cluster-1)';
    trendText = `<span style="color:${color};font-size:0.9rem;margin-left:8px;">${arrow} ${Math.abs(diff).toFixed(2)} dari ${prevYear}</span>`;
  }
  
  document.getElementById('profile-ikp-box').innerHTML = `
    <div class="profile-ikp-highlight">IKP ${year}: ${yearData.ikp.toFixed(2)} ${trendText}</div>
  `;
  
  // Variable table
  const avgData = summary[year] || summary['all'];
  const variables = [
    { name: 'IKP', value: yearData.ikp, unit: 'Indeks', avg: avgData.avg_ikp, higherBetter: true },
    { name: 'IPM', value: yearData.ipm, unit: 'Indeks', avg: avgData.avg_ipm, higherBetter: true },
    { name: 'Kemiskinan', value: yearData.kemiskinan, unit: '%', avg: avgData.avg_kemiskinan, higherBetter: false },
    { name: 'TPT', value: yearData.tpt, unit: '%', avg: avgData.avg_tpt || 4.5, higherBetter: false },
    { name: 'Kepadatan Penduduk', value: yearData.kepadatan, unit: 'jiwa/km\u00B2', avg: null, higherBetter: null },
    { name: 'Prevalensi Gizi Kurang', value: yearData.prevalensi_gizi_kurang, unit: '%', avg: null, higherBetter: false },
    { name: 'Produksi Padi', value: yearData.produksi_padi, unit: 'ton', avg: null, higherBetter: null },
    { name: 'Produktivitas Padi', value: yearData.produktivitas_padi, unit: 'ku/ha', avg: null, higherBetter: null },
    { name: 'Luas Panen', value: yearData.luas_panen, unit: 'ha', avg: null, higherBetter: null },
  ];
  
  let tableHTML = `<table class="data-table">
    <thead><tr>
      <th>Variabel</th><th>Nilai</th><th>Satuan</th><th>Rata-rata Jatim</th><th>Status</th>
    </tr></thead><tbody>`;
  
  variables.forEach(v => {
    let status = '-';
    let statusClass = 'status-neutral';
    
    if (v.avg !== null && v.higherBetter !== null) {
      if (v.higherBetter) {
        if (v.value >= v.avg) { status = 'Di atas rata-rata'; statusClass = 'status-better'; }
        else { status = 'Di bawah rata-rata'; statusClass = 'status-worse'; }
      } else {
        if (v.value <= v.avg) { status = 'Lebih baik'; statusClass = 'status-better'; }
        else { status = 'Di atas rata-rata'; statusClass = 'status-worse'; }
      }
    }
    
    const formattedValue = typeof v.value === 'number' ? 
      (v.value > 1000 ? Math.round(v.value).toLocaleString() : v.value.toFixed(2)) : v.value;
    const avgText = v.avg !== null ? v.avg.toFixed(2) : '-';
    
    tableHTML += `<tr>
      <td style="font-family:var(--font-body);font-weight:500">${v.name}</td>
      <td>${formattedValue}</td>
      <td style="color:var(--color-text-muted)">${v.unit}</td>
      <td>${avgText}</td>
      <td class="${statusClass}">${status}</td>
    </tr>`;
  });
  
  tableHTML += '</tbody></table>';
  document.getElementById('profile-table-container').innerHTML = tableHTML;
}

function renderProfileTrend(regionName, selectedYear) {
  if (profileTrendChart) {
    profileTrendChart.destroy();
    profileTrendChart = null;
  }
  
  const ctx = document.getElementById('chart-profile-trend');
  if (!ctx) return;
  
  const regions = AppState.data.regions;
  const regionData = regions[regionName];
  if (!regionData) return;
  
  const years = getYears();
  const ikpValues = years.map(y => regionData.years[y]?.ikp || null);
  const pointColors = years.map(y => y === selectedYear ? '#D4A017' : '#42A5F5');
  const pointRadii = years.map(y => y === selectedYear ? 8 : 5);
  
  profileTrendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years,
      datasets: [{
        label: 'IKP',
        data: ikpValues,
        borderColor: '#42A5F5',
        backgroundColor: 'rgba(66,165,245,0.1)',
        borderWidth: 2.5,
        pointRadius: pointRadii,
        pointBackgroundColor: pointColors,
        pointBorderColor: pointColors,
        pointBorderWidth: 2,
        fill: true,
        tension: 0.3,
        spanGaps: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(22,27,34,0.95)',
          titleColor: '#E6EDF3',
          bodyColor: '#C9D1D9',
          borderColor: '#30363D',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
        }
      },
      scales: {
        y: {
          title: { display: true, text: 'IKP', color: '#8B949E' },
          grid: { color: 'rgba(48,54,61,0.5)' },
        },
        x: { grid: { display: false } }
      }
    }
  });
}

function renderComparison(region1Name, region2Name, year) {
  const regions = AppState.data.regions;
  const r1 = regions[region1Name];
  const r2 = regions[region2Name];
  
  if (!r1 || !r2) return;
  
  const y1 = r1.years[year];
  const y2 = r2.years[year];
  
  if (!y1 || !y2) {
    document.getElementById('compare-name').textContent = 'Data tidak tersedia';
    document.getElementById('compare-subtitle').textContent = `Data salah satu wilayah tidak tersedia untuk tahun ${year}.`;
    return;
  }
  
  document.getElementById('compare-name').textContent = `${region1Name} vs ${region2Name}`;
  document.getElementById('compare-subtitle').innerHTML = `Perbandingan tahun ${year}`;
  
  const variables = [
    { name: 'IKP', key: 'ikp', higherBetter: true },
    { name: 'IPM', key: 'ipm', higherBetter: true },
    { name: 'Kemiskinan (%)', key: 'kemiskinan', higherBetter: false },
    { name: 'TPT (%)', key: 'tpt', higherBetter: false },
    { name: 'Kepadatan', key: 'kepadatan', higherBetter: null },
    { name: 'Gizi Kurang (%)', key: 'prevalensi_gizi_kurang', higherBetter: false },
    { name: 'Produksi Padi', key: 'produksi_padi', higherBetter: null },
    { name: 'Produktivitas Padi', key: 'produktivitas_padi', higherBetter: true },
    { name: 'Luas Panen', key: 'luas_panen', higherBetter: null },
    { name: 'Cluster', key: 'cluster', higherBetter: null },
  ];
  
  let html = `<table class="data-table">
    <thead><tr>
      <th>Variabel</th>
      <th>${region1Name}</th>
      <th>${region2Name}</th>
    </tr></thead><tbody>`;
  
  variables.forEach(v => {
    const val1 = y1[v.key];
    const val2 = y2[v.key];
    
    let class1 = '', class2 = '';
    if (v.higherBetter !== null && typeof val1 === 'number' && typeof val2 === 'number') {
      if (v.higherBetter) {
        class1 = val1 >= val2 ? 'compare-better' : 'compare-worse';
        class2 = val2 >= val1 ? 'compare-better' : 'compare-worse';
      } else {
        class1 = val1 <= val2 ? 'compare-better' : 'compare-worse';
        class2 = val2 <= val1 ? 'compare-better' : 'compare-worse';
      }
    }
    
    const fmt = (val) => {
      if (typeof val !== 'number') return val;
      return val > 1000 ? Math.round(val).toLocaleString() : val.toFixed(2);
    };
    
    html += `<tr>
      <td style="font-family:var(--font-body);font-weight:500">${v.name}</td>
      <td class="${class1}">${fmt(val1)}</td>
      <td class="${class2}">${fmt(val2)}</td>
    </tr>`;
  });
  
  html += '</tbody></table>';
  document.getElementById('compare-table-container').innerHTML = html;
}
