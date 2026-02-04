import { Item } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ItemCardProps {
  item: Item;
  matchCount?: number;
  onViewMatches?: () => void;
}

export default function ItemCard({ item, matchCount = 0, onViewMatches }: ItemCardProps) {
  const { t } = useLanguage();
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img
        src={item.imageUrl}
        alt={item.description}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              item.type === 'lost'
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {item.type === 'lost' ? t('matches_lost_badge') : t('matches_found_badge')}
          </span>
          <span className="text-sm text-gray-500">{item.when}</span>
        </div>
        <p className="text-gray-800 font-medium mb-1">{item.description}</p>
        <p className="text-sm text-gray-600 mb-1">
          📍 {item.where}
          {item.specificPlace && ` • ${item.specificPlace}`}
        </p>
        {matchCount > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {matchCount} {t('item_possible_matches')}
              </span>
              {onViewMatches && (
                <button
                  onClick={onViewMatches}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {t('item_view_matches')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
