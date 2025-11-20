// Require authentication
requireAuth();

let uploadedImage = null;

// Handle file upload
document.getElementById('ad-image')?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    showAlert('Please upload an image file', 'error');
    return;
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showAlert('Image must be smaller than 5MB', 'error');
    return;
  }
  
  // Convert to base64
  const reader = new FileReader();
  reader.onload = (event) => {
    uploadedImage = event.target.result;
    document.getElementById('file-name').textContent = file.name;
    showAlert('Image uploaded successfully', 'success');
  };
  reader.readAsDataURL(file);
});

// Handle form submission
async function handleCreateAd(e) {
  e.preventDefault();
  
  const adData = {
    title: document.getElementById('ad-title').value.trim(),
    text: document.getElementById('ad-text').value.trim(),
    budget: parseFloat(document.getElementById('budget').value),
    audience: document.getElementById('audience').value.trim(),
    platform: document.getElementById('platform').value,
    image: uploadedImage
  };
  
  // Validation
  if (!adData.title || !adData.text || !adData.budget || !adData.audience || !adData.platform) {
    showAlert('Please fill in all required fields', 'error');
    return;
  }
  
  if (adData.budget < 1) {
    showAlert('Budget must be at least $1', 'error');
    return;
  }
  
  const submitBtn = document.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px; border-width: 2px; margin: 0;"></div> Generating Prediction...';
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/ad/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(adData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Store prediction data for next page
      sessionStorage.setItem('currentPrediction', JSON.stringify({
        adData,
        prediction: data.prediction
      }));
      
      // Redirect to prediction page
      window.location.href = 'prediction.html';
    } else {
      showAlert(data.error || 'Prediction failed', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '🤖 Generate Prediction';
    }
  } catch (error) {
    showAlert('Connection error. Please try again.', 'error');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '🤖 Generate Prediction';
  }
}