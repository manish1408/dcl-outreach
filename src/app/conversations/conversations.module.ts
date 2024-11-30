import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConversationsRoutingModule } from './conversations-routing.module';
import { ConversationsComponent } from './conversations.component';
import { FormsModule } from '@angular/forms';
import { SharedPipe } from '../_pipes/shared.pipe';


@NgModule({
  declarations: [
    ConversationsComponent
  ],
  imports: [
    CommonModule,
    ConversationsRoutingModule,
    FormsModule,
    SharedPipe
  ]
})
export class ConversationsModule { }
