import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class AadhaarService {
  private apiUrl = 'https://api.sandbox.co.in/kyc/aadhaar/okyc/otp';
  private accessToken = 'eyJhbGciOiJIUzUxMiJ9.eyJhdWQiOiJBUEkiLCJyZWZyZXNoX3Rva2VuIjoiZXlKaGJHY2lPaUpJVXpVeE1pSjkuZXlKaGRXUWlPaUpCVUVraUxDSnpkV0lpT2lKdFlXNXBjMmhBWkdsemRHbHVZM1JqYkc5MVpDNXBieUlzSW1Gd2FWOXJaWGtpT2lKclpYbGZkR1Z6ZEY5UmIzTTFkRE53TkVsWWRXODJjbXBTYWxScVUxSnVhbUphZVhWVVFrMVhSU0lzSW1semN5STZJbUZ3YVM1ellXNWtZbTk0TG1OdkxtbHVJaXdpWlhod0lqb3hOell5TnprMU1USXdMQ0pwYm5SbGJuUWlPaUpTUlVaU1JWTklYMVJQUzBWT0lpd2lhV0YwSWpveE56TXhNalU1TVRJd2ZRLnVTcEdyaGJ6Y3ByVFl2a2t3U05xbVNqNk5FbndaSTZNTlZTT2NIcy1MUlRvaXc2aEFJNmJiTGNkREpuZ21iZHUyVzktUXRyZEZnYVp2UERxNHZkU1dBIiwic3ViIjoibWFuaXNoQGRpc3RpbmN0Y2xvdWQuaW8iLCJhcGlfa2V5Ijoia2V5X3Rlc3RfUW9zNXQzcDRJWHVvNnJqUmpUalNSbmpiWnl1VEJNV0UiLCJpc3MiOiJhcGkuc2FuZGJveC5jby5pbiIsImV4cCI6MTczMTM0NTUyMCwiaW50ZW50IjoiQUNDRVNTX1RPS0VOIiwiaWF0IjoxNzMxMjU5MTIwfQ.uzxHRy_Mkc1mukEFF-DirJWyWfStz9uBUdCsOtUKB4Zt5vDJ-0EQ8xqiAacKtKUBbXNX14igFQulVJ8yIzBpOQ'; // Replace with your actual access token

  private authUrl = 'https://api.sandbox.co.in/authenticate'; // Replace with the actual authentication endpoint
  private apiKey = 'key_test_Qos5t3p4IXuo6rjRjTjSRnjbZyuTBMWE'; // Replace with your actual API Key
  private apiSecret = 'secret_test_RXCnbZxN08ZrtxChDwh8Ze3fPFgv0V92'; // Replace with your actual API Secret
  private token: any;

  // "access_token": "eyJhbGciOiJIUzUxMiJ9.eyJhdWQiOiJBUEkiLCJyZWZyZXNoX3Rva2VuIjoiZXlKaGJHY2lPaUpJVXpVeE1pSjkuZXlKaGRXUWlPaUpCVUVraUxDSnpkV0lpT2lKdFlXNXBjMmhBWkdsemRHbHVZM1JqYkc5MVpDNXBieUlzSW1Gd2FWOXJaWGtpT2lKclpYbGZkR1Z6ZEY5UmIzTTFkRE53TkVsWWRXODJjbXBTYWxScVUxSnVhbUphZVhWVVFrMVhSU0lzSW1semN5STZJbUZ3YVM1ellXNWtZbTk0TG1OdkxtbHVJaXdpWlhod0lqb3hOell5TnprMU1USXdMQ0pwYm5SbGJuUWlPaUpTUlVaU1JWTklYMVJQUzBWT0lpd2lhV0YwSWpveE56TXhNalU1TVRJd2ZRLnVTcEdyaGJ6Y3ByVFl2a2t3U05xbVNqNk5FbndaSTZNTlZTT2NIcy1MUlRvaXc2aEFJNmJiTGNkREpuZ21iZHUyVzktUXRyZEZnYVp2UERxNHZkU1dBIiwic3ViIjoibWFuaXNoQGRpc3RpbmN0Y2xvdWQuaW8iLCJhcGlfa2V5Ijoia2V5X3Rlc3RfUW9zNXQzcDRJWHVvNnJqUmpUalNSbmpiWnl1VEJNV0UiLCJpc3MiOiJhcGkuc2FuZGJveC5jby5pbiIsImV4cCI6MTczMTM0NTUyMCwiaW50ZW50IjoiQUNDRVNTX1RPS0VOIiwiaWF0IjoxNzMxMjU5MTIwfQ.uzxHRy_Mkc1mukEFF-DirJWyWfStz9uBUdCsOtUKB4Zt5vDJ-0EQ8xqiAacKtKUBbXNX14igFQulVJ8yIzBpOQ"

  constructor(private http: HttpClient) {}

  generateOtp(aadhaarNumber: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.accessToken}`,
      'x-api-version': '2.0',
      'Content-Type': 'application/json'
    });

    const body = {
      aadhaar_number: aadhaarNumber
    };

    return this.http.post(this.apiUrl, body, { headers });
  }

  authenticate(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'x-api-secret': this.apiSecret,
      'x-api-version': '1'
    });

    return this.http.post(this.authUrl, {}, { headers }).pipe(
      tap((response: any) => {
        this.token = response.access_token; // Store the access token
        sessionStorage.setItem('accessToken', this.token); // Optionally store in session storage
      })
    );
  }

  getToken(): string | null {
    return this.token || sessionStorage.getItem('accessToken');
  }

}
