import { Component, ViewChild } from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { ToastService } from "../_services/toast.service";
import { finalize } from "rxjs";
import { LeadService } from "../_services/leads.service";
import { colorSets } from "@swimlane/ngx-charts";

@Component({
  selector: "app-customers",
  templateUrl: "./customers.component.html",
  styleUrl: "./customers.component.scss",
})
export class CustomersComponent {
  @ViewChild("closebutton") closebutton: any;

  loading: boolean = false;
  allLeadList: any[] = [];
  currentPage: number = 1;
  searchText = new FormControl("");
  filterInputValue = new FormControl("");
  totalPages: number = 1;
  itemsPerPage: number = 20;
  leadDetail: any = {};
  itemsPerPageList: number[] = [10, 20, 50, 100];
  pageNumber: number = 1;
  generatingMessage = false;
  sortSelection: any = {
    filedName: "vertical",
    sortValue: "desc",
    text: "Vertical Descending",
  };
  filterType: string = "vertical";
  sortingArray = [
    {
      filedName: "social",
      sortValue: "asc",
      text: "Social Ascending",
    },
    {
      filedName: "social",
      sortValue: "desc",
      text: "Social Descending",
    },
    {
      filedName: "employees",
      sortValue: "asc",
      text: "Employees Ascending",
    },
    {
      filedName: "employees",
      sortValue: "desc",
      text: "Employees Descending",
    },
    {
      filedName: "vertical",
      sortValue: "asc",
      text: "Vertical Ascending",
    },
    {
      filedName: "vertical",
      sortValue: "desc",
      text: "Vertical Descending",
    },
    {
      filedName: "pageRank",
      sortValue: "asc",
      text: "Page Rank Ascending",
    },
    {
      filedName: "pageRank",
      sortValue: "desc",
      text: "Page Rank Descending",
    },
  ];
  filtersArray: string[] = ["state", "city", "vertical", "country", "isQualified", "isReviewed"];

  leadDetailForm!: FormGroup | any;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private toastService: ToastService,
    private leadService: LeadService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.leadDetailForm = this.fb.group({
      aboutCompany: new FormControl(""),
      contacts: new FormArray([this.createContactFormGroup()]), // Initialize with one empty contact
      initial_email: new FormControl(""),
      follow_up_1: new FormControl(""),
      follow_up_2: new FormControl(""),
      linkedin_follow_up: new FormControl(""),
      final_follow_up_linkedin: new FormControl(""),
      pptSlide: new FormControl(""),
    });
    if(this.route.snapshot.queryParams["page"]) {
      this.currentPage = this.route.snapshot.queryParams["page"];
    }
    this.getAllLeads();
  }

  // Get the contacts FormArray
  get contacts(): FormArray {
    return this.leadDetailForm.get("contacts") as FormArray;
  }

  getAllLeads() {
    this.loading = true;

    const pagination: any = {
      pageNumber: this.currentPage,
      limit: this.itemsPerPage, // need to add in api
      sort: [
        {
          filedName: this.sortSelection.filedName,
          sortValue: this.sortSelection.sortValue,
        },
      ],
      filter: this.filterInputValue.value
        ? [
            {
              filterName: this.filterType,
              filterValue: this.filterInputValue.value,
            },
          ]
        : [],
    };
    this.leadService
      .getAllLeads(pagination)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          if (res?.success == true && res?.data?.leads?.length) {
            this.totalPages = res.data.pagination.totalPages;
            this.allLeadList = res.data.leads;
          } else {
            this.allLeadList = [];
          }
        },
        error: (err) => {
          this.toastr.error(err.error.detail.error);
        },
      });
  }

  // Function to populate the form with server data
  populateForm(data: any): void {
    this.leadDetailForm.patchValue({
      aboutCompany: data?.aboutCompany || "",
      pptSlide: data?.pptSlide || "",
      initial_email: data?.initial_email?.emailBody || "",
      follow_up_1: data?.follow_up_1?.emailBody || "",
      follow_up_2: data?.follow_up_2?.emailBody || "",
      linkedin_follow_up: data?.linkedin_follow_up?.emailBody || "",
      final_follow_up_linkedin: data?.final_follow_up_linkedin?.emailBody || "",
    });

    // Populate contacts array
    if (data?.contacts?.length) {
      const contactsArray = this.leadDetailForm.get("contacts") as FormArray;
      contactsArray.clear(); // Clear existing form controls
      (data.contacts || []).forEach((contact: any) => {
        contactsArray.push(
          this.fb.group({
            name: [contact?.name || "", Validators.required],
            linkedin: [contact?.linkedin || "", Validators.required],
            email: [
              contact?.email || "",
              [Validators.required, Validators.email],
            ],
            phone1: contact?.phone1 || "",
            phone2: contact?.phone2 || "",
            status: contact?.status || "",
            sent_on: contact?.sent_on || "",
          })
        );
      });
    } else {
      const contactsArray = this.leadDetailForm.get("contacts") as FormArray;
      contactsArray.clear(); // Clear existing form controls
      contactsArray.push(this.createContactFormGroup());
    }
  }

  searchLead() {
    if (!this.searchText.value) {
      this.allLeadList = [];
      this.totalPages = 1;
      this.currentPage = 1;
      this.pageNumber = 1;
      this.getAllLeads();
      return;
    }
    this.loading = true;
    this.leadService
      .searchLead(this.searchText.value)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          if (res?.success == true && res?.data?.length) {
            this.totalPages = 1;
            this.currentPage = 1;
            this.pageNumber = 1;
            this.allLeadList = res.data;
          } else {
            this.allLeadList = [];
          }
        },
        error: (err) => {
          this.toastr.error(err.error.detail.error);
        },
      });
  }

  getLeadDetail(rootDomainName: string) {
    this.leadDetailForm.reset();
    this.leadService
      .getLeadDetail(rootDomainName)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          if (res?.success == true && res?.data) {
            this.leadDetail = res.data;
            this.populateForm(this.leadDetail);
          } else {
            this.leadDetail = {};
          }
        },
        error: (err) => {
          console.log("err: ", err);
          this.toastr.error(err.error.detail.error);
        },
      });
  }

  onIsReviewedChange(lead: any) {
    let payload = JSON.parse(JSON.stringify(lead));
    let leadId = payload._id;
    delete payload._id;

    this.leadService
      .updateLead(payload, leadId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          if (res?.success == true) {
            this.toastr.success("Leads Updated Successfully");
            this.closebutton.nativeElement.click();
          }
        },
        error: (err) => {
          if (err.status == 422) {
            this.toastr.error("Invalid Data Format");
          } else {
            this.toastr.error(err?.error?.detail?.error);
          }
        },
      });
  }

  updateLeadDetail() {
    this.leadDetailForm.markAllAsTouched();
    if (this.leadDetailForm.valid) {
      if (this.leadDetail.initial_email === null) {
        this.leadDetail.initial_email = {};
      }
      if (this.leadDetail.follow_up_1 === null) {
        this.leadDetail.follow_up_1 = {};
      }
      if (this.leadDetail.follow_up_2 === null) {
        this.leadDetail.follow_up_2 = {};
      }
      if (this.leadDetail.linkedin_follow_up === null) {
        this.leadDetail.linkedin_follow_up = {};
      }
      if (this.leadDetail.final_follow_up_linkedin === null) {
        this.leadDetail.final_follow_up_linkedin = {};
      }
      this.leadDetail.aboutCompany = this.leadDetailForm.value.aboutCompany;
      this.leadDetail.contacts = this.leadDetailForm.value.contacts;
      this.leadDetail.initial_email["notes"] =
        this.leadDetailForm.value.initial_email;
      this.leadDetail.follow_up_1["notes"] =
        this.leadDetailForm.value.follow_up_1;
      this.leadDetail.follow_up_2["notes"] =
        this.leadDetailForm.value.follow_up_2;
      this.leadDetail.linkedin_follow_up["notes"] =
        this.leadDetailForm.value.linkedin_follow_up;
      this.leadDetail.final_follow_up_linkedin["notes"] =
        this.leadDetailForm.value.final_follow_up_linkedin;

      let payload = JSON.parse(JSON.stringify(this.leadDetail));
      let leadId = payload._id;
      delete payload._id;

      this.leadService
        .updateLead(payload, leadId)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (res: any) => {
            if (res?.success == true) {
              this.toastr.success("Leads Updated Successfully");
              this.closebutton.nativeElement.click();
            this.getAllLeads();
            }
          },
          error: (err) => {
            if (err.status == 422) {
              this.toastr.error("Invalid Data Format");
            } else {
              this.toastr.error(err?.error?.detail?.error);
            }
          },
        });
    } else {
      this.toastr.error("Fields are required in Contact Tab");
    }
  }

  addContact() {
    this.leadDetailForm.markAllAsTouched();
    if (this.leadDetailForm.valid) {
      const contacts = this.leadDetailForm.get("contacts") as FormArray;
      contacts.push(this.createContactFormGroup());
    }
  }

  removeContact(index: number) {
    const contacts = this.leadDetailForm.get("contacts") as FormArray;
    contacts.removeAt(index);
  }

  createContactFormGroup(): FormGroup {
    return new FormGroup({
      name: new FormControl("", Validators.required),
      linkedin: new FormControl("", Validators.required),
      email: new FormControl("", [Validators.required, Validators.email]),
      phone1: new FormControl(""),
      phone2: new FormControl(""),
      status: new FormControl(""),
      sent_on: new FormControl(""),
    });
  }

  createItem(): FormGroup {
    return this.fb.group({
      name: "",
      linkedin: "",
      email: "",
      phone1: "",
      phone2: "",
    });
  }

  generateMessage() {
    this.generatingMessage = true;
    this.leadService
      .generateMessages(this.leadDetail._id)
      .pipe(finalize(() => (this.generatingMessage = false)))
      .subscribe({
        next: (res: any) => {
          if (res?.success == true) {
            this.getLeadDetail(this.leadDetail.rootDomain);
            this.toastr.success("Messages generated.");
          }
        },
        error: (err) => {
          console.log("err: ", err);
          this.toastr.error(err);
        },
      });
  }

  generatePPT() {
    this.generatingMessage = true;
    this.leadService
      .generatePPT(this.leadDetail._id)
      .pipe(finalize(() => (this.generatingMessage = false)))
      .subscribe({
        next: (res: any) => {
          if (res?.success == true) {
            this.getLeadDetail(this.leadDetail.rootDomain);
            this.toastr.success("PPT generated.");
          }
        },
        error: (err) => {
          console.log("err: ", err);
          this.toastr.error(err);
        },
      });
  }

  createChatbot() {
    this.generatingMessage = true;
    this.leadService
      .createChatbot(this.leadDetail.rootDomain)
      .pipe(finalize(() => (this.generatingMessage = false)))
      .subscribe({
        next: (res: any) => {
          if (res?.success == true) {
            this.getLeadDetail(this.leadDetail.rootDomain);
            this.toastr.success("Chatbot created.");
          }
        },
        error: (err) => {
          console.log("err: ", err);
          this.toastr.error(err);
        },
      });
  }

  /**
   * Pagination Methods
   */

  onPreviousButtonClick() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.pageNumber = this.currentPage;
      this.router.navigate(["leads"], {
        queryParams: { page: this.pageNumber },
      });
      this.getAllLeads();
    }
  }

  onNextButtonClick() {
    debugger;
    this.currentPage++;
    this.pageNumber = this.currentPage;
    this.router.navigate(["leads"], {
      queryParams: { page: this.pageNumber },
    });

    this.getAllLeads();
  }

  selectItemPerPage(number: number) {
    this.itemsPerPage = number;
    this.getAllLeads();
  }

  onPageNumberChange() {
    if (
      this.pageNumber &&
      this.pageNumber > 0 &&
      this.pageNumber <= this.totalPages
    ) {
      this.currentPage = this.pageNumber;
      this.getAllLeads();
    }
  }

  sortSelected(selectedSort: any) {
    this.sortSelection = selectedSort;
    this.getAllLeads();
  }

  filterBy(filterName: string) {
    this.filterType = filterName;
  }

  searchByFilter() {
    this.getAllLeads();
  }
}
