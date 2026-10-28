import React from 'react';
import {
  Printer,
  Download,
  X,
  Calendar,
  MapPin,
  Sparkles,
  DollarSign,
  Users,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { EventData } from '../types/event';
import {
  calculateBudgetSummary,
  calculateGuestStats,
  sortTimelineChronologically,
} from '../logic/eventCalculations';

interface PrintablePdfReportProps {
  event: EventData;
  onClose: () => void;
}

export const PrintablePdfReport: React.FC<PrintablePdfReportProps> = ({ event, onClose }) => {
  const budgetSummary = calculateBudgetSummary(event.totalBudget, event.expenses);
  const guestStats = calculateGuestStats(event.guests);
  const sortedTimeline = sortTimelineChronologically(event.timeline);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    // Generate CSV for expenses and guests
    const rows = [
      ['EVENT SUMMARY REPORT'],
      ['Title', event.title],
      ['Type', event.type],
      ['Date', event.date],
      ['Location', event.location],
      ['Total Budget', event.totalBudget],
      ['Actual Committed', budgetSummary.totalActual],
      ['Paid', budgetSummary.totalPaid],
      ['Balance Due', budgetSummary.remainingDue],
      [],
      ['VENDOR & EXPENSE LEDGER'],
      ['Expense', 'Vendor', 'Category', 'Estimated', 'Actual', 'Paid', 'Balance', 'Due Date', 'Status'],
      ...event.expenses.map((e) => [
        `"${e.name}"`,
        `"${e.vendor}"`,
        e.category,
        e.estimatedCost,
        e.actualCost,
        e.paidAmount,
        Math.max(0, e.actualCost - e.paidAmount),
        e.dueDate,
        e.status,
      ]),
      [],
      ['GUEST RSVP ROSTER'],
      ['Name', 'Email', 'RSVP Status', 'Party Size', 'Dietary Restrictions', 'Table Number'],
      ...event.guests.map((g) => [
        `"${g.name}"`,
        `"${g.email}"`,
        g.rsvpStatus,
        1 + g.plusOnes,
        `"${g.dietary?.join(', ') || 'None'}"`,
        `"${g.tableNumber || 'Unassigned'}"`,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}_EventPulse_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-2 sm:p-6 flex justify-center">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto border border-slate-200">
        {/* Floating action header (hidden during print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-sm sm:text-base">Executive Event PDF Brief</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              CSV Export
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save as PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors ml-2"
              aria-label="Close PDF modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-10 text-slate-900 space-y-8 bg-white" id="printable-brief">
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-extrabold text-xl text-indigo-900 tracking-tight">EVENTPULSE AI</span>
                <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">• MASTER BRIEF</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">{event.title}</h1>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">{event.description}</p>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-600 space-y-1 shrink-0">
              <div><b>Date:</b> {event.date} {event.time && `at ${event.time}`}</div>
              <div><b>Location:</b> {event.location}</div>
              <div><b>Vibe:</b> {event.vibe}</div>
              <div className="text-slate-400 text-[10px]">Generated: {new Date().toLocaleDateString()}</div>
            </div>
          </div>

          {/* KPI Summary Tiles */}
          <div className="grid grid-cols-4 gap-3 page-break-inside-avoid">
            <div className="border border-slate-300 p-3 rounded-lg text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Budget</span>
              <span className="text-lg font-bold text-slate-900">${event.totalBudget.toLocaleString()}</span>
            </div>
            <div className="border border-slate-300 p-3 rounded-lg text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Committed</span>
              <span className="text-lg font-bold text-slate-900">${budgetSummary.totalActual.toLocaleString()}</span>
            </div>
            <div className="border border-slate-300 p-3 rounded-lg text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Attending Guests</span>
              <span className="text-lg font-bold text-slate-900">{guestStats.confirmedHeadcount} pax</span>
            </div>
            <div className="border border-slate-300 p-3 rounded-lg text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Vendors</span>
              <span className="text-lg font-bold text-slate-900">{event.expenses.length} active</span>
            </div>
          </div>

          {/* Section 1: Master Run-of-Show */}
          <div className="space-y-3 page-break-inside-avoid">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1.5 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-700" />
              1. Master Run-of-Show Schedule
            </h2>

            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2 border-b">Time</th>
                  <th className="p-2 border-b">Milestone</th>
                  <th className="p-2 border-b">Phase</th>
                  <th className="p-2 border-b">Lead Coordinator</th>
                  <th className="p-2 border-b">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedTimeline.map((item) => (
                  <tr key={item.id} className="even:bg-slate-50">
                    <td className="p-2 font-bold text-purple-900 whitespace-nowrap">{item.time} ({item.durationMin}m)</td>
                    <td className="p-2 font-semibold text-slate-900">
                      {item.title}
                      <span className="block text-[10px] text-slate-500 font-normal">{item.description}</span>
                    </td>
                    <td className="p-2 uppercase text-[10px] font-bold text-slate-600">{item.phase}</td>
                    <td className="p-2 text-slate-700">{item.leadPerson}</td>
                    <td className="p-2 text-slate-700">{item.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 2: Budget & Vendor Payment Ledger */}
          <div className="space-y-3 page-break-inside-avoid">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1.5 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-700" />
              2. Vendor Payment Audit & Contract Ledger
            </h2>

            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2 border-b">Service & Vendor</th>
                  <th className="p-2 border-b">Category</th>
                  <th className="p-2 border-b">Actual Cost</th>
                  <th className="p-2 border-b">Paid Deposit</th>
                  <th className="p-2 border-b">Remaining Due</th>
                  <th className="p-2 border-b">Due Date</th>
                  <th className="p-2 border-b">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {event.expenses.map((exp) => {
                  const bal = Math.max(0, exp.actualCost - exp.paidAmount);
                  return (
                    <tr key={exp.id} className="even:bg-slate-50">
                      <td className="p-2 font-semibold text-slate-900">
                        {exp.name}
                        <span className="block text-[10px] text-slate-500 font-normal">{exp.vendor}</span>
                      </td>
                      <td className="p-2 capitalize text-slate-600">{exp.category}</td>
                      <td className="p-2 font-bold">${exp.actualCost.toLocaleString()}</td>
                      <td className="p-2 text-emerald-800 font-semibold">${exp.paidAmount.toLocaleString()}</td>
                      <td className="p-2 font-bold text-amber-800">${bal.toLocaleString()}</td>
                      <td className="p-2 text-slate-600">{exp.dueDate}</td>
                      <td className="p-2 uppercase font-bold text-[10px] text-slate-700">{exp.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Section 3: Dietary Constraints & Seating */}
          <div className="space-y-3 page-break-inside-avoid">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1.5 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-700" />
              3. Guest RSVP Attendance & Catering Dietary Roster
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
              {Object.entries(guestStats.dietaryCounts)
                .filter(([diet, count]) => diet !== 'none' && count > 0)
                .map(([diet, count]) => (
                  <div key={diet} className="p-2 border border-slate-200 rounded text-center text-xs">
                    <span className="font-bold capitalize block">{diet.replace('_', ' ')}</span>
                    <span className="text-slate-600 font-bold">{count} portions</span>
                  </div>
                ))}
            </div>

            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2 border-b">Guest Name</th>
                  <th className="p-2 border-b">Status</th>
                  <th className="p-2 border-b">Headcount</th>
                  <th className="p-2 border-b">Dietary Needs</th>
                  <th className="p-2 border-b">Table Assignment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {event.guests.map((g) => (
                  <tr key={g.id} className="even:bg-slate-50">
                    <td className="p-2 font-semibold text-slate-900">{g.name}</td>
                    <td className="p-2 uppercase text-[10px] font-bold">{g.rsvpStatus}</td>
                    <td className="p-2">{1 + g.plusOnes}</td>
                    <td className="p-2 text-slate-700">
                      {g.dietary?.join(', ') || 'None'}
                      {g.dietaryNotes && <span className="block text-[10px] text-slate-500">Note: {g.dietaryNotes}</span>}
                    </td>
                    <td className="p-2 text-slate-700">{g.tableNumber || 'Unassigned'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer signoff */}
          <div className="pt-6 border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-500">
            <span>EventPulse AI • Orchestration Platform</span>
            <span>Confidential & Prepared for Event Coordinators</span>
          </div>
        </div>
      </div>
    </div>
  );
};
