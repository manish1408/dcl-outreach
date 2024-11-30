import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatbotsRoutingModule } from './chatbots-routing.module';
import { ChatbotsComponent } from './chatbots.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgxDropzoneModule } from 'ngx-dropzone';
@NgModule({
  declarations: [ChatbotsComponent],
  imports: [
    CommonModule,
    ChatbotsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MonacoEditorModule.forRoot(),
    ColorPickerModule,
    NgxDropzoneModule
  ],
})
export class ChatbotsModule {}
