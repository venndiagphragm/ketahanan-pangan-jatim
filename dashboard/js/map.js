/**
 * map.js — Leaflet Map Module
 * Handles IKP choropleth, Cluster map, and LISA visualization.
 */

let mapIKP = null;
let mapCluster = null;
let ikpLayer = null;
let clusterLayer = null;
let lisaLayer = null;
let ikpLegend = null;
let clusterLegend = null;
let autoplayTimerIKP = null;
let autoplayTimerCluster = null;

const JATIM_BOUNDS = [[-8.8, 110.8], [-6.8, 114.8]];

// ─── Color Utilities ───
function getIKPColor(ikp) {
  if (ikp >= 80) return '#2E7D32';
  if (ikp >= 75) return '#81C784';
  if (ikp >= 70) return '#FDD835';
  if (ikp >= 65) return '#E65100';
  return '#7B1FA2';
}

function getClusterColor(cluster) {
  const colors = { 1: '#EF5350', 2: '#42A5F5', 3: '#66BB6A' };
  return colors[cluster] || '#455A64';
}

function getLISAColor(category) {
  const colors = { HH: '#D32F2F', LL: '#1976D2', HL: '#FF8F00', LH: '#7B1FA2', NS: '#455A64' };
  return colors[category] || '#455A64';
}

// ─── Tooltip Builder ───
function buildTooltip(props, type) {
  const name = props.nama_final || 'Unknown';
  const tahun = props.Tahun || '-';
  const ikp = parseFloat(props.IKP_offstat) || 0;
  const ipm = parseFloat(props.IPM) || 0;
  const kemiskinan = parseFloat(props.Kemiskinan) || 0;
  const cluster = parseInt(props.Cluster) || 0;
  
  let html = `<div class="map-tooltip">`;
  html += `<div class="tooltip-title">${name}</div>`;
  html += `<div class="tooltip-row"><span class="label">Tahun</span><span class="value">${tahun}</span></div>`;
  html += `<div class="tooltip-row"><span class="label">IKP</span><span class="value">${ikp.toFixed(2)}</span></div>`;
  html += `<div class="tooltip-row"><span class="label">IPM</span><span class="value">${ipm.toFixed(2)}</span></div>`;
  html += `<div class="tooltip-row"><span class="label">Kemiskinan</span><span class="value">${kemiskinan.toFixed(2)}%</span></div>`;
  html += `<div class="tooltip-row"><span class="label">Cluster</span><span class="value"><span class="cluster-badge cluster-${cluster}">Cluster ${cluster}</span></span></div>`;
  
  if (type === 'lisa') {
    const lisa = AppState.data.lisa;
    const yearStr = String(tahun);
    if (lisa && lisa[yearStr] && lisa[yearStr][name]) {
      const lisaData = lisa[yearStr][name];
      html += `<div class="tooltip-row"><span class="label">LISA</span><span class="value">${lisaData.category}</span></div>`;
    }
  }
  
  html += `</div>`;
  return html;
}

// ─── GeoJSON Style Functions ───
function ikpStyle(feature) {
  const ikp = parseFloat(feature.properties.IKP_offstat) || 0;
  return {
    fillColor: getIKPColor(ikp),
    weight: 1,
    opacity: 1,
    color: '#30363D',
    fillOpacity: 0.75,
  };
}

function clusterStyle(feature) {
  const cluster = parseInt(feature.properties.Cluster) || 0;
  return {
    fillColor: getClusterColor(cluster),
    weight: 1,
    opacity: 1,
    color: '#30363D',
    fillOpacity: 0.75,
  };
}

function lisaStyle(feature) {
  const name = feature.properties.nama_final;
  const tahun = String(feature.properties.Tahun);
  const lisa = AppState.data.lisa;
  let category = 'NS';
  
  if (lisa && lisa[tahun] && lisa[tahun][name]) {
    category = lisa[tahun][name].category;
  }
  
  return {
    fillColor: getLISAColor(category),
    weight: 1,
    opacity: 1,
    color: '#30363D',
    fillOpacity: 0.75,
  };
}

// ─── Feature Interaction ───
function onEachFeature(feature, layer, tooltipType) {
  layer.on({
    mouseover: (e) => {
      const l = e.target;
      l.setStyle({ weight: 2, color: '#D4A017', fillOpacity: 0.9 });
      l.bringToFront();
    },
    mouseout: (e) => {
      const l = e.target;
      // Reset to appropriate style
      if (tooltipType === 'ikp') {
        l.setStyle(ikpStyle(feature));
      } else if (tooltipType === 'cluster') {
        l.setStyle(clusterStyle(feature));
      } else {
        l.setStyle(lisaStyle(feature));
      }
    },
    click: (e) => {
      const name = feature.properties.nama_final;
      if (name) {
        // Navigate to profile page with this region selected
        navigateTo('profil');
        setTimeout(() => {
          const select = document.getElementById('profile-region-select');
          if (select) {
            select.value = name;
            select.dispatchEvent(new Event('change'));
          }
        }, 300);
      }
    }
  });
  
  layer.bindTooltip(buildTooltip(feature.properties, tooltipType), {
    sticky: true,
    className: 'map-tooltip-wrapper',
    direction: 'top',
    offset: [0, -10],
  });
}

// ─── Filter GeoJSON by Year ───
function filterGeoJSONByYear(geojson, year) {
  return {
    type: 'FeatureCollection',
    features: geojson.features.filter(f => {
      const fYear = String(f.properties.Tahun).trim();
      return fYear === String(year);
    })
  };
}

// ─── Legend Creation ───
function createIKPLegend(map) {
  if (ikpLegend) map.removeControl(ikpLegend);
  
  ikpLegend = L.control({ position: 'bottomright' });
  ikpLegend.onAdd = function() {
    const div = L.DomUtil.create('div', 'map-legend');
    div.innerHTML = `
      <div class="legend-title">Indeks Ketahanan Pangan</div>
      <div class="legend-item"><span class="legend-color" style="background:#7B1FA2"></span> &lt; 65 (Sangat Rendah)</div>
      <div class="legend-item"><span class="legend-color" style="background:#E65100"></span> 65 - 70</div>
      <div class="legend-item"><span class="legend-color" style="background:#FDD835"></span> 70 - 75</div>
      <div class="legend-item"><span class="legend-color" style="background:#81C784"></span> 75 - 80</div>
      <div class="legend-item"><span class="legend-color" style="background:#2E7D32"></span> &gt; 80 (Sangat Tinggi)</div>
    `;
    return div;
  };
  ikpLegend.addTo(map);
}

function createClusterLegend(map, type) {
  if (clusterLegend) map.removeControl(clusterLegend);
  
  clusterLegend = L.control({ position: 'bottomright' });
  clusterLegend.onAdd = function() {
    const div = L.DomUtil.create('div', 'map-legend');
    
    if (type === 'cluster') {
      div.innerHTML = `
        <div class="legend-title">Cluster K-Means</div>
        <div class="legend-item"><span class="legend-color" style="background:#EF5350"></span> Cluster 1 (Tekanan Tinggi)</div>
        <div class="legend-item"><span class="legend-color" style="background:#42A5F5"></span> Cluster 2 (Tipikal)</div>
        <div class="legend-item"><span class="legend-color" style="background:#66BB6A"></span> Cluster 3 (Perkotaan Maju)</div>
      `;
    } else {
      div.innerHTML = `
        <div class="legend-title">LISA Categories</div>
        <div class="legend-item"><span class="legend-color" style="background:#D32F2F"></span> High-High (HH)</div>
        <div class="legend-item"><span class="legend-color" style="background:#1976D2"></span> Low-Low (LL)</div>
        <div class="legend-item"><span class="legend-color" style="background:#FF8F00"></span> High-Low (HL)</div>
        <div class="legend-item"><span class="legend-color" style="background:#7B1FA2"></span> Low-High (LH)</div>
        <div class="legend-item"><span class="legend-color" style="background:#455A64"></span> Not Significant</div>
      `;
    }
    return div;
  };
  clusterLegend.addTo(map);
}

// ─── IKP Map Initialization ───
let mapIKPInitialized = false;

function initMapIKP() {
  if (mapIKPInitialized) {
    updateMapIKP(document.getElementById('year-slider-ikp').value);
    return;
  }
  
  const geojson = AppState.data.geojson;
  if (!geojson) return;
  
  // Small delay to ensure DOM is ready
  setTimeout(() => {
    mapIKP = L.map('map-ikp', {
      zoomControl: true,
      attributionControl: false,
    });
    
    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(mapIKP);
    
    mapIKP.fitBounds(JATIM_BOUNDS);
    
    createIKPLegend(mapIKP);
    
    // Year slider
    const slider = document.getElementById('year-slider-ikp');
    const label = document.getElementById('year-label-ikp');
    
    slider.addEventListener('input', (e) => {
      label.textContent = e.target.value;
      updateMapIKP(e.target.value);
    });
    
    // Autoplay
    const autoBtn = document.getElementById('autoplay-ikp');
    autoBtn.addEventListener('click', () => toggleAutoplay('ikp'));
    
    updateMapIKP(slider.value);
    mapIKPInitialized = true;
  }, 100);
}

function updateMapIKP(year) {
  if (!mapIKP || !AppState.data.geojson) return;
  
  if (ikpLayer) mapIKP.removeLayer(ikpLayer);
  
  const filtered = filterGeoJSONByYear(AppState.data.geojson, year);
  
  ikpLayer = L.geoJSON(filtered, {
    style: ikpStyle,
    onEachFeature: (f, l) => onEachFeature(f, l, 'ikp'),
  }).addTo(mapIKP);
  
  // Update Moran's I panel
  updateMoransPanel(year);
}

function updateMoransPanel(year) {
  const morans = AppState.data.morans;
  if (!morans || !morans[year]) return;
  
  const m = morans[year];
  
  document.getElementById('morans-i-val').textContent = m.morans_i.toFixed(4);
  document.getElementById('morans-p-val').textContent = m.p_value.toFixed(4);
  document.getElementById('morans-z-val').textContent = m.z_score.toFixed(4);
  
  const badgeContainer = document.getElementById('morans-badge-container');
  if (m.significant) {
    badgeContainer.innerHTML = `<span class="significance-badge significant">SIGNIFIKAN</span><br><small style="color:var(--color-text-muted)">pada alpha = 0.05</small>`;
  } else {
    badgeContainer.innerHTML = `<span class="significance-badge not-significant">TIDAK SIGNIFIKAN</span><br><small style="color:var(--color-text-muted)">pada alpha = 0.05</small>`;
  }
  
  // Conclusion text
  const conclusionEl = document.getElementById('morans-conclusion');
  if (m.p_value < 0.05 && m.morans_i > 0) {
    conclusionEl.textContent = `IKP tahun ${year} menunjukkan pola pengelompokan spasial positif yang signifikan (Moran's I = ${m.morans_i.toFixed(4)}, p = ${m.p_value.toFixed(4)}). Wilayah dengan IKP tinggi cenderung berdekatan dengan wilayah IKP tinggi lainnya, dan sebaliknya. H1 diterima.`;
  } else if (m.p_value < 0.05 && m.morans_i < 0) {
    conclusionEl.textContent = `Terdapat pola spasial dispersi yang signifikan pada tahun ${year} (Moran's I = ${m.morans_i.toFixed(4)}, p = ${m.p_value.toFixed(4)}). H1 diterima.`;
  } else {
    conclusionEl.textContent = `Tidak cukup bukti untuk menolak H0 pada tahun ${year} (p = ${m.p_value.toFixed(4)}). Pola distribusi IKP bersifat acak.`;
  }
  
  // Moran scatter plot
  if (typeof renderMoranScatter === 'function') {
    renderMoranScatter(year);
  }
}

// ─── Cluster Map Initialization ───
let mapClusterInitialized = false;
let currentClusterLayer = 'cluster';

function initMapCluster() {
  if (mapClusterInitialized) {
    const year = document.getElementById('year-slider-cluster').value;
    updateMapCluster(year);
    updateClusterPanels(year);
    return;
  }
  
  const geojson = AppState.data.geojson;
  if (!geojson) return;
  
  setTimeout(() => {
    mapCluster = L.map('map-cluster', {
      zoomControl: true,
      attributionControl: false,
    });
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(mapCluster);
    
    mapCluster.fitBounds(JATIM_BOUNDS);
    
    createClusterLegend(mapCluster, 'cluster');
    
    // Year slider
    const slider = document.getElementById('year-slider-cluster');
    const label = document.getElementById('year-label-cluster');
    
    slider.addEventListener('input', (e) => {
      label.textContent = e.target.value;
      updateMapCluster(e.target.value);
      updateClusterPanels(e.target.value);
    });
    
    // Autoplay
    const autoBtn = document.getElementById('autoplay-cluster');
    autoBtn.addEventListener('click', () => toggleAutoplay('cluster'));
    
    // Layer toggle
    document.querySelectorAll('#layer-toggle .layer-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#layer-toggle .layer-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentClusterLayer = btn.dataset.layer;
        
        const year = slider.value;
        updateMapCluster(year);
        createClusterLegend(mapCluster, currentClusterLayer);
      });
    });
    
    // Cluster tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabTarget = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.getElementById('tab-' + tabTarget).classList.add('active');
      });
    });
    
    updateMapCluster(slider.value);
    updateClusterPanels(slider.value);
    mapClusterInitialized = true;
  }, 100);
}

function updateMapCluster(year) {
  if (!mapCluster || !AppState.data.geojson) return;
  
  if (clusterLayer) mapCluster.removeLayer(clusterLayer);
  if (lisaLayer) mapCluster.removeLayer(lisaLayer);
  
  const filtered = filterGeoJSONByYear(AppState.data.geojson, year);
  
  if (currentClusterLayer === 'cluster') {
    clusterLayer = L.geoJSON(filtered, {
      style: clusterStyle,
      onEachFeature: (f, l) => onEachFeature(f, l, 'cluster'),
    }).addTo(mapCluster);
  } else {
    lisaLayer = L.geoJSON(filtered, {
      style: lisaStyle,
      onEachFeature: (f, l) => onEachFeature(f, l, 'lisa'),
    }).addTo(mapCluster);
  }
}

function updateClusterPanels(year) {
  // Update radar charts
  [1, 2, 3].forEach(c => {
    renderClusterRadar(c, `chart-radar-${c}`, year);
    
    // Update region lists
    const listEl = document.getElementById(`cluster-${c}-regions`);
    if (listEl) {
      const regions = getRegionsByCluster(year, c);
      listEl.innerHTML = regions.map(r => `<span class="region-tag">${r}</span>`).join('');
    }
  });
  
  // Update LISA panel
  updateLISAPanel(year);
}

function updateLISAPanel(year) {
  const morans = AppState.data.morans;
  const lisa = AppState.data.lisa;
  const contentEl = document.getElementById('lisa-content');
  
  if (!morans || !morans[year] || !morans[year].significant) {
    contentEl.innerHTML = `<div class="lisa-notice">Analisis LISA tidak dilanjutkan karena uji Moran's I tidak signifikan (H0 tidak ditolak) pada tahun ${year}.</div>`;
    return;
  }
  
  if (!lisa || !lisa[year]) {
    contentEl.innerHTML = `<div class="lisa-notice">Data LISA tidak tersedia untuk tahun ${year}.</div>`;
    return;
  }
  
  const yearLisa = lisa[year];
  const categories = { HH: [], LL: [], HL: [], LH: [], NS: [] };
  
  for (const [region, data] of Object.entries(yearLisa)) {
    categories[data.category]?.push({ region, ...data });
  }
  
  let html = `
    <div class="lisa-legend">
      <div class="lisa-legend-item"><span class="lisa-color-dot" style="background:#D32F2F"></span> HH: ${categories.HH.length}</div>
      <div class="lisa-legend-item"><span class="lisa-color-dot" style="background:#1976D2"></span> LL: ${categories.LL.length}</div>
      <div class="lisa-legend-item"><span class="lisa-color-dot" style="background:#FF8F00"></span> HL: ${categories.HL.length}</div>
      <div class="lisa-legend-item"><span class="lisa-color-dot" style="background:#7B1FA2"></span> LH: ${categories.LH.length}</div>
      <div class="lisa-legend-item"><span class="lisa-color-dot" style="background:#455A64"></span> NS: ${categories.NS.length}</div>
    </div>
  `;
  
  // LISA table for significant regions only
  const significantRegions = [...categories.HH, ...categories.LL, ...categories.HL, ...categories.LH];
  
  if (significantRegions.length > 0) {
    html += `<table class="data-table" style="margin-top:var(--space-md);">
      <thead><tr><th>Wilayah</th><th>LISA</th><th>p-local</th></tr></thead>
      <tbody>`;
    
    significantRegions.sort((a, b) => a.p_local - b.p_local);
    significantRegions.forEach(r => {
      const catColor = getLISAColor(r.category);
      html += `<tr>
        <td style="font-family:var(--font-body)">${r.region}</td>
        <td><span style="color:${catColor};font-weight:700">${r.category}</span></td>
        <td>${r.p_local.toFixed(4)}</td>
      </tr>`;
    });
    
    html += `</tbody></table>`;
  } else {
    html += `<div class="lisa-notice">Tidak ada wilayah dengan kategori LISA signifikan pada tahun ${year}.</div>`;
  }
  
  contentEl.innerHTML = html;
}

// ─── Autoplay ───
function toggleAutoplay(mapType) {
  if (mapType === 'ikp') {
    const btn = document.getElementById('autoplay-ikp');
    const slider = document.getElementById('year-slider-ikp');
    const label = document.getElementById('year-label-ikp');
    
    if (autoplayTimerIKP) {
      clearInterval(autoplayTimerIKP);
      autoplayTimerIKP = null;
      btn.classList.remove('playing');
      btn.innerHTML = '&#9654;';
      return;
    }
    
    btn.classList.add('playing');
    btn.innerHTML = '&#9646;&#9646;';
    
    let currentYear = parseInt(slider.value);
    autoplayTimerIKP = setInterval(() => {
      currentYear++;
      if (currentYear > 2025) currentYear = 2021;
      slider.value = currentYear;
      label.textContent = currentYear;
      updateMapIKP(String(currentYear));
    }, 1500);
  } else {
    const btn = document.getElementById('autoplay-cluster');
    const slider = document.getElementById('year-slider-cluster');
    const label = document.getElementById('year-label-cluster');
    
    if (autoplayTimerCluster) {
      clearInterval(autoplayTimerCluster);
      autoplayTimerCluster = null;
      btn.classList.remove('playing');
      btn.innerHTML = '&#9654;';
      return;
    }
    
    btn.classList.add('playing');
    btn.innerHTML = '&#9646;&#9646;';
    
    let currentYear = parseInt(slider.value);
    autoplayTimerCluster = setInterval(() => {
      currentYear++;
      if (currentYear > 2025) currentYear = 2021;
      slider.value = currentYear;
      label.textContent = currentYear;
      updateMapCluster(String(currentYear));
      updateClusterPanels(String(currentYear));
    }, 1500);
  }
}
