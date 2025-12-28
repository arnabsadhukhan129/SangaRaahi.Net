import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RedirctLinkComponent } from './redirct-link/redirct-link.component';

const routes: Routes = [
  {path:'redirect-link/:id',component:RedirctLinkComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentRoutingModule { }
