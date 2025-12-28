import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-event-analytics',
    templateUrl: './event-analytics.component.html',
    styleUrls: ['./event-analytics.component.css']
})
export class EventAnalyticsComponent implements OnInit {
    eventTypeActiveTab: boolean = false;
    communityWiseActiveTab: boolean = false;
    communityNameVsSpentActiveTab: boolean = false;
    mySpentAmountActiveTab: boolean = false;

    constructor(private router: Router) { }

    ngOnInit(): void {
        this.showEventType();
    }

    showEventType() {
        this.eventTypeActiveTab = true;
        this.communityWiseActiveTab = false;
        this.communityNameVsSpentActiveTab = false;
        this.mySpentAmountActiveTab = false;
        this.router.navigateByUrl('/event-analytics/event-type');
    }

    showCommunityWise() {
        this.eventTypeActiveTab = false;
        this.communityWiseActiveTab = true;
        this.communityNameVsSpentActiveTab = false;
        this.mySpentAmountActiveTab = false;
        this.router.navigateByUrl('/event-analytics/community-wise');
    }

    showCommunityNameVsSpent() {
        this.eventTypeActiveTab = false;
        this.communityWiseActiveTab = false;
        this.communityNameVsSpentActiveTab = true;
        this.mySpentAmountActiveTab = false;
        this.router.navigateByUrl('/event-analytics/community-name-vs-spent');
    }

    showMySpentAmount() {
        this.eventTypeActiveTab = false;
        this.communityWiseActiveTab = false;
        this.communityNameVsSpentActiveTab = false;
        this.mySpentAmountActiveTab = true;
        this.router.navigateByUrl('/event-analytics/my-spent-amount');
    }
}
