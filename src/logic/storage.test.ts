import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateEventData,
  loadStoredEvents,
  saveStoredEvents,
  STORAGE_KEY_EVENTS,
} from './storage';
import { EventData } from '../types/event';

test('validateEventData correctly checks schema conformance', () => {
  const validEvent: Partial<EventData> = {
    id: 'e1',
    title: 'Test Wedding',
    type: 'wedding',
    date: '2026-11-20',
    totalBudget: 10000,
    expenses: [],
    timeline: [],
    guests: [],
    reminders: [],
  };

  assert.equal(validateEventData(validEvent), true);
  assert.equal(validateEventData(null), false);
  assert.equal(validateEventData({ id: 'e1' }), false);
  assert.equal(validateEventData({ ...validEvent, totalBudget: 'not a number' }), false);
  assert.equal(validateEventData({ ...validEvent, expenses: 'not an array' }), false);
});

test('storage gracefully handles non-browser environment without errors', () => {
  // In node environment, window is undefined
  const fallback: any = [{ id: 'f1', title: 'Fallback' }];
  const loaded = loadStoredEvents(fallback);
  assert.equal(loaded, fallback);

  const saved = saveStoredEvents(fallback);
  assert.equal(saved, false);
});
