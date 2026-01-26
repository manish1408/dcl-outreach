import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccountingService } from '../../_services/accounting.service';
import { AccountingFilterService } from '../../_services/accounting-filter.service';
import { Color, LegendPosition, ScaleType } from '@swimlane/ngx-charts';
import { finalize, takeUntil } from 'rxjs';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-accounting-overview',
  templateUrl: './accounting-overview.component.html',
  styleUrl: './accounting-overview.component.scss'
})
export class AccountingOverviewComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  credits: number = 0;
  debits: number = 0;
  balance: number = 0;
  totalUsdCredits: number = 0;
  isBalancePositive: boolean = true;
  balanceClass: string = 'text-success';
  balanceIcon: string = 'assets/icons/trend-up.svg';
  
  creditChartData: any[] = [];
  debitChartData: any[] = [];
  
  // Chart options
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = true;
  isDoughnut: boolean = true;
  legendPosition: LegendPosition = LegendPosition.Right;
  
  customColorScheme: Color = {
    name: 'customScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5DD89D', '#072032', '#FFF59F', '#89FFBA', '#6BE3AA', '#4CAF50', '#2196F3'],
  };
  
  customColorSchemeDebit: Color = {
    name: 'customSchemeDebit',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#F44336', '#FF9800', '#FFC107', '#FF5722', '#E91E63'],
  };

  private destroy$ = new Subject<void>();

  constructor(
    private accountingService: AccountingService,
    private filterService: AccountingFilterService
  ) {}

  ngOnInit() {
    this.loadSummary();
    this.loadChartData();
    
    this.filterService.dateFilter$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadSummary();
      this.loadChartData();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSummary() {
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
        
        const creditTransactions = transactions.filter(t => t.type === 'credit');
        this.credits = creditTransactions.reduce((sum, t) => sum + t.amount, 0);
        this.totalUsdCredits = creditTransactions.reduce((sum, t) => {
          const usdAmount = t.usdAmount ? t.usdAmount : 0;
          return sum + usdAmount;
        }, 0);
        
        this.debits = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
        this.balance = this.credits - this.debits;
        this.isBalancePositive = this.balance >= 0;
        this.balanceClass = this.isBalancePositive ? 'text-success' : 'text-danger';
        this.balanceIcon = this.isBalancePositive ? 'assets/icons/trend-up.svg' : 'assets/icons/trend-down.svg';
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading summary:', err);
        this.loading = false;
      }
    });
  }

  loadChartData() {
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
        
        // Group credits by category
        const creditMap = new Map<string, number>();
        transactions
          .filter(t => t.type === 'credit')
          .forEach(t => {
            const current = creditMap.get(t.category);
            const currentValue = current ? current : 0;
            creditMap.set(t.category, currentValue + t.amount);
          });
        
        this.creditChartData = Array.from(creditMap.entries()).map(([name, value]) => ({
          name,
          value
        }));

        // Group debits by category
        const debitMap = new Map<string, number>();
        transactions
          .filter(t => t.type === 'debit')
          .forEach(t => {
            const current = debitMap.get(t.category);
            const currentValue = current ? current : 0;
            debitMap.set(t.category, currentValue + t.amount);
          });
        
        this.debitChartData = Array.from(debitMap.entries()).map(([name, value]) => ({
          name,
          value
        }));
      },
      error: (err) => {
        console.error('Error loading chart data:', err);
      }
    });
  }

  onSelect(data: any): void {
  }
}
