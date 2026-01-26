import { Component, OnInit } from '@angular/core';
import { AccountingService } from '../../_services/accounting.service';
import { Color, LegendPosition, ScaleType } from '@swimlane/ngx-charts';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-accounting-analytics',
  templateUrl: './accounting-analytics.component.html',
  styleUrl: './accounting-analytics.component.scss'
})
export class AccountingAnalyticsComponent implements OnInit {
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

  constructor(private accountingService: AccountingService) {}

  ngOnInit() {
    this.loadCategorySpending();
    this.loadMonthlyTrend();
  }

  loadCategorySpending() {
    this.loading = true;
    this.accountingService.getCategoryWiseSpending()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res) => {
          this.categorySpendingData = res.data.map(item => ({
            name: item.category,
            value: item.amount
          }));
          this.totalSpending = this.categorySpendingData.reduce((sum, item) => sum + item.value, 0);
        },
        error: (err) => {
          console.error('Error loading category spending:', err);
        }
      });
  }

  loadMonthlyTrend() {
    // Generate mock monthly trend data
    // In real app, this would come from API
    this.accountingService.getTransactions().subscribe({
      next: (res) => {
        const transactions = res.data;
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
