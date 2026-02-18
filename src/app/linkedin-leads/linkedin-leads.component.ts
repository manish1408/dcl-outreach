import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { LinkedInLeadsService } from '../_services/linkedin-leads.service';
import { finalize, takeUntil, forkJoin } from 'rxjs';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-linkedin-leads',
  templateUrl: './linkedin-leads.component.html',
  styleUrl: './linkedin-leads.component.scss'
})
export class LinkedInLeadsComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  loadingMore: boolean = false;
  deletingAll: boolean = false;
  leads: any[] = [];
  filters: any = {
    page: 1,
    limit: 20,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    search: ''
  };
  total: number = 0;
  hasMore: boolean = false;
  showLeadDetails: boolean = false;
  selectedLead: any = null;
  selectedLeads: Set<string> = new Set();
  approvingAll: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private linkedinLeadsService: LinkedInLeadsService
  ) {
  }

  trimName(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length <= 2) {
      return name;
    }
    return parts[0] + ' ' + parts[parts.length - 1].charAt(0) + '.';
  }

  trimPosition(position: string, maxLength: number = 50): string {
    if (!position) return '';
    if (position.length <= maxLength) return position;
    return position.substring(0, maxLength).trim() + '...';
  }

  getLinkedInUrl(lead: any): string {
    if (lead.entityUrn) {
      const match = lead.entityUrn.match(/\(([^,]+),/);
      if (match && match[1]) {
        return `https://www.linkedin.com/in/${match[1]}`;
      }
    }
    
    return '';
  }

  getJobId(lead: any): string {
    if (lead.wellfoundJobId) {
      return lead.wellfoundJobId;
    }
    if (lead.linkedInJobId) {
      return lead.linkedInJobId;
    }
    return '';
  }

  getJobIdType(lead: any): string {
    if (lead.wellfoundJobId) {
      return 'wellfound';
    }
    if (lead.linkedInJobId) {
      return 'linkedin';
    }
    return '';
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
    this.loadLeads();
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
      this.loadMoreLeads();
    }
  }

  loadLeads() {
    this.filters.page = 1;
    this.leads = [];
    this.selectedLeads.clear();
    this.loading = true;
    window.scrollTo(0, 0);
    
    const filters: any = {
      page: this.filters.page,
      limit: this.filters.limit,
      sortBy: this.filters.sortBy,
      sortOrder: this.filters.sortOrder
    };

    if (this.filters.search) {
      filters.name = this.filters.search;
    }

    this.linkedinLeadsService.getLeads(filters)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.leads = response.data.leads;
            this.total = response.data.total;
            this.hasMore = response.data.hasMore;
          }
        },
        error: (error) => {
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
    
    const filters: any = {
      page: this.filters.page,
      limit: this.filters.limit,
      sortBy: this.filters.sortBy,
      sortOrder: this.filters.sortOrder
    };

    if (this.filters.search) {
      filters.name = this.filters.search;
    }
    
    this.linkedinLeadsService.getLeads(filters)
      .pipe(
        finalize(() => this.loadingMore = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.leads = [...this.leads, ...response.data.leads];
            this.total = response.data.total;
            this.hasMore = response.data.hasMore;
          }
        },
        error: (error) => {
          this.filters.page--;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load more leads'
          });
        }
      });
  }

  viewLeadDetails(lead: any) {
    this.selectedLead = lead;
    this.showLeadDetails = true;
  }

  closeLeadDetails() {
    this.showLeadDetails = false;
    this.selectedLead = null;
  }

  deleteLead(leadId: string) {
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
        this.linkedinLeadsService.deleteLead(leadId)
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
                  text: 'Lead deleted successfully'
                });
                this.loadLeads();
              }
            },
            error: (error) => {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to delete lead'
              });
            }
          });
      }
    });
  }

  deleteAllLeads() {
    Swal.fire({
      title: 'Delete All Leads?',
      html: '<strong>WARNING:</strong> This will permanently delete <strong>ALL</strong> leads from the database.<br><br>This action cannot be undone.',
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
          html: 'This is your <strong>last chance</strong> to cancel.<br><br>All leads will be permanently deleted.',
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
            this.linkedinLeadsService.deleteAllLeads()
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
                      text: `Successfully deleted ${response.data.deletedCount} lead(s)`
                    });
                    this.loadLeads();
                  }
                },
                error: (error) => {
                  const errorMessage = error.error?.error || error.error?.message || 'Failed to delete all leads';
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
    this.loadLeads();
  }

  resetFilters() {
    this.filters = {
      page: 1,
      limit: 20,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      search: ''
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

  approveLead(lead: any) {
    Swal.fire({
      title: 'Approve Lead?',
      text: `Are you sure you want to approve ${lead.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, approve'
    }).then((result) => {
      if (result.isConfirmed) {
        this.linkedinLeadsService.updateLead(lead._id, { isApproved: true })
          .pipe(
            takeUntil(this.destroy$)
          )
          .subscribe({
            next: (response) => {
              if (response.success) {
                Swal.fire({
                  icon: 'success',
                  title: 'Approved',
                  text: 'Lead approved successfully'
                });
                lead.isApproved = true;
                this.selectedLeads.delete(lead._id);
              }
            },
            error: (error) => {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to approve lead'
              });
            }
          });
      }
    });
  }

  toggleLeadSelection(lead: any, event: any) {
    if (event.target.checked) {
      this.selectedLeads.add(lead._id);
    } else {
      this.selectedLeads.delete(lead._id);
    }
  }

  isLeadSelected(lead: any): boolean {
    return this.selectedLeads.has(lead._id);
  }

  toggleSelectAll(event: any) {
    if (event.target.checked) {
      this.leads.forEach(lead => {
        if (!lead.isApproved) {
          this.selectedLeads.add(lead._id);
        }
      });
    } else {
      this.selectedLeads.clear();
    }
  }

  isAllSelected(): boolean {
    const unapprovedLeads = this.leads.filter(lead => !lead.isApproved);
    if (unapprovedLeads.length === 0) {
      return false;
    }
    return unapprovedLeads.every(lead => this.selectedLeads.has(lead._id));
  }

  approveAllSelected() {
    const selectedCount = this.selectedLeads.size;
    if (selectedCount === 0) {
      return;
    }

    Swal.fire({
      title: 'Approve All Selected?',
      text: `Are you sure you want to approve ${selectedCount} lead(s)?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, approve all'
    }).then((result) => {
      if (result.isConfirmed) {
        this.approvingAll = true;
        const leadIds = Array.from(this.selectedLeads);
        const approveObservables = leadIds.map(leadId => 
          this.linkedinLeadsService.updateLead(leadId, { isApproved: true })
        );

        forkJoin(approveObservables)
          .pipe(
            finalize(() => this.approvingAll = false),
            takeUntil(this.destroy$)
          )
          .subscribe({
            next: (responses) => {
              const successCount = responses.filter(r => r && r.success).length;
              this.leads.forEach(lead => {
                if (this.selectedLeads.has(lead._id)) {
                  lead.isApproved = true;
                }
              });
              this.selectedLeads.clear();
              
              Swal.fire({
                icon: 'success',
                title: 'Approved',
                text: `Successfully approved ${successCount} lead(s)`
              });
            },
            error: (error) => {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to approve some leads'
              });
            }
          });
      }
    });
  }
}
