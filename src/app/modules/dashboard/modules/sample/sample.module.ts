import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';

import { SampleRoutingModule } from './sample-routing.module';
import { TestComponent } from './test/test.component';


@NgModule({
  declarations: [
    TestComponent
  ],
  imports: [
    CommonModule,
    SampleRoutingModule,
    SharedModule,
    ReactiveFormsModule,
  ]
})
export class SampleModule { }
