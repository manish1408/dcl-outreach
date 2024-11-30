import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChatService } from '../_services/chat.service';
import { filter, finalize } from 'rxjs';
import { UserService } from '../_services/user.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ThemeService } from '../_services/theme.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chatbots',
  templateUrl: './chatbots.component.html',
  styleUrl: './chatbots.component.scss',
})
export class ChatbotsComponent {
  selectedChatBotId: string = '';
  chatForm!: FormGroup;
  personaForm!: FormGroup;
  user: any;
  apiLoading: boolean = false;
  loading: boolean = false;
  chatLoading: boolean = false;
  formLoading: boolean = false;
  newMessage: string = '';
  threadId: string = '';
  data: any;
  avatar: any;
  addForm: FormGroup | any;
  items!: FormArray;
  leadFormData: any[] = [];
  imageTypes = ['jpeg', 'webp', 'jpg', 'png'];
  imgFiles: any[] = [];
  avatarImageDetail: any;

  messages: any[] = [
    // {
    //   text: 'Hi, welcome to MiloChat! Go ahead and send me a message. 😄',
    //   time: '12:45',
    //   isBot: true,
    //   avatar: 'https://image.flaticon.com/icons/svg/327/327779.svg',
    // },
  ];
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  editorOptions = { theme: 'vs-dark', language: 'css', validate: true };
  allowedMimes = ['image/jpeg', 'image/webp', 'image/jpg', 'image/png'];
  maxSize = 10 * 1024 * 1024;
  isValidFieldType: boolean = false;

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {
    this.personaForm = this.fb.group({
      agentName: ['', [Validators.required]],
      companyName: ['', [Validators.required]],
      description: ['', [Validators.required]],
      welcomeMessage: ['', [Validators.required]],
      acsent: [''],
      toneOfVoice: [''],
      multistepInstruction: [''],
      messageLength: [''],
      language: [''],
      competitors: [false],
      emojiUsage: [false],
      moreHelp: [false],
      personalInfo: [false],
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.selectedChatBotId = params['id'];
    });
    this.user = this.userService.getUserDetails();
    this.getPersona();

    // this.addForm =  this.fb.group({
    //   items: this.fb.array([]),  // Initialize an empty FormArray
    //   leadFormName: ['', Validators.required]
    // });
  }

  // ngAfterViewChecked() {
  //   this.scrollToBottom();
  // }

  getPersona() {
    this.apiLoading = true;
    this.chatService
      .getPersona(this.selectedChatBotId)
      .pipe(finalize(() => (this.apiLoading = false)))
      .subscribe((res) => {
        console.log('persona', res);
        // if(res?.data){
        this.personaForm.patchValue(res.data);
        // }
      });
  }

  // patchForm(themeData: any) {
  //   this.chatForm.patchValue(themeData);
  //   this.leadFormData = themeData?.leadFormData || [];
  //   this.avatarImageDetail = themeData.avatar.length ?  themeData.avatar[0] : null;
  //   this.chatForm.value.collectLeadData ?  this.chatForm.controls['collectLeadData'].disable() : this.chatForm.controls['collectLeadData'].enable();
  // }

  hasError(controlName: keyof typeof this.personaForm.controls) {
    return (
      this.personaForm.controls[controlName].invalid &&
      this.personaForm.controls[controlName].touched
    );
  }

  // sendMessage() {
  //   if (this.newMessage.trim()) {
  //     this.chatLoading = true;
  //     const reqObj = {
  //       assistantId: this.user.assistantId,
  //       question: this.newMessage,
  //       threadId: this.threadId,
  //     };

  //     this.chatService
  //       .interact(reqObj)
  //       .pipe(finalize(() => (this.chatLoading = false)))
  //       .subscribe((res) => {
  //         console.log(res);
  //         this.messages.push({
  //           text: res.data.message,
  //           time: new Date().toLocaleTimeString().slice(0, 5),
  //           isBot: true,
  //           avatar: 'https://image.flaticon.com/icons/svg/327/327779.svg',
  //         });
  //         this.threadId = res.data.threadId;
  //       });
  //     this.messages.push({
  //       text: this.newMessage,
  //       time: new Date().toLocaleTimeString().slice(0, 5),
  //       isBot: false,
  //       avatar: 'https://image.flaticon.com/icons/svg/145/145867.svg',
  //     });

  //     this.newMessage = '';
  //   }
  // }

  // scrollToBottom(): void {
  //   try {
  //     if( this.chatContainer?.nativeElement?.scrollTop){
  //       this.chatContainer.nativeElement.scrollTop =
  //       this.chatContainer?.nativeElement.scrollHeight;
  //     }

  //   } catch (err) {
  //     console.error('Could not scroll to bottom', err);
  //   }
  // }
  updatePersona(): void {
    this.personaForm.markAllAsTouched();
    if (this.personaForm.valid) {
      this.formLoading = true;
      const reqObj = {
        personas: this.personaForm.value,
        chatbotId: this.selectedChatBotId,
      };
      this.loading = true;
      this.chatService
        .updatePersona(reqObj)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (res: any) => {
            if (res.data) {
              this.toastr.success('Persona Updated Successfully');
            }
          },
          error: (err) => {
            this.toastr.error(err.error.msg);
          },
        });
    } else {
      this.toastr.error('Fields are required *');
    }
  }

  // createItem(): FormGroup {
  //   return this.fb.group({
  //     name: '',
  //     type: '',
  //     defaultValues: this.fb.array([this.createDefaultValue()]),
  //     isHide:false
  //   });
  // }

  // addItem(): void {
  //   this.items = this.addForm.get('items') as FormArray;
  //   this.items.push(this.createItem());
  // }

  // deleteForm(index: any) {
  //   const remove = this.addForm.get('items') as FormArray;
  //   remove.removeAt(index)
  // }

  // leadFormOpen() {
  //   this.addForm.setControl('items', new FormArray([]));
  //   if( this.leadFormData){
  //     this.leadFormData.forEach((res:any) =>{
  //       res.items.map((f:any,itemIndex:number) => {
  //         this.addItem();
  //         if(f.type == 'checkBox' ||f.type == 'dropDown'){
  //           f['isHide'] = true;
  //         } else {
  //           f['isHide'] = false;
  //         }
  //         f.defaultValues.forEach((defaultValue:any,defaultIndex:number)=>{
  //           if(defaultValue.value && defaultIndex > 0 ){
  //             (this.items.at(itemIndex).get('defaultValues') as FormArray).push(this.createDefaultValue());
  //           }
  //         });
  //       })
  //       this.addForm.patchValue(res);
  //     });
  //   }
  //   else{
  //     this.addItem();
  //   }
  // }

  // saveLeadForm() {
  //   this.addForm.markAllAsTouched();
  //   if (this.addForm.valid) {
  //     this.leadFormData[0] = this.addForm.value;
  //     this.chatForm.patchValue({collectLeadData:this.addForm.value.leadFormName});
  //   }
  // }

  // onSelect(event: any) {
  //   for (const file of event.addedFiles) {
  //     if (file.size > this.maxSize) {
  //       this.toastr.error(`File exceeds the maximum size of 10MB.`);
  //       return;
  //     }
  //     if (!this.allowedMimes.includes(file.type)) {
  //       this.toastr.error(` Unsupported File type.`);
  //       return;
  //     }
  //   }
  //   this.avatar = event.addedFiles[0];
  //   this.imgFiles = [];
  //   this.imgFiles.unshift(...event.addedFiles);
  //   this.avatarImageDetail = null;
  // }

  // getImageSrc(): string {
  //   return URL.createObjectURL(this.avatar);
  // }

  // fieldType(event:any , itemIndex:number){
  //   const items =this.addForm.get('items') as FormArray;
  //   let fType =items.value[itemIndex].type;
  //   if(fType == 'checkBox' ||fType == 'dropDown'){
  //     items.at(itemIndex).patchValue({isHide : true})
  //   } else {
  //     items.at(itemIndex).patchValue({isHide : false})
  //   }
  // }

  // createDefaultValue(): FormGroup {
  //   return this.fb.group({
  //     value: ['']
  //   });
  // }

  // addDefaultValues(index:number){
  //     (this.items.at(index).get('defaultValues') as FormArray).push(this.createDefaultValue());
  // }

  // deleteDefaultValue(itemIndex:number ,defaultValueIndex:number ){
  //     (this.items.at(itemIndex).get('defaultValues') as FormArray).removeAt(defaultValueIndex);
  // }

  // saveImage(reqObj: any) {
  //   if (this.imgFiles.length > 0) {
  //     const filesToAdd = this.imgFiles.filter((file) => file instanceof File);
  //     console.log(filesToAdd);
  //     let fd = new FormData();
  //     filesToAdd.forEach((f) => fd.append(`files`, f));
  //     fd.append('userId', this.user._id);

  //     this.themeService
  //       .saveAvatarImage(fd)
  //       .pipe(finalize(() => (this.loading = false)))
  //       .subscribe({
  //         next: (res) => {
  //           console.log('res:  image', res);
  //           if (res.result) {
  //             reqObj
  //             console.log('reqObj: ', reqObj);
  //             reqObj.configureDetails.avatar.push(res.data.avatar[0]);
  //             this.saveConfigDetails(reqObj);
  //           } else {
  //             this.toastr.error(res.msg);
  //           }
  //         },
  //         error: (err) => {
  //           console.log(err);
  //           this.toastr.error(err.error.msg);
  //         },
  //       });
  //   }
  // }

  // saveConfigDetails(reqObj: any) {
  //   this.themeService
  //     .saveUserConfigures(reqObj)
  //     .pipe(finalize(() => (this.formLoading = false)))
  //     .subscribe({
  //       next: (res) => {
  //         if (res.result) {
  //           this.toastr.success('Configure updated');
  //           this.getPersona();
  //         } else {
  //           this.toastr.error(res.msg);
  //         }
  //       },
  //       error: (err) => {
  //         console.log(err);
  //         this.toastr.error(err.error.msg);
  //       },
  //     });
  // }
}
