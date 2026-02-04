import { Search, Home, Upload, History, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export type View = 'home' | 'report-lost' | 'report-found' | 'matches';

interface NavigationProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export default function Navigation({ currentView, onNavigate }: NavigationProps) {
  const { lang, setLang, t } = useLanguage();

  const navItems = [
    { id: 'home' as View, label: t('nav_home'), icon: Home },
    { id: 'report-lost' as View, label: t('nav_report_lost'), icon: Search },
    { id: 'report-found' as View, label: t('nav_report_found'), icon: Upload },
    { id: 'matches' as View, label: t('nav_matches'), icon: History },
  ];

  return (
    <nav className="bg-white backdrop-blur-sm border-b-2 border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Brand */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src="/logo.png" alt="Mafqood" className="h-8 sm:h-10 md:h-12 w-auto" />
          </button>

          {/* Centered Navigation Links */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 group overflow-hidden ${isActive
                      ? 'bg-gradient-to-r from-[#0B2D3A] to-[#28B3A3] text-white shadow-lg shadow-[#28B3A3]/30'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-[#0B2D3A] hover:shadow-md'
                    }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                  )}
                  <Icon className={`w-4 h-4 ${isActive ? 'group-hover:rotate-12' : ''} transition-transform`} />
                  <span className="hidden lg:inline relative">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Side: Mobile Nav + Language Toggle */}
          <div className="flex items-center gap-2">
            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`relative flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 group overflow-hidden ${isActive
                        ? 'bg-gradient-to-r from-[#0B2D3A] to-[#28B3A3] text-white shadow-lg shadow-[#28B3A3]/30'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-[#0B2D3A] hover:shadow-md'
                      }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                    )}
                    <Icon className={`w-4 h-4 ${isActive ? 'group-hover:rotate-12' : ''} transition-transform`} />
                  </button>
                );
              })}
            </div>

            {/* Language Toggle */}
            <div className="flex items-center gap-1 ml-2 sm:ml-4 pl-2 sm:pl-4 border-l-2 border-gray-200 rtl:border-l-0 rtl:border-r-2 rtl:ml-0 rtl:mr-2 sm:rtl:mr-4 rtl:pl-0 rtl:pr-2 sm:rtl:pr-4">
              <div className="bg-gray-100 rounded-lg p-1.5 hidden sm:flex items-center justify-center">
                <Globe className="w-4 h-4 text-[#28B3A3]" />
              </div>
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${lang === 'en'
                      ? 'bg-gradient-to-r from-[#0B2D3A] to-[#28B3A3] text-white shadow-md'
                      : 'text-gray-600 hover:text-[#0B2D3A]'
                    }`}
                  onClick={() => setLang('en')}
                >
                  EN
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${lang === 'ar'
                      ? 'bg-gradient-to-r from-[#0B2D3A] to-[#28B3A3] text-white shadow-md'
                      : 'text-gray-600 hover:text-[#0B2D3A]'
                    }`}
                  onClick={() => setLang('ar')}
                >
                  ع
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
