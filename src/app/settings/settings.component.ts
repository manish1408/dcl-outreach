import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../_services/authentication.service';
import { Route, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { UserService } from '../_services/user.service';
import { LocalStorageService } from '../_services/local-storage.service';
import { EventService } from '../_services/event.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  loading: boolean = false;
  settingsForm!: FormGroup;
  user: any;
  imgFiles: any[] = [];
  imageTypes = ['jpeg', 'webp', 'jpg', 'png'];
  allowedMimes = ['image/jpeg', 'image/webp','image/jpg','image/png'];
  maxSize = 3 * 1024 * 1024;
  widgetImageDetail:any;
  widgetImage: any;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private toastr: ToastrService,
    private userService: UserService,
    private localStorageService: LocalStorageService,
    private eventService: EventService<any>
  ) {
    this.settingsForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      companyName: ['', Validators.required],
      address: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      zip: ['', Validators.required],
      taxId: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.loadUser();
  }

  loadUser() {
    this.user = this.userService.getUserDetails();
    this.patchForm();
  }

  patchForm() {
    this.settingsForm.patchValue({
      name: this.user.name,
      email: this.user.email,
      phone: this.user.phone,
      companyName: this.user.companyName,
      address: this.user.address,
      state: this.user.state,
      country: this.user.country,
      zip: this.user.zip,
      taxId: this.user.taxId,
    });
    this.widgetImageDetail = this.user.widgetImage.length ?  this.user.widgetImage[0] : null;

  }

  hasError(controlName: keyof typeof this.settingsForm.controls) {
    return (
      this.settingsForm.controls[controlName].invalid &&
      this.settingsForm.controls[controlName].touched
    );
  }
  onSubmit(): void {
    this.settingsForm.markAllAsTouched();
    if (this.settingsForm.valid) {
      this.loading = true;

      let fd = new FormData();
      if (this.imgFiles.length > 0) {
        const filesToAdd = this.imgFiles.filter((file) => file instanceof File);
        console.log(filesToAdd);
        filesToAdd.forEach((f) => fd.append(`files`, f));      
      }  
      const reqObj = {
        userId: this.user._id,
        name: this.settingsForm.value.name,
        phone: this.settingsForm.value.phone,
        companyName: this.settingsForm.value.companyName,
        address: this.settingsForm.value.address,
        state: this.settingsForm.value.state,
        country: this.settingsForm.value.country,
        zip: this.settingsForm.value.zip,
        taxId: this.settingsForm.value.taxId,
        widgetImage:this.widgetImageDetail ? [this.widgetImageDetail] : [],
      };
      console.log('reqObj: ', reqObj);


      if (this.imgFiles.length > 0) {
        this.saveWidgetImage(reqObj)
      }
      else{
        this.saveUserDetails(reqObj);
      }
      // this.authService
      //   .updateProfile(reqObj)
      //   .pipe(finalize(() => (this.loading = false)))
      //   .subscribe({
      //     next: (res) => {
      //       if (res.result) {
      //         this.localStorageService.setItem(
      //           'MILO-USER',
      //           JSON.stringify(res.data)
      //         );
      //         this.eventService.dispatchEvent({ type: 'PROFILE_UPDATED' });
      //         this.toastr.success('Updated');
      //       } else {
      //         this.toastr.error(res.msg);
      //       }
      //     },
      //     error: (err) => {
      //       console.log(err);
      //       this.toastr.error(err.error.msg);
      //     },
      //   });
    } else {
      console.log('Form is invalid');
    }
  }

  onSelect(event: any) {
    for (const file of event.addedFiles) {
      if (file.size > this.maxSize) {
        this.toastr.error(`File exceeds the maximum size of 3 MB.`);
        return;
      }
      if (!this.allowedMimes.includes(file.type)) {
        this.toastr.error(` Unsupported File type.`);
        return;
      }
    }
    this.widgetImage = event.addedFiles[0];
    this.imgFiles = [];
    this.imgFiles.unshift(...event.addedFiles);
    this.widgetImageDetail = null;
  }

  getImageSrc(): string {
    return URL.createObjectURL(this.widgetImage);
  }

  saveWidgetImage(reqObj: any) {
    if (this.imgFiles.length > 0) {
      const filesToAdd = this.imgFiles.filter((file) => file instanceof File);
      console.log(filesToAdd);
      let fd = new FormData();
      filesToAdd.forEach((f) => fd.append(`files`, f));
      fd.append('userId', this.user._id);

      this.authService
        .saveWidgetImage(fd)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (res) => {
            if (res.result) {
              reqObj
              reqObj.widgetImage.push(res.data.widgetImage[0]);
              this.saveUserDetails(reqObj);
            } else {
              this.toastr.error(res.msg);
            }
          },
          error: (err) => {
            console.log(err);
            this.toastr.error(err.error.msg);
          },
        });
    }
  }

  saveUserDetails(reqObj: any) {
    this.authService
    .updateProfile(reqObj)
    .pipe(finalize(() => (this.loading = false)))
    .subscribe({
      next: (res) => {
        if (res.result) {
          this.localStorageService.setItem(
            'MILO-USER',
            JSON.stringify(res.data)
          );
          this.eventService.dispatchEvent({ type: 'PROFILE_UPDATED' });
          this.toastr.success('Updated');
          this.loadUser();
        } else {
          this.toastr.error(res.msg);
        }
      },
      error: (err) => {
        console.log(err);
        this.toastr.error(err.error.msg);
      },
    });
  }

}
