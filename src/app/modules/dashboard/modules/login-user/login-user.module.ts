import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginUserRoutingModule } from './login-user-routing.module';
import { LoginListComponent } from './login-list/login-list.component';

@NgModule({
  declarations: [
    LoginListComponent
  ],
  imports: [
    CommonModule,
    LoginUserRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class LoginUserModule { }
