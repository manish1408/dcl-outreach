import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PromptsRoutingModule } from './prompts-routing.module';
import { PromptsComponent } from './prompts.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { SharedPipe } from '../_pipes/shared.pipe';


@NgModule({
  declarations: [
    PromptsComponent
  ],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    PromptsRoutingModule,
    NgxDropzoneModule,
    SharedPipe
  ]
})
export class PromptsModule { }
