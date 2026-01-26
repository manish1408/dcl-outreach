import { Component, OnInit } from '@angular/core';
import { AccountingService, Transaction } from '../../_services/accounting.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { finalize } from 'rxjs';

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

  constructor(
    private accountingService: AccountingService,
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
  }

  loadTransactions() {
    this.loading = true;
    this.accountingService.getTransactions()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res) => {
          this.transactions = res.data;
          this.categories = [...new Set(res.data.map(t => t.category))];
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

  updateTotals() {
    this.totalCredits = this.filteredTransactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    this.totalDebits = this.filteredTransactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);
  }
}
