import express from "express";
import axios from "axios";

const router = express.Router();

const NEWS_API_KEY = process.env.NEWS_API_KEY || "7241009d45be436d93973a917d5abc8f";
const BASE_URL = 'https://newsapi.org/v2';

// Get all news categories
router.get('/all', async (req, res) => {
  try {
    const categories = ['technology', 'sports', 'entertainment'];
    const promises = categories.map(category =>
      axios.get(`${BASE_URL}/top-headlines?category=${category}&country=us&pageSize=15&apiKey=${NEWS_API_KEY}`)
    );

    const responses = await Promise.all(promises);

    const result = {
      technology: responses[0].data.articles || [],
      sports: responses[1].data.articles || [],
      entertainment: responses[2].data.articles || []
    };

    res.json(result);
  } catch (error) {
    console.error('News API error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch news',
      message: error.response?.data?.message || error.message
    });
  }
});

// Get news by category
router.get('/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { pageSize = 20 } = req.query;

    const response = await axios.get(
      `${BASE_URL}/top-headlines?category=${category}&country=us&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`
    );

    res.json(response.data);
  } catch (error) {
    console.error('News API error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch news',
      message: error.response?.data?.message || error.message
    });
  }
});

export default router;