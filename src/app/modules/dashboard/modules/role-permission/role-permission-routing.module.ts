import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { AddEditPermissionComponent } from './add-edit-permission/add-edit-permission.component';
import { AddRoleComponent } from './add-role/add-role.component';

const routes: Routes = [
  {path: '', component: ListComponent},
  {path: 'permission/:role', component: AddEditPermissionComponent},
  {path: 'add-role', component: AddRoleComponent},
  {path: 'add-role/:newRole/:slug', component: AddRoleComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RolePermissionRoutingModule { }
