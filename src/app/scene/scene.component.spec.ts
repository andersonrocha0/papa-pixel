import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PixelComponent } from '../pixel/pixel.component';
import { Direction, SceneComponent } from './scene.component';
import { SceneSettings } from './scene.settings';

describe('SceneComponent', () => {
  let component: SceneComponent;
  let fixture: ComponentFixture<SceneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SceneComponent, PixelComponent ]
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

  it('should keep speed at 100ms and level 11 after extra growth past the cap', () => {
    component.pause();
    component.snakePosition = Array.from({ length: 14 }, (_, index) => ({
      i: 0,
      j: index,
    }));
    component.applySpeedFromLength();

    expect(component.speed).toBe(100);
    expect(component.speedLevel).toBe(11);

    component.snakePosition = [
      ...component.snakePosition,
      { i: 0, j: 14 },
    ];
    component.applySpeedFromLength();

    expect(component.speed).toBe(100);
    expect(component.speedLevel).toBe(11);
  });
});
