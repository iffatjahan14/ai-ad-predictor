// Require authentication
requireAuth();

let currentData = null;

// Load prediction results
function loadPrediction() {
  const dataStr = sessionStorage.getItem('currentPrediction');
  
  if (!dataStr) {
    showAlert('No prediction data found. Please create an ad first.', 'error');
    setTimeout(() => {
      window.location.href = 'create-ad.html';
    }, 2000);
    return;
  }
  
  currentData = JSON.parse(dataStr);
  displayPrediction(currentData);
}

// Display prediction results
function displayPrediction(data) {
  const { adData, prediction } = data;
  
  // Display ad info
  document.getElementById('ad-title-display').textContent = adData.title;
  document.getElementById('ad-platform').textContent = adData.platform;
  document.getElementById('ad-budget').textContent = `$${adData.budget}`;
  
  // Display metrics
  document.getElementById('ctr-value').textContent = prediction.ctr;
  document.getElementById('reach-value').textContent = formatNumber(prediction.reach);
  document.getElementById('engagement-value').textContent = formatNumber(prediction.engagement);
  document.getElementById('confidence-value').textContent = Math.round(prediction.confidence * 100);
  
  // Display explanation
  document.getElementById('explanation').textContent = prediction.explanation;
  
  // Display AI badge
  if (prediction.isAIGenerated) {
    document.getElementById('ai-badge').innerHTML = '<span class="badge badge-success">✨ Google Gemini AI</span>';
  } else {
    document.getElementById('ai-badge').innerHTML = '<span class="badge badge-info">📊 Mock Prediction</span>';
  }
  
  // Create chart
  createPredictionChart(prediction);
}

// Create prediction chart
function createPredictionChart(prediction) {
  const canvas = document.getElementById('prediction-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['CTR (%)', 'Reach (scaled)', 'Engagement (scaled)'],
      datasets: [{
        label: 'Predicted Metrics',
        data: [
          prediction.ctr,
          prediction.reach / 100,
          prediction.engagement
        ],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#cbd5e1' },
          grid: { color: '#334155' }
        },
        x: {
          ticks: { color: '#cbd5e1' },
          grid: { color: '#334155' }
        }
      }
    }
  });
}

// Navigate to suggestions
function goToSuggestions() {
  if (!currentData) {
    showAlert('No prediction data available', 'error');
    return;
  }
  
  sessionStorage.setItem('currentPrediction', JSON.stringify(currentData));
  window.location.href = 'suggestions.html';
}

// Save prediction to dashboard
async function savePrediction() {
  if (!currentData) {
    showAlert('No prediction data available', 'error');
    return;
  }
  
  const saveBtn = document.getElementById('save-btn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/ad/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(currentData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showAlert('✅ Prediction saved to dashboard!', 'success');
      saveBtn.textContent = '✅ Saved';
      
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);
    } else {
      showAlert(data.error || 'Failed to save prediction', 'error');
      saveBtn.disabled = false;
      saveBtn.textContent = '💾 Save to Dashboard';
    }
  } catch (error) {
    showAlert('Connection error. Please try again.', 'error');
    saveBtn.disabled = false;
    saveBtn.textContent = '💾 Save to Dashboard';
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadPrediction();
});