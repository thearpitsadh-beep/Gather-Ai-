import { EventData } from '../types/event';
import { INITIAL_EVENTS } from '../data/mockEvents';

export const STORAGE_KEY_EVENTS = 'gatherwise_events_v1';
export const STORAGE_KEY_ACTIVE_EVENT_ID = 'gatherwise_active_event_id';
export const STORAGE_KEY_ACTIVE_TAB = 'gatherwise_active_tab';

export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  try {
    const testKey = '__gatherwise_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function validateEventData(data: any): data is EventData {
  return Boolean(
    data &&
      typeof data === 'object' &&
      typeof data.id === 'string' &&
      typeof data.title === 'string' &&
      typeof data.type === 'string' &&
      typeof data.date === 'string' &&
      typeof data.totalBudget === 'number' &&
      Array.isArray(data.expenses) &&
      Array.isArray(data.timeline) &&
      Array.isArray(data.guests) &&
      Array.isArray(data.reminders)
  );
}

export function loadStoredEvents(fallback: EventData[] = INITIAL_EVENTS): EventData[] {
  if (!isStorageAvailable()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_EVENTS);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(validateEventData)) {
      return parsed;
    }
    return fallback;
  } catch (err) {
    console.warn('[GatherWise Storage] Failed to parse stored events, using defaults:', err);
    return fallback;
  }
}

export function saveStoredEvents(events: EventData[]): boolean {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
    return true;
  } catch (err) {
    console.error('[GatherWise Storage] Failed to persist events:', err);
    return false;
  }
}

export function loadActiveEventId(fallbackId: string): string {
  if (!isStorageAvailable()) return fallbackId;
  try {
    const id = window.localStorage.getItem(STORAGE_KEY_ACTIVE_EVENT_ID);
    return id && id.trim().length > 0 ? id : fallbackId;
  } catch {
    return fallbackId;
  }
}

export function saveActiveEventId(id: string): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY_ACTIVE_EVENT_ID, id);
  } catch {
    // Ignore storage write issues
  }
}

export function loadActiveTab(fallbackTab: string = 'overview'): string {
  if (!isStorageAvailable()) return fallbackTab;
  try {
    const tab = window.localStorage.getItem(STORAGE_KEY_ACTIVE_TAB);
    return tab && tab.trim().length > 0 ? tab : fallbackTab;
  } catch {
    return fallbackTab;
  }
}

export function saveActiveTab(tab: string): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY_ACTIVE_TAB, tab);
  } catch {
    // Ignore storage write issues
  }
}
