import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartType, ChartData } from 'chart.js';
import { FormControl, FormGroup } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-community-name-vs-spent',
  templateUrl: './community-name-vs-spent.html',
  styleUrls: ['./community-name-vs-spent.component.css']
})
export class CommunityNameVsSpentComponent implements OnInit {

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  filterForm!: FormGroup;
  toggleFilter = false;
  activeMembersList: any[] = [];

  pieChartType: ChartType = 'pie';
  isNoDataChart = false;
  totalContribution = 0;

  // Initialize with current community and user IDs from localStorage
  currentCommunityId = this.storage.getLocalStorageItem("communtityId");
  currentUserId = this.storage.getLocalStorageItem("userId");

  // SAME STRUCTURE AS WORKING MODULE
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
  originalColors: string[] = [];
  legendItems: any[] = [];

  // REMOVE DEFAULT LEGEND LIKE EVENT-TYPE
  pieChartOptions: any = {
    responsive: true,
    plugins: {
      legend: { display: false },
      datalabels: { display: false }
    }
  };

  constructor(
    private apollo: ApolloClientService,
    private loader: LoaderService,
    private alert: AlertService,
    private storage: StorageService
  ) {}

  ngOnInit(): void {
    this.generateFilterForm();
    this.loadActiveMembers();
    this.fetchContributionData();
  }

  // ---------------------------------------
  generateFilterForm() {
    this.filterForm = new FormGroup({
      userId: new FormControl(''),
      startDate: new FormControl(''),
      endDate: new FormControl('')
    });
  }

  filterToggle() {
    this.toggleFilter = !this.toggleFilter;
    if (!this.toggleFilter) {
      this.filterForm.reset();
      this.fetchContributionData();
    }
  }

  applyFilter() {
    this.fetchContributionData(this.filterForm.value);
  }

  // ---------------------------------------
  loadActiveMembers() {
    const communityId = this.storage.getLocalStorageItem("communtityId");

    this.apollo
      .setModule("communityActivePassiveMemberList")
      .queryData({ data: { communityId } })
      .subscribe((res: any) => {
        const members = res.data?.members || [];
        this.activeMembersList = members.flatMap((m: any) => m.members || []);
      });
  }

  // ---------------------------------------
  fetchContributionData(filter: any = {}) {
    const payload = {
      data: {
        // Use current community and user IDs initially, then override with filter values if provided
        communityId: filter.communityId || this.currentCommunityId,
        userId: filter.userId || this.currentUserId,
        startDate: filter.startDate || null,
        endDate: filter.endDate || null
      }
    };

    this.loader.show();

    this.apollo
      .setModule("getCurrentCommunityContribution")
      .queryData(payload)
      .subscribe({
        next: (res: any) => {
          this.loader.hide();

          const list = res.data?.communityContributionAnalytics || [];

          // ✅ Case 1: No records
          if (!list.length) {
            this.showNoDataChart();
            return;
          }

          // ✅ Case 2: Records exist but total contribution is 0
          const total = list.reduce(
            (sum: number, item: any) => sum + (item.totalContribution || 0),
            0
          );

          if (total === 0) {
            this.showNoDataChart();
            return;
          }

          // ✅ Normal chart
          this.updateChart(list);
        }
,
        error: () => {
          this.loader.hide();
          this.alert.error("Error loading contribution analytics.");
        }
      });
  }


  // ---------------------------------------
  updateChart(data: any[]) {
    const labels = data.map(x => x.communityName);
    const amounts = data.map(x => x.totalContribution);

    const colors = labels.map(name => this.stringToColor(name));

    this.originalData = [...amounts];
    this.originalColors = [...colors];
    this.totalContribution = amounts.reduce((a, b) => a + b, 0);
    this.isNoDataChart = false;

    this.pieChartDataObj = {
      labels,
      datasets: [
        {
          data: amounts,
          backgroundColor: colors
        }
      ]
    };

    this.legendItems = data.map((item, i) => ({
      label: item.communityName,
      value: item.totalContribution,
      color: colors[i],
      isVisible: true
    }));

    this.chart?.update();
  }

  // ---------------------------------------
  toggleSlice(index: number) {
    // ❌ Disable legend toggle when No Data chart is active
    if (this.isNoDataChart) {
      return;
    }

    const chart = this.chart?.chart;
    if (!chart) return;

    this.legendItems[index].isVisible = !this.legendItems[index].isVisible;

    const dataset = chart.data.datasets[0];

    dataset.data[index] = this.legendItems[index].isVisible
      ? this.originalData[index]
      : 0;

    chart.update();
  }


  // ---------------------------------------
  showNoDataChart(label = 'No Contribution') {
    this.isNoDataChart = true;

    this.pieChartDataObj = {
      labels: [label],
      datasets: [
        { data: [1], backgroundColor: ['#d3d3d3'] }
      ]
    };

    this.legendItems = [
      { label, value: 0, color: '#d3d3d3', isVisible: true }
    ];

    this.totalContribution = 0;
    this.chart?.update();
  }


  // ---------------------------------------
  private stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return "#" + "00000".substring(0, 6 - c.length) + c;
  }
}
