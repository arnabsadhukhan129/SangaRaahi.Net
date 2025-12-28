import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { FormControl, FormGroup } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-my-spent-amount',
  templateUrl: './my-spent-amount.component.html',
  styleUrls: ['./my-spent-amount.component.css']
})
export class MySpentAmountComponent implements OnInit {

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  filterForm!: FormGroup;
  toggleFilter = false;
  isNoDataChart = false;

  activeMembersList: any[] = [];

  currentCommunityId = this.storage.getLocalStorageItem('communtityId');
  currentUserId = this.storage.getLocalStorageItem('userId');

  // ------------------------------------
  // COMBO CHART DATA
  chartData1: ChartConfiguration<any>['data'] = {
    labels: [],
    datasets: []
  };

  chartOptions1: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.y} K`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#bfbfbf', font: { size: 11 } }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value} K`,
          color: '#bfbfbf',
          font: { size: 11 }
        },
        grid: { color: 'rgba(255,255,255,0.1)' }
      }
    }
  };

  constructor(
    private apollo: ApolloClientService,
    private loader: LoaderService,
    private alert: AlertService,
    private storage: StorageService
  ) { }

  // ------------------------------------
  ngOnInit(): void {
    this.generateFilterForm();
    this.loadActiveMembers();
    this.fetchSpentTimeline();
  }

  // ------------------------------------
  generateFilterForm() {
    this.filterForm = new FormGroup({
      userId: new FormControl(this.currentUserId),
      startDate: new FormControl(''),
      endDate: new FormControl('')
    });
  }

  // ------------------------------------
  filterToggle() {
    this.toggleFilter = !this.toggleFilter;

    if (!this.toggleFilter) {
      this.filterForm.reset({
        userId: this.currentUserId,
        startDate: '',
        endDate: ''
      });
      this.fetchSpentTimeline();
    }
  }

  applyFilter() {
    this.fetchSpentTimeline(this.filterForm.value);
  }

  // ------------------------------------
  // ACTIVE MEMBER LIST (SAME AS PIE CHART)
  loadActiveMembers() {
    const communityId = this.currentCommunityId;

    this.apollo
      .setModule('communityActivePassiveMemberList')
      .queryData({ data: { communityId } })
      .subscribe((res: any) => {
        const members = res.data?.members || [];
        this.activeMembersList = members.flatMap((m: any) => m.members || []);
      });
  }

  // ------------------------------------
  // MAIN API
  fetchSpentTimeline(filter: any = {}) {
    const payload = {
      data: {
        communityId: this.currentCommunityId,
        userId: filter.userId || this.currentUserId,
        startDate: filter.startDate || null,
        endDate: filter.endDate || null
      }
    };

    this.loader.show();

    this.apollo
      .setModule('mySpentAmmountVsTimeLine')
      .queryData(payload)
      .subscribe({
        next: (res: any) => {
          this.loader.hide();

          const list = res.data?.spentAmmountVsTimeLine || [];

          // ✅ No data
          if (!list.length) {
            this.showNoDataChart();
            return;
          }

          // ✅ Total = 0
          const total = list.reduce(
            (sum: number, item: any) => sum + (item.totalSpentAmmount || 0),
            0
          );

          if (total === 0) {
            this.showNoDataChart();
            return;
          }

          this.updateChart(list);
        },
        error: () => {
          this.loader.hide();
          this.alert.error('Error loading spent amount analytics');
        }
      });
  }

  // ------------------------------------
  updateChart(data: any[]) {
    const labels = data.map(item => item.month);
    const values = data.map(item => item.totalSpentAmmount);

    this.isNoDataChart = false;

    this.chartData1 = {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Spent Amount',
          data: values,
          backgroundColor: '#dc3545',
          barThickness: 45,
          borderRadius: 6
        },
        {
          type: 'line',
          label: 'Trend',
          data: values,
          borderColor: '#c8d435',
          backgroundColor: 'transparent',
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#c8d435'
        }
      ]
    };

    this.chart?.update();
  }

  // ------------------------------------
  showNoDataChart() {
    this.isNoDataChart = true;

    this.chartData1 = {
      labels: ['No Data'],
      datasets: [
        {
          type: 'bar',
          data: [0],
          backgroundColor: '#d3d3d3'
        }
      ]
    };

    this.chart?.update();
  }
}
