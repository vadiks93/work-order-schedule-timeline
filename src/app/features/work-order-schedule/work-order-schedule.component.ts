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
  endDate: string;
  left: number;
  width: number;
}

interface TimescaleOption {
  value: Timescale;
  label: string;
}

interface TimelineExtension {
  before: number;
  after: number;
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
  private readonly createPreviewWidth = 100;
  private readonly menuWidth = 160;
  private readonly expandDelay = 1000;
  private readonly expandThreshold = 180;

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
  private readonly timelineExtension = signal<TimelineExtension>({ before: 0, after: 0 });
  private panelTrigger: HTMLElement | null = null;
  private menuTrigger: HTMLElement | null = null;
  private focusCreatedOrderAction = false;
  private expandTimer: ReturnType<typeof setTimeout> | null = null;
  private afterExpand: (() => void) | null = null;

  protected readonly timeline = computed<TimelineConfig>(() =>
    this.createTimeline(this.timescale(), this.timelineExtension()),
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
    this.resetTimelineExpansion();
    this.scheduleCenterOnToday();
  }

  protected clearWorkOrders(): void {
    this.hoverPreview.set(null);
    this.openMenuId.set(null);
    this.menuTrigger = null;
    this.selectedWorkCenterId.set(null);
    this.store.clearWorkOrders();
  }

  protected scrollToCurrentDate(): void {
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

  protected isTinyOrder(order: WorkOrderDocument): boolean {
    return this.orderPosition(order).width < 36;
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
    const frame = this.previewVisualFrame(workCenterId, start, left);

    this.hoverPreview.set({
      workCenterId,
      startDate,
      endDate,
      left: frame.left,
      width: frame.width,
    });
  }

  protected clearHoverPreview(): void {
    this.hoverPreview.set(null);
  }

  protected handleTimelineScroll(): void {
    const viewport = this.timelineViewport?.nativeElement;
    if (!viewport || viewport.scrollWidth <= viewport.clientWidth) {
      return;
    }

    if (viewport.scrollLeft <= this.expandThreshold) {
      this.queueTimelineExpansion(-1);
    } else if (viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - this.expandThreshold) {
      this.queueTimelineExpansion(1);
    }
  }

  protected previewStyle(preview: HoverPreview): Record<string, string> {
    return {
      left: `${this.clampedPreviewLeft(preview)}px`,
      width: `${preview.width}px`,
    };
  }

  protected createFromKeyboard(workCenterId: string): void {
    const start = new Date();
    const endDate = this.availableEndDate(workCenterId, start);
    if (endDate) {
      this.openCreate(workCenterId, start, endDate, true);
    }
  }

  protected handleCreateButtonClick(event: MouseEvent, workCenterId: string): void {
    if (event.detail !== 0) {
      return;
    }

    event.stopPropagation();
    const preview = this.hoverPreview();
    if (preview?.workCenterId === workCenterId) {
      this.openCreate(
        workCenterId,
        new Date(`${preview.startDate}T12:00:00`),
        preview.endDate,
        true,
      );
      return;
    }

    this.createFromKeyboard(workCenterId);
  }

  protected handleCreateButtonKeydown(event: KeyboardEvent, workCenterId: string): void {
    if (event.key === 'Tab' && this.hoverPreview()?.workCenterId === workCenterId) {
      this.moveFocusFromKeyboardPreview(event, workCenterId);
      return;
    }

    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.openMenuId.set(null);

    if (event.key === 'ArrowRight') {
      this.moveKeyboardPreview(workCenterId, 1);
    } else if (event.key === 'ArrowLeft') {
      this.moveKeyboardPreview(workCenterId, -1);
    } else {
      this.moveKeyboardPreviewToRow(workCenterId, event.key === 'ArrowDown' ? 1 : -1);
    }
  }

  protected handleWorkOrderActionKeydown(
    event: KeyboardEvent,
    order: WorkOrderDocument,
  ): void {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.openMenuId.set(null);
    this.menuTrigger = null;

    if (event.key === 'ArrowRight') {
      this.focusCreateButtonByWorkCenterId(order.data.workCenterId);
      this.applyKeyboardPreview(
        order.data.workCenterId,
        this.addDays(new Date(`${order.data.endDate}T12:00:00`), 1),
        1,
      );
      return;
    }

    if (event.key === 'ArrowLeft') {
      this.focusCreateButtonByWorkCenterId(order.data.workCenterId);
      this.applyKeyboardPreview(
        order.data.workCenterId,
        this.addDays(new Date(`${order.data.startDate}T12:00:00`), -1),
        -1,
      );
      return;
    }

    this.movePreviewFromOrderToRow(order, event.key === 'ArrowDown' ? 1 : -1);
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
      const createdOrder = this.store.create(draft);
      if (this.focusCreatedOrderAction) {
        this.hoverPreview.set(null);
        this.focusCreatedOrderAction = false;
        this.closePanel(false);
        setTimeout(() => this.focusWorkOrderAction(createdOrder.docId));
        return;
      }
    }
    this.closePanel();
  }

  protected closePanel(restoreFocus = true): void {
    this.panelOpen.set(false);
    this.editingOrder.set(null);
    this.overlapError.set(false);
    this.selectedWorkCenterId.set(null);
    this.hoverPreview.set(null);
    this.focusCreatedOrderAction = false;
    if (!restoreFocus) {
      this.panelTrigger = null;
      return;
    }
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

  private openCreate(
    workCenterId: string,
    date: Date,
    endDate: string,
    focusCreatedAction = false,
  ): void {
    this.rememberPanelTrigger();
    this.editingOrder.set(null);
    this.initialWorkCenterId.set(workCenterId);
    this.selectedWorkCenterId.set(workCenterId);
    this.initialStartDate.set(this.toIso(date));
    this.initialEndDate.set(endDate);
    this.overlapError.set(false);
    this.focusCreatedOrderAction = focusCreatedAction;
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

  private moveFocusFromKeyboardPreview(
    event: KeyboardEvent,
    workCenterId: string,
  ): void {
    event.preventDefault();
    event.stopPropagation();

    const preview = this.hoverPreview();
    if (!preview) {
      return;
    }

    const destination = event.shiftKey
      ? this.previousOrderAction(preview) ?? this.adjacentCreateButton(workCenterId, -1)
      : this.nextOrderAction(preview) ?? this.adjacentCreateButton(workCenterId, 1);

    this.hoverPreview.set(null);
    setTimeout(() => (destination ?? this.timelineViewport?.nativeElement)?.focus());
  }

  private previousOrderAction(preview: HoverPreview): HTMLElement | null {
    const previewStart = new Date(`${preview.startDate}T12:00:00`);
    const previousOrder = this.store
      .ordersFor(preview.workCenterId)
      .filter((order) => new Date(`${order.data.endDate}T12:00:00`) < previewStart)
      .sort(
        (first, second) =>
          new Date(`${second.data.endDate}T12:00:00`).getTime() -
          new Date(`${first.data.endDate}T12:00:00`).getTime(),
      )[0];

    return previousOrder ? this.workOrderAction(previousOrder.docId) : null;
  }

  private nextOrderAction(preview: HoverPreview): HTMLElement | null {
    const previewEnd = new Date(`${preview.endDate}T12:00:00`);
    const nextOrder = this.store
      .ordersFor(preview.workCenterId)
      .filter((order) => new Date(`${order.data.startDate}T12:00:00`) > previewEnd)
      .sort(
        (first, second) =>
          new Date(`${first.data.startDate}T12:00:00`).getTime() -
          new Date(`${second.data.startDate}T12:00:00`).getTime(),
      )[0];

    return nextOrder ? this.workOrderAction(nextOrder.docId) : null;
  }

  private adjacentCreateButton(workCenterId: string, direction: -1 | 1): HTMLElement | null {
    const currentIndex = this.store
      .workCenters()
      .findIndex((center) => center.docId === workCenterId);

    return this.createButtonAt(currentIndex + direction);
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

  private moveKeyboardPreview(workCenterId: string, direction: -1 | 1): void {
    const current = this.hoverPreview();
    const start =
      current?.workCenterId === workCenterId
        ? this.addDays(new Date(`${current.startDate}T12:00:00`), direction)
        : this.initialKeyboardPreviewDate(direction);

    this.applyKeyboardPreview(workCenterId, start, direction);
  }

  private moveKeyboardPreviewToRow(
    workCenterId: string,
    direction: -1 | 1,
    preserveDate = true,
  ): void {
    const workCenters = this.store.workCenters();
    const currentIndex = workCenters.findIndex((center) => center.docId === workCenterId);
    const nextCenter = workCenters[currentIndex + direction];

    if (!nextCenter) {
      return;
    }

    this.focusCreateButton(currentIndex + direction);

    const current = this.hoverPreview();
    const start =
      preserveDate && current?.workCenterId === workCenterId
        ? new Date(`${current.startDate}T12:00:00`)
        : this.initialKeyboardPreviewDate(direction);

    this.applyKeyboardPreview(nextCenter.docId, start, direction);
  }

  private applyKeyboardPreview(workCenterId: string, start: Date, direction: -1 | 1): void {
    if (this.isOutsideTimeline(start, direction)) {
      this.queueTimelineExpansion(direction, () =>
        this.applyKeyboardPreview(workCenterId, start, direction),
      );
      return;
    }

    const preview = this.createPreview(workCenterId, start, direction);
    if (!preview) {
      this.moveKeyboardPreviewToRow(workCenterId, direction, false);
      return;
    }

    this.hoverPreview.set(preview);
    this.scrollPreviewIntoView(preview);
  }

  private createPreview(
    workCenterId: string,
    start: Date,
    direction: -1 | 1,
  ): HoverPreview | null {
    const availableStart = this.firstAvailableStart(workCenterId, start, direction);
    if (!availableStart) {
      return null;
    }

    const endDate = this.availableEndDate(workCenterId, availableStart);
    if (!endDate) {
      return null;
    }

    const left = Math.max(0, this.positionForDate(availableStart));
    const frame = this.previewVisualFrame(workCenterId, availableStart, left);

    return {
      workCenterId,
      startDate: this.toIso(availableStart),
      endDate,
      left: frame.left,
      width: frame.width,
    };
  }

  private firstAvailableStart(
    workCenterId: string,
    start: Date,
    direction: -1 | 1,
  ): Date | null {
    const canvasEnd = this.dateAtPosition(this.canvasWidth());
    let candidate = this.clampDateToCanvas(start);

    while (candidate >= this.timeline().start && candidate <= canvasEnd) {
      if (this.availableEndDate(workCenterId, candidate)) {
        return candidate;
      }

      candidate = this.addDays(candidate, direction);
    }

    return null;
  }

  private initialKeyboardPreviewDate(direction: -1 | 1): Date {
    const viewport = this.timelineViewport?.nativeElement;
    if (!viewport) {
      return direction === 1 ? this.timeline().start : this.dateAtPosition(this.canvasWidth());
    }

    const horizontalOffset = direction === 1
      ? viewport.scrollLeft
      : viewport.scrollLeft + viewport.clientWidth;
    return this.addDays(this.dateAtPosition(horizontalOffset), direction * 7);
  }

  private scrollPreviewIntoView(preview: HoverPreview): void {
    const viewport = this.timelineViewport?.nativeElement;
    if (!viewport) {
      return;
    }

    const previewRight = preview.left + preview.width;
    const viewportRight = viewport.scrollLeft + viewport.clientWidth;

    if (preview.left < viewport.scrollLeft) {
      viewport.scrollLeft = preview.left;
    } else if (previewRight > viewportRight) {
      viewport.scrollLeft = previewRight - viewport.clientWidth;
    }
  }

  private focusCreateButton(index: number): void {
    setTimeout(() => this.createButtonAt(index)?.focus());
  }

  private focusCreateButtonByWorkCenterId(workCenterId: string): void {
    const index = this.store
      .workCenters()
      .findIndex((center) => center.docId === workCenterId);

    this.focusCreateButton(index);
  }

  private createButtonAt(index: number): HTMLElement | null {
    const buttons = this.timelineViewport?.nativeElement.querySelectorAll<HTMLElement>(
      '.timeline__create-button',
    );
    return buttons?.[index] ?? null;
  }

  private focusWorkOrderAction(orderId: string): void {
    this.workOrderAction(orderId)?.focus();
  }

  private workOrderAction(orderId: string): HTMLElement | null {
    return (
      this.timelineViewport?.nativeElement.querySelector<HTMLElement>(
        `[data-order-id="${orderId}"]`,
      ) ?? null
    );
  }

  private movePreviewFromOrderToRow(order: WorkOrderDocument, direction: -1 | 1): void {
    const workCenters = this.store.workCenters();
    const currentIndex = workCenters.findIndex(
      (center) => center.docId === order.data.workCenterId,
    );
    const nextCenter = workCenters[currentIndex + direction];

    if (!nextCenter) {
      return;
    }

    this.focusCreateButton(currentIndex + direction);
    this.applyKeyboardPreview(
      nextCenter.docId,
      new Date(`${order.data.startDate}T12:00:00`),
      1,
    );
  }

  private clampDateToCanvas(date: Date): Date {
    const canvasEnd = this.dateAtPosition(this.canvasWidth());
    if (date < this.timeline().start) {
      return this.timeline().start;
    }

    if (date > canvasEnd) {
      return canvasEnd;
    }

    return this.atNoon(date);
  }

  private isOutsideTimeline(date: Date, direction: -1 | 1): boolean {
    const position = this.positionForDate(date);
    return direction === -1 ? position < 0 : position >= this.canvasWidth();
  }

  private queueTimelineExpansion(direction: -1 | 1, afterExpand?: () => void): void {
    this.afterExpand = afterExpand ?? null;
    if (this.expandTimer) {
      return;
    }

    this.expandTimer = setTimeout(() => {
      this.expandTimer = null;
      this.expandTimeline(direction);
      const action = this.afterExpand;
      this.afterExpand = null;
      if (action) {
        setTimeout(action);
      }
    }, this.expandDelay);
  }

  private expandTimeline(direction: -1 | 1): void {
    const viewport = this.timelineViewport?.nativeElement;
    const addedColumns = this.expansionColumnCount();
    const addedWidth = addedColumns * this.timeline().columnWidth;

    this.timelineExtension.update((extension) =>
      direction === -1
        ? { ...extension, before: extension.before + addedColumns }
        : { ...extension, after: extension.after + addedColumns },
    );

    if (direction === -1 && viewport) {
      setTimeout(() => {
        viewport.scrollLeft += addedWidth;
      });
    }
  }

  private expansionColumnCount(): number {
    const columnsByScale: Record<Timescale, number> = {
      day: 14,
      week: 4,
      month: 3,
    };
    return columnsByScale[this.timescale()];
  }

  private resetTimelineExpansion(): void {
    if (this.expandTimer) {
      clearTimeout(this.expandTimer);
      this.expandTimer = null;
    }
    this.afterExpand = null;
    this.timelineExtension.set({ before: 0, after: 0 });
  }

  private clampedPreviewLeft(preview: HoverPreview): number {
    return Math.max(0, Math.min(preview.left, this.canvasWidth() - preview.width));
  }

  private previewVisualFrame(
    workCenterId: string,
    start: Date,
    desiredLeft: number,
  ): { left: number; width: number } {
    const bounds = this.availableSlotBounds(workCenterId, start);
    const slotWidth = Math.max(1, bounds.end - bounds.start);
    const width = Math.min(this.createPreviewWidth, slotWidth);
    const left = Math.min(Math.max(desiredLeft, bounds.start), bounds.end - width);

    return { left, width };
  }

  private availableSlotBounds(workCenterId: string, start: Date): { start: number; end: number } {
    return this.store.ordersFor(workCenterId).reduce(
      (bounds, order) => {
        const orderStart = new Date(`${order.data.startDate}T12:00:00`);
        const orderEnd = this.addDays(new Date(`${order.data.endDate}T12:00:00`), 1);

        if (orderEnd <= start) {
          return {
            ...bounds,
            start: Math.max(bounds.start, this.positionForDate(orderEnd)),
          };
        }

        if (orderStart > start) {
          return {
            ...bounds,
            end: Math.min(bounds.end, this.positionForDate(orderStart)),
          };
        }

        return bounds;
      },
      { start: 0, end: this.canvasWidth() },
    );
  }

  private createTimeline(timescale: Timescale, extension: TimelineExtension): TimelineConfig {
    const today = this.atNoon(new Date());

    if (timescale === 'day') {
      const start = this.addDays(today, -14 - extension.before);
      return {
        start,
        columnWidth: 72,
        columns: Array.from({ length: 29 + extension.before + extension.after }, (_, index) => {
          const date = this.addDays(start, index);
          return { date, label: this.format(date, 'day') };
        }),
      };
    }

    if (timescale === 'week') {
      const start = this.startOfWeek(this.addDays(today, -56 - extension.before * 7));
      return {
        start,
        columnWidth: 124,
        columns: Array.from({ length: 17 + extension.before + extension.after }, (_, index) => {
          const date = this.addDays(start, index * 7);
          return { date, label: `Week of ${this.format(date, 'week')}` };
        }),
      };
    }

    const start = new Date(today.getFullYear(), today.getMonth() - 6 - extension.before, 1, 12);
    return {
      start,
      columnWidth: 150,
      columns: Array.from({ length: 13 + extension.before + extension.after }, (_, index) => {
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
