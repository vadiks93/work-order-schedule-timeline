import { TestBed } from '@angular/core/testing';
import { ScheduleApiService } from './schedule-api.service';

describe('ScheduleApiService', () => {
  let service: ScheduleApiService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScheduleApiService);
  });

  it('loads sample data and stores the initial snapshot', async () => {
    const snapshot = await service.load();
    const storedSnapshot = JSON.parse(localStorage.getItem('work-order-schedule-timeline')!);

    expect(snapshot.workCenters).toHaveLength(5);
    expect(snapshot.workOrders).toHaveLength(8);
    expect(storedSnapshot.workOrders).toHaveLength(8);
  });

  it('persists created work orders to localStorage', async () => {
    const order = {
      docId: 'test-order',
      docType: 'workOrder' as const,
      data: {
        name: 'Created from API',
        workCenterId: 'wc-genesis',
        status: 'open' as const,
        startDate: '2030-03-01',
        endDate: '2030-03-07',
      },
    };

    await service.createWorkOrder(order);

    const storedSnapshot = JSON.parse(localStorage.getItem('work-order-schedule-timeline')!);
    expect(storedSnapshot.workOrders.at(-1).data.name).toBe('Created from API');
  });
});
