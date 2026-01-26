import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface DateFilter {
  period: 'thisMonth' | 'lastMonth' | 'custom';
  startDate?: Date;
  endDate?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AccountingFilterService {
  private dateFilterSubject = new BehaviorSubject<DateFilter>(this.getDefaultFilter());
  public dateFilter$: Observable<DateFilter> = this.dateFilterSubject.asObservable();

  getDefaultFilter(): DateFilter {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      period: 'thisMonth',
      startDate: startDate,
      endDate: endDate
    };
  }

  getCurrentFilter(): DateFilter {
    return this.dateFilterSubject.value;
  }

  setDateFilter(filter: DateFilter) {
    this.dateFilterSubject.next(filter);
  }

  setPeriod(period: 'thisMonth' | 'lastMonth' | 'custom') {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (period === 'thisMonth') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (period === 'lastMonth') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    } else {
      const current = this.dateFilterSubject.value;
      startDate = current.startDate ? current.startDate : new Date();
      endDate = current.endDate ? current.endDate : new Date();
    }

    this.setDateFilter({
      period: period,
      startDate: startDate,
      endDate: endDate
    });
  }

  setCustomDateRange(startDate: Date, endDate: Date) {
    this.setDateFilter({
      period: 'custom',
      startDate: startDate,
      endDate: endDate
    });
  }
}
