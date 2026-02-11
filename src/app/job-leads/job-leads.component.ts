import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { WellfoundJobsService } from '../_services/wellfound-jobs.service';
import { FormBuilder, FormGroup } from '@angular/forms';
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
    limit: 10,
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  };
  total: number = 0;
  hasMore: boolean = false;
  showJobForm: boolean = false;
  jobForm: FormGroup;
  editingJob: any = null;
  showJobDetails: boolean = false;
  selectedJob: any = null;
  private destroy$ = new Subject<void>();

  roleOptions = [
    'Engineering',
    'Product',
    'Design',
    'Marketing',
    'Sales',
    'Customer Service',
    'Operations',
    'Finance',
    'HR',
    'Other'
  ];

  jobTypeOptions = [
    'full-time',
    'part-time',
    'contract',
    'internship'
  ];

  constructor(
    private wellfoundJobsService: WellfoundJobsService,
    private fb: FormBuilder
  ) {
    this.jobForm = this.fb.group({
      id: [''],
      title: [''],
      slug: [''],
      description: [''],
      primaryRoleTitle: [''],
      jobType: [''],
      compensation: [''],
      equity: [''],
      remote: [false]
    });
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

  openJobForm(job?: any) {
    if (job) {
      this.editingJob = job;
      this.jobForm.patchValue({
        id: job.id,
        title: job.title,
        slug: job.slug,
        description: job.description,
        primaryRoleTitle: job.primaryRoleTitle,
        jobType: job.jobType,
        compensation: job.compensation,
        equity: job.equity,
        remote: job.remote
      });
    } else {
      this.editingJob = null;
      this.jobForm.reset({
        remote: false
      });
    }
    this.showJobForm = true;
  }

  closeJobForm() {
    this.showJobForm = false;
    this.editingJob = null;
    this.jobForm.reset({
      remote: false
    });
  }

  saveJob() {
    if (this.jobForm.invalid) {
      return;
    }

    const jobData = this.jobForm.value;
    this.loading = true;

    if (this.editingJob) {
      this.wellfoundJobsService.updateJob(this.editingJob.id, jobData)
        .pipe(
          finalize(() => this.loading = false),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (response) => {
            if (response.success) {
              Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Job updated successfully'
              });
              this.closeJobForm();
              this.loadJobs();
            }
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to update job'
            });
          }
        });
    } else {
      this.wellfoundJobsService.saveJobs([jobData])
        .pipe(
          finalize(() => this.loading = false),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (response) => {
            if (response.success) {
              Swal.fire({
                icon: 'success',
                title: 'Success',
                text: `Job saved successfully. Saved: ${response.data.saved}, Updated: ${response.data.updated}`
              });
              this.closeJobForm();
              this.loadJobs();
            }
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to save job'
            });
          }
        });
    }
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
      limit: 10,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      primaryRoleTitle: '',
      jobType: '',
      remote: null
    };
    this.loadJobs();
  }

  changeSortBy(sortBy: string) {
    this.filters.sortBy = sortBy;
    this.loadJobs();
  }

  changeSortOrder() {
    this.filters.sortOrder = this.filters.sortOrder === 'asc' ? 'desc' : 'asc';
    this.loadJobs();
  }
}
