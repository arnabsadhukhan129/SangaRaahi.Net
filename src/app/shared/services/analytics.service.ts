import { Injectable } from '@angular/core';
import { ApolloClientService } from './apollo-client.service';
import { Observable } from 'rxjs';
import { GeneralResponse } from '../interfaces/general-response.ineterface';

export interface SpentAmountData {
  month: string;
  totalSpentAmmount: number;
  currency: string;
}

export interface SpentAmountResponse {
  spentAmmountVsTimeLine: SpentAmountData[];
  totalContribution: number;
  currency: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor(private apollo: ApolloClientService) {}

  getSpentAmountVsTimeLine(filters: {
    userId?: string;
    communityId?: string;
    startDate?: string;
    endDate?: string;
  }): Observable<GeneralResponse> {
    const params = {
      data: {
        userId: filters.userId || null,
        communityId: filters.communityId || null,
        startDate: filters.startDate || null,
        endDate: filters.endDate || null
      }
    };

    return this.apollo.setModule('mySpentAmmountVsTimeLine').queryData(params);
  }

  // Helper method to aggregate monthly data into quarters
  aggregateToQuarters(data: SpentAmountData[]): {
    quarters: string[];
    spentAmounts: number[];
    trendData: number[];
  } {
    if (!data || data.length === 0) {
      return {
        quarters: ['Q1', 'Q2', 'Q3', 'Q4'],
        spentAmounts: [0, 0, 0, 0],
        trendData: [0, 0, 0, 0]
      };
    }

    // Group data by quarter
    const quarters: { [key: string]: number[] } = {
      'Q1': [],
      'Q2': [],
      'Q3': [],
      'Q4': []
    };

    data.forEach(item => {
      const month = new Date(item.month).getMonth() + 1; // getMonth() returns 0-11
      let quarter: string;
      
      if (month >= 1 && month <= 3) quarter = 'Q1';
      else if (month >= 4 && month <= 6) quarter = 'Q2';
      else if (month >= 7 && month <= 9) quarter = 'Q3';
      else quarter = 'Q4';
      
      quarters[quarter].push(item.totalSpentAmmount);
    });

    // Calculate totals for each quarter
    const spentAmounts = Object.keys(quarters).map(quarter => 
      quarters[quarter].reduce((sum, amount) => sum + amount, 0)
    );

    // Generate trend data (simple moving average or cumulative)
    const trendData = spentAmounts.map((amount, index) => {
      if (index === 0) return amount;
      // Simple trend calculation - could be more sophisticated
      return Math.round((spentAmounts.slice(0, index + 1).reduce((sum, val) => sum + val, 0) / (index + 1)) * 100) / 100;
    });

    return {
      quarters: ['Q1', 'Q2', 'Q3', 'Q4'],
      spentAmounts,
      trendData
    };
  }
}
