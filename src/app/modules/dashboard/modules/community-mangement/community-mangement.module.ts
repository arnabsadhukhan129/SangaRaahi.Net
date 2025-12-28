import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommunityMangementRoutingModule } from './community-mangement-routing.module';
import { GlobalSettingComponent } from './global-setting/global-setting.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SmsVerifyComponent } from './sms-verify/sms-verify.component';

@NgModule({
  declarations: [
    GlobalSettingComponent,
    ProfileEditComponent,
    SmsVerifyComponent
  ],
  imports: [
    CommonModule,
    CommunityMangementRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule
  ]
})
export class CommunityMangementModule { }
