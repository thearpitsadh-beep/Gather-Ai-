import React, { useState } from 'react';
import {
  BellRing,
  Send,
  Clock,
  CheckCircle2,
  Mail,
  Sparkles,
  RefreshCw,
  Users,
  Eye,
  Edit3,
} from 'lucide-react';
import { EmailReminder, EventData, ReminderAudience } from '../types/event';
import {
  calculateDaysBetween,
  checkRemindersEligibility,
  interpolateReminderTemplate,
} from '../logic/eventCalculations';

interface AutomatedRemindersProps {
  event: EventData;
  onUpdateReminder: (reminder: EmailReminder) => void;
  onLogActivity: (action: string, tag: 'rsvp' | 'budget' | 'timeline' | 'ai' | 'collab') => void;
}

export const AutomatedReminders: React.FC<AutomatedRemindersProps> = ({
  event,
  onUpdateReminder,
  onLogActivity,
}) => {
  const today = '2026-10-27';
  const daysUntilEvent = calculateDaysBetween(today, event.date);

  const [selectedReminder, setSelectedReminder] = useState<EmailReminder>(event.reminders[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [subjectDraft, setSubjectDraft] = useState(selectedReminder?.subject || '');
  const [bodyDraft, setBodyDraft] = useState(selectedReminder?.bodyTemplate || '');
  const [dispatching, setDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<string | null>(null);

  const eligibilityList = checkRemindersEligibility(event.reminders, event.date, today);

  const getRecipientCount = (audience: ReminderAudience): number => {
    switch (audience) {
      case 'all':
        return event.guests.length;
      case 'pending_rsvp':
        return event.guests.filter((g) => g.rsvpStatus === 'pending').length;
      case 'confirmed':
        return event.guests.filter((g) => g.rsvpStatus === 'confirmed').length;
      case 'vendors':
        return event.expenses.length;
    }
  };

  const samplePreviewText = interpolateReminderTemplate(
    isEditing ? bodyDraft : selectedReminder.bodyTemplate,
    {
      guestName: 'Jessica Sterling',
      eventTitle: event.title,
      eventDate: event.date,
      location: event.location,
      daysLeft: Math.max(0, daysUntilEvent),
      rsvpLink: 'https://eventpulse.ai/rsvp/' + event.id,
    }
  );

  const handleSimulateDispatch = async () => {
    setDispatching(true);
    setDispatchResult(null);

    const count = getRecipientCount(selectedReminder.targetAudience);

    try {
      const res = await fetch('/api/email/simulate-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reminderId: selectedReminder.id,
          subject: selectedReminder.subject,
          recipientsCount: count,
          targetAudience: selectedReminder.targetAudience,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDispatchResult(`Successfully dispatched to ${count} recipients!`);
        const updated = {
          ...selectedReminder,
          sentCount: selectedReminder.sentCount + count,
          lastRunAt: today,
        };
        onUpdateReminder(updated);
        setSelectedReminder(updated);
        onLogActivity(
          `Dispatched reminder: "${selectedReminder.name}" to ${count} ${selectedReminder.targetAudience} recipients`,
          'rsvp'
        );
      }
    } catch (err) {
      console.error(err);
      setDispatchResult('Dispatch error occurred');
    } finally {
      setDispatching(false);
    }
  };

  const handleSaveTemplate = () => {
    const updated = {
      ...selectedReminder,
      subject: subjectDraft,
      bodyTemplate: bodyDraft,
    };
    onUpdateReminder(updated);
    setSelectedReminder(updated);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BellRing className="w-5 h-5 text-blue-600" />
              Automated Email Reminders & Broadcasts
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Configure scheduled trigger timelines, personalized message templates, and automated delivery to guests & vendors.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold bg-blue-50 text-blue-800 px-3 py-1.5 rounded-lg border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>{daysUntilEvent} Days Until Event</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scheduled Automation Triggers */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Scheduled Automated Triggers
          </h2>

          <div className="space-y-3">
            {event.reminders.map((rem) => {
              const eligibleInfo = eligibilityList.find((e) => e.reminder.id === rem.id);
              const isSelected = selectedReminder.id === rem.id;
              const count = getRecipientCount(rem.targetAudience);

              return (
                <div
                  key={rem.id}
                  onClick={() => {
                    setSelectedReminder(rem);
                    setSubjectDraft(rem.subject);
                    setBodyDraft(rem.bodyTemplate);
                    setIsEditing(false);
                    setDispatchResult(null);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">{rem.name}</span>
                    {eligibleInfo?.isEligible ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Trigger Ready
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        Scheduled
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 font-medium line-clamp-1">{rem.subject}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5 pt-2.5 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {rem.triggerDaysBefore} days before
                    </span>
                    <span className="font-semibold text-slate-700">{count} recipients</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Dynamic Variable Tokens
            </span>
            <p className="text-[11px] text-slate-500">
              Include <code className="bg-white px-1 py-0.5 rounded border">{'{{guest_name}}'}</code>,{' '}
              <code className="bg-white px-1 py-0.5 rounded border">{'{{event_title}}'}</code>,{' '}
              <code className="bg-white px-1 py-0.5 rounded border">{'{{event_date}}'}</code>,{' '}
              <code className="bg-white px-1 py-0.5 rounded border">{'{{location}}'}</code>,{' '}
              <code className="bg-white px-1 py-0.5 rounded border">{'{{days_left}}'}</code>, or{' '}
              <code className="bg-white px-1 py-0.5 rounded border">{'{{rsvp_link}}'}</code>.
            </p>
          </div>
        </div>

        {/* Right 2 Columns: Email Editor & Live Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedReminder.name}</h3>
                <span className="text-xs text-slate-500">
                  Target Audience: <b className="text-slate-700 capitalize">{selectedReminder.targetAudience.replace('_', ' ')}</b> (
                  {getRecipientCount(selectedReminder.targetAudience)} contacts)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSubjectDraft(selectedReminder.subject);
                      setBodyDraft(selectedReminder.bodyTemplate);
                      setIsEditing(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    Edit Template
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveTemplate}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Save Changes
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSimulateDispatch}
                  disabled={dispatching}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                >
                  {dispatching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  {dispatching ? 'Sending Broadcast...' : 'Simulate Send Now'}
                </button>
              </div>
            </div>

            {dispatchResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {dispatchResult}
              </div>
            )}

            {/* Template Inputs */}
            {isEditing ? (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Email Subject Line</label>
                  <input
                    type="text"
                    value={subjectDraft}
                    onChange={(e) => setSubjectDraft(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Email Body Template</label>
                  <textarea
                    rows={8}
                    value={bodyDraft}
                    onChange={(e) => setBodyDraft(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  />
                </div>
              </div>
            ) : null}

            {/* Live Rendered Email Preview */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                <Eye className="w-4 h-4 text-slate-500" />
                Sample Rendered Preview (As Received by Guest)
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                <div className="border-b border-slate-200 pb-2 text-xs text-slate-600 space-y-1">
                  <div>
                    <span className="font-semibold text-slate-800">To: </span>Jessica Sterling &lt;jessica@example.com&gt;
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Subject: </span>
                    <span className="font-bold text-slate-900">
                      {isEditing ? subjectDraft : selectedReminder.subject}
                    </span>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {samplePreviewText}
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Powered by EventPulse AI Automated Delivery</span>
                  <span>1-Click RSVP Integration</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
