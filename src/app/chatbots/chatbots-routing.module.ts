import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatbotsComponent } from './chatbots.component';

const routes: Routes = [{ path: '', component: ChatbotsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatbotsRoutingModule { }
