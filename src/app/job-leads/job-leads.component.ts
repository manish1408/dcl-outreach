import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { WellfoundJobsService } from '../_services/wellfound-jobs.service';
import { finalize, takeUntil } from 'rxjs';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-job-leads',
  templateUrl: './job-leads.component.html',
  styleUrl: './job-leads.component.scss'
})
export class JobLeadsComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  loadingMore: boolean = false;
  deletingAll: boolean = false;
  jobs: any[] = [];
  filters: any = {
    page: 1,
    limit: 20,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    search: ''
  };
  total: number = 0;
  hasMore: boolean = false;
  showJobDetails: boolean = false;
  selectedJob: any = null;
  editingStatusJobId: string | null = null;
  selectedStatusForEdit: string = '';
  leadScrapingStatusOptions: string[] = ['Not Scraped', 'Scraped', 'Found', 'Reviewed', 'Needs Review'];
  selectedJobIds: Set<string> = new Set<string>();
  deletingSelected: boolean = false;
  private destroy$ = new Subject<void>();

  private resolveJobId(job: any): string {
    if (job && job.id) {
      return job.id;
    }
    if (job && job._id) {
      return job._id;
    }
    return '';
  }

  constructor(
    private wellfoundJobsService: WellfoundJobsService
  ) {
  }

  formatCompanySize(size: string): string {
    if (!size) return '';
    const sizeMap: { [key: string]: string } = {
      'SIZE_1_10': '1-10',
      'SIZE_11_50': '11-50',
      'SIZE_51_200': '51-200',
      'SIZE_201_500': '201-500',
      'SIZE_501_1000': '501-1000',
      'SIZE_1001_PLUS': '1001+'
    };
    return sizeMap[size] || size;
  }

  formatCurrency(amount: number | null): string {
    if (!amount) return '-';
    if (amount >= 1000000) {
      return '$' + (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
      return '$' + (amount / 1000).toFixed(1) + 'K';
    }
    return '$' + amount.toLocaleString();
  }

  trimName(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length <= 2) {
      return name;
    }
    return parts[0] + ' ' + parts[parts.length - 1].charAt(0) + '.';
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
    this.selectedJobIds.clear();
    this.loading = true;
    window.scrollTo(0, 0);
    this.wellfoundJobsService.getJobs(this.filters)
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
    
    this.wellfoundJobsService.getJobs(this.filters)
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
        this.wellfoundJobsService.deleteJob(jobId)
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
            this.wellfoundJobsService.deleteAllJobs()
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
      sortBy: 'updatedAt',
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

  getLeadScrapingStatusBadgeClass(status: string): string {
    if (!status) return 'bg-secondary';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('error')) return 'bg-danger';
    if (statusLower === 'not found') return 'bg-warning';
    if (statusLower === 'not scraped') return 'bg-secondary';
    if (statusLower === 'scraped') return 'bg-info';
    if (statusLower === 'found') return 'bg-primary';
    if (statusLower === 'reviewed') return 'bg-success';
    if (statusLower === 'needs review') return 'bg-warning';
    
    return 'bg-secondary';
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
    
    this.wellfoundJobsService.updateJob(job.id, updates)
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

  toggleJobSelection(job: any, event: any) {
    const jobId = this.resolveJobId(job);
    if (!jobId) {
      return;
    }

    if (event.target.checked) {
      this.selectedJobIds.add(jobId);
    } else {
      this.selectedJobIds.delete(jobId);
    }
  }

  isJobSelected(job: any): boolean {
    const jobId = this.resolveJobId(job);
    if (!jobId) {
      return false;
    }
    return this.selectedJobIds.has(jobId);
  }

  toggleSelectAll(event: any) {
    if (event.target.checked) {
      this.jobs.forEach(job => {
        const jobId = this.resolveJobId(job);
        if (jobId) {
          this.selectedJobIds.add(jobId);
        }
      });
    } else {
      this.selectedJobIds.clear();
    }
  }

  isAllSelected(): boolean {
    const selectableJobIds = this.jobs
      .map(job => this.resolveJobId(job))
      .filter(jobId => jobId !== '');

    if (selectableJobIds.length === 0) {
      return false;
    }
    return selectableJobIds.every(jobId => this.selectedJobIds.has(jobId));
  }

  deleteSelectedJobs() {
    const selectedCount = this.selectedJobIds.size;
    if (selectedCount === 0) {
      this.showToast('warning', 'Please select at least one job to delete');
      return;
    }

    this.deletingSelected = true;
    const jobIds = Array.from(this.selectedJobIds);
    this.wellfoundJobsService.deleteJobs(jobIds)
      .pipe(
        finalize(() => this.deletingSelected = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.showToast(
              'success',
              response.data?.message || `Successfully deleted ${response.data?.deletedCount || selectedCount} job(s)`
            );
            this.selectedJobIds.clear();
            this.loadJobs();
          } else {
            this.showToast('error', response.error || 'Failed to delete selected jobs');
          }
        },
        error: (error) => {
          const errorMessage = error.error?.error || error.error?.message || 'Failed to delete selected jobs';
          this.showToast('error', errorMessage);
        }
      });
  }

  private showToast(icon: 'success' | 'error' | 'warning' | 'info' | 'question', title: string) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true
    });
  }
}
