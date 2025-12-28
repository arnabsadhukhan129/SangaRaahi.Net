import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { RolePermissionRoutingModule } from './role-permission-routing.module';
import { ListComponent } from './list/list.component';
import { AddEditPermissionComponent } from './add-edit-permission/add-edit-permission.component';
import { AddRoleComponent } from './add-role/add-role.component';


@NgModule({
  declarations: [
    ListComponent,
    AddEditPermissionComponent,
    AddRoleComponent
  ],
  imports: [
    CommonModule,
    RolePermissionRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class RolePermissionModule { }
