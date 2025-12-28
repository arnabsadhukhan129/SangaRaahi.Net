import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListAnnouncementComponent } from './list/list.component';
import { CreateAnnouncementComponent } from './add/add.component';

const routes: Routes = [
  {path: '',component: ListAnnouncementComponent},
  {path: 'list/:value',component: ListAnnouncementComponent},
  {path: 'add',component: CreateAnnouncementComponent },
  {path:'edit/:id', component: CreateAnnouncementComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnnouncementRoutingModule { }
