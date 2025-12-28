import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailTabComponent } from './mail-tab.component';

describe('MailTabComponent', () => {
  let component: MailTabComponent;
  let fixture: ComponentFixture<MailTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MailTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MailTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
