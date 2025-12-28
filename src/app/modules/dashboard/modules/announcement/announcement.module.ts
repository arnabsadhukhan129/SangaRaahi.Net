import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';

import { AnnouncementRoutingModule } from './announcement-routing.module';
import { ListAnnouncementComponent } from './list/list.component';
import { ViewAnnouncementComponent } from './view/view.component';
import { CreateAnnouncementComponent } from './add/add.component';


@NgModule({
  declarations: [
    ListAnnouncementComponent,
    ViewAnnouncementComponent,
    CreateAnnouncementComponent
  ],
  imports: [
    CommonModule,
    AnnouncementRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class AnnouncementModule { }
