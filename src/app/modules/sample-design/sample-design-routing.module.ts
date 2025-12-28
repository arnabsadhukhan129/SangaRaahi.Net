import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileEditComponent } from './components/profile-edit/profile-edit.component';
import { SamplePageTwoComponent } from './components/sample-page-two/sample-page-two.component';

const routes: Routes = [
  {path: 'profile-edit', component: ProfileEditComponent},
  {path: 'sample-two', component: SamplePageTwoComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SampleDesignRoutingModule { }
