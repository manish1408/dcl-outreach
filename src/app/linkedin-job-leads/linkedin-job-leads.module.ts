import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LinkedInJobLeadsRoutingModule } from './linkedin-job-leads-routing.module';
import { LinkedInJobLeadsComponent } from './linkedin-job-leads.component';

@NgModule({
  declarations: [
    LinkedInJobLeadsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LinkedInJobLeadsRoutingModule
  ]
})
export class LinkedInJobLeadsModule { }
