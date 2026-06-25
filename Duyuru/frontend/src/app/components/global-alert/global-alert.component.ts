import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-global-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Arkaplan Blur ve Overlay -->
    <div *ngIf="alert()" class="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 animate-fadeIn">
      
      <!-- Modal Kutusu - Premium Glassmorphism -->
      <div class="bg-white/85 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] p-10 max-w-sm w-full flex flex-col items-center text-center animate-slideUp relative overflow-hidden border border-white/60">
        
        <!-- Üst Dekoratif Işık Efekti -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-b from-white/60 to-transparent rounded-full blur-2xl pointer-events-none"></div>

        <!-- İkon Çemberi -->
        <div class="relative w-24 h-24 rounded-[1.75rem] flex items-center justify-center mb-6 shadow-sm border border-white/50 backdrop-blur-md rotate-3" 
             [ngClass]="{
               'bg-emerald-50/80 text-emerald-500': alert()?.type === 'success',
               'bg-rose-50/80 text-rose-500': alert()?.type === 'error',
               'bg-blue-50/80 text-blue-500': alert()?.type === 'info',
               'bg-amber-50/80 text-amber-500': alert()?.type === 'warning'
             }">
             
           <!-- Success Icon -->
           <svg *ngIf="alert()?.type === 'success'" xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 -rotate-3 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
           
           <!-- Error Icon -->
           <svg *ngIf="alert()?.type === 'error'" xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 -rotate-3 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
           
           <!-- Info Icon -->
           <svg *ngIf="alert()?.type === 'info'" xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 -rotate-3 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           
           <!-- Warning Icon -->
           <svg *ngIf="alert()?.type === 'warning'" xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 -rotate-3 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        
        <!-- Başlık -->
        <h3 class="text-2xl font-black text-slate-800 mb-3 tracking-tight relative z-10 drop-shadow-sm">{{ alert()?.title || getDefaultTitle() }}</h3>
        
        <!-- Mesaj -->
        <p class="text-slate-600 mb-8 leading-relaxed font-medium text-sm relative z-10">{{ alert()?.message }}</p>

        <!-- Kapat Butonu -->
        <button (click)="close()" class="w-full py-4 px-6 rounded-2xl font-bold text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-lg relative z-10 overflow-hidden group"
           [ngClass]="{
               'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/30 border border-emerald-400/50': alert()?.type === 'success',
               'bg-rose-500 hover:bg-rose-400 shadow-rose-500/30 border border-rose-400/50': alert()?.type === 'error',
               'bg-indigo-500 hover:bg-indigo-400 shadow-indigo-500/30 border border-indigo-400/50': alert()?.type === 'info',
               'bg-amber-500 hover:bg-amber-400 shadow-amber-500/30 border border-amber-400/50': alert()?.type === 'warning'
           }">
          <span class="relative z-10 tracking-wide">Tamam</span>
          <div class="absolute inset-0 h-full w-full bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
          <!-- Buton parlaması -->
          <div class="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1s_forwards] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn { 
      from { opacity: 0; backdrop-filter: blur(0px); } 
      to { opacity: 1; backdrop-filter: blur(4px); } 
    }
    @keyframes slideUp { 
      from { opacity: 0; transform: scale(0.9) translateY(30px); } 
      to { opacity: 1; transform: scale(1) translateY(0); } 
    }
    @keyframes shimmer {
      100% { transform: translateX(100%); }
    }
    .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-slideUp { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `]
})
export class GlobalAlertComponent {
  public alertService = inject(AlertService);
  public alert = this.alertService.alertSignal;

  getDefaultTitle(): string {
    const type = this.alert()?.type;
    if (type === 'success') return 'İşlem Başarılı!';
    if (type === 'error') return 'Bir Hata Oluştu!';
    if (type === 'warning') return 'Lütfen Dikkat!';
    return 'Bilgilendirme';
  }

  close() {
    this.alertService.close();
  }
}
