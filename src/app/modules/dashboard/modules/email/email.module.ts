import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';

import { EmailRoutingModule } from './email-routing.module';
import { CreateComponent } from './create/create.component';
import { ListComponent } from './list/list.component';
import { MailTabComponent } from './mail-tab/mail-tab.component';
import { MailingListComponent } from './mailing-list/mailing-list.component';

@NgModule({
  declarations: [
    CreateComponent,
    ListComponent,
    MailTabComponent,
    MailingListComponent
  ],
  imports: [
    CommonModule,
    EmailRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class EmailModule { }
