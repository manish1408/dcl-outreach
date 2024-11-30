import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { AuthenticationService } from '../../_services/authentication.service';
import { LocalStorageService } from '../../_services/local-storage.service';
import { UserService } from '../../_services/user.service';
import { EventService } from '../../_services/event.service';
import { AadhaarService } from '../../_services/aadhar.service';

@Component({
  selector: 'app-loan-details-verification-page',
  templateUrl: './loan-details-verification-page.component.html',
  styleUrl: './loan-details-verification-page.component.scss',
})
export class LoanDetailsVerificationPage {
  loading: boolean = false;
  apiLoading:boolean = false;
  settingsForm!: FormGroup;
  user: any;
  imgFiles: any[] = [];
  imageTypes = ['jpeg', 'webp', 'jpg', 'png'];
  allowedMimes = ['image/jpeg', 'image/webp','image/jpg','image/png'];
  maxSize = 3 * 1024 * 1024;
  widgetImageDetail:any;
  widgetImage: any;
  loanAmountInWords: string = '';
  aadhaarNumber: string = '745008680917';
  message: string = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private aadhaarService: AadhaarService,
    private authService: AuthenticationService,
    private toastr: ToastrService,
    private userService: UserService,
    private localStorageService: LocalStorageService,
    private eventService: EventService<any>
  ) {
    this.settingsForm = this.fb.group({
      employmentType: ['', Validators.required],
      professionalType: ['', Validators.required],
      experience: ['', Validators.required],
      city: ['', Validators.required],
      grossAnnualIncome: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      loanAmount: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      emis: ['', [Validators.required, Validators.pattern('^[0-9]*$')]]
    });
  }

  ngOnInit() {
    this.generateOtp();
  }


  authenticate(): void {
    this.aadhaarService.authenticate().subscribe(
      () => {
        this.message = 'Authentication successful!';
      },
      error => {
        this.message = 'Authentication failed. Please check your API credentials.';
        console.error(error);
      }
    );
  }

  generateOtp(): void {
    if (this.aadhaarNumber.length === 12) {
      this.aadhaarService.generateOtp(this.aadhaarNumber).subscribe(
        response => {
          this.message = response.message;
          // Handle the reference_id as needed
        },
        error => {
          this.message = 'Error generating OTP. Please try again.';
          console.error(error);
        }
      );
    } else {
      this.message = 'Please enter a valid 12-digit Aadhaar number.';
    }
  }
  convertToIndianCurrencyInWords(amount: number): string {
    // Function to convert numbers to words in Indian currency format
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', 'Thousand', 'Lakh', 'Crore'];

    if (amount === 0) return 'Zero';

    let words = '';
    let numStr = amount.toString();
    let groupIndex = 0;

    while (numStr.length > 0) {
      let group;
      if (groupIndex === 0) {
        group = numStr.slice(-3);
        numStr = numStr.slice(0, -3);
      } else {
        group = numStr.slice(-2);
        numStr = numStr.slice(0, -2);
      }

      let num = parseInt(group, 10);
      if (num !== 0) {
        let groupWords = '';
        if (num > 10 && num < 20) {
          groupWords = teens[num - 11];
        } else {
          if (num >= 20 || num === 10) groupWords += tens[Math.floor(num / 10)];
          if (num % 10 !== 0) groupWords += ' ' + units[num % 10];
        }

        words = groupWords + ' ' + thousands[groupIndex] + ' ' + words;
      }
      groupIndex++;
    }
    return words.trim() + ' Rupees Only';
  }


  onLoanAmountChange(): void {
    const loanAmount = this.settingsForm.get('loanAmount')?.value;
    if (loanAmount) {
      this.loanAmountInWords = this.convertToIndianCurrencyInWords(parseInt(loanAmount, 10));
    } else {
      this.loanAmountInWords = '';
    }
  }

  hasError(controlName: string): boolean {
    const control = this.settingsForm.get(controlName);
    return control?.invalid && (control.dirty || control.touched) || false;
  }

  onSubmit(): void {
    if (this.settingsForm.valid) {
      this.loading = true;

      // Save form data to session storage as a JSON array
      const formData = this.settingsForm.value;
      sessionStorage.setItem('loanFormData', JSON.stringify([formData]));

      // Redirect to /loan-automation/loan-summary
      this.router.navigate(['/loan-automation/loan-summary']);
    } else {
      this.settingsForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }

  nextBtn(){
    // this.router.navigate(['/loan-automation/loan-summary'])
  }

}
