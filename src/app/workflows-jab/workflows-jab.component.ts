import { Component, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ToastService } from '../_services/toast.service';
import { WorkFlowJabService } from '../_services/workflows-jab.service';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-workflows-jab',
  templateUrl: './workflows-jab.component.html',
  styleUrl: './workflows-jab.component.scss'
})
export class WorkflowsJabComponent {

  @ViewChild('closebutton') closebutton: any;


  loading: boolean = false;
  isEdit: boolean = false;

  // for document upload
  imgFiles: any[] = [];
  uploadedDocs: any[] = [];
  imgValidation = false;
  allowedMimes = [
    'image/jpeg',
    'image/webp',
    'image/jpg',
    'image/png',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ];
  imageTypes = ['jpeg', 'webp', 'jpg', 'png'];
  maxSize = 10 * 1024 * 1024;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private toastService: ToastService,
    private workFlowJabService: WorkFlowJabService,

  ) {}

  ngOnInit() {
 
  }


  // for documents upload

  isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }
  isImageSrc(fileType: string): boolean {
    return this.imageTypes.includes(fileType);
  }
  getFileIcon(fileType: string): string {
    switch (fileType) {
      case 'application/pdf':
        return '/assets/icons/pdf.svg';
      case 'pdf':
        return '/assets/icons/pdf.svg';
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return '/assets/images/icons8-excel.png';
      case 'text/plain':
        return '/assets/images/icons8-text.png';
      default:
        return '/assets/images/icons8-text.png';
    }
  }

  onRemove(event: any, f: any) {
    console.log(f);
    event.stopPropagation();
    const blobIndex = this.imgFiles.findIndex((file) => file === f);
    if (blobIndex !== -1) {
      this.imgFiles.splice(blobIndex, 1);
    }
  }
  openFileLink(link: string) {
    window.open(link, '_blank');
  }

  getImageSrc(file: File): string {
    return URL.createObjectURL(file);
  }

  onSubmitImg() {
    if (this.imgFiles.length > 0) {
      this.loading = true;
      const filesToAdd = this.imgFiles.filter((file) => file instanceof File);
      console.log(filesToAdd);
      let fd = new FormData();
      filesToAdd.forEach((f) => fd.append(`file`, f));
      console.log("fd", fd)

      this.workFlowJabService
      .uploadDocs(fd)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          if (res.blob_name) {
            this.toastr.success('Document Uploaded Successfully');
            this.imgFiles = [];
            // this.getAllDocs();
          } else {
            this.toastr.error(res.msg);
          }
        },
        error: (err) => {
          console.log(err);
          this.toastr.error(err.error.msg);
        },
      });


    } else {
      this.imgValidation = true;
    }
  }

  onSelect(event: any) {
    for (const file of event.addedFiles) {
      if (file.size > this.maxSize) {
        this.toastr.error(`File exceeds the maximum size of 10MB.`);
        return;
      }
      if (!this.allowedMimes.includes(file.type)) {
        this.toastr.error(` Unsupported File type.`);
        return;
      }
    }
    this.imgValidation = false;
    this.imgFiles.push(...event.addedFiles);
  }
  

}
