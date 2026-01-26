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
  imgFiles: any[] = [];
  imgValidation = false;
  loading = false;
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
  }

  onSelect(event: any) {
    for (const file of event.addedFiles) {
      if (this.allowedMimes.includes(file.type)) {
        if (file.size <= this.maxSize) {
          this.imgFiles.push(file);
          this.imgValidation = false;
        } else {
          this.toastr.error('File size exceeds 10MB limit');
        }
      } else {
        this.toastr.error('Only Excel files (.xlsx, .xls, .csv) are allowed');
      }
    }
  }

  onRemove(event: any, file: any) {
    event.stopPropagation();
    const index = this.imgFiles.indexOf(file);
    if (index > -1) {
      this.imgFiles.splice(index, 1);
    }
  }

  isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  getFileIcon(fileType: string): string {
    return 'assets/icons/file-upload.svg';
  }

  onSubmitExcel() {
    if (this.imgFiles.length > 0) {
      this.loading = true;
      const filesToAdd = this.imgFiles.filter((file) => file instanceof File);
      const fd = new FormData();
      filesToAdd.forEach((f) => fd.append('file', f));

      this.http.post(`${environment.APIUrl}/accounting/upload-excel`, fd)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (res: any) => {
            if (res.success) {
              this.toastr.success('Excel file uploaded successfully');
              this.imgFiles = [];
            } else {
              this.toastr.error(res.message || 'Upload failed');
            }
          },
          error: (err) => {
            this.toastr.error(err?.error?.message || 'Error uploading file');
            this.loading = false;
          }
        });
    } else {
      this.imgValidation = true;
    }
  }
}
