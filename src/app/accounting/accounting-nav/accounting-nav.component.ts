import { Component, OnInit } from '@angular/core';
import { AccountingFilterService, DateFilter } from '../../_services/accounting-filter.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-accounting-nav',
  templateUrl: './accounting-nav.component.html',
  styleUrl: './accounting-nav.component.scss'
})
export class AccountingNavComponent implements OnInit {
  navItems = [
    { path: '/accounting/overview', label: 'Overview', icon: 'dashboard' },
    { path: '/accounting/transactions', label: 'Transactions', icon: 'list' },
    { path: '/accounting/invoices', label: 'Invoices', icon: 'file' },
    { path: '/accounting/settings', label: 'Settings', icon: 'settings' }
  ];

  dateFilterForm: FormGroup;
  currentFilter: DateFilter = this.filterService.getDefaultFilter();

  periodOptions = [
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' }
  ];

  constructor(
    private filterService: AccountingFilterService,
    private fb: FormBuilder
  ) {
    this.dateFilterForm = this.fb.group({
      period: ['thisMonth'],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit() {
    this.currentFilter = this.filterService.getCurrentFilter();
    this.initializeForm();
    
    this.filterService.dateFilter$.subscribe(filter => {
      this.currentFilter = filter;
    });
    
    this.dateFilterForm.get('period')?.valueChanges.subscribe(period => {
      if (period !== 'custom') {
        this.filterService.setPeriod(period);
      }
    });

    this.dateFilterForm.get('startDate')?.valueChanges.subscribe(() => {
      this.onCustomDateChange();
    });

    this.dateFilterForm.get('endDate')?.valueChanges.subscribe(() => {
      this.onCustomDateChange();
    });
  }

  initializeForm() {
    const filter = this.currentFilter;
    this.dateFilterForm.patchValue({
      period: filter.period,
      startDate: filter.startDate ? this.formatDateForInput(filter.startDate) : '',
      endDate: filter.endDate ? this.formatDateForInput(filter.endDate) : ''
    }, { emitEvent: false });
  }

  onCustomDateChange() {
    const formValue = this.dateFilterForm.value;
    if (formValue.period === 'custom' && formValue.startDate && formValue.endDate) {
      const startDate = new Date(formValue.startDate);
      const endDate = new Date(formValue.endDate);
      this.filterService.setCustomDateRange(startDate, endDate);
    }
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
