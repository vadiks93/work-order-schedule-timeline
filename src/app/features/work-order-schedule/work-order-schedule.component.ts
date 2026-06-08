import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { WorkOrderPanelComponent } from '../work-order-panel/work-order-panel.component';
import {
  STATUS_LABELS,
  TimelineColumn,
  Timescale,
  WorkOrderDocument,
  WorkOrderDraft,
} from '../../models/schedule.models';
import { ScheduleStore } from '../../services/schedule.store';

interface TimelineConfig {
  columns: TimelineColumn[];
  start: Date;
  columnWidth: number;
}

interface HoverPreview {
  workCenterId: string;
  startDate: string;
  left: number;
  width: number;
}

interface TimescaleOption {
  value: Timescale;
  label: string;
}

@Component({
  selector: 'app-work-order-schedule',
  imports: [NgStyle, FormsModule, NgSelectModule, WorkOrderPanelComponent],
  templateUrl: './work-order-schedule.component.html',
  styleUrl: './work-order-schedule.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkOrderScheduleComponent {
  protected readonly store = inject(ScheduleStore);
  protected readonly statusLabels = STATUS_LABELS;
  protected readonly timescaleOptions: TimescaleOption[] = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ];
  protected readonly timescale = signal<Timescale>('day');
  protected readonly openMenuId = signal<string | null>(null);
  protected readonly panelOpen = signal(false);
  protected readonly editingOrder = signal<WorkOrderDocument | null>(null);
  protected readonly initialWorkCenterId = signal('');
  protected readonly initialStartDate = signal('');
  protected readonly overlapError = signal(false);
  protected readonly hoverPreview = signal<HoverPreview | null>(null);

  protected readonly timeline = computed<TimelineConfig>(() =>
    this.createTimeline(this.timescale()),
  );
  protected readonly canvasWidth = computed(
    () => this.timeline().columns.length * this.timeline().columnWidth,
  );
  protected readonly todayPosition = computed(() => this.positionForDate(new Date()));

  @HostListener('document:keydown.escape')
  protected handleEscape(): void {
    if (this.panelOpen()) {
      this.closePanel();
    } else {
      this.openMenuId.set(null);
    }
  }

  @HostListener('document:click')
  protected closeMenu(): void {
    this.openMenuId.set(null);
  }

  protected setTimescale(value: Timescale | null): void {
    if (!value) {
      return;
    }
    this.timescale.set(value);
    this.hoverPreview.set(null);
  }

  protected ordersFor(workCenterId: string): WorkOrderDocument[] {
    return this.store.ordersFor(workCenterId).filter((order) => this.isOrderVisible(order));
  }

  protected orderStyle(order: WorkOrderDocument): Record<string, string> {
    const left = Math.max(0, this.positionForIso(order.data.startDate));
    const dayAfterEnd = new Date(`${order.data.endDate}T12:00:00`);
    dayAfterEnd.setDate(dayAfterEnd.getDate() + 1);
    const right = Math.min(this.canvasWidth(), this.positionForDate(dayAfterEnd));
    return {
      left: `${left}px`,
      width: `${Math.max(42, right - left)}px`,
    };
  }

  protected createFromPointer(event: MouseEvent, workCenterId: string): void {
    if ((event.target as HTMLElement).closest('.work-order')) {
      return;
    }
    const row = event.currentTarget as HTMLElement;
    const x = event.clientX - row.getBoundingClientRect().left;
    this.openCreate(workCenterId, this.dateAtPosition(x));
  }

  protected updateHoverPreview(event: PointerEvent, workCenterId: string): void {
    const row = event.currentTarget as HTMLElement;
    const x = event.clientX - row.getBoundingClientRect().left;
    const start = this.dateAtPosition(x);
    const end = this.addDays(start, 7);
    const startDate = this.toIso(start);
    const endDate = this.toIso(end);

    if (
      this.store.hasOverlap({
        name: '',
        workCenterId,
        status: 'open',
        startDate,
        endDate,
      })
    ) {
      this.hoverPreview.set(null);
      return;
    }

    const left = Math.max(0, this.positionForDate(start));
    const dayAfterEnd = this.addDays(end, 1);
    const right = Math.min(this.canvasWidth(), this.positionForDate(dayAfterEnd));

    this.hoverPreview.set({
      workCenterId,
      startDate,
      left,
      width: Math.max(42, right - left),
    });
  }

  protected clearHoverPreview(): void {
    this.hoverPreview.set(null);
  }

  protected previewStyle(preview: HoverPreview): Record<string, string> {
    return {
      left: `${preview.left}px`,
      width: `${preview.width}px`,
    };
  }

  protected createFromKeyboard(workCenterId: string): void {
    this.openCreate(workCenterId, new Date());
  }

  protected toggleMenu(event: MouseEvent, orderId: string): void {
    event.stopPropagation();
    this.openMenuId.update((current) => (current === orderId ? null : orderId));
  }

  protected edit(event: MouseEvent, order: WorkOrderDocument): void {
    event.stopPropagation();
    this.editingOrder.set(order);
    this.overlapError.set(false);
    this.panelOpen.set(true);
    this.openMenuId.set(null);
  }

  protected delete(event: MouseEvent, order: WorkOrderDocument): void {
    event.stopPropagation();
    this.store.delete(order.docId);
    this.openMenuId.set(null);
  }

  protected save(draft: WorkOrderDraft): void {
    const editingId = this.editingOrder()?.docId;
    if (this.store.hasOverlap(draft, editingId)) {
      this.overlapError.set(true);
      return;
    }

    if (editingId) {
      this.store.update(editingId, draft);
    } else {
      this.store.create(draft);
    }
    this.closePanel();
  }

  protected closePanel(): void {
    this.panelOpen.set(false);
    this.editingOrder.set(null);
    this.overlapError.set(false);
  }

  protected formatAccessibleDate(isoDate: string): string {
    return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(
      new Date(`${isoDate}T12:00:00`),
    );
  }

  private openCreate(workCenterId: string, date: Date): void {
    this.editingOrder.set(null);
    this.initialWorkCenterId.set(workCenterId);
    this.initialStartDate.set(this.toIso(date));
    this.overlapError.set(false);
    this.panelOpen.set(true);
  }

  private createTimeline(timescale: Timescale): TimelineConfig {
    const today = this.atNoon(new Date());

    if (timescale === 'day') {
      const start = this.addDays(today, -21);
      return {
        start,
        columnWidth: 72,
        columns: Array.from({ length: 43 }, (_, index) => {
          const date = this.addDays(start, index);
          return { date, label: this.format(date, 'day') };
        }),
      };
    }

    if (timescale === 'week') {
      const start = this.startOfWeek(this.addDays(today, -56));
      return {
        start,
        columnWidth: 124,
        columns: Array.from({ length: 17 }, (_, index) => {
          const date = this.addDays(start, index * 7);
          return { date, label: `Week of ${this.format(date, 'week')}` };
        }),
      };
    }

    const start = new Date(today.getFullYear(), today.getMonth() - 5, 1, 12);
    return {
      start,
      columnWidth: 150,
      columns: Array.from({ length: 12 }, (_, index) => {
        const date = new Date(start.getFullYear(), start.getMonth() + index, 1, 12);
        return { date, label: this.format(date, 'month') };
      }),
    };
  }

  private positionForIso(isoDate: string): number {
    return this.positionForDate(new Date(`${isoDate}T12:00:00`));
  }

  private positionForDate(date: Date): number {
    const { start, columnWidth } = this.timeline();
    if (this.timescale() === 'month') {
      const monthDelta =
        (date.getFullYear() - start.getFullYear()) * 12 + date.getMonth() - start.getMonth();
      const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      return (monthDelta + (date.getDate() - 1) / daysInMonth) * columnWidth;
    }

    const dayDelta = (this.atNoon(date).getTime() - start.getTime()) / 86_400_000;
    return (dayDelta / (this.timescale() === 'week' ? 7 : 1)) * columnWidth;
  }

  private dateAtPosition(position: number): Date {
    const { start, columnWidth } = this.timeline();
    const units = Math.max(0, position / columnWidth);

    if (this.timescale() === 'month') {
      const wholeMonths = Math.floor(units);
      const monthStart = new Date(
        start.getFullYear(),
        start.getMonth() + wholeMonths,
        1,
        12,
      );
      const daysInMonth = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth() + 1,
        0,
      ).getDate();
      return this.addDays(monthStart, Math.floor((units - wholeMonths) * daysInMonth));
    }

    return this.addDays(start, Math.floor(units * (this.timescale() === 'week' ? 7 : 1)));
  }

  private isOrderVisible(order: WorkOrderDocument): boolean {
    const start = this.positionForIso(order.data.startDate);
    const end = this.positionForIso(order.data.endDate);
    return end >= 0 && start <= this.canvasWidth();
  }

  private format(date: Date, scale: Timescale): string {
    if (scale === 'month') {
      return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date);
    }
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
  }

  private startOfWeek(date: Date): Date {
    const day = date.getDay() || 7;
    return this.addDays(date, 1 - day);
  }

  private addDays(date: Date, days: number): Date {
    const copy = this.atNoon(date);
    copy.setDate(copy.getDate() + days);
    return copy;
  }

  private atNoon(date: Date): Date {
    const copy = new Date(date);
    copy.setHours(12, 0, 0, 0);
    return copy;
  }

  private toIso(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
