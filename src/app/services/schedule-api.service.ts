import { Injectable } from '@angular/core';
import { SAMPLE_WORK_CENTERS, SAMPLE_WORK_ORDERS } from '../data/sample-data';
import { WorkCenterDocument, WorkOrderDocument } from '../models/schedule.models';

export interface ScheduleSnapshot {
  workCenters: WorkCenterDocument[];
  workOrders: WorkOrderDocument[];
}

const STORAGE_KEY = 'work-order-schedule-timeline';

@Injectable({ providedIn: 'root' })
export class ScheduleApiService {
  async load(): Promise<ScheduleSnapshot> {
    return this.withMockLatency(() => this.readSnapshot());
  }

  async createWorkOrder(order: WorkOrderDocument): Promise<WorkOrderDocument> {
    return this.withMockLatency(() => {
      const snapshot = this.readSnapshot();
      this.writeSnapshot({
        ...snapshot,
        workOrders: [...snapshot.workOrders, order],
      });
      return order;
    });
  }

  async updateWorkOrder(order: WorkOrderDocument): Promise<WorkOrderDocument> {
    return this.withMockLatency(() => {
      const snapshot = this.readSnapshot();
      this.writeSnapshot({
        ...snapshot,
        workOrders: snapshot.workOrders.map((current) =>
          current.docId === order.docId ? order : current,
        ),
      });
      return order;
    });
  }

  async deleteWorkOrder(orderId: string): Promise<void> {
    return this.withMockLatency(() => {
      const snapshot = this.readSnapshot();
      this.writeSnapshot({
        ...snapshot,
        workOrders: snapshot.workOrders.filter((order) => order.docId !== orderId),
      });
    });
  }

  async clearWorkOrders(): Promise<void> {
    return this.withMockLatency(() => {
      const snapshot = this.readSnapshot();
      this.writeSnapshot({
        ...snapshot,
        workOrders: [],
      });
    });
  }

  private readSnapshot(): ScheduleSnapshot {
    const storedSnapshot = this.readStoredSnapshot();
    if (storedSnapshot) {
      return storedSnapshot;
    }

    const snapshot = this.cloneSnapshot({
      workCenters: SAMPLE_WORK_CENTERS,
      workOrders: SAMPLE_WORK_ORDERS,
    });
    this.writeSnapshot(snapshot);
    return snapshot;
  }

  private readStoredSnapshot(): ScheduleSnapshot | null {
    try {
      const rawSnapshot = localStorage.getItem(STORAGE_KEY);
      return rawSnapshot ? (JSON.parse(rawSnapshot) as ScheduleSnapshot) : null;
    } catch {
      return null;
    }
  }

  private writeSnapshot(snapshot: ScheduleSnapshot): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // Local storage can be unavailable in private browsing or constrained test environments.
    }
  }

  private cloneSnapshot(snapshot: ScheduleSnapshot): ScheduleSnapshot {
    return {
      workCenters: snapshot.workCenters.map((center) => ({ ...center, data: { ...center.data } })),
      workOrders: snapshot.workOrders.map((order) => ({ ...order, data: { ...order.data } })),
    };
  }

  private async withMockLatency<T>(operation: () => T): Promise<T> {
    await Promise.resolve();
    return operation();
  }
}
