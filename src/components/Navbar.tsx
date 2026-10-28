import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  Smartphone,
  Monitor,
  Printer,
  Sliders,
  Plus,
  Shield,
  Users,
  ChevronDown,
  BellRing,
} from 'lucide-react';
import { EventData, UserRole } from '../types/event';

interface NavbarProps {
  events: EventData[];
  currentEvent: EventData;
  onSelectEvent: (event: EventData) => void;
  onOpenNewEventModal: () => void;
  isMobileSimulator: boolean;
  onToggleMobileSimulator: () => void;
  onOpenPrintModal: () => void;
  currentUserRole: UserRole;
  onChangeUserRole: (role: UserRole) => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  fontSizeMultiplier: number;
  onChangeFontSize: (multiplier: number) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  events,
  currentEvent,
  onSelectEvent,
  onOpenNewEventModal,
  isMobileSimulator,
  onToggleMobileSimulator,
  onOpenPrintModal,
  currentUserRole,
  onChangeUserRole,
  highContrast,
  onToggleHighContrast,
  fontSizeMultiplier,
  onChangeFontSize,
  activeTab,
  onSelectTab,
}) => {
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const [showA11yMenu, setShowA11yMenu] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'ai-assistant', label: 'AI Planner', icon: Sparkles },
    { id: 'budget', label: 'Budget & Vendors' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'rsvps', label: 'Guests & RSVPs' },
    { id: 'reminders', label: 'Reminders', icon: BellRing },
    { id: 'collab', label: 'Collab & Notes', icon: Users },
  ];

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Event Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg text-slate-900 tracking-tight">GatherWise</span>
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-extrabold text-xs uppercase px-1.5 py-0.5 rounded-full border border-indigo-200">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Smart Event Orchestration</p>
              </div>
            </div>

            {/* Event Picker Dropdown */}
            <div className="relative ml-2 sm:ml-4">
              <button
                type="button"
                onClick={() => setShowEventDropdown(!showEventDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-all max-w-[200px] sm:max-w-xs focus:ring-2 focus:ring-indigo-500"
                aria-expanded={showEventDropdown}
                aria-label="Select Active Event"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-900 truncate">{currentEvent.title}</p>
                  <p className="text-[10px] text-slate-500 truncate">{currentEvent.location.split(',')[0]}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-auto" />
              </button>

              {showEventDropdown && (
                <div
                  className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  role="menu"
                >
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Active Event
                  </div>
                  {events.map((evt) => (
                    <button
                      key={evt.id}
                      type="button"
                      onClick={() => {
                        onSelectEvent(evt);
                        setShowEventDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-start gap-2 hover:bg-indigo-50 transition-colors ${
                        evt.id === currentEvent.id ? 'bg-indigo-50/70 font-semibold text-indigo-700' : 'text-slate-700'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <div className="truncate">
                        <div className="truncate">{evt.title}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {evt.date} • {evt.type.toUpperCase()}
                        </div>
                      </div>
                    </button>
                  ))}
                  <div className="border-t border-slate-100 mt-2 pt-2 px-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEventDropdown(false);
                        onOpenNewEventModal();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Create New Event
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Controls: Collaborators, Role, Viewport, PDF, A11y */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Collaborators Presence */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-full border border-slate-200">
              <div className="flex -space-x-1.5 overflow-hidden">
                {currentEvent.collaborators.map((c) => (
                  <img
                    key={c.id}
                    src={c.avatar}
                    alt={c.name}
                    title={`${c.name} (${c.role}) - ${c.currentSection || 'Online'}`}
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                  />
                ))}
              </div>
              <span className="text-[11px] font-medium text-slate-600 ml-1">
                {currentEvent.collaborators.filter((c) => c.activeNow).length} active
              </span>
            </div>

            {/* Simulated User Role selector for RBAC compliance */}
            <div className="hidden md:flex items-center gap-1 text-xs bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <label htmlFor="role-select" className="text-[10px] text-slate-500 font-semibold uppercase">
                Role:
              </label>
              <select
                id="role-select"
                value={currentUserRole}
                onChange={(e) => onChangeUserRole(e.target.value as UserRole)}
                className="bg-transparent font-semibold text-slate-700 text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            {/* Mobile Simulator Toggle */}
            <button
              type="button"
              onClick={onToggleMobileSimulator}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isMobileSimulator
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title={isMobileSimulator ? 'Switch to Full Desktop View' : 'Experience Native Mobile App View'}
              aria-label={isMobileSimulator ? 'Switch to Full Desktop View' : 'Experience Native Mobile App View'}
            >
              {isMobileSimulator ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4 text-purple-600" />}
              <span className="hidden sm:inline">{isMobileSimulator ? 'Desktop View' : 'Mobile Simulator'}</span>
            </button>

            {/* PDF Report Export Button */}
            <button
              type="button"
              onClick={onOpenPrintModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-colors"
              title="Generate printable PDF event brief and reports"
              aria-label="Export Event PDF Report"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>

            {/* Accessibility Quick Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowA11yMenu(!showA11yMenu)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                title="Accessibility Preferences (Text sizing, Contrast)"
                aria-label="Open Accessibility Settings"
              >
                <Sliders className="w-4 h-4" />
              </button>

              {showA11yMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50">
                  <div className="text-xs font-bold text-slate-900 mb-2">Accessibility Settings</div>
                  
                  {/* Font Size Scaling */}
                  <div className="mb-3">
                    <span className="text-[11px] text-slate-500 font-medium block mb-1">Text Scaling</span>
                    <div className="flex gap-1.5">
                      {[
                        { label: 'Normal', mult: 1.0 },
                        { label: 'Medium (115%)', mult: 1.15 },
                        { label: 'Large (130%)', mult: 1.3 },
                      ].map((s) => (
                        <button
                          key={s.label}
                          type="button"
                          onClick={() => onChangeFontSize(s.mult)}
                          className={`flex-1 py-1 px-1.5 rounded text-[10px] font-semibold border ${
                            fontSizeMultiplier === s.mult
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {s.label.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* High Contrast Mode */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-700">High Contrast</span>
                    <button
                      type="button"
                      onClick={onToggleHighContrast}
                      className={`w-10 h-5 rounded-full transition-colors relative ${
                        highContrast ? 'bg-indigo-600' : 'bg-slate-300'
                      }`}
                      aria-checked={highContrast}
                      role="switch"
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform transform ${
                          highContrast ? 'translate-x-5' : 'translate-x-0.5'
                        } top-0.5 absolute`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation for Desktop */}
        {!isMobileSimulator && (
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto border-t border-slate-100 py-1 scrollbar-none" aria-label="Main Navigation">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />}
                  {tab.label}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
};
