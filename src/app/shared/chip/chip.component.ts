import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type ChipVariant = 'current' | 'open' | 'in-progress' | 'complete' | 'blocked';
export type ChipSize = 'compact' | 'timeline';

@Component({
  selector: 'app-chip',
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipComponent {
  @Input({ required: true }) label = '';
  @Input() variant: ChipVariant = 'open';
  @Input() size: ChipSize = 'compact';
}
