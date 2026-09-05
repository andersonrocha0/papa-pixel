import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PixelComponent } from '../pixel/pixel.component';
import { Direction, SceneComponent } from './scene.component';
import { SceneSettings } from './scene.settings';

describe('SceneComponent', () => {
  let component: SceneComponent;
  let fixture: ComponentFixture<SceneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SceneComponent, PixelComponent ],
      imports: [ CommonModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SceneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not collide or lose when changing direction rapidly to Down then Backward before tick', () => {
    spyOn(window, 'alert');
    // Rapid input within the same tick
    component.changeDirection(Direction.Down);
    component.changeDirection(Direction.Backward);

    expect(component.moveDirection).toBe(Direction.Backward);
    expect(component.moveDirectionOld).toBe(Direction.Forward);

    // Execute moveBackward
    component.moveBackward();

    // Verify reverse occurred safely and alert was not called
    expect(window.alert).not.toHaveBeenCalled();
    // After reverse, head is at (0, 0) and tail at (0, 3)
    expect(component.snakePosition[component.snakePosition.length - 1]).toEqual({ i: 0, j: 0 });
  });

  it('should respect last key when pressing Down then Forward as error correction', () => {
    component.changeDirection(Direction.Down);
    component.changeDirection(Direction.Forward);

    expect(component.moveDirection).toBe(Direction.Forward);
    expect(component.moveDirectionOld).toBe(Direction.Forward);

    component.moveForward();

    // Snake moved forward, new head at (0, 4)
    expect(component.snakePosition[component.snakePosition.length - 1]).toEqual({ i: 0, j: 4 });
  });

  it('should reset original snake position and direction on restart', () => {
    component.changeDirection(Direction.Down);
    component.start();

    expect(component.moveDirection).toBe(Direction.Forward);
    expect(component.moveDirectionOld).toBe(Direction.Forward);
    expect(component.snakePosition.length).toBe(4);
    expect(component.snakePosition[component.snakePosition.length - 1]).toEqual({ i: 0, j: 3 });
  });

  it('should reduce speed to 190 after one simulated growth', () => {
    component.snakeFood = [{ i: 0, j: 4 }];
    const lengthBefore = component.snakePosition.length;

    component.moveForward();
    expect(component.snakePosition.length).toBe(lengthBefore + 1);

    component.applySpeedFromLength();
    expect(component.speed).toBe(190);
  });

  it('should restore initial speed when start() is called after a faster pace', () => {
    component.speed = 150;
    component.start();
    expect(component.speed).toBe(SceneSettings.initialSpeed);
  });

  it('should render the speed indicator at level 1 and 200ms on start', () => {
    const hud: HTMLElement | null = fixture.nativeElement.querySelector(
      '[data-testid="speed-indicator"]'
    );
    expect(hud).toBeTruthy();
    expect(hud?.getAttribute('data-speed')).toBe('1');
    expect(hud?.getAttribute('data-interval-ms')).toBe('200');
    expect(hud?.textContent).toContain('Speed: 1');
  });

  it('should highlight the opening row after start', () => {
    expect(component.activeLane).toEqual({ axis: 'row', index: 0 });

    const grid: HTMLElement | null = fixture.nativeElement.querySelector(
      '[data-testid="game-grid"]'
    );
    expect(grid?.getAttribute('data-lane-axis')).toBe('row');
    expect(grid?.getAttribute('data-lane-index')).toBe('0');
  });

  it('should switch to the head column after an applied Down move', () => {
    component.pause();
    component.changeDirection(Direction.Down);
    component.moveDown();
    component.moveDirectionOld = component.moveDirection;
    fixture.detectChanges();

    const head = component.snakePosition[component.snakePosition.length - 1];
    expect(component.activeLane).toEqual({ axis: 'col', index: head.j });

    const grid: HTMLElement | null = fixture.nativeElement.querySelector(
      '[data-testid="game-grid"]'
    );
    expect(grid?.getAttribute('data-lane-axis')).toBe('col');
    expect(grid?.getAttribute('data-lane-index')).toBe(String(head.j));
  });

  it('should keep the row axis when a turn is only queued', () => {
    component.changeDirection(Direction.Up);
    expect(component.moveDirection).toBe(Direction.Up);
    expect(component.activeLane).toEqual({ axis: 'row', index: 0 });
  });

  it('should keep the column lane while paused after a vertical move', () => {
    component.changeDirection(Direction.Down);
    component.moveDown();
    component.moveDirectionOld = component.moveDirection;
    const laneAfterTurn = { ...component.activeLane };

    component.pause();
    expect(component.activeLane).toEqual(laneAfterTurn);
  });

  it('should follow the wrapped head column after a vertical wrap', () => {
    component.pause();
    component.snakePosition = [
      { i: 16, j: 5 },
      { i: 17, j: 5 },
      { i: 18, j: 5 },
      { i: 19, j: 5 },
    ];
    component.moveDirection = Direction.Down;
    component.moveDirectionOld = Direction.Down;
    component.moveDown();
    component.moveDirectionOld = component.moveDirection;

    const head = component.snakePosition[component.snakePosition.length - 1];
    expect(head).toEqual({ i: 0, j: 5 });
    expect(component.activeLane).toEqual({ axis: 'col', index: 5 });
  });

  it('should restore the opening row lane when start() follows a vertical trip', () => {
    component.changeDirection(Direction.Down);
    component.moveDown();
    component.moveDirectionOld = component.moveDirection;
    expect(component.activeLane.axis).toBe('col');

    component.start();
    fixture.detectChanges();

    expect(component.activeLane).toEqual({ axis: 'row', index: 0 });
    const grid: HTMLElement | null = fixture.nativeElement.querySelector(
      '[data-testid="game-grid"]'
    );
    expect(grid?.getAttribute('data-lane-axis')).toBe('row');
    expect(grid?.getAttribute('data-lane-index')).toBe('0');
  });

  it('should keep speed at 50ms and level 16 after extra growth past the cap', () => {
    component.pause();
    component.snakePosition = Array.from({ length: 19 }, (_, index) => ({
      i: 0,
      j: index,
    }));
    component.applySpeedFromLength();

    expect(component.speed).toBe(50);
    expect(component.speedLevel).toBe(16);

    component.snakePosition = [
      ...component.snakePosition,
      { i: 0, j: 19 },
    ];
    component.applySpeedFromLength();

    expect(component.speed).toBe(50);
    expect(component.speedLevel).toBe(16);
  });
});
