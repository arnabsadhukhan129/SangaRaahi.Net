import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PraticeComponent } from './pratice/pratice.component';

const routes: Routes = [
  {path:'',component: PraticeComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TestRoutingModule { }
