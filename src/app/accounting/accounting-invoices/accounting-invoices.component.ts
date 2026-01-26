import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccountingService, Invoice } from '../../_services/accounting.service';
import { AccountingFilterService } from '../../_services/accounting-filter.service';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { finalize, takeUntil } from 'rxjs';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-accounting-invoices',
  templateUrl: './accounting-invoices.component.html',
  styleUrl: './accounting-invoices.component.scss'
})
export class AccountingInvoicesComponent implements OnInit {
  loading: boolean = false;
  invoices: Invoice[] = [];
  showInvoiceForm: boolean = false;
  invoiceForm: FormGroup;
  editingInvoice: Invoice | null = null;
  showInvoiceDetails: boolean = false;
  selectedInvoice: Invoice | null = null;
  totalAmount: number = 0;
  paidAmount: number = 0;
  pendingAmount: number = 0;
  invoiceSubtotal: number = 0;
  invoiceTotal: number = 0;
  invoiceTax: number = 0;
  private destroy$ = new Subject<void>();

  showLogo: boolean = true;
  currency: string = 'INR';

  statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' }
  ];

  currencyOptions = [
    { value: 'INR', label: 'INR (₹)' },
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' }
  ];

  constructor(
    private accountingService: AccountingService,
    private filterService: AccountingFilterService,
    private fb: FormBuilder
  ) {
    this.invoiceForm = this.fb.group({
      invoiceNumber: ['', Validators.required],
      clientName: ['', Validators.required],
      clientEmail: ['', [Validators.required, Validators.email]],
      clientAddress: [''],
      issueDate: ['', Validators.required],
      dueDate: ['', Validators.required],
      status: ['draft', Validators.required],
      items: this.fb.array([this.createInvoiceItem()]),
      tax: [0],
      currency: ['INR'],
      showLogo: [true]
    });
  }

  ngOnInit() {
    this.loadInvoices();
    this.invoiceForm.get('tax')?.valueChanges.subscribe(() => {
      this.updateInvoiceFormTotals();
    });

    this.invoiceForm.get('showLogo')?.valueChanges.subscribe((value) => {
      this.showLogo = value;
    });

    this.invoiceForm.get('currency')?.valueChanges.subscribe((value) => {
      this.currency = value;
    });

    this.filterService.dateFilter$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadInvoices();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInvoices() {
    const filter = this.filterService.getCurrentFilter();
    this.loading = true;
    this.accountingService.getInvoices()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res) => {
          let invoices = res.data;
          
          if (filter.startDate) {
            invoices = invoices.filter(inv => {
              const issueDate = new Date(inv.issueDate);
              return issueDate >= filter.startDate!;
            });
          }
          if (filter.endDate) {
            const endDate = new Date(filter.endDate);
            endDate.setHours(23, 59, 59, 999);
            invoices = invoices.filter(inv => {
              const issueDate = new Date(inv.issueDate);
              return issueDate <= endDate;
            });
          }
          
          this.invoices = invoices;
          this.updateInvoiceTotals();
        },
        error: (err) => {
          console.error('Error loading invoices:', err);
          Swal.fire('Error', 'Failed to load invoices', 'error');
        }
      });
  }

  openCreateForm() {
    this.editingInvoice = null;
    
    // Clear existing items
    while (this.itemsFormArray.length !== 0) {
      this.itemsFormArray.removeAt(0);
    }
    this.addInvoiceItem();
    
    this.invoiceForm.reset({
      invoiceNumber: this.generateInvoiceNumber(),
      status: 'draft',
      tax: 0,
      currency: 'INR',
      showLogo: true
    });
    this.showLogo = true;
    this.currency = 'INR';
    this.updateInvoiceFormTotals();
    this.showInvoiceForm = true;
  }

  openEditForm(invoice: Invoice) {
    this.editingInvoice = invoice;
    
    // Clear existing items
    while (this.itemsFormArray.length !== 0) {
      this.itemsFormArray.removeAt(0);
    }
    
    // Add invoice items
    if (invoice.items && invoice.items.length > 0) {
      invoice.items.forEach(item => {
        const itemForm = this.createInvoiceItem();
        itemForm.patchValue({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount
        }, { emitEvent: false });
        this.itemsFormArray.push(itemForm);
      });
    } else {
      this.addInvoiceItem();
    }
    
    const invoiceData: any = {
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      issueDate: this.formatDateForInput(invoice.issueDate),
      dueDate: this.formatDateForInput(invoice.dueDate),
      status: invoice.status,
      tax: invoice.tax ? invoice.tax : 0,
      currency: (invoice as any).currency ? (invoice as any).currency : 'INR',
      showLogo: (invoice as any).showLogo !== undefined ? (invoice as any).showLogo : true
    };

    if ((invoice as any).clientAddress) {
      invoiceData.clientAddress = (invoice as any).clientAddress;
    }

    this.invoiceForm.patchValue(invoiceData);
    this.showLogo = invoiceData.showLogo;
    this.currency = invoiceData.currency;
    this.updateInvoiceFormTotals();
    this.showInvoiceForm = true;
  }

  saveInvoice() {
    if (this.invoiceForm.valid) {
      const formValue = this.invoiceForm.value;
      const items = this.itemsFormArray.value.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount ? item.amount : (item.quantity * item.rate)
      }));
      
      const invoiceData: any = {
        invoiceNumber: formValue.invoiceNumber,
        clientName: formValue.clientName,
        clientEmail: formValue.clientEmail,
        clientAddress: formValue.clientAddress,
        issueDate: new Date(formValue.issueDate),
        dueDate: new Date(formValue.dueDate),
        status: formValue.status,
        items: items,
        tax: formValue.tax ? formValue.tax : 0,
        currency: formValue.currency ? formValue.currency : 'INR',
        showLogo: formValue.showLogo !== undefined ? formValue.showLogo : true,
        amount: this.calculateTotal(items, formValue.tax || 0),
        total: this.calculateTotal(items, formValue.tax || 0)
      };

      if (this.editingInvoice) {
        this.accountingService.updateInvoice(this.editingInvoice.id, invoiceData)
          .subscribe({
            next: () => {
              Swal.fire('Success', 'Invoice updated successfully', 'success');
              this.loadInvoices();
              this.closeForm();
              this.updateInvoiceTotals();
            },
            error: (err) => {
              Swal.fire('Error', 'Failed to update invoice', 'error');
            }
          });
      } else {
        this.accountingService.createInvoice(invoiceData)
          .subscribe({
            next: () => {
              Swal.fire('Success', 'Invoice created successfully', 'success');
              this.loadInvoices();
              this.closeForm();
              this.updateInvoiceTotals();
            },
            error: (err) => {
              Swal.fire('Error', 'Failed to create invoice', 'error');
            }
          });
      }
    }
  }

  deleteInvoice(invoice: Invoice) {
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
        this.accountingService.deleteInvoice(invoice.id)
          .subscribe({
            next: () => {
              Swal.fire('Deleted!', 'Invoice has been deleted', 'success');
              this.loadInvoices();
              this.updateInvoiceTotals();
            },
            error: (err) => {
              Swal.fire('Error', 'Failed to delete invoice', 'error');
            }
          });
      }
    });
  }

  viewInvoice(invoice: Invoice) {
    this.selectedInvoice = invoice;
    this.showInvoiceDetails = true;
  }

  closeForm() {
    this.showInvoiceForm = false;
    this.editingInvoice = null;
    this.invoiceForm.reset();
  }

  closeDetails() {
    this.showInvoiceDetails = false;
    this.selectedInvoice = null;
  }

  generateInvoiceNumber(): string {
    const prefix = 'INV';
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
  }

  formatDateForInput(date: Date | string): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  calculateTotal(items: any[], tax: number): number {
    const subtotal = items.reduce((sum, item) => {
      const amount = item.amount ? item.amount : 0;
      return sum + amount;
    }, 0);
    return subtotal + tax;
  }

  statusClassMap: { [key: string]: string } = {
    'draft': 'bg-secondary',
    'sent': 'bg-info',
    'paid': 'bg-success',
    'overdue': 'bg-danger'
  };

  updateInvoiceTotals() {
    this.totalAmount = this.invoices.reduce((sum, inv) => sum + inv.total, 0);
    this.paidAmount = this.invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);
    this.pendingAmount = this.invoices
      .filter(inv => inv.status !== 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);
  }

  updateInvoiceFormTotals() {
    const items = this.itemsFormArray.value;
    this.invoiceSubtotal = items.reduce((sum: number, item: any) => {
      const amount = item.amount ? item.amount : 0;
      return sum + amount;
    }, 0);
    const taxValue = this.invoiceForm.get('tax');
    this.invoiceTax = taxValue ? taxValue.value : 0;
    this.invoiceTotal = this.invoiceSubtotal + this.invoiceTax;
  }

  get itemsFormArray(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  createInvoiceItem(): FormGroup {
    const item = this.fb.group({
      description: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      rate: [0, [Validators.required, Validators.min(0)]],
      amount: [0]
    });
    item.valueChanges.subscribe(() => this.calculateItemAmount(item));
    return item;
  }

  addInvoiceItem() {
    const item = this.createInvoiceItem();
    this.itemsFormArray.push(item);
  }

  removeInvoiceItem(index: number) {
    this.itemsFormArray.removeAt(index);
    if (this.itemsFormArray.length === 0) {
      this.addInvoiceItem();
    }
  }

  calculateItemAmount(itemForm: FormGroup) {
    const quantityControl = itemForm.get('quantity');
    const rateControl = itemForm.get('rate');
    const quantity = quantityControl ? quantityControl.value : 0;
    const rate = rateControl ? rateControl.value : 0;
    const amount = quantity * rate;
    itemForm.patchValue({ amount }, { emitEvent: false });
    this.updateInvoiceFormTotals();
  }

  calculateItemAmountByIndex(index: number) {
    const itemForm = this.itemsFormArray.at(index) as FormGroup;
    this.calculateItemAmount(itemForm);
  }

  getInvoiceProperty(invoice: Invoice, property: string): any {
    return (invoice as any)[property];
  }

  getInvoiceShowLogo(invoice: Invoice): boolean {
    const showLogo = (invoice as any).showLogo;
    return showLogo !== undefined ? showLogo : true;
  }

  getInvoiceCurrency(invoice: Invoice): string {
    const currency = (invoice as any).currency;
    return currency ? currency : 'INR';
  }

  getInvoiceClientAddress(invoice: Invoice): string {
    return (invoice as any).clientAddress ? (invoice as any).clientAddress : '';
  }

  getCurrencySymbol(currency: string): string {
    switch (currency) {
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      case 'INR':
      default:
        return '₹';
    }
  }

}
