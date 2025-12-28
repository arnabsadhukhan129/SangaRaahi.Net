import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventMemoryComponent } from './event-memory.component';

describe('EventMemoryComponent', () => {
  let component: EventMemoryComponent;
  let fixture: ComponentFixture<EventMemoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventMemoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventMemoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
