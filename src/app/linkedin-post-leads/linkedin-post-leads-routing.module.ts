import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LinkedInPostLeadsComponent } from './linkedin-post-leads.component';

const routes: Routes = [
  { path: '', component: LinkedInPostLeadsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LinkedInPostLeadsRoutingModule { }
