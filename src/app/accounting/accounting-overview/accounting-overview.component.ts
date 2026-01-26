import { Component, OnInit } from '@angular/core';
import { AccountingService } from '../../_services/accounting.service';
import { Color, LegendPosition, ScaleType } from '@swimlane/ngx-charts';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-accounting-overview',
  templateUrl: './accounting-overview.component.html',
  styleUrl: './accounting-overview.component.scss'
})
export class AccountingOverviewComponent implements OnInit {
  loading: boolean = false;
  credits: number = 0;
  debits: number = 0;
  balance: number = 0;
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

  constructor(private accountingService: AccountingService) {}

  ngOnInit() {
    this.loadSummary();
    this.loadChartData();
  }

  loadSummary() {
    this.loading = true;
    this.accountingService.getCreditDebitSummary()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res) => {
          this.credits = res.credits;
          this.debits = res.debits;
          this.balance = res.credits - res.debits;
          this.isBalancePositive = this.balance >= 0;
          this.balanceClass = this.isBalancePositive ? 'text-success' : 'text-danger';
          this.balanceIcon = this.isBalancePositive ? 'assets/icons/trend-up.svg' : 'assets/icons/trend-down.svg';
        },
        error: (err) => {
          console.error('Error loading summary:', err);
        }
      });
  }

  loadChartData() {
    this.accountingService.getTransactions().subscribe({
      next: (res) => {
        const transactions = res.data;
        
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
