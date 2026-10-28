import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { AiAssistantHub } from './components/AiAssistantHub';
import { BudgetVendorTracker } from './components/BudgetVendorTracker';
import { TimelineRunsheet } from './components/TimelineRunsheet';
import { GuestRsvpTracker } from './components/GuestRsvpTracker';
import { AutomatedReminders } from './components/AutomatedReminders';
import { CollaborationNotes } from './components/CollaborationNotes';
import { PrintablePdfReport } from './components/PrintablePdfReport';
import { NewEventModal } from './components/NewEventModal';
import { MobileAppSimulator } from './components/MobileAppSimulator';
import { INITIAL_EVENTS } from './data/mockEvents';
import {
  loadStoredEvents,
  saveStoredEvents,
  loadActiveEventId,
  saveActiveEventId,
  loadActiveTab,
  saveActiveTab,
} from './logic/storage';
import {
  AiIdea,
  EmailReminder,
  EventData,
  ExpenseItem,
  GuestItem,
  SharedNote,
  TimelineItem,
  UserRole,
} from './types/event';

export default function App() {
  const [events, setEvents] = useState<EventData[]>(() => loadStoredEvents(INITIAL_EVENTS));
  const [currentEventId, setCurrentEventId] = useState<string>(() =>
    loadActiveEventId(INITIAL_EVENTS[0].id)
  );
  const [activeTab, setActiveTab] = useState<string>(() => loadActiveTab('overview'));
  const [isMobileSimulator, setIsMobileSimulator] = useState<boolean>(false);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('admin');

  // Persistence effects
  useEffect(() => {
    saveStoredEvents(events);
  }, [events]);

  useEffect(() => {
    saveActiveEventId(currentEventId);
  }, [currentEventId]);

  useEffect(() => {
    saveActiveTab(activeTab);
  }, [activeTab]);

  // Accessibility state
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState<number>(1.0);

  // Modals
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isQuickPaymentModalOpen, setIsQuickPaymentModalOpen] = useState(false);
  const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);

  // Current active event
  const currentEvent = events.find((e) => e.id === currentEventId) || events[0];

  // Helper to update current event state
  const updateCurrentEvent = (updater: (prev: EventData) => EventData) => {
    setEvents((prevEvents) =>
      prevEvents.map((evt) => (evt.id === currentEvent.id ? updater(evt) : evt))
    );
  };

  // Activity logger
  const logActivity = (
    action: string,
    tag: 'budget' | 'rsvp' | 'timeline' | 'ai' | 'collab' = 'collab'
  ) => {
    const newAct = {
      id: `act-${Date.now()}`,
      user: currentUserRole === 'admin' ? 'You (Admin)' : 'You (Editor)',
      action,
      timestamp: 'Just now',
      tag,
    };
    updateCurrentEvent((prev) => ({
      ...prev,
      activityLog: [newAct, ...prev.activityLog.slice(0, 9)],
    }));
  };

  // Expenses handlers
  const handleAddExpense = (expense: ExpenseItem) => {
    updateCurrentEvent((prev) => ({
      ...prev,
      expenses: [expense, ...prev.expenses],
    }));
    logActivity(`Added expense "${expense.name}" ($${expense.actualCost})`, 'budget');
  };

  const handleUpdateExpense = (expense: ExpenseItem) => {
    updateCurrentEvent((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (e.id === expense.id ? expense : e)),
    }));
    logActivity(`Updated payment for "${expense.name}" ($${expense.paidAmount} paid)`, 'budget');
  };

  const handleDeleteExpense = (id: string) => {
    const item = currentEvent.expenses.find((e) => e.id === id);
    updateCurrentEvent((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
    if (item) logActivity(`Removed expense "${item.name}"`, 'budget');
  };

  // Timeline handlers
  const handleAddTimelineItem = (item: TimelineItem) => {
    updateCurrentEvent((prev) => ({
      ...prev,
      timeline: [...prev.timeline, item],
    }));
    logActivity(`Added milestone "${item.title}" at ${item.time}`, 'timeline');
  };

  const handleToggleTimelineComplete = (id: string) => {
    updateCurrentEvent((prev) => ({
      ...prev,
      timeline: prev.timeline.map((t) =>
        t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
      ),
    }));
    const item = currentEvent.timeline.find((t) => t.id === id);
    if (item) {
      logActivity(
        `${item.isCompleted ? 'Reopened' : 'Completed'} milestone "${item.title}"`,
        'timeline'
      );
    }
  };

  const handleDeleteTimelineItem = (id: string) => {
    const item = currentEvent.timeline.find((t) => t.id === id);
    updateCurrentEvent((prev) => ({
      ...prev,
      timeline: prev.timeline.filter((t) => t.id !== id),
    }));
    if (item) logActivity(`Deleted milestone "${item.title}"`, 'timeline');
  };

  // Guest handlers
  const handleAddGuest = (guest: GuestItem) => {
    updateCurrentEvent((prev) => ({
      ...prev,
      guests: [guest, ...prev.guests],
    }));
    logActivity(`Added guest "${guest.name}" (${guest.rsvpStatus})`, 'rsvp');
  };

  const handleUpdateGuest = (guest: GuestItem) => {
    updateCurrentEvent((prev) => ({
      ...prev,
      guests: prev.guests.map((g) => (g.id === guest.id ? guest : g)),
    }));
    logActivity(`Updated RSVP for "${guest.name}" to ${guest.rsvpStatus}`, 'rsvp');
  };

  const handleDeleteGuest = (id: string) => {
    const g = currentEvent.guests.find((x) => x.id === id);
    updateCurrentEvent((prev) => ({
      ...prev,
      guests: prev.guests.filter((x) => x.id !== id),
    }));
    if (g) logActivity(`Removed guest "${g.name}"`, 'rsvp');
  };

  // AI Ideas handlers
  const handleAddAiIdea = (idea: AiIdea) => {
    updateCurrentEvent((prev) => ({
      ...prev,
      aiIdeas: [idea, ...prev.aiIdeas],
    }));
    logActivity(`Generated AI suggestion: "${idea.title}"`, 'ai');
  };

  const handleApplyIdeaToPlan = (ideaId: string) => {
    const idea = currentEvent.aiIdeas.find((i) => i.id === ideaId);
    if (!idea) return;

    updateCurrentEvent((prev) => ({
      ...prev,
      aiIdeas: prev.aiIdeas.map((i) => (i.id === ideaId ? { ...i, applied: true } : i)),
      notes: [
        {
          id: `not-ai-${Date.now()}`,
          title: `AI Approved Idea: ${idea.title}`,
          content: `${idea.description}\nCategory: ${idea.category}\nTags: ${idea.tags.join(', ')}`,
          category: 'ideas',
          updatedBy: 'EventPulse AI',
          updatedAt: 'Just now',
        },
        ...prev.notes,
      ],
    }));
    logActivity(`Approved AI idea "${idea.title}" into master plan notes`, 'ai');
  };

  // Reminders handlers
  const handleUpdateReminder = (reminder: EmailReminder) => {
    updateCurrentEvent((prev) => ({
      ...prev,
      reminders: prev.reminders.map((r) => (r.id === reminder.id ? reminder : r)),
    }));
  };

  // Shared Notes handlers
  const handleAddNote = (note: SharedNote) => {
    updateCurrentEvent((prev) => ({
      ...prev,
      notes: [note, ...prev.notes],
    }));
    logActivity(`Created team note "${note.title}"`, 'collab');
  };

  const handleDeleteNote = (id: string) => {
    const n = currentEvent.notes.find((x) => x.id === id);
    updateCurrentEvent((prev) => ({
      ...prev,
      notes: prev.notes.filter((x) => x.id !== id),
    }));
    if (n) logActivity(`Deleted note "${n.title}"`, 'collab');
  };

  const handleUpdateNote = (note: SharedNote) => {
    updateCurrentEvent((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === note.id ? note : n)),
    }));
    logActivity(`Edited note "${note.title}"`, 'collab');
  };

  // Active view content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewDashboard
            event={currentEvent}
            onNavigateTab={setActiveTab}
            onOpenQuickPaymentModal={() => {
              setActiveTab('budget');
              setIsQuickPaymentModalOpen(true);
            }}
            onOpenAddGuestModal={() => {
              setActiveTab('rsvps');
              setIsAddGuestModalOpen(true);
            }}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
          />
        );
      case 'ai-assistant':
        return (
          <AiAssistantHub
            event={currentEvent}
            onAddAiIdea={handleAddAiIdea}
            onApplyIdeaToPlan={handleApplyIdeaToPlan}
          />
        );
      case 'budget':
        return (
          <BudgetVendorTracker
            totalBudget={currentEvent.totalBudget}
            expenses={currentEvent.expenses}
            currency={currentEvent.currency}
            onUpdateTotalBudget={(newCap) =>
              updateCurrentEvent((prev) => ({ ...prev, totalBudget: newCap }))
            }
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
            isQuickPaymentModalOpen={isQuickPaymentModalOpen}
            onCloseQuickPaymentModal={() => setIsQuickPaymentModalOpen(false)}
          />
        );
      case 'timeline':
        return (
          <TimelineRunsheet
            timeline={currentEvent.timeline}
            onAddTimelineItem={handleAddTimelineItem}
            onToggleComplete={handleToggleTimelineComplete}
            onDeleteTimelineItem={handleDeleteTimelineItem}
          />
        );
      case 'rsvps':
        return (
          <GuestRsvpTracker
            guests={currentEvent.guests}
            onAddGuest={handleAddGuest}
            onUpdateGuest={handleUpdateGuest}
            onDeleteGuest={handleDeleteGuest}
            isAddGuestModalOpen={isAddGuestModalOpen}
            onCloseAddGuestModal={() => setIsAddGuestModalOpen(false)}
          />
        );
      case 'reminders':
        return (
          <AutomatedReminders
            event={currentEvent}
            onUpdateReminder={handleUpdateReminder}
            onLogActivity={logActivity}
          />
        );
      case 'collab':
        return (
          <CollaborationNotes
            event={currentEvent}
            currentUserRole={currentUserRole}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            onUpdateNote={handleUpdateNote}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`min-h-screen ${highContrast ? 'accessibility-high-contrast bg-white' : 'bg-slate-50'}`}
      style={{ fontSize: `${fontSizeMultiplier * 100}%` }}
    >
      <Navbar
        events={events}
        currentEvent={currentEvent}
        onSelectEvent={(evt) => {
          setCurrentEventId(evt.id);
          setActiveTab('overview');
        }}
        onOpenNewEventModal={() => setIsNewEventModalOpen(true)}
        isMobileSimulator={isMobileSimulator}
        onToggleMobileSimulator={() => setIsMobileSimulator(!isMobileSimulator)}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        currentUserRole={currentUserRole}
        onChangeUserRole={setCurrentUserRole}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast(!highContrast)}
        fontSizeMultiplier={fontSizeMultiplier}
        onChangeFontSize={setFontSizeMultiplier}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {isMobileSimulator ? (
        <MobileAppSimulator
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onExitSimulator={() => setIsMobileSimulator(false)}
        >
          {renderTabContent()}
        </MobileAppSimulator>
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {renderTabContent()}
        </main>
      )}

      {/* New Event Modal */}
      {isNewEventModalOpen && (
        <NewEventModal
          onClose={() => setIsNewEventModalOpen(false)}
          onCreateEvent={(evt) => {
            setEvents([evt, ...events]);
            setCurrentEventId(evt.id);
            setActiveTab('overview');
          }}
        />
      )}

      {/* Printable PDF Report Modal */}
      {isPrintModalOpen && (
        <PrintablePdfReport
          event={currentEvent}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </div>
  );
}
