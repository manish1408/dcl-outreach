import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountingOverviewComponent } from './accounting-overview/accounting-overview.component';
import { AccountingTransactionsComponent } from './accounting-transactions/accounting-transactions.component';
import { AccountingAnalyticsComponent } from './accounting-analytics/accounting-analytics.component';
import { AccountingInvoicesComponent } from './accounting-invoices/accounting-invoices.component';

const routes: Routes = [
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
  { path: 'overview', component: AccountingOverviewComponent },
  { path: 'transactions', component: AccountingTransactionsComponent },
  { path: 'analytics', component: AccountingAnalyticsComponent },
  { path: 'invoices', component: AccountingInvoicesComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountingRoutingModule { }
