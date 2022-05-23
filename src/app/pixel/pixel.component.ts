import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pixel',
  templateUrl: './pixel.component.html',
  styleUrls: ['./pixel.component.css']
})
export class PixelComponent  {
  @Input() on = false;

}
