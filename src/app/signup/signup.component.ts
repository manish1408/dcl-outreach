import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthenticationService } from '../_services/authentication.service';
import { Route, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  loading: boolean = false;
  signupForm!: FormGroup;
  passwordType: string = 'password';
  selectedCountry: any;
  isVideoPlaying = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: [
        '',
        [Validators.required, Validators.minLength(8), this.passwordValidator],
      ],
      terms: [false],
    });
  }
  playVideo(): void {
    this.isVideoPlaying = true;
  }
  hasError(controlName: keyof typeof this.signupForm.controls) {
    return (
      this.signupForm.controls[controlName].invalid &&
      this.signupForm.controls[controlName].touched
    );
  }
  getErrorMessage(controlName: keyof typeof this.signupForm.controls) {
    if (
      this.signupForm.controls[controlName].hasError('required') &&
      this.signupForm.controls[controlName].touched
    ) {
      return 'Password is required';
    }

    if (
      this.signupForm.controls[controlName].hasError('minlength') &&
      this.signupForm.controls[controlName].touched
    ) {
      return 'Password must be at least 8 characters long';
    }
    if (
      this.signupForm.controls[controlName].hasError('passwordStrength') &&
      this.signupForm.controls[controlName].touched
    ) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    return '';
  }
  passwordValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    const password = control.value;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (hasUpperCase && hasLowerCase && hasNumber) {
      return null;
    }

    return { passwordStrength: true };
  }
  showPassword(type: string) {
    this.passwordType = type === 'password' ? 'text' : 'password';
  }

  onCountrySelected(country: any) {
    this.selectedCountry = country;
  }
  onSubmit(): void {
    this.signupForm.markAllAsTouched();
    if (this.signupForm.valid) {
      if (!this.signupForm.value.terms) {
        this.toastr.error('Please agree to Terms of Service.');
        return;
      }
      this.loading = true;
      const reqObj = {
        name: this.signupForm.value.name,
        email: this.signupForm.value.email,
        phone: `${this.selectedCountry?.phone[0]} ${this.signupForm.value.phone}`,
        password: this.signupForm.value.password,
      };

      this.authService
        .createAccount(reqObj)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (res) => {
            if (res.result) {
              this.router.navigate(['/verify-email'], {
                queryParams: { email: reqObj?.email },
              });
            } else {
              this.toastr.error(res.msg);
            }
          },
          error: (err) => {
            console.log(err);
            this.toastr.error(err.error.msg);
          },
        });
    } else {
      console.log('Form is invalid');
    }
  }
}
