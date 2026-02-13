import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LinkedInLeadsComponent } from './linkedin-leads.component';

const routes: Routes = [
  { path: '', component: LinkedInLeadsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LinkedInLeadsRoutingModule { }
