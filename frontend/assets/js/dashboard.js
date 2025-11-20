// Require authentication
requireAuth();

const user = getCurrentUser();

// Load dashboard data
async function loadDashboard() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/ad/history`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      displayKPIs(data.kpis);
      displayPredictions(data.predictions);
    } else {
      showAlert(data.error || 'Failed to load dashboard', 'error');
    }
  } catch (error) {
    showAlert('Connection error. Please try again.', 'error');
  }
}

// Display KPIs
function displayKPIs(kpis) {
  document.getElementById('total-ads').textContent = kpis.totalAds;
  document.getElementById('avg-ctr').textContent = kpis.avgCTR + '%';
  document.getElementById('avg-engagement').textContent = formatNumber(kpis.avgEngagement);
}

// Display predictions table
function displayPredictions(predictions) {
  const tbody = document.getElementById('predictions-list');
  
  if (predictions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No predictions yet. Create your first ad!</td></tr>';
    return;
  }
  
  tbody.innerHTML = predictions.map(pred => `
    <tr>
      <td>${pred.title}</td>
      <td>${pred.platform}</td>
      <td>${pred.ctr}%</td>
      <td>${formatNumber(pred.reach)}</td>
      <td>${formatNumber(pred.engagement)}</td>
      <td>${new Date(pred.createdAt).toLocaleDateString()}</td>
    </tr>
  `).join('');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  if (user) {
    document.getElementById('user-name').textContent = user.name;
  }
  loadDashboard();
});