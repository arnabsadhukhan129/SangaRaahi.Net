import { NgModule, createComponent } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { CreateComponent } from './create/create.component';
import { MailTabComponent } from './mail-tab/mail-tab.component';
import { MailingListComponent } from './mailing-list/mailing-list.component';

const routes: Routes = [
  {path:'', component:MailTabComponent, children : [
    {path: '', component: MailTabComponent},
    {path:'template-list', component: ListComponent},
    {path:'template-create', component: CreateComponent},
    {path:'template-edit/:id', component: CreateComponent},
    {path:'mail-list', component: MailingListComponent},
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmailRoutingModule { }
