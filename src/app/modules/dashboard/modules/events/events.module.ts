import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';

import { EventsRoutingModule } from './events-routing.module';
import { ListComponent } from './list/list.component';
import { ViewEventComponent } from './view/view.component';
import { CreateEventComponent } from './create/create.component';
import { TaskComponent } from './task/task.component';
import { TaskManagementListComponent } from './task-management-list/task-management-list.component';
import { PaymentHistoryListComponent } from './payment-history-list/payment-history-list.component';
import { ReminderComponent } from './reminder/reminder.component';
import { AddRsvpComponent } from './add-rsvp/add-rsvp.component';
import { DeepLinkComponent } from './deep-link/deep-link.component';
import { CornListComponent } from './corn-list/corn-list.component';
import { LogsViewComponent } from './logs-view/logs-view.component';


@NgModule({
  declarations: [
    ListComponent,
    ViewEventComponent,
    CreateEventComponent,
    TaskComponent,
    TaskManagementListComponent,
    PaymentHistoryListComponent,
    ReminderComponent,
    AddRsvpComponent,
    DeepLinkComponent,
    CornListComponent,
    LogsViewComponent,
  ],
  imports: [
    CommonModule,
    EventsRoutingModule,
    SharedModule,
    ReactiveFormsModule,
  ]
})
export class EventsModule { }
