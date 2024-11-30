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

@Component({
  selector: 'app-interactions',
  templateUrl: './interactions.component.html',
  styleUrl: './interactions.component.scss',
})
export class InteractionsComponent {
  interactionForm: FormGroup | any;
  selectedChatBotId: string = '';
  loading: boolean = false;
  apiLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private toastService: ToastService,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.interactionForm = this.fb.group({
      welcomeMessage: ['', Validators.required],
      whenToAsk: [''],
      userData: this.fb.array([
        // this.fb.control(true), // Control for User name
        // this.fb.control(false), // Control for Email
        // this.fb.control(false),
      ]),
      feedback: [''],
    });

    this.route.queryParams.subscribe((params) => {
      this.selectedChatBotId = params['id'];
    });
    this.getInteraction();
  }

  hasError(controlName: keyof typeof this.interactionForm.controls) {
    return (
      this.interactionForm.controls[controlName].invalid &&
      this.interactionForm.controls[controlName].touched
    );
  }

  get userDataArray(): FormArray {
    return this.interactionForm.get('userData') as FormArray;
  }

  getInteraction() {
    this.apiLoading = true;
    this.chatService
      .getInteractions(this.selectedChatBotId)
      .pipe(finalize(() => (this.apiLoading = false)))
      .subscribe({
        next: (res: any) => {
          if (res.data) {
            console.log('res.data:  interaction s', res.data);

            this.interactionForm.patchValue({
              welcomeMessage: res.data.welcomeMessage,
              whenToAsk: res.data.whenToAsk,
              feedback: res.data.feedback,
            });
            const userDataArray = this.interactionForm.get(
              'userData'
            ) as FormArray;
            res.data.userData.forEach((value: any) => {
              userDataArray.push(new FormControl(value));
            });
          }
        },
        error: (err) => {
          this.toastr.error(err.error.msg);
        },
      });
  }

  getUserDataLabel(index: number): string {
    const labels = ['User name', 'Email', 'Phone'];
    return labels[index];
  }

  onSubmit() {
    this.interactionForm.markAllAsTouched();
    if (this.interactionForm.valid) {
      console.log('sdsdsdsd', this.interactionForm.value);

      const reqObj = {
        chatbotId: this.selectedChatBotId,
        interactions: this.interactionForm.value,
      };
      this.loading = true;
      this.chatService
        .updateInteractions(reqObj)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (res: any) => {
            if (res.data) {
              this.toastr.success('Interactions Updated Successfully');
            }
          },
          error: (err) => {
            this.toastr.error(err.error.msg);
          },
        });
    }
  }
}
