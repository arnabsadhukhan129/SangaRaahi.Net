import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';

import { GroupRoutingModule } from './group-routing.module';
import { ListComponent } from './list/list.component';
import { AddGroupComponent } from './add/add.component';
import { ViewGroupComponent } from './view/view.component';



@NgModule({
  declarations: [
    ListComponent,
    AddGroupComponent,
    ViewGroupComponent
  ],
  imports: [
    CommonModule,
    GroupRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class GroupModule { }
