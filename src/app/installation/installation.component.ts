import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../_services/user.service';
import { Subject, finalize, takeUntil } from 'rxjs';
import { ChatService } from '../_services/chat.service';

@Component({
  selector: 'app-installation',
  templateUrl: './installation.component.html',
  styleUrl: './installation.component.scss',
})
export class InstallationComponent {
  loading: boolean = false;
  selectedChatBotId: string = '';
  scriptText: string = "<script src='32523095025029357.js'></script>";
  channels = {
    web: false,
    discord: false,
    instagram: false,
    whatsapp: false,
    telegram: false,
    sms: false,
  };
  constructor(
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private userService: UserService,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.selectedChatBotId = params['id'];
      if (this.selectedChatBotId) {
        this.scriptText = `<script src='https://app.miloassistant.ai/script/${this.selectedChatBotId}.js'></script>`;
      }
    });
    this.getChatbotDetails();
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.scriptText);
    this.toastr.success('Copied to clipboard.');
  }

  getChatbotDetails() {
    this.chatService
      .getChatbotDetails(this.selectedChatBotId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.channels = res.data.channels;
        },
        error: (err) => {
          this.toastr.error(err.error.msg);
        },
      });
  }
  saveChannels() {
    const reqObj = {
      chatBotId: this.selectedChatBotId,
      channels: this.channels,
    };
    this.chatService.updateChannel(reqObj).subscribe({
      next: (res) => {
        this.channels = res.data.channels;
        this.toastr.success('Channels Updated Successfully');
      },
      error: (err) => {
        this.toastr.error(err.error.msg);
      },
    });
  }
}
