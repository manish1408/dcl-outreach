import { Component, ViewChild } from '@angular/core';
import { AuthenticationService } from '../_services/authentication.service';
import { NgOtpInputComponent, NgOtpInputConfig } from 'ng-otp-input';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, switchMap, tap } from 'rxjs';
import { LocalStorageService } from '../_services/local-storage.service';
import { ToastrService } from 'ngx-toastr';
import { EventService } from '../_services/event.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
})
export class VerifyEmailComponent {
  isVideoPlaying = false;
  email!: string;
  isCheckingOTP: boolean = false;
  config: NgOtpInputConfig = {
    allowNumbersOnly: true,
    length: 6,
    isPasswordInput: false,
    disableAutoFocus: false,
    containerClass: 'd-flex gap-3 justify-content-center align-items-center',
    inputStyles: {
      background: '#ffffff',
      border: '2px solid rgb(180 193 212)',
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
  code: FormControl = new FormControl(null, {
    validators: [Validators.required, Validators.minLength(6)],
  });

  constructor(
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router,
    private localStorageService: LocalStorageService,
    private toastr: ToastrService,
    private eventService: EventService<any>
  ) {}
  ngOnInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      this.email = params['email'];
    });
  }
  playVideo(): void {
    this.isVideoPlaying = true;
  }
  onOtpChange(otp: any) {}
  onSubmit() {
    if (this.code.value.length === 6) {
      this.isCheckingOTP = true;
      const reqObj = {
        otp: this.code.value,
        email: this.email,
      };
      this.authService
        .validateLogin(reqObj)
        .pipe(
          tap(() => (this.isCheckingOTP = true)),
          switchMap((res) => {
            console.log('RES', res);
            if (!res.result) {
              this.toastr.error(res.msg);
              throw new Error('Login validation failed');
            }
            this.localStorageService.setItem(
              'MILO-USER-TOKEN',
              res.data.authToken
            );
            const userId = res.data.user._id;
            return this.authService.onboardUser({ userId }).pipe(
              tap((_res) => {
                console.log('OnboardRes', _res);
                if (_res.result) {
                  this.localStorageService.setItem(
                    'MILO-USER',
                    JSON.stringify(_res.data.user)
                  );
                  localStorage.setItem(
                    'selectedChatbot',
                    JSON.stringify(_res.data.user?.chatbots[0] ?? {})
                  );
                  this.eventService.dispatchEvent({ type: 'LOGIN_CHANGE' });
                  this.router.navigate(['/dashboard'], {
                    queryParams: { id: _res.data.user?.chatbots[0]?.chatbotId },
                  });
                }
              })
            );
          }),
          finalize(() => (this.isCheckingOTP = false))
        )
        .subscribe({
          error: (err) => {
            console.error(err);
            this.ngOtpInputRef.otpForm.enable();
            if (err.message !== 'Login validation failed') {
              this.toastr.error(err.error?.msg ?? 'An error occurred');
            }
          },
        });
    } else {
      this.toastr.error('Code is required');
    }
  }
}
