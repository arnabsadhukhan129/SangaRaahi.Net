import { NgModule, createComponent } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListComponent } from './list/list.component';
import { CreateComponent } from './create/create.component';
import { ViewComponent } from './view/view.component';


const routes: Routes = [
  {path: '', component: ListComponent},
  {path: 'create', component: CreateComponent},
  {path: 'view/:id', component: CreateComponent},
  {path: 'edit/:blogId', component: CreateComponent},
  {path: 'blog-view/:id/:blogId', component: ViewComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlogRoutingModule { }
