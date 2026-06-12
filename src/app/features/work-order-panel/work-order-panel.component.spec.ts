import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderPanelComponent } from './work-order-panel.component';

describe('WorkOrderPanelComponent', () => {
  let fixture: ComponentFixture<WorkOrderPanelComponent>;
  let component: WorkOrderPanelComponent;

  beforeEach(async () => {
    HTMLElement.prototype.scrollIntoView = vi.fn();

    await TestBed.configureTestingModule({
      imports: [WorkOrderPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkOrderPanelComponent);
    component = fixture.componentInstance;
    component.workCenters = [
      {
        docId: 'wc-genesis',
        docType: 'workCenter',
        data: { name: 'Genesis Welding' },
      },
    ];
    component.initialWorkCenterId = 'wc-genesis';
    component.initialStartDate = '2030-01-01';
    component.initialEndDate = '2030-01-07';
    fixture.detectChanges();
  });

  it('shows one range-length message under the end date for orders longer than two months', () => {
    component.form.patchValue({
      name: 'Long order',
      workCenterId: 'wc-genesis',
      status: 'open',
      startDate: { year: 2030, month: 1, day: 1 },
      endDate: { year: 2030, month: 3, day: 2 },
    });
    component.form.markAllAsTouched();
    fixture.detectChanges();

    const startError = fixture.nativeElement.querySelector('#start-date-error');
    const endError = fixture.nativeElement.querySelector('#date-range-error');
    const startInput = fixture.nativeElement.querySelector('#start-date');
    const endInput = fixture.nativeElement.querySelector('#end-date');

    expect(component.dateRangeTooLong).toBe(true);
    expect(startInput?.getAttribute('aria-invalid')).toBe('true');
    expect(endInput?.getAttribute('aria-invalid')).toBe('true');
    expect(startInput?.getAttribute('aria-describedby')).toBe('date-range-error');
    expect(endInput?.getAttribute('aria-describedby')).toBe('date-range-error');
    expect(startError).toBeNull();
    expect(endError?.textContent).toContain('Work orders cannot be longer than 2 months.');
  });

  it('shows one shared range-order message while marking and describing both date fields', () => {
    component.form.patchValue({
      name: 'Invalid range',
      workCenterId: 'wc-genesis',
      status: 'open',
      startDate: { year: 2030, month: 1, day: 10 },
      endDate: { year: 2030, month: 1, day: 1 },
    });
    component.form.markAllAsTouched();
    fixture.detectChanges();

    const startError = fixture.nativeElement.querySelector('#start-date-error');
    const endError = fixture.nativeElement.querySelector('#date-range-error');
    const startInput = fixture.nativeElement.querySelector('#start-date');
    const endInput = fixture.nativeElement.querySelector('#end-date');

    expect(component.dateRangeInvalid).toBe(true);
    expect(startInput?.getAttribute('aria-invalid')).toBe('true');
    expect(endInput?.getAttribute('aria-invalid')).toBe('true');
    expect(startInput?.getAttribute('aria-describedby')).toBe('date-range-error');
    expect(endInput?.getAttribute('aria-describedby')).toBe('date-range-error');
    expect(startError).toBeNull();
    expect(endError?.textContent).toContain('Start date must be on or before the end date.');
  });

  it('blocks submission for orders longer than two months', () => {
    const savedSpy = vi.spyOn(component.saved, 'emit');

    component.form.patchValue({
      name: 'Long order',
      workCenterId: 'wc-genesis',
      status: 'open',
      startDate: { year: 2030, month: 1, day: 1 },
      endDate: { year: 2030, month: 3, day: 2 },
    });

    component.submit();

    expect(savedSpy).not.toHaveBeenCalled();
  });

  it('blocks submission when the work order name exceeds 100 characters', () => {
    const savedSpy = vi.spyOn(component.saved, 'emit');

    component.form.patchValue({
      name: 'A'.repeat(101),
      workCenterId: 'wc-genesis',
      status: 'open',
      startDate: { year: 2030, month: 1, day: 1 },
      endDate: { year: 2030, month: 1, day: 7 },
    });
    component.form.controls.name.markAsDirty();
    fixture.detectChanges();

    let nameError = fixture.nativeElement.querySelector('#work-order-name-error');

    expect(nameError?.textContent).toContain('Work order name cannot exceed 100 characters.');

    component.submit();
    fixture.detectChanges();

    nameError = fixture.nativeElement.querySelector('#work-order-name-error');

    expect(savedSpy).not.toHaveBeenCalled();
    expect(nameError?.textContent).toContain('Work order name cannot exceed 100 characters.');
  });
});
