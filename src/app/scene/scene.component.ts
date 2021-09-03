import { Component, HostListener, OnInit } from '@angular/core';
import { SceneSettings } from './scene.settings';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.css'],
})
export class SceneComponent implements OnInit {
  lines: Array<any> = Array(SceneSettings.lines).fill(null);
  columns: Array<any> = Array(SceneSettings.columns).fill(null);

  onOffController: Array<Array<boolean>> = [];
  onOffControllerSnapshots: Array<Array<Array<boolean>>> = [];
  isPaused = false;
  snakePosition = [
     { i: 0, j: 0 },
     { i: 0, j: 1 },
     { i: 0, j: 2 },
  ];

  moveDirection = Direction.Forward;
  speed = SceneSettings.initialSpeed;

  constructor() {
    console.log(this.snakePosition);
    this.resetOnOffController();
    this.paintSnakeFromPosition();
  }

  ngOnInit(): void {
    this.move();
  }

  resetOnOffController() {
    this.onOffController = [];
    for (let i = 0; i < this.lines.length; i++) {
      this.onOffController.push([]);
      for (let _ of this.columns) {
        this.onOffController[i].push(false);
      }
    }
  }

  paintSnakeFromPosition() {
    for (let position of this.snakePosition) {
      this.onOffController[position.i][position.j] = true;
    }

    this.takeOnOffControllerSnapshot();
  }

  takeOnOffControllerSnapshot() {
    const onOffControllerSnapshot: Array<Array<boolean>> = [];
    for (
      let lineIndex = 0;
      lineIndex < this.onOffController.length;
      lineIndex++
    ) {
      onOffControllerSnapshot.push([]);
      for (let columnJ of this.onOffController[lineIndex]) {
        onOffControllerSnapshot[lineIndex].push(columnJ);
      }
    }
    this.onOffControllerSnapshots.push(onOffControllerSnapshot);
  }

  pause() {
    this.isPaused = !this.isPaused;
  }

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (this.isPaused && event.key !== " ") {
      return;
    }


    if (event.key === "ArrowDown") {
      this.changeDirection(Direction.Down);
    } else if (event.key === "ArrowRight") {
      this.changeDirection(Direction.Forward);
    } else if (event.key === " ") {
      this.pause();
    }
  }

  changeDown() {
    this.changeDirection(Direction.Down);
  }

  changeForward() {
    this.changeDirection(Direction.Forward);
  }

  changeDirection(direction: Direction) {
    this.moveDirection = direction;
  }

  move() {
    setTimeout(() => {
      if (!this.isPaused) {
        if (this.moveDirection === Direction.Forward) {
          this.moveForward();
        } else if (this.moveDirection === Direction.Down) {
          this.moveDown();
        }
        ;
        this.takeOnOffControllerSnapshot();
      }
      this.move();
    }, this.speed);
  }

  moveForward() {
    const nextPosition: Array<{ i: number; j: number }> = [];

    const head = this.snakePosition.slice(-1).pop();
    const otherParts = this.snakePosition.slice(0, -1);

    for (let k = 0; k < otherParts.length; k++) {
      nextPosition.push({
        i: this.snakePosition[k + 1].i,
        j: this.snakePosition[k + 1].j
      });
    }

    nextPosition.push({
      i: head!.i,
      j: head!.j == SceneSettings.columns - 1 ? 0 : head!.j + 1,
    });

    this.snakePosition = nextPosition;

    console.log(this.snakePosition);

    this.resetOnOffController();
    this.paintSnakeFromPosition();
  }

  moveDown() {
    const nextPosition: Array<{ i: number; j: number }> = [];


    const head = this.snakePosition.slice(-1).pop();
    const otherParts = this.snakePosition.slice(0, -1);

    for (let k = 0; k < otherParts.length; k++) {
      nextPosition.push({
        i: this.snakePosition[k + 1].i,
        j: this.snakePosition[k + 1].j
      })
    }

    nextPosition.push({
      i: head!.i == SceneSettings.lines - 1 ? 0 : head!.i + 1,
      j: head!.j
    });

    this.snakePosition = nextPosition;
    console.log(this.snakePosition);

    this.resetOnOffController();
    this.paintSnakeFromPosition();
  }


}


enum Direction {
  Up,
  Down,
  Forward,
  Backward,
}
