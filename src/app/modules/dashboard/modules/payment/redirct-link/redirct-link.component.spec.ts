import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedirctLinkComponent } from './redirct-link.component';

describe('RedirctLinkComponent', () => {
  let component: RedirctLinkComponent;
  let fixture: ComponentFixture<RedirctLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RedirctLinkComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RedirctLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
