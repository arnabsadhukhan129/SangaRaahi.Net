import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRsvpComponent } from './add-rsvp.component';

describe('AddRsvpComponent', () => {
  let component: AddRsvpComponent;
  let fixture: ComponentFixture<AddRsvpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddRsvpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddRsvpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
