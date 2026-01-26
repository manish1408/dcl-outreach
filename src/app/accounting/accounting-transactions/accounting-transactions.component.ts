import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccountingService, Transaction } from '../../_services/accounting.service';
import { AccountingFilterService } from '../../_services/accounting-filter.service';
import { finalize, takeUntil } from 'rxjs';
import { Subject } from 'rxjs';

type SortColumn = 'date' | 'type' | 'category' | 'description' | 'clientName' | 'amount';
type SortDirection = 'asc' | 'desc' | '';

@Component({
  selector: 'app-accounting-transactions',
  templateUrl: './accounting-transactions.component.html',
  styleUrl: './accounting-transactions.component.scss'
})
export class AccountingTransactionsComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  allTransactions: Transaction[] = [];
  displayedTransactions: Transaction[] = [];
  private destroy$ = new Subject<void>();

  // Sorting
  sortColumn: SortColumn = 'date';
  sortDirection: SortDirection = 'desc';
  
  // Pagination
  pageSize: number = 20;
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(
    private accountingService: AccountingService,
    private filterService: AccountingFilterService
  ) {}

  ngOnInit() {
    this.loadTransactions();

    this.filterService.dateFilter$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.resetPagination();
      this.loadTransactions();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  resetPagination() {
    this.currentPage = 1;
    this.updateDisplayedTransactions();
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
          
          this.allTransactions = transactions;
          this.applySorting();
          this.resetPagination();
        },
        error: (err) => {
          console.error('Error loading transactions:', err);
        }
      });
  }

  updateDisplayedTransactions() {
    this.totalPages = Math.ceil(this.allTransactions.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedTransactions = this.allTransactions.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedTransactions();
    }
  }

  onPreviousButtonClick() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedTransactions();
    }
  }

  onNextButtonClick() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedTransactions();
    }
  }

  sort(column: SortColumn) {
    if (this.sortColumn === column) {
      if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
      } else if (this.sortDirection === 'desc') {
        this.sortDirection = '';
        this.sortColumn = 'date';
        this.sortDirection = 'desc';
      } else {
        this.sortDirection = 'asc';
      }
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.applySorting();
    this.resetPagination();
  }

  applySorting() {
    if (!this.sortDirection) {
      return;
    }

    this.allTransactions.sort((a, b) => { 
      let aValue: any;
      let bValue: any;

      switch (this.sortColumn) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'description':
          aValue = a.description;
          bValue = b.description;
          break;
        case 'clientName':
          aValue = a.clientName ? a.clientName : '';
          bValue = b.clientName ? b.clientName : '';
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  getSortIcon(column: SortColumn): string {
    if (this.sortColumn !== column) {
      return 'fa-sort';
    }
    if (this.sortDirection === 'asc') {
      return 'fa-sort-up';
    }
    if (this.sortDirection === 'desc') {
      return 'fa-sort-down';
    }
    return 'fa-sort';
  }
}
