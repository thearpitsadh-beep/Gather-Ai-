import React, { useState } from 'react';
import {
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  MapPin,
  User,
  Filter,
  Trash2,
  Calendar,
} from 'lucide-react';
import { TimelineItem, TimelinePhase } from '../types/event';
import { sortTimelineChronologically, calculateTimelineProgress } from '../logic/eventCalculations';

interface TimelineRunsheetProps {
  timeline: TimelineItem[];
  onAddTimelineItem: (item: TimelineItem) => void;
  onToggleComplete: (id: string) => void;
  onDeleteTimelineItem: (id: string) => void;
}

export const TimelineRunsheet: React.FC<TimelineRunsheetProps> = ({
  timeline,
  onAddTimelineItem,
  onToggleComplete,
  onDeleteTimelineItem,
}) => {
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [newTime, setNewTime] = useState('16:00');
  const [newDuration, setNewDuration] = useState(45);
  const [newPhase, setNewPhase] = useState<TimelinePhase>('ceremony');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLeadPerson, setNewLeadPerson] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const sortedItems = sortTimelineChronologically(timeline);
  const progress = calculateTimelineProgress(timeline);

  const filteredItems = sortedItems.filter((item) => {
    if (selectedPhase !== 'all' && item.phase !== selectedPhase) return false;
    return true;
  });

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTime.trim()) return;

    const item: TimelineItem = {
      id: `t-${Date.now()}`,
      time: newTime,
      durationMin: Number(newDuration) || 30,
      phase: newPhase,
      title: newTitle,
      description: newDescription,
      leadPerson: newLeadPerson || 'Event Lead',
      location: newLocation || 'Main Hall',
      isCompleted: false,
    };

    onAddTimelineItem(item);
    setIsAddModalOpen(false);

    // reset
    setNewTitle('');
    setNewDescription('');
    setNewLeadPerson('');
    setNewLocation('');
  };

  const phaseBadgeColors: Record<TimelinePhase, { bg: string; text: string }> = {
    setup: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800' },
    ceremony: { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-800' },
    reception: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-800' },
    entertainment: { bg: 'bg-pink-50 border-pink-200', text: 'text-pink-800' },
    teardown: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700' },
    general: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800' },
  };

  return (
    <div className="space-y-6">
      {/* Header and Progress Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Event Timeline & Master Runsheet
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Synchronize schedule cues, stage transitions, lead coordinators, and live day-of execution.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Milestone
          </button>
        </div>

        {/* Progress Bar */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700">
              Runsheet Execution: {progress.completed} of {progress.total} milestones checked off
            </span>
            <span className="font-bold text-purple-600">{progress.percentage}% Complete</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1 mr-1" />
          {[
            { id: 'all', label: 'All Phases' },
            { id: 'setup', label: 'Setup & Load-in' },
            { id: 'ceremony', label: 'Ceremony' },
            { id: 'reception', label: 'Reception & Dining' },
            { id: 'entertainment', label: 'Entertainment' },
            { id: 'teardown', label: 'Teardown' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedPhase(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedPhase === tab.id
                  ? 'bg-purple-50 text-purple-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 hidden sm:inline">
          {filteredItems.length} items
        </span>
      </div>

      {/* Timeline Items List */}
      <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {filteredItems.map((item) => {
          const badge = phaseBadgeColors[item.phase] || phaseBadgeColors.general;

          return (
            <div
              key={item.id}
              className={`relative bg-white rounded-xl border transition-all p-4 sm:p-5 shadow-xs ${
                item.isCompleted
                  ? 'border-slate-200 bg-slate-50/70 opacity-70'
                  : 'border-slate-200 hover:border-purple-300'
              }`}
            >
              {/* Timeline dot marker */}
              <button
                type="button"
                onClick={() => onToggleComplete(item.id)}
                className={`absolute -left-6 sm:-left-8 top-5 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center transition-transform transform hover:scale-110 ${
                  item.isCompleted ? 'border-emerald-500 text-emerald-500' : 'border-slate-400 text-transparent'
                }`}
                title={item.isCompleted ? 'Mark as pending' : 'Mark as completed'}
              >
                {item.isCompleted ? <CheckCircle2 className="w-4 h-4 fill-emerald-500 text-white" /> : <Circle className="w-3 h-3" />}
              </button>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-xs sm:text-sm font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md">
                      {item.time} ({item.durationMin}m)
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text}`}
                    >
                      {item.phase}
                    </span>
                    {item.isCompleted && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Completed
                      </span>
                    )}
                  </div>

                  <h3 className={`text-sm sm:text-base font-bold text-slate-900 ${item.isCompleted ? 'line-through text-slate-500' : ''}`}>
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.description}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-start">
                  <button
                    type="button"
                    onClick={() => onDeleteTimelineItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    title="Delete milestone"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Footer Meta */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  Lead: <b className="text-slate-700">{item.leadPerson}</b>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-pink-500" />
                  Location: <b className="text-slate-700">{item.location}</b>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Milestone Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-3">Add Timeline Milestone</h3>
            <form onSubmit={handleCreateItem} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Milestone Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Grand Entrance & Toasts"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Start Time (24h) *</label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Phase</label>
                  <select
                    value={newPhase}
                    onChange={(e) => setNewPhase(e.target.value as TimelinePhase)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="setup">Setup</option>
                    <option value="ceremony">Ceremony</option>
                    <option value="reception">Reception</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="teardown">Teardown</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Lawn Pavilion"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Lead Responsible Person</label>
                <input
                  type="text"
                  value={newLeadPerson}
                  onChange={(e) => setNewLeadPerson(e.target.value)}
                  placeholder="e.g. DJ Sparks / Chloe (Coordinator)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Description & Cues</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Specific cues, lighting switches, song titles..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
