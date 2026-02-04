import { useState } from 'react';
import { Upload, Loader2, CheckCircle, Bell, Search, ArrowRight, X, MapPin, Clock, FileText, Camera, Heart } from 'lucide-react';
import { ItemFormData } from '../types';
import { submitFoundItem, buildImageUrl, MatchResult } from '../api/lostFoundApi';
import MatchCard from '../components/MatchCard';
import { useLanguage } from '../context/LanguageContext';

const whereOptions = [
  { value: 'Mall', key: 'location_mall' },
  { value: 'Taxi', key: 'location_taxi' },
  { value: 'Metro', key: 'location_metro' },
  { value: 'Airport', key: 'location_airport' },
  { value: 'School / University', key: 'location_school' },
  { value: 'Event / Venue', key: 'location_event' },
  { value: 'Street / Public Area', key: 'location_street' },
  { value: 'Other', key: 'location_other' },
];

const whenOptions = [
  { value: 'Today', key: 'time_today' },
  { value: 'Yesterday', key: 'time_yesterday' },
  { value: 'Last 3 days', key: 'time_last_3_days' },
  { value: 'Last week', key: 'time_last_week' },
  { value: 'Earlier', key: 'time_earlier' },
];

export default function ReportFoundView() {
  const { t, dir, lang } = useLanguage();
  const [formData, setFormData] = useState<ItemFormData>({
    image: null,
    imagePreview: undefined,
    where: '',
    specificPlace: '',
    when: '',
    description: '',
  });

  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMatches, setShowMatches] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.image || !formData.where || !formData.when) {
      setError(t('form_validation_error'));
      return;
    }

    setIsSubmitting(true);
    setShowMatches(false);
    setError(null);

    try {
      const payload = {
        file: formData.image!,
        title: formData.description || `Found item at ${formData.where}`,
        description: formData.description || undefined,
        locationType: formData.where,
        locationDetail: formData.specificPlace || undefined,
        timeFrame: formData.when,
      };

      const response = await submitFoundItem(payload);
      setMatches(response.matches);
      setShowMatches(true);
      setShowSuccessModal(true); // Show success modal

      // Reset form after successful submission
      setFormData({
        image: null,
        imagePreview: undefined,
        where: '',
        specificPlace: '',
        when: '',
        description: '',
      });
    } catch (error) {
      console.error('Error submitting found item:', error);
      setError(error instanceof Error ? error.message : t('error_generic'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto" dir={dir}>
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-fadeIn">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#28B3A3] to-[#36C2B2] p-6 rounded-t-2xl relative">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-full p-3">
                  <CheckCircle className="w-8 h-8 text-[#28B3A3]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {t('modal_found_title')}
                  </h3>
                  <p className="text-white/90 text-sm mt-1">
                    {t('modal_found_subtitle')}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-4">
                <p className="text-gray-700">
                  {t('modal_found_scanned')}
                </p>

                <div className="bg-[#28B3A3]/10 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-blue-600">📋</span>
                    {t('modal_found_what_next')}
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#28B3A3] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        1
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{t('modal_found_step1_title')}</p>
                        <p className="text-sm text-gray-600">
                          {t('modal_found_step1_desc')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#0B2D3A] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        2
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{t('modal_found_step2_title')}</p>
                        <p className="text-sm text-gray-600">
                          {t('modal_found_step2_desc')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#28B3A3] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        3
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{t('modal_found_step3_title')}</p>
                        <p className="text-sm text-gray-600">
                          {t('modal_found_step3_desc')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {matches.filter(m => m.similarity >= 0.7).length > 0 && (
                  <div className="bg-[#28B3A3]/10 border-2 border-[#28B3A3] rounded-xl p-4">
                    <p className="text-[#0B2D3A] font-semibold text-center">
                      {t('modal_owners_found_message').replace('{count}', matches.filter(m => m.similarity >= 0.7).length.toString())}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  {t('modal_close')}
                </button>
                <a
                  href="/matches"
                  className="flex-1 px-4 py-3 bg-[#0B2D3A] text-white rounded-lg font-semibold hover:bg-[#0d3847] transition-colors text-center"
                >
                  {t('modal_view_matches')}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative mb-6 sm:mb-8 bg-gradient-to-br from-[#28B3A3] via-[#36C2B2] to-[#0B2D3A] rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 text-white overflow-hidden shadow-xl">
        <div className="hidden sm:block absolute top-0 right-0 w-64 h-64 bg-[#0B2D3A]/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="hidden sm:block absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="bg-white/30 backdrop-blur-sm p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold">{t('found_page_title')}</h1>
              <p className="hidden sm:block text-white/90 text-sm sm:text-base mt-0.5 sm:mt-1">{t('found_page_subtitle')}</p>
            </div>
          </div>
          <div className="flex items-start sm:items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
            <span className="text-base sm:text-lg">🔒</span>
            <span className="leading-tight"><strong>{t('privacy_note')}</strong> {t('privacy_banner')}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-100">
        {/* Progress Steps - Simplified on mobile */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 px-1 sm:px-4">
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#28B3A3] rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-md">1</div>
            <span className="text-xs sm:text-sm font-medium text-gray-700">{lang === 'ar' ? 'الصورة' : 'Photo'}</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-1 sm:mx-2 rounded"><div className="h-full bg-[#28B3A3] rounded transition-all" style={{width: formData.image ? '100%' : '0%'}}></div></div>
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-colors shadow-md ${formData.where ? 'bg-[#28B3A3] text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
            <span className="text-xs sm:text-sm font-medium text-gray-700">{lang === 'ar' ? 'المكان' : 'Location'}</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-1 sm:mx-2 rounded"><div className="h-full bg-[#28B3A3] rounded transition-all" style={{width: formData.where && formData.when ? '100%' : '0%'}}></div></div>
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-colors shadow-md ${formData.where && formData.when ? 'bg-[#28B3A3] text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
            <span className="text-xs sm:text-sm font-medium text-gray-700">{lang === 'ar' ? 'إرسال' : 'Submit'}</span>
          </div>
        </div>

        {/* Image Upload */}
        <div className="mb-6 sm:mb-8">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
            <Camera className="w-4 h-4 text-[#28B3A3]" />
            {t('found_form_item_photo')} <span className="text-red-500">*</span>
          </label>
          <div className={`border-2 border-dashed rounded-xl sm:rounded-2xl p-5 sm:p-8 text-center transition-all ${formData.imagePreview ? 'border-[#28B3A3] bg-[#28B3A3]/10' : 'border-gray-300 hover:border-[#28B3A3] hover:bg-[#28B3A3]/5'}`}>
            {formData.imagePreview ? (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img
                    src={formData.imagePreview}
                    alt={t('image_preview_alt')}
                    className="max-h-64 mx-auto rounded-xl shadow-lg"
                  />
                  <div className="absolute -top-2 -right-2 bg-[#28B3A3] text-white p-1 rounded-full">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, image: null, imagePreview: undefined }))
                  }
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  {t('found_remove_image')}
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <div className="w-16 h-16 bg-[#28B3A3]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-[#28B3A3]" />
                </div>
                <p className="text-gray-800 font-medium mb-1">{t('found_upload_click')}</p>
                <p className="text-sm text-gray-500">{t('found_upload_formats')}</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Where and When - Side by Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {/* Where */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              <MapPin className="w-4 h-4 text-[#0B2D3A]" />
              {t('found_form_where_question')} <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.where}
              onChange={(e) => setFormData((prev) => ({ ...prev, where: e.target.value }))}
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 hover:bg-white transition-colors"
              required
            >
              <option value="">{t('found_form_location_type_placeholder')}</option>
              {whereOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.key)}
                </option>
              ))}
            </select>
          </div>

          {/* When */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              <Clock className="w-4 h-4 text-[#28B3A3]" />
              {t('found_form_when_question')} <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.when}
              onChange={(e) => setFormData((prev) => ({ ...prev, when: e.target.value }))}
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#28B3A3] focus:border-[#28B3A3] bg-gray-50 hover:bg-white transition-colors"
              required
            >
              <option value="">{t('found_form_time_frame_placeholder')}</option>
              {whenOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.key)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Specific Place */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
            <MapPin className="w-4 h-4 text-[#28B3A3]" />
            {t('found_form_specific_place')}
          </label>
          <input
            type="text"
            placeholder={t('found_form_specific_place_placeholder')}
            value={formData.specificPlace}
            onChange={(e) => setFormData((prev) => ({ ...prev, specificPlace: e.target.value }))}
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#28B3A3] focus:border-[#28B3A3] bg-gray-50 hover:bg-white transition-colors"
          />
        </div>

        {/* Description */}
        <div className="mb-8">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
            <FileText className="w-4 h-4 text-[#0B2D3A]" />
            {t('found_form_notes_label')}
          </label>
          <textarea
            placeholder={t('found_form_notes_placeholder')}
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#28B3A3] focus:border-[#28B3A3] bg-gray-50 hover:bg-white transition-colors resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-[#28B3A3] to-[#36C2B2] text-white py-4 rounded-xl font-bold hover:from-[#36C2B2] hover:to-[#28B3A3] transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:shadow-[#28B3A3]/30"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('found_form_submitting')}
            </>
          ) : (
            <>
              <Heart className="w-5 h-5" />
              {t('found_form_submit')}
            </>
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </form>

      {/* Matches Section */}
      {showMatches && (() => {
        const filteredMatches = matches.filter(m => m.similarity >= 0.7);
        return (
        <div className="space-y-6">
          {/* AI Matches Results */}
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Search className="w-6 h-6 text-[#28B3A3]" />
                  {t('found_ai_matches_title')}
                </h2>
                <p className="text-gray-600 mt-1">{t('found_potential_owners_subtitle')}</p>
              </div>
            </div>
            
            {filteredMatches.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-[#28B3A3]/10 border border-[#28B3A3] rounded-lg p-4 mb-4">
                  <p className="text-[#0B2D3A] font-medium">
                    {t('found_owners_count_message').replace('{count}', filteredMatches.length.toString())}
                  </p>
                  <p className="text-gray-700 text-sm mt-1">
                    {t('found_owners_review_hint')}
                  </p>
                </div>
                
                {matches
                  .filter(matchResult => matchResult.similarity >= 0.7)
                  .map((matchResult) => {
                    const match = {
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
                    };
                    
                    return <MatchCard key={match.id} match={match} />;
                  })}
                  
                <div className="mt-6 flex justify-center">
                  <a
                    href="/matches"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#0B2D3A] text-white rounded-lg font-semibold hover:bg-[#0d3847] transition-colors shadow-md hover:shadow-lg"
                  >
                    {t('view_all_reports')}
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('found_no_matches_title')}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  {t('found_no_matches_desc')}
                </p>
                
                <div className="bg-[#28B3A3]/10 border border-[#28B3A3] rounded-lg p-4 max-w-lg mx-auto">
                  <p className="text-[#0B2D3A] font-medium mb-2">{t('found_thank_you_title')}</p>
                  <p className="text-gray-700 text-sm">
                    {t('found_thank_you_desc')}
                  </p>
                </div>
                
                <div className="mt-6">
                  <a
                    href="/matches"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#0B2D3A] text-white rounded-lg font-semibold hover:bg-[#0d3847] transition-colors shadow-md hover:shadow-lg"
                  >
                    {t('go_to_dashboard')}
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
        );
      })()}
    </div>
  );
}
