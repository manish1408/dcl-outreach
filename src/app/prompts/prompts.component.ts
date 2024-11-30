import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ToastService } from '../_services/toast.service';
import { Subject, finalize, takeUntil } from 'rxjs';
import { PromptService } from '../_services/prompts.service';




@Component({
  selector: 'app-prompts',
  templateUrl: './prompts.component.html',
  styleUrl: './prompts.component.scss'
})
export class PromptsComponent {
  @ViewChild('closebutton') closebutton: any;


  loading: boolean = false;
  addPrompt: FormGroup | any;
  allPromptsList: any[] = [];
  isEdit: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private toastService: ToastService,
    private promptService: PromptService,

  ) {}

  ngOnInit() {
    this.addPrompt = this.fb.group({
      promptText: ['', Validators.required],
      isActive: [false],
      promptId: [''],
    });



    this.getPromptsList();
  }


  hasError(controlName: keyof typeof this.addPrompt.controls) {
    return (
      this.addPrompt.controls[controlName].invalid &&
      this.addPrompt.controls[controlName].touched
    );
  }


  
  getPromptsList() {
    this.loading = true;
    this.promptService
      .getAllPrompts()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          console.log('res: ', res);
          if( res.prompts?.length){
            this.allPromptsList =  res.prompts;
          }
          else{
            this.allPromptsList =  [];

          }

        },
        error: (err) => {
          this.toastr.error(err.error.msg);
        },
      });
  }

  savePrompt() {
    this.addPrompt.markAllAsTouched();
    if (this.addPrompt.valid) {
      if (this.isEdit) {
        const reqObj = {
          promptText: this.addPrompt.value.promptText,
          isActive:  this.addPrompt.value.isActive,
          version: 1,
        };
        this.promptService
          .updatePrompt(reqObj,this.addPrompt.value.promptId)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: (res: any) => {
              if (res) {
                this.addPrompt.reset();
                this.isEdit = false;
                this.toastr.success('Prompt Updated Successfully');
                this.getPromptsList();
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
          promptText: this.addPrompt.value.promptText,
          isActive:  this.addPrompt.value.isActive,
          version: 1,
        };

        this.promptService
          .createPrompt(reqObj)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: (res: any) => {
              if (res.id) {
                this.addPrompt.reset();
                this.isEdit = false;
                this.toastr.success('Prompt Add Successfully');
                this.getPromptsList();
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

  deletePrompt(promptId: string) {
    this.toastService.showConfirm(
      'Are you sure?',
      'Delete the selected Prompt?',
      'Yes, delete it!',
      'No, cancel',
      () => {
        this.promptService
          .deletePrompt(promptId)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: (res: any) => {
              if (res.message) {
                this.toastr.success('Prompt Deleted Successfully');
                this.getPromptsList();
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

  editPrompt(prompt: any) {
    this.isEdit = true;
    this.addPrompt.patchValue({
      promptText: prompt.promptText,
      isActive: prompt.isActive,
      promptId: prompt._id,
    });
  }

  resetForm(){
    this.isEdit = false;
    this.addPrompt.patchValue({
      promptText: '',
      isActive: false,
      promptId: '',
    });  
  }

}
