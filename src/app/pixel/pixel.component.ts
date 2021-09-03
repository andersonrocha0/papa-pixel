import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-pixel',
  templateUrl: './pixel.component.html',
  styleUrls: ['./pixel.component.css']
})
export class PixelComponent implements OnInit {
  @Input() on = false;

  constructor() { }

  ngOnInit(): void {
  }

}
