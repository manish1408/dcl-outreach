import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FilesAndDataRoutingModule } from './files-and-data-routing.module';
import { FilesAndDataComponent } from './files-and-data.component';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [FilesAndDataComponent],
  imports: [
    CommonModule,
    FilesAndDataRoutingModule,
    NgxDropzoneModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class FilesAndDataModule {}
