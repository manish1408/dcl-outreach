import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ConversationService {
  // private _url = `https://api.miloassistant.ai/api/v1/ai`;
  private _url = `${environment['APIUrl']}/ai`;
  constructor(private http: HttpClient) {}

  // Stream data from the API via POST with body
  invokeChatWithRag(chatbotId: string, question: string,chatRoomId: string): Observable<string> {
    const body = {
      question: question,
      chatRoomId: chatRoomId
    };

    return new Observable<string>((observer) => {
      const request = new XMLHttpRequest();
      request.open('POST', `${this._url}/chat?chatbotId=${chatbotId}`, true);
      request.setRequestHeader('Content-Type', 'application/json');

      let previousLength = 0; // Keep track of processed data length

      // Listen for the streaming response
      request.onreadystatechange = () => {
        if (request.readyState === 3 || request.readyState === 4) {
          // Handle partial (readyState 3) and final (readyState 4) responses
          const newResponse = request.responseText.substring(previousLength);
          previousLength = request.responseText.length; // Update processed length

          if (newResponse) {
            observer.next(newResponse); // Emit only new portion of the response
          }

          // Check if the request has completed (readyState 4)
          if (request.readyState === 4) {
            if (request.status === 200) {
              observer.complete(); // Complete the observable
            } else {
              observer.error('Error during streaming');
            }
          }
        }
      };

      request.onerror = (error) => {
        observer.error(error); // Handle errors
      };

      // Send the request with the question in the body
      request.send(JSON.stringify(body));

      // Clean up when unsubscribing from the observable
      return () => {
        request.abort();
      };
    });
  }

  getStats( chatbotId: string,days:number) {
    return this.http.get<any>(
      `${environment['APIUrl']}/conversations/get-all-conversation?chatbotId=${chatbotId}&days=${days}`
    );
  }

  getConversationMessage(chatbotId: string, receiverId: string) {
    return this.http.get<any>(
      `${environment['APIUrl']}/conversations/get-conversation-message?receiverId=${receiverId}&chatbotId=${chatbotId}`
    );
  }

  startNewChat(receiverId: string, chatbotId: string):Observable<any> {
    return this.http.post<any>(
      `${environment['APIUrl']}/conversations/chat`,{chatbotId:chatbotId,receiverId:receiverId}
    )
  }
}
