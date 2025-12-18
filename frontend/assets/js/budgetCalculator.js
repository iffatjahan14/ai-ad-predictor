// Require authentication
requireAuth();

// Handle form submission
document.getElementById('budget-form')?.addEventListener('submit', function(e) {
  e.preventDefault();
  
  // Collect form data
  const campaignGoal = document.getElementById('campaign-goal').value;
  const duration = parseInt(document.getElementById('duration').value);
  const audienceSize = document.getElementById('audience-size').value;
  const platform = document.getElementById('platform').value;
  const competition = document.getElementById('competition').value;
  const productPrice = parseFloat(document.getElementById('product-price').value);
  
  // Calculate budget
  const budgetData = calculateOptimalBudget({
    campaignGoal,
    duration,
    audienceSize,
    platform,
    competition,
    productPrice
  });
  
  // Display results
  displayBudgetResults(budgetData);
  
  // Show success message
  showAlert('✅ Budget calculated successfully!', 'success');
  
  // Scroll to results
  document.getElementById('budget-result').scrollIntoView({ behavior: 'smooth' });
});

// Calculate optimal budget
function calculateOptimalBudget(data) {
  const { campaignGoal, duration, audienceSize, platform, competition, productPrice } = data;
  
  // Base daily budget by audience size
  let dailyBudget = 0;
  switch(audienceSize) {
    case 'Small':
      dailyBudget = 200;
      break;
    case 'Medium':
      dailyBudget = 500;
      break;
    case 'Large':
      dailyBudget = 1500;
      break;
    case 'Very Large':
      dailyBudget = 3000;
      break;
  }
  
  // Adjust for platform
  const platformMultiplier = {
    'Facebook': 1.0,
    'Instagram': 1.2,
    'Google': 1.5
  };
  dailyBudget = dailyBudget * (platformMultiplier[platform] || 1.0);
  
  // Adjust for competition
  const competitionMultiplier = {
    'Low': 0.8,
    'Medium': 1.0,
    'High': 1.3
  };
  dailyBudget = dailyBudget * (competitionMultiplier[competition] || 1.0);
  
  // Adjust for campaign goal
  const goalMultiplier = {
    'Brand Awareness': 0.9,
    'Website Traffic': 1.0,
    'Product Sales': 1.2,
    'Lead Generation': 1.1,
    'Store Visits': 1.0
  };
  dailyBudget = dailyBudget * (goalMultiplier[campaignGoal] || 1.0);
  
  // Total budget
  const totalBudget = Math.round(dailyBudget * duration);
  
  // Estimate reach
  const reach = estimateReach(totalBudget, platform, audienceSize);
  
  // Estimate sales
  const expectedSales = estimateSales(reach, productPrice, campaignGoal);
  
  // Calculate ROI
  const revenue = expectedSales * productPrice;
  const roi = ((revenue - totalBudget) / totalBudget * 100).toFixed(1);
  
  return {
    totalBudget,
    dailyBudget: Math.round(dailyBudget),
    duration,
    reach,
    expectedSales,
    roi,
    revenue,
    platform,
    campaignGoal,
    productPrice
  };
}

// Estimate reach
function estimateReach(budget, platform, audienceSize) {
  // Base CPM (cost per 1000 impressions) in Bangladesh
  const cpm = {
    'Facebook': 50,
    'Instagram': 70,
    'Google': 100
  };
  
  const platformCPM = cpm[platform] || 60;
  const impressions = (budget / platformCPM) * 1000;
  
  // Reach is typically 70-80% of impressions (unique users)
  return Math.round(impressions * 0.75);
}

// Estimate sales
function estimateSales(reach, productPrice, goal) {
  // Conversion rates vary by goal
  const conversionRates = {
    'Brand Awareness': 0.005,
    'Website Traffic': 0.01,
    'Product Sales': 0.02,
    'Lead Generation': 0.03,
    'Store Visits': 0.015
  };
  
  const conversionRate = conversionRates[goal] || 0.01;
  
  // Price affects conversion (higher price = lower conversion)
  let priceAdjustment = 1.0;
  if (productPrice > 5000) {
    priceAdjustment = 0.6;
  } else if (productPrice > 2000) {
    priceAdjustment = 0.8;
  }
  
  return Math.round(reach * conversionRate * priceAdjustment);
}

// Display budget results
function displayBudgetResults(budget) {
  // Display metrics
  document.getElementById('recommended-budget').textContent = budget.totalBudget.toLocaleString();
  document.getElementById('estimated-reach').textContent = budget.reach.toLocaleString();
  document.getElementById('expected-sales').textContent = budget.expectedSales;
  document.getElementById('projected-roi').textContent = budget.roi;
  
  // Budget breakdown
  const breakdownHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
      <div>
        <strong>Daily Budget:</strong>
        <p style="font-size: 1.5rem; color: var(--primary-light); margin-top: 0.5rem;">৳${budget.dailyBudget.toLocaleString()}</p>
      </div>
      <div>
        <strong>Campaign Duration:</strong>
        <p style="font-size: 1.5rem; color: var(--primary-light); margin-top: 0.5rem;">${budget.duration} days</p>
      </div>
      <div>
        <strong>Total Budget:</strong>
        <p style="font-size: 1.5rem; color: var(--success); margin-top: 0.5rem;">৳${budget.totalBudget.toLocaleString()}</p>
      </div>
      <div>
        <strong>Expected Revenue:</strong>
        <p style="font-size: 1.5rem; color: var(--success); margin-top: 0.5rem;">৳${budget.revenue.toLocaleString()}</p>
      </div>
    </div>
    
    <div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg-secondary); border-radius: 0.5rem;">
      <p><strong>Platform:</strong> ${budget.platform}</p>
      <p><strong>Goal:</strong> ${budget.campaignGoal}</p>
      <p><strong>Product Price:</strong> ৳${budget.productPrice.toLocaleString()}</p>
    </div>
  `;
  
  document.getElementById('budget-breakdown').innerHTML = breakdownHTML;
  
  // Budget tips
  const tips = generateBudgetTips(budget);
  document.getElementById('budget-tips').innerHTML = tips;
  
  // Show results
  document.getElementById('budget-result').style.display = 'block';
}

// Generate budget tips
function generateBudgetTips(budget) {
  let tips = '<ul style="line-height: 2; margin-left: 1.5rem;">';
  
  // ROI tip
  if (budget.roi > 100) {
    tips += `<li>✅ Excellent ROI projected! Expected ${budget.roi}% return on investment.</li>`;
  } else if (budget.roi > 50) {
    tips += `<li>✅ Good ROI projected. Expected ${budget.roi}% return.</li>`;
  } else if (budget.roi > 0) {
    tips += `<li>⚠️ Moderate ROI. Consider optimizing targeting or increasing conversion rate.</li>`;
  } else {
    tips += `<li>⚠️ Negative ROI projected. Consider reducing budget or improving ad quality.</li>`;
  }
  
  // Budget distribution
  tips += `<li>💡 Allocate 70% (৳${Math.round(budget.totalBudget * 0.7).toLocaleString()}) to best-performing ads, 30% to testing.</li>`;
  
  // Start strategy
  if (budget.duration > 7) {
    tips += `<li>📅 Start with ৳${budget.dailyBudget.toLocaleString()}/day. Increase if performing well after 3 days.</li>`;
  } else {
    tips += `<li>⚡ Short campaign - Use full daily budget from day 1 for maximum impact.</li>`;
  }
  
  // Platform tip
  if (budget.platform === 'Instagram') {
    tips += `<li>📸 Instagram: Focus on high-quality images. Use Stories and Reels for better engagement.</li>`;
  } else if (budget.platform === 'Facebook') {
    tips += `<li>📘 Facebook: Use carousel ads to show multiple products. Test video ads for higher engagement.</li>`;
  } else {
    tips += `<li>🔍 Google: Use search ads for high-intent buyers. Focus on keywords related to clothing.</li>`;
  }
  
  // Audience tip
  tips += `<li>🎯 Monitor first 24 hours closely. Pause if cost-per-result exceeds ৳${Math.round(budget.totalBudget / budget.expectedSales).toLocaleString()}.</li>`;
  
  // Optimization
  tips += `<li>📊 Test 2-3 ad variations to find best performer. Shift budget to winner after 2 days.</li>`;
  
  tips += '</ul>';
  
  return tips;
}

// Reset calculator
function resetCalculator() {
  document.getElementById('budget-form').reset();
  document.getElementById('budget-result').style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}