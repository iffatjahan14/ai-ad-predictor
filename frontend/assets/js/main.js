// API Base URL
const API_BASE = 'http://localhost:5001/api';

// Show alert message
function showAlert(message, type = 'success') {
  const alertContainer = document.getElementById('alert-container');
  if (!alertContainer) return;
  
  alertContainer.innerHTML = `
    <div class="alert alert-${type}">
      ${message}
    </div>
  `;
  
  setTimeout(() => {
    alertContainer.innerHTML = '';
  }, 5000);
}

// Show loading spinner
function showLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = '<div class="spinner"></div>';
  }
}

// Hide loading
function hideLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = '';
  }
}

// Format number with commas
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Check if user is authenticated
function isAuthenticated() {
  return !!localStorage.getItem('token');
}

// Get current user
function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Redirect if not authenticated
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = 'signin.html';
  }
}

// Logout function
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'signin.html';
}

// Update navigation based on auth status
function updateNav() {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;
  
  if (isAuthenticated()) {
    const user = getCurrentUser();
    navLinks.innerHTML = `
      <li><a href="index.html" class="nav-link">Home</a></li>
      <li><a href="create-ad.html" class="nav-link">Create Ad</a></li>
      <li><a href="dashboard.html" class="nav-link">Dashboard</a></li>
      <li><span class="nav-link" style="opacity: 0.7;">Hi, ${user?.name || 'User'}</span></li>
      <li><a href="#" onclick="logout()" class="nav-link">Logout</a></li>
    `;
  } else {
    navLinks.innerHTML = `
      <li><a href="index.html" class="nav-link">Home</a></li>
      <li><a href="signin.html" class="nav-link">Sign In</a></li>
      <li><a href="signup.html" class="nav-link">Sign Up</a></li>
    `;
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  updateNav();
});