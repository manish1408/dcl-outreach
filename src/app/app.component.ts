import { Component } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { AuthenticationService } from './_services/authentication.service';
import { UserService } from './_services/user.service';
import { Subject, finalize, takeUntil } from 'rxjs';
import { EventService } from './_services/event.service';
import { ChatService } from './_services/chat.service';
import { routeUrls } from './constant/shared-constant';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from './_services/local-storage.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  isCollapsed = true;
  isLoggedIn = false;
  user: any;
  chatbots: any;
  selectedChatbot: any;

  avatar =
    'https://milodocs.blob.core.windows.net/public-docs/profile-picture.webp';
  $destroyWatching: Subject<any> = new Subject();
  createChatbotForm: FormGroup | any;
  formLoading: boolean = false;
  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private userService: UserService,
    private chatService: ChatService,
    private eventService: EventService<any>,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private localStorageService: LocalStorageService
  ) {
    router.events.forEach((event) => {
      if (event instanceof NavigationStart) {
        this.isLoggedIn = this.authService.isAuthenticated();
        if (this.isLoggedIn) {
          this.user = this.userService.getUserDetails();
          const storedChatbot = localStorage.getItem('selectedChatbot');
          if (storedChatbot) {
            this.selectedChatbot = JSON.parse(storedChatbot);
          } else {
            this.selectedChatbot = this.user?.chatbots[0] ?? null;
          }
        }
      } else if (event instanceof NavigationEnd) {
        if (routeUrls.includes(event.urlAfterRedirects)) {
          this.authService.signOut();
          this.isLoggedIn = false;
        }
      }
    });
  }

  ngOnInit() {
    this.createChatbotForm = this.fb.group({
      chatbotName: ['', Validators.required],
    });
    this.isLoggedIn = this.authService.isAuthenticated();
    if (this.isLoggedIn) {
      this.getAllChatbots();
      this.startWatchingAppEvents();
    }
  }
  getAllChatbots() {
    this.chatService.getAllChatbots().subscribe((res: any) => {
      console.log(res);
      this.chatbots = res.data;
    });
  }

  startWatchingAppEvents() {
    this.eventService.events
      .pipe(takeUntil(this.$destroyWatching))
      .subscribe((e: any) => {
        if (e.type === 'LOGIN_CHANGE' || e.type === 'PROFILE_UPDATED') {
          console.log('check app user ', this.user);
          this.getAllChatbots();
          this.isLoggedIn = this.authService.isAuthenticated();
          this.user = this.userService.getUserDetails();
          const storedChatbot = localStorage.getItem('selectedChatbot');
          if (storedChatbot) {
            this.selectedChatbot = JSON.parse(storedChatbot);
          } else {
            this.selectedChatbot = this.user?.chatbots[0] ?? null;
          }
        }
      });
  }

  async signOut(): Promise<void> {
    this.authService.signOut();
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
  selectChatbot(chatbot: any): void {
    this.selectedChatbot = chatbot;
    this.selectedChatbot = {
      chatbotId: chatbot?._id,
      chatbotName: chatbot?.themeDetails?.chatbotName,
    };
    localStorage.setItem(
      'selectedChatbot',
      JSON.stringify(this.selectedChatbot)
    );
    this.router.navigate(['/installation'], {
      queryParams: { id: chatbot?._id },
    });
  }

  createChatbotSubmit() {
    console.log('createChatbotSubmit');
    this.createChatbotForm.markAllAsTouched();
    if (this.createChatbotForm.valid) {
      console.log(this.createChatbotForm?.value.chatbotName);
      const reqObj = {
        userId: this.user?._id,
        chatbotName: this.createChatbotForm?.value.chatbotName,
      };
      this.chatService
        .createChatbot(reqObj)
        .pipe(finalize(() => (this.formLoading = false)))
        .subscribe({
          next: (res) => {
            if (res.result) {
              this.createChatbotForm.reset();
              this.toastr.success('Chatbot created');
              this.localStorageService.setItem(
                'MILO-USER',
                JSON.stringify(res.data)
              );
              localStorage.setItem(
                'selectedChatbot',
                JSON.stringify(res.data?.chatbots.at(-1))
              );
              this.router.navigate(['/dashboard'], {
                queryParams: { id: res.data?.chatbots.at(-1)?._id },
              });
              this.eventService.dispatchEvent({ type: 'PROFILE_UPDATED' });
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
}
