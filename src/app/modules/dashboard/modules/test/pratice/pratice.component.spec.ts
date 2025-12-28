import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PraticeComponent } from './pratice.component';

describe('PraticeComponent', () => {
  let component: PraticeComponent;
  let fixture: ComponentFixture<PraticeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PraticeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PraticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
