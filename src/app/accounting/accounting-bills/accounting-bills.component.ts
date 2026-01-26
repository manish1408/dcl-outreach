import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccountingService, Bill } from '../../_services/accounting.service';
import { AccountingFilterService } from '../../_services/accounting-filter.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize, takeUntil } from 'rxjs';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-accounting-bills',
  templateUrl: './accounting-bills.component.html',
  styleUrl: './accounting-bills.component.scss'
})
export class AccountingBillsComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  bills: Bill[] = [];
  showBillForm: boolean = false;
  billForm: FormGroup;
  editingBill: Bill | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private accountingService: AccountingService,
    private filterService: AccountingFilterService,
    private fb: FormBuilder
  ) {
    this.billForm = this.fb.group({
      clientName: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
      billDate: ['', Validators.required],
      fileLink: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadBills();
    this.filterService.dateFilter$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadBills();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBills() {
    const filter = this.filterService.getCurrentFilter();
    this.loading = true;
    this.accountingService.getBills()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res) => {
          let bills = res.data;
          
          if (filter.startDate) {
            bills = bills.filter(bill => {
              const billDate = new Date(bill.billDate);
              return billDate >= filter.startDate!;
            });
          }
          if (filter.endDate) {
            const endDate = new Date(filter.endDate);
            endDate.setHours(23, 59, 59, 999);
            bills = bills.filter(bill => {
              const billDate = new Date(bill.billDate);
              return billDate <= endDate;
            });
          }
          
          this.bills = bills;
        },
        error: (err) => {
          Swal.fire('Error', 'Failed to load bills', 'error');
        }
      });
  }

  openCreateForm() {
    this.editingBill = null;
    this.billForm.reset({
      clientName: '',
      amount: 0,
      billDate: '',
      fileLink: ''
    });
    this.showBillForm = true;
  }

  openEditForm(bill: Bill) {
    this.editingBill = bill;
    this.billForm.patchValue({
      clientName: bill.clientName,
      amount: bill.amount,
      billDate: this.formatDateForInput(bill.billDate),
      fileLink: bill.fileLink
    });
    this.showBillForm = true;
  }

  saveBill() {
    if (this.billForm.valid) {
      const formValue = this.billForm.value;
      const billData: any = {
        clientName: formValue.clientName,
        amount: formValue.amount,
        billDate: new Date(formValue.billDate),
        uploadedDate: this.editingBill ? this.editingBill.uploadedDate : new Date(),
        fileLink: formValue.fileLink
      };

      if (this.editingBill) {
        this.accountingService.updateBill(this.editingBill.id, billData)
          .subscribe({
            next: () => {
              Swal.fire('Success', 'Bill updated successfully', 'success');
              this.loadBills();
              this.closeForm();
            },
            error: (err) => {
              Swal.fire('Error', 'Failed to update bill', 'error');
            }
          });
      } else {
        this.accountingService.createBill(billData)
          .subscribe({
            next: () => {
              Swal.fire('Success', 'Bill created successfully', 'success');
              this.loadBills();
              this.closeForm();
            },
            error: (err) => {
              Swal.fire('Error', 'Failed to create bill', 'error');
            }
          });
      }
    }
  }

  deleteBill(bill: Bill) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.accountingService.deleteBill(bill.id)
          .subscribe({
            next: () => {
              Swal.fire('Deleted!', 'Bill has been deleted', 'success');
              this.loadBills();
            },
            error: (err) => {
              Swal.fire('Error', 'Failed to delete bill', 'error');
            }
          });
      }
    });
  }

  closeForm() {
    this.showBillForm = false;
    this.editingBill = null;
    this.billForm.reset();
  }

  formatDateForInput(date: Date | string): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }
}
