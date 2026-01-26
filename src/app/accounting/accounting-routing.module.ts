import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountingOverviewComponent } from './accounting-overview/accounting-overview.component';
import { AccountingTransactionsComponent } from './accounting-transactions/accounting-transactions.component';
import { AccountingInvoicesComponent } from './accounting-invoices/accounting-invoices.component';
import { AccountingBillsComponent } from './accounting-bills/accounting-bills.component';
import { AccountingSettingsComponent } from './accounting-settings/accounting-settings.component';

const routes: Routes = [
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
  { path: 'overview', component: AccountingOverviewComponent },
  { path: 'transactions', component: AccountingTransactionsComponent },
  { path: 'invoices', component: AccountingInvoicesComponent },
  { path: 'bills', component: AccountingBillsComponent },
  { path: 'settings', component: AccountingSettingsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountingRoutingModule { }
