import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  //{path:'', loadChildren: () => import('./modules/auth/auth.module').then(module => module.AuthModule)},

  { path: 'dashboard', redirectTo:'dashboard', pathMatch: 'full'},

  {path:'', loadChildren: ()=>import('./modules/dashboard/dashboard.module').then(module => module.DashboardModule)},
  {path:'auth', loadChildren: () => import('./modules/auth/auth.module').then(module => module.AuthModule)},
  {path:'invitation', loadChildren:() => import('./modules/invitation/invitation.module').then(module => module.InvitationModule)},
  {path:'thank-you', loadChildren:() => import('./modules/thanks/thanks.module').then(module => module.ThanksModule)},
  {path:'sample-design', loadChildren:() => import('./modules/sample-design/sample-design.module').then(module => module.SampleDesignModule)},
  {path:'terms-conditions', loadChildren: ()=>import('./modules/terms/terms.module').then(module => module.TermsModule)}
];


@NgModule({
  imports: [RouterModule.forRoot(routes,{
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
