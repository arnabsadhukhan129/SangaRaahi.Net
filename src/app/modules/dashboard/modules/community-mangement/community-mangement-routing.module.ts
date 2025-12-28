import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GlobalSettingComponent } from './global-setting/global-setting.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { SmsVerifyComponent } from './sms-verify/sms-verify.component';

const routes: Routes = [
  {path:'',component:ProfileEditComponent},
  {path:'profile-edit', component:ProfileEditComponent},
  {path:'global-setting',component:GlobalSettingComponent},
  {path: 'sms-verify', component:SmsVerifyComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommunityMangementRoutingModule { }
