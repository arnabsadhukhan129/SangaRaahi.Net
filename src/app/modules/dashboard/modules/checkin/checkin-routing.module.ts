import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { CheckinPaymentComponent } from './checkin-payment/checkin-payment.component';

const routes: Routes = [
  {path:'', component: ListComponent},
  {path:'checkin-payment/:eventId', component: CheckinPaymentComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CheckinRoutingModule { }
