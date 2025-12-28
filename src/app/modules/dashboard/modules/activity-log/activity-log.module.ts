import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActivityLogRoutingModule } from './activity-log-routing.module';
import { LogComponent } from './log/log.component';
import { AppLogComponent } from './app-log/app-log.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    LogComponent,
    AppLogComponent
  ],
  imports: [
    CommonModule,
    ActivityLogRoutingModule,
    SharedModule
  ]
})
export class ActivityLogModule { }
