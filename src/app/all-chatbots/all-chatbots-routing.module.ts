import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllChatbotsComponent } from './all-chatbots.component';

const routes: Routes = [{ path: '', component: AllChatbotsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AllChatbotsRoutingModule { }
