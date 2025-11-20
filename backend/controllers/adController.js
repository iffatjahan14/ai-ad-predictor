const { GoogleGenerativeAI } = require('@google/generative-ai');
const {
  createAdPrediction,
  getUserPredictions,
  getPredictionById,
  createSuggestion,
  getSuggestionByPredictionId
} = require('../models/database');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Deterministic mock prediction (fallback)
const generateMockPrediction = (adData) => {
  const { title, text, budget, audience, platform } = adData;
  
  const hash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  };
  
  const titleHash = hash(title || '');
  const textHash = hash(text || '');
  const audienceHash = hash(audience || '');
  
  const baseCTR = 0.5 + (titleHash % 30) / 10;
  const platformMultiplier = platform === 'Facebook' ? 1.2 : platform === 'Instagram' ? 1.5 : 1.0;
  
  const ctr = parseFloat((baseCTR * platformMultiplier).toFixed(2));
  const reach = Math.floor(budget * 10 * (1 + textHash % 5));
  const engagement = Math.floor(reach * (ctr / 100) * (1 + audienceHash % 3));
  const confidence = parseFloat((0.6 + (titleHash % 30) / 100).toFixed(2));
  
  const explanation = `Based on your ad configuration (Budget: $${budget}, Platform: ${platform}), we predict a ${ctr}% CTR with approximately ${reach.toLocaleString()} reach and ${engagement.toLocaleString()} engagements.`;
  
  return { ctr, reach, engagement, confidence, explanation };
};

// Mock suggestions generator
const generateMockSuggestions = (adData, prediction) => {
  const { title, text, budget, platform } = adData;
  
  const improvedText = [
    `${title} - Limited Time Offer! ${text.substring(0, 50)}... Don't miss out!`,
    `Exclusive Deal: ${title}. ${text.substring(0, 60)}... Act now!`
  ];
  
  const targeting = prediction.ctr < 2
    ? "Narrow your audience to users aged 25-45 with interests in similar products"
    : "Your targeting is effective. Consider expanding to similar demographics.";
  
  const budgetAdjustment = prediction.reach < budget * 8
    ? `Increase budget by 15% to $${Math.floor(budget * 1.15)} for better reach`
    : `Current budget is optimal. Maintain at $${budget}`;
  
  const platformRecommendation = platform === 'Google Ads'
    ? "Consider testing on Instagram for higher engagement"
    : platform;
  
  const explanation = `Based on your ${prediction.ctr}% CTR, we recommend ${
    prediction.ctr < 2 ? 'improving ad copy and narrowing targeting' : 'scaling your campaign'
  }.`;
  
  return {
    improved_text: improvedText,
    targeting,
    budget_adjustment: budgetAdjustment,
    platform_recommendation: platformRecommendation,
    explanation
  };
};

// @desc    Predict ad performance
// @route   POST /api/ad/predict
// @access  Private
const predictAd = async (req, res, next) => {
  try {
    const { title, text, budget, audience, platform, image } = req.body;
    
    if (!title || !text || !budget || !audience || !platform) {
      return res.status(400).json({ 
        error: 'Please provide title, text, budget, audience, and platform' 
      });
    }
    
    const adData = { title, text, budget, audience, platform, image };
    let prediction;
    let isAIGenerated = false;
    
    // Try Gemini AI first
    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        
        const prompt = `You are an expert digital marketing analyst. Analyze this ad and predict its performance.

Ad Details:
- Title: ${title}
- Text: ${text}
- Budget: $${budget}
- Target Audience: ${audience}
- Platform: ${platform}

Provide ONLY a JSON response with this EXACT format (no other text, no markdown):
{
  "ctr": 2.5,
  "reach": 15000,
  "engagement": 375,
  "confidence": 0.85,
  "explanation": "Your ad shows strong potential with engaging copy and appropriate budget allocation for ${platform}."
}

Predict realistic CTR (%), reach (number), engagement (number), confidence (0-1), and explanation based on industry benchmarks for ${platform} ads.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text().trim();
        
        // Parse JSON from AI response
        try {
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            prediction = JSON.parse(jsonMatch[0]);
            isAIGenerated = true;
          } else {
            throw new Error('No JSON found in response');
          }
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
          prediction = generateMockPrediction(adData);
        }
      } catch (aiError) {
        console.error('Gemini AI Error:', aiError);
        prediction = generateMockPrediction(adData);
      }
    } else {
      prediction = generateMockPrediction(adData);
    }
    
    res.json({
      success: true,
      prediction: {
        ...prediction,
        adData,
        isAIGenerated
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI suggestions
// @route   POST /api/ad/suggestions
// @access  Private
const getSuggestions = async (req, res, next) => {
  try {
    const { adData, prediction } = req.body;
    
    if (!adData || !prediction) {
      return res.status(400).json({ error: 'Please provide ad data and prediction' });
    }
    
    let suggestions;
    let isAIGenerated = false;
    
    // Try Gemini AI first
    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        
        const prompt = `You are an expert marketing consultant. Based on this ad performance prediction, provide optimization suggestions.

Ad Data:
- Title: ${adData.title}
- Text: ${adData.text}
- Budget: $${adData.budget}
- Audience: ${adData.audience}
- Platform: ${adData.platform}

Current Prediction:
- CTR: ${prediction.ctr}%
- Reach: ${prediction.reach}
- Engagement: ${prediction.engagement}

Provide ONLY a JSON response with this EXACT format (no other text, no markdown):
{
  "improved_text": ["Variant 1 with better copy", "Variant 2 with different angle"],
  "targeting": "Specific targeting recommendation",
  "budget_adjustment": "Increase budget to $X for better reach",
  "platform_recommendation": "${adData.platform}",
  "explanation": "Overall strategy explanation"
}

Provide actionable, specific recommendations to improve performance.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text().trim();
        
        // Parse JSON
        try {
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            suggestions = JSON.parse(jsonMatch[0]);
            isAIGenerated = true;
          } else {
            throw new Error('No JSON found');
          }
        } catch (parseError) {
          console.error('Failed to parse AI suggestions:', parseError);
          suggestions = generateMockSuggestions(adData, prediction);
        }
      } catch (aiError) {
        console.error('Gemini AI Error:', aiError);
        suggestions = generateMockSuggestions(adData, prediction);
      }
    } else {
      suggestions = generateMockSuggestions(adData, prediction);
    }
    
    res.json({
      success: true,
      suggestions: {
        ...suggestions,
        isAIGenerated
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save ad prediction
// @route   POST /api/ad/save
// @access  Private
const saveAdPrediction = async (req, res, next) => {
  try {
    const { adData, prediction, suggestions } = req.body;
    
    if (!adData || !prediction) {
      return res.status(400).json({ error: 'Please provide ad data and prediction' });
    }
    
    const savedPrediction = createAdPrediction({
      userId: req.user.id,
      title: adData.title,
      text: adData.text,
      budget: adData.budget,
      audience: adData.audience,
      platform: adData.platform,
      image: adData.image || null,
      ctr: prediction.ctr,
      reach: prediction.reach,
      engagement: prediction.engagement,
      confidence: prediction.confidence,
      explanation: prediction.explanation
    });
    
    // Save suggestions if provided
    if (suggestions) {
      createSuggestion({
        predictionId: savedPrediction.id,
        userId: req.user.id,
        ...suggestions
      });
    }
    
    res.json({
      success: true,
      message: 'Prediction saved successfully',
      prediction: savedPrediction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's history
// @route   GET /api/ad/history
// @access  Private
const getHistory = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    
    const result = getUserPredictions(req.user.id, limit, offset);
    
    // Calculate KPIs
    const allPredictions = getUserPredictions(req.user.id, 1000, 0).predictions;
    const avgCTR = allPredictions.length > 0
      ? (allPredictions.reduce((sum, p) => sum + p.ctr, 0) / allPredictions.length).toFixed(2)
      : 0;
    const avgEngagement = allPredictions.length > 0
      ? Math.floor(allPredictions.reduce((sum, p) => sum + p.engagement, 0) / allPredictions.length)
      : 0;
    
    res.json({
      success: true,
      total: result.total,
      predictions: result.predictions,
      kpis: {
        totalAds: allPredictions.length,
        avgCTR: parseFloat(avgCTR),
        avgEngagement
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single prediction
// @route   GET /api/ad/:id
// @access  Private
const getPrediction = async (req, res, next) => {
  try {
    const prediction = getPredictionById(parseInt(req.params.id));
    
    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' });
    }
    
    if (prediction.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const suggestions = getSuggestionByPredictionId(prediction.id);
    
    res.json({
      success: true,
      prediction,
      suggestions
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  predictAd,
  getSuggestions,
  saveAdPrediction,
  getHistory,
  getPrediction
};