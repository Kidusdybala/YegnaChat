import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// News API configuration
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_BASE_URL = 'https://newsapi.org/v2';

// Helper function to fetch news from NewsAPI
const fetchNewsFromAPI = async (category, country = 'us', pageSize = 15) => {
  try {
    if (!NEWS_API_KEY) {
      throw new Error('News API key not configured');
    }

    const url = `${NEWS_BASE_URL}/top-headlines?category=${category}&country=${country}&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error(data.message || 'NewsAPI returned error status');
    }
    
    return data.articles || [];
  } catch (error) {
    console.error(`Error fetching ${category} news:`, error.message);
    return [];
  }
};

// Get all news categories
router.get('/all', async (req, res) => {
  try {
    console.log('📰 Fetching all news categories...');
    
    // Fetch all categories in parallel
    const [technology, sports, entertainment] = await Promise.all([
      fetchNewsFromAPI('technology', 'us', 15),
      fetchNewsFromAPI('sports', 'us', 15),
      fetchNewsFromAPI('entertainment', 'us', 15)
    ]);

    const newsData = {
      technology,
      sports,
      entertainment
    };

    console.log(`📰 News fetched - Tech: ${technology.length}, Sports: ${sports.length}, Entertainment: ${entertainment.length}`);
    
    res.json(newsData);
  } catch (error) {
    console.error('Error fetching all news:', error);
    res.status(500).json({ 
      error: 'Failed to fetch news',
      message: error.message 
    });
  }
});

// Get specific category news
router.get('/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { country = 'us', pageSize = 20 } = req.query;
    
    console.log(`📰 Fetching ${category} news...`);
    
    const articles = await fetchNewsFromAPI(category, country, parseInt(pageSize));
    
    console.log(`📰 ${category} news fetched: ${articles.length} articles`);
    
    res.json({ articles });
  } catch (error) {
    console.error(`Error fetching ${req.params.category} news:`, error);
    res.status(500).json({ 
      error: 'Failed to fetch news',
      message: error.message 
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    hasApiKey: !!NEWS_API_KEY,
    timestamp: new Date().toISOString()
  });
});

export default router;