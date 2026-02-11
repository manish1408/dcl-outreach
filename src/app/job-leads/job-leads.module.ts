import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JobLeadsRoutingModule } from './job-leads-routing.module';
import { JobLeadsComponent } from './job-leads.component';

@NgModule({
  declarations: [
    JobLeadsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    JobLeadsRoutingModule
  ]
})
export class JobLeadsModule { }
