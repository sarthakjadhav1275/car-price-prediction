// AutoValuate AI - Frontend Controller

const CURRENT_YEAR = 2026;

// Elements
const brandSelect = document.getElementById('brandSelect');
const sellerTypeSelect = document.getElementById('sellerTypeSelect');
const ownerSelect = document.getElementById('ownerSelect');
const fuelPills = document.querySelectorAll('#fuelPills .pill');
const fuelInput = document.getElementById('fuelInput');
const transmissionBtns = document.querySelectorAll('#transmissionControl .seg-btn');
const transmissionInput = document.getElementById('transmissionInput');
const carAgeSlider = document.getElementById('carAgeSlider');
const carAgeVal = document.getElementById('carAgeVal');
const kmSlider = document.getElementById('kmSlider');
const kmVal = document.getElementById('kmVal');
const presetChips = document.querySelectorAll('.preset-chips .chip');
const valuationForm = document.getElementById('valuationForm');

// Display elements
const modelNameDisplay = document.getElementById('modelNameDisplay');
const priceDisplay = document.getElementById('priceDisplay');
const priceInrDisplay = document.getElementById('priceInrDisplay');
const rangeDisplay = document.getElementById('rangeDisplay');
const usageIntensity = document.getElementById('usageIntensity');
const depreciationVal = document.getElementById('depreciationVal');
const marketDemand = document.getElementById('marketDemand');
const brandInsight = document.getElementById('brandInsight');
const fuelInsight = document.getElementById('fuelInsight');
const ageInsight = document.getElementById('ageInsight');

// Modal elements
const btnOpenBenchmark = document.getElementById('btnOpenBenchmark');
const btnCloseModal = document.getElementById('btnCloseModal');
const benchmarkModal = document.getElementById('benchmarkModal');
const benchmarkTableBody = document.getElementById('benchmarkTableBody');

let metadata = null;

// Initialize
async function init() {
  await fetchMetadata();
  await fetchBenchmarks();
  setupEventListeners();
  triggerPrediction();
}

async function fetchMetadata() {
  try {
    const res = await fetch('/api/meta');
    if (!res.ok) throw new Error('Failed to fetch metadata');
    metadata = await res.json();

    if (metadata.best_model) {
      modelNameDisplay.textContent = metadata.best_model;
    }

    // Populate brands
    if (metadata.choices && metadata.choices.brand) {
      brandSelect.innerHTML = '';
      metadata.choices.brand.forEach(brand => {
        const opt = document.createElement('option');
        opt.value = brand;
        opt.textContent = brand;
        if (brand.toLowerCase() === 'maruti' || brand.toLowerCase() === 'hyundai') {
          opt.selected = true;
        }
        brandSelect.appendChild(opt);
      });
      // Fallback selection if maruti not found
      if (!brandSelect.value && metadata.choices.brand.length > 0) {
        brandSelect.value = metadata.choices.brand[0];
      }
    }
  } catch (err) {
    console.error('Error loading metadata:', err);
    modelNameDisplay.textContent = 'Active (Offline Meta)';
  }
}

async function fetchBenchmarks() {
  try {
    const res = await fetch('/api/models');
    if (!res.ok) return;
    const data = await res.json();
    if (data.models && data.models.length > 0) {
      benchmarkTableBody.innerHTML = '';
      const topModel = data.models[0].Model;
      data.models.forEach((m, idx) => {
        const tr = document.createElement('tr');
        if (idx === 0) tr.classList.add('winner');
        tr.innerHTML = `
          <td>${m.Model}</td>
          <td><strong>${(m.R2 * 100).toFixed(1)}%</strong> (${m.R2.toFixed(4)})</td>
          <td>${m['CV R2 (mean)'] ? (m['CV R2 (mean)'] * 100).toFixed(1) + '%' : 'N/A'}</td>
          <td>₹${Number(m.MAE).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
          <td>₹${Number(m.RMSE).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
          <td>
            <span class="status-badge ${idx === 0 ? 'active-model' : ''}">
              ${idx === 0 ? 'Deployed' : 'Benchmarked'}
            </span>
          </td>
        `;
        benchmarkTableBody.appendChild(tr);
      });
    }
  } catch (err) {
    console.error('Failed to load benchmarks:', err);
  }
}

function setupEventListeners() {
  // Fuel pills
  fuelPills.forEach(pill => {
    pill.addEventListener('click', () => {
      fuelPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      fuelInput.value = pill.getAttribute('data-value');
      triggerPrediction();
    });
  });

  // Transmission segmented buttons
  transmissionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      transmissionBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      transmissionInput.value = btn.getAttribute('data-value');
      triggerPrediction();
    });
  });

  // Age slider
  carAgeSlider.addEventListener('input', () => {
    const age = parseInt(carAgeSlider.value);
    const regYear = CURRENT_YEAR - age;
    carAgeVal.textContent = `${age} yrs (${regYear})`;
    triggerPrediction();
  });

  // KM slider
  kmSlider.addEventListener('input', () => {
    const km = parseInt(kmSlider.value);
    kmVal.textContent = `${km.toLocaleString('en-IN')} km`;
    triggerPrediction();
  });

  // Preset chips
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const km = chip.getAttribute('data-km');
      kmSlider.value = km;
      kmVal.textContent = `${parseInt(km).toLocaleString('en-IN')} km`;
      triggerPrediction();
    });
  });

  // Dropdown changes
  brandSelect.addEventListener('change', triggerPrediction);
  sellerTypeSelect.addEventListener('change', triggerPrediction);
  ownerSelect.addEventListener('change', triggerPrediction);

  // Form submit
  valuationForm.addEventListener('submit', e => {
    e.preventDefault();
    triggerPrediction();
  });

  // Modal
  btnOpenBenchmark.addEventListener('click', () => {
    benchmarkModal.classList.add('open');
  });

  btnCloseModal.addEventListener('click', () => {
    benchmarkModal.classList.remove('open');
  });

  benchmarkModal.addEventListener('click', e => {
    if (e.target === benchmarkModal) {
      benchmarkModal.classList.remove('open');
    }
  });
}

// Debounce timer for smooth typing/slider interaction
let debounceTimer;
function triggerPrediction() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(predictPrice, 150);
}

async function predictPrice() {
  const payload = {
    brand: brandSelect.value || 'Maruti',
    fuel: fuelInput.value,
    seller_type: sellerTypeSelect.value,
    transmission: transmissionInput.value,
    owner: ownerSelect.value,
    car_age: parseInt(carAgeSlider.value),
    km_driven: parseInt(kmSlider.value)
  };

  try {
    const res = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Prediction API failed');
    const data = await res.json();

    if (data.success) {
      // Update price
      priceDisplay.textContent = data.formatted_price;
      priceInrDisplay.textContent = `${data.price_inr} INR`;
      rangeDisplay.textContent = data.range_text;

      // Update analytics
      usageIntensity.textContent = `${data.km_per_year.toLocaleString('en-IN')} km/yr`;
      depreciationVal.textContent = `${data.depreciation_pct}%`;

      if (data.km_per_year < 8000) {
        marketDemand.textContent = 'High (Low Run)';
        marketDemand.className = 'meta-data highlight-green';
      } else if (data.km_per_year > 18000) {
        marketDemand.textContent = 'Moderate (High Run)';
        marketDemand.className = 'meta-data';
      } else {
        marketDemand.textContent = 'High Demand';
        marketDemand.className = 'meta-data highlight-green';
      }

      // Update contextual insights
      brandInsight.textContent = `${payload.brand} enjoys active resale liquidity with steady market valuation.`;
      fuelInsight.textContent = `${payload.fuel} powertrain paired with ${payload.transmission} transmission.`;
      ageInsight.textContent = `${payload.car_age} years old with ${payload.km_driven.toLocaleString('en-IN')} km on the odometer.`;
    }
  } catch (err) {
    console.error('Error during prediction:', err);
  }
}

// Start application
document.addEventListener('DOMContentLoaded', init);
