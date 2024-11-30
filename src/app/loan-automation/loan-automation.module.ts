import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoanAutomationComponent } from './loan-automation.component';
import { LoanAutomationRoutingModule } from './loan-automation-routing.module';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { LoanDetailsVerificationPage } from './loan-details-verification-page/loan-details-verification-page.component';
import { LoanSummaryComponent } from './loan-summary-page/loan-summary-page.component';
import { NgxGaugeModule } from 'ngx-gauge';
import { NgOtpInputModule } from 'ng-otp-input';


@NgModule({
  declarations: [
    LoanAutomationComponent,
    LoanDetailsVerificationPage,
    LoanSummaryComponent
  ],
  imports: [
    NgxGaugeModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    NgOtpInputModule,
    LoanAutomationRoutingModule,
    NgxDropzoneModule,
  ]
})
export class LoanAutomationModule { }
