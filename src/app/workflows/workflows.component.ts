import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ToastService } from '../_services/toast.service';
import { ToastrService } from 'ngx-toastr';
import { WorkFlowService } from '../_services/workflow.service';
import { WORKFLOW_FUNCTION_OPTIONS } from '../constant/shared-constant';

@Component({
  selector: 'app-workflows',
  templateUrl: './workflows.component.html',
  styleUrl: './workflows.component.scss',
})
export class WorkflowsComponent {
  @ViewChild('closebutton') closebutton: any;

  workFlowForm: FormGroup | any;
  workflowFunctionOptions = WORKFLOW_FUNCTION_OPTIONS;
  selectedChatBotId: string = '';
  allWorkFlowList: any[] = [];
  loading: boolean = false;
  isEdit: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private toastService: ToastService,
    private workFlowService: WorkFlowService
  ) {
    this.route.queryParams.subscribe((params) => {
      this.selectedChatBotId = params['id'];
    });
  }

  ngOnInit() {
    this.workFlowForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      chat: ['', Validators.required],
      action: ['', Validators.required],
      inputFunction: ['', Validators.required],
      workflowId: [''],
    });

    this.route.queryParams.subscribe((params) => {
      this.selectedChatBotId = params['id'];
    });

    this.getAllWorkFlows();
  }

  hasError(controlName: keyof typeof this.workFlowForm.controls) {
    return (
      this.workFlowForm.controls[controlName].invalid &&
      this.workFlowForm.controls[controlName].touched
    );
  }

  getAllWorkFlows() {
    this.loading = true;
    this.workFlowService
      .getAllWorkFlow(this.selectedChatBotId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          if (res.data) {
            this.allWorkFlowList = res.data;
          }
        },
        error: (err) => {
          this.toastr.error(err.error.msg);
        },
      });
  }

  saveWorkFlow() {
    this.workFlowForm.markAllAsTouched();
    if (this.workFlowForm.valid) {
      if (this.isEdit) {
        const reqObj = {
          name: this.workFlowForm.value.name,
          description: this.workFlowForm.value.description,
          chat: this.workFlowForm.value.chat,
          action: this.workFlowForm.value.action,
          inputFunction: this.workFlowForm.value.inputFunction,
          chatbotId: this.selectedChatBotId,
          workflowId: this.workFlowForm.value.workflowId,
        };
        this.workFlowService
          .updateWorkFlow(reqObj)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: (res: any) => {
              if (res.result) {
                this.workFlowForm.reset();
                this.isEdit = false;
                this.toastr.success('Workflow Updated Successfully');
                this.getAllWorkFlows();
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
          name: this.workFlowForm.value.name,
          description: this.workFlowForm.value.description,
          chat: this.workFlowForm.value.chat,
          action: this.workFlowForm.value.action,
          inputFunction: this.workFlowForm.value.inputFunction,
          chatbotId: this.selectedChatBotId,
        };
        this.workFlowService
          .createWorkFlow(reqObj)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: (res: any) => {
              if (res.result) {
                this.workFlowForm.reset();
                this.isEdit = false;
                this.toastr.success('Workflow Add Successfully');
                this.getAllWorkFlows();
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

  deleteWorkFlow(workflowId: string) {
    this.toastService.showConfirm(
      'Are you sure?',
      'Delete the selected Workflow?',
      'Yes, delete it!',
      'No, cancel',
      () => {
        this.workFlowService
          .deleteWorkFlow(this.selectedChatBotId, workflowId)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: (res: any) => {
              if (res.result) {
                this.toastr.success('Workflow Deleted Successfully');
                this.getAllWorkFlows();
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

  editWorkFlow(workflow: any) {
    this.isEdit = true;
    this.workFlowForm.patchValue({
      name: workflow.name,
      description: workflow.description,
      chat: workflow.chat,
      action: workflow.action,
      inputFunction: workflow.inputFunction,
      workflowId: workflow.workflowId,
    });
  }
}
