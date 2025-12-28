import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassiveMemberViewComponent } from './passive-member-view.component';

describe('PassiveMemberViewComponent', () => {
  let component: PassiveMemberViewComponent;
  let fixture: ComponentFixture<PassiveMemberViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PassiveMemberViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PassiveMemberViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
