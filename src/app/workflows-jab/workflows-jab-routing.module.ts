import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkflowsJabComponent } from './workflows-jab.component';

const routes: Routes = [{ path: '', component: WorkflowsJabComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowsJabRoutingModule { }
