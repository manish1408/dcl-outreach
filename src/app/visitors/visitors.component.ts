import { Component } from '@angular/core';
import { VisitorsService } from '../_services/visitors.service';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ToastService } from '../_services/toast.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-visitors',
  templateUrl: './visitors.component.html',
  styleUrl: './visitors.component.scss',
})
export class VisitorsComponent {
  selectedChatBotId:string = '';
  loading: boolean = false;
  visitors: any[] = [];
  constructor(
    private visitorsService: VisitorsService,
    private toastr: ToastrService,
    private toastService: ToastService,
    private route: ActivatedRoute
  ) {}
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.selectedChatBotId = params['id'];
    });

    this.loading = true;
    this.getAllVisitors();
  }
  getAllVisitors() {
    this.visitorsService
      .getAllVisitors()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => {
        console.log(res);
        this.visitors = res.data;
      });
  }
  confirmDelete(id: any) {
    this.toastService.showConfirm(
      'Are you sure?',
      'Do you really want to delete this item?',
      'Yes, delete it!',
      'No, cancel',
      () => {
        // Confirm callback
        this.deleteVisitor(id);
      },
      () => {
        // Cancel callback
      }
    );
  }
  deleteVisitor(id: string) {
    const reqObj = {
      visitorId: id,
    };
    this.visitorsService.deleteVisitor(reqObj).subscribe({
      next: (res) => {
        console.log(res);
        if (res?.result) {
          this.toastr.success('Visitor delete success');
          this.getAllVisitors();
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
}
