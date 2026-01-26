import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccountingRoutingModule } from './accounting-routing.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AccountingOverviewComponent } from './accounting-overview/accounting-overview.component';
import { AccountingTransactionsComponent } from './accounting-transactions/accounting-transactions.component';
import { AccountingInvoicesComponent } from './accounting-invoices/accounting-invoices.component';
import { AccountingBillsComponent } from './accounting-bills/accounting-bills.component';
import { AccountingNavComponent } from './accounting-nav/accounting-nav.component';
import { AccountingSettingsComponent } from './accounting-settings/accounting-settings.component';
import { NgxDropzoneModule } from 'ngx-dropzone';

@NgModule({
  declarations: [
    AccountingOverviewComponent,
    AccountingTransactionsComponent,
    AccountingInvoicesComponent,
    AccountingBillsComponent,
    AccountingNavComponent,
    AccountingSettingsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxChartsModule,
    NgxDropzoneModule,
    AccountingRoutingModule
  ]
})
export class AccountingModule { }
