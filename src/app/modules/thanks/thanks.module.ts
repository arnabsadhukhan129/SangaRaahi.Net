import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ThanksRoutingModule } from './thanks-routing.module';
import { ThankYouComponent } from './components/thank-you/thank-you.component';


@NgModule({
  declarations: [
    ThankYouComponent
  ],
  imports: [
    CommonModule,
    ThanksRoutingModule
  ]
})
export class ThanksModule { }
