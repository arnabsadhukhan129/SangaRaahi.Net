import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LogComponent } from './log/log.component';
import { AppLogComponent } from './app-log/app-log.component';

const routes: Routes = [
  {path:'.net',component:LogComponent},
  {path:'app',component:AppLogComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActivityLogRoutingModule { }
