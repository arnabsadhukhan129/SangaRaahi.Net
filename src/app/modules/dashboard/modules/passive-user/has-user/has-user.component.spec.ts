import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HasUserComponent } from './has-user.component';

describe('HasUserComponent', () => {
  let component: HasUserComponent;
  let fixture: ComponentFixture<HasUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HasUserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HasUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
