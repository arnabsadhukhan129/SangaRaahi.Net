import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventAnalyticsRoutingModule } from './event-analytics-routing.module';
import { EventAnalyticsComponent } from './event-analytics/event-analytics.component';
import { EventTypeComponent } from './event-type/event-type.component';
import { CommunityWiseComponent } from './community-wise/community-wise.component';
import { CommunityNameVsSpentComponent } from './community-name-vs-spent/community-name-vs-spent.component';
import { MySpentAmountComponent } from './my-spent-amount/my-spent-amount.component';
import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({
    declarations: [
        EventAnalyticsComponent,
        EventTypeComponent,
        CommunityWiseComponent,
        CommunityNameVsSpentComponent,
        MySpentAmountComponent
    ],
    imports: [
        EventAnalyticsRoutingModule,
        CommonModule,
        SharedModule
    ]
})
export class EventAnalyticsModule { }
