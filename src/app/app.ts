import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppFooterComponent } from './layout/app-footer/app-footer.component';
import { AppHeaderComponent } from './layout/app-header/app-header.component';
import { WorkOrderScheduleComponent } from './features/work-order-schedule/work-order-schedule.component';

@Component({
  selector: 'app-root',
  imports: [AppHeaderComponent, WorkOrderScheduleComponent, AppFooterComponent],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
