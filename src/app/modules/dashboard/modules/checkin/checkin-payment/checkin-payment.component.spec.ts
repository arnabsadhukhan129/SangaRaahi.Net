import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckinPaymentComponent } from './checkin-payment.component';

describe('CheckinPaymentComponent', () => {
  let component: CheckinPaymentComponent;
  let fixture: ComponentFixture<CheckinPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckinPaymentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckinPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
