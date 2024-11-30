import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowsJabRoutingModule } from './workflows-jab-routing.module';
import { WorkflowsJabComponent } from './workflows-jab.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedPipe } from '../_pipes/shared.pipe';
import { NgxDropzoneModule } from 'ngx-dropzone';


@NgModule({
  declarations: [
    WorkflowsJabComponent
  ],
  imports: [
    CommonModule,
    WorkflowsJabRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedPipe,
    NgxDropzoneModule,
  ]
})
export class WorkflowsJabModule { }
