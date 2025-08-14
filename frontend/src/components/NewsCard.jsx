import { Clock, ExternalLink } from 'lucide-react';

const NewsCard = ({ article, category }) => {
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const publishedDate = new Date(dateString);
    const diffMs = now - publishedDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'technology': return 'bg-blue-500';
      case 'sports': return 'bg-green-500';
      case 'entertainment': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const handleReadMore = () => {
    if (article.url) {
      window.open(article.url, '_blank');
    }
  };

  if (!article) return null;

  return (
    <div className="bg-base-100 rounded-lg border border-base-300 hover:shadow-lg transition-shadow duration-200 overflow-hidden h-full flex flex-col">
      {/* Article Image */}
      {article.urlToImage && (
        <div className="relative h-40 sm:h-48 overflow-hidden flex-shrink-0">
          <img 
            src={article.urlToImage} 
            alt={article.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.parentElement.style.display = 'none';
            }}
          />
          {/* Category Badge */}
          <div className={`absolute top-2 sm:top-3 left-2 sm:left-3 ${getCategoryColor(category)} text-white px-2 py-1 rounded-full text-xs font-medium capitalize`}>
            {category}
          </div>
        </div>
      )}
      
      {/* Card Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        {/* Source and Time */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {article.source?.name && (
              <span className="text-sm font-medium text-primary truncate">
                {article.source.name}
              </span>
            )}
          </div>
          {article.publishedAt && (
            <div className="flex items-center gap-1 text-xs text-base-content opacity-60 flex-shrink-0">
              <Clock className="w-3 h-3" />
              <span className="whitespace-nowrap">{formatTimeAgo(article.publishedAt)}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-base-content mb-2 line-clamp-2 leading-tight text-sm sm:text-base">
          {article.title}
        </h3>

        {/* Description */}
        {article.description && (
          <p className="text-xs sm:text-sm text-base-content opacity-80 line-clamp-3 mb-3 leading-relaxed flex-grow">
            {article.description}
          </p>
        )}

        {/* Read More Button */}
        {article.url && (
          <button 
            onClick={handleReadMore}
            className="btn btn-outline btn-xs sm:btn-sm w-full gap-1 sm:gap-2 hover:btn-primary mt-auto"
          >
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">Read Full Article</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default NewsCard;