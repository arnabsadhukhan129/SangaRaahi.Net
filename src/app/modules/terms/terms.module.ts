import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TermsRoutingModule } from './terms-routing.module';
import { ConditionsComponent } from './components/conditions/conditions.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';


@NgModule({
  declarations: [
    ConditionsComponent,
    PrivacyPolicyComponent
  ],
  imports: [
    CommonModule,
    TermsRoutingModule
  ]
})
export class TermsModule { }
