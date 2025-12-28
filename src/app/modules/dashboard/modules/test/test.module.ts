import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TestRoutingModule } from './test-routing.module';
import { PraticeComponent } from './pratice/pratice.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    PraticeComponent
  ],
  imports: [
    CommonModule,
    TestRoutingModule,
    SharedModule
  ]
})
export class TestModule { }
