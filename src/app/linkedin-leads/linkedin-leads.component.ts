import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { LinkedInLeadsService } from '../_services/linkedin-leads.service';
import { finalize, takeUntil } from 'rxjs';
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
  deletingSelected: boolean = false;
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
  editingStatusLeadId: string | null = null;
  selectedStatusForEdit: string = '';
  leadScrapingStatusOptions: string[] = ['Not Scraped', 'Scraped', 'Found', 'Reviewed', 'Needs Review'];
  private destroy$ = new Subject<void>();

  constructor(
    private linkedinLeadsService: LinkedInLeadsService
  ) {
  }

  private getLeadId(lead: any): string {
    return lead?._id ? lead._id : lead?.id;
  }

  private normalizeLeadId(lead: any): any {
    const leadId = this.getLeadId(lead);
    if (!leadId) {
      return lead;
    }
    return {
      ...lead,
      _id: leadId
    };
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
            this.leads = (response.data.leads || []).map((lead: any) => this.normalizeLeadId(lead));
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
            const nextLeads = (response.data.leads || []).map((lead: any) => this.normalizeLeadId(lead));
            this.leads = [...this.leads, ...nextLeads];
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

  startEditingStatus(lead: any, event: Event) {
    event.stopPropagation();
    this.editingStatusLeadId = lead._id;
    this.selectedStatusForEdit = lead.leadScrapingStatus ? lead.leadScrapingStatus : 'Not Scraped';
  }

  cancelEditingStatus() {
    this.editingStatusLeadId = null;
    this.selectedStatusForEdit = '';
  }

  onStatusChange(newStatus: string) {
    this.selectedStatusForEdit = newStatus;
  }

  updateLeadScrapingStatus(lead: any) {
    if (lead.leadScrapingStatus === this.selectedStatusForEdit) {
      this.editingStatusLeadId = null;
      this.selectedStatusForEdit = '';
      return;
    }

    const updates = { leadScrapingStatus: this.selectedStatusForEdit };
    
    this.linkedinLeadsService.updateLead(lead._id, updates)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            lead.leadScrapingStatus = this.selectedStatusForEdit;
            lead.updatedAt = response.data.updatedAt ? response.data.updatedAt : new Date().toISOString();
            this.editingStatusLeadId = null;
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
        this.linkedinLeadsService.approveLead(lead._id)
          .pipe(
            takeUntil(this.destroy$)
          )
          .subscribe({
            next: (response) => {
              if (response.success && response.data) {
                Object.assign(lead, response.data);
                this.selectedLeads.delete(lead._id);
                Swal.fire({
                  icon: 'success',
                  title: 'Approved',
                  text: 'Lead approved and pushed to campaign successfully'
                });
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: response.error || 'Failed to approve lead'
                });
              }
            },
            error: (error) => {
              const errorMessage = error.error?.error || error.message || 'Failed to approve lead';
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

  toggleLeadSelection(lead: any, event: any) {
    const leadId = this.getLeadId(lead);
    if (!leadId) {
      return;
    }

    if (event.target.checked) {
      this.selectedLeads.add(leadId);
    } else {
      this.selectedLeads.delete(leadId);
    }
  }

  isLeadSelected(lead: any): boolean {
    const leadId = this.getLeadId(lead);
    if (!leadId) {
      return false;
    }
    return this.selectedLeads.has(leadId);
  }

  toggleSelectAll(event: any) {
    if (event.target.checked) {
      this.leads.forEach(lead => {
        const leadId = this.getLeadId(lead);
        if (!leadId) {
          return;
        }
        if (!lead.isApproved) {
          this.selectedLeads.add(leadId);
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
    return unapprovedLeads.every(lead => {
      const leadId = this.getLeadId(lead);
      if (!leadId) {
        return false;
      }
      return this.selectedLeads.has(leadId);
    });
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
        const leadIds = Array.from(this.selectedLeads).filter((leadId: string) => !!leadId);
        
        this.linkedinLeadsService.approveBatchLeads(leadIds)
          .pipe(
            finalize(() => this.approvingAll = false),
            takeUntil(this.destroy$)
          )
          .subscribe({
            next: (response) => {
              if (response.success && response.data) {
                const { approved, failed, errors } = response.data;
                
                const approvedLeadIds = new Set(leadIds);
                if (errors && errors.length > 0) {
                  errors.forEach((error: any) => {
                    approvedLeadIds.delete(error.leadId);
                  });
                }
                
                this.leads.forEach(lead => {
                  const leadId = this.getLeadId(lead);
                  if (leadId && approvedLeadIds.has(leadId)) {
                    lead.isApproved = true;
                    lead.isCampaignPushed = true;
                  }
                });
                
                this.selectedLeads.clear();
                
                let message = `Successfully approved ${approved} lead(s)`;
                if (failed > 0) {
                  message += `. ${failed} lead(s) failed to approve.`;
                  if (errors && errors.length > 0) {
                    const errorMessages = errors.map((e: any) => `${e.leadId}: ${e.error}`).join('\n');
                    Swal.fire({
                      icon: 'warning',
                      title: 'Partial Success',
                      html: `${message}<br><br><small>Errors:<br>${errorMessages}</small>`,
                      width: '600px'
                    });
                    return;
                  }
                }
                
                Swal.fire({
                  icon: 'success',
                  title: 'Approved',
                  text: message
                });
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: response.error || 'Failed to approve leads'
                });
              }
            },
            error: (error) => {
              const errorMessage = error.error?.error || error.message || 'Failed to approve leads';
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
        const leadIds = Array.from(this.selectedLeads).filter((leadId: string) => !!leadId);
        if (leadIds.length === 0) {
          this.deletingSelected = false;
          Swal.fire({
            icon: 'warning',
            title: 'No Valid Selection',
            text: 'Selected leads do not contain valid IDs'
          });
          return;
        }
        this.linkedinLeadsService.deleteBatchLeads(leadIds)
          .pipe(
            finalize(() => this.deletingSelected = false),
            takeUntil(this.destroy$)
          )
          .subscribe({
            next: (response) => {
              if (response.success) {
                const deletedCount = response.data?.deleted !== undefined ? response.data.deleted : 0;
                const failedCount = response.data?.failed !== undefined ? response.data.failed : 0;

                let message = `Successfully deleted ${deletedCount} lead(s)`;
                if (failedCount > 0) {
                  message += `. ${failedCount} lead(s) failed to delete.`;
                }

                Swal.fire({
                  icon: failedCount > 0 ? 'warning' : 'success',
                  title: failedCount > 0 ? 'Partial Success' : 'Deleted',
                  text: message
                });

                this.selectedLeads.clear();
                this.loadLeads();
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: response.error || 'Failed to delete selected leads'
                });
              }
            },
            error: (error) => {
              const errorMessage = error.error?.error || error.error?.message || 'Failed to delete selected leads';
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
}
