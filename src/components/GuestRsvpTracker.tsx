import React, { useState } from 'react';
import {
  Users,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Trash2,
  Utensils,
  Table,
  Mail,
  Send,
  UserCheck,
} from 'lucide-react';
import { DietaryRequirement, GuestItem, RsvpStatus } from '../types/event';
import { calculateGuestStats } from '../logic/eventCalculations';

interface GuestRsvpTrackerProps {
  guests: GuestItem[];
  onAddGuest: (guest: GuestItem) => void;
  onUpdateGuest: (guest: GuestItem) => void;
  onDeleteGuest: (guestId: string) => void;
  isAddGuestModalOpen?: boolean;
  onCloseAddGuestModal?: () => void;
}

export const GuestRsvpTracker: React.FC<GuestRsvpTrackerProps> = ({
  guests,
  onAddGuest,
  onUpdateGuest,
  onDeleteGuest,
  isAddGuestModalOpen = false,
  onCloseAddGuestModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDietary, setSelectedDietary] = useState<string>('all');
  const [isLocalAddModalOpen, setIsLocalAddModalOpen] = useState(false);

  // New guest form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPlusOnes, setNewPlusOnes] = useState(0);
  const [newStatus, setNewStatus] = useState<RsvpStatus>('confirmed');
  const [newTable, setNewTable] = useState('');
  const [newDietary, setNewDietary] = useState<DietaryRequirement[]>([]);
  const [newDietaryNotes, setNewDietaryNotes] = useState('');

  const stats = calculateGuestStats(guests);

  const filteredGuests = guests.filter((g) => {
    if (selectedStatus !== 'all' && g.rsvpStatus !== selectedStatus) return false;
    if (selectedDietary !== 'all') {
      if (!g.dietary || !g.dietary.includes(selectedDietary as DietaryRequirement)) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        g.name.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        (g.tableNumber && g.tableNumber.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreateGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newGuest: GuestItem = {
      id: `gst-${Date.now()}`,
      name: newName,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      rsvpStatus: newStatus,
      plusOnes: Number(newPlusOnes) || 0,
      dietary: newDietary.length > 0 ? newDietary : ['none'],
      dietaryNotes: newDietaryNotes,
      tableNumber: newTable,
      reminderSent: false,
      checkedIn: false,
    };

    onAddGuest(newGuest);
    if (onCloseAddGuestModal) onCloseAddGuestModal();
    setIsLocalAddModalOpen(false);

    // reset
    setNewName('');
    setNewEmail('');
    setNewPlusOnes(0);
    setNewTable('');
    setNewDietary([]);
    setNewDietaryNotes('');
  };

  const toggleDietaryCheckbox = (diet: DietaryRequirement) => {
    if (newDietary.includes(diet)) {
      setNewDietary(newDietary.filter((d) => d !== diet));
    } else {
      setNewDietary([...newDietary, diet]);
    }
  };

  const showAddModal = isAddGuestModalOpen || isLocalAddModalOpen;

  return (
    <div className="space-y-6">
      {/* Header and RSVP Metrics */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Guest RSVP & Seating Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Live headcount, dietary constraints, table allocations, and RSVP confirmation tracker.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLocalAddModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Guest / Party
            </button>
          </div>
        </div>

        {/* 4 KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Headcount
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-slate-900">{stats.totalHeadcount}</span>
              <span className="text-xs text-slate-500">guests</span>
            </div>
            <span className="text-[10px] text-slate-400">{stats.totalInvitations} primary parties</span>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
              Confirmed Attending
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-emerald-700">{stats.confirmedHeadcount}</span>
              <span className="text-xs text-emerald-600">({stats.confirmedCount} parties)</span>
            </div>
            <span className="text-[10px] text-emerald-600">{stats.responseRatePercent}% response rate</span>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
              Pending Response
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-amber-700">{stats.pendingCount}</span>
              <span className="text-xs text-amber-600">parties</span>
            </div>
            <span className="text-[10px] text-amber-600">Automated reminder queued</span>
          </div>

          <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
            <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider block">
              Declined
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-rose-700">{stats.declinedCount}</span>
              <span className="text-xs text-rose-600">parties</span>
            </div>
            <span className="text-[10px] text-rose-600">Polite regrets received</span>
          </div>
        </div>
      </div>

      {/* Dietary Allergen Matrix Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Utensils className="w-4 h-4 text-emerald-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Dietary & Special Meal Counts for Catering
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats.dietaryCounts)
            .filter(([diet, count]) => diet !== 'none' && count > 0)
            .map(([diet, count]) => (
              <span
                key={diet}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
              >
                <span className="capitalize">{diet.replace('_', ' ')}</span>
                <span className="bg-emerald-200 text-emerald-900 rounded-full w-5 h-5 flex items-center justify-center text-[10px]">
                  {count}
                </span>
              </span>
            ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or table..."
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden w-full"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All RSVP Statuses</option>
              <option value="confirmed">Confirmed Only</option>
              <option value="pending">Pending Only</option>
              <option value="declined">Declined Only</option>
            </select>

            <select
              value={selectedDietary}
              onChange={(e) => setSelectedDietary(e.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Diets</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="gluten_free">Gluten-Free</option>
              <option value="halal">Halal</option>
              <option value="nut_allergy">Nut Allergy</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-500">
          Showing <b>{filteredGuests.length}</b> of {guests.length} guest parties
        </span>
      </div>

      {/* Guest Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-4">Guest Name & Email</th>
                <th className="py-3 px-4">RSVP Status</th>
                <th className="py-3 px-4">Party Size</th>
                <th className="py-3 px-4">Dietary Needs</th>
                <th className="py-3 px-4">Table Seating</th>
                <th className="py-3 px-4">Reminder Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGuests.map((guest) => {
                const totalParty = 1 + guest.plusOnes;

                return (
                  <tr key={guest.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{guest.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{guest.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={guest.rsvpStatus}
                        onChange={(e) =>
                          onUpdateGuest({ ...guest, rsvpStatus: e.target.value as RsvpStatus })
                        }
                        className={`font-semibold text-xs rounded-md px-2 py-1 border cursor-pointer ${
                          guest.rsvpStatus === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : guest.rsvpStatus === 'declined'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="declined">Declined</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-900">{totalParty}</span>
                        <span className="text-[10px] text-slate-500">
                          ({guest.plusOnes > 0 ? `+${guest.plusOnes} guest` : 'solo'})
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {guest.dietary && guest.dietary.length > 0 && !guest.dietary.includes('none') ? (
                          guest.dietary.map((d) => (
                            <span
                              key={d}
                              className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded capitalize"
                            >
                              {d.replace('_', ' ')}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-[11px]">Standard meal</span>
                        )}
                        {guest.dietaryNotes && (
                          <span className="block w-full text-[10px] text-slate-500 truncate" title={guest.dietaryNotes}>
                            Note: {guest.dietaryNotes}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {guest.tableNumber ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold text-[11px]">
                          <Table className="w-3 h-3 text-indigo-500" />
                          {guest.tableNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {guest.reminderSent ? (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Sent
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-slate-100 font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Queued
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onDeleteGuest(guest.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove guest"
                        aria-label={`Remove ${guest.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Guest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-3">Add Guest / Party</h3>

            <form onSubmit={handleCreateGuest} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Guest Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Jessica Sterling"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="jessica@example.com"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">RSVP Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as RsvpStatus)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Plus-Ones</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={newPlusOnes}
                    onChange={(e) => setNewPlusOnes(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Table Seating</label>
                <input
                  type="text"
                  value={newTable}
                  onChange={(e) => setNewTable(e.target.value)}
                  placeholder="e.g. Table 4 - Rose Gold"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Dietary Restrictions
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'vegetarian', label: 'Vegetarian' },
                    { id: 'vegan', label: 'Vegan' },
                    { id: 'gluten_free', label: 'Gluten-Free' },
                    { id: 'halal', label: 'Halal' },
                    { id: 'kosher', label: 'Kosher' },
                    { id: 'nut_allergy', label: 'Nut Allergy' },
                  ].map((diet) => (
                    <label
                      key={diet.id}
                      className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newDietary.includes(diet.id as DietaryRequirement)}
                        onChange={() => toggleDietaryCheckbox(diet.id as DietaryRequirement)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-slate-700">{diet.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Dietary / Accessibility Notes</label>
                <input
                  type="text"
                  value={newDietaryNotes}
                  onChange={(e) => setNewDietaryNotes(e.target.value)}
                  placeholder="e.g. Highchair required, severe peanut anaphylaxis"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsLocalAddModalOpen(false);
                    if (onCloseAddGuestModal) onCloseAddGuestModal();
                  }}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  Save Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
