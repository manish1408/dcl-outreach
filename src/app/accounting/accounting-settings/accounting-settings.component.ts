import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AccountingService } from '../../_services/accounting.service';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-accounting-settings',
  templateUrl: './accounting-settings.component.html',
  styleUrl: './accounting-settings.component.scss'
})
export class AccountingSettingsComponent implements OnInit {
  uploadForm: FormGroup;
  transactionFiles: any[] = [];
  billFiles: any[] = [];
  transactionValidation = false;
  billValidation = false;
  loadingTransactions = false;
  loadingBills = false;
  uploadedFiles: any[] = [];
  loadingFiles = false;
  allowedMimes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ];
  maxSize = 10 * 1024 * 1024;

  constructor(
    private fb: FormBuilder,
    private accountingService: AccountingService,
    private toastr: ToastrService,
    private http: HttpClient
  ) {
    this.uploadForm = this.fb.group({});
  }

  ngOnInit() {
    this.getUploadedFiles();
  }

  getUploadedFiles() {
    this.loadingFiles = true;
    this.http.get(`${environment.APIUrl}/accounting/uploaded-files`)
      .pipe(finalize(() => (this.loadingFiles = false)))
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.uploadedFiles = res.data;
          }
        },
        error: (err) => {
          this.toastr.error(err?.error?.message || 'Error fetching uploaded files');
        }
      });
  }

  onSelectTransactions(event: any) {
    for (const file of event.addedFiles) {
      if (this.allowedMimes.includes(file.type)) {
        if (file.size <= this.maxSize) {
          this.transactionFiles.push(file);
          this.transactionValidation = false;
        } else {
          this.toastr.error('File size exceeds 10MB limit');
        }
      } else {
        this.toastr.error('Only Excel files (.xlsx, .xls, .csv) are allowed');
      }
    }
  }

  onSelectBills(event: any) {
    for (const file of event.addedFiles) {
      if (this.allowedMimes.includes(file.type)) {
        if (file.size <= this.maxSize) {
          this.billFiles.push(file);
          this.billValidation = false;
        } else {
          this.toastr.error('File size exceeds 10MB limit');
        }
      } else {
        this.toastr.error('Only Excel files (.xlsx, .xls, .csv) are allowed');
      }
    }
  }

  onRemoveTransaction(event: any, file: any) {
    event.stopPropagation();
    const index = this.transactionFiles.indexOf(file);
    if (index > -1) {
      this.transactionFiles.splice(index, 1);
    }
  }

  onRemoveBill(event: any, file: any) {
    event.stopPropagation();
    const index = this.billFiles.indexOf(file);
    if (index > -1) {
      this.billFiles.splice(index, 1);
    }
  }

  isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  getFileIcon(fileType: string): string {
    if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || fileType === 'xlsx') {
      return 'assets/images/icons8-excel.png';
    }
    if (fileType === 'application/vnd.ms-excel' || fileType === 'xls') {
      return 'assets/images/icons8-excel.png';
    }
    if (fileType === 'text/csv' || fileType === 'csv') {
      return 'assets/images/icons8-excel.png';
    }
    return 'assets/icons/file-upload.svg';
  }

  openFileLink(fileUrl: string) {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  }

  onSubmitTransactions() {
    if (this.transactionFiles.length > 0) {
      this.loadingTransactions = true;
      const filesToAdd = this.transactionFiles.filter((file) => file instanceof File);
      const fd = new FormData();
      filesToAdd.forEach((f) => fd.append('file', f));
      fd.append('type', 'transactions');

      this.http.post(`${environment.APIUrl}/accounting/upload-excel`, fd)
        .pipe(finalize(() => (this.loadingTransactions = false)))
        .subscribe({
          next: (res: any) => {
            if (res.success) {
              this.toastr.success('Transactions file uploaded successfully');
              this.transactionFiles = [];
              this.getUploadedFiles();
            } else {
              this.toastr.error(res.message || 'Upload failed');
            }
          },
          error: (err) => {
            this.toastr.error(err?.error?.message || 'Error uploading file');
            this.loadingTransactions = false;
          }
        });
    } else {
      this.transactionValidation = true;
    }
  }

  onSubmitBills() {
    if (this.billFiles.length > 0) {
      this.loadingBills = true;
      const filesToAdd = this.billFiles.filter((file) => file instanceof File);
      const fd = new FormData();
      filesToAdd.forEach((f) => fd.append('file', f));
      fd.append('type', 'bills');

      this.http.post(`${environment.APIUrl}/accounting/upload-excel`, fd)
        .pipe(finalize(() => (this.loadingBills = false)))
        .subscribe({
          next: (res: any) => {
            if (res.success) {
              this.toastr.success('Bills file uploaded successfully');
              this.billFiles = [];
              this.getUploadedFiles();
            } else {
              this.toastr.error(res.message || 'Upload failed');
            }
          },
          error: (err) => {
            this.toastr.error(err?.error?.message || 'Error uploading file');
            this.loadingBills = false;
          }
        });
    } else {
      this.billValidation = true;
    }
  }
}
