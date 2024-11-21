import { Component, ViewChild } from "@angular/core";
import { GenericService } from "../_services/generic.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ActivatedRoute, Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomerService } from '../_services/customer.service';

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent {
  pageData = null;
  loading = false;
  cdn = `${environment.profilePicCDN}/profiles/`;

  @ViewChild("editModal") editModal: any;
  customers: any[] = [];
  customerForm: FormGroup;
  isEditMode = false;
  editCustomerId: string | null = null;

  constructor(
    private genericService: GenericService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private customerService: CustomerService,
    private route: ActivatedRoute
  ) {
    this.customerForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: [''],
      phone: [''],
      linkedInUrl: [''],
      m1: [false],
      m2: [false],
      m3: [false],
      demoSent: [false],
      demoCreated: [false],
      demoOpened: [false],
    });
  }

  ngOnInit(): void {
    this.fetchCustomers();
  }

  fetchCustomers(): void {
    this.customerService.getCustomers(0,100).subscribe((data) => {
      this.customers = data;
    });
  }

  submitCustomer(): void {
    const customerData = this.customerForm.value;

    if (this.isEditMode && this.editCustomerId) {
      this.customerService.editCustomer(this.editCustomerId, customerData).subscribe(() => {
        this.fetchCustomers();
        this.resetForm();
      });
    } else {
      this.customerService.addCustomer(customerData).subscribe(() => {
        this.fetchCustomers();
        this.resetForm();
      });
    }
  }

  editCustomer(customer: any): void {
    this.isEditMode = true;
    this.editCustomerId = customer._id;
    this.customerForm.patchValue(customer);
  }

  deleteCustomer(id: string): void {
    this.customerService.deleteCustomer(id).subscribe(() => {
      this.fetchCustomers();
    });
  }

  resetForm(): void {
    this.isEditMode = false;
    this.editCustomerId = null;
    this.customerForm.reset();
  }
  
}
