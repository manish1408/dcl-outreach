import { Component } from '@angular/core';
import { ThemeService } from '../_services/theme.service';
import { finalize } from 'rxjs';
import { UserService } from '../_services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ToastService } from '../_services/toast.service';
import { FormControl } from '@angular/forms';
import { ConversationService } from '../_services/conversations.service';

@Component({
  selector: 'app-theme',
  templateUrl: './theme.component.html',
  styleUrl: './theme.component.scss',
})
export class ThemeComponent {
  widgetImage =
    'https://milodocs.blob.core.windows.net/public-docs/profile-picture.webp';
  chatbotImage =
    'https://milodocs.blob.core.windows.net/public-docs/profile-picture.webp';
  companyImage =
    'https://milodocs.blob.core.windows.net/public-docs/profile-picture.webp';
  selectedChatBotId: string = '';
  loading: boolean = false;
  user: any;
  userInput: string = '';
  userTheme: any;
  selectedThemeId = '';
  themes: any[] = [];
  customCSSLstring: string = '';
  widgetType: string = '';
  widgetPosition: string = '';
  removeBranding: boolean = false;
  conversation: any[] = [];
  activeItem: string = '7'; // Default active item
  circleTitles: any[] = [
    {
      title: 'Bot Background',
      key: 'aiMessageBackgroundColor',
    },
    {
      title: 'User Background',
      key: 'userMessageBackgroundColor',
    },
    {
      title: 'Widget Background',
      key: 'widgetBackgroundColor',
    },
    {
      title: 'Chat Window',
      key: 'chatWindowBackgroundColor',
    },
    {
      title: 'Bot Font Color',
      key: 'botFontColor',
    },
    {
      title: 'User Font Color',
      key: 'userFontColor',
    },
  ];
  constructor(
    private themeService: ThemeService,
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private conversationService: ConversationService
  ) {}
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.selectedChatBotId = params['id'];
    });
    this.user = this.userService.getUserDetails();
    this.loading = true;
    this.getUserTheme();
    this.getConversations();
  }

  getUserTheme() {
    this.loading = true;
    this.themeService
      .getuserThemes(this.user?._id, this.selectedChatBotId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.userTheme = res.data;
          this.setValues(res.data);
        },
        error: (err) => {
          console.log('error: get user themes ', err);
        },
      });
  }

  getConversations(){
    this.loading = true;
    this.conversationService
      .getStats(this.selectedChatBotId as string, Number(this.activeItem))
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => {
        console.log(res.data[0]); 
        // this.stats = res.data;
        this.conversation=res.data[0].latestMessage.message;
        console.log("here",res.data[0].latestMessage.message)
        // this.receiverId=res.data.receiverId;
      });
  }

  goto() {
    this.router.navigate(['chatbots']);
  }
  confirmTheme() {
    this.toastService.showConfirm(
      'Are you sure?',
      'Replace current theme with selected theme?',
      'Yes, replace it!',
      'No, cancel',
      () => {
        // Confirm callback
        this.updateTheme();
      },
      () => {
        // Cancel callback
      }
    );
  }

  preventChange(event: Event,label: string) {
    // event.preventDefault();
    // event.stopPropagation();
    this.widgetType=label;
  }

  updateWidgetPosition(event: Event,label: string){
    this.widgetPosition=label;
  }

  onFileSelected(event: any, type: string): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (type === 'widget') {
          this.widgetImage = e.target.result;
        }
        if (type === 'chatbot') {
          this.chatbotImage = e.target.result;
        }
        if (type === 'company') {
          this.companyImage = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  updateTheme() {
    this.userTheme.removeBranding = this.removeBranding;
    this.userTheme.widgetType=this.widgetType;
    this.userTheme.widgetPosition=this.widgetPosition;
    const reqObj = {
      themes: this.userTheme,
      chatbotId: this.selectedChatBotId,
    };
    console.log('reqObj: ', reqObj);

    this.themeService
      .updateUserTheme(reqObj)

      .subscribe({
        next: (res) => {
          if (res.result) {
            this.toastr.success('Theme updated');
            this.getUserTheme();
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

  backgroundColor(title: string) {
    switch (title) {
      case 'Bot Background':
        return this.userTheme.aiMessageBackgroundColor;
      case 'User Background':
        return this.userTheme.userMessageBackgroundColor;
      case 'Widget Background':
        return this.userTheme.widgetBackgroundColor;
      case 'Chat Window':
        return this.userTheme.chatWindowBackgroundColor;
      case 'Bot Font Color':
        return this.userTheme.botFontColor;
      case 'User Font Color':
        return this.userTheme.userFontColor;
    }
  }

  setValues(theme: any) {
    this.customCSSLstring = theme.customCss;
    this.selectedThemeId = theme._id;
    this.widgetType = theme.widgetType;
    this.removeBranding = theme.removeBranding;
    this.widgetPosition = theme.widgetPosition;
  }

  onColorChange(color: any, key: any) {
    this.userTheme[`${key}`] = color;
  }
}
