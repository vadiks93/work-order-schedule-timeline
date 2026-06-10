import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { WorkOrderPanelComponent } from '../work-order-panel/work-order-panel.component';
import { ChipComponent, ChipVariant } from '../../shared/chip/chip.component';
import { FloatingLabelComponent } from '../../shared/floating-label/floating-label.component';
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

type MenuDirection = 'left' | 'right';

@Component({
  selector: 'app-work-order-schedule',
  imports: [
    NgStyle,
    FormsModule,
    NgSelectModule,
    WorkOrderPanelComponent,
    ChipComponent,
    FloatingLabelComponent,
  ],
  templateUrl: './work-order-schedule.component.html',
  styleUrl: './work-order-schedule.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkOrderScheduleComponent implements AfterViewInit {
  private readonly menuWidth = 160;

  @ViewChild('timelineViewport')
  private timelineViewport?: ElementRef<HTMLDivElement>;

  protected readonly store = inject(ScheduleStore);
  protected readonly statusLabels = STATUS_LABELS;
  protected readonly timescaleOptions: TimescaleOption[] = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ];
  protected readonly timescale = signal<Timescale>('day');
  protected readonly openMenuId = signal<string | null>(null);
  protected readonly openMenuDirection = signal<MenuDirection>('left');
  protected readonly panelOpen = signal(false);
  protected readonly editingOrder = signal<WorkOrderDocument | null>(null);
  protected readonly initialWorkCenterId = signal('');
  protected readonly initialStartDate = signal('');
  protected readonly initialEndDate = signal('');
  protected readonly overlapError = signal(false);
  protected readonly hoverPreview = signal<HoverPreview | null>(null);
  protected readonly selectedWorkCenterId = signal<string | null>(null);
  private panelTrigger: HTMLElement | null = null;
  private menuTrigger: HTMLElement | null = null;

  protected readonly timeline = computed<TimelineConfig>(() =>
    this.createTimeline(this.timescale()),
  );
  protected readonly canvasWidth = computed(
    () => this.timeline().columns.length * this.timeline().columnWidth,
  );
  protected readonly currentPeriodLabel = computed(() => {
    const labels: Record<Timescale, string> = {
      day: 'Current day',
      week: 'Current week',
      month: 'Current month',
    };
    return labels[this.timescale()];
  });
  protected readonly currentPeriodPosition = computed(() =>
    this.positionForDate(this.currentPeriodStart()),
  );

  ngAfterViewInit(): void {
    this.scheduleCenterOnToday();
  }

  @HostListener('document:keydown.escape')
  protected handleEscape(): void {
    if (this.panelOpen()) {
      this.closePanel();
    } else if (this.openMenuId()) {
      this.closeMenuAndRestoreFocus();
    }
  }

  @HostListener('document:click')
  protected closeMenu(): void {
    this.openMenuId.set(null);
    this.menuTrigger = null;
  }

  protected setTimescale(value: Timescale | null): void {
    if (!value) {
      return;
    }
    this.timescale.set(value);
    this.hoverPreview.set(null);
    this.scheduleCenterOnToday();
  }

  protected ordersFor(workCenterId: string): WorkOrderDocument[] {
    return this.store.ordersFor(workCenterId).filter((order) => this.isOrderVisible(order));
  }

  protected orderStyle(order: WorkOrderDocument): Record<string, string> {
    const { left, width } = this.orderPosition(order);
    return {
      left: `${left}px`,
      width: `${width}px`,
    };
  }

  protected shouldShowTooltip(order: WorkOrderDocument): boolean {
    const { width } = this.orderPosition(order);
    return width < 150 || this.isNameLikelyClipped(order, width);
  }

  protected tooltipText(order: WorkOrderDocument): string {
    return `${order.data.name} - ${this.statusLabels[order.data.status]}`;
  }

  private isNameLikelyClipped(order: WorkOrderDocument, orderWidth: number): boolean {
    const statusWidth = this.statusLabels[order.data.status].length * 6 + 20;
    const reservedWidth = statusWidth + 21 + 14 + 8;
    const availableNameWidth = Math.max(0, orderWidth - reservedWidth);
    return order.data.name.length * 6.2 > availableNameWidth;
  }

  private orderPosition(order: WorkOrderDocument): { left: number; width: number } {
    const left = Math.max(0, this.positionForIso(order.data.startDate));
    const dayAfterEnd = new Date(`${order.data.endDate}T12:00:00`);
    dayAfterEnd.setDate(dayAfterEnd.getDate() + 1);
    const right = Math.min(this.canvasWidth(), this.positionForDate(dayAfterEnd));
    return {
      left,
      width: Math.max(1, right - left),
    };
  }

  protected createFromPointer(event: MouseEvent, workCenterId: string): void {
    if ((event.target as HTMLElement).closest('.work-order') || this.openMenuId()) {
      return;
    }
    const row = event.currentTarget as HTMLElement;
    const x = event.clientX - row.getBoundingClientRect().left;
    const start = this.dateAtPosition(x);
    const endDate = this.availableEndDate(workCenterId, start);
    if (endDate) {
      this.openCreate(workCenterId, start, endDate);
    }
  }

  protected updateHoverPreview(event: PointerEvent, workCenterId: string): void {
    if ((event.target as HTMLElement).closest('.work-order') || this.openMenuId()) {
      this.hoverPreview.set(null);
      return;
    }

    const row = event.currentTarget as HTMLElement;
    const x = event.clientX - row.getBoundingClientRect().left;
    const start = this.dateAtPosition(x);
    const startDate = this.toIso(start);
    const endDate = this.availableEndDate(workCenterId, start);

    if (!endDate) {
      this.hoverPreview.set(null);
      return;
    }

    const left = Math.max(0, this.positionForDate(start));
    const dayAfterEnd = this.addDays(new Date(`${endDate}T12:00:00`), 1);
    const right = Math.min(this.canvasWidth(), this.positionForDate(dayAfterEnd));

    this.hoverPreview.set({
      workCenterId,
      startDate,
      left,
      width: Math.max(1, right - left),
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
    const start = new Date();
    const endDate = this.availableEndDate(workCenterId, start);
    if (endDate) {
      this.openCreate(workCenterId, start, endDate);
    }
  }

  protected handleCreateButtonClick(event: MouseEvent, workCenterId: string): void {
    if (event.detail !== 0) {
      return;
    }

    event.stopPropagation();
    this.createFromKeyboard(workCenterId);
  }

  protected toggleMenu(event: MouseEvent, orderId: string): void {
    event.stopPropagation();
    this.hoverPreview.set(null);
    if (this.openMenuId() === orderId) {
      this.openMenuId.set(null);
      this.menuTrigger = null;
      return;
    }

    const button = event.currentTarget as HTMLElement;
    this.menuTrigger = button;
    const viewport = this.timelineViewport?.nativeElement;
    if (viewport) {
      const buttonRect = button.getBoundingClientRect();
      const viewportRect = viewport.getBoundingClientRect();
      this.openMenuDirection.set(
        viewportRect.right - buttonRect.left >= this.menuWidth ? 'right' : 'left',
      );
    }

    this.openMenuId.set(orderId);
    setTimeout(() => this.focusMenuItem(orderId, 0));
  }

  protected handleMenuKeydown(event: KeyboardEvent): void {
    const menu = event.currentTarget as HTMLElement;
    const items = Array.from(menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));
    const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      items[(currentIndex + 1) % items.length]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      items[(currentIndex - 1 + items.length) % items.length]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      items[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      items[items.length - 1]?.focus();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.closeMenuAndRestoreFocus();
    } else if (event.key === 'Tab') {
      event.preventDefault();
      this.closeMenuAndMoveFocus(event.shiftKey ? -1 : 1);
    }
  }

  protected edit(event: MouseEvent, order: WorkOrderDocument): void {
    event.stopPropagation();
    if (this.openMenuId() === order.docId && this.menuTrigger) {
      this.panelTrigger = this.menuTrigger;
    } else {
      this.rememberPanelTrigger();
    }
    this.editingOrder.set(order);
    this.selectedWorkCenterId.set(order.data.workCenterId);
    this.overlapError.set(false);
    this.panelOpen.set(true);
    this.openMenuId.set(null);
  }

  protected delete(event: MouseEvent, order: WorkOrderDocument): void {
    event.stopPropagation();
    const deletedWithKeyboard = event.detail === 0;
    const focusDestination = deletedWithKeyboard ? this.nextWorkOrderControl() : null;
    this.store.delete(order.docId);
    this.openMenuId.set(null);
    this.menuTrigger = null;
    if (deletedWithKeyboard) {
      setTimeout(() => (focusDestination ?? this.timelineViewport?.nativeElement)?.focus());
    }
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
    this.selectedWorkCenterId.set(null);
    setTimeout(() => {
      this.panelTrigger?.focus();
      this.panelTrigger = null;
    });
  }

  protected formatAccessibleDate(isoDate: string): string {
    return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(
      new Date(`${isoDate}T12:00:00`),
    );
  }

  protected statusChipVariant(status: WorkOrderDocument['data']['status']): ChipVariant {
    return status;
  }

  private openCreate(workCenterId: string, date: Date, endDate: string): void {
    this.rememberPanelTrigger();
    this.editingOrder.set(null);
    this.initialWorkCenterId.set(workCenterId);
    this.selectedWorkCenterId.set(workCenterId);
    this.initialStartDate.set(this.toIso(date));
    this.initialEndDate.set(endDate);
    this.overlapError.set(false);
    this.panelOpen.set(true);
  }

  private rememberPanelTrigger(): void {
    const activeElement = document.activeElement;
    this.panelTrigger = activeElement instanceof HTMLElement ? activeElement : null;
  }

  private focusMenuItem(orderId: string, index: number): void {
    const menu = document.getElementById(`menu-${orderId}`);
    menu?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')[index]?.focus();
  }

  private closeMenuAndRestoreFocus(): void {
    const trigger = this.menuTrigger;
    this.openMenuId.set(null);
    this.menuTrigger = null;
    setTimeout(() => trigger?.focus());
  }

  private closeMenuAndMoveFocus(direction: -1 | 1): void {
    const trigger = this.menuTrigger;
    const timeline = this.timelineViewport?.nativeElement;
    const controls = timeline
      ? Array.from(
          timeline.querySelectorAll<HTMLElement>(
            '.timeline__create-button, .work-order__menu-button',
          ),
        )
      : [];
    const triggerIndex = trigger ? controls.indexOf(trigger) : -1;
    const destination =
      direction === -1
        ? trigger
        : controls[triggerIndex + 1] ?? timeline;

    this.openMenuId.set(null);
    this.menuTrigger = null;
    setTimeout(() => destination?.focus());
  }

  private nextWorkOrderControl(): HTMLElement | null {
    const timeline = this.timelineViewport?.nativeElement;
    if (!timeline || !this.menuTrigger) {
      return null;
    }

    const controls = Array.from(
      timeline.querySelectorAll<HTMLElement>('.work-order__menu-button'),
    );
    const triggerIndex = controls.indexOf(this.menuTrigger);
    return triggerIndex >= 0 ? controls[triggerIndex + 1] ?? null : null;
  }

  private availableEndDate(workCenterId: string, start: Date): string | null {
    return this.store.availableEndDate(workCenterId, this.toIso(start));
  }

  private createTimeline(timescale: Timescale): TimelineConfig {
    const today = this.atNoon(new Date());

    if (timescale === 'day') {
      const start = this.addDays(today, -14);
      return {
        start,
        columnWidth: 72,
        columns: Array.from({ length: 29 }, (_, index) => {
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

    const start = new Date(today.getFullYear(), today.getMonth() - 6, 1, 12);
    return {
      start,
      columnWidth: 150,
      columns: Array.from({ length: 13 }, (_, index) => {
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

  private currentPeriodStart(): Date {
    const today = this.atNoon(new Date());

    if (this.timescale() === 'week') {
      return this.startOfWeek(today);
    }

    if (this.timescale() === 'month') {
      return new Date(today.getFullYear(), today.getMonth(), 1, 12);
    }

    return today;
  }

  private scheduleCenterOnToday(): void {
    setTimeout(() => this.centerOnToday());
  }

  private centerOnToday(): void {
    const viewport = this.timelineViewport?.nativeElement;
    if (!viewport || viewport.clientWidth === 0) {
      return;
    }

    const target = this.positionForDate(new Date()) - viewport.clientWidth / 2;
    const maximum = Math.max(0, this.canvasWidth() - viewport.clientWidth);
    viewport.scrollLeft = Math.min(Math.max(0, target), maximum);
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
