const express = require('express');
const {
  predictAd,
  getSuggestions,
  saveAdPrediction,
  getHistory,
  getPrediction
} = require('../controllers/adController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected (require authentication)
router.post('/predict', protect, predictAd);
router.post('/suggestions', protect, getSuggestions);
router.post('/save', protect, saveAdPrediction);
router.get('/history', protect, getHistory);
router.get('/:id', protect, getPrediction);

module.exports = router;

