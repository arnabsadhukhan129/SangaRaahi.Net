import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventAnalyticsComponent } from './event-analytics/event-analytics.component';
import { EventTypeComponent } from './event-type/event-type.component';
import { CommunityWiseComponent } from './community-wise/community-wise.component';
import { CommunityNameVsSpentComponent } from './community-name-vs-spent/community-name-vs-spent.component';
import { MySpentAmountComponent } from './my-spent-amount/my-spent-amount.component';

const routes: Routes = [
    {
        path: '',
        component: EventAnalyticsComponent,
        children: [
            { path: '', component: EventTypeComponent },
            { path: 'event-type', component: EventTypeComponent },
            { path: 'community-wise', component: CommunityWiseComponent },
            { path: 'community-name-vs-spent', component: CommunityNameVsSpentComponent },
            { path: 'my-spent-amount', component: MySpentAmountComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EventAnalyticsRoutingModule { }
