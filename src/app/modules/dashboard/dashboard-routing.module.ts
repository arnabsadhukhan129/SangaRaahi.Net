import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from 'src/app/shared/services/auth.guard';

import { LayoutComponent } from './components/layout/layout.component';



const routes: Routes = [


  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: DashboardComponent,
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'active-members',
        loadChildren: () =>
          import('./modules/active-members/active-members.module').then(
            (module) => module.ActiveMembersModule
          ),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./modules/active-members/active-members.module').then(
            (module) => module.ActiveMembersModule
          ),
      },
      {
        path: 'active-members/passive-users',
        loadChildren: () =>
          import('./modules/passive-user/passive-user.module').then(
            (module) => module.PassiveUserModule
          ),
      },
      {
        path: 'community-management',
        loadChildren: () =>
          import('./modules/community-mangement/community-mangement.module').then(
            (module) => module.CommunityMangementModule
          ),
      },
      {
        path: 'community-management/edit-webpage',
        loadChildren: () =>
          import('./modules/edit-webpage/edit-webpage.module').then(
            (module) => module.EditWebpageModule
          ),
      },
      {
        path: 'groups',
        loadChildren: () =>
          import('./modules/group/group.module').then(
            (module) => module.GroupModule
          ),
      },
      {
        path: 'message',
        loadChildren: () =>
          import('./modules/message/message.module').then(
            (module) => module.MessageModule
          ),
      },
      {
        path: 'events',
        loadChildren: () =>
          import('./modules/events/events.module').then(
            (module) => module.EventsModule
          ),
      },
      {
        path: 'announcements',
        loadChildren: () =>
          import('./modules/announcement/announcement.module').then(
            (module) => module.AnnouncementModule
          ),
      },
      {
        path: 'search',
        loadChildren: () =>
          import('./modules/global-search/global-search.module').then(
            (module) => module.GlobalSearchModule
          ),
      },
      {
        path: 'blog',
        loadChildren: () =>
          import('./modules/blog/blog.module').then(
            (module) => module.BlogModule
          ),
      },
      {
        path: 'sample',
        loadChildren: () =>
          import('./modules/sample/sample.module').then(
            (module) => module.SampleModule
          ),
      },
      {
        path: 'email-template',
        loadChildren: () =>
          import('./modules/email/email.module').then(
            (module) => module.EmailModule
          ),
      },
      {
        path: 'login-user',
        loadChildren: () =>
          import('./modules/login-user/login-user.module').then(
            (module) => module.LoginUserModule
          ),
      },
      {
        path: 'request',
        loadChildren: () =>
          import('./modules/request-management/request-management.module').then(
            (module) => module.RequestManagementModule
          ),
      },
      {
        path: 'check-in',
        loadChildren: () =>
          import('./modules/checkin/checkin.module').then(
            (module) => module.CheckinModule
          ),
      },
      {
        path: 'template',
        loadChildren: () =>
          import('./modules/template/template.module').then(
            (module) => module.TemplateModule
          ),
      },
      {
        path: 'pratice-test',
        loadChildren: () =>
          import('./modules/test/test.module').then(
            (module) => module.TestModule
          ),
      },
      {
        path: 'payment',
        loadChildren: () =>
          import('./modules/payment/payment.module').then(
            (module) => module.PaymentModule
          )
      },
      {
        path: 'role',
        loadChildren: () =>
          import('./modules/role-permission/role-permission.module').then(
            (module) => module.RolePermissionModule
          )
      },
      {
        path: 'activity-log',
        loadChildren: () =>
          import('./modules/activity-log/activity-log.module').then(
            (module) => module.ActivityLogModule
          )
      },
      {
        path: 'event-analytics',
        loadChildren: () =>
          import('./modules/event-analytics/event-analytics.module').then(
            (module) => module.EventAnalyticsModule
          )
      }
    ],
    canActivate: [AuthGuard],
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
