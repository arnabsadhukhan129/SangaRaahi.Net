import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';

import { SupplyManagementRoutingModule } from './supply-management-routing.module';
import { ListComponent } from './list/list.component';
import { CreateComponent } from './create/create.component';


@NgModule({
  declarations: [
    ListComponent,
    CreateComponent
  ],
  imports: [
    CommonModule,
    SupplyManagementRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class SupplyManagementModule { }
