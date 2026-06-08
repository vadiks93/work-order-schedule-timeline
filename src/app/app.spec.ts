import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Work Orders');
    expect(compiled.querySelectorAll('.timeline__work-center')).toHaveLength(5);
  });

  it('should default the control and timeline to the day timescale', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const timescale = compiled.querySelector('.timescale__select .ng-value-label');

    expect(timescale?.textContent?.trim()).toBe('Day');
    expect(compiled.querySelectorAll('.timeline__column-heading')).toHaveLength(43);
  });
});
