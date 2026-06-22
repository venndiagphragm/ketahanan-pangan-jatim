/**
 * app.js — Main Application Logic
 * Handles routing, data loading, animations, and state management.
 */

// ─── Global State ───
const AppState = {
  currentPage: 'landing',
  data: {
    summary: null,
    regions: null,
    morans: null,
    lisa: null,
    clusterProfiles: null,
    geojson: null,
  },
  loading: false,
};

// ─── Data Loading ───
async function loadJSON(path) {
  const resp = await fetch(path);
  if (!resp.ok) throw new Error(`Failed to load ${path}: ${resp.status}`);
  return resp.json();
}

async function loadAllData() {
  AppState.loading = true;
  try {
    const [summary, regions, morans, lisa, clusterProfiles, geojson] = await Promise.all([
      loadJSON('data/summary.json'),
      loadJSON('data/regions.json'),
      loadJSON('data/morans.json'),
      loadJSON('data/lisa.json'),
      loadJSON('data/cluster_profiles.json'),
      loadJSON('data/jatim_simplified.geojson'),
    ]);
    AppState.data = { summary, regions, morans, lisa, clusterProfiles, geojson };
    console.log('All data loaded successfully');
    updateMetricTargets();
  } catch (err) {
    console.error('Data loading error:', err);
  }
  AppState.loading = false;
}

function updateMetricTargets() {
  const s = AppState.data.summary;
  if (!s || !s.all) return;
  const metricIkp = document.querySelector('#metric-ikp .metric-value');
  const metricIpm = document.querySelector('#metric-ipm .metric-value');
  const metricKem = document.querySelector('#metric-kemiskinan .metric-value');
  if (metricIkp) metricIkp.dataset.target = s.all.avg_ikp;
  if (metricIpm) metricIpm.dataset.target = s.all.avg_ipm;
  if (metricKem) metricKem.dataset.target = s.all.avg_kemiskinan;
}

// ─── Routing ───
function navigateTo(page) {
  if (page === AppState.currentPage) return;
  
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
  });
  
  // Show target page
  const target = document.getElementById(`page-${page}`);
  if (target) {
    target.classList.add('active');
    // Force re-render with a slight delay for CSS transition
    requestAnimationFrame(() => {
      target.style.opacity = '1';
    });
  }
  
  // Update nav links
  document.querySelectorAll('.navbar-links a').forEach(link => {
    link.classList.toggle('active', link.dataset.page === page);
  });
  
  // Update navbar style
  const navbar = document.getElementById('navbar');
  if (page === 'landing') {
    navbar.classList.add('transparent');
    navbar.classList.remove('solid');
  } else {
    navbar.classList.remove('transparent');
    navbar.classList.add('solid');
  }
  
  AppState.currentPage = page;
  window.location.hash = page;
  
  // Initialize page-specific content
  initPage(page);
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function initPage(page) {
  switch (page) {
    case 'overview':
      if (typeof initOverviewCharts === 'function') initOverviewCharts();
      break;
    case 'peta-ikp':
      if (typeof initMapIKP === 'function') initMapIKP();
      break;
    case 'peta-cluster':
      if (typeof initMapCluster === 'function') initMapCluster();
      break;
    case 'profil':
      if (typeof initProfile === 'function') initProfile();
      break;
  }
}

// ─── Navbar Scroll Behavior ───
function handleNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (AppState.currentPage !== 'landing') return;
  
  if (window.scrollY > 100) {
    navbar.classList.remove('transparent');
    navbar.classList.add('solid');
  } else {
    navbar.classList.add('transparent');
    navbar.classList.remove('solid');
  }
}

// ─── Progress Bar ───
function updateProgressBar() {
  const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
  document.getElementById('progressBar').style.width = scrolled + '%';
}

// ─── Intersection Observer for Animations ───
function setupIntersectionObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        // Count-up animation for metric values
        if (entry.target.classList.contains('metric-card')) {
          const valueEl = entry.target.querySelector('.metric-value');
          if (valueEl && !valueEl.dataset.animated) {
            animateCountUp(valueEl);
          }
        }
      }
    });
  }, { threshold: 0.15 });
  
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  
  // Also observe metric cards specifically
  document.querySelectorAll('#metrics-section .metric-card').forEach(el => observer.observe(el));
}

// ─── Count-Up Animation ───
function animateCountUp(element) {
  const target = parseFloat(element.dataset.target) || 0;
  const type = element.dataset.type || 'float';
  const suffix = element.dataset.suffix || '';
  const duration = 1500;
  const startTime = performance.now();
  
  element.dataset.animated = 'true';
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = target * eased;
    
    if (type === 'int') {
      element.textContent = Math.round(current) + suffix;
    } else {
      element.textContent = current.toFixed(2) + suffix;
    }
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// ─── Event Listeners ───
function setupEventListeners() {
  // Nav links
  document.querySelectorAll('.navbar-links a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.dataset.page);
    });
  });
  
  // Navigate buttons and cards
  document.querySelectorAll('[data-navigate]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(el.dataset.navigate);
    });
  });
  
  // Scroll events
  window.addEventListener('scroll', () => {
    handleNavbarScroll();
    updateProgressBar();
  }, { passive: true });
  
  // Hash change
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') || 'landing';
    navigateTo(hash);
  });
}

// ─── Utility Functions ───
function getRegionsByCluster(year, cluster) {
  const regions = AppState.data.regions;
  if (!regions) return [];
  
  const result = [];
  for (const [name, data] of Object.entries(regions)) {
    const yearData = data.years[year];
    if (yearData && yearData.cluster === cluster) {
      result.push(name);
    }
  }
  return result.sort();
}

function getAllRegionNames() {
  const regions = AppState.data.regions;
  if (!regions) return [];
  return Object.keys(regions).sort();
}

function getYears() {
  return ['2021', '2022', '2023', '2024', '2025'];
}

// ─── Initialize ───
document.addEventListener('DOMContentLoaded', async () => {
  // Load data first
  await loadAllData();
  
  // Setup event listeners
  setupEventListeners();
  
  // Setup intersection observer
  setupIntersectionObserver();
  
  // Handle initial hash
  const hash = window.location.hash.replace('#', '') || 'landing';
  if (hash !== 'landing') {
    navigateTo(hash);
  }
  
  console.log('Dashboard initialized');
});
