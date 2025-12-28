import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { VerifyOtpComponent } from './components/verify-otp/verify-otp.component';
import { AuthPreventService } from 'src/app/shared/services/auth-prevent.service';
import { SignUpComponent } from './components/sign-up/sign-up.component';
const routes: Routes = [
  {path:'',component: LoginComponent, canActivate:[AuthPreventService]},
 // {path:'verify-otp', component: VerifyOtpComponent, canActivate:[AuthPreventService]} // verify-otp -- main -- page
 {path:'verify-otp', component: VerifyOtpComponent, }, // open -- verify-otp -- page
 {path:'sign-up',component: SignUpComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
