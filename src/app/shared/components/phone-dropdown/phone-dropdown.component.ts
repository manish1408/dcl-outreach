import { Component, EventEmitter, Output } from '@angular/core';
import { PHONE_BOOK } from './phone-codes';

@Component({
  selector: 'app-phone-dropdown',
  templateUrl: './phone-dropdown.component.html',
  styleUrl: './phone-dropdown.component.scss',
})
export class PhoneDropdownComponent {
  countries: any = PHONE_BOOK;
  filteredCountries: any = PHONE_BOOK;
  searchTerm = '';
  dropdownOpen = false;
  selectedCountry: any = PHONE_BOOK[0];
  @Output() countrySelected = new EventEmitter<any>();
  constructor() {}

  ngOnInit() {
    this.countrySelected.emit(this.selectedCountry);
  }
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
  closeDropdown() {
    this.dropdownOpen = false;
  }
  onSearch() {
    this.filteredCountries = this.countries.filter((country: any) =>
      country.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  selectCountry(country: any) {
    this.selectedCountry = country;
    this.dropdownOpen = false;
    this.countrySelected.emit(this.selectedCountry);
  }
}
