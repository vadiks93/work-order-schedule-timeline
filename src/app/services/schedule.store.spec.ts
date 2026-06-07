import { TestBed } from '@angular/core/testing';
import { ScheduleStore } from './schedule.store';

describe('ScheduleStore', () => {
  let store: ScheduleStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(ScheduleStore);
  });

  it('detects an overlapping order in the same work center', () => {
    const existing = store.workOrders()[0];

    expect(
      store.hasOverlap({
        name: 'Overlapping order',
        workCenterId: existing.data.workCenterId,
        status: 'open',
        startDate: existing.data.startDate,
        endDate: existing.data.endDate,
      }),
    ).toBe(true);
  });

  it('allows the same dates in a different work center', () => {
    const existing = store.workOrders()[0];

    expect(
      store.hasOverlap({
        name: 'Independent order',
        workCenterId: 'wc-rodiques',
        status: 'open',
        startDate: existing.data.startDate,
        endDate: existing.data.endDate,
      }),
    ).toBe(false);
  });

  it('can create, update, and delete an order', () => {
    const initialCount = store.orderCount();
    const draft = {
      name: 'New order',
      workCenterId: 'wc-genesis',
      status: 'open' as const,
      startDate: '2030-01-01',
      endDate: '2030-01-04',
    };

    store.create(draft);
    const created = store.workOrders().at(-1)!;
    expect(store.orderCount()).toBe(initialCount + 1);

    store.update(created.docId, { ...draft, name: 'Updated order' });
    expect(store.workOrders().at(-1)?.data.name).toBe('Updated order');

    store.delete(created.docId);
    expect(store.orderCount()).toBe(initialCount);
  });
});
