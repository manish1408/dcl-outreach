import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, finalize, takeUntil } from 'rxjs';
import { UserService } from '../../_services/user.service';
import { ChatService } from '../../_services/chat.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import moment from 'moment';

@Component({
  selector: 'app-loan-summary-page',
  templateUrl: './loan-summary-page.component.html',
  styleUrl: './loan-summary-page.component.scss',
})
export class LoanSummaryComponent {
  loading: boolean = false;
 
  private apiUrl = 'https://transaction-extraction-api.ambitioussea-e176fcf4.centralindia.azurecontainerapps.io/api/v1/get-transaction';

  gaugeType = 'full';
  gaugeThick = 15;
  gaugevalue = 790;
  gaugemax = 900;
  gaugethresholds = {
    '0': { color: 'green' },
    '500': { color: '#6BE3AA' },
    '1000': { color: 'orangeRed' },
    '1500': { color: 'red' }
  };

  aadhar:any | null;
  panData:any;
  passportData:any;
  customerData:any;
  bankStatementData:any;
  transactionHistory: { month: string; year: number; totalDebit: number; totalCredit: number }[] = [];
  fetchedTransaction:any;
  averageMonthlyIncome:any;
  monthyDataLoading = true;
  private intervalId: any;

   // Aadhaar data
   aadhardata = {
    "Aadhar number": "7450 0868 0917",
    "Address": "W/O Mahendra Prasad Keshri, Telaiya Road Nahar, Barhi, Barhi, Hazaribagh, Jharkhand, 825405",
    "Name": "Savita Keshri",
    "Year of Birth": "1969"
  };

  // Loan data
  loanFormData = {
    employmentType: "selfEmployment",
    professionalType: "Professional",
    experience: "1-2 years",
    city: "Pune",
    grossAnnualIncome: "5586",
    loanAmount: "50352125",
    emis: "3"
  };
  monthlyData: { 
    month: string; 
    year: number; 
    totalDebit: number; 
    totalCredit: number; 
    transactions: any[] 
  }[] = [];

  totalIncomeLast6Months: number = 0;
  grossIncomeLast6Months: number = 0;
  debtToEquityRatio: number | string = 0; // Ratio can be a number or a message if division by zero


  constructor(
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private userService: UserService,
    private http: HttpClient,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.aadhardata = JSON.parse(sessionStorage.getItem('aadhar') || '')
    let loanFormData = JSON.parse(sessionStorage.getItem('loanFormData') || '')
    this.loanFormData = loanFormData[0] || {};
    this.passportData = JSON.parse(sessionStorage.getItem('passport') || '')
    this.panData = JSON.parse(sessionStorage.getItem('pan') || '')
    this.bankStatementData = JSON.parse(sessionStorage.getItem('bankStatement') || '');
    this.intervalId = setInterval(() => this.getTransaction(), 5000);

  }

  ngOnDestroy(): void {
    this.clearIntervalIfNeeded();
  }

  clearIntervalIfNeeded(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.monthyDataLoading = false;
    }
  }

  get age() {
    return new Date().getFullYear() - parseInt(this.aadhardata['Year of Birth']);
  }

  
  calculateMonthlyData() {
    const grouped = this.fetchedTransaction.reduce((acc:any, transaction:any) => {
      const date = moment(transaction.trans_date);
      const monthYear = date.format('YYYY-MM');

      if (!acc[monthYear]) {
        acc[monthYear] = { 
          totalDebit: 0, 
          totalCredit: 0, 
          month: date.format('MMMM'), 
          year: date.year(), 
          transactions: [] 
        };
      }

      const debit = parseFloat(transaction.debit) || 0;
      const credit = parseFloat(transaction.credit) || 0;

      acc[monthYear].totalDebit += debit;
      acc[monthYear].totalCredit += credit;
      acc[monthYear].transactions.push(transaction);

      return acc;
    }, {});

    // Convert the grouped object to an array for easy iteration in the template
    this.monthlyData = Object.values(grouped);
  }

  getTransaction(): void {
    this.monthyDataLoading = true;
    if (this.bankStatementData.filename) {
      const url = `${this.apiUrl}?filename=${this.bankStatementData.filename}`; // Assuming the API uses the transaction ID in the URL
      
      this.http.get(url).subscribe(
        (response:any) => {
          if (response.status === 'SUCCESS') {
            // Clear the interval when response is successful
            this.clearIntervalIfNeeded();
          }

          this.fetchedTransaction = response.items;
          this.calculateMonthlyData();
          this.calculateIncomeLast6Months();
          this.calculateGrossIncome();
          this.calculateDebtToEquityRatio();
        },
        (error) => {
          console.error(error);
        }
      );
    } else {
    }
    
  }


  calculateIncomeLast6Months() {
    const endDate = moment('2024-03-01'); // March 1, 2024
    const startDate = endDate.clone().subtract(6, 'months'); // Last 6 months from March 2024

    this.totalIncomeLast6Months = this.fetchedTransaction
      .filter((transaction:any) => {
        const transDate = moment(transaction.trans_date);
        return transDate.isBetween(startDate, endDate, undefined, '[)');
      })
      .reduce((acc:any, transaction:any) => acc + (parseFloat(transaction.credit) || 0), 0);

      this.averageMonthlyIncome = this.totalIncomeLast6Months / 6;
  }

  calculateGrossIncome() {
    const endDate = moment('2024-03-01'); // March 1, 2024
    const startDate = endDate.clone().subtract(6, 'months'); // Last 6 months from March 2024

    const { totalCredits, totalDebits } = this.fetchedTransaction
      .filter((transaction:any) => {
        const transDate = moment(transaction.trans_date);
        return transDate.isBetween(startDate, endDate, undefined, '[)');
      })
      .reduce(
        (acc:any, transaction:any) => {
          acc.totalCredits += parseFloat(transaction.credit) || 0;
          acc.totalDebits += parseFloat(transaction.debit) || 0;
          return acc;
        },
        { totalCredits: 0, totalDebits: 0 }
      );

    // Gross income is calculated as Total Credits - Total Debits
    this.grossIncomeLast6Months = totalCredits - totalDebits;
  }


  calculateDebtToEquityRatio() {
    const endDate = moment('2024-03-01'); // March 1, 2024
    const startDate = endDate.clone().subtract(6, 'months'); // Last 6 months from March 2024

    const { totalCredits, totalDebits } = this.fetchedTransaction
      .filter((transaction:any) => {
        const transDate = moment(transaction.trans_date);
        return transDate.isBetween(startDate, endDate, undefined, '[)');
      })
      .reduce(
        (acc:any, transaction:any) => {
          acc.totalCredits += parseFloat(transaction.credit) || 0;
          acc.totalDebits += parseFloat(transaction.debit) || 0;
          return acc;
        },
        { totalCredits: 0, totalDebits: 0 }
      );

    // Avoid division by zero if totalCredits is 0
    this.debtToEquityRatio = totalCredits > 0 ? totalDebits / totalCredits : 'Equity is zero (undefined ratio)';
  }

}
