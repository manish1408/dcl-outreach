import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccountingRoutingModule } from './accounting-routing.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AccountingOverviewComponent } from './accounting-overview/accounting-overview.component';
import { AccountingTransactionsComponent } from './accounting-transactions/accounting-transactions.component';
import { AccountingAnalyticsComponent } from './accounting-analytics/accounting-analytics.component';
import { AccountingInvoicesComponent } from './accounting-invoices/accounting-invoices.component';
import { AccountingNavComponent } from './accounting-nav/accounting-nav.component';

@NgModule({
  declarations: [
    AccountingOverviewComponent,
    AccountingTransactionsComponent,
    AccountingAnalyticsComponent,
    AccountingInvoicesComponent,
    AccountingNavComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxChartsModule,
    AccountingRoutingModule
  ]
})
export class AccountingModule { }
