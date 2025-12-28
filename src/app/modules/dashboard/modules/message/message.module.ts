import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MessageRoutingModule } from './message-routing.module';
import { ListComponent } from './list/list.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    ListComponent
  ],
  imports: [
    CommonModule,
    MessageRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule
  ]
})
export class MessageModule { }
