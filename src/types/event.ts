export type EventType = 'wedding' | 'birthday' | 'community' | 'corporate' | 'festival';

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  activeNow?: boolean;
  currentSection?: string;
}

export type ExpenseCategory =
  | 'venue'
  | 'catering'
  | 'photography'
  | 'entertainment'
  | 'decor'
  | 'permits'
  | 'marketing'
  | 'attire'
  | 'logistics'
  | 'other';

export type PaymentStatus = 'paid' | 'partial' | 'pending' | 'overdue';

export interface ExpenseItem {
  id: string;
  category: ExpenseCategory;
  name: string;
  vendor: string;
  estimatedCost: number;
  actualCost: number;
  paidAmount: number;
  dueDate: string; // ISO date YYYY-MM-DD
  status: PaymentStatus;
  notes?: string;
  contractSigned?: boolean;
  contactPhone?: string;
  contactEmail?: string;
}

export type TimelinePhase = 'setup' | 'ceremony' | 'reception' | 'entertainment' | 'teardown' | 'general';

export interface TimelineItem {
  id: string;
  time: string; // "14:00"
  durationMin: number;
  phase: TimelinePhase;
  title: string;
  description: string;
  leadPerson: string;
  location: string;
  isCompleted: boolean;
}

export type RsvpStatus = 'confirmed' | 'declined' | 'pending';

export type DietaryRequirement =
  | 'none'
  | 'vegetarian'
  | 'vegan'
  | 'gluten_free'
  | 'halal'
  | 'kosher'
  | 'nut_allergy'
  | 'dairy_free'
  | 'other';

export interface GuestItem {
  id: string;
  name: string;
  email: string;
  rsvpStatus: RsvpStatus;
  plusOnes: number;
  dietary: DietaryRequirement[];
  dietaryNotes?: string;
  tableNumber?: string;
  reminderSent?: boolean;
  reminderSentAt?: string;
  checkedIn?: boolean;
}

export type ReminderAudience = 'all' | 'pending_rsvp' | 'confirmed' | 'vendors';

export interface EmailReminder {
  id: string;
  name: string;
  triggerDaysBefore: number; // e.g. 30, 14, 3, or -1 (post-event)
  subject: string;
  bodyTemplate: string;
  targetAudience: ReminderAudience;
  isAutomated: boolean;
  lastRunAt?: string;
  sentCount: number;
}

export interface SharedNote {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'ideas' | 'vendor_notes' | 'contingency';
  updatedBy: string;
  updatedAt: string;
}

export interface AiIdea {
  id: string;
  category: 'theme' | 'decor' | 'entertainment' | 'budget_tip' | 'schedule' | 'speech' | 'contingency';
  title: string;
  description: string;
  tags: string[];
  applied?: boolean;
}

export interface ActivityEvent {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  tag: 'budget' | 'rsvp' | 'timeline' | 'ai' | 'collab';
}

export interface EventData {
  id: string;
  title: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  location: string;
  totalBudget: number;
  currency: string;
  vibe: string;
  description: string;
  collaborators: Collaborator[];
  expenses: ExpenseItem[];
  timeline: TimelineItem[];
  guests: GuestItem[];
  reminders: EmailReminder[];
  notes: SharedNote[];
  aiIdeas: AiIdea[];
  activityLog: ActivityEvent[];
}
