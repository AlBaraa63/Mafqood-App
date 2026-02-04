import { useState, useEffect } from 'react';
import { Loader2, Trash2, Search, Package, Clock, MapPin, Calendar, Sparkles } from 'lucide-react';
import { Item, Match } from '../types';
import { fetchHistory, buildImageUrl, resetDatabase, ItemInDBBase } from '../api/lostFoundApi';
import MatchCard from '../components/MatchCard';
import { useLanguage } from '../context/LanguageContext';

type TabType = 'lost' | 'found';

// Helper function to convert backend item to frontend Item type
const convertToItem = (dbItem: ItemInDBBase, type: 'lost' | 'found'): Item => ({
  id: dbItem.id.toString(),
  type,
  imageUrl: buildImageUrl(dbItem.image_url),
  where: dbItem.location_type || 'Unknown',
  specificPlace: dbItem.location_detail || undefined,
  when: dbItem.time_frame || 'Unknown',
  description: dbItem.description || dbItem.title || 'No description',
  timestamp: new Date(dbItem.created_at),
});

export default function MatchesView() {
  const { t, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('lost');
  const [lostItems, setLostItems] = useState<Item[]>([]);
  const [foundItems, setFoundItems] = useState<Item[]>([]);
  const [matches, setMatches] = useState<Record<string, Match[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadActivity();
  }, []);

  const handleResetDatabase = async () => {
    if (!confirm('⚠️ This will delete ALL items from the database. Continue?')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await resetDatabase();
      // Reload activity after reset
      await loadActivity();
    } catch (error) {
      console.error('Error resetting database:', error);
      setError(error instanceof Error ? error.message : 'Failed to reset database');
      setIsLoading(false);
    }
  };

  const loadActivity = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchHistory();
      
      // Convert backend items with matches to frontend format
      const convertedLostItems = data.lost_items.map(itemWithMatches => 
        convertToItem(itemWithMatches.item, 'lost')
      );
      const convertedFoundItems = data.found_items.map(itemWithMatches => 
        convertToItem(itemWithMatches.item, 'found')
      );
      
      setLostItems(convertedLostItems);
      setFoundItems(convertedFoundItems);
      
      // Build matches map from the backend response
      const matchesMap: Record<string, Match[]> = {};
      
      data.lost_items.forEach(itemWithMatches => {
        const itemId = itemWithMatches.item.id.toString();
        matchesMap[itemId] = itemWithMatches.matches
          .filter(matchResult => matchResult.similarity >= 0.7)  // CLIP threshold: 70%
          .map(matchResult => ({
          id: matchResult.item.id.toString(),
          item: {
            id: matchResult.item.id.toString(),
            type: 'found' as const,
            imageUrl: buildImageUrl(matchResult.item.image_url),
            where: matchResult.item.location_type || 'Unknown',
            specificPlace: matchResult.item.location_detail || undefined,
            when: matchResult.item.time_frame || 'Unknown',
            description: matchResult.item.description || matchResult.item.title || 'No description',
            timestamp: new Date(matchResult.item.created_at),
          },
          similarity: Math.round(matchResult.similarity * 100),
          status: (matchResult.similarity >= 0.75 ? 'high' : 'possible') as 'possible' | 'high' | 'exact',
        }));
      });
      
      data.found_items.forEach(itemWithMatches => {
        const itemId = itemWithMatches.item.id.toString();
        matchesMap[itemId] = itemWithMatches.matches
          .filter(matchResult => matchResult.similarity >= 0.7)  // CLIP threshold: 70%
          .map(matchResult => ({
          id: matchResult.item.id.toString(),
          item: {
            id: matchResult.item.id.toString(),
            type: 'lost' as const,
            imageUrl: buildImageUrl(matchResult.item.image_url),
            where: matchResult.item.location_type || 'Unknown',
            specificPlace: matchResult.item.location_detail || undefined,
            when: matchResult.item.time_frame || 'Unknown',
            description: matchResult.item.description || matchResult.item.title || 'No description',
            timestamp: new Date(matchResult.item.created_at),
          },
          similarity: Math.round(matchResult.similarity * 100),
          status: (matchResult.similarity >= 0.75 ? 'high' : 'possible') as 'possible' | 'high' | 'exact',
        }));
      });
      
      setMatches(matchesMap);
    } catch (error) {
      console.error('Error loading activity:', error);
      setError(error instanceof Error ? error.message : 'Unable to load activity');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#28B3A3] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-700 text-lg mb-3">{error}</p>
          <button
            onClick={loadActivity}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            {t('error_try_again')}
          </button>
        </div>
      </div>
    );
  }

  const items = activeTab === 'lost' ? lostItems : foundItems;

  return (
    <div className="max-w-7xl mx-auto" dir={dir}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0B2D3A] mb-2 flex items-center gap-3">
              <Package className="w-8 h-8 text-[#28B3A3]" />
              {t('matches_page_title')}
            </h1>
            <p className="text-lg text-gray-600">
              {t('matches_dashboard_subtitle')}
            </p>
          </div>
          
          {/* Hidden Reset Button */}
          <button
            onClick={handleResetDatabase}
            className="opacity-20 hover:opacity-100 transition-opacity p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg"
            title="Reset Database"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-100">
        <div className="flex">
          <button
            onClick={() => setActiveTab('lost')}
            className={`flex-1 px-6 py-5 text-center font-bold transition-all duration-300 relative ${
              activeTab === 'lost'
                ? 'bg-gradient-to-r from-[#0B2D3A]/5 to-[#0B2D3A]/10 text-[#0B2D3A]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Search className="w-5 h-5" />
              <span>{t('matches_tab_lost')}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'lost' ? 'bg-[#0B2D3A] text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {lostItems.length}
              </span>
            </div>
            {activeTab === 'lost' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0B2D3A] to-[#28B3A3]"></div>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('found')}
            className={`flex-1 px-6 py-5 text-center font-bold transition-all duration-300 relative ${
              activeTab === 'found'
                ? 'bg-gradient-to-r from-[#28B3A3]/5 to-[#28B3A3]/10 text-[#28B3A3]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Package className="w-5 h-5" />
              <span>{t('matches_tab_found')}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'found' ? 'bg-[#28B3A3] text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {foundItems.length}
              </span>
            </div>
            {activeTab === 'found' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#28B3A3] to-[#36C2B2]"></div>
            )}
          </button>
        </div>
      </div>

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="bg-gradient-to-br from-white via-gray-50/50 to-white rounded-3xl shadow-xl p-16 text-center border-2 border-gray-100">
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-br from-[#28B3A3]/10 to-[#0B2D3A]/10 rounded-2xl w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg">
              {activeTab === 'lost' ? (
                <Search className="w-10 h-10 text-gray-400" />
              ) : (
                <Package className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('matches_empty_title')}</h3>
            <p className="text-gray-600 text-lg mb-6">
              {activeTab === 'lost' ? t('matches_no_items_lost') : t('matches_no_items_found')}
            </p>
            <a
              href={activeTab === 'lost' ? '/report-lost' : '/report-found'}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#0B2D3A] to-[#28B3A3] text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-[#28B3A3]/30 transition-all shadow-lg hover:scale-105 motion-reduce:hover:scale-100"
            >
              {activeTab === 'lost' ? t('matches_report_lost_btn') : t('matches_report_found_btn')}
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item) => {
            const itemMatches = matches[item.id] || [];
            const hasHighMatch = itemMatches.some(m => m.similarity >= 75);

            return (
              <div 
                key={item.id} 
                className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl ${
                  hasHighMatch ? 'border-[#28B3A3] bg-gradient-to-br from-white to-[#28B3A3]/5' : 'border-gray-100 hover:border-[#28B3A3]/30'
                }`}
              >
                <div className="p-6 sm:p-8">
                  {/* Two Column Layout: Item on left, Matches on right */}
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Side: Item Details */}
                    <div className="flex-1 flex flex-col sm:flex-row gap-4">
                      {/* Image */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.description}
                          className="w-full sm:w-40 h-40 object-cover rounded-xl shadow-md"
                        />
                        {hasHighMatch && (
                          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#28B3A3] to-[#36C2B2] text-white px-3 py-1.5 rounded-full text-xs font-black shadow-lg flex items-center gap-1 animate-pulse ring-2 ring-white">
                            <Sparkles className="w-3 h-3" />
                            {t('matches_high_match_badge')}
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-black shadow-md ${
                              item.type === 'lost'
                                ? 'bg-gradient-to-r from-[#0B2D3A] to-[#0d3847] text-white'
                                : 'bg-gradient-to-r from-[#28B3A3] to-[#36C2B2] text-white'
                            }`}
                          >
                            {item.type === 'lost' ? `🔍 ${t('matches_lost_badge')}` : `✅ ${t('matches_found_badge')}`}
                          </span>
                          {itemMatches.length > 0 && (
                            <span className="px-3 py-1.5 rounded-full text-xs font-black bg-[#28B3A3]/10 text-[#28B3A3] border-2 border-[#28B3A3]/30">
                              {itemMatches.length} {itemMatches.length === 1 ? t('matches_match_count') : t('matches_match_count_plural')}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
                          {item.description}
                        </h3>
                        
                        <div className="space-y-1.5 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#28B3A3] flex-shrink-0" />
                            <span className="font-semibold truncate">{item.where}</span>
                            {item.specificPlace && <span className="text-gray-400 truncate">• {item.specificPlace}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#0B2D3A] flex-shrink-0" />
                            <span>{item.when}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#28B3A3] flex-shrink-0" />
                            <span className="text-xs">{t('matches_reported_on')} {item.timestamp.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden lg:block w-px bg-gray-200"></div>
                    <div className="lg:hidden h-px bg-gray-200"></div>

                    {/* Right Side: Matches Section */}
                    <div className="flex-1 min-w-0">
                      {itemMatches.length > 0 ? (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-black text-[#0B2D3A] flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-[#28B3A3]" />
                              {t('matches_ai_discovered')}
                              <span className="text-[#28B3A3]">({itemMatches.length})</span>
                            </h4>
                            {hasHighMatch && (
                              <span className="px-2.5 py-1 bg-[#28B3A3]/10 text-[#28B3A3] rounded-full text-xs font-black border border-[#28B3A3]/30">
                                ⚡ {t('matches_strong_similarity')}
                              </span>
                            )}
                          </div>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {itemMatches.slice(0, 3).map((match) => (
                              <div key={match.id} className="transform transition-all hover:scale-[1.01]">
                                <MatchCard match={match} compact />
                              </div>
                            ))}
                          </div>
                          {itemMatches.length > 3 && (
                            <button className="mt-3 w-full py-2.5 bg-gradient-to-r from-[#28B3A3]/10 to-[#28B3A3]/20 text-[#28B3A3] rounded-lg text-sm font-bold hover:from-[#28B3A3]/20 hover:to-[#28B3A3]/30 transition-all border-2 border-[#28B3A3]/30 hover:border-[#28B3A3]/50 hover:shadow-md">
                              {t('matches_view_all')} {itemMatches.length} →
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 text-center border-2 border-dashed border-gray-200 w-full">
                            <div className="bg-gradient-to-br from-[#28B3A3]/10 to-[#0B2D3A]/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                              <Search className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-gray-600 font-medium text-sm mb-1">{t('matches_no_matches_title')}</p>
                            <p className="text-xs text-gray-500">{t('matches_no_matches_desc')}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
