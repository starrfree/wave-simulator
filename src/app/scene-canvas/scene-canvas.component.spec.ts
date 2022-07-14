import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SceneCanvasComponent } from './scene-canvas.component';

describe('SceneCanvasComponent', () => {
  let component: SceneCanvasComponent;
  let fixture: ComponentFixture<SceneCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SceneCanvasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SceneCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
