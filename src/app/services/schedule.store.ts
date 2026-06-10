import { Injectable, computed, inject, signal } from '@angular/core';
import { SAMPLE_WORK_CENTERS, SAMPLE_WORK_ORDERS } from '../data/sample-data';
import { WorkOrderDocument, WorkOrderDraft } from '../models/schedule.models';
import { ScheduleApiService } from './schedule-api.service';

@Injectable({ providedIn: 'root' })
export class ScheduleStore {
  private readonly api = inject(ScheduleApiService);

  readonly workCenters = signal(SAMPLE_WORK_CENTERS);
  readonly workOrders = signal(SAMPLE_WORK_ORDERS);
  readonly orderCount = computed(() => this.workOrders().length);

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    const snapshot = await this.api.load();
    this.workCenters.set(snapshot.workCenters);
    this.workOrders.set(snapshot.workOrders);
  }

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

  availableEndDate(
    workCenterId: string,
    startDate: string,
    maximumDaysAfterStart = 7,
  ): string | null {
    const start = this.toUtcDay(startDate);
    const maximumEnd = start + maximumDaysAfterStart * 86_400_000;
    const orders = this.ordersFor(workCenterId);

    if (
      orders.some((order) => {
        const existingStart = this.toUtcDay(order.data.startDate);
        const existingEnd = this.toUtcDay(order.data.endDate);
        return start >= existingStart && start <= existingEnd;
      })
    ) {
      return null;
    }

    const nextStart = orders
      .map((order) => this.toUtcDay(order.data.startDate))
      .filter((existingStart) => existingStart > start)
      .sort((first, second) => first - second)[0];
    const availableEnd = nextStart
      ? Math.min(maximumEnd, nextStart - 86_400_000)
      : maximumEnd;

    return new Date(availableEnd).toISOString().slice(0, 10);
  }

  create(draft: WorkOrderDraft): void {
    const order: WorkOrderDocument = {
      docId: crypto.randomUUID(),
      docType: 'workOrder',
      data: draft,
    };
    this.workOrders.update((orders) => [...orders, order]);
    void this.api.createWorkOrder(order);
  }

  update(docId: string, draft: WorkOrderDraft): void {
    const updatedOrder = this.workOrders().find((order) => order.docId === docId);
    if (!updatedOrder) {
      return;
    }
    const nextOrder: WorkOrderDocument = { ...updatedOrder, data: draft };
    this.workOrders.update((orders) =>
      orders.map((order) => (order.docId === docId ? nextOrder : order)),
    );
    void this.api.updateWorkOrder(nextOrder);
  }

  delete(docId: string): void {
    this.workOrders.update((orders) => orders.filter((order) => order.docId !== docId));
    void this.api.deleteWorkOrder(docId);
  }

  private toUtcDay(isoDate: string): number {
    return Date.parse(`${isoDate}T00:00:00Z`);
  }
}
