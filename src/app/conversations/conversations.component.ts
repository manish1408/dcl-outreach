import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConversationService } from '../_services/conversations.service';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-conversations',
  templateUrl: './conversations.component.html',
  styleUrl: './conversations.component.scss',
})
export class ConversationsComponent implements OnInit {
  avatar =
    'https://milodocs.blob.core.windows.net/public-docs/profile-picture.webp';

  users = [
    {
      id: 1,
      name: 'Mehedi Hasan',
      role: 'Front End Developer',
      time: '08:15 AM',
      badgeCount: 14,
    },
    {
      id: 2,
      name: 'Ayesha Akter',
      role: 'UI/UX Designer',
      time: '09:30 AM',
      badgeCount: 8,
    },
    {
      id: 3,
      name: 'John Doe',
      role: 'Backend Developer',
      time: '07:45 AM',
      badgeCount: 2,
    },
  ];
  users2 = [
    {
      id: 4,
      name: 'Jane Smith',
      role: 'Project Manager',
      time: '11:00 AM',
      badgeCount: 5,
    },
    {
      id: 5,
      name: 'Michael Brown',
      role: 'Full Stack Developer',
      time: '06:45 AM',
      badgeCount: 7,
    },
    {
      id: 6,
      name: 'Emily Davis',
      role: 'QA Engineer',
      time: '12:15 PM',
      badgeCount: 3,
    },
    {
      id: 7,
      name: 'David Wilson',
      role: 'DevOps Engineer',
      time: '10:30 AM',
      badgeCount: 9,
    },
    {
      id: 8,
      name: 'Sarah Lee',
      role: 'Product Owner',
      avatar: 'path/to/avatar8.jpg',
      time: '02:15 PM',
      badgeCount: 1,
    },
    {
      id: 9,
      name: 'Chris Martin',
      role: 'Scrum Master',
      avatar: 'path/to/avatar9.jpg',
      time: '04:00 PM',
      badgeCount: 6,
    },
    {
      id: 10,
      name: 'Olivia Thompson',
      role: 'Business Analyst',
      time: '01:30 PM',
      badgeCount: 12,
    },
    {
      id: 11,
      name: 'James White',
      role: 'System Architect',
      time: '09:15 AM',
      badgeCount: 4,
    },
    {
      id: 12,
      name: 'Isabella King',
      role: 'Content Strategist',
      time: '05:45 AM',
      badgeCount: 10,
    },
    {
      id: 13,
      name: 'Benjamin Garcia',
      role: 'Data Scientist',
      time: '03:00 PM',
      badgeCount: 11,
    },
    {
      id: 14,
      name: 'Charlotte Martinez',
      role: 'Marketing Specialist',
      time: '07:00 AM',
      badgeCount: 13,
    },
    {
      id: 15,
      name: 'Liam Harris',
      role: 'Security Analyst',
      time: '08:45 AM',
      badgeCount: 15,
    },
  ];

  conversation: any[] = [];
  userConversation: any[] = [];
  userInput: string = '';
  responseData: string = '';
  isStreaming: boolean = false;
  selectedChatBotId = '';
  loading = false;
  user: any;
  stats: any;
  activeItem: string = '7'; // Default active item
  id: string | null = null;
  currentReceiverId = ''
  receiverId= '';
  chatRoomId='';
  chatUserName='User';

  @ViewChild('chatContainer') private chatContainer: any;

  constructor(private conversationService: ConversationService, private route: ActivatedRoute) {}
  
  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer?.nativeElement?.scrollHeight;
    } catch (err) {
      console.error('Could not scroll to bottom:', err);
    }
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.selectedChatBotId = params['id'];
      this.getStats();
      this.scrollToBottom();
    });
  }

  getStats(){
    this.loading = true;
    this.conversationService
      .getStats(this.selectedChatBotId as string, Number(this.activeItem))
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => {
        console.log(res.data); 
        this.stats = res.data;
        // this.conversation=res.data.latestMessage.message;  
        // this.userConversation=this.conversation;
        // console.log("here",res.data[0].latestMessage.message)
        // this.receiverId=res.data.receiverId;
      });
  }

getRanHex(size:any) {
    let result = [];
    let hexRef = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
  
    for (let n = 0; n < size; n++) {
      result.push(hexRef[Math.floor(Math.random() * 16)]);
    }
    return result.join('');
  }

  getConversationMessages(){
      this.loading = true;
      this.conversationService
        .getConversationMessage(this.selectedChatBotId as string, this.currentReceiverId as string)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe((res) => {
          this.conversation=res.data.allMessages;
          this.chatRoomId=res.data.chatRoomId;
          this.chatUserName=res.data.receiverName;
          // this.stats = res.data;
        });
  }

  initiateChat(chatbotId: string,receiverId: string){
    this.loading = true;
    this.conversationService
    .startNewChat( this.getRanHex(16),chatbotId )
    .pipe(finalize(() => (this.loading = false)))
    .subscribe((res) => {
          this.getStats();
          console.log(res.data);
          // this.stats = res.data;
        });
    
  }

  startChat(question: string) {
    this.loading = true;
    this.isStreaming = true;
    // this.userInput=''
    this.responseData = ''; 
  
    // Capture the start time in milliseconds
    const startTime = Date.now();
    let firstChunkReceived = false;
    this.conversation.push({
      "question":question,
      "answer": "..."
    })
  
    this.conversationService.invokeChatWithRag(this.selectedChatBotId, question,this.chatRoomId).subscribe({
      next: (chunk) => {
        this.loading = false;
        
        if (!firstChunkReceived) {
          const timeTaken = (Date.now() - startTime) / 1000; // Calculate time in seconds
          console.log(`First chunk received after ${timeTaken.toFixed(2)} seconds`);
          firstChunkReceived = true;
        }
        // console.log(chunk, "\n");
        this.responseData += chunk; // Append the chunk to the existing data
        this.conversation[this.conversation.length -1].answer = this.responseData 
        this.userInput=''
      },
      error: (err) => {
        console.error('Streaming error:', err);
        this.isStreaming = false;
      },
      complete: () => {
        console.log('Stream completed.');
        this.isStreaming = false;
      },
    });
  }

  handleClick(id:any){
    this.currentReceiverId = id;
    this.getConversationMessages();
  }

}
