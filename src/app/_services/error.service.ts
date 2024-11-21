import { Injectable, ErrorHandler } from '@angular/core';
import { ToastLocation, ToastService } from './toast.service';
@Injectable({
  providedIn: 'root'
})
export class ErrorService implements ErrorHandler {
  constructor(private toastService: ToastService) {
  }

  handleError(error: any): void {
    console.error(error);
    const message = error.rejection ? error.rejection?.message : error.message;

    this.toastService.showError(message);
  }
}
