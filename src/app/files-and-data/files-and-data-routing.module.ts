import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FilesAndDataComponent } from './files-and-data.component';

const routes: Routes = [{ path: '', component: FilesAndDataComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FilesAndDataRoutingModule { }
