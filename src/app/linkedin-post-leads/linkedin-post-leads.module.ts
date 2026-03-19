import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LinkedInPostLeadsRoutingModule } from './linkedin-post-leads-routing.module';
import { LinkedInPostLeadsComponent } from './linkedin-post-leads.component';

@NgModule({
  declarations: [
    LinkedInPostLeadsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    LinkedInPostLeadsRoutingModule
  ]
})
export class LinkedInPostLeadsModule { }
