import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Transaction {
  id: string;
  date: Date;
  type: 'credit' | 'debit';
  amount: number;
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
  issueDate: Date;
  dueDate: Date;
  amount: number;
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

@Injectable({
  providedIn: 'root'
})
export class AccountingService {
  private apiUrl = `${environment.APIUrl}/accounting`;

  constructor(private http: HttpClient) {}

  // Transactions
  getTransactions(filters?: any): Observable<{ data: Transaction[] }> {
    // TODO: Replace with actual API call
    // return this.http.get<{ data: Transaction[] }>(`${this.apiUrl}/transactions`, { params: filters });
    
    // Mock data for now
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        date: new Date('2024-01-15'),
        type: 'credit',
        amount: 50000,
        category: 'Project Payment',
        description: 'Payment from Client A - Project Alpha',
        clientName: 'Client A',
        invoiceId: 'INV-001'
      },
      {
        id: '2',
        date: new Date('2024-01-20'),
        type: 'debit',
        amount: 15000,
        category: 'Software Tools',
        description: 'Annual subscription for development tools',
        invoiceId: 'EXP-001'
      },
      {
        id: '3',
        date: new Date('2024-02-01'),
        type: 'credit',
        amount: 75000,
        category: 'Project Payment',
        description: 'Payment from Client B - Project Beta',
        clientName: 'Client B',
        invoiceId: 'INV-002'
      },
      {
        id: '4',
        date: new Date('2024-02-05'),
        type: 'debit',
        amount: 25000,
        category: 'Salaries',
        description: 'Monthly salary payment',
        invoiceId: 'EXP-002'
      },
      {
        id: '5',
        date: new Date('2024-02-10'),
        type: 'debit',
        amount: 5000,
        category: 'Office Rent',
        description: 'Monthly office rent',
        invoiceId: 'EXP-003'
      },
      {
        id: '6',
        date: new Date('2024-02-15'),
        type: 'credit',
        amount: 40000,
        category: 'Consulting',
        description: 'Consulting fee from Client C',
        clientName: 'Client C',
        invoiceId: 'INV-003'
      }
    ];
    return of({ data: mockTransactions });
  }

  addTransaction(transaction: Partial<Transaction>): Observable<{ data: Transaction }> {
    // TODO: Replace with actual API call
    // return this.http.post<{ data: Transaction }>(`${this.apiUrl}/transactions`, transaction);
    return of({ data: { ...transaction, id: Date.now().toString() } as Transaction });
  }

  // Invoices
  getInvoices(): Observable<{ data: Invoice[] }> {
    // TODO: Replace with actual API call
    // return this.http.get<{ data: Invoice[] }>(`${this.apiUrl}/invoices`);
    
    const mockInvoices: Invoice[] = [
      {
        id: '1',
        invoiceNumber: 'INV-001',
        clientName: 'Client A',
        clientEmail: 'clienta@example.com',
        issueDate: new Date('2024-01-01'),
        dueDate: new Date('2024-01-15'),
        amount: 50000,
        status: 'paid',
        items: [
          { description: 'Project Alpha - Development', quantity: 1, rate: 50000, amount: 50000 }
        ],
        tax: 0,
        total: 50000
      },
      {
        id: '2',
        invoiceNumber: 'INV-002',
        clientName: 'Client B',
        clientEmail: 'clientb@example.com',
        issueDate: new Date('2024-01-20'),
        dueDate: new Date('2024-02-01'),
        amount: 75000,
        status: 'paid',
        items: [
          { description: 'Project Beta - Full Stack Development', quantity: 1, rate: 75000, amount: 75000 }
        ],
        tax: 0,
        total: 75000
      },
      {
        id: '3',
        invoiceNumber: 'INV-003',
        clientName: 'Client C',
        clientEmail: 'clientc@example.com',
        issueDate: new Date('2024-02-05'),
        dueDate: new Date('2024-02-20'),
        amount: 40000,
        status: 'sent',
        items: [
          { description: 'Consulting Services', quantity: 40, rate: 1000, amount: 40000 }
        ],
        tax: 0,
        total: 40000
      }
    ];
    return of({ data: mockInvoices });
  }

  createInvoice(invoice: Partial<Invoice>): Observable<{ data: Invoice }> {
    // TODO: Replace with actual API call
    // return this.http.post<{ data: Invoice }>(`${this.apiUrl}/invoices`, invoice);
    return of({ data: { ...invoice, id: Date.now().toString() } as Invoice });
  }

  updateInvoice(id: string, invoice: Partial<Invoice>): Observable<{ data: Invoice }> {
    // TODO: Replace with actual API call
    // return this.http.put<{ data: Invoice }>(`${this.apiUrl}/invoices/${id}`, invoice);
    return of({ data: { ...invoice, id } as Invoice });
  }

  deleteInvoice(id: string): Observable<{ message: string }> {
    // TODO: Replace with actual API call
    // return this.http.delete<{ message: string }>(`${this.apiUrl}/invoices/${id}`);
    return of({ message: 'Invoice deleted successfully' });
  }

  // Analytics
  getCategoryWiseSpending(): Observable<{ data: { category: string; amount: number }[] }> {
    // TODO: Replace with actual API call
    const mockData = [
      { category: 'Salaries', amount: 25000 },
      { category: 'Software Tools', amount: 15000 },
      { category: 'Office Rent', amount: 5000 },
      { category: 'Marketing', amount: 8000 },
      { category: 'Utilities', amount: 3000 }
    ];
    return of({ data: mockData });
  }

  getCreditDebitSummary(startDate?: Date, endDate?: Date): Observable<{ credits: number; debits: number }> {
    // TODO: Replace with actual API call
    return of({ credits: 165000, debits: 56000 });
  } 
}
