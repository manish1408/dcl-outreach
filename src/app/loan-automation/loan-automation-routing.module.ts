import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoanAutomationComponent } from './loan-automation.component';
import { LoanDetailsVerificationPage } from './loan-details-verification-page/loan-details-verification-page.component';
import { LoanSummaryComponent } from './loan-summary-page/loan-summary-page.component';

const routes: Routes = [
  { path: '', component: LoanAutomationComponent },
  { path: 'loan-details', component: LoanDetailsVerificationPage },
  { path: 'loan-summary', component: LoanSummaryComponent }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoanAutomationRoutingModule { }
