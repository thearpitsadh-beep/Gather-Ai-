import React, { useState } from 'react';
import {
  Users,
  Plus,
  Shield,
  MessageSquare,
  Clock,
  Sparkles,
  Lock,
  Edit2,
  Trash2,
  Tag,
} from 'lucide-react';
import { EventData, SharedNote, UserRole } from '../types/event';

interface CollaborationNotesProps {
  event: EventData;
  currentUserRole: UserRole;
  onAddNote: (note: SharedNote) => void;
  onDeleteNote: (noteId: string) => void;
  onUpdateNote: (note: SharedNote) => void;
}

export const CollaborationNotes: React.FC<CollaborationNotesProps> = ({
  event,
  currentUserRole,
  onAddNote,
  onDeleteNote,
  onUpdateNote,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // New note form
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<SharedNote['category']>('general');

  const canEdit = currentUserRole === 'admin' || currentUserRole === 'editor';

  const filteredNotes = event.notes.filter((n) => {
    if (selectedCategory !== 'all' && n.category !== selectedCategory) return false;
    return true;
  });

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const note: SharedNote = {
      id: `not-${Date.now()}`,
      title: newTitle,
      content: newContent,
      category: newCategory,
      updatedBy: currentUserRole === 'admin' ? 'Elena Rostova (Admin)' : 'You (Editor)',
      updatedAt: 'Just now',
    };

    onAddNote(note);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewContent('');
  };

  const startEdit = (note: SharedNote) => {
    setEditingNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const saveEdit = (note: SharedNote) => {
    onUpdateNote({
      ...note,
      title: editTitle,
      content: editContent,
      updatedAt: 'Just now',
    });
    setEditingNoteId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header and RBAC permissions info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Real-Time Collaboration Hub & Shared Notes
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Co-plan in real time with event planners, vendors, and family members with synchronized notes and role access.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                currentUserRole === 'admin'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : currentUserRole === 'editor'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Active Role: <b className="capitalize">{currentUserRole}</b>
            </span>

            {canEdit && (
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Note
              </button>
            )}
          </div>
        </div>

        {/* Collaborators Roster */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Active Planning Team:</span>
          {event.collaborators.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs"
            >
              <img src={c.avatar} alt={c.name} className="w-5 h-5 rounded-full object-cover" />
              <span className="font-semibold text-slate-800">{c.name}</span>
              <span className="text-[10px] text-indigo-600 uppercase font-bold">({c.role})</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online now" />
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['all', 'general', 'vendor_notes', 'contingency', 'ideas'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) => {
          const isNoteEditing = editingNoteId === note.id;

          return (
            <div
              key={note.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              {isNoteEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs font-bold"
                  />
                  <textarea
                    rows={4}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingNoteId(null)}
                      className="px-2 py-1 text-xs text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => saveEdit(note)}
                      className="px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {note.category.replace('_', ' ')}
                    </span>
                    {canEdit && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(note)}
                          className="p-1 text-slate-400 hover:text-indigo-600"
                          title="Edit note"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteNote(note.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{note.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>By {note.updatedBy}</span>
                <span>{note.updatedAt}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Note Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-3">Add Shared Team Note</h3>
            <form onSubmit={handleCreateNote} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. VIP Seating Constraints"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as SharedNote['category'])}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="general">General</option>
                  <option value="vendor_notes">Vendor Coordination</option>
                  <option value="contingency">Contingency & Safety</option>
                  <option value="ideas">Ideas & Decor</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Note Details *</label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Shared thoughts, agreements, or reminders for all planners..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
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
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
