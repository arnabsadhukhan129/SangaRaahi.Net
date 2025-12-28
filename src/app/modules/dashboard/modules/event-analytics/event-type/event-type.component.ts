import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Chart, ChartType, ChartData } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ApolloClientService } from '../../../../../shared/services/apollo-client.service';
import { Subscription } from 'rxjs';
import { LoaderService } from '../../../../../shared/services/loader.service';
import { AlertService } from '../../../../../shared/services/alert.service';
import { StorageService } from '../../../../../shared/services/storage.service';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { CommunityService } from '../../../../../shared/services/community.service';
import { CommonService } from '../../../services/common.service';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-event-type',
  templateUrl: './event-type.component.html',
  styleUrls: ['./event-type.component.css']
})
export class EventTypeComponent implements OnInit, OnDestroy {

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

   private EVENT_TYPE_COLORS: Record<string, string> = {
    Educational: '#E74C3C',
    Cultural: '#3498DB',
    Social: '#FF8A65',
    Religious: '#9B59B6',
    Health: '#16A085',
    Other: '#95A5A6',
    Default: '#BDC3C7'
  };
private getColorForType(type: string): string {
  return this.EVENT_TYPE_COLORS[type] || this.EVENT_TYPE_COLORS['Default'];
}


  pieChartType: ChartType = 'pie';

  pieChartDataObj: ChartData<'pie'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: []
      }
    ]
  };

  originalData: number[] = [];
  legendItems: any[] = [];
  isNoDataChart = false;
  filterForm!: FormGroup;
  toggleFilter = false;
  communities: any[] = [];

  activeMembersList: any[] = [];

  private participationSubscription!: Subscription;
  communitiesSubscription!: Subscription;
  activeMembersSubscription!: Subscription;

  constructor(
    private apolloClientService: ApolloClientService,
    private loaderService: LoaderService,
    private alertService: AlertService,
    private storageService: StorageService,
    private communityService: CommunityService,
    private commonService: CommonService
  ) {
    Chart.register(ChartDataLabels);
  }

  // -----------------------------------------------------------
  // INIT
  // -----------------------------------------------------------
  ngOnInit(): void {
    this.generateFilterForm();
    this.loadCommunities();
    this.loadActiveMembersList();
  }


  // -----------------------------------------------------------
  // FILTERS
  // -----------------------------------------------------------
  generateFilterForm() {
    this.filterForm = new FormGroup({
      userOrFamily: new FormControl(''),
      community: new FormControl(''),
      startDate: new FormControl(''),
      endDate: new FormControl('')
    });
  }

 loadActiveMembersList(communityId?: string) {

  const finalCommunityId =
    communityId || this.storageService.getLocalStorageItem('communtityId');

  const params: any = {};
  params['data'] = { communityId: finalCommunityId };

  this.loaderService.show();

  this.activeMembersSubscription = this.apolloClientService
    .setModule('communityActivePassiveMemberList')
    .queryData(params)
    .subscribe(
      (response: GeneralResponse) => {
        this.loaderService.hide();

        if (response.error) {
          this.alertService.error(response.message);
          return;
        }

        const communities = response.data?.members || [];
        const membersFlattened = communities.flatMap((community: any) => {
          return Array.isArray(community.members)
            ? community.members
            : community.members
              ? [community.members]
              : [];
        });

        this.activeMembersList = membersFlattened;
        console.log('ACTIVE MEMBERS',this.activeMembersList)

      },
      () => {
        this.loaderService.hide();
        this.alertService.error('Error loading active members list.');
      }
    );
}


 filterToggle() {
  this.toggleFilter = !this.toggleFilter;
  if (!this.toggleFilter) {
    this.filterForm.reset();

    // Ensure select goes back to placeholder
    this.filterForm.patchValue({ community: '' });

    this.loadParticipationData();
  }
}

  ngOnDestroy(): void {
    if (this.participationSubscription) this.participationSubscription.unsubscribe();
    if (this.communitiesSubscription) this.communitiesSubscription.unsubscribe();
    if (this.activeMembersSubscription) this.activeMembersSubscription.unsubscribe();
  }

  applyFilter() {
  const filter = this.filterForm.value;

  // Load user list based on selected community
  this.loadActiveMembersList(filter.community);

  // Load chart based on filters
  this.loadParticipationData(filter);
}

  // -----------------------------------------------------------
  // COMMUNITY
  // -----------------------------------------------------------
  loadCommunities() {
    this.communitiesSubscription = this.apolloClientService
      .setModule('switchOrganizationList')
      .queryData()
      .subscribe((response: GeneralResponse) => {
        if (response.error) {
          this.alertService.error(response.message);
          return;
        }

        this.communities = response.data;

        if (this.communities.length > 0) {
          if (!this.storageService.getLocalStorageItem('communtityId')) {
            this.switchCommunity(this.communities[0]);
          }
          this.loadParticipationData();
        }
      });
  }

  switchCommunity(community: any) {
    this.storageService.setLocalStorageItem('communtityId', community.id);
    this.storageService.setLocalStorageItem('communityName', community.communityName || community.name || '');
    this.storageService.setLocalStorageItem('role', community.role || '');

    this.commonService.sendValue(community.id);
    this.commonService.sendImage(community.logoImage || '');

    this.loadActiveMembersList();
    this.loadParticipationData();
  }

  onCommunityChange(event: any) {
  const selectedId = event.target.value;
  const selected = this.communities.find(c => c.id === selectedId);

  if (selected) {
    this.switchCommunity(selected);

    // Load user list for this selected community
    this.loadActiveMembersList(selectedId);
  }
}

  // -----------------------------------------------------------
  // GENERATE DYNAMIC COLORS
  // -----------------------------------------------------------
  generateColors(count: number): string[] {
    const colors: string[] = [];

    for (let i = 0; i < count; i++) {
      const r = Math.floor(Math.random() * 150 + 50);
      const g = Math.floor(Math.random() * 150 + 50);
      const b = Math.floor(Math.random() * 150 + 50);
      colors.push(`rgb(${r}, ${g}, ${b})`);
    }

    return colors;
  }

  // -----------------------------------------------------------
  // LOAD PARTICIPATION DATA
  // -----------------------------------------------------------
  loadParticipationData(filterData: any = {}) {
    const userId = filterData.userOrFamily || this.storageService.getLocalStorageItem('userId');
    const defaultCommunity = this.storageService.getLocalStorageItem('communtityId');

    const variables = {
      data: {
        userId,
        communityId: filterData.community || defaultCommunity || null,
        startDate: filterData.startDate || null,
        endDate: filterData.endDate || null
      }
    };

    this.loaderService.show();

    this.participationSubscription = this.apolloClientService
      .setModule('getParticipationByEventTpe')
      .queryData(variables)
      .subscribe({
        next: (response: GeneralResponse) => {
          this.loaderService.hide();

          const analytics = response.data?.allEventTypeAnalytics || [];
          console.log(analytics)
          // 👉 If no data → show default chart
          if (analytics.length === 0) {
            this.originalData = [];
            this.showNoDataChart();
            return;
          }

          // If all values are 0
          const allZero = analytics.every((item: any) => item.count === 0);
          if (allZero) {
            this.originalData = [];
            this.showNoDataChart();
            return;
          }
          if (!allZero && analytics.length > 0) {
            this.isNoDataChart = false;  // 🔥 important
          }
          // store original values
          this.originalData = analytics.map((i: any) => i.count);

          // generate dynamic colors
          const dynamicColors = analytics.map((i: any) =>
  this.getColorForType(i.type)
);

          // update legend
          this.updateLegendItems(analytics, dynamicColors);
          
          this.pieChartDataObj = {
            labels: analytics.map((i: any) => i.type),
            datasets: [
              {
                data: analytics.map((i: any) => i.count),
                backgroundColor: dynamicColors
              }
            ]
          };

          this.chart?.update();
        },
        error: () => {
          this.loaderService.hide();
          this.alertService.error('Error loading participation data.');
        }
      });
  }

  // -----------------------------------------------------------
  // UPDATE LEGEND ITEMS WITH DYNAMIC COLORS
  // -----------------------------------------------------------
updateLegendItems(analytics: any[], colors: string[]) {
  this.legendItems = analytics.map((item: any, index: number) => ({
    label: item.type,
    value: item.count,
    color: colors[index],
    isVisible: true
  }));
}


  // -----------------------------------------------------------
  // HIDE/SHOW SLICE ON CLICK
  // -----------------------------------------------------------
 toggleSlice(index: number) {
  const chart = this.chart?.chart;
  if (!chart) return;

  const dataset = chart.data.datasets[0];

  this.legendItems[index].isVisible = !this.legendItems[index].isVisible;

  if (this.legendItems[index].isVisible) {
    dataset.data[index] = this.originalData[index];
  } else {
    dataset.data[index] = 0;
  }

  chart.update();
}


  // -----------------------------------------------------------
  // CHART OPTIONS
  // -----------------------------------------------------------
  pieChartOptions: any = {
    responsive: true,
    plugins: {
      legend: { display: false },
      datalabels: {
        display: false,
      }
    }
  };
  showNoDataChart() {
     this.isNoDataChart = true;
  this.pieChartDataObj = {
    labels: ['No Data'],
    datasets: [
      {
        data: [1], // one slice
        backgroundColor: ['#d3d3d3'] // gray color
      }
    ]
  };

  this.legendItems = [
    {
      label: 'No Data',
      // value: 0,
      color: '#d3d3d3'
    }
  ];

  this.chart?.update();
}

}
