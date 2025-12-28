import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';

import { MemoryManagemntRoutingModule } from './memory-managemnt-routing.module';
import { EventMemoryComponent } from './event-memory/event-memory.component';


@NgModule({
  declarations: [
    EventMemoryComponent
  ],
  imports: [
    CommonModule,
    MemoryManagemntRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class MemoryManagemntModule { }
