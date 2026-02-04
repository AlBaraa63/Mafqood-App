import { Match } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface MatchCardProps {
  match: Match;
  onViewDetails?: () => void;
  compact?: boolean;
}

export default function MatchCard({ match, onViewDetails, compact = false }: MatchCardProps) {
  const { t } = useLanguage();
  const { item, similarity, status } = match;

  const statusConfig = {
    possible: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: t('matches_possible_match') },
    high: { bg: 'bg-orange-100', text: 'text-orange-800', label: t('matches_high_match') },
    exact: { bg: 'bg-green-100', text: 'text-green-800', label: t('matches_exact_match') },
  };

  const config = statusConfig[status];

  if (compact) {
    return (
      <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200 hover:border-[#28B3A3] transition-all duration-300 hover:shadow-md">
        <div className="flex gap-3">
          <img
            src={item.imageUrl}
            alt={item.description}
            loading="lazy"
            className="w-14 h-14 object-cover rounded-md flex-shrink-0 bg-gray-200 transition-opacity duration-300"
            onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  item.type === 'lost'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {item.type === 'lost' ? t('matches_lost_item') : t('matches_found_item')}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${config.bg} ${config.text}`}>
                {config.label} • {similarity}%
              </span>
            </div>
            <p className="text-xs text-gray-800 font-medium truncate">
              {item.description}
            </p>
            <p className="text-[10px] text-gray-500 truncate">
              📍 {item.where} • 🕐 {item.when}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-[#28B3A3] transition-all duration-300 hover:shadow-lg">
      <div className="flex gap-4">
        <img
          src={item.imageUrl}
          alt={item.description}
          loading="lazy"
          className="w-24 h-24 object-cover rounded-md flex-shrink-0 bg-gray-200 transition-opacity duration-300"
          onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.type === 'lost'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {item.type === 'lost' ? t('matches_lost_item') : t('matches_found_item')}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
              {config.label} • {similarity}%
            </span>
          </div>
          <p className="text-sm text-gray-800 font-medium mb-1 truncate">
            {item.description}
          </p>
          <p className="text-xs text-gray-600 mb-2">
            📍 {item.where}
            {item.specificPlace && ` • ${item.specificPlace}`}
          </p>
          <p className="text-xs text-gray-500">🕐 {item.when}</p>
        </div>
      </div>
      {onViewDetails && (
        <button
          onClick={onViewDetails}
          className="mt-3 w-full text-sm text-[#28B3A3] hover:text-[#0B2D3A] font-bold py-2.5 border-2 border-[#28B3A3]/30 rounded-lg hover:bg-[#28B3A3]/10 transition-all duration-300 hover:border-[#28B3A3] hover:shadow-md"
        >
          {t('matches_view_details')}
        </button>
      )}
    </div>
  );
}
