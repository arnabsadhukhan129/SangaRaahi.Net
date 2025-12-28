import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CornListComponent } from './corn-list.component';

describe('CornListComponent', () => {
  let component: CornListComponent;
  let fixture: ComponentFixture<CornListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CornListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CornListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
