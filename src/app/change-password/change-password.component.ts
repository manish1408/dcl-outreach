import { Component, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthenticationService } from '../_services/authentication.service';
import { LocalStorageService } from '../_services/local-storage.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../_services/user.service';
import { NgOtpInputComponent, NgOtpInputConfig } from 'ng-otp-input';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent {
  user: any;
  loading: boolean = false;
  changeForm!: FormGroup;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private localStorageService: LocalStorageService,
    private toastr: ToastrService,
    private userService: UserService
  ) {
    this.changeForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.user = this.userService.getUserDetails();
  }
  hasError(controlName: keyof typeof this.changeForm.controls) {
    return (
      this.changeForm.controls[controlName].invalid &&
      this.changeForm.controls[controlName].touched
    );
  }
  onSubmit(): void {
    this.changeForm.markAllAsTouched();
    if (this.changeForm.valid) {
      this.loading = true;
      const reqObj = {
        userId: this.user?._id,
        currentPassword: this.changeForm.value.currentPassword,
        newPassword: this.changeForm.value.newPassword,
      };

      this.authService
        .changePassword(reqObj)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (res) => {
            if (res.result) {
              this.toastr.success('Password Changed');
              this.signOut();
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
  async signOut(): Promise<void> {
    this.authService.signOut();
    this.router.navigate(['/login']);
  }
}
