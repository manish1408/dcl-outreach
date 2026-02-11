import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobLeadsComponent } from './job-leads.component';

const routes: Routes = [
  { path: '', component: JobLeadsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobLeadsRoutingModule { }
