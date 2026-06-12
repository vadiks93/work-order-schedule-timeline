import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  ViewEncapsulation,
} from '@angular/core';

export type FloatingLabelMode = 'always' | 'tooltip';
export type FloatingLabelAlign = 'center' | 'start';

@Component({
  selector: 'app-floating-label',
  templateUrl: './floating-label.component.html',
  styleUrl: './floating-label.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FloatingLabelComponent {
  @Input({ required: true }) label = '';
  @Input() mode: FloatingLabelMode = 'always';
  @Input() align: FloatingLabelAlign = 'center';

  @HostBinding('class.floating-label-host--start')
  get startAligned(): boolean {
    return this.align === 'start';
  }
}
