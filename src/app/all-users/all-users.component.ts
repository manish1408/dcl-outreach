import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from '../_services/local-storage.service';
import { UserService } from '../_services/user.service';
import { ToastrService } from 'ngx-toastr';
import { ToastService } from '../_services/toast.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.component.html',
  styleUrl: './all-users.component.scss',
})
export class AllUsersComponent {
  @ViewChild('closebutton') closebutton: any;

  loading: boolean = false;
  selectedChatBotId: string = '';
  addUser: FormGroup | any;
  allUserList: any[] = [];
  isEdit: boolean = false;
  user: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private localStorageService: LocalStorageService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.addUser = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      role: ['', Validators.required],
      chatbotId: ['', Validators.required],
      userId: [''],
    });

    this.route.queryParams.subscribe((params) => {
      this.selectedChatBotId = params['id'];
    });
    this.user = this.userService.getUserDetails();
    console.log(' this.user: ', this.user);
    this.getAllUser();
  }

  hasError(controlName: keyof typeof this.addUser.controls) {
    return (
      this.addUser.controls[controlName].invalid &&
      this.addUser.controls[controlName].touched
    );
  }

  getAllUser() {
    this.loading = true;
    this.userService
      .getAllUser(this.user.accountId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          if (res.data) {
            this.allUserList = res.data;
          }
        },
        error: (err) => {
          this.toastr.error(err.error.msg);
        },
      });
  }

  saveUser() {
    this.addUser.markAllAsTouched();
    if (this.addUser.valid) {
      if (this.isEdit) {
        const reqObj = {
          name: this.addUser.value.name,
          email: this.addUser.value.email,
          role: this.addUser.value.role,
          chatbotId: this.addUser.value.chatbotId,
          userId: this.addUser.value.userId,
        };
        this.userService
          .updateUser(reqObj)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: (res: any) => {
              if (res.result) {
                this.addUser.reset();
                this.isEdit = false;
                this.toastr.success('User Updated Successfully');
                this.getAllUser();
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
        const reqObj = {
          name: this.addUser.value.name,
          email: this.addUser.value.email,
          role: this.addUser.value.role,
          chatbotIds: [this.addUser.value.chatbotId],
          accountId: this.user.accountId,
        };

        this.userService
          .createUser(reqObj)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: (res: any) => {
              if (res.result) {
                this.addUser.reset();
                this.isEdit = false;
                this.toastr.success('User Add Successfully');
                this.getAllUser();
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
      this.closebutton.nativeElement.click();
    }
  }

  deleteUser(userId: string) {
    this.toastService.showConfirm(
      'Are you sure?',
      'Delete the selected user?',
      'Yes, delete it!',
      'No, cancel',
      () => {
        this.userService
          .deleteUser(userId)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: (res: any) => {
              if (res.result) {
                this.toastr.success('User Deleted Successfully');
                this.getAllUser();
              } else {
                this.toastr.error(res.msg);
              }
            },
            error: (err) => {
              console.log(err);
              this.toastr.error(err.error.msg);
            },
          });
      },
      () => {
        // Cancel callback
      }
    );
  }

  editUser(user: any) {
    this.isEdit = true;
    this.addUser.patchValue({
      name: user.name,
      email: user.email,
      role: user.role,
      userId: user._id,
      chatbotId: user?.chatbots[0]?.chatbotId,
    });
  }
}
