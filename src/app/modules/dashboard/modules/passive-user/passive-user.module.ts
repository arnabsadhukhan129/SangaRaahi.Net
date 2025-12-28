import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PassiveUserRoutingModule } from './passive-user-routing.module';
import { SearchUserComponent } from './search-user/search-user.component';
import { HasUserComponent } from './has-user/has-user.component';
import { NoUserComponent } from './no-user/no-user.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    SearchUserComponent,
    HasUserComponent,
    NoUserComponent
  ],
  imports: [
    CommonModule,
    PassiveUserRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class PassiveUserModule { }
