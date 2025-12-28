import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { TrackComponent } from './track/track.component';
import { UpdateUserComponent } from './update-user/update-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { EditMembersComponent } from './edit-members/edit-members.component';
import path from 'path';
import { ViewMembersComponent } from './view-members/view-members.component';
import { EditPassiveMemberComponent } from './edit-passive-member/edit-passive-member.component';
import { PassiveMemberViewComponent } from './passive-member-view/passive-member-view.component';

const routes: Routes = [
  {path:'', component:ListComponent},
  {path:'user-role/:type', component:ListComponent},
  {path:'view/:id', component:ViewComponent},
  {path:'my-profile/:id', component:ViewComponent},
  {path:'track', component:TrackComponent},
  {path:'edit-profille/:id',component: UpdateUserComponent},
  {path: 'edit-user/:id', component: EditUserComponent},
  {path: 'edit-members/:id/:memberId', component: EditMembersComponent},
  {path: 'view-members/:id/:memberId', component: ViewMembersComponent},
  {path: 'edit-passive-members/:id', component: EditPassiveMemberComponent},
  {path: 'passive-member-view/:id', component: PassiveMemberViewComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActiveMembersRoutingModule { }
