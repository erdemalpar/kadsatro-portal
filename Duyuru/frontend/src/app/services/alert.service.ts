import { Injectable, signal } from '@angular/core';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

export interface AlertMessage {
  title?: string;
  message: string;
  type: AlertType;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  public alertSignal = signal<AlertMessage | null>(null);

  show(message: string, type: AlertType = 'info', title?: string) {
    this.alertSignal.set({ message, type, title });
  }

  success(message: string, title?: string) {
    this.show(message, 'success', title);
  }

  error(message: string, title?: string) {
    this.show(message, 'error', title);
  }

  warning(message: string, title?: string) {
    this.show(message, 'warning', title);
  }

  info(message: string, title?: string) {
    this.show(message, 'info', title);
  }

  close() {
    this.alertSignal.set(null);
  }
}
