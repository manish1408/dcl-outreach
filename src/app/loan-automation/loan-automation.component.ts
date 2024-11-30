import { Component, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../_services/toast.service';
import { ToastrService } from 'ngx-toastr';
import { ChatService } from '../_services/chat.service';
import { Subject, finalize, takeUntil } from 'rxjs';
import { LoanAutomationService } from './loan-automation.service';
import { FileType, LoanAutomationFileData } from './loan-automation.const';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgOtpInputComponent, NgOtpInputConfig } from 'ng-otp-input';

declare var jQuery:any;

@Component({
  selector: 'app-loan-automation',
  templateUrl: './loan-automation.component.html',
  styleUrl: './loan-automation.component.scss',
})
export class LoanAutomationComponent {
  loading: boolean = false;
  imgValidation = false;
  imgFiles: any[] = [];
  apiLoading: boolean = false;
  maxSize = 10 * 1024 * 1024;
  panCardFile: string = '';
  bankStatementFile: string = '';
  proofAddressFile: string = '';
  identifyType: string = 'adharCard';
  addressType: string = 'adharCard';
  proofOfIdentity: string = '';
  validateAadhar = false;
  uploadLoader = false;
  allowedMimes = [
    'image/jpeg',
    'image/webp',
    'image/jpg',
    'image/png',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ];
  code: FormControl = new FormControl('', [Validators.required]);

  config: NgOtpInputConfig = {
    allowNumbersOnly: true,
    length: 6,
    isPasswordInput: false,
    disableAutoFocus: false,
    containerClass: 'd-flex gap-3 justify-content-start align-items-center',
    inputStyles: {
      background: '#ffffff',
      border: '1px solid #ebedef',
      'border-radius': '0.5rem',
      'font-weight': '500',
      'margin-bottom': '0',
      'margin-right': '0',
      width: '44px',
      height: '44px',
      'font-size': '16px',
    },
    inputClass: 'otp-input-box',
  };

  @ViewChild('ngOtpInput') ngOtpInputRef!: NgOtpInputComponent;

  private apiUrl = 'https://transaction-extraction-api.ambitioussea-e176fcf4.centralindia.azurecontainerapps.io/api/v1/transaction-extractor';
  
  selectedFile:any;
  extractedData: any;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private toastService: ToastService,
    private chatService: ChatService,
    private http: HttpClient,
    private loanAutomationService: LoanAutomationService
  ) {}

  ngOnInit() {}

  onSelect(event: any, documentType: string) {
    const documentIndex: number = LoanAutomationFileData.findIndex(
      (fileInfo: any) => {
        if (documentType === FileType.Identify && this.identifyType) {
          return (
            fileInfo.type === documentType &&
            this.identifyType === fileInfo.name
          );
        } else if (documentType === FileType.ProofAddress && this.addressType) {
          return (
            fileInfo.type === documentType && this.addressType === fileInfo.name
          );
        } else if (documentType === FileType.PanCard) {
          return fileInfo.type === documentType;
        } else if (documentType === FileType.BankStatement) {
          return fileInfo.type === documentType;
        }
        this.toastr.error('Please Select File Type');
        return false;
      }
    );

    if (documentIndex > -1) {
      for (const file of event.addedFiles) {
        if (file.size > this.maxSize) {
          this.toastr.error(`File exceeds the maximum size of 10MB.`);
          return;
        }
        if (!this.allowedMimes.includes(file.type)) {
          this.toastr.error(` Unsupported File type.`);
          return;
        }
      }
      this.imgValidation = false;
      this.imgFiles.push(...event.addedFiles);

      this.uploadDocument(documentIndex, documentType);
    }
  }
  onOtpChange(otp: any) {}

  onFileSelected(event: any, documentType: string): void {
    this.selectedFile = event.addedFiles[0];
    if(documentType === 'bank statement') {
      this.bankStatementFile = this.selectedFile.name;
    }
    this.onBankstatementUpload();
  }

  onBankstatementUpload(): void {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      this.http.post(this.apiUrl, formData).subscribe(
        (response) => {
          this.extractedData = response;
          sessionStorage.setItem("bankStatement", JSON.stringify(response));
          this.errorMessage = '';
        },
        (error) => {
          this.errorMessage = 'An error occurred during extraction. Please try again.';
          console.error(error);
        }
      );
    } else {
      this.errorMessage = 'Please select a file to upload.';
    }
  }

  isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  getFileIcon(fileType: string): string {
    switch (fileType) {
      case 'application/pdf':
        return '/assets/icons/pdf.svg';
      case 'pdf':
        return '/assets/icons/pdf.svg';
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return '/assets/images/icons8-excel.png';
      case 'text/plain':
        return '/assets/images/icons8-text.png';
      default:
        return '/assets/images/icons8-text.png';
    }
  }

  getImageSrc(file: File): string {
    return URL.createObjectURL(file);
  }

  onRemove(event: any, f: any) {
    console.log(f);
    event.stopPropagation();
    const blobIndex = this.imgFiles.findIndex((file) => file === f);
    if (blobIndex !== -1) {
      this.imgFiles.splice(blobIndex, 1);
    }
  }

  uploadDocument(documentIndex: number, documentType:string) {
    this.uploadLoader = true;
    const filesToAdd = this.imgFiles.filter((file) => file instanceof File);
    console.log(filesToAdd);
    let fd = new FormData();
    filesToAdd.forEach((f) => fd.append(`files`, f));
    fd.append(
      'extractionId',
      LoanAutomationFileData[documentIndex].extractionId
    );
    fd.append('batchId', LoanAutomationFileData[documentIndex].batchId);

    if (LoanAutomationFileData[documentIndex]?.batchId) {
      this.loanAutomationService
        .uploadFileApi(fd)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (res: any) => {
            if (res.status == 'uploaded') {
              this.toastr.success('File Uploaded Successfully');
              this.uploadLoader = false;
              this.imgFiles = [];

              if(documentType === 'proof identify') {
                this.proofOfIdentity = filesToAdd[0].name;
              } else if(documentType === 'pan card') {
                this.panCardFile = filesToAdd[0].name;
              } else if(documentType === 'bank statement') {
                this.bankStatementFile = filesToAdd[0].name;
              } else if(documentType === 'proof address') {
                this.proofAddressFile = filesToAdd[0].name;
              }

              setTimeout(() => {
                this.getBatchResults(documentIndex);
              }, 10000);
            }
          },
          error: (err) => {
            this.toastr.error(err?.error?.msg);
            this.uploadLoader = false;
            this.imgFiles = [];
          },
        });
    } else {
      this.toastr.error('BatchId & ExtractionId Required');
      this.imgFiles = [];
      this.uploadLoader = false;
    }
  }

  getBatchResults(documentIndex: number) {
    const data: any = {
      extractionId: LoanAutomationFileData[documentIndex].extractionId,
      batchId: LoanAutomationFileData[documentIndex].batchId,
    };
    this.loanAutomationService
      .batchResultsApi(data)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          if (res.batchId && res.files?.length) {
            if (documentIndex === 3) {
              sessionStorage.setItem("pan", JSON.stringify(res.files[res.files.length - 1].result));
            } else if (documentIndex === 1 || documentIndex === 6) {
              sessionStorage.setItem("passport", JSON.stringify(res.files[res.files.length - 1].result));
            } else if (documentIndex === 0 || documentIndex === 5) {
              sessionStorage.setItem("aadhar", JSON.stringify(res.files[res.files.length - 1].result));
            }
          }
        },
        error: (err) => {
          this.toastr.error(err?.error?.msg);
        },
      });

    this.imgFiles = [];
  }

  identifyTypeChange(event: Event, label: string) {
    this.identifyType = label;
  }

  addressTypeChange(event: Event, label: string) {
    this.addressType = label;
  }

  nextStep(step:any) {
   
    if (step == 1) {
      if(this.proofOfIdentity === '') {
        this.toastService.showError("Please upload proof of Identity");
      } else if(this.panCardFile === '') {
        this.toastService.showError("Please upload your PAN");
      } else if(this.bankStatementFile === '') {
        this.toastService.showError("Please upload your bank statement");
      } else if(this.proofAddressFile === '') {
        this.toastService.showError("Please upload proof of address");
      } else {
        // this.router.navigateByUrl("/loan-automation/loan-details");
        jQuery('#verificationModal').modal('show');
      }
    }
  }
  submitAadharOTP() {
    if (!this.code.value) {
      this.toastr.error('Otp is required');
      return;
    } else if (this.code.value === '999999') {
      this.toastr.success('Verifying');
      this.loading = true;
      this.validateAadhar = true;
      setTimeout(() => {
      this.loading = false;
      this.toastr.success('Your Aadhar verification is successfull.');
      this.validateAadhar = false;
      jQuery('#verificationModal').modal('hide');
      this.router.navigateByUrl("/loan-automation/loan-details");
      }, 15000);
    } else {
      this.toastr.error('Incorrect OTP');
    }
   
  }

  
}
