// Require authentication
requireAuth();

let generatedAudience = '';

// Handle form submission
document.getElementById('audience-form')?.addEventListener('submit', function(e) {
  e.preventDefault();
  
  // Collect form data
  const clothingType = document.getElementById('clothing-type').value;
  const priceRange = document.getElementById('price-range').value;
  const gender = document.querySelector('input[name="gender"]:checked').value;
  const ageGroup = document.getElementById('age-group').value;
  const location = document.getElementById('location').value;
  const shoppingBehavior = document.getElementById('shopping-behavior').value;
  
  // Get selected interests
  const interestCheckboxes = document.querySelectorAll('input[name="interests"]:checked');
  const interests = Array.from(interestCheckboxes).map(cb => cb.value);
  
  // Generate audience description
  const audienceDescription = buildAudienceDescription({
    clothingType,
    priceRange,
    gender,
    ageGroup,
    location,
    shoppingBehavior,
    interests
  });
  
  generatedAudience = audienceDescription;
  
  // Display results
  displayAudienceResults(audienceDescription, {
    clothingType,
    priceRange,
    gender,
    ageGroup,
    location,
    shoppingBehavior,
    interests
  });
  
  // Show success message
  showAlert('✅ Target audience generated successfully!', 'success');
  
  // Scroll to results
  document.getElementById('audience-result').scrollIntoView({ behavior: 'smooth' });
});

// Build audience description
function buildAudienceDescription(data) {
  const { clothingType, priceRange, gender, ageGroup, location, shoppingBehavior, interests } = data;
  
  let description = '';
  
  // Gender and age
  description += `${gender} aged ${ageGroup}, `;
  
  // Location
  description += `located in ${location}, `;
  
  // Interests
  if (interests.length > 0) {
    description += `interested in ${interests.join(', ')}, `;
  }
  
  // Shopping behavior
  description += `${shoppingBehavior.toLowerCase()}, `;
  
  // Price sensitivity
  const priceBehavior = getPriceBehavior(priceRange);
  description += `${priceBehavior}, `;
  
  // Clothing type
  description += `looking for ${clothingType.toLowerCase()}`;
  
  return description;
}

// Get price behavior description
function getPriceBehavior(priceRange) {
  const behaviors = {
    'Budget': 'price-conscious shoppers',
    'Mid-Range': 'value-seeking customers',
    'Premium': 'quality-focused buyers',
    'Luxury': 'luxury brand enthusiasts'
  };
  return behaviors[priceRange] || 'shoppers';
}

// Display results
function displayAudienceResults(audienceDesc, formData) {
  // Show audience description
  document.getElementById('audience-output').innerHTML = `
    <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 0.5rem; margin-bottom: 1rem;">
      <h4 style="color: var(--success); margin-bottom: 0.75rem;">Target Audience Description:</h4>
      <p style="font-size: 1.1rem; color: var(--text-primary);">${audienceDesc}</p>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1.5rem;">
      <div>
        <strong style="color: var(--text-muted);">Gender:</strong>
        <p>${formData.gender}</p>
      </div>
      <div>
        <strong style="color: var(--text-muted);">Age Range:</strong>
        <p>${formData.ageGroup}</p>
      </div>
      <div>
        <strong style="color: var(--text-muted);">Location:</strong>
        <p>${formData.location}</p>
      </div>
      <div>
        <strong style="color: var(--text-muted);">Price Range:</strong>
        <p>${formData.priceRange}</p>
      </div>
      <div>
        <strong style="color: var(--text-muted);">Clothing Type:</strong>
        <p>${formData.clothingType}</p>
      </div>
      <div>
        <strong style="color: var(--text-muted);">Behavior:</strong>
        <p>${formData.shoppingBehavior}</p>
      </div>
    </div>
  `;
  
  // Generate insights
  const insights = generateAudienceInsights(formData);
  document.getElementById('audience-insights').innerHTML = insights;
  
  // Show results section
  document.getElementById('audience-result').style.display = 'block';
}

// Generate audience insights
function generateAudienceInsights(data) {
  const { clothingType, priceRange, gender, ageGroup, platform } = data;
  
  let insights = '<ul style="line-height: 2; margin-left: 1.5rem;">';
  
  // Audience size estimate
  const audienceSize = estimateAudienceSize(data);
  insights += `<li><strong>Estimated Audience Size:</strong> ${audienceSize.toLocaleString()} people in Bangladesh</li>`;
  
  // Best platform
  const bestPlatform = getBestPlatform(data);
  insights += `<li><strong>Recommended Platform:</strong> ${bestPlatform}</li>`;
  
  // Best posting time
  const postingTime = getBestTime(ageGroup);
  insights += `<li><strong>Best Ad Display Time:</strong> ${postingTime}</li>`;
  
  // Competition level
  const competition = getCompetitionLevel(clothingType, priceRange);
  insights += `<li><strong>Competition Level:</strong> ${competition}</li>`;
  
  // Conversion expectation
  const conversionRate = getExpectedConversion(priceRange);
  insights += `<li><strong>Expected Conversion Rate:</strong> ${conversionRate}%</li>`;
  
  insights += '</ul>';
  
  return insights;
}

// Estimate audience size
function estimateAudienceSize(data) {
  const { location, gender, ageGroup } = data;
  
  let baseSize = location === 'Dhaka' ? 500000 : 
                 location === 'Chittagong' ? 300000 :
                 location === 'All Bangladesh' ? 2000000 : 150000;
  
  // Adjust for gender (roughly 50% split)
  if (gender !== 'Unisex') {
    baseSize = baseSize * 0.5;
  }
  
  // Adjust for age group (varies by group)
  const ageMultipliers = {
    '13-17': 0.15,
    '18-24': 0.25,
    '25-34': 0.30,
    '35-44': 0.20,
    '45-54': 0.10,
    '55+': 0.10
  };
  baseSize = baseSize * (ageMultipliers[ageGroup] || 0.20);
  
  return Math.round(baseSize);
}

// Get best platform recommendation
function getBestPlatform(data) {
  const { ageGroup, gender } = data;
  
  // Younger audiences prefer Instagram
  if (ageGroup === '13-17' || ageGroup === '18-24') {
    return 'Instagram (Younger audience prefers visual platform)';
  }
  
  // Older audiences use Facebook more
  if (ageGroup === '45-54' || ageGroup === '55+') {
    return 'Facebook (Mature audience, broader reach)';
  }
  
  // Middle age: Both work well
  return 'Facebook or Instagram (Both platforms effective for this age group)';
}

// Get best posting time
function getBestTime(ageGroup) {
  if (ageGroup === '13-17' || ageGroup === '18-24') {
    return '7 PM - 10 PM (Evening when young adults most active)';
  } else if (ageGroup === '25-34' || ageGroup === '35-44') {
    return '8 AM - 10 AM and 6 PM - 9 PM (Morning commute and evening)';
  } else {
    return '10 AM - 2 PM (Midday when mature audience online)';
  }
}

// Get competition level
function getCompetitionLevel(clothingType, priceRange) {
  if (priceRange === 'Budget') {
    return 'High (Budget segment is very competitive)';
  } else if (priceRange === 'Luxury') {
    return 'Low (Fewer luxury competitors)';
  } else {
    return 'Medium (Moderate competition in this segment)';
  }
}

// Get expected conversion
function getExpectedConversion(priceRange) {
  const rates = {
    'Budget': 3.5,
    'Mid-Range': 2.5,
    'Premium': 1.8,
    'Luxury': 1.2
  };
  return rates[priceRange] || 2.0;
}

// Copy audience to clipboard
function copyAudience() {
  navigator.clipboard.writeText(generatedAudience).then(() => {
    showAlert('✅ Audience description copied to clipboard!', 'success');
  }).catch(() => {
    showAlert('❌ Failed to copy to clipboard', 'error');
  });
}

// Use in ad predictor
function useInAdPredictor() {
  // Store in sessionStorage
  sessionStorage.setItem('targetAudience', generatedAudience);
  
  // Redirect to create ad page
  window.location.href = 'create-ad.html';
}