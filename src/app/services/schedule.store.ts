import { Injectable, computed, signal } from '@angular/core';
import { SAMPLE_WORK_CENTERS, SAMPLE_WORK_ORDERS } from '../data/sample-data';
import { WorkOrderDocument, WorkOrderDraft } from '../models/schedule.models';

@Injectable({ providedIn: 'root' })
export class ScheduleStore {
  readonly workCenters = signal(SAMPLE_WORK_CENTERS);
  readonly workOrders = signal(SAMPLE_WORK_ORDERS);
  readonly orderCount = computed(() => this.workOrders().length);

  ordersFor(workCenterId: string): WorkOrderDocument[] {
    return this.workOrders().filter((order) => order.data.workCenterId === workCenterId);
  }

  hasOverlap(draft: WorkOrderDraft, excludedId?: string): boolean {
    const start = this.toUtcDay(draft.startDate);
    const end = this.toUtcDay(draft.endDate);

    return this.workOrders().some((order) => {
      if (order.docId === excludedId || order.data.workCenterId !== draft.workCenterId) {
        return false;
      }

      const existingStart = this.toUtcDay(order.data.startDate);
      const existingEnd = this.toUtcDay(order.data.endDate);
      return start <= existingEnd && end >= existingStart;
    });
  }

  create(draft: WorkOrderDraft): void {
    const order: WorkOrderDocument = {
      docId: crypto.randomUUID(),
      docType: 'workOrder',
      data: draft,
    };
    this.workOrders.update((orders) => [...orders, order]);
  }

  update(docId: string, draft: WorkOrderDraft): void {
    this.workOrders.update((orders) =>
      orders.map((order) => (order.docId === docId ? { ...order, data: draft } : order)),
    );
  }

  delete(docId: string): void {
    this.workOrders.update((orders) => orders.filter((order) => order.docId !== docId));
  }

  private toUtcDay(isoDate: string): number {
    return Date.parse(`${isoDate}T00:00:00Z`);
  }
}
