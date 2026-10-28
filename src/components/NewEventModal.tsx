import React, { useState } from 'react';
import { Sparkles, Calendar, DollarSign, MapPin, X } from 'lucide-react';
import { EventData, EventType } from '../types/event';

interface NewEventModalProps {
  onClose: () => void;
  onCreateEvent: (event: EventData) => void;
}

export const NewEventModal: React.FC<NewEventModalProps> = ({ onClose, onCreateEvent }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('wedding');
  const [date, setDate] = useState('2026-12-15');
  const [time, setTime] = useState('16:00');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState<number>(15000);
  const [vibe, setVibe] = useState('Chic, warm festoons, artisan dining');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) return;

    const newEvent: EventData = {
      id: `evt-${Date.now()}`,
      title,
      type,
      date,
      time,
      location,
      totalBudget: Number(budget) || 10000,
      currency: 'USD',
      vibe,
      description: description || `${type.toUpperCase()} celebration at ${location}.`,
      collaborators: [
        {
          id: `c-${Date.now()}`,
          name: 'You (Organizer)',
          email: 'organizer@eventpulse.ai',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          activeNow: true,
          currentSection: 'Overview',
        },
      ],
      expenses: [
        {
          id: `exp-init-1`,
          category: 'venue',
          name: 'Primary Venue Booking',
          vendor: `${location.split(',')[0]} Venue`,
          estimatedCost: Math.round(budget * 0.35),
          actualCost: Math.round(budget * 0.35),
          paidAmount: Math.round(budget * 0.15),
          dueDate: date,
          status: 'partial',
          contractSigned: true,
        },
        {
          id: `exp-init-2`,
          category: 'catering',
          name: 'Catering & Beverages',
          vendor: 'Artisan Kitchen Co.',
          estimatedCost: Math.round(budget * 0.3),
          actualCost: Math.round(budget * 0.3),
          paidAmount: 0,
          dueDate: date,
          status: 'pending',
          contractSigned: false,
        },
      ],
      timeline: [
        {
          id: `t-init-1`,
          time: '12:00',
          durationMin: 120,
          phase: 'setup',
          title: 'Load-In & Production Setup',
          description: 'Sound engineering, tables, decor, and floral arrangements.',
          leadPerson: 'Production Lead',
          location,
          isCompleted: false,
        },
        {
          id: `t-init-2`,
          time,
          durationMin: 60,
          phase: type === 'wedding' ? 'ceremony' : 'general',
          title: `${title} - Official Opening`,
          description: 'Welcome announcements, gathering, and opening toasts.',
          leadPerson: 'Host',
          location,
          isCompleted: false,
        },
      ],
      guests: [
        {
          id: `g-init-1`,
          name: 'Honored Guest VIP',
          email: 'vip.guest@example.com',
          rsvpStatus: 'confirmed',
          plusOnes: 1,
          dietary: ['none'],
          tableNumber: 'Table 1',
          reminderSent: true,
        },
      ],
      reminders: [
        {
          id: `rem-init-1`,
          name: 'Save the Date',
          triggerDaysBefore: 30,
          subject: `Save the Date: ${title}`,
          bodyTemplate: `Hi {{guest_name}},\n\nYou're invited to {{event_title}} on {{event_date}} at {{location}}!\n\nRSVP at {{rsvp_link}}`,
          targetAudience: 'all',
          isAutomated: true,
          sentCount: 0,
        },
      ],
      notes: [
        {
          id: `not-init-1`,
          title: 'Initial Planning Goals',
          content: `Initial master plan for ${title}. Target budget $${budget}.`,
          category: 'general',
          updatedBy: 'Organizer',
          updatedAt: 'Just now',
        },
      ],
      aiIdeas: [],
      activityLog: [
        {
          id: `act-init-1`,
          user: 'Organizer',
          action: `Created new ${type} event: ${title}`,
          timestamp: 'Just now',
          tag: 'collab',
        },
      ],
    };

    onCreateEvent(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Create New Event</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Event Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Maya & Daniel: Coastal Barn Wedding"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Event Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday Party</option>
                <option value="community">Community Event</option>
                <option value="corporate">Corporate / Gala</option>
                <option value="festival">Festival</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Total Budget ($)</label>
              <input
                type="number"
                min="500"
                step="500"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Start Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Location & Venue *</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Sunset Cove Resort, San Diego, CA"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Desired Vibe & Theme</label>
            <input
              type="text"
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              placeholder="e.g. Bohemian coastal sunset, live jazz, relaxed luxury"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs"
            >
              Initialize Event Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
