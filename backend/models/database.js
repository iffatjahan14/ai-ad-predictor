const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/db.json');

// Initialize database if missing
const initDB = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    JSON.parse(data);
  } catch (error) {
    console.log('Initializing fresh database...');
    const initialData = {
      users: [],
      adPredictions: [],
      suggestions: []
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
  }
};

// Read database
const readDB = () => {
  initDB();
  const data = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(data);
};

// Write database
const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// ============================================
// USER OPERATIONS
// ============================================

const findUserByEmail = (email) => {
  const db = readDB();
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

const findUserById = (id) => {
  const db = readDB();
  return db.users.find(u => u.id === id);
};

const createUser = (userData) => {
  const db = readDB();
  const newUser = {
    id: db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1,
    ...userData,
    createdAt: new Date().toISOString()
  };
  db.users.push(newUser);
  writeDB(db);
  return newUser;
};

// ============================================
// AD PREDICTION OPERATIONS
// ============================================

const createAdPrediction = (predictionData) => {
  const db = readDB();
  const newPrediction = {
    id: db.adPredictions.length > 0 ? Math.max(...db.adPredictions.map(p => p.id)) + 1 : 1,
    ...predictionData,
    createdAt: new Date().toISOString()
  };
  db.adPredictions.push(newPrediction);
  writeDB(db);
  return newPrediction;
};

const getUserPredictions = (userId, limit = 10, offset = 0) => {
  const db = readDB();
  const userPredictions = db.adPredictions
    .filter(p => p.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  return {
    total: userPredictions.length,
    predictions: userPredictions.slice(offset, offset + limit)
  };
};

const getPredictionById = (id) => {
  const db = readDB();
  return db.adPredictions.find(p => p.id === id);
};

// ============================================
// SUGGESTION OPERATIONS
// ============================================

const createSuggestion = (suggestionData) => {
  const db = readDB();
  const newSuggestion = {
    id: db.suggestions.length > 0 ? Math.max(...db.suggestions.map(s => s.id)) + 1 : 1,
    ...suggestionData,
    createdAt: new Date().toISOString()
  };
  db.suggestions.push(newSuggestion);
  writeDB(db);
  return newSuggestion;
};

const getSuggestionByPredictionId = (predictionId) => {
  const db = readDB();
  return db.suggestions.find(s => s.predictionId === predictionId);
};

module.exports = {
  readDB,
  writeDB,
  findUserByEmail,
  findUserById,
  createUser,
  createAdPrediction,
  getUserPredictions,
  getPredictionById,
  createSuggestion,
  getSuggestionByPredictionId
};