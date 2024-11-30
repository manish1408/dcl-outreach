import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AllChatbotsRoutingModule } from './all-chatbots-routing.module';
import { AllChatbotsComponent } from './all-chatbots.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AllChatbotsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AllChatbotsRoutingModule
  ]
})
export class AllChatbotsModule { }
