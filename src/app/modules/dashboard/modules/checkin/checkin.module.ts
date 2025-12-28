import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';

import { CheckinRoutingModule } from './checkin-routing.module';
import { ListComponent } from './list/list.component';
import { CheckinPaymentComponent } from './checkin-payment/checkin-payment.component';


@NgModule({
  declarations: [
    ListComponent,
    CheckinPaymentComponent
  ],
  imports: [
    CommonModule,
    CheckinRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class CheckinModule { }
