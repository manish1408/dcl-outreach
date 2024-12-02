import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PromptsRoutingModule } from './customers-routing.module';
import { CustomersComponent } from './customers.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { SharedPipe } from '../_pipes/shared.pipe';


@NgModule({
  declarations: [
    CustomersComponent
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
export class CustomersModule { }
