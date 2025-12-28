import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SendInvitationComponent } from './components/send-invitation/send-invitation.component';
import { ThankYouComponent } from './components/thank-you/thank-you.component';

const routes: Routes = [
  {path:'send/:token', component:SendInvitationComponent},
  {path:'thank-you', component:ThankYouComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvitationRoutingModule { }
