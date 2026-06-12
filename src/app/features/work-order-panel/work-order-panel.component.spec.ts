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

  it('shows one range-length error under the end date for orders longer than two months', () => {
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
    const endError = fixture.nativeElement.querySelector('#end-date-error');

    expect(component.dateRangeTooLong).toBe(true);
    expect(startError).toBeNull();
    expect(endError?.textContent).toContain('Work orders cannot be longer than 2 months.');
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
});
