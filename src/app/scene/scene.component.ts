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
    { i: 0, j: 3 },
  ];

  snakeFood: Array<{i: number, j: number}> = [];

  moveDirection = Direction.Forward;
  speed = SceneSettings.initialSpeed;

  constructor() {
    this.resetOnOffController();
    this.paintSnakeFromPosition();
    this.addNewFood();
    this.paintSnakeFood();
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
  }

  paintSnakeFood() {
    for (const food of this.snakeFood) {
      if (this.snakeFood.length > 0) {
        this.onOffController[food.i][food.j] = true;
      }
    }


  }

  addNewFood() {
    this.snakeFood = [
        {
          i: Math.floor(Math.random() * SceneSettings.lines),
          j: Math.floor(Math.random() * SceneSettings.columns),
        }
      ];
  }

  pause() {
    this.isPaused = !this.isPaused;
  }

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (this.isPaused && event.key !== ' ') {
      return;
    }

    if (event.key === 'ArrowDown') {
      this.changeDirection(Direction.Down);
    } else if (event.key === 'ArrowRight') {
      this.changeDirection(Direction.Forward);
    } else if (event.key === 'ArrowLeft') {
      this.changeDirection(Direction.Backward);
    } else if (event.key === 'ArrowUp') {
      this.changeDirection(Direction.Up);
    } else if (event.key === ' ') {
      this.pause();
    }
  }

  changeUp() {
    this.changeDirection(Direction.Up);
  }

  changeDown() {
    this.changeDirection(Direction.Down);
  }

  changeForward() {
    this.changeDirection(Direction.Forward);
  }

  changeBackward() {
    this.changeDirection(Direction.Backward);
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
        } else if (this.moveDirection === Direction.Backward) {
          this.moveBackward();
        } else if (this.moveDirection === Direction.Up) {
          this.moveUp();
        }
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
        j: this.snakePosition[k + 1].j,
      });
    }

    const newI = head!.i;
    const newJ = head!.j == SceneSettings.columns - 1 ? 0 : head!.j + 1;

    nextPosition.push({
      i: newI,
      j: newJ,
    });

    if (this.snakeFood.length > 0 && newI == this.snakeFood[0].i && newJ == this.snakeFood[0].j) {
      nextPosition.push({
        i: this.snakeFood[0].i,
        j: this.snakeFood[0].j == SceneSettings.columns - 1 ? 0 : this.snakeFood[0].j + 1
      });
      this.addNewFood();
    }

    this.snakePosition = nextPosition;

    this.resetOnOffController();
    this.paintSnakeFromPosition();
    this.paintSnakeFood();
  }

  moveBackward() {
    const nextPosition: Array<{ i: number; j: number }> = [];

    const head = this.snakePosition.slice(-1).pop();
    const otherParts = this.snakePosition.slice(0, -1);

    for (let k = 0; k < otherParts.length; k++) {
      nextPosition.push({
        i: this.snakePosition[k + 1].i,
        j: this.snakePosition[k + 1].j,
      });
    }

    const newI = head!.i;
    const newJ = head!.j == 0 ? SceneSettings.columns - 1 : head!.j - 1;

    nextPosition.push({
      i: newI,
      j: newJ,
    });

    if (this.snakeFood.length > 0 && newI == this.snakeFood[0].i && newJ == this.snakeFood[0].j) {
      nextPosition.push({
        i: this.snakeFood[0].i,
        j: this.snakeFood[0].j == 0 ? SceneSettings.columns - 1 : this.snakeFood[0].j - 1
      });
      this.addNewFood();
    }

    this.snakePosition = nextPosition;


    this.resetOnOffController();
    this.paintSnakeFromPosition();
    this.paintSnakeFood();
  }

  moveDown() {
    const nextPosition: Array<{ i: number; j: number }> = [];

    const head = this.snakePosition.slice(-1).pop();
    const otherParts = this.snakePosition.slice(0, -1);

    for (let k = 0; k < otherParts.length; k++) {
      nextPosition.push({
        i: this.snakePosition[k + 1].i,
        j: this.snakePosition[k + 1].j,
      });
    }

    const newI = head!.i == SceneSettings.lines - 1 ? 0 : head!.i + 1;
    const newJ = head!.j;

    nextPosition.push({
      i: newI,
      j: newJ,
    });

    if (this.snakeFood.length > 0 && newI == this.snakeFood[0].i && newJ == this.snakeFood[0].j) {
      nextPosition.push({
        i: SceneSettings.lines - 1 ? 0 : this.snakeFood[0].i + 1,
        j: this.snakeFood[0].j
      });
      this.addNewFood();
    }

    this.snakePosition = nextPosition;

    this.resetOnOffController();
    this.paintSnakeFromPosition();
    this.paintSnakeFood();
  }

  moveUp() {
    const nextPosition: Array<{ i: number; j: number }> = [];

    const head = this.snakePosition.slice(-1).pop();
    const otherParts = this.snakePosition.slice(0, -1);

    for (let k = 0; k < otherParts.length; k++) {
      nextPosition.push({
        i: this.snakePosition[k + 1].i,
        j: this.snakePosition[k + 1].j,
      });
    }

    const newI = head!.i == 0 ? SceneSettings.lines - 1 : head!.i - 1;
    const newJ = head!.j;

    nextPosition.push({
      i: newI,
      j: newJ,
    });

    if (this.snakeFood.length > 0 && newI == this.snakeFood[0].i && newJ == this.snakeFood[0].j) {
      nextPosition.push({
        i: this.snakeFood[0].i == 0 ? SceneSettings.lines - 1 : this.snakeFood[0].i - 1,
        j: this.snakeFood[0].j
      });
      this.addNewFood();
    }

    this.snakePosition = nextPosition;

    this.resetOnOffController();
    this.paintSnakeFromPosition();
    this.paintSnakeFood();
  }
}

enum Direction {
  Up,
  Down,
  Forward,
  Backward,
}
