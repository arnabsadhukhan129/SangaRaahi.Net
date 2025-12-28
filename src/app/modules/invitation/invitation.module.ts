import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { InvitationRoutingModule } from './invitation-routing.module';
import { SendInvitationComponent } from './components/send-invitation/send-invitation.component';
import { ThankYouComponent } from './components/thank-you/thank-you.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    SendInvitationComponent,
    ThankYouComponent
  ],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    InvitationRoutingModule,
    SharedModule
  ]
})
export class InvitationModule { }
