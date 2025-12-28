import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentRoutingModule } from './payment-routing.module';
import { RedirctLinkComponent } from './redirct-link/redirct-link.component';


@NgModule({
  declarations: [
    RedirctLinkComponent
  ],
  imports: [
    CommonModule,
    PaymentRoutingModule
  ]
})
export class PaymentModule { }
