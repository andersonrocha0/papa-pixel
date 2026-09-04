import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-pixel',
  templateUrl: './pixel.component.html',
  styleUrls: ['./pixel.component.css']
})
export class PixelComponent {
  @Input() on = false;
  @Input() row = 0;
  @Input() col = 0;
  @Input() role: 'empty' | 'snake' | 'food' = 'empty';

  @HostBinding('attr.data-row') get hostRow() {
    return this.row;
  }

  @HostBinding('attr.data-col') get hostCol() {
    return this.col;
  }

  @HostBinding('attr.data-lit') get hostLit() {
    return this.on ? 'true' : 'false';
  }

  @HostBinding('attr.data-role') get hostRole() {
    return this.role;
  }
}
