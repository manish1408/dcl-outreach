import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { LinkedInJobsService } from '../_services/linkedin-jobs.service';
import { finalize, takeUntil } from 'rxjs';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-linkedin-job-leads',
  templateUrl: './linkedin-job-leads.component.html',
  styleUrl: './linkedin-job-leads.component.scss'
})
export class LinkedInJobLeadsComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  loadingMore: boolean = false;
  deletingAll: boolean = false;
  jobs: any[] = [];
  filters: any = {
    page: 1,
    limit: 20,
    sortBy: 'listedDate',
    sortOrder: 'desc',
    search: ''
  };
  total: number = 0;
  hasMore: boolean = false;
  showJobDetails: boolean = false;
  selectedJob: any = null;
  editingStatusJobId: string | null = null;
  selectedStatusForEdit: string = '';
  showNotQualifiedReasonModal: boolean = false;
  selectedNotQualifiedReasonJob: any = null;
  leadScrapingStatusOptions: string[] = ['Not Scraped', 'Scraped', 'Found', 'Reviewed', 'Needs Review'];
  private destroy$ = new Subject<void>();

  constructor(
    private linkedInJobsService: LinkedInJobsService
  ) {
  }

  formatDescription(description: string): string {
    if (!description) return '';
    
    let formatted = description;
    
    formatted = formatted.replace(/\r\n/g, '\n');
    formatted = formatted.replace(/\r/g, '\n');
    
    const lines = formatted.split('\n');
    const result: string[] = [];
    let inList = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) {
        if (inList) {
          result.push('</ul>');
          inList = false;
        }
        result.push('<br>');
        continue;
      }
      
      const isListItem = /^[-*•]\s/.test(line) || /^\d+\.\s/.test(line);
      const content = line.replace(/^[-*•]\s/, '').replace(/^\d+\.\s/, '');
      
      if (isListItem) {
        if (!inList) {
          result.push('<ul>');
          inList = true;
        }
        const formattedContent = this.formatInlineMarkdown(content);
        result.push(`<li>${formattedContent}</li>`);
      } else {
        if (inList) {
          result.push('</ul>');
          inList = false;
        }
        const formattedContent = this.formatInlineMarkdown(line);
        result.push(`<p>${formattedContent}</p>`);
      }
    }
    
    if (inList) {
      result.push('</ul>');
    }
    
    return result.join('');
  }

  private formatInlineMarkdown(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  }

  formatDate(timestamp: number): string {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatDateTime(timestamp: number): string {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  getJobUrl(job: any): string {
    if (job.jobPostingUrn) {
      const match = job.jobPostingUrn.match(/\((\d+),/);
      if (match && match[1]) {
        return `https://www.linkedin.com/jobs/view/${match[1]}`;
      }
    }
    return '';
  }

  trimName(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length <= 2) {
      return name;
    }
    return parts[0] + ' ' + parts[parts.length - 1].charAt(0) + '.';
  }

  getLeadScrapingStatusBadgeClass(status: string): string {
    if (!status) return 'bg-secondary';
    
    const statusLower = status.toLowerCase();
    if (statusLower === 'not scraped') return 'bg-secondary';
    if (statusLower === 'scraped') return 'bg-info';
    if (statusLower === 'found') return 'bg-primary';
    if (statusLower === 'reviewed') return 'bg-success';
    if (statusLower === 'needs review') return 'bg-warning';
    
    return 'bg-secondary';
  }

  getQualificationStatusBadgeClass(status: string): string {
    if (!status) return 'bg-secondary';
    
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending') return 'bg-warning';
    if (statusLower === 'qualified') return 'bg-success';
    if (statusLower === 'not qualified') return 'bg-danger';
    
    return 'bg-secondary';
  }

  ngOnInit() {
    this.loadJobs();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    if (this.loading || this.loadingMore || !this.hasMore) {
      return;
    }

    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollPercentage = (scrollTop + windowHeight) / documentHeight;

    if (scrollPercentage > 0.9) {
      this.loadMoreJobs();
    }
  }

  loadJobs() {
    this.filters.page = 1;
    this.jobs = [];
    this.loading = true;
    window.scrollTo(0, 0);
    
    const filters: any = {
      page: this.filters.page,
      limit: this.filters.limit,
      sortBy: this.filters.sortBy,
      sortOrder: this.filters.sortOrder
    };

    if (this.filters.search) {
      filters.search = this.filters.search;
    }

    this.linkedInJobsService.getJobs(filters)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.jobs = response.data.jobs;
            this.total = response.data.total;
            this.hasMore = response.data.hasMore;
          }
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load jobs'
          });
        }
      });
  }

  loadMoreJobs() {
    if (this.loadingMore || !this.hasMore) {
      return;
    }

    this.loadingMore = true;
    this.filters.page++;
    
    const filters: any = {
      page: this.filters.page,
      limit: this.filters.limit,
      sortBy: this.filters.sortBy,
      sortOrder: this.filters.sortOrder
    };

    if (this.filters.search) {
      filters.search = this.filters.search;
    }
    
    this.linkedInJobsService.getJobs(filters)
      .pipe(
        finalize(() => this.loadingMore = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.jobs = [...this.jobs, ...response.data.jobs];
            this.total = response.data.total;
            this.hasMore = response.data.hasMore;
          }
        },
        error: (error) => {
          this.filters.page--;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load more jobs'
          });
        }
      });
  }

  viewJobDetails(job: any) {
    this.selectedJob = job;
    this.showJobDetails = true;
  }

  closeJobDetails() {
    this.showJobDetails = false;
    this.selectedJob = null;
  }

  deleteJob(jobId: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.linkedInJobsService.deleteJob(jobId)
          .pipe(
            finalize(() => this.loading = false),
            takeUntil(this.destroy$)
          )
          .subscribe({
            next: (response) => {
              if (response.success) {
                Swal.fire({
                  icon: 'success',
                  title: 'Deleted',
                  text: 'Job deleted successfully'
                });
                this.loadJobs();
              }
            },
            error: (error) => {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to delete job'
              });
            }
          });
      }
    });
  }

  deleteAllJobs() {
    Swal.fire({
      title: 'Delete All Jobs?',
      html: '<strong>WARNING:</strong> This will permanently delete <strong>ALL</strong> jobs from the database.<br><br>This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete all',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Are you absolutely sure?',
          html: 'This is your <strong>last chance</strong> to cancel.<br><br>All jobs will be permanently deleted.',
          icon: 'error',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, delete everything',
          cancelButtonText: 'Cancel',
          reverseButtons: true
        }).then((doubleConfirm) => {
          if (doubleConfirm.isConfirmed) {
            this.deletingAll = true;
            this.linkedInJobsService.deleteAllJobs()
              .pipe(
                finalize(() => this.deletingAll = false),
                takeUntil(this.destroy$)
              )
              .subscribe({
                next: (response) => {
                  if (response.success) {
                    Swal.fire({
                      icon: 'success',
                      title: 'Deleted',
                      text: `Successfully deleted ${response.data.deletedCount} job(s)`
                    });
                    this.loadJobs();
                  }
                },
                error: (error) => {
                  const errorMessage = error.error?.error || error.error?.message || 'Failed to delete all jobs';
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: errorMessage
                  });
                }
              });
          }
        });
      }
    });
  }

  applyFilters() {
    this.loadJobs();
  }

  resetFilters() {
    this.filters = {
      page: 1,
      limit: 20,
      sortBy: 'listedDate',
      sortOrder: 'desc',
      search: ''
    };
    this.loadJobs();
  }

  sortBy(column: string) {
    if (this.filters.sortBy === column) {
      this.filters.sortOrder = this.filters.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.filters.sortBy = column;
      this.filters.sortOrder = 'asc';
    }
    this.loadJobs();
  }

  getSortIcon(column: string): string {
    if (this.filters.sortBy !== column) {
      return 'fa-sort text-muted';
    }
    return this.filters.sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  isFounder(name: string, companyFounders: any[]): boolean {
    if (!name || !companyFounders || companyFounders.length === 0) {
      return false;
    }
    return companyFounders.some(founder => founder.name === name);
  }

  getGreenQualifiedLeads(job: any): any[] {
    const greenLeads: any[] = [];
    const addedNames = new Set<string>();
    
    if (job.companyFounders && job.companyFounders.length > 0) {
      job.companyFounders.forEach((founder: any) => {
        if (founder.name && !addedNames.has(founder.name)) {
          greenLeads.push(founder);
          addedNames.add(founder.name);
        }
      });
    }
    
    if (job.companyTeamMembers && job.companyTeamMembers.length > 0) {
      job.companyTeamMembers.forEach((member: any) => {
        if (member.name && this.isFounder(member.name, job.companyFounders || []) && !addedNames.has(member.name)) {
          greenLeads.push(member);
          addedNames.add(member.name);
        }
      });
    }
    
    return greenLeads;
  }

  getRemainingGreenLeadsCount(job: any): number {
    const allGreenLeads = this.getGreenQualifiedLeads(job);
    return Math.max(0, allGreenLeads.length - 3);
  }

  startEditingStatus(job: any, event: Event) {
    event.stopPropagation();
    this.editingStatusJobId = job.id;
    this.selectedStatusForEdit = job.leadScrapingStatus ? job.leadScrapingStatus : 'Not Scraped';
  }

  onStatusCellClick(job: any, event: Event) {
    event.stopPropagation();
    this.startEditingStatus(job, event);
  }

  openNotQualifiedReasonModal(job: any, event: Event) {
    event.stopPropagation();
    this.selectedNotQualifiedReasonJob = job;
    this.showNotQualifiedReasonModal = true;
  }

  closeNotQualifiedReasonModal() {
    this.showNotQualifiedReasonModal = false;
    this.selectedNotQualifiedReasonJob = null;
  }

  cancelEditingStatus() {
    this.editingStatusJobId = null;
    this.selectedStatusForEdit = '';
  }

  onStatusChange(newStatus: string) {
    this.selectedStatusForEdit = newStatus;
  }

  updateLeadScrapingStatus(job: any) {
    if (job.leadScrapingStatus === this.selectedStatusForEdit) {
      this.editingStatusJobId = null;
      this.selectedStatusForEdit = '';
      return;
    }

    const updates = { leadScrapingStatus: this.selectedStatusForEdit };
    
    this.linkedInJobsService.updateJob(job.id, updates)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            job.leadScrapingStatus = this.selectedStatusForEdit;
            job.updatedAt = response.data.updatedAt ? response.data.updatedAt : new Date().toISOString();
            this.editingStatusJobId = null;
            this.selectedStatusForEdit = '';
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to update lead scraping status'
            });
          }
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to update lead scraping status'
          });
        }
      });
  }
}
