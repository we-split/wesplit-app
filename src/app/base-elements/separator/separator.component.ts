import { Component, Input } from '@angular/core';

@Component({
  selector: 'separator',
  templateUrl: './separator.component.html',
  styleUrls: ['./separator.component.scss'],
  standalone: true,
})
export class SeparatorComponent {
  @Input() position = '';
}
