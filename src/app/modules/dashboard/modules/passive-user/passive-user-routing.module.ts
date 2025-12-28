import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchUserComponent } from './search-user/search-user.component';
import { HasUserComponent } from './has-user/has-user.component';
import { NoUserComponent } from './no-user/no-user.component';

const routes: Routes = [
  {path:'', component:SearchUserComponent},
  {path:'found-user', component:HasUserComponent},
  {path:'no-found-user',component:NoUserComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PassiveUserRoutingModule { }
