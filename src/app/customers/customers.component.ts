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
  allLeadList: any[] = [];
  currentPage: number = 1;
  searchText = new FormControl('');
  totalPages:number = 1;
  itemsPerPage:number = 20;
  leadDetail:any={ };
  itemsPerPageList:number[] = [10,20,50,100];
  pageNumber: number = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private toastService: ToastService,
    private leadService: LeadService,
  ) {}

  ngOnInit() {
    this.getAllLeads();
  }

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
}
