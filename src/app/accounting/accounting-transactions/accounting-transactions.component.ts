import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccountingService, Transaction } from '../../_services/accounting.service';
import { AccountingFilterService } from '../../_services/accounting-filter.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { finalize, takeUntil } from 'rxjs';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-accounting-transactions',
  templateUrl: './accounting-transactions.component.html',
  styleUrl: './accounting-transactions.component.scss'
})
export class AccountingTransactionsComponent implements OnInit {
  loading: boolean = false;
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  filterForm: FormGroup;

  // Filter options
  typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'credit', label: 'Credits' },
    { value: 'debit', label: 'Debits' }
  ];

  timelineOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  categories: string[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private accountingService: AccountingService,
    private filterService: AccountingFilterService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      type: [''],
      category: [''],
      timeline: ['all'],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit() {
    this.loadTransactions();
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.filterService.dateFilter$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadTransactions();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTransactions() {
    const filter = this.filterService.getCurrentFilter();
    this.loading = true;
    this.accountingService.getTransactions()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
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
          
          this.transactions = transactions;
          this.categories = [...new Set(transactions.map(t => t.category))];
          this.applyFilters();
        },
        error: (err) => {
          console.error('Error loading transactions:', err);
        }
      });
  }

  applyFilters() {
    let filtered = [...this.transactions];
    const filters = this.filterForm.value;

    // Filter by type
    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    // Filter by timeline
    if (filters.timeline && filters.timeline !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (filters.timeline) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(0);
      }

      filtered = filtered.filter(t => new Date(t.date) >= startDate);
    }

    // Filter by date range
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(t => new Date(t.date) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => new Date(t.date) <= endDate);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    this.filteredTransactions = filtered;
    this.updateTotals();
  }

  resetFilters() {
    this.filterForm.reset({
      type: '',
      category: '',
      timeline: 'all',
      startDate: '',
      endDate: ''
    });
  }

  totalCredits: number = 0;
  totalDebits: number = 0;
  totalUsdCredits: number = 0;

  updateTotals() {
    const creditTransactions = this.filteredTransactions.filter(t => t.type === 'credit');
    this.totalCredits = creditTransactions.reduce((sum, t) => sum + t.amount, 0);
    this.totalUsdCredits = creditTransactions.reduce((sum, t) => {
      const usdAmount = t.usdAmount ? t.usdAmount : 0;
      return sum + usdAmount;
    }, 0);
    
    this.totalDebits = this.filteredTransactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);
  }
}
