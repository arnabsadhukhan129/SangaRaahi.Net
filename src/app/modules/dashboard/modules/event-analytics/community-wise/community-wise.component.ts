import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartType } from 'chart.js';
import { FormControl, FormGroup } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { CommunityService } from '../../../../../shared/services/community.service';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'app-community-wise',
  templateUrl: './community-wise.component.html',
  styleUrls: ['./community-wise.component.css']
})
export class CommunityWiseComponent implements OnInit {

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  COMMUNITY_COLORS: Record<string, string> = {
  "QA Community SDET": "#1F57E7",
  "ABC Music Community": "#E57373",
  "My Community": "#7EC321",
  "Sangaraahi dev team community": "#F1C40F",

  Default: "#8E44AD"
};
private stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = '#' + ((hash >> 24) & 0xFF).toString(16).padStart(2, '0') +
                      ((hash >> 16) & 0xFF).toString(16).padStart(2, '0') +
                      ((hash >> 8) & 0xFF).toString(16).padStart(2, '0');
  return color.substring(0, 7);
}


getColorForCommunity(name: string): string {
  // If we defined manual color → use it
  if (this.COMMUNITY_COLORS[name]) {
    return this.COMMUNITY_COLORS[name];
  }

  // Otherwise generate a stable unique color
  const generated = this.stringToColor(name);

  // Save it for future use (optional)
  this.COMMUNITY_COLORS[name] = generated;

  return generated;
}

  pieChartType: ChartType = 'pie';
  filterForm!: FormGroup;
  toggleFilter: boolean = false;
  isNoDataChart = false;

  pieChartData = {
    labels: [] as string[],
    datasets: [
      {
        data: [] as number[],
        backgroundColor: [] as string[],
        borderWidth: 2,
        borderColor: '#ffffff',
      }
    ]
  };

  pieChartOptions: any = {
    responsive: true,
    plugins: {
      legend: { display: false },
      datalabels: { display: false }
    }
  };

  legendList: any[] = [];
  originalColors: string[] = [];
  originalData: number[] = [];

  communities: any[] = [];
  activeMembersList: any[] = [];

  constructor(
    private apolloClient: ApolloClientService,
    private loaderService: LoaderService,
    private alertService: AlertService,
    private storage: StorageService,
    private communityService: CommunityService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.generateFilterForm();
    this.loadCommunities();
    this.loadActiveMembers();
  }

  generateFilterForm() {
    this.filterForm = new FormGroup({
      userId: new FormControl(''),
      communityId: new FormControl(''),
      startDate: new FormControl(''),
      endDate: new FormControl('')
    });
  }

  filterToggle() {
    this.toggleFilter = !this.toggleFilter;
    if (!this.toggleFilter) {
      this.filterForm.reset();
      this.fetchEventParticipation();
      this.loadActiveMembers();
    }
  }

  applyFilter() {
    const filter = this.filterForm.value;

    // Load users based on community
    this.loadActiveMembers(filter.communityId);

    // Load chart
    this.fetchEventParticipation(filter);
  }

  // ---------------------------------------------------------
  // COMMUNITY LIST
  // ---------------------------------------------------------
  loadCommunities() {
    this.apolloClient
      .setModule('switchOrganizationList')
      .queryData()
      .subscribe((response: any) => {
        if (response.error) return this.alertService.error(response.message);

        this.communities = response.data;

        // Auto-load if no local community exists
        if (!this.storage.getLocalStorageItem('communtityId') && this.communities.length) {
          this.switchCommunity(this.communities[0]);
        }

        this.fetchEventParticipation();
      });
  }

  switchCommunity(community: any) {
    this.storage.setLocalStorageItem('communtityId', community.id);
    this.storage.setLocalStorageItem('communityName', community.communityName || '');
    this.storage.setLocalStorageItem('role', community.role || '');

    this.commonService.sendValue(community.id);
    this.commonService.sendImage(community.logoImage || '');

    this.loadActiveMembers();
    this.fetchEventParticipation();
  }

  // ---------------------------------------------------------
  // ACTIVE MEMBERS LIST
  // ---------------------------------------------------------
  loadActiveMembers(selectedCommunityId?: string) {
    const finalCommunityId =
      selectedCommunityId || this.storage.getLocalStorageItem('communtityId');

    const params = { data: { communityId: finalCommunityId } };

    this.apolloClient
      .setModule('communityActivePassiveMemberList')
      .queryData(params)
      .subscribe((res: any) => {
        const communities = res.data?.members || [];

        this.activeMembersList = communities.flatMap((c: any) =>
          Array.isArray(c.members)
            ? c.members
            : c.members
            ? [c.members]
            : []
        );
      });
  }

  // ---------------------------------------------------------
  // FETCH ANALYTICS DATA (COMMUNITY-WISE YES RSVP)
  // ---------------------------------------------------------
  fetchEventParticipation(filter: any = {}) {
    const variables = {
      data: {
        userId: filter.userId || null,
        communityId: filter.communityId || null,
        startDate: filter.startDate || null,
        endDate: filter.endDate || null
      }
    };

    this.loaderService.show();

    this.apolloClient
      .setModule('getEventParticipationByUser')
      .queryData(variables)
      .subscribe({
        next: (response: any) => {
          this.loaderService.hide();

          const analytics = response.data?.allEventByUserAnalytics || [];

          if (!analytics.length) {
            this.showNoDataChart();
            return;
          }

          this.updateChartData(analytics);
          this.updateLegendList(analytics);
          this.forceChartUpdate();
        },
        error: () => {
          this.loaderService.hide();
          this.alertService.error('Error loading chart data.');
        }
      });
  }

  resetChart() {
    this.pieChartData.labels = [];
    this.pieChartData.datasets[0].data = [];
    this.legendList = [];
    this.originalColors = [];
    this.originalData = [];
    this.forceChartUpdate();
  }

 updateChartData(analytics: any[]) {
  const dynamicColors = analytics.map((item: any) =>
    this.getColorForCommunity(item.communityName)
  );

  this.originalColors = [...dynamicColors];
  this.originalData = analytics.map((i: any) => i.count);

  this.pieChartData = {
    labels: analytics.map((i: any) => i.communityName),
    datasets: [
      {
        data: analytics.map((i: any) => i.count),
        backgroundColor: dynamicColors,
        borderWidth: 2,
        borderColor: "#fff",
      }
    ]
  };
}

updateLegendList(analytics: any[]) {
  const colors = this.pieChartData.datasets[0].backgroundColor as string[];

  this.legendList = analytics.map((item: any, index: number) => ({
    label: item.communityName,
    value: item.count,
    color: colors[index],
    isVisible: true
  }));
}


  toggleSlice(index: number) {
  this.legendList[index].isVisible = !this.legendList[index].isVisible;

  const visibleIndexes = this.legendList
    .map((l, i) => (l.isVisible ? i : -1))
    .filter(i => i !== -1);

  // Filter labels
  this.pieChartData.labels = visibleIndexes.map(i =>
    this.legendList[i].label
  );

  // Filter data
  this.pieChartData.datasets[0].data = visibleIndexes.map(i =>
    this.originalData[i]
  );

  // Filter colors
  this.pieChartData.datasets[0].backgroundColor = visibleIndexes.map(i =>
    this.originalColors[i]
  );

  this.forceChartUpdate();
}


  private forceChartUpdate() {
    setTimeout(() => this.chart?.update(), 0);
  }

  showNoDataChart() {
  this.isNoDataChart = true;
  this.pieChartData = {
    labels: ['No Data'],
    datasets: [
      {
        data: [1] as number[],
         backgroundColor: ['#d3d3d3'],
        borderWidth: 2,
        borderColor: '#ffffff',
      }
    ]
  };

  this.legendList = [
    {
      label: 'No Data',
      // value: 0,
      color: '#d3d3d3'
    }
  ];

  this.chart?.update();
}
}
