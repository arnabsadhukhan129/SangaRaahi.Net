import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WebpageComponent } from './webpage/webpage.component';
import { HomeComponent } from './home/home.component';
import { AnnouncementComponent } from './announcement/announcement.component';
import { VideosComponent } from './videos/videos.component';
import { PaymentComponent } from './payment/payment.component';
import { AboutComponent } from './about/about.component';

const routes: Routes = [
    {path:'', component:WebpageComponent,children : [
    {path:'', component:WebpageComponent},
    {path:'home', component:HomeComponent},
    {path:'announcement', component:AnnouncementComponent},
    {path:'video', component:VideosComponent},
    {path:'payment-details', component:PaymentComponent},
    {path:'about-us', component:AboutComponent}
  ]},
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EditWebpageRoutingModule { }
