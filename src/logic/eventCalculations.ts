import {
  DietaryRequirement,
  EmailReminder,
  ExpenseItem,
  GuestItem,
  TimelineItem,
} from '../types/event';

export interface BudgetSummary {
  totalBudget: number;
  totalEstimated: number;
  totalActual: number;
  totalPaid: number;
  remainingDue: number;
  unallocatedBudget: number;
  spendPercentage: number;
  health: 'under_budget' | 'on_track' | 'warning' | 'over_budget';
  categoryBreakdown: Record<string, { estimated: number; actual: number; paid: number; count: number }>;
}

export function calculateBudgetSummary(
  totalBudget: number,
  expenses: ExpenseItem[]
): BudgetSummary {
  let totalEstimated = 0;
  let totalActual = 0;
  let totalPaid = 0;

  const categoryBreakdown: Record<
    string,
    { estimated: number; actual: number; paid: number; count: number }
  > = {};

  for (const item of expenses) {
    const est = Math.max(0, Number(item.estimatedCost) || 0);
    const act = Math.max(0, Number(item.actualCost) || 0);
    const pd = Math.max(0, Number(item.paidAmount) || 0);

    totalEstimated += est;
    totalActual += act;
    totalPaid += pd;

    if (!categoryBreakdown[item.category]) {
      categoryBreakdown[item.category] = { estimated: 0, actual: 0, paid: 0, count: 0 };
    }
    categoryBreakdown[item.category].estimated += est;
    categoryBreakdown[item.category].actual += act;
    categoryBreakdown[item.category].paid += pd;
    categoryBreakdown[item.category].count += 1;
  }

  const remainingDue = Math.max(0, totalActual - totalPaid);
  const unallocatedBudget = totalBudget - totalActual;
  const effectiveBudget = totalBudget > 0 ? totalBudget : (totalActual || 1);
  const spendPercentage = Math.round((totalActual / effectiveBudget) * 100);

  let health: BudgetSummary['health'] = 'on_track';
  if (totalActual > totalBudget && totalBudget > 0) {
    health = 'over_budget';
  } else if (spendPercentage > 90) {
    health = 'warning';
  } else if (spendPercentage <= 80) {
    health = 'under_budget';
  }

  return {
    totalBudget,
    totalEstimated,
    totalActual,
    totalPaid,
    remainingDue,
    unallocatedBudget,
    spendPercentage,
    health,
    categoryBreakdown,
  };
}

export interface GuestStats {
  totalInvitations: number;
  totalHeadcount: number;
  confirmedCount: number;
  confirmedHeadcount: number;
  declinedCount: number;
  pendingCount: number;
  responseRatePercent: number;
  dietaryCounts: Record<DietaryRequirement, number>;
  tablesAssignedCount: number;
}

export function calculateGuestStats(guests: GuestItem[]): GuestStats {
  const totalInvitations = guests.length;
  let totalHeadcount = 0;
  let confirmedCount = 0;
  let confirmedHeadcount = 0;
  let declinedCount = 0;
  let pendingCount = 0;
  let tablesAssignedCount = 0;

  const dietaryCounts: Record<DietaryRequirement, number> = {
    none: 0,
    vegetarian: 0,
    vegan: 0,
    gluten_free: 0,
    halal: 0,
    kosher: 0,
    nut_allergy: 0,
    dairy_free: 0,
    other: 0,
  };

  for (const g of guests) {
    const head = 1 + (Math.max(0, Number(g.plusOnes)) || 0);
    totalHeadcount += head;

    if (g.rsvpStatus === 'confirmed') {
      confirmedCount += 1;
      confirmedHeadcount += head;
    } else if (g.rsvpStatus === 'declined') {
      declinedCount += 1;
    } else {
      pendingCount += 1;
    }

    if (g.tableNumber && g.tableNumber.trim().length > 0) {
      tablesAssignedCount += 1;
    }

    if (g.dietary && g.dietary.length > 0) {
      for (const d of g.dietary) {
        if (dietaryCounts[d] !== undefined) {
          dietaryCounts[d] += 1;
        } else {
          dietaryCounts.other += 1;
        }
      }
    } else {
      dietaryCounts.none += 1;
    }
  }

  const responseRatePercent =
    totalInvitations > 0
      ? Math.round(((confirmedCount + declinedCount) / totalInvitations) * 100)
      : 0;

  return {
    totalInvitations,
    totalHeadcount,
    confirmedCount,
    confirmedHeadcount,
    declinedCount,
    pendingCount,
    responseRatePercent,
    dietaryCounts,
    tablesAssignedCount,
  };
}

export interface VendorPaymentAudit {
  totalVendors: number;
  fullyPaidCount: number;
  partialCount: number;
  pendingCount: number;
  overdueCount: number;
  totalBalanceRemaining: number;
  overdueItems: ExpenseItem[];
}

export function auditVendorPayments(
  expenses: ExpenseItem[],
  currentDateIso: string = new Date().toISOString().slice(0, 10)
): VendorPaymentAudit {
  let fullyPaidCount = 0;
  let partialCount = 0;
  let pendingCount = 0;
  let overdueCount = 0;
  let totalBalanceRemaining = 0;
  const overdueItems: ExpenseItem[] = [];

  for (const item of expenses) {
    const balance = Math.max(0, item.actualCost - item.paidAmount);
    totalBalanceRemaining += balance;

    const isPastDue = Boolean(item.dueDate && item.dueDate < currentDateIso);

    if (balance <= 0) {
      fullyPaidCount += 1;
    } else if (isPastDue) {
      overdueCount += 1;
      overdueItems.push(item);
    } else if (item.paidAmount > 0) {
      partialCount += 1;
    } else {
      pendingCount += 1;
    }
  }

  return {
    totalVendors: expenses.length,
    fullyPaidCount,
    partialCount,
    pendingCount,
    overdueCount,
    totalBalanceRemaining,
    overdueItems,
  };
}

export function sortTimelineChronologically(items: TimelineItem[]): TimelineItem[] {
  return [...items].sort((a, b) => {
    return a.time.localeCompare(b.time);
  });
}

export function calculateTimelineProgress(items: TimelineItem[]): {
  total: number;
  completed: number;
  percentage: number;
  nextItem: TimelineItem | null;
} {
  const total = items.length;
  if (total === 0) {
    return { total: 0, completed: 0, percentage: 0, nextItem: null };
  }
  const completed = items.filter((i) => i.isCompleted).length;
  const percentage = Math.round((completed / total) * 100);
  const sorted = sortTimelineChronologically(items);
  const nextItem = sorted.find((i) => !i.isCompleted) || null;

  return {
    total,
    completed,
    percentage,
    nextItem,
  };
}

export function calculateDaysBetween(dateA: string, dateB: string): number {
  const d1 = new Date(dateA + 'T00:00:00Z').getTime();
  const d2 = new Date(dateB + 'T00:00:00Z').getTime();
  const diffMs = d2 - d1;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function checkRemindersEligibility(
  reminders: EmailReminder[],
  eventDate: string,
  todayDate: string
): { reminder: EmailReminder; daysRemaining: number; isEligible: boolean }[] {
  const daysRemaining = calculateDaysBetween(todayDate, eventDate);

  return reminders.map((r) => {
    // If triggerDaysBefore is 30, it should fire when daysRemaining <= 30
    const isEligible = r.isAutomated && daysRemaining <= r.triggerDaysBefore;
    return {
      reminder: r,
      daysRemaining,
      isEligible,
    };
  });
}

export function interpolateReminderTemplate(
  template: string,
  variables: {
    guestName?: string;
    eventTitle?: string;
    eventDate?: string;
    rsvpLink?: string;
    daysLeft?: number;
    location?: string;
  }
): string {
  let result = template;
  if (variables.guestName !== undefined) {
    result = result.replace(/\{\{\s*guest_name\s*\}\}/g, variables.guestName);
  }
  if (variables.eventTitle !== undefined) {
    result = result.replace(/\{\{\s*event_title\s*\}\}/g, variables.eventTitle);
  }
  if (variables.eventDate !== undefined) {
    result = result.replace(/\{\{\s*event_date\s*\}\}/g, variables.eventDate);
  }
  if (variables.rsvpLink !== undefined) {
    result = result.replace(/\{\{\s*rsvp_link\s*\}\}/g, variables.rsvpLink);
  }
  if (variables.daysLeft !== undefined) {
    result = result.replace(/\{\{\s*days_left\s*\}\}/g, String(variables.daysLeft));
  }
  if (variables.location !== undefined) {
    result = result.replace(/\{\{\s*location\s*\}\}/g, variables.location);
  }
  return result;
}
