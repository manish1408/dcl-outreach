import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GuidanceRoutingModule } from './guidance-routing.module';
import { GuidanceComponent } from './guidance.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    GuidanceComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    GuidanceRoutingModule
  ]
})
export class GuidanceModule { }
