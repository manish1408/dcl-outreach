import { Component, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CrawlerService } from '../_services/crawler.service';
import { UserService } from '../_services/user.service';
import { finalize } from 'rxjs';
import { ToastService } from '../_services/toast.service';
import { ChatService } from '../_services/chat.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-files-and-data',
  templateUrl: './files-and-data.component.html',
  styleUrl: './files-and-data.component.scss',
})
export class FilesAndDataComponent {
  @ViewChild('articleCloseBtn') articleCloseBtn: any;
  @ViewChild('websiteCancelButton') websiteCancelButton: any;


  selectedChatBotId: string = '';
  user: any;
  loading: boolean = false;
  apiLoading: boolean = false;
  activeTab: string = 'files';
  // activeTab = 'qAns';
  websiteForm: FormGroup | any;
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
  articleForm: FormGroup | any;
  isEditArticle: boolean = false;
  selectedChatbot: any;
  articlesList: any[] = [];
  WebsitesUrlList: any[] = [];
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastr: ToastrService,
    private crawlerService: CrawlerService,
    private toastService: ToastService,
    private chatService: ChatService,
    private route: ActivatedRoute
  ) {
    this.websiteForm = this.fb.group({
      websiteUrl: ['', Validators.required],
      title: ['', Validators.required],
    });

    this.articleForm = this.fb.group({
      heading: ['', Validators.required],
      body: ['', Validators.required],
      articleId: [''],
    });
  }
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.selectedChatBotId = params['id'];
    });
    this.loadUser();
    this.getAllDocs();
    this.getAllArticles();
    this.getAllWebsitesUrl();
    // this.articlesForm = this.fb.group({
    //   items: this.fb.array([]),
    // });

    // this.addItem();
  }

  // get items(): FormArray {
  //   return this.articlesForm.get('items') as FormArray;
  // }

  loadUser() {
    this.user = this.userService.getUserDetails();
  }
  getAllDocs() {
    this.apiLoading = true;
    this.chatService
      .getAllDocs(this.selectedChatBotId)
      .pipe(finalize(() => (this.apiLoading = false)))
      .subscribe((res) => {
        console.log(res);
        if (res.result) {
          this.uploadedDocs = res.data;
        }
      });
  }
  getAllArticles() {
    this.apiLoading = true;
    this.chatService
      .getAllArticles(this.selectedChatBotId)
      .pipe(finalize(() => (this.apiLoading = false)))
      .subscribe((res) => {
        console.log(res);
        if (res.result) {
          this.articlesList = res.data;
          console.log('  this.articlesList: ', this.articlesList);
        }
      });
  }

  onTabChange(tab: string) {
    this.activeTab = tab;
  }
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
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
  isActiveTab(tabName: string): boolean {
    return this.activeTab === tabName;
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
      filesToAdd.forEach((f) => fd.append(`files`, f));
      fd.append('email', this.user.email);
      fd.append('userId', this.user._id);
      fd.append('chatbotId', this.selectedChatBotId);

      this.chatService
        .uploadDocs(fd)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (res) => {
            if (res.result) {
              this.toastr.success('Success');
              this.imgFiles = [];
              this.getAllDocs();
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
  hasError(controlName: keyof typeof this.websiteForm.controls) {
    return (
      this.websiteForm.controls[controlName].invalid &&
      this.websiteForm.controls[controlName].touched
    );
  }

  hasArticleError(controlName: keyof typeof this.articleForm.controls) {
    return (
      this.articleForm.controls[controlName].invalid &&
      this.articleForm.controls[controlName].touched
    );
  }

  crawlWebsite() {
    if (this.websiteForm.valid) {
      this.loading = true;
      const reqObj = {
        websiteUrl: this.websiteForm.value.websiteUrl,
        chatbotId: this.selectedChatBotId,
      };
      this.crawlerService
        .startCrawl(reqObj)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (res) => {
            if (res.result) {
              this.toastr.success('Success');
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
  confirmDelete(fileId: any) {
    this.toastService.showConfirm(
      'Are you sure?',
      'Do you really want to delete this item?',
      'Yes, delete it!',
      'No, cancel',
      () => {
        // Confirm callback
        this.deleteFile(fileId);
      },
      () => {
        // Cancel callback
      }
    );
  }
  deleteFile(fileId: any) {
    const reqObj = {
      fileId,
      email: this.user.email,
    };
    this.chatService.deleteFile(fileId, this.selectedChatBotId).subscribe({
      next: (res) => {
        console.log(res);
        if (res?.result) {
          this.toastr.success('File delete success');
          this.getAllDocs();
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

  // addItem(): void {
  //   this.items.push(
  //     this.fb.group({
  //       heading: ['', Validators.required],  // Add Validators.required
  //       body: ['', Validators.required]      // Add Validators.required
  //     })
  //   );
  // }
  // deleteForm(index: number): void {
  //   this.items.removeAt(index);
  // }
  onSubmitArticle() {
    this.articleForm.markAllAsTouched();
    if (this.articleForm.valid) {
      const storedChatbot = localStorage.getItem('selectedChatbot');
      console.log('storedChatbot', storedChatbot);
      if (storedChatbot) {
        this.selectedChatbot = JSON.parse(storedChatbot);
      }
      const assistantId = this.selectedChatbot.chatbotId;

      const article: any[] = [];
      if (this.isEditArticle) {
        const reqObj = {
          chatbotId: assistantId,
          questionId: this.articleForm.value.articleId,
          heading: this.articleForm.value.heading,
          body: this.articleForm.value.body,
        };

        this.chatService.updateArticle(reqObj).subscribe({
          next: (res: any) => {
            this.isEditArticle = false;
            this.toastr.success('Article Updated Successfully');
            this.articleForm.reset();
            this.getAllArticles();
            // this.items.clear();
            // this.addItem();
          },
          error: (err) => {
            console.error('Error adding custom questions', err);
          },
        });
      } else {
        article.push({
          heading: this.articleForm.value.heading,
          body: this.articleForm.value.body,
        });
        this.chatService.addArticle(assistantId, article).subscribe({
          next: (res: any) => {
            this.isEditArticle = false;
            this.toastr.success('Article Added Successfully');
            this.articleForm.reset();
            this.getAllArticles();
            // this.items.clear();
            // this.addItem();
          },
          error: (err) => {
            console.error('Error adding custom questions', err);
          },
        });
      }

      this.articleCloseBtn.nativeElement.click();
    } else {
      console.log('Form is invalid');
    }
  }
  deleteArticle(articleId: string) {
    this.toastService.showConfirm(
      'Are you sure?',
      'Delete the selected Article?',
      'Yes, delete it!',
      'No, cancel',
      () => {
        this.chatService
          .deleteArticle(this.selectedChatBotId, articleId)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: (res: any) => {
              if (res.result) {
                this.toastr.success('Article Deleted Successfully');
                this.getAllArticles();
              } else {
                this.toastr.error(res.msg);
              }
            },
            error: (err) => {
              console.log(err);
              this.toastr.error(err.error.msg);
            },
          });
      },
      () => {
        // Cancel callback
      }
    );
  }

  editArticle(article: any) {
    this.isEditArticle = true;
    this.articleForm.patchValue({
      heading: article.heading,
      body: article.body,
      articleId: article._id,
    });
  }

  submitWebsiteUrl() {
    this.websiteForm.markAllAsTouched();
    if (this.websiteForm.valid) {
      if (this.validURL(this.websiteForm.value.websiteUrl)) {
        const reqObj = {
          title: this.websiteForm.value.title,
          url: this.websiteForm.value.websiteUrl,
          domain: new URL(this.websiteForm.value.websiteUrl)?.hostname,
          chatbotId: this.selectedChatBotId,
        };
        this.chatService
          .addWebsiteUrl(reqObj)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: (res: any) => {
              if (res.result) {
                this.toastr.success('Url Add Successfully');
                this.getAllWebsitesUrl();
                this.websiteForm.reset();
              } else {
                this.toastr.error(res.msg);
              }
            },
            error: (err) => {
              console.log(err);
              this.toastr.error(err.error.msg);
            },
          });
        this.websiteCancelButton.nativeElement.click();
      }
      else {
        this.toastr.error('Invalid Url');
      }
    }
  }

  getAllWebsitesUrl() {
    this.loading = true;
    this.chatService
      .getWebsiteUrlsList(this.selectedChatBotId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          if (res.data) {
            this.WebsitesUrlList = res.data;
          }
        },
        error: (err) => {
          this.toastr.error(err.error.msg);
        },
      });
  }

  deleteWebsiteUrl(id: string) {
    this.toastService.showConfirm(
      'Are you sure?',
      'Delete the selected Website Url?',
      'Yes, delete it!',
      'No, cancel',
      () => {
        this.chatService
          .deleteWebsiteUrl(this.selectedChatBotId, id)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: (res: any) => {
              if (res.result) {
                this.toastr.success('Url Deleted Successfully');
                this.getAllWebsitesUrl();
              } else {
                this.toastr.error(res.msg);
              }
            },
            error: (err) => {
              console.log(err);
              this.toastr.error(err.error.msg);
            },
          });
      },
      () => {
        // Cancel callback
      }
    );
  }

  ingestArticle(){
    this.loading = true;
    this.chatService
      .ingestArticles(this.selectedChatBotId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          if (res.data) {
            this.toastr.success('Ingested Article Successfully');
          }
        },
        error: (err) => {
          this.toastr.error(err.error.msg);
          console.log("article error",err.error.msg);
        },
      });
  }

  ingestWebUrl(){
    this.loading = true;
    this.chatService
      .ingestWebUrls(this.selectedChatBotId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          if (res.data) {
            this.toastr.success('Ingested Url Successfully');
          }
        },
        error: (err) => {
          this.toastr.error(err.error.msg);
          console.log("article error",err.error.msg);
        },
      });
  }

  ingestFile(){
    this.loading = true;
    this.chatService
      .ingestFiles(this.selectedChatBotId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          if (res.data) {
            this.toastr.success('Ingested Files Successfully');
          }
        },
        error: (err) => {
          this.toastr.error(err.error.msg);
          console.log("article error",err.error.msg);
        },
      });
  }

  viewUrl(url: string) {
    window.open(url, '_blank');
  }

  validURL(url: string) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(url);
  }
}
