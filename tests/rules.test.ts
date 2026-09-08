import { test } from 'node:test';
import assert from 'node:assert/strict';
import { expenseApprover, procurementRoute, noticeDays, terminationGaps, venueScore, rubricScore, ragStatus, daysBetween, canApprove, segregated } from '../src/lib/rules.ts';

test('expense approval thresholds', () => {
  assert.equal(expenseApprover(0), 'PM');
  assert.equal(expenseApprover(1000), 'PM');
  assert.equal(expenseApprover(1000.01), 'FM');
  assert.equal(expenseApprover(5000), 'FM');
  assert.equal(expenseApprover(5001), 'OD');
  assert.equal(expenseApprover(25000), 'OD');
  assert.equal(expenseApprover(25001), 'ED');
});

test('procurement routes', () => {
  assert.equal(procurementRoute(999).route, 'single-quote');
  assert.equal(procurementRoute(1000).route, 'three-quotes');
  assert.equal(procurementRoute(5000).minQuotes, 3);
  assert.deepEqual(procurementRoute(5001), { route: 'rfq-committee', minQuotes: 3, approver: 'OD', dueDiligence: true });
  assert.equal(procurementRoute(30000).approver, 'ED');
});

test('notice periods', () => {
  assert.equal(noticeDays('one-year'), 30);
  assert.equal(noticeDays('one-year', true), 7);
  assert.equal(noticeDays('month-to-month'), 15);
  assert.equal(noticeDays('consultant'), 7);
  assert.equal(noticeDays('daily'), 0);
});

test('termination evidence gaps', () => {
  assert.deepEqual(terminationGaps('non-performance', { pip_start_date: '2026-06-01', pip_review_1: true }), ['pip_review_2', 'pip_duration_days_gte_30']);
  assert.deepEqual(terminationGaps('end-of-funding', { funding_end_reference: 'x', entitlements_calculated: true, donor_notified_if_key_personnel: true }), []);
});

test('venue and rubric weighting', () => {
  assert.equal(venueScore({ security: 5, room: 5, cost: 5, accessibility: 5, catering: 5, terms: 5 }), 5);
  assert.equal(venueScore({ security: 4, room: 4, cost: 3, accessibility: 4, catering: 4, terms: 3 }), 3.7);
  assert.throws(() => venueScore({ security: 6 }));
  assert.equal(rubricScore({ experience: 4, technical: 3, language: 5, context: 4, interview: 3 }), 3.75);
});

test('rag, dates, roles', () => {
  assert.equal(ragStatus(0.95), 'G');
  assert.equal(ragStatus(0.6), 'A');
  assert.equal(ragStatus(0.1), 'R');
  assert.equal(ragStatus(null), '-');
  assert.equal(daysBetween('2026-09-08', '2026-09-30'), 22);
  assert.ok(canApprove('ED', 'OD'));
  assert.ok(!canApprove('PM', 'FM'));
  assert.ok(segregated('a@x.org', 'b@x.org'));
  assert.ok(!segregated('A@x.org', 'a@x.org'));
});
