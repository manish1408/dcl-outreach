import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccountingService } from '../../_services/accounting.service';
import { AccountingFilterService } from '../../_services/accounting-filter.service';
import { Color, LegendPosition, ScaleType } from '@swimlane/ngx-charts';
import { finalize, takeUntil } from 'rxjs';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-accounting-analytics',
  templateUrl: './accounting-analytics.component.html',
  styleUrl: './accounting-analytics.component.scss'
})
export class AccountingAnalyticsComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  categorySpendingData: any[] = [];
  monthlyTrendData: any[] = [];
  totalSpending: number = 0;

  // Chart options
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  showXAxisLabel: boolean = true;
  showYAxisLabel: boolean = true;
  xAxisLabel: string = 'Category';
  yAxisLabel: string = 'Amount (₹)';
  showLegend: boolean = true;
  legendPosition: LegendPosition = LegendPosition.Right;
  gradient: boolean = false;

  customColorScheme: Color = {
    name: 'customScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5DD89D', '#072032', '#FFF59F', '#89FFBA', '#6BE3AA', '#4CAF50', '#2196F3', '#FF9800'],
  };

  private destroy$ = new Subject<void>();

  constructor(
    private accountingService: AccountingService,
    private filterService: AccountingFilterService
  ) {}

  ngOnInit() {
    this.loadCategorySpending();
    this.loadMonthlyTrend();

    this.filterService.dateFilter$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadCategorySpending();
      this.loadMonthlyTrend();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategorySpending() {
    const filter = this.filterService.getCurrentFilter();
    this.loading = true;
    this.accountingService.getTransactions().subscribe({
      next: (res) => {
        let transactions = res.data;
        
        if (filter.startDate) {
          const startDate = new Date(filter.startDate);
          startDate.setHours(0, 0, 0, 0);
          transactions = transactions.filter(t => {
            const transDate = new Date(t.date);
            transDate.setHours(0, 0, 0, 0);
            return transDate >= startDate;
          });
        }
        if (filter.endDate) {
          const endDate = new Date(filter.endDate);
          endDate.setHours(23, 59, 59, 999);
          transactions = transactions.filter(t => {
            const transDate = new Date(t.date);
            return transDate <= endDate;
          });
        }
        
        const categoryMap = new Map<string, number>();
        transactions
          .filter(t => t.type === 'debit')
          .forEach(t => {
            const current = categoryMap.get(t.category);
            const currentValue = current ? current : 0;
            categoryMap.set(t.category, currentValue + t.amount);
          });
        
        this.categorySpendingData = Array.from(categoryMap.entries()).map(([name, value]) => ({
          name,
          value
        }));
        this.totalSpending = this.categorySpendingData.reduce((sum, item) => sum + item.value, 0);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading category spending:', err);
        this.loading = false;
      }
    });
  }

  loadMonthlyTrend() {
    const filter = this.filterService.getCurrentFilter();
    this.accountingService.getTransactions().subscribe({
      next: (res) => {
        let transactions = res.data;
        
        if (filter.startDate) {
          const startDate = new Date(filter.startDate);
          startDate.setHours(0, 0, 0, 0);
          transactions = transactions.filter(t => {
            const transDate = new Date(t.date);
            transDate.setHours(0, 0, 0, 0);
            return transDate >= startDate;
          });
        }
        if (filter.endDate) {
          const endDate = new Date(filter.endDate);
          endDate.setHours(23, 59, 59, 999);
          transactions = transactions.filter(t => {
            const transDate = new Date(t.date);
            return transDate <= endDate;
          });
        }
        const monthlyMap = new Map<string, { credits: number; debits: number }>();

        transactions.forEach(t => {
          const month = new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          if (!monthlyMap.has(month)) {
            monthlyMap.set(month, { credits: 0, debits: 0 });
          }
          const current = monthlyMap.get(month)!;
          if (t.type === 'credit') {
            current.credits += t.amount;
          } else {
            current.debits += t.amount;
          }
        });

        const months = Array.from(monthlyMap.keys()).sort();
        this.monthlyTrendData = [
          {
            name: 'Credits',
            series: months.map(month => ({
              name: month,
              value: monthlyMap.get(month)!.credits
            }))
          },
          {
            name: 'Debits',
            series: months.map(month => ({
              name: month,
              value: monthlyMap.get(month)!.debits
            }))
          }
        ];
      },
      error: (err) => {
        console.error('Error loading monthly trend:', err);
      }
    });
  }

  onSelect(data: any): void {
  }
}
