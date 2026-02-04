import { Search, Upload, Sparkles, Users, Shield, Eye, MapPin, Zap, Clock, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HomeViewProps {
  onNavigate: (view: 'report-lost' | 'report-found') => void;
}

export default function HomeView({ onNavigate }: HomeViewProps) {
  const { t, dir, lang } = useLanguage();

  return (
    <div className="space-y-16 sm:space-y-24" dir={dir}>
      {/* Hero Section - Enhanced with Dubai Identity */}
      <section className="relative overflow-hidden min-h-[70vh] sm:min-h-[85vh] flex items-center">
        {/* Dubai Skyline Silhouette - Subtle Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg className="absolute bottom-0 left-0 right-0 w-full h-48 sm:h-64" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="currentColor" className="text-[#0B2D3A]" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,208C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            {/* Burj Khalifa Peak */}
            <rect x="720" y="40" width="8" height="180" fill="currentColor" className="text-[#0B2D3A]" opacity="0.7"/>
            <polygon points="724,40 720,80 728,80" fill="currentColor" className="text-[#0B2D3A]" opacity="0.7"/>
          </svg>
        </div>

        {/* Geometric Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" 
             style={{backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, #28B3A3 35px, #28B3A3 37px, transparent 37px, transparent 70px, #28B3A3 70px, #28B3A3 72px)`}}>
        </div>

        {/* Optimized Radial Gradients - Better Performance */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
             style={{background: 'radial-gradient(circle, rgba(11,45,58,0.4) 0%, rgba(40,179,163,0.3) 50%, transparent 70%)'}}>
        </div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
             style={{background: 'radial-gradient(circle, rgba(40,179,163,0.4) 0%, rgba(54,194,178,0.3) 50%, transparent 70%)'}}>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none"
             style={{background: 'radial-gradient(circle, rgba(11,45,58,0.3) 0%, transparent 70%)'}}>
        </div>
        
        <div className="relative w-full text-center px-4 py-12 sm:py-16">
          {/* Badge with Animation */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0B2D3A] via-[#28B3A3] to-[#0B2D3A] bg-[length:200%_100%] animate-[gradient_3s_ease_infinite] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-semibold mb-6 sm:mb-10 shadow-lg shadow-[#28B3A3]/30 hover:shadow-xl hover:shadow-[#28B3A3]/40 transition-all duration-300 hover:scale-105"
               role="status" aria-label={lang === 'ar' ? 'مدعوم بالذكاء الاصطناعي' : 'AI-Powered Platform'}>
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" aria-hidden="true" />
            <span className={lang === 'ar' ? 'font-bold text-base' : ''}>{lang === 'ar' ? 'مدعوم بالذكاء الاصطناعي' : 'AI-Powered Platform'}</span>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" aria-hidden="true" />
          </div>
          
          <h1 className={`text-3xl sm:text-6xl lg:text-8xl font-black mb-10 sm:mb-14 leading-[1.15] tracking-tight ${lang === 'ar' ? 'leading-[1.3]' : ''}`}>
            <span className="bg-gradient-to-r from-[#0B2D3A] via-[#28B3A3] to-[#0B2D3A] bg-clip-text text-transparent drop-shadow-sm">
              {t('home_hero_title')}
            </span>
          </h1>
          
          {/* CTA Buttons - Enhanced with Golden Accent */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center items-stretch sm:items-center px-2 max-w-2xl mx-auto">
            <button
              onClick={() => onNavigate('report-lost')}
              className="group relative bg-gradient-to-r from-[#0B2D3A] via-[#0d3847] to-[#0B2D3A] bg-[length:200%_100%] text-white px-5 sm:px-12 py-3.5 sm:py-6 rounded-2xl text-base sm:text-xl font-bold transition-all duration-300 shadow-xl shadow-[#0B2D3A]/30 hover:shadow-2xl hover:shadow-[#0B2D3A]/40 hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2.5 sm:gap-3 min-h-[50px] sm:min-h-[68px] overflow-hidden motion-reduce:hover:scale-100 motion-reduce:transition-none"
              aria-label={t('home_cta_lost')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              <Search className="w-5 h-5 sm:w-7 sm:h-7 group-hover:rotate-12 transition-transform duration-300" aria-hidden="true" />
              <span className={lang === 'ar' ? 'font-black text-lg sm:text-xl' : ''}>{t('home_cta_lost')}</span>
            </button>
            <button
              onClick={() => onNavigate('report-found')}
              className="group relative bg-gradient-to-r from-[#28B3A3] via-[#36C2B2] to-[#28B3A3] bg-[length:200%_100%] text-white px-5 sm:px-12 py-3.5 sm:py-6 rounded-2xl text-base sm:text-xl font-bold transition-all duration-300 shadow-xl shadow-[#28B3A3]/30 hover:shadow-2xl hover:shadow-[#28B3A3]/40 hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2.5 sm:gap-3 min-h-[50px] sm:min-h-[68px] overflow-hidden motion-reduce:hover:scale-100 motion-reduce:transition-none"
              aria-label={t('home_cta_found')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              <Upload className="w-5 h-5 sm:w-7 sm:h-7 group-hover:-rotate-12 transition-transform duration-300" aria-hidden="true" />
              <span className={lang === 'ar' ? 'font-black text-lg sm:text-xl' : ''}>{t('home_cta_found')}</span>
            </button>
          </div>

          {/* Quick Stats - Enhanced */}
          <div className="flex flex-nowrap justify-center gap-2 sm:gap-10 mt-10 sm:mt-16 px-2">
            <div className="flex items-center gap-1 sm:gap-3 bg-white/60 backdrop-blur-sm px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 motion-reduce:hover:scale-100 flex-shrink min-w-0">
              <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-[#0B2D3A] flex-shrink-0" aria-hidden="true" />
              <span className={`text-[#0B2D3A] font-bold text-xs sm:text-lg whitespace-nowrap ${lang === 'ar' ? 'text-sm sm:text-xl' : ''}`}>{lang === 'ar' ? 'مطابقة فورية' : 'Instant Matching'}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-3 bg-white/60 backdrop-blur-sm px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 motion-reduce:hover:scale-100 flex-shrink min-w-0">
              <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-[#28B3A3] flex-shrink-0" aria-hidden="true" />
              <span className={`text-[#0B2D3A] font-bold text-xs sm:text-lg whitespace-nowrap ${lang === 'ar' ? 'text-sm sm:text-xl' : ''}`}>{lang === 'ar' ? 'خصوصية أولاً' : 'Privacy First'}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-3 bg-white/60 backdrop-blur-sm px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 motion-reduce:hover:scale-100 flex-shrink min-w-0">
              <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6 text-[#28B3A3] flex-shrink-0" aria-hidden="true" />
              <span className={`text-[#0B2D3A] font-bold text-xs sm:text-lg whitespace-nowrap ${lang === 'ar' ? 'text-sm sm:text-xl' : ''}`}>{lang === 'ar' ? 'مجاني 100%' : '100% Free'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Enhanced with Geometric Patterns */}
      <section className="relative bg-gradient-to-br from-white via-gray-50/50 to-white rounded-3xl sm:rounded-[2rem] shadow-2xl p-6 sm:p-10 lg:p-16 border border-gray-200/50 mx-2 sm:mx-0 overflow-hidden">
        {/* Geometric Pattern Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
             style={{backgroundImage: `radial-gradient(circle at 20px 20px, #000 2px, transparent 0)`, backgroundSize: '40px 40px'}}>
        </div>
        
        <div className="relative text-center mb-8 sm:mb-14">
          <h2 className={`text-xl sm:text-4xl lg:text-5xl font-black text-gray-950 px-2 leading-tight ${lang === 'ar' ? 'text-2xl leading-normal' : ''}`}>
            {t('home_how_it_works_title')}
          </h2>
        </div>
        
        <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {/* Step 1 */}
          <div className="relative group">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-lg border-2 border-gray-100 hover:border-[#28B3A3] transition-all duration-300 hover:shadow-2xl hover:shadow-[#28B3A3]/20 hover:-translate-y-2 h-full motion-reduce:hover:translate-y-0">
              <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <div className="w-8 h-8 sm:hidden bg-gradient-to-br from-[#0B2D3A] to-[#0d3847] rounded-xl flex items-center justify-center text-white font-black text-sm mb-3 shadow-md">
                  1
                </div>
                <div className="hidden sm:flex sm:absolute sm:-top-5 sm:-left-5 w-12 h-12 bg-gradient-to-br from-[#0B2D3A] via-[#0d3847] to-[#0B2D3A] rounded-2xl items-center justify-center text-white font-black text-lg shadow-xl ring-4 ring-white">
                  1
                </div>
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-[#28B3A3]/20 via-[#28B3A3]/30 to-[#36C2B2]/40 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg motion-reduce:group-hover:scale-100 motion-reduce:group-hover:rotate-0">
                  <Upload className="w-6 h-6 sm:w-9 sm:h-9 text-[#0B2D3A]" aria-hidden="true" />
                </div>
                <h3 className={`text-base sm:text-lg font-black text-gray-950 mb-1.5 sm:mb-3 ${lang === 'ar' ? 'text-lg sm:text-xl' : ''}`}>{t('home_step_1_heading')}</h3>
                <p className={`text-gray-700 text-sm sm:text-base leading-relaxed ${lang === 'ar' ? 'leading-loose font-semibold' : ''}`}>{t('home_step_1_desc')}</p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative group">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-lg border-2 border-gray-100 hover:border-[#0B2D3A] transition-all duration-300 hover:shadow-2xl hover:shadow-[#0B2D3A]/20 hover:-translate-y-2 h-full motion-reduce:hover:translate-y-0">
              <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <div className="w-8 h-8 sm:hidden bg-gradient-to-br from-[#28B3A3] to-[#36C2B2] rounded-xl flex items-center justify-center text-white font-black text-sm mb-3 shadow-md">
                  2
                </div>
                <div className="hidden sm:flex sm:absolute sm:-top-5 sm:-left-5 w-12 h-12 bg-gradient-to-br from-[#28B3A3] via-[#36C2B2] to-[#28B3A3] rounded-2xl items-center justify-center text-white font-black text-lg shadow-xl ring-4 ring-white">
                  2
                </div>
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-[#28B3A3]/20 via-[#28B3A3]/30 to-[#36C2B2]/40 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg motion-reduce:group-hover:scale-100 motion-reduce:group-hover:rotate-0">
                  <MapPin className="w-6 h-6 sm:w-9 sm:h-9 text-[#0B2D3A]" aria-hidden="true" />
                </div>
                <h3 className={`text-base sm:text-lg font-black text-gray-950 mb-1.5 sm:mb-3 ${lang === 'ar' ? 'text-lg sm:text-xl' : ''}`}>{t('home_step_2_heading')}</h3>
                <p className={`text-gray-700 text-sm sm:text-base leading-relaxed ${lang === 'ar' ? 'leading-loose font-semibold' : ''}`}>{t('home_step_2_desc')}</p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative group">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-lg border-2 border-gray-100 hover:border-[#28B3A3] transition-all duration-300 hover:shadow-2xl hover:shadow-[#28B3A3]/20 hover:-translate-y-2 h-full motion-reduce:hover:translate-y-0">
              <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <div className="w-8 h-8 sm:hidden bg-gradient-to-br from-[#0B2D3A] to-[#0d3847] rounded-xl flex items-center justify-center text-white font-black text-sm mb-3 shadow-md">
                  3
                </div>
                <div className="hidden sm:flex sm:absolute sm:-top-5 sm:-left-5 w-12 h-12 bg-gradient-to-br from-[#0B2D3A] via-[#0d3847] to-[#0B2D3A] rounded-2xl items-center justify-center text-white font-black text-lg shadow-xl ring-4 ring-white">
                  3
                </div>
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-[#28B3A3]/20 via-[#28B3A3]/30 to-[#36C2B2]/40 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg motion-reduce:group-hover:scale-100 motion-reduce:group-hover:rotate-0">
                  <Sparkles className="w-6 h-6 sm:w-9 sm:h-9 text-[#0B2D3A]" aria-hidden="true" />
                </div>
                <h3 className={`text-base sm:text-lg font-black text-gray-950 mb-1.5 sm:mb-3 ${lang === 'ar' ? 'text-lg sm:text-xl' : ''}`}>{t('home_step_3_heading')}</h3>
                <p className={`text-gray-700 text-sm sm:text-base leading-relaxed ${lang === 'ar' ? 'leading-loose font-semibold' : ''}`}>{t('home_step_3_desc')}</p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="relative group">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-lg border-2 border-gray-100 hover:border-[#0B2D3A] transition-all duration-300 hover:shadow-2xl hover:shadow-[#0B2D3A]/20 hover:-translate-y-2 h-full motion-reduce:hover:translate-y-0">
              <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <div className="w-8 h-8 sm:hidden bg-gradient-to-br from-[#28B3A3] to-[#36C2B2] rounded-xl flex items-center justify-center text-white font-black text-sm mb-3 shadow-md">
                  4
                </div>
                <div className="hidden sm:flex sm:absolute sm:-top-5 sm:-left-5 w-12 h-12 bg-gradient-to-br from-[#28B3A3] via-[#36C2B2] to-[#28B3A3] rounded-2xl items-center justify-center text-white font-black text-lg shadow-xl ring-4 ring-white">
                  4
                </div>
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-[#28B3A3]/20 via-[#28B3A3]/30 to-[#36C2B2]/40 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg motion-reduce:group-hover:scale-100 motion-reduce:group-hover:rotate-0">
                  <Users className="w-6 h-6 sm:w-9 sm:h-9 text-[#0B2D3A]" aria-hidden="true" />
                </div>
                <h3 className={`text-base sm:text-lg font-black text-gray-950 mb-1.5 sm:mb-3 ${lang === 'ar' ? 'text-lg sm:text-xl' : ''}`}>{t('home_step_4_heading')}</h3>
                <p className={`text-gray-700 text-sm sm:text-base leading-relaxed ${lang === 'ar' ? 'leading-loose font-semibold' : ''}`}>{t('home_step_4_desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Dubai Needs This Section - Enhanced with Golden Accents */}
      <section className="relative px-2 sm:px-0">
        {/* Subtle Geometric Background */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none rounded-3xl"
             style={{backgroundImage: `linear-gradient(30deg, #28B3A3 12%, transparent 12.5%, transparent 87%, #28B3A3 87.5%, #28B3A3), linear-gradient(150deg, #28B3A3 12%, transparent 12.5%, transparent 87%, #28B3A3 87.5%, #28B3A3)`, backgroundSize: '60px 60px'}}>
        </div>
        
        <div className="relative text-center mb-8 sm:mb-14">
          <span className="inline-block bg-gradient-to-r from-[#0B2D3A] via-[#28B3A3] to-[#0B2D3A] text-white px-5 py-2 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6 shadow-md tracking-wide uppercase">
            {lang === 'ar' ? 'لماذا نحن مختلفون' : 'WHY WE ARE DIFFERENT'}
          </span>
          <h2 className={`text-2xl sm:text-4xl lg:text-5xl font-black text-gray-950 px-2 leading-tight ${lang === 'ar' ? 'leading-normal' : ''}`}>
            {t('home_why_title')}
          </h2>
        </div>
        
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
          <div className="group relative bg-white rounded-2xl sm:rounded-[2rem] p-6 sm:p-10 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-[#0B2D3A] overflow-hidden hover:-translate-y-1 motion-reduce:hover:translate-y-0">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#0B2D3A]/10 via-[#0B2D3A]/5 to-transparent rounded-bl-[5rem] opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                 style={{background: 'radial-gradient(circle, rgba(11,45,58,0.6) 0%, transparent 70%)'}}>
            </div>
            
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#0B2D3A] via-[#0d3847] to-[#0B2D3A] rounded-2xl sm:rounded-3xl flex items-center justify-center mb-5 sm:mb-7 shadow-2xl shadow-[#0B2D3A]/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 motion-reduce:group-hover:scale-100 motion-reduce:group-hover:rotate-0">
                <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-white" aria-hidden="true" />
              </div>
              <h3 className={`text-xl sm:text-2xl font-black text-gray-950 mb-3 sm:mb-4 leading-tight ${lang === 'ar' ? 'text-2xl sm:text-3xl leading-normal' : ''}`}>{t('home_why_citywide_title')}</h3>
              <p className={`text-gray-700 text-base sm:text-lg leading-relaxed ${lang === 'ar' ? 'leading-loose font-semibold' : ''}`}>
                {t('home_why_citywide_desc')}
              </p>
            </div>
          </div>

          <div className="group relative bg-white rounded-2xl sm:rounded-[2rem] p-6 sm:p-10 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-[#28B3A3] overflow-hidden hover:-translate-y-1 motion-reduce:hover:translate-y-0">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#28B3A3]/20 via-[#28B3A3]/10 to-transparent rounded-bl-[5rem] opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                 style={{background: 'radial-gradient(circle, rgba(40,179,163,0.6) 0%, transparent 70%)'}}>
            </div>
            
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#28B3A3] via-[#36C2B2] to-[#28B3A3] rounded-2xl sm:rounded-3xl flex items-center justify-center mb-5 sm:mb-7 shadow-2xl shadow-[#28B3A3]/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 motion-reduce:group-hover:scale-100 motion-reduce:group-hover:rotate-0">
                <Eye className="w-8 h-8 sm:w-10 sm:h-10 text-white" aria-hidden="true" />
              </div>
              <h3 className={`text-xl sm:text-2xl font-black text-gray-950 mb-3 sm:mb-4 leading-tight ${lang === 'ar' ? 'text-2xl sm:text-3xl leading-normal' : ''}`}>{t('home_why_ai_title')}</h3>
              <p className={`text-gray-700 text-base sm:text-lg leading-relaxed ${lang === 'ar' ? 'leading-loose font-semibold' : ''}`}>
                {t('home_why_ai_desc')}
              </p>
            </div>
          </div>

          <div className="group relative bg-white rounded-2xl sm:rounded-[2rem] p-6 sm:p-10 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-[#28B3A3] overflow-hidden hover:-translate-y-1 motion-reduce:hover:translate-y-0">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#28B3A3]/10 via-[#28B3A3]/5 to-transparent rounded-bl-[5rem] opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                 style={{background: 'radial-gradient(circle, rgba(40,179,163,0.6) 0%, transparent 70%)'}}>
            </div>
            
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#28B3A3] via-[#36C2B2] to-[#28B3A3] rounded-2xl sm:rounded-3xl flex items-center justify-center mb-5 sm:mb-7 shadow-2xl shadow-[#28B3A3]/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 motion-reduce:group-hover:scale-100 motion-reduce:group-hover:rotate-0">
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" aria-hidden="true" />
              </div>
              <h3 className={`text-xl sm:text-2xl font-black text-gray-950 mb-3 sm:mb-4 leading-tight ${lang === 'ar' ? 'text-2xl sm:text-3xl leading-normal' : ''}`}>{t('home_why_privacy_title')}</h3>
              <p className={`text-gray-700 text-base sm:text-lg leading-relaxed ${lang === 'ar' ? 'leading-loose font-semibold' : ''}`}>
                {t('home_why_privacy_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Enhanced */}
      <footer className="relative text-center py-10 sm:py-12 border-t-2 border-gray-200 mt-8">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
             style={{backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`, backgroundSize: '24px 24px'}}>
        </div>
        <p className={`relative text-gray-600 text-base sm:text-lg font-medium mb-3 ${lang === 'ar' ? 'font-semibold text-lg' : ''}`}>
          {t('home_footer')}
        </p>
        
        {/* Legal & Contact Links */}
        <div className={`relative flex flex-wrap justify-center gap-3 sm:gap-6 mb-4 text-sm sm:text-base ${lang === 'ar' ? 'font-semibold' : ''}`}>
          <a href="/privacy-policy.html" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">
            {lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </a>
          <span className="text-gray-400">•</span>
          <a href="/terms-of-service.html" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">
            {lang === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}
          </a>
          <span className="text-gray-400">•</span>
          <a href="mailto:support@mafqood.albaraaalolabi.dev" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">
            {lang === 'ar' ? 'اتصل بنا' : 'Contact Us'}
          </a>
        </div>
        
        <p className={`relative text-gray-500 text-sm sm:text-base ${lang === 'ar' ? 'font-semibold' : ''}`}>
          {lang === 'ar' ? '© 2025 مفقود. صنع بـ ❤️ في دبي' : '© 2025 Mafqood. Made with ❤️ in Dubai'}
        </p>
        <p className={`relative text-gray-400 text-xs sm:text-sm mt-2 ${lang === 'ar' ? 'font-medium' : ''}`}>
          {lang === 'ar' ? 'برنامج مفتوح المصدر مرخص بموجب MIT' : 'Open source software under MIT License'}
        </p>
      </footer>
    </div>
  );
}
