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

  it('returns the full default range when no later order blocks it', () => {
    store.workOrders.set([]);

    expect(store.availableEndDate('wc-genesis', '2030-01-01')).toBe('2030-01-08');
  });

  it('shortens the default range to the day before the next order', () => {
    store.workOrders.set([
      {
        docId: 'next-order',
        docType: 'workOrder',
        data: {
          name: 'Next order',
          workCenterId: 'wc-genesis',
          status: 'open',
          startDate: '2030-01-05',
          endDate: '2030-01-10',
        },
      },
    ]);

    expect(store.availableEndDate('wc-genesis', '2030-01-01')).toBe('2030-01-04');
  });

  it('returns no available range when the selected start date is occupied', () => {
    store.workOrders.set([
      {
        docId: 'occupied-order',
        docType: 'workOrder',
        data: {
          name: 'Occupied order',
          workCenterId: 'wc-genesis',
          status: 'open',
          startDate: '2030-01-02',
          endDate: '2030-01-06',
        },
      },
    ]);

    expect(store.availableEndDate('wc-genesis', '2030-01-04')).toBeNull();
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
