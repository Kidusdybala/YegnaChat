import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Newspaper, Zap, Trophy, Film, RefreshCw, AlertCircle, ChevronDown } from 'lucide-react';
import { newsAPI } from '../lib/newsApi';
import NewsCard from '../components/NewsCard';
import useAuthUser from '../hooks/useAuthUser';

const HomePage = () => {
  const { authUser } = useAuthUser();
  const [activeTab, setActiveTab] = useState('all');
  const [visibleCount, setVisibleCount] = useState(12); // Initially show 12 articles
  const ARTICLES_PER_LOAD = 12; // Load 12 more articles each time

  // Fetch all news categories
  const { 
    data: newsData, 
    isLoading, 
    isError, 
    refetch,
    error 
  } = useQuery({
    queryKey: ['news', 'all'],
    queryFn: newsAPI.getAllNews,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2
  });

  const tabs = [
    { id: 'all', label: 'All News', icon: Newspaper },
    { id: 'technology', label: 'Technology', icon: Zap },
    { id: 'sports', label: 'Sports', icon: Trophy },
    { id: 'entertainment', label: 'Entertainment', icon: Film }
  ];

  // Get articles based on active tab
  const getFilteredArticles = () => {
    if (!newsData) return [];
    
    if (activeTab === 'all') {
      // Mix all categories
      const allArticles = [
        ...newsData.technology.map(article => ({ ...article, category: 'technology' })),
        ...newsData.sports.map(article => ({ ...article, category: 'sports' })),
        ...newsData.entertainment.map(article => ({ ...article, category: 'entertainment' }))
      ];
      
      // Sort by publish date (newest first)
      return allArticles
        .filter(article => article.title && article.title !== '[Removed]' && article.publishedAt)
        .sort((a, b) => {
          const dateA = new Date(a.publishedAt);
          const dateB = new Date(b.publishedAt);
          return dateB - dateA; // Newest first
        })
    }
    
    return newsData[activeTab]
      ?.filter(article => article.title && article.title !== '[Removed]' && article.publishedAt)
      ?.map(article => ({ ...article, category: activeTab }))
      ?.sort((a, b) => {
        const dateA = new Date(a.publishedAt);
        const dateB = new Date(b.publishedAt);
        return dateB - dateA; // Newest first
      }) || [];
  };

  const filteredArticles = getFilteredArticles();

  // Handle tab change - reset visible count
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setVisibleCount(ARTICLES_PER_LOAD);
  };

  // Handle show more
  const handleShowMore = () => {
    setVisibleCount(prev => prev + ARTICLES_PER_LOAD);
  };

  // Get visible articles based on current count
  const visibleArticles = filteredArticles.slice(0, visibleCount);
  const hasMore = filteredArticles.length > visibleCount;

  // Reset visible count when news data changes
  useEffect(() => {
    if (newsData) {
      setVisibleCount(ARTICLES_PER_LOAD);
    }
  }, [newsData, ARTICLES_PER_LOAD]);

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center p-8">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-base-content mb-2">News Unavailable</h2>
          <p className="text-base-content opacity-70 mb-4">
            {error?.message?.includes('API key') 
              ? 'News API key is not configured. Please add your NewsAPI key to continue.'
              : 'Unable to load news at this time. Please try again later.'
            }
          </p>
          <button onClick={() => refetch()} className="btn btn-primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="bg-base-100 border-b border-base-300 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-start sm:items-center justify-between mb-3 sm:mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-base-content truncate">
                Welcome back, {authUser?.fullName?.split(' ')[0] || 'User'}! 👋
              </h1>
              <p className="text-sm sm:text-base text-base-content opacity-70">Stay updated with the latest news</p>
            </div>
            <button 
              onClick={() => refetch()} 
              className="btn btn-ghost btn-circle btn-sm sm:btn-md flex-shrink-0 ml-2"
              disabled={isLoading}
              title="Refresh news"
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`btn btn-xs sm:btn-sm gap-1 sm:gap-2 ${
                    activeTab === tab.id 
                      ? 'btn-primary' 
                      : 'btn-ghost hover:btn-outline'
                  }`}
                >
                  <IconComponent className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* News Feed */}
      <div className="max-w-6xl mx-auto p-3 sm:p-4 lg:p-6 pb-20 lg:pb-6">
        {isLoading ? (
          // Loading state
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-base-100 rounded-lg border border-base-300 p-3 sm:p-4">
                <div className="animate-pulse">
                  <div className="h-40 sm:h-48 bg-base-300 rounded-lg mb-4"></div>
                  <div className="h-4 bg-base-300 rounded mb-2"></div>
                  <div className="h-4 bg-base-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-base-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredArticles.length > 0 ? (
          <div>
            {/* News Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {visibleArticles.map((article, index) => (
                <NewsCard 
                  key={`${article.url}-${index}`} 
                  article={article} 
                  category={article.category}
                />
              ))}
            </div>

            {/* Show More Button */}
            {hasMore && (
              <div className="text-center mt-8">
                <button 
                  onClick={handleShowMore}
                  className="btn btn-primary btn-wide gap-2 hover:scale-105 transition-transform"
                >
                  <ChevronDown className="w-4 h-4" />
                  Show More News ({Math.min(ARTICLES_PER_LOAD, filteredArticles.length - visibleCount)} more)
                </button>
                <p className="text-sm text-base-content opacity-60 mt-2">
                  Showing {visibleArticles.length} of {filteredArticles.length} articles
                </p>
              </div>
            )}

            {/* End of articles indicator */}
            {!hasMore && filteredArticles.length > ARTICLES_PER_LOAD && (
              <div className="text-center mt-8 py-4">
                <div className="divider">
                  <span className="text-base-content opacity-50">You've reached the end</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Empty state
          <div className="text-center py-16">
            <Newspaper className="w-16 h-16 text-base-content opacity-20 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-base-content mb-2">No News Available</h3>
            <p className="text-base-content opacity-60">Try refreshing or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;