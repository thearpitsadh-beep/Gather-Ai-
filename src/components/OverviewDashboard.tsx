import React from 'react';
import {
  Calendar,
  DollarSign,
  Users,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Send,
  PlusCircle,
  FileText,
} from 'lucide-react';
import { EventData } from '../types/event';
import {
  calculateBudgetSummary,
  calculateGuestStats,
  auditVendorPayments,
  calculateTimelineProgress,
  calculateDaysBetween,
} from '../logic/eventCalculations';

interface OverviewDashboardProps {
  event: EventData;
  onNavigateTab: (tabId: string) => void;
  onOpenQuickPaymentModal: () => void;
  onOpenAddGuestModal: () => void;
  onOpenPrintModal: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  event,
  onNavigateTab,
  onOpenQuickPaymentModal,
  onOpenAddGuestModal,
  onOpenPrintModal,
}) => {
  const today = '2026-10-27'; // Consistent sandbox baseline
  const daysRemaining = calculateDaysBetween(today, event.date);

  const budgetSummary = calculateBudgetSummary(event.totalBudget, event.expenses);
  const guestStats = calculateGuestStats(event.guests);
  const vendorAudit = auditVendorPayments(event.expenses, today);
  const timelineProgress = calculateTimelineProgress(event.timeline);

  // Health label and colors
  const budgetHealthBadge = {
    under_budget: { label: 'Under Budget', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    on_track: { label: 'On Track', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    warning: { label: 'High Allocation', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    over_budget: { label: 'Over Budget', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  }[budgetSummary.health];

  return (
    <div className="space-y-6">
      {/* Event Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-indigo-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{event.type.toUpperCase()} ORCHESTRATION</span>
              <span>•</span>
              <span>{daysRemaining > 0 ? `${daysRemaining} Days to Go` : 'Event Day Today!'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-400" />
                {event.date} {event.time && `at ${event.time}`}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-pink-400" />
                {event.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                {event.vibe}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigateTab('ai-assistant')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              Generate Ideas & Advice
            </button>
            <button
              type="button"
              onClick={onOpenPrintModal}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm border border-white/15 backdrop-blur-md transition-all"
            >
              <FileText className="w-4 h-4" />
              Printable PDF Brief
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -top-10 w-60 h-60 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* 4 Core KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Budget Health Card */}
        <div
          onClick={() => onNavigateTab('budget')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Budget & Spend</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${budgetHealthBadge.bg}`}>
              {budgetHealthBadge.label}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              ${budgetSummary.totalActual.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">
              of ${budgetSummary.totalBudget.toLocaleString()}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all ${
                budgetSummary.spendPercentage > 100
                  ? 'bg-rose-500'
                  : budgetSummary.spendPercentage > 85
                  ? 'bg-amber-500'
                  : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.min(100, budgetSummary.spendPercentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-500">
            <span>Paid: ${budgetSummary.totalPaid.toLocaleString()}</span>
            <span className="text-amber-600 font-medium">Due: ${budgetSummary.remainingDue.toLocaleString()}</span>
          </div>
        </div>

        {/* RSVP Status Card */}
        <div
          onClick={() => onNavigateTab('rsvps')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">RSVP Tracking</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
              {guestStats.responseRatePercent}% Responded
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {guestStats.confirmedHeadcount}
            </span>
            <span className="text-xs text-slate-500">
              Attending ({guestStats.confirmedCount} parties)
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-2"
              style={{
                width: `${(guestStats.confirmedCount / (guestStats.totalInvitations || 1)) * 100}%`,
              }}
            />
            <div
              className="bg-rose-400 h-2"
              style={{
                width: `${(guestStats.declinedCount / (guestStats.totalInvitations || 1)) * 100}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-500">
            <span className="text-amber-600 font-medium">{guestStats.pendingCount} Awaiting Response</span>
            <span>{guestStats.totalHeadcount} Total Headcount</span>
          </div>
        </div>

        {/* Vendor Payments Audit Card */}
        <div
          onClick={() => onNavigateTab('budget')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendor Contracts</span>
            {vendorAudit.overdueCount > 0 ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-rose-50 text-rose-700 border-rose-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-500" />
                {vendorAudit.overdueCount} Overdue
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                All Settled
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{vendorAudit.totalVendors}</span>
            <span className="text-xs text-slate-500">Active Vendors</span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full"
              style={{
                width: `${(vendorAudit.fullyPaidCount / (vendorAudit.totalVendors || 1)) * 100}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-500">
            <span>{vendorAudit.fullyPaidCount} Paid in Full</span>
            <span className="text-indigo-600 font-medium">${vendorAudit.totalBalanceRemaining.toLocaleString()} Balance</span>
          </div>
        </div>

        {/* Timeline Run-Sheet Card */}
        <div
          onClick={() => onNavigateTab('timeline')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Run of Show</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-purple-50 text-purple-700 border-purple-200">
              {timelineProgress.percentage}% Done
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{timelineProgress.total}</span>
            <span className="text-xs text-slate-500">Scheduled Milestones</span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${timelineProgress.percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-500 truncate">
            <span className="truncate">Next: {timelineProgress.nextItem?.title || 'All Complete'}</span>
            <span className="font-semibold text-purple-600">{timelineProgress.nextItem?.time || ''}</span>
          </div>
        </div>
      </div>

      {/* Interactive Quick Actions Bar */}
      <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 ml-1">
          <TrendingUp className="w-4 h-4 text-indigo-600" />
          Quick Actions:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenAddGuestModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold border border-slate-200 shadow-2xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
            Add Guest
          </button>
          <button
            type="button"
            onClick={onOpenQuickPaymentModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold border border-slate-200 shadow-2xs transition-colors"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            Log Vendor Payment
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('reminders')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold border border-slate-200 shadow-2xs transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-blue-600" />
            Send RSVP Reminders
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('ai-assistant')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-95 text-xs font-semibold shadow-2xs transition-opacity"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Speech / Advice
          </button>
        </div>
      </div>

      {/* 2 Columns: Live Collaboration Activity & Dietary / Vendor Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Next Up Run-of-Show and Dietary Matrix */}
        <div className="lg:col-span-2 space-y-6">
          {/* Day-of Next Up & Run-of-Show Preview */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                Schedule Snapshot & Key Highlights
              </h2>
              <button
                type="button"
                onClick={() => onNavigateTab('timeline')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                View Full Timeline
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {event.timeline.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border flex items-start gap-3 transition-colors ${
                    item.isCompleted
                      ? 'bg-slate-50/70 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded shrink-0">
                    {item.time}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-slate-900 truncate">{item.title}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.phase}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span>Lead: {item.leadPerson}</span>
                      <span>•</span>
                      <span>Location: {item.location}</span>
                    </div>
                  </div>
                  {item.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0 mt-1" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dietary Requirements Breakdown for Catering Assurance */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Dietary & Allergies Assurance
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Real-time counts synced with catering contracts to prevent day-of guest complications.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100 text-center">
                <span className="text-xl font-bold text-emerald-700">{guestStats.dietaryCounts.vegetarian}</span>
                <span className="block text-xs font-semibold text-emerald-800 mt-0.5">Vegetarian</span>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100 text-center">
                <span className="text-xl font-bold text-emerald-700">{guestStats.dietaryCounts.vegan}</span>
                <span className="block text-xs font-semibold text-emerald-800 mt-0.5">Vegan</span>
              </div>
              <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-100 text-center">
                <span className="text-xl font-bold text-amber-700">{guestStats.dietaryCounts.gluten_free}</span>
                <span className="block text-xs font-semibold text-amber-800 mt-0.5">Gluten-Free</span>
              </div>
              <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-100 text-center">
                <span className="text-xl font-bold text-rose-700">{guestStats.dietaryCounts.nut_allergy}</span>
                <span className="block text-xs font-semibold text-rose-800 mt-0.5">Nut Allergy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Live Activity Feed & Collab Presence */}
        <div className="space-y-6">
          {/* Real-time Collaboration Feed */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Live Activity Feed
              </h2>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Real-Time
              </span>
            </div>

            <div className="space-y-3.5">
              {event.activityLog.map((act) => (
                <div key={act.id} className="text-xs flex items-start gap-2.5 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0 text-[10px]">
                    {act.user.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">{act.user}</span>{' '}
                    <span className="text-slate-600">{act.action}</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{act.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick AI Advice Widget */}
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl border border-indigo-100 p-5">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm mb-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              EventPulse AI Planner Tip
            </div>
            <p className="text-xs text-slate-700 leading-relaxed mb-3">
              "Elena & Marcus: Your wedding date is less than 30 days out! We recommend locking in the guest shuttle schedule today to prevent late arrivals at the olive grove ceremony."
            </p>
            <button
              type="button"
              onClick={() => onNavigateTab('ai-assistant')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Open AI Brain & Speech Writer
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
