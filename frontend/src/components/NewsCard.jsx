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
    <div className="bg-base-100 rounded-lg border border-base-300 hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Article Image */}
      {article.urlToImage && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={article.urlToImage} 
            alt={article.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.parentElement.style.display = 'none';
            }}
          />
          {/* Category Badge */}
          <div className={`absolute top-3 left-3 ${getCategoryColor(category)} text-white px-2 py-1 rounded-full text-xs font-medium capitalize`}>
            {category}
          </div>
        </div>
      )}
      
      {/* Card Content */}
      <div className="p-4">
        {/* Source and Time */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {article.source?.name && (
              <span className="text-sm font-medium text-primary">
                {article.source.name}
              </span>
            )}
          </div>
          {article.publishedAt && (
            <div className="flex items-center gap-1 text-xs text-base-content opacity-60">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(article.publishedAt)}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-base-content mb-2 line-clamp-2 leading-tight">
          {article.title}
        </h3>

        {/* Description */}
        {article.description && (
          <p className="text-sm text-base-content opacity-80 line-clamp-3 mb-3 leading-relaxed">
            {article.description}
          </p>
        )}

        {/* Read More Button */}
        {article.url && (
          <button 
            onClick={handleReadMore}
            className="btn btn-outline btn-sm w-full gap-2 hover:btn-primary"
          >
            <ExternalLink className="w-4 h-4" />
            Read Full Article
          </button>
        )}
      </div>
    </div>
  );
};

export default NewsCard;