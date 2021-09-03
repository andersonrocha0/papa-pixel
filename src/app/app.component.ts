import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'papa-pixel';

  leftPosition = 0;
  innerWidth = 0;
  innerHeight = 0;

  ngOnInit(): void {
  }

}
