// News API service - now using backend proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const fetchNews = async (category, country = 'us', pageSize = 20) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/news/${category}?country=${country}&pageSize=${pageSize}`,
      {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication if needed
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${category} news:`, error);
    return { articles: [] };
  }
};

const fetchAllNews = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/news/all`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all news:', error);
    return {
      technology: [],
      sports: [],
      entertainment: []
    };
  }
};

export const newsAPI = {
  getTechnologyNews: () => fetchNews('technology', 'us', 20),
  getSportsNews: () => fetchNews('sports', 'us', 20), 
  getEntertainmentNews: () => fetchNews('entertainment', 'us', 20),
  getAllNews: fetchAllNews
};