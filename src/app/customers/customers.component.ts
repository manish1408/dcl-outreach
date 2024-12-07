import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ToastService } from '../_services/toast.service';
import { Subject, finalize, takeUntil } from 'rxjs';
import { PromptService } from '../_services/prompts.service';
import { LeadService } from '../_services/leads.service';




@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent {
  @ViewChild('closebutton') closebutton: any;


  loading: boolean = false;
  addCustomers: FormGroup | any;
  allLeadList: any[] = [];
  isEdit: boolean = false;
  currentPage: number = 1;
  searchText = new FormControl('');
  totalPages:number = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private toastService: ToastService,
    private promptService: PromptService,
    private leadService: LeadService,

  ) {}

  ngOnInit() {
    this.addCustomers = this.fb.group({
      promptText: ['', Validators.required],
      isActive: [false],
      promptId: [''],
    });



    this.getAllLeads();
  }


  hasError(controlName: keyof typeof this.addCustomers.controls) {
    return (
      this.addCustomers.controls[controlName].invalid &&
      this.addCustomers.controls[controlName].touched
    );
  }


  
  getAllLeads() {
    this.loading = true;
    const pagination = {
      pageNumber: this.currentPage
    }
    this.leadService
      .getAllLeads(pagination)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          if( res?.success ==  true && res?.data?.leads?.length){
            this.totalPages =  res.data.pagination.totalPages;
            this.allLeadList = res.data.leads;
          }
          else{
            this.allLeadList =  [];
          }
        },
        error: (err) => {
          this.toastr.error(err.error.detail.error);
        },
      });
  }

  savePrompt() {
    this.addCustomers.markAllAsTouched();
    if (this.addCustomers.valid) {
      if (this.isEdit) {
        const reqObj = {
          promptText: this.addCustomers.value.promptText,
          isActive:  this.addCustomers.value.isActive,
          version: 1,
        };
        this.promptService
          .updatePrompt(reqObj,this.addCustomers.value.promptId)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: (res: any) => {
              if (res) {
                this.addCustomers.reset();
                this.isEdit = false;
                this.toastr.success('Prompt Updated Successfully');
                this.getAllLeads();
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
          promptText: this.addCustomers.value.promptText,
          isActive:  this.addCustomers.value.isActive,
          version: 1,
        };

        this.promptService
          .createPrompt(reqObj)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: (res: any) => {
              if (res.id) {
                this.addCustomers.reset();
                this.isEdit = false;
                this.toastr.success('Prompt Add Successfully');
                this.getAllLeads();
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
                this.getAllLeads();
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
    this.addCustomers.patchValue({
      promptText: prompt.promptText,
      isActive: prompt.isActive,
      promptId: prompt._id,
    });
  }

  resetForm(){
    this.isEdit = false;
    this.addCustomers.patchValue({
      promptText: '',
      isActive: false,
      promptId: '',
    });  
  }

   onPreviousButtonClick() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getAllLeads()
    }
  }

   onNextButtonClick() {
    this.currentPage++;
    this.getAllLeads()
  }

  searchLead(){
    console.log('search Text', this.searchText.value);
    this.leadService
    .searchLead(this.searchText.value)
    .pipe(finalize(() => (this.loading = false)))
    .subscribe({
      next: (res: any) => {
        console.log('res: ', res);
        // if( res?.success ==  true && res?.data?.leads?.length){
        //   this.totalPages =  res.data.pagination.totalPages;
        //   this.allLeadList = res.data.leads;
        // }
        // else{
        //   this.allLeadList =  [];
        // }
      },
      error: (err) => {
        console.log('err: ', err);
        this.toastr.error(err.error.detail.error);
      },
    });
  }

}
