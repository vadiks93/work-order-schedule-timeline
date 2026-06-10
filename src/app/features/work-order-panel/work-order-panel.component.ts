import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  NgbDateParserFormatter,
  NgbDatepickerModule,
  NgbDateStruct,
} from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  STATUS_LABELS,
  WorkCenterDocument,
  WorkOrderDocument,
  WorkOrderDraft,
  WorkOrderStatus,
} from '../../models/schedule.models';
import { ChipComponent, ChipVariant } from '../../shared/chip/chip.component';
import { DotDateParserFormatter } from '../../shared/date-format/dot-date-parser-formatter';

interface StatusOption {
  value: WorkOrderStatus;
  label: string;
}

@Component({
  selector: 'app-work-order-panel',
  imports: [ReactiveFormsModule, NgbDatepickerModule, NgSelectModule, ChipComponent],
  providers: [
    {
      provide: NgbDateParserFormatter,
      useClass: DotDateParserFormatter,
    },
  ],
  templateUrl: './work-order-panel.component.html',
  styleUrl: './work-order-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkOrderPanelComponent implements OnChanges, AfterViewInit {
  @Input({ required: true }) workCenters: WorkCenterDocument[] = [];
  @Input() order: WorkOrderDocument | null = null;
  @Input() initialWorkCenterId = '';
  @Input() initialStartDate = '';
  @Input() initialEndDate = '';
  @Input() overlapError = false;

  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly saved = new EventEmitter<WorkOrderDraft>();

  @ViewChild('workOrderName') workOrderNameRef?: ElementRef<HTMLInputElement>;

  private readonly hostElement: HTMLElement;

  constructor(elementRef: ElementRef<HTMLElement>) {
    this.hostElement = elementRef.nativeElement;
  }

  readonly statusOptions: StatusOption[] = (
    Object.entries(STATUS_LABELS) as [WorkOrderStatus, string][]
  ).map(([value, label]) => ({ value, label }));

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    workCenterId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    status: new FormControl<WorkOrderStatus>('open', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    startDate: new FormControl<NgbDateStruct | null>(null, Validators.required),
    endDate: new FormControl<NgbDateStruct | null>(null, Validators.required),
  });

  get isEditing(): boolean {
    return this.order !== null;
  }

  get dateRangeInvalid(): boolean {
    const start = this.form.controls.startDate.value;
    const end = this.form.controls.endDate.value;
    return !!start && !!end && this.toIso(end) < this.toIso(start);
  }

  get nameErrorVisible(): boolean {
    return this.form.controls.name.invalid && this.form.controls.name.touched;
  }

  get startDateErrorVisible(): boolean {
    return this.form.controls.startDate.invalid && this.form.controls.startDate.touched;
  }

  get endDateErrorVisible(): boolean {
    return (
      this.dateRangeInvalid ||
      (this.form.controls.endDate.invalid && this.form.controls.endDate.touched)
    );
  }

  protected statusChipVariant(status: WorkOrderStatus): ChipVariant {
    return status;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['order'] ||
      changes['initialStartDate'] ||
      changes['initialEndDate'] ||
      changes['initialWorkCenterId']
    ) {
      this.populateForm();
    }
  }

  ngAfterViewInit(): void {
    this.workOrderNameRef?.nativeElement?.focus();
  }

  @HostListener('keydown', ['$event'])
  protected keepFocusInDialog(event: KeyboardEvent): void {
    if (event.key !== 'Tab') {
      return;
    }

    const focusableElements = this.getFocusableElements();
    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey && activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.dateRangeInvalid) {
      setTimeout(() => this.focusFirstInvalidControl());
      return;
    }

    const value = this.form.getRawValue();
    this.saved.emit({
      name: value.name.trim(),
      workCenterId: value.workCenterId,
      status: value.status,
      startDate: this.toIso(value.startDate!),
      endDate: this.toIso(value.endDate!),
    });
  }

  private populateForm(): void {
    const startIso = this.order?.data.startDate || this.initialStartDate;
    const endIso = this.order?.data.endDate || this.initialEndDate || this.addDays(startIso, 7);

    this.form.reset({
      name: this.order?.data.name ?? '',
      workCenterId: this.order?.data.workCenterId ?? this.initialWorkCenterId,
      status: this.order?.data.status ?? 'open',
      startDate: this.fromIso(startIso),
      endDate: this.fromIso(endIso),
    });
  }

  private fromIso(isoDate: string): NgbDateStruct | null {
    if (!isoDate) {
      return null;
    }
    const [year, month, day] = isoDate.split('-').map(Number);
    return { year, month, day };
  }

  private toIso(date: NgbDateStruct): string {
    return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
  }

  private addDays(isoDate: string, days: number): string {
    const date = isoDate ? new Date(`${isoDate}T12:00:00`) : new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }

  private focusFirstInvalidControl(): void {
    const controlIds = [
      { control: this.form.controls.name, id: 'work-order-name' },
      { control: this.form.controls.workCenterId, id: 'work-center' },
      { control: this.form.controls.status, id: 'work-order-status' },
      { control: this.form.controls.startDate, id: 'start-date' },
      { control: this.form.controls.endDate, id: 'end-date', invalid: this.dateRangeInvalid },
    ];

    const firstInvalid = controlIds.find(
      ({ control, invalid }) => control.invalid || invalid,
    );

    if (!firstInvalid) {
      return;
    }

    const target = this.hostElement.querySelector<HTMLElement>(`#${firstInvalid.id}`);
    target?.scrollIntoView({ block: 'center' });
    target?.focus();
  }

  private getFocusableElements(): HTMLElement[] {
    const selector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    return Array.from(this.hostElement.querySelectorAll<HTMLElement>(selector)).filter(
      (element) => element.getClientRects().length > 0 && element.getAttribute('aria-hidden') !== 'true',
    );
  }
}
