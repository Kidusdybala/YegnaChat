// News API service - now uses backend proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const fetchFromBackend = async (endpoint) => {
  try {
    const response = await fetch(`${API_BASE_URL}/news${endpoint}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching news:`, error);
    return { articles: [] };
  }
};

export const newsAPI = {
  getTechnologyNews: () => fetchFromBackend('/technology'),
  getSportsNews: () => fetchFromBackend('/sports'),
  getEntertainmentNews: () => fetchFromBackend('/entertainment'),
  getAllNews: () => fetchFromBackend('/all')
};