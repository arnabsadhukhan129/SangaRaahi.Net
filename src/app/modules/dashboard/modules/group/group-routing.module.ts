import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddGroupComponent } from './add/add.component';
import { ListComponent } from './list/list.component';
import { ViewGroupComponent } from './view/view.component';

const routes: Routes = [
  {path:'',component: ListComponent},
  {path:'list/:value',component: ListComponent},
  {path:'add', component: AddGroupComponent},
  {path:'edit/:id', component: AddGroupComponent},
  // {path:'view/:id', component: ViewGroupComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupRoutingModule { }
