import { Component } from '@angular/core';

@Component({
  selector: 'app-accounting-nav',
  templateUrl: './accounting-nav.component.html',
  styleUrl: './accounting-nav.component.scss'
})
export class AccountingNavComponent {
  navItems = [
    { path: '/accounting/overview', label: 'Overview', icon: 'dashboard' },
    { path: '/accounting/transactions', label: 'Transactions', icon: 'list' },
    { path: '/accounting/analytics', label: 'Analytics', icon: 'chart' },
    { path: '/accounting/invoices', label: 'Invoices', icon: 'file' }
  ];
}
