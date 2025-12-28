import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventMemoryComponent } from './event-memory/event-memory.component';

const routes: Routes = [
  {path:'event-memory-list/:id', component:EventMemoryComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MemoryManagemntRoutingModule { }
