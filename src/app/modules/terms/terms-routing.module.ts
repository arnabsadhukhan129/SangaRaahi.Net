import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConditionsComponent } from './components/conditions/conditions.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';

const routes: Routes = [
  {path:'terms', component:ConditionsComponent},
  {path:'privacy', component:PrivacyPolicyComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TermsRoutingModule { }
