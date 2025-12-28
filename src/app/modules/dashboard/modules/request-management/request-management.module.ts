import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';

import { RequestManagementRoutingModule } from './request-management-routing.module';
import { ListComponent } from './list/list.component';


@NgModule({
  declarations: [
    ListComponent
  ],
  imports: [
    CommonModule,
    RequestManagementRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class RequestManagementModule { }
