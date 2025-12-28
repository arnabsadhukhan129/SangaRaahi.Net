import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskManagementListComponent } from './task-management-list.component';

describe('TaskManagementListComponent', () => {
  let component: TaskManagementListComponent;
  let fixture: ComponentFixture<TaskManagementListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskManagementListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskManagementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
