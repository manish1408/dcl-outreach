import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../_services/authentication.service';
import { UserService } from '../_services/user.service';
import { ChatService } from '../_services/chat.service';
import { EventService } from '../_services/event.service';
import { LocalStorageService } from '../_services/local-storage.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject, finalize, takeUntil } from 'rxjs';
import { ToastService } from '../_services/toast.service';

@Component({
  selector: 'app-all-chatbots',
  templateUrl: './all-chatbots.component.html',
  styleUrl: './all-chatbots.component.scss',
})
export class AllChatbotsComponent {
  formLoading: boolean = false;
  createChatbotForm: FormGroup | any;
  user: any;
  chatbots: any;
  loading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private userService: UserService,
    private chatService: ChatService,
    private eventService: EventService<any>,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private localStorageService: LocalStorageService,
    private toastService: ToastService
  ) {
    this.user = this.userService.getUserDetails();
  }

  ngOnInit() {
    this.createChatbotForm = this.fb.group({
      chatbotName: ['', Validators.required],
      chatbotDescription: ['', Validators.required],
    });
    this.getChatBotDetails();
  }

  hasError(controlName: keyof typeof this.createChatbotForm.controls) {
    return (
      this.createChatbotForm.controls[controlName].invalid &&
      this.createChatbotForm.controls[controlName].touched
    );
  }

  getChatBotDetails() {
    this.loading = true;
    this.chatService
      .getAllChatbotDetails()
      .pipe(
        finalize(() => {
          this.formLoading = false;
          this.loading = false;
        })
      )
      .subscribe({
        next: (res) => {
          if (res) {
            this.chatbots = res.data;
            console.log('  this.chatbots: ', this.chatbots);
          }
        },
        error: (err) => {
          this.toastr.error(err.error.msg);
        },
      });
  }
  createChatbot() {
    this.createChatbotForm.markAllAsTouched();
    if (this.createChatbotForm.valid) {
      const reqObj = {
        chatbotName: this.createChatbotForm.value.chatbotName,
        chatbotDescription: this.createChatbotForm.value.chatbotDescription,
        userId: this.user?._id,
      };
      this.chatService
        .createChatbot(reqObj)
        .pipe(finalize(() => (this.formLoading = false)))
        .subscribe({
          next: (res) => {
            if (res.result) {
              this.createChatbotForm.reset();
              this.toastr.success('Chatbot created');

              this.eventService.dispatchEvent({ type: 'PROFILE_UPDATED' });
              this.getChatBotDetails();
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

  deleteChatBot(chatbotId: string) {
    this.toastService.showConfirm(
      'Are you sure?',
      'Delete the selected chatbot?',
      'Yes, delete it!',
      'No, cancel',
      () => {
        this.chatService
          .deleteChatbot(chatbotId)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: (res: any) => {
              if (res.result) {
                this.toastr.success('Chatbot Deleted Successfully');
                this.localStorageService.removeItem('selectedChatbot');
                this.eventService.dispatchEvent({ type: 'PROFILE_UPDATED' });
                this.getChatBotDetails();
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
}
