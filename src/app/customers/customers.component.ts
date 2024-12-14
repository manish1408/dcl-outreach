import { Component, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
  allLeadList: any[] = [];
  currentPage: number = 1;
  searchText = new FormControl('');
  totalPages:number = 1;
  itemsPerPage:number = 20;
  leadDetail:any={ };
  itemsPerPageList:number[] = [10,20,50,100];
  pageNumber: number = 1;
  contacts: any[] = [
    { name: '', linkedin: '', email: '', phone1: '', phone2: '' } // Initial contact
  ];

  leadDetailForm!: FormGroup | any;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private toastService: ToastService,
    private leadService: LeadService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.leadDetailForm  = this.fb.group({
      aboutCompany: new FormControl(''),
      contacts: new FormArray([ this.createContactFormGroup()]),// Initialize with one empty contact
      initial_email: new FormControl(''),
      follow_up_1: new FormControl(''),
      follow_up_2: new FormControl(''),
      linkedin_follow_up: new FormControl(''),
      final_follow_up_linkedin: new FormControl(''),
      pptSlide: new FormControl('')
    });

    this.getAllLeads();
  }

  // addContact() {
  //   this.contacts.push({ name: '', linkedin: '', email: '', phone1: '', phone2: '' });
  // }

  // removeContact(index: number) {
  //   this.contacts.splice(index, 1);
  // }
  getAllLeads() {
    this.loading = true;
    const pagination = {
      pageNumber: this.currentPage,
      limit:this.itemsPerPage       // need to add in api  
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
   onPreviousButtonClick() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.pageNumber = this.currentPage;
      this.getAllLeads()
    }
  }

   onNextButtonClick() {
    this.currentPage++;
    this.pageNumber = this.currentPage;
    this.getAllLeads()
  }

  searchLead(){
    if(!this.searchText.value){
      this.allLeadList =[];
      this.totalPages =  1;
      this.currentPage = 1;
      this.pageNumber = 1;
      this.getAllLeads();
      return 
    }
    this.loading = true;
    this.leadService
    .searchLead(this.searchText.value)
    .pipe(finalize(() => (this.loading = false)))
    .subscribe({
      next: (res: any) => {
        if( res?.success ==  true && res?.data?.length){
          this.totalPages =  1;
          this.currentPage = 1;
          this.pageNumber = 1;
          this.allLeadList = res.data;
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

  getLeadDetail(rootDomainName:string){
    this.leadDetailForm.reset();
    this.leadService
    .getLeadDetail(rootDomainName)
    .pipe(finalize(() => (this.loading = false)))
    .subscribe({
      next: (res: any) => {
        if( res?.success ==  true && res?.data){
          this.leadDetail = res.data;
        } else{
          this.leadDetail =  { };
        }
      },
      error: (err) => {
        console.log('err: ', err);
        this.toastr.error(err.error.detail.error);
      },
    });
  }

  selectItemPerPage(number:number){
    this.itemsPerPage = number;
    this.getAllLeads();
  }

  onPageNumberChange() {
    if(this.pageNumber && this.pageNumber > 0  &&  this.pageNumber  <= this.totalPages){
      this.currentPage = this.pageNumber;
      this.getAllLeads();
    }
  }

  updateLeadDetail(){

    // need to update according to structure 
    const payload = {
      "aboutCompany": this.leadDetailForm.value.aboutCompany,
      "contacts": this.leadDetailForm.value.contacts,
      "initial_email": {
        "notes": this.leadDetailForm.value.initial_email,
        "status": "",
        "sent_on": ""
      },
      "follow_up_1": {
        "notes": this.leadDetailForm.value.follow_up_1,
        "status": "",
        "sent_on": ""
      },
      "follow_up_2": {
        "notes": this.leadDetailForm.value.follow_up_2,
        "status": "",
        "sent_on": ""
      },
      "linkedin_follow_up": {
        "notes": this.leadDetailForm.value.linkedin_follow_up,
        "status": "",
        "sent_on": ""
      },
      "final_follow_up_linkedin": {
        "notes": this.leadDetailForm.value.final_follow_up_linkedin,
        "status": "",
        "sent_on": ""
      },
      "pptSlide": ""
    }

    this.leadService
    .updateLead(payload,this.leadDetail._id)
    .pipe(finalize(() => (this.loading = false)))
    .subscribe({
      next: (res: any) => {
        if( res?.success ==  true){
          this.toastr.success("Leads Updated Successfully");
          this.closebutton.nativeElement.click();
        } 
      },
      error: (err) => {
        if(err.status == 422){
          this.toastr.error('Invalid Data Format');
        } else {
          this.toastr.error(err?.error?.detail?.error);
        }
      },
    });
  }

   addContact() {
    const contacts = (this.leadDetailForm.get('contacts') as FormArray);
    contacts.push(this.createContactFormGroup());
  }

  removeContact(index: number) {
    const contacts = (this.leadDetailForm.get('contacts') as FormArray);
    contacts.removeAt(index);
  }

    createContactFormGroup(): FormGroup {
      return new FormGroup({
        name: new FormControl('', Validators.required),
        linkedin: new FormControl('', Validators.required),
        email: new FormControl('', [Validators.required, Validators.email]),
        phone1: new FormControl('', Validators.required),
        phone2: new FormControl('', Validators.required),
        status: new FormControl('', Validators.required),
        sent_on: new FormControl('', Validators.required)
      });
    }

     createItem(): FormGroup {
    return this.fb.group({
      name: '',
      linkedin: '',
      email:'',
      phone1:'',
      phone2:''
    });
  }
}
