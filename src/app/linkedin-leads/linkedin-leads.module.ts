import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LinkedInLeadsRoutingModule } from './linkedin-leads-routing.module';
import { LinkedInLeadsComponent } from './linkedin-leads.component';

@NgModule({
  declarations: [
    LinkedInLeadsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LinkedInLeadsRoutingModule
  ]
})
export class LinkedInLeadsModule { }
