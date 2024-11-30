import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InstallationRoutingModule } from './installation-routing.module';
import { InstallationComponent } from './installation.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    InstallationComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    InstallationRoutingModule
  ]
})
export class InstallationModule { }
