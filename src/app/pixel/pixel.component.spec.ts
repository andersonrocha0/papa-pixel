import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PixelComponent } from './pixel.component';

describe('PixelComponent', () => {
  let component: PixelComponent;
  let fixture: ComponentFixture<PixelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PixelComponent ],
      imports: [ CommonModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PixelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose data-lane from the lane input', () => {
    expect(fixture.nativeElement.getAttribute('data-lane')).toBe('false');

    component.lane = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('data-lane')).toBe('true');
  });

  it('should keep the on class when the cell is also on the lane', () => {
    fixture.componentRef.setInput('on', true);
    fixture.componentRef.setInput('lane', true);
    fixture.detectChanges();

    const pixel: HTMLElement | null = fixture.nativeElement.querySelector('.pixel');
    expect(pixel?.classList.contains('on')).toBe(true);
    expect(pixel?.classList.contains('off')).toBe(false);
  });
});
