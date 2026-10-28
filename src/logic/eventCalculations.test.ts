import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBudgetSummary,
  calculateGuestStats,
  auditVendorPayments,
  sortTimelineChronologically,
  calculateTimelineProgress,
  calculateDaysBetween,
  checkRemindersEligibility,
  interpolateReminderTemplate,
} from './eventCalculations';
import { ExpenseItem, GuestItem, TimelineItem, EmailReminder } from '../types/event';

test('calculateBudgetSummary computes accurate totals and budget health', () => {
  const expenses: ExpenseItem[] = [
    {
      id: 'e1',
      category: 'venue',
      name: 'Grand Ballroom',
      vendor: 'Rosewood Hall',
      estimatedCost: 10000,
      actualCost: 11000,
      paidAmount: 6000,
      dueDate: '2026-11-01',
      status: 'partial',
    },
    {
      id: 'e2',
      category: 'catering',
      name: 'Artisan Buffet',
      vendor: 'Gourmet Kitchen',
      estimatedCost: 5000,
      actualCost: 4800,
      paidAmount: 4800,
      dueDate: '2026-11-05',
      status: 'paid',
    },
    {
      id: 'e3',
      category: 'photography',
      name: 'Full Day Coverage',
      vendor: 'Lumen Studios',
      estimatedCost: 3000,
      actualCost: 3200,
      paidAmount: 1000,
      dueDate: '2026-11-10',
      status: 'partial',
    },
  ];

  const summary = calculateBudgetSummary(20000, expenses);

  assert.equal(summary.totalBudget, 20000);
  assert.equal(summary.totalEstimated, 18000);
  assert.equal(summary.totalActual, 19000);
  assert.equal(summary.totalPaid, 11800);
  assert.equal(summary.remainingDue, 7200);
  assert.equal(summary.unallocatedBudget, 1000);
  assert.equal(summary.spendPercentage, 95);
  assert.equal(summary.health, 'warning');
  assert.equal(summary.categoryBreakdown.venue.actual, 11000);
  assert.equal(summary.categoryBreakdown.catering.paid, 4800);
});

test('calculateBudgetSummary flags over_budget when spend exceeds totalBudget', () => {
  const expenses: ExpenseItem[] = [
    {
      id: 'e1',
      category: 'decor',
      name: 'Floral Arches',
      vendor: 'Flora Co',
      estimatedCost: 2000,
      actualCost: 2500,
      paidAmount: 2500,
      dueDate: '2026-10-30',
      status: 'paid',
    },
  ];
  const summary = calculateBudgetSummary(2000, expenses);
  assert.equal(summary.health, 'over_budget');
  assert.equal(summary.spendPercentage, 125);
});

test('calculateGuestStats calculates headcount, response rate, and dietary tallies', () => {
  const guests: GuestItem[] = [
    {
      id: 'g1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      rsvpStatus: 'confirmed',
      plusOnes: 1,
      dietary: ['vegetarian', 'gluten_free'],
      tableNumber: 'Table 1',
    },
    {
      id: 'g2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      rsvpStatus: 'confirmed',
      plusOnes: 0,
      dietary: ['none'],
      tableNumber: 'Table 1',
    },
    {
      id: 'g3',
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      rsvpStatus: 'declined',
      plusOnes: 0,
      dietary: [],
    },
    {
      id: 'g4',
      name: 'Diana Prince',
      email: 'diana@example.com',
      rsvpStatus: 'pending',
      plusOnes: 2,
      dietary: ['halal'],
    },
  ];

  const stats = calculateGuestStats(guests);

  assert.equal(stats.totalInvitations, 4);
  assert.equal(stats.totalHeadcount, 7); // (1+1) + (1+0) + (1+0) + (1+2) = 7
  assert.equal(stats.confirmedCount, 2);
  assert.equal(stats.confirmedHeadcount, 3); // Alice (2) + Bob (1)
  assert.equal(stats.declinedCount, 1);
  assert.equal(stats.pendingCount, 1);
  assert.equal(stats.responseRatePercent, 75); // 3 of 4 responded
  assert.equal(stats.dietaryCounts.vegetarian, 1);
  assert.equal(stats.dietaryCounts.gluten_free, 1);
  assert.equal(stats.dietaryCounts.halal, 1);
  assert.equal(stats.tablesAssignedCount, 2);
});

test('auditVendorPayments detects overdue payments and remaining balances', () => {
  const expenses: ExpenseItem[] = [
    {
      id: 'v1',
      category: 'entertainment',
      name: 'Live Band',
      vendor: 'Groove Collective',
      estimatedCost: 2000,
      actualCost: 2000,
      paidAmount: 500,
      dueDate: '2026-10-15', // past date
      status: 'partial',
    },
    {
      id: 'v2',
      category: 'venue',
      name: 'Hall Deposit',
      vendor: 'City Hall',
      estimatedCost: 1500,
      actualCost: 1500,
      paidAmount: 1500,
      dueDate: '2026-10-01',
      status: 'paid',
    },
    {
      id: 'v3',
      category: 'catering',
      name: 'Dessert Bar',
      vendor: 'Sweet Dreams',
      estimatedCost: 800,
      actualCost: 800,
      paidAmount: 0,
      dueDate: '2026-11-20', // future date
      status: 'pending',
    },
  ];

  const audit = auditVendorPayments(expenses, '2026-10-27');

  assert.equal(audit.totalVendors, 3);
  assert.equal(audit.fullyPaidCount, 1);
  assert.equal(audit.overdueCount, 1);
  assert.equal(audit.pendingCount, 1);
  assert.equal(audit.totalBalanceRemaining, 2300); // 1500 remaining on v1 + 800 on v3
  assert.equal(audit.overdueItems.length, 1);
  assert.equal(audit.overdueItems[0].name, 'Live Band');
});

test('sortTimelineChronologically and calculateTimelineProgress function correctly', () => {
  const timeline: TimelineItem[] = [
    {
      id: 't2',
      time: '18:00',
      durationMin: 60,
      phase: 'reception',
      title: 'Dinner Served',
      description: '3 course plated dinner',
      leadPerson: 'Chef Marco',
      location: 'Dining Hall',
      isCompleted: false,
    },
    {
      id: 't1',
      time: '16:00',
      durationMin: 45,
      phase: 'ceremony',
      title: 'Welcome & Ceremony',
      description: 'Vows and ring exchange',
      leadPerson: 'Officiant Dave',
      location: 'Rose Garden',
      isCompleted: true,
    },
    {
      id: 't3',
      time: '20:30',
      durationMin: 90,
      phase: 'entertainment',
      title: 'First Dance & Live Music',
      description: 'DJ set kicks off',
      leadPerson: 'DJ Sparks',
      location: 'Main Stage',
      isCompleted: false,
    },
  ];

  const sorted = sortTimelineChronologically(timeline);
  assert.equal(sorted[0].time, '16:00');
  assert.equal(sorted[1].time, '18:00');
  assert.equal(sorted[2].time, '20:30');

  const progress = calculateTimelineProgress(timeline);
  assert.equal(progress.total, 3);
  assert.equal(progress.completed, 1);
  assert.equal(progress.percentage, 33);
  assert.equal(progress.nextItem?.title, 'Dinner Served');
});

test('checkRemindersEligibility and interpolateReminderTemplate work as expected', () => {
  const reminders: EmailReminder[] = [
    {
      id: 'r1',
      name: 'Save the Date',
      triggerDaysBefore: 60,
      subject: 'Save the Date for {{event_title}}!',
      bodyTemplate: 'Hi {{guest_name}}, we are excited to invite you on {{event_date}} in {{location}}.',
      targetAudience: 'all',
      isAutomated: true,
      sentCount: 0,
    },
    {
      id: 'r2',
      name: 'Urgent RSVP',
      triggerDaysBefore: 7,
      subject: 'Only {{days_left}} days left to RSVP',
      bodyTemplate: 'Please confirm at {{rsvp_link}}',
      targetAudience: 'pending_rsvp',
      isAutomated: true,
      sentCount: 0,
    },
  ];

  // Event is 14 days away from today
  const checks = checkRemindersEligibility(reminders, '2026-11-10', '2026-10-27');
  assert.equal(checks[0].isEligible, true); // 14 <= 60
  assert.equal(checks[1].isEligible, false); // 14 <= 7 is false

  const interpolated = interpolateReminderTemplate(reminders[0].bodyTemplate, {
    guestName: 'Jessica',
    eventDate: 'Nov 10, 2026',
    location: 'Emerald Estate',
  });
  assert.equal(
    interpolated,
    'Hi Jessica, we are excited to invite you on Nov 10, 2026 in Emerald Estate.'
  );
});

test('calculateBudgetSummary handles zero budget and empty expenses without division by zero', () => {
  const summaryEmpty = calculateBudgetSummary(0, []);
  assert.equal(summaryEmpty.totalBudget, 0);
  assert.equal(summaryEmpty.totalActual, 0);
  assert.equal(summaryEmpty.totalPaid, 0);
  assert.equal(summaryEmpty.spendPercentage, 0);
  assert.equal(summaryEmpty.health, 'under_budget');

  // Handle NaN in cost fields
  const malformedExpenses: any = [
    {
      id: 'm1',
      category: 'venue',
      name: 'Test',
      vendor: 'Test',
      estimatedCost: NaN,
      actualCost: 'invalid',
      paidAmount: -50,
      dueDate: '',
      status: 'pending',
    },
  ];
  const summaryMalformed = calculateBudgetSummary(5000, malformedExpenses);
  assert.equal(summaryMalformed.totalEstimated, 0);
  assert.equal(summaryMalformed.totalActual, 0);
  assert.equal(summaryMalformed.totalPaid, 0);
  assert.equal(summaryMalformed.spendPercentage, 0);
});

test('calculateGuestStats handles empty guest list and unassigned tables', () => {
  const statsEmpty = calculateGuestStats([]);
  assert.equal(statsEmpty.totalInvitations, 0);
  assert.equal(statsEmpty.totalHeadcount, 0);
  assert.equal(statsEmpty.confirmedCount, 0);
  assert.equal(statsEmpty.responseRatePercent, 0);
  assert.equal(statsEmpty.tablesAssignedCount, 0);
});

test('calculateTimelineProgress handles empty timeline without throwing', () => {
  const progressEmpty = calculateTimelineProgress([]);
  assert.equal(progressEmpty.total, 0);
  assert.equal(progressEmpty.completed, 0);
  assert.equal(progressEmpty.percentage, 0);
  assert.equal(progressEmpty.nextItem, null);
});

