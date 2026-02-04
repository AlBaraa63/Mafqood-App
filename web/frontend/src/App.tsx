import { useState } from 'react';
import Navigation, { View } from './components/Navigation';
import Layout from './components/Layout';
import HomeView from './views/HomeView';
import ReportLostView from './views/ReportLostView';
import ReportFoundView from './views/ReportFoundView';
import MatchesView from './views/MatchesView';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');

  const handleNavigate = (view: View) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <div key="home" className="animate-fadeIn">
            <HomeView onNavigate={handleNavigate} />
          </div>
        );
      case 'report-lost':
        return (
          <div key="report-lost" className="animate-fadeIn">
            <ReportLostView />
          </div>
        );
      case 'report-found':
        return (
          <div key="report-found" className="animate-fadeIn">
            <ReportFoundView />
          </div>
        );
      case 'matches':
        return (
          <div key="matches" className="animate-fadeIn">
            <MatchesView />
          </div>
        );
      default:
        return (
          <div key="home-default" className="animate-fadeIn">
            <HomeView onNavigate={handleNavigate} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentView={currentView} onNavigate={handleNavigate} />
      <Layout>{renderView()}</Layout>
    </div>
  );
}

export default App;
