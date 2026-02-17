import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../_services/authentication.service';
import { LocalStorageService } from '../_services/local-storage.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { EventService } from '../_services/event.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss',
})
export class SigninComponent {
  loading: boolean = false;
  loginForm!: FormGroup;
  isVideoPlaying = false;
  passwordType: string = 'password';
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private localStorageService: LocalStorageService,
    private toastr: ToastrService,
    private eventService: EventService<any>
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      terms: [false],
    });
  }
  playVideo(): void {
    this.isVideoPlaying = true;
  }
  showPassword(type: string) {
    this.passwordType = type === 'password' ? 'text' : 'password';
  }
  hasError(controlName: keyof typeof this.loginForm.controls) {
    return (
      this.loginForm.controls[controlName].invalid &&
      this.loginForm.controls[controlName].touched
    );
  }
  onSubmit(): void {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) {
      if (!this.loginForm.value.terms) {
        this.toastr.error('Please agree to Terms of Service.');
        return;
      }
      this.loading = true;
      const reqObj = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
      };

      this.authService
        .signin(reqObj)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (res) => {
            if (res.success) {
              this.localStorageService.setItem(
                'MILO-USER-TOKEN',
                res.data.token
              );
              this.localStorageService.setItem(
                'MILO-USER',
                JSON.stringify(res.data.user)
              );

              this.eventService.dispatchEvent({ type: 'LOGIN_CHANGE' });
              this.router.navigate(['/job-leads']);
            } else {
              this.toastr.error(res.msg || 'Signin failed');
            }
          },
          error: (err) => {
            this.toastr.error(err.error?.msg || err.error?.message || 'An error occurred during signin');
          },
        });
    }
  }
}
