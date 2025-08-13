// News API service
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

const fetchNews = async (category, country = 'us', pageSize = 10) => {
  try {
    const response = await fetch(
      `${BASE_URL}/top-headlines?category=${category}&country=${country}&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`
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

export const newsAPI = {
  getTechnologyNews: () => fetchNews('technology', 'us', 20),
  getSportsNews: () => fetchNews('sports', 'us', 20), 
  getEntertainmentNews: () => fetchNews('entertainment', 'us', 20),
  getAllNews: async () => {
    const [tech, sports, entertainment] = await Promise.all([
      fetchNews('technology', 'us', 15),
      fetchNews('sports', 'us', 15),
      fetchNews('entertainment', 'us', 15)
    ]);
    
    return {
      technology: tech.articles || [],
      sports: sports.articles || [],
      entertainment: entertainment.articles || []
    };
  }
};