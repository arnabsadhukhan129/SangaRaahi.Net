import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPassiveMemberComponent } from './edit-passive-member.component';

describe('EditPassiveMemberComponent', () => {
  let component: EditPassiveMemberComponent;
  let fixture: ComponentFixture<EditPassiveMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditPassiveMemberComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPassiveMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
