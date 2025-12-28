import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActiveMembersRoutingModule } from './active-members-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TrackComponent } from './track/track.component';
import { UpdateUserComponent } from './update-user/update-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { EditMembersComponent } from './edit-members/edit-members.component';
import { ViewMembersComponent } from './view-members/view-members.component';
import { EditPassiveMemberComponent } from './edit-passive-member/edit-passive-member.component';
import { PassiveMemberViewComponent } from './passive-member-view/passive-member-view.component';

@NgModule({
  declarations: [
    ListComponent,
    ViewComponent,
    TrackComponent,
    UpdateUserComponent,
    EditUserComponent,
    EditMembersComponent,
    ViewMembersComponent,
    EditPassiveMemberComponent,
    PassiveMemberViewComponent
  ],
  imports: [
    CommonModule,
    ActiveMembersRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class ActiveMembersModule { }
