/**
 * charts.js — Chart.js Visualizations for Overview Page
 */

// Store chart instances for cleanup
const chartInstances = {};

function destroyChart(id) {
  if (chartInstances[id]) {
    chartInstances[id].destroy();
    delete chartInstances[id];
  }
}

// Chart.js global defaults
Chart.defaults.color = '#8B949E';
Chart.defaults.borderColor = '#30363D';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.pointStyle = 'circle';

const CLUSTER_COLORS = ['#EF5350', '#42A5F5', '#66BB6A'];
const CLUSTER_BG = ['rgba(239,83,80,0.2)', 'rgba(66,165,245,0.2)', 'rgba(102,187,106,0.2)'];

// ─── Overview Page Charts ───
let overviewInitialized = false;

function initOverviewCharts() {
  if (!AppState.data.summary || !AppState.data.regions) return;
  
  const yearFilter = document.getElementById('year-filter-overview');
  
  if (!overviewInitialized) {
    yearFilter.addEventListener('change', () => {
      updateOverview(yearFilter.value);
    });
    overviewInitialized = true;
  }
  
  updateOverview(yearFilter.value);
}

function updateOverview(selectedYear) {
  updateOverviewMetrics(selectedYear);
  renderTrendChart();
  renderDistributionChart(selectedYear);
  renderClusterDonut(selectedYear);
  renderPCAScatter(selectedYear);
  renderBarChart(selectedYear);
  renderClusterTable(selectedYear);
}

function updateOverviewMetrics(year) {
  const s = AppState.data.summary;
  const data = year === 'all' ? s.all : s[year];
  if (!data) return;
  
  document.getElementById('ov-total').textContent = data.total_wilayah;
  document.getElementById('ov-ikp').textContent = data.avg_ikp.toFixed(2);
  document.getElementById('ov-ipm').textContent = data.avg_ipm.toFixed(2);
  document.getElementById('ov-kemiskinan').textContent = data.avg_kemiskinan.toFixed(2) + '%';
}

function renderTrendChart() {
  destroyChart('trend-ikp');
  const ctx = document.getElementById('chart-trend-ikp');
  if (!ctx) return;
  
  const years = getYears();
  const s = AppState.data.summary;
  const regions = AppState.data.regions;
  
  const avgAll = years.map(y => s[y]?.avg_ikp || 0);
  
  // Separate kab vs kota averages
  const kabAvg = [], kotaAvg = [];
  years.forEach(y => {
    let kabSum = 0, kabCount = 0, kotaSum = 0, kotaCount = 0;
    for (const [name, r] of Object.entries(regions)) {
      const yd = r.years[y];
      if (!yd) continue;
      if (r.kategori === 'kabupaten') { kabSum += yd.ikp; kabCount++; }
      else { kotaSum += yd.ikp; kotaCount++; }
    }
    kabAvg.push(kabCount ? (kabSum / kabCount).toFixed(2) : 0);
    kotaAvg.push(kotaCount ? (kotaSum / kotaCount).toFixed(2) : 0);
  });
  
  chartInstances['trend-ikp'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years,
      datasets: [
        {
          label: 'Jawa Timur',
          data: avgAll,
          borderColor: '#D4A017',
          backgroundColor: 'rgba(212,160,23,0.1)',
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: '#D4A017',
          fill: true,
          tension: 0.3,
        },
        {
          label: 'Kabupaten',
          data: kabAvg,
          borderColor: '#42A5F5',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#42A5F5',
          borderDash: [5, 5],
          tension: 0.3,
        },
        {
          label: 'Kota',
          data: kotaAvg,
          borderColor: '#66BB6A',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#66BB6A',
          borderDash: [5, 5],
          tension: 0.3,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
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
          title: { display: true, text: 'Rata-rata IKP', color: '#8B949E' },
          grid: { color: 'rgba(48,54,61,0.5)' },
        },
        x: {
          grid: { display: false },
        }
      }
    }
  });
}

function renderDistributionChart(year) {
  destroyChart('dist-ikp');
  const ctx = document.getElementById('chart-dist-ikp');
  if (!ctx) return;
  
  const regions = AppState.data.regions;
  let ikpValues = [];
  
  for (const [name, r] of Object.entries(regions)) {
    if (year === 'all') {
      for (const y of getYears()) {
        if (r.years[y]) ikpValues.push(r.years[y].ikp);
      }
    } else {
      if (r.years[year]) ikpValues.push(r.years[year].ikp);
    }
  }
  
  // Create histogram bins
  const bins = [60, 65, 70, 75, 80, 85, 90, 95];
  const labels = [];
  const counts = [];
  
  for (let i = 0; i < bins.length - 1; i++) {
    labels.push(`${bins[i]}-${bins[i+1]}`);
    counts.push(ikpValues.filter(v => v >= bins[i] && v < bins[i+1]).length);
  }
  labels.push(`${bins[bins.length-1]}+`);
  counts.push(ikpValues.filter(v => v >= bins[bins.length-1]).length);
  
  const mean = ikpValues.reduce((a, b) => a + b, 0) / ikpValues.length;
  
  chartInstances['dist-ikp'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Jumlah Wilayah',
        data: counts,
        backgroundColor: counts.map((_, i) => {
          const colors = ['#7B1FA2', '#E65100', '#FDD835', '#81C784', '#2E7D32', '#2E7D32', '#1B5E20', '#1B5E20'];
          return colors[i] || '#2E7D32';
        }),
        borderRadius: 6,
        borderSkipped: false,
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
          callbacks: {
            afterBody: () => `Mean: ${mean.toFixed(2)}`
          }
        }
      },
      scales: {
        y: {
          title: { display: true, text: 'Frekuensi', color: '#8B949E' },
          grid: { color: 'rgba(48,54,61,0.5)' },
          beginAtZero: true,
        },
        x: {
          title: { display: true, text: 'IKP Range', color: '#8B949E' },
          grid: { display: false },
        }
      }
    }
  });
}

function renderClusterDonut(year) {
  destroyChart('cluster-donut');
  const ctx = document.getElementById('chart-cluster-donut');
  if (!ctx) return;
  
  const regions = AppState.data.regions;
  const counts = [0, 0, 0];
  
  for (const [name, r] of Object.entries(regions)) {
    if (year === 'all') {
      for (const y of getYears()) {
        if (r.years[y]) counts[r.years[y].cluster - 1]++;
      }
    } else {
      if (r.years[year]) counts[r.years[year].cluster - 1]++;
    }
  }
  
  chartInstances['cluster-donut'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Cluster 1 (Tekanan Tinggi)', 'Cluster 2 (Tipikal)', 'Cluster 3 (Perkotaan Maju)'],
      datasets: [{
        data: counts,
        backgroundColor: CLUSTER_COLORS,
        borderColor: '#161B22',
        borderWidth: 3,
        hoverBorderColor: '#E6EDF3',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 16, font: { size: 11 } }
        },
        tooltip: {
          backgroundColor: 'rgba(22,27,34,0.95)',
          titleColor: '#E6EDF3',
          bodyColor: '#C9D1D9',
          borderColor: '#30363D',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
        }
      }
    }
  });
}

function renderPCAScatter(year) {
  destroyChart('pca-scatter');
  const ctx = document.getElementById('chart-pca-scatter');
  if (!ctx) return;
  
  const regions = AppState.data.regions;
  const datasets = [
    { label: 'Cluster 1', data: [], backgroundColor: CLUSTER_BG[0], borderColor: CLUSTER_COLORS[0], pointNames: [] },
    { label: 'Cluster 2', data: [], backgroundColor: CLUSTER_BG[1], borderColor: CLUSTER_COLORS[1], pointNames: [] },
    { label: 'Cluster 3', data: [], backgroundColor: CLUSTER_BG[2], borderColor: CLUSTER_COLORS[2], pointNames: [] },
  ];
  
  for (const [name, r] of Object.entries(regions)) {
    const yearsToUse = year === 'all' ? getYears() : [year];
    for (const y of yearsToUse) {
      const yd = r.years[y];
      if (!yd) continue;
      const idx = yd.cluster - 1;
      if (idx >= 0 && idx < 3) {
        datasets[idx].data.push({ x: yd.pc1, y: yd.pc2 });
        datasets[idx].pointNames.push(name + ' (' + y + ')');
      }
    }
  }
  
  chartInstances['pca-scatter'] = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: datasets.map(ds => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: ds.backgroundColor,
        borderColor: ds.borderColor,
        borderWidth: 1.5,
        pointRadius: 5,
        pointHoverRadius: 8,
        _pointNames: ds.pointNames,
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          backgroundColor: 'rgba(22,27,34,0.95)',
          titleColor: '#E6EDF3',
          bodyColor: '#C9D1D9',
          borderColor: '#30363D',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            title: (items) => {
              const ds = items[0]?.dataset;
              const idx = items[0]?.dataIndex;
              return ds?._pointNames?.[idx] || '';
            },
            label: (item) => `PC1: ${item.raw.x.toFixed(2)}, PC2: ${item.raw.y.toFixed(2)}`
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'PC1', color: '#8B949E' },
          grid: { color: 'rgba(48,54,61,0.3)' },
        },
        y: {
          title: { display: true, text: 'PC2', color: '#8B949E' },
          grid: { color: 'rgba(48,54,61,0.3)' },
        }
      }
    }
  });
}

function renderBarChart(year) {
  destroyChart('bar-ikp');
  const ctx = document.getElementById('chart-bar-ikp');
  if (!ctx) return;
  
  const regions = AppState.data.regions;
  const items = [];
  
  for (const [name, r] of Object.entries(regions)) {
    if (year === 'all') {
      // Use latest year
      const yd = r.years['2025'] || r.years['2024'] || r.years['2023'];
      if (yd) items.push({ name, ikp: yd.ikp, cluster: yd.cluster });
    } else {
      const yd = r.years[year];
      if (yd) items.push({ name, ikp: yd.ikp, cluster: yd.cluster });
    }
  }
  
  // Sort ascending by IKP
  items.sort((a, b) => a.ikp - b.ikp);
  
  // Adjust canvas height for horizontal bar
  ctx.parentElement.style.minHeight = Math.max(600, items.length * 22) + 'px';
  
  chartInstances['bar-ikp'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: items.map(i => i.name),
      datasets: [{
        label: 'IKP',
        data: items.map(i => i.ikp),
        backgroundColor: items.map(i => CLUSTER_COLORS[i.cluster - 1] + '99'),
        borderColor: items.map(i => CLUSTER_COLORS[i.cluster - 1]),
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      }]
    },
    options: {
      indexAxis: 'y',
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
          callbacks: {
            label: (item) => {
              const region = items[item.dataIndex];
              return `IKP: ${region.ikp.toFixed(2)} | Cluster ${region.cluster}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'IKP', color: '#8B949E' },
          grid: { color: 'rgba(48,54,61,0.3)' },
          min: 55,
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 11 } },
        }
      }
    }
  });
}

function renderClusterTable(year) {
  const tbody = document.getElementById('cluster-table-body');
  if (!tbody) return;
  
  const allProfiles = AppState.data.clusterProfiles;
  if (!allProfiles) return;
  
  const profiles = year === 'all' ? allProfiles['all'] : allProfiles[year];
  if (!profiles) return;
  
  const labels = {
    '1': 'Tekanan sosial-ekonomi tinggi',
    '2': 'Tipikal / menengah',
    '3': 'Perkotaan maju'
  };
  
  tbody.innerHTML = ['1', '2', '3'].map(c => {
    const p = profiles[c];
    if (!p) return '';
    return `<tr>
      <td><span class="cluster-badge cluster-${c}">Cluster ${c}</span></td>
      <td>${p.avg_ikp.toFixed(2)}</td>
      <td>${p.avg_ipm.toFixed(2)}</td>
      <td>${p.avg_kemiskinan.toFixed(2)}%</td>
      <td>${p.avg_tpt.toFixed(2)}%</td>
      <td>${p.avg_gizi_kurang.toFixed(2)}%</td>
      <td>${Math.round(p.avg_produksi_padi).toLocaleString()}</td>
      <td style="font-family:var(--font-body);font-size:0.8rem;color:var(--color-text-secondary)">${labels[c]}</td>
    </tr>`;
  }).join('');
}

// ─── Radar Charts for Cluster Page ───
function renderClusterRadar(clusterId, canvasId, year) {
  destroyChart('radar-' + clusterId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  
  const regions = AppState.data.regions;
  const profiles = AppState.data.clusterProfiles;
  if (!regions || !profiles) return;
  
  // Compute per-cluster averages for selected year
  const vars = ['ikp', 'ipm', 'kemiskinan', 'tpt', 'prevalensi_gizi_kurang', 'kepadatan'];
  const varLabels = ['IKP', 'IPM', 'Kemiskinan', 'TPT', 'Gizi Kurang', 'Kepadatan'];
  
  const clusterValues = [0, 0, 0, 0, 0, 0];
  let count = 0;
  
  for (const [name, r] of Object.entries(regions)) {
    const yd = r.years[year];
    if (!yd || String(yd.cluster) !== String(clusterId)) continue;
    vars.forEach((v, i) => { clusterValues[i] += yd[v] || 0; });
    count++;
  }
  
  if (count > 0) {
    vars.forEach((_, i) => { clusterValues[i] /= count; });
  }
  
  // Normalize values to 0-100 scale for radar
  const maxValues = [100, 90, 25, 12, 80, 9000];
  const normalized = clusterValues.map((v, i) => Math.min((v / maxValues[i]) * 100, 100));
  
  chartInstances['radar-' + clusterId] = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: varLabels,
      datasets: [{
        label: `Cluster ${clusterId}`,
        data: normalized,
        backgroundColor: CLUSTER_BG[clusterId - 1],
        borderColor: CLUSTER_COLORS[clusterId - 1],
        borderWidth: 2,
        pointBackgroundColor: CLUSTER_COLORS[clusterId - 1],
        pointRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => {
              const actualValue = clusterValues[item.dataIndex];
              return `${varLabels[item.dataIndex]}: ${actualValue.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: { display: false },
          grid: { color: 'rgba(48,54,61,0.5)' },
          pointLabels: { color: '#C9D1D9', font: { size: 11 } },
          angleLines: { color: 'rgba(48,54,61,0.3)' },
        }
      }
    }
  });
}

// ─── Moran Scatter Plot ───
function renderMoranScatter(year) {
  destroyChart('moran-scatter');
  const ctx = document.getElementById('chart-moran-scatter');
  if (!ctx) return;
  
  const lisa = AppState.data.lisa;
  if (!lisa || !lisa[year]) return;
  
  const yearData = lisa[year];
  const points = [];
  
  for (const [region, data] of Object.entries(yearData)) {
    points.push({
      x: data.std_value,
      y: data.lag_value,
      name: region,
      category: data.category,
    });
  }
  
  const LISA_COLORS = { HH: '#D32F2F', LL: '#1976D2', HL: '#FF8F00', LH: '#7B1FA2', NS: '#455A64' };
  
  chartInstances['moran-scatter'] = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Wilayah',
        data: points.map(p => ({ x: p.x, y: p.y })),
        backgroundColor: points.map(p => LISA_COLORS[p.category] || '#455A64'),
        borderColor: points.map(p => LISA_COLORS[p.category] || '#455A64'),
        pointRadius: 5,
        pointHoverRadius: 8,
        _pointNames: points.map(p => p.name),
        _categories: points.map(p => p.category),
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
          callbacks: {
            title: (items) => {
              const ds = items[0]?.dataset;
              const idx = items[0]?.dataIndex;
              return ds?._pointNames?.[idx] || '';
            },
            label: (item) => {
              const cat = item.dataset._categories[item.dataIndex];
              return `IKP (std): ${item.raw.x.toFixed(2)}, Lag: ${item.raw.y.toFixed(2)} [${cat}]`;
            }
          }
        },
        annotation: undefined,
      },
      scales: {
        x: {
          title: { display: true, text: 'IKP (standardized)', color: '#8B949E' },
          grid: { color: 'rgba(48,54,61,0.3)' },
        },
        y: {
          title: { display: true, text: 'Spatial Lag', color: '#8B949E' },
          grid: { color: 'rgba(48,54,61,0.3)' },
        }
      }
    }
  });
}
