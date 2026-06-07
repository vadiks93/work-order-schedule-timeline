import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  STATUS_LABELS,
  WorkCenterDocument,
  WorkOrderDocument,
  WorkOrderDraft,
  WorkOrderStatus,
} from '../../models/schedule.models';

interface StatusOption {
  value: WorkOrderStatus;
  label: string;
}

@Component({
  selector: 'app-work-order-panel',
  imports: [ReactiveFormsModule, NgbDatepickerModule, NgSelectModule],
  templateUrl: './work-order-panel.component.html',
  styleUrl: './work-order-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkOrderPanelComponent implements OnChanges {
  @Input({ required: true }) workCenters: WorkCenterDocument[] = [];
  @Input() order: WorkOrderDocument | null = null;
  @Input() initialWorkCenterId = '';
  @Input() initialStartDate = '';
  @Input() overlapError = false;

  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly saved = new EventEmitter<WorkOrderDraft>();

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['order'] || changes['initialStartDate'] || changes['initialWorkCenterId']) {
      this.populateForm();
    }
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.dateRangeInvalid) {
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
    const endIso = this.order?.data.endDate || this.addDays(startIso, 7);

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
}
