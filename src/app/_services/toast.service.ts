import { Injectable } from '@angular/core';
declare var NioApp: any;
declare var Swal: any;

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor() { }

  showError(message: string, duration: number = 5000, position: ToastLocation = ToastLocation.TopRight, showCloseButton: boolean = true) {
    if (message) {
      Swal.fire(
        'Error',
        message,
        'error'
      )
    }
  }

  showInfo(message: string, duration: number = 5000, position: ToastLocation = ToastLocation.TopRight, showCloseButton: boolean = true) {
    Swal.fire(
      'Info',
      message,
      'info'
    )
  }

  showSuccess(message: string, duration: number = 5000, position: ToastLocation = ToastLocation.TopRight, showCloseButton: boolean = true) {
    Swal.fire(
      'Success',
      message,
      'success'
    )
  }

  showWarning(message: string, duration: number = 5000, position: ToastLocation = ToastLocation.TopRight, showCloseButton: boolean = true) {
    Swal.fire(message)

  }
}

export enum ToastLocation {
  Default = 'default',
  BottomCenter = 'bottom-center',
  BottomLeft = 'bottom-left',
  BottomRight = 'bottom-right',
  BottomFullWidth = 'bottom-full',
  TopCenter = 'top-center',
  TopLeft = 'top-left',
  TopRight = 'top-right',
  TopFullWidth = 'top-full',
}
