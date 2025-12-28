import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeepLinkComponent } from './deep-link.component';

describe('DeepLinkComponent', () => {
  let component: DeepLinkComponent;
  let fixture: ComponentFixture<DeepLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeepLinkComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeepLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
