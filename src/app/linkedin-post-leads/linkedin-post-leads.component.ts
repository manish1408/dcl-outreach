import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { LinkedInPostLeadsService } from '../_services/linkedin-post-leads.service';
import { ToastrService } from 'ngx-toastr';
import { finalize, takeUntil } from 'rxjs';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-linkedin-post-leads',
  templateUrl: './linkedin-post-leads.component.html',
  styleUrl: './linkedin-post-leads.component.scss'
})
export class LinkedInPostLeadsComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  loadingMore: boolean = false;
  scraping: boolean = false;
  deletingSelected: boolean = false;
  leads: any[] = [];
  filters: any = {
    page: 1,
    limit: 20,
    sortBy: 'scrapedAt',
    sortOrder: 'desc',
    name: '',
    hasComment: ''
  };
  total: number = 0;
  hasMore: boolean = false;
  showLeadDetails: boolean = false;
  showScrapeModal: boolean = false;
  selectedLead: any = null;
  selectedLeads: Set<string> = new Set();
  scrapePostUrl: string = '';
  editingStatusLeadId: string | null = null;
  selectedStatusForEdit: string = '';
  statusOptions: string[] = ['pending', 'contacted', 'converted'];
  private destroy$ = new Subject<void>();

  constructor(
    private linkedinPostLeadsService: LinkedInPostLeadsService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadLeads();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadLeads() {
    this.filters.page = 1;
    this.leads = [];
    this.selectedLeads.clear();
    this.loading = true;
    window.scrollTo(0, 0);

    const params: any = {
      page: this.filters.page,
      limit: this.filters.limit,
      sortBy: this.filters.sortBy,
      sortOrder: this.filters.sortOrder
    };
    if (this.filters.name) params.name = this.filters.name;
    if (this.filters.hasComment === 'true') params.hasComment = true;
    if (this.filters.hasComment === 'false') params.hasComment = false;

    this.linkedinPostLeadsService.list(params)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.leads = response.data.leads ? response.data.leads : [];
            this.total = response.data.total ? response.data.total : 0;
            this.hasMore = response.data.hasMore ? response.data.hasMore : false;
          }
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load leads'
          });
        }
      });
  }

  loadMoreLeads() {
    if (this.loadingMore || !this.hasMore) {
      return;
    }

    this.loadingMore = true;
    this.filters.page++;

    const params: any = {
      page: this.filters.page,
      limit: this.filters.limit,
      sortBy: this.filters.sortBy,
      sortOrder: this.filters.sortOrder
    };
    if (this.filters.name) params.name = this.filters.name;
    if (this.filters.hasComment === 'true') params.hasComment = true;
    if (this.filters.hasComment === 'false') params.hasComment = false;

    this.linkedinPostLeadsService.list(params)
      .pipe(
        finalize(() => this.loadingMore = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const nextLeads = response.data.leads ? response.data.leads : [];
            this.leads = [...this.leads, ...nextLeads];
            this.total = response.data.total ? response.data.total : 0;
            this.hasMore = response.data.hasMore ? response.data.hasMore : false;
          }
        },
        error: () => {
          this.filters.page--;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load more leads'
          });
        }
      });
  }

  startScrape() {
    if (!this.scrapePostUrl.trim()) {
      this.toastr.warning('Please enter a LinkedIn post URL');
      return;
    }

    this.scraping = true;
    this.linkedinPostLeadsService.scrape(this.scrapePostUrl.trim())
      .pipe(
        finalize(() => this.scraping = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toastr.success(response.data?.message ? response.data.message : 'Scraping started');
            this.scrapePostUrl = '';
            this.showScrapeModal = false;
            this.loadLeads();
          } else {
            this.toastr.error(response.error ? response.error : 'Scrape failed');
          }
        },
        error: (err) => {
          this.toastr.error(err.error?.error ? err.error.error : 'Failed to start scrape');
        }
      });
  }

  viewLeadDetails(lead: any) {
    this.showLeadDetails = true;
    this.selectedLead = lead;
    const leadId = lead._id;
    if (leadId) {
      this.linkedinPostLeadsService.get(leadId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success && response.data) {
              this.selectedLead = response.data;
            }
          }
        });
    }
  }

  closeLeadDetails() {
    this.showLeadDetails = false;
    this.selectedLead = null;
  }

  openScrapeModal() {
    this.scrapePostUrl = '';
    this.showScrapeModal = true;
  }

  closeScrapeModal() {
    this.showScrapeModal = false;
    this.scrapePostUrl = '';
  }

  applyFilters() {
    this.loadLeads();
  }

  resetFilters() {
    this.filters = {
      page: 1,
      limit: 20,
      sortBy: 'scrapedAt',
      sortOrder: 'desc',
      name: '',
      hasComment: ''
    };
    this.loadLeads();
  }

  sortBy(column: string) {
    if (this.filters.sortBy === column) {
      this.filters.sortOrder = this.filters.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.filters.sortBy = column;
      this.filters.sortOrder = 'asc';
    }
    this.loadLeads();
  }

  getSortIcon(column: string): string {
    if (this.filters.sortBy !== column) {
      return 'fa-sort text-muted';
    }
    return this.filters.sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  getStatusBadgeClass(status: string): string {
    if (!status) return 'bg-secondary';
    const s = status.toLowerCase();
    if (s === 'pending') return 'bg-warning';
    if (s === 'contacted') return 'bg-info';
    if (s === 'converted') return 'bg-success';
    if (s === 'qualified') return 'bg-success';
    return 'bg-secondary';
  }

  getProfilePicture(lead: any): string {
    if (lead.profilePicture) return lead.profilePicture;
    if (lead.profilePictures && lead.profilePictures.medium) return lead.profilePictures.medium;
    if (lead.profilePictures && lead.profilePictures.small) return lead.profilePictures.small;
    if (lead.profilePictures && lead.profilePictures.large) return lead.profilePictures.large;
    return '';
  }

  trimHeadline(headline: string, maxLength: number = 50): string {
    if (!headline) return '';
    if (headline.length <= maxLength) return headline;
    return headline.substring(0, maxLength).trim() + '...';
  }

  startEditingStatus(lead: any, event: Event) {
    event.stopPropagation();
    this.editingStatusLeadId = lead._id;
    this.selectedStatusForEdit = lead.status ? lead.status : 'pending';
  }

  cancelEditingStatus() {
    this.editingStatusLeadId = null;
    this.selectedStatusForEdit = '';
  }

  updateLeadStatus(lead: any) {
    if (lead.status === this.selectedStatusForEdit) {
      this.editingStatusLeadId = null;
      this.selectedStatusForEdit = '';
      return;
    }

    this.linkedinPostLeadsService.update(lead._id, { status: this.selectedStatusForEdit })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            lead.status = this.selectedStatusForEdit;
            lead.updatedAt = response.data.updatedAt ? response.data.updatedAt : new Date().toISOString();
            this.editingStatusLeadId = null;
            this.selectedStatusForEdit = '';
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to update status'
            });
          }
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to update status'
          });
        }
      });
  }

  toggleLeadSelection(lead: any, event: any) {
    const leadId = lead._id;
    if (!leadId) return;

    if (event.target.checked) {
      this.selectedLeads.add(leadId);
    } else {
      this.selectedLeads.delete(leadId);
    }
  }

  isLeadSelected(lead: any): boolean {
    return lead._id ? this.selectedLeads.has(lead._id) : false;
  }

  toggleSelectAll(event: any) {
    if (event.target.checked) {
      this.leads.forEach(lead => {
        if (lead._id) this.selectedLeads.add(lead._id);
      });
    } else {
      this.selectedLeads.clear();
    }
  }

  isAllSelected(): boolean {
    if (this.leads.length === 0) return false;
    return this.leads.every(lead => lead._id && this.selectedLeads.has(lead._id));
  }

  deleteLead(leadId: string) {
    this.linkedinPostLeadsService.delete(leadId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.leads = this.leads.filter(l => l._id !== leadId);
            this.total = this.total - 1;
            this.selectedLeads.delete(leadId);
          }
        },
        error: () => {
          this.toastr.error('Failed to delete lead');
        }
      });
  }

  deleteSelectedLeads() {
    const selectedCount = this.selectedLeads.size;
    if (selectedCount === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Selection',
        text: 'Please select at least one lead to delete'
      });
      return;
    }

    Swal.fire({
      title: 'Delete Selected Leads?',
      text: `Are you sure you want to delete ${selectedCount} selected lead(s)? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete selected',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deletingSelected = true;
        const leadIds = Array.from(this.selectedLeads);

        this.linkedinPostLeadsService.deleteBatch(leadIds)
          .pipe(
            finalize(() => this.deletingSelected = false),
            takeUntil(this.destroy$)
          )
          .subscribe({
            next: (response) => {
              if (response.success) {
                const deletedCount = response.data?.deleted !== undefined ? response.data.deleted : 0;
                this.toastr.success(`Deleted ${deletedCount} lead(s)`);
                this.selectedLeads.clear();
                this.loadLeads();
              } else {
                this.toastr.error(response.error ? response.error : 'Failed to delete leads');
              }
            },
            error: () => {
              this.toastr.error('Failed to delete selected leads');
            }
          });
      }
    });
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    if (this.loading || this.loadingMore || !this.hasMore) return;

    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollPercentage = (scrollTop + windowHeight) / documentHeight;

    if (scrollPercentage > 0.9) {
      this.loadMoreLeads();
    }
  }
}
