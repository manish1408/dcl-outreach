import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LinkedInJobLeadsComponent } from './linkedin-job-leads.component';

const routes: Routes = [
  { path: '', component: LinkedInJobLeadsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LinkedInJobLeadsRoutingModule { }
