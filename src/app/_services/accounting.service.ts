import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Transaction {
  id: string;
  date: Date | string;
  type: 'credit' | 'debit';
  amount: number;
  usdAmount?: number;
  exchangeRate?: number;
  category: string;
  description: string;
  clientName?: string;
  invoiceId?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  issueDate: Date | string;
  dueDate: Date | string;
  amount: number;
  usdAmount?: number;
  exchangeRate?: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  items: InvoiceItem[];
  tax?: number;
  total: number;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Bill {
  id: string;
  clientName: string;
  amount: number;
  billDate: Date | string;
  uploadedDate: Date | string;
  fileLink: string;
}

interface AccountingData {
  transactions: Transaction[];
  invoices: Invoice[];
  bills: Bill[];
  categorySpending: { category: string; amount: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class AccountingService {
  private apiUrl = `${environment.APIUrl}/accounting`;
  private accountingData$: Observable<AccountingData>;

  constructor(private http: HttpClient) {
    this.accountingData$ = this.http.get<AccountingData>('assets/data/accounting-data.json').pipe(
      shareReplay(1)
    );
  }

  // Transactions
  getTransactions(filters?: any): Observable<{ data: Transaction[] }> {
    return this.accountingData$.pipe(
      map((data: AccountingData) => ({
        data: data.transactions.map((t: Transaction) => ({
          ...t,
          date: new Date(t.date)
        }))
      }))
    );
  }

  addTransaction(transaction: Partial<Transaction>): Observable<{ data: Transaction }> {
    return of({ data: { ...transaction, id: Date.now().toString() } as Transaction });
  }

  // Invoices
  getInvoices(): Observable<{ data: Invoice[] }> {
    return this.accountingData$.pipe(
      map((data: AccountingData) => ({
        data: data.invoices.map((inv: Invoice) => ({
          ...inv,
          issueDate: new Date(inv.issueDate),
          dueDate: new Date(inv.dueDate)
        }))
      }))
    );
  }

  createInvoice(invoice: Partial<Invoice>): Observable<{ data: Invoice }> {
    return of({ data: { ...invoice, id: Date.now().toString() } as Invoice });
  }

  updateInvoice(id: string, invoice: Partial<Invoice>): Observable<{ data: Invoice }> {
    return of({ data: { ...invoice, id } as Invoice });
  }

  deleteInvoice(id: string): Observable<{ message: string }> {
    return of({ message: 'Invoice deleted successfully' });
  }

  // Bills
  getBills(): Observable<{ data: Bill[] }> {
    return this.accountingData$.pipe(
      map((data: AccountingData) => ({
        data: (data.bills ? data.bills : []).map((bill: Bill) => ({
          ...bill,
          billDate: new Date(bill.billDate),
          uploadedDate: new Date(bill.uploadedDate)
        }))
      }))
    );
  }

  createBill(bill: Partial<Bill>): Observable<{ data: Bill }> {
    return of({ data: { ...bill, id: Date.now().toString() } as Bill });
  }

  updateBill(id: string, bill: Partial<Bill>): Observable<{ data: Bill }> {
    return of({ data: { ...bill, id } as Bill });
  }

  deleteBill(id: string): Observable<{ message: string }> {
    return of({ message: 'Bill deleted successfully' });
  }

  // Analytics
  getCategoryWiseSpending(): Observable<{ data: { category: string; amount: number }[] }> {
    return this.accountingData$.pipe(
      map((data: AccountingData) => ({ data: data.categorySpending }))
    );
  }

  getCreditDebitSummary(startDate?: Date, endDate?: Date): Observable<{ credits: number; debits: number }> {
    return this.getTransactions().pipe(
      map(res => {
        let filtered = res.data;
        if (startDate) {
          filtered = filtered.filter(t => new Date(t.date) >= startDate);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          filtered = filtered.filter(t => new Date(t.date) <= end);
        }
        const credits = filtered.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
        const debits = filtered.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
        return { credits, debits };
      })
    );
  }
}
