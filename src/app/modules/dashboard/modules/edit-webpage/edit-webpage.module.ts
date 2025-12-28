import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditWebpageRoutingModule } from './edit-webpage-routing.module';
import { HomeComponent } from './home/home.component';
import { AnnouncementComponent } from './announcement/announcement.component';
import { VideosComponent } from './videos/videos.component';
import { PaymentComponent } from './payment/payment.component';
import { AboutComponent } from './about/about.component';
import { WebpageComponent } from './webpage/webpage.component';
import { SharedModule } from 'src/app/shared/shared.module';
import {NgFor,NgIf} from '@angular/common';
import {
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
} from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    HomeComponent,
    AnnouncementComponent,
    PaymentComponent,
    AboutComponent,
    WebpageComponent,
    VideosComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EditWebpageRoutingModule,
    SharedModule,
    CdkDropList,
    CdkDrag,
    CdkDropListGroup,
    NgFor,
    NgIf
  ]
})
export class EditWebpageModule { }
