import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize} from 'rxjs';
import { ToastService } from '../_services/toast.service';
import { GuidanceService } from '../_services/guidance.service';

@Component({
  selector: 'app-guidance',
  templateUrl: './guidance.component.html',
  styleUrl: './guidance.component.scss',
})
export class GuidanceComponent {
  @ViewChild('closebutton') closebutton: any;

  loading: boolean = false;
  selectedChatBotId: string = '';
  addGuidance: FormGroup | any;
  allGuidanceList: any[] = [];
  isEdit: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private toastService: ToastService,
    private guidanceService: GuidanceService
  ) {}

  ngOnInit() {
    this.addGuidance = this.fb.group({
      when: ['', Validators.required],
      instruction: ['', Validators.required],
      guidanceId: [''],
    });

    this.route.queryParams.subscribe((params) => {
      this.selectedChatBotId = params['id'];
    });

    this.getAllGuidance();
  }

  hasError(controlName: keyof typeof this.addGuidance.controls) {
    return (
      this.addGuidance.controls[controlName].invalid &&
      this.addGuidance.controls[controlName].touched
    );
  }

  getAllGuidance() {
    this.loading = true;
    this.guidanceService
      .getAllGuidance(this.selectedChatBotId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          if (res.data) {
            this.allGuidanceList = res.data;
          }
        },
        error: (err) => {
          this.toastr.error(err.error.msg);
        },
      });
  }

  saveGuidance() {
    this.addGuidance.markAllAsTouched();
    if (this.addGuidance.valid) {
      if (this.isEdit) {
        const reqObj = {
          when: this.addGuidance.value.when,
          instruction: this.addGuidance.value.instruction,
          chatbotId: this.selectedChatBotId,
          guidanceId: this.addGuidance.value.guidanceId,
        };
        this.guidanceService
          .updateGuidance(reqObj)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: (res: any) => {
              if (res.result) {
                this.addGuidance.reset();
                this.isEdit = false;
                this.toastr.success('Guidance Updated Successfully');
                this.getAllGuidance();
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
          when: this.addGuidance.value.when,
          instruction: this.addGuidance.value.instruction,
          chatbotId: this.selectedChatBotId,
        };
        this.guidanceService
          .createGuidance(reqObj)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: (res: any) => {
              if (res.result) {
                this.addGuidance.reset();
                this.isEdit = false;
                this.toastr.success('Guidance Add Successfully');
                this.getAllGuidance();
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

  deleteGuidance(guidanceId: string) {
    this.toastService.showConfirm(
      'Are you sure?',
      'Delete the selected Guidance?',
      'Yes, delete it!',
      'No, cancel',
      () => {
        this.guidanceService
          .deleteGuidance(this.selectedChatBotId, guidanceId)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: (res: any) => {
              if (res.result) {
                this.toastr.success('Guidance Deleted Successfully');
                this.getAllGuidance();
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

  editGuidance(guidance: any) {
    this.isEdit = true;
    this.addGuidance.patchValue({
      when: guidance.when,
      instruction: guidance.instruction,
      guidanceId: guidance.guidanceId,
    });
  }
}
