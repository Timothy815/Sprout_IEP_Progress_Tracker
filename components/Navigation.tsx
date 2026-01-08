import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, Users, FileJson, Settings } from 'lucide-react';

interface NavigationProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onChangeView }) => {
  const navItemClass = (view: ViewState) =>
    `flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all duration-200 ${
      currentView === view
        ? 'bg-tiffany text-white shadow-md transform -translate-y-0.5'
        : 'text-coffee-roast hover:bg-coffee-light/20 hover:text-coffee-bean'
    }`;

  return (
    <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-coffee-light/30 px-6 py-4 flex justify-between items-center no-print shadow-soft">
      <div className="flex items-center gap-3">
        <div className="bg-coffee-bean w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
           {/* Custom Sprout Icon */}
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M12 22V12" stroke="#81D8D0" strokeWidth="2.5" strokeLinecap="round"/>
             <path d="M12 12C12 12 16.5 10 16.5 6C16.5 4 15 2.5 13 2.5C10.5 2.5 12 8 12 8" stroke="#81D8D0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
             <path d="M12 16C12 16 7 14.5 7 10.5C7 8.5 8.5 7 10 7C11.5 7 12 11 12 11" stroke="#81D8D0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
           </svg>
        </div>
        <h1 className="font-friendly text-3xl font-bold text-coffee-bean tracking-tight">Sprout</h1>
      </div>

      <div className="flex gap-2">
        <button onClick={() => onChangeView('DASHBOARD')} className={navItemClass('DASHBOARD')}>
          <Users size={20} /> Students
        </button>
        <button onClick={() => onChangeView('SETTINGS')} className={navItemClass('SETTINGS')}>
          <Settings size={20} /> Settings
        </button>
      </div>
    </nav>
  );
};

export default Navigation;