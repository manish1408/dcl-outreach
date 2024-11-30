import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PhoneDropdownComponent } from './components/phone-dropdown/phone-dropdown.component';
import { ClickOutsideDirective } from '../_directives/click-outside.directive';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [PhoneDropdownComponent, ClickOutsideDirective],
  providers: [],
  exports: [PhoneDropdownComponent, ClickOutsideDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedModule {}
