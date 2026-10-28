import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  DollarSign,
  Clock,
  Users,
  BellRing,
  Wifi,
  Battery,
  ChevronLeft,
} from 'lucide-react';

interface MobileAppSimulatorProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onExitSimulator: () => void;
  children: React.ReactNode;
}

export const MobileAppSimulator: React.FC<MobileAppSimulatorProps> = ({
  activeTab,
  onSelectTab,
  onExitSimulator,
  children,
}) => {
  const bottomNavItems = [
    { id: 'overview', label: 'Home', icon: LayoutDashboard },
    { id: 'ai-assistant', label: 'AI Planner', icon: Sparkles },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'timeline', label: 'Schedule', icon: Clock },
    { id: 'rsvps', label: 'RSVP', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-2 sm:p-6">
      {/* Top Banner Notice */}
      <div className="mb-4 text-center">
        <span className="text-xs font-semibold text-purple-400 bg-purple-950/70 border border-purple-800/80 px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Mobile App Experience (Cross-Platform Responsive Simulator)
        </span>
        <button
          type="button"
          onClick={onExitSimulator}
          className="ml-3 text-xs text-slate-400 hover:text-white underline"
        >
          Exit to Full Desktop
        </button>
      </div>

      {/* Phone Hardware Shell */}
      <div className="w-full max-w-[400px] h-[850px] bg-slate-950 rounded-[48px] p-3 shadow-2xl ring-1 ring-slate-800 border-4 border-slate-700/60 flex flex-col relative overflow-hidden">
        {/* Status Bar */}
        <div className="h-10 px-6 flex items-center justify-between text-white text-[12px] font-bold z-30 select-none">
          <span>9:41</span>
          {/* Dynamic Island */}
          <div className="w-24 h-5 bg-black rounded-full flex items-center justify-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <span className="w-2 h-2 rounded-full bg-indigo-600/40" />
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Inner Screen Viewport */}
        <div className="flex-1 bg-slate-50 rounded-[38px] overflow-y-auto overflow-x-hidden flex flex-col relative pb-16 scrollbar-none">
          <div className="p-4 flex-1">
            {children}
          </div>

          {/* Native Bottom Navigation Bar */}
          <div className="fixed bottom-3 sm:bottom-7 max-w-[376px] w-[calc(100%-24px)] left-auto bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-3 flex items-center justify-around z-40 rounded-b-[38px] shadow-lg">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`flex flex-col items-center gap-1 transition-transform ${
                    isActive ? 'text-indigo-600 scale-105 font-bold' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px]">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Home Indicator Bar */}
        <div className="h-4 flex items-center justify-center">
          <div className="w-32 h-1 bg-slate-500 rounded-full" />
        </div>
      </div>
    </div>
  );
};
