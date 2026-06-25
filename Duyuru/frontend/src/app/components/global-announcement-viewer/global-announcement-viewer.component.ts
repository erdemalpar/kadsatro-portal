import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnnouncementService } from '../../services/announcement.service';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-global-announcement-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Modal (Cinematic / Kart / Glassmorphism vb. formatı için) -->
    <div *ngIf="currentAnnouncement() && !isToastFormat()"
         class="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm"
         [ngClass]="currentAnnouncement()?.format === 'Cinematic' ? 'p-0' : 'p-4'">
      
      <!-- Modal Konteyneri (Stile Göre Genişlik/Yükseklik Değişir) -->
      <div class="relative overflow-hidden shadow-2xl flex flex-col"
           [ngClass]="{
             'animate-[fadeIn_0.3s_ease-out] bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl w-full max-w-4xl max-h-[90vh]': currentAnnouncement()?.format === 'Glassmorphism' || !currentAnnouncement()?.format,
             'animate-[fadeIn_0.5s_ease-in-out] bg-gradient-to-b from-gray-900 to-black rounded-none w-full h-full max-w-full max-h-full': currentAnnouncement()?.format === 'Cinematic',
             'animate-[fadeIn_0.3s_ease-out] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-[2.5rem] w-full max-w-md h-[85vh] border-4 border-gray-900': currentAnnouncement()?.format === 'Story'
           }">
        
        <!-- Cinematic Modu İçin Yüzer (Floating) Kapat Butonu -->
        <button *ngIf="currentAnnouncement()?.format === 'Cinematic'" (click)="markAsReadAndNext()" 
                class="absolute top-8 right-8 z-50 text-gray-500 hover:text-white bg-white/5 hover:bg-white/20 p-3 rounded-full backdrop-blur-md transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Header Kısmı (Cinematic Hariç) -->
        <div *ngIf="currentAnnouncement()?.format !== 'Cinematic'" class="px-6 py-4 flex justify-between items-center shrink-0"
             [ngClass]="{
               'border-b border-gray-200/50': currentAnnouncement()?.format === 'Glassmorphism' || !currentAnnouncement()?.format,
               'border-none pt-6': currentAnnouncement()?.format === 'Story'
             }">
          <h3 class="font-bold flex items-center gap-2"
              [ngClass]="{
                'text-gray-800': currentAnnouncement()?.format === 'Glassmorphism' || !currentAnnouncement()?.format,
                'text-white drop-shadow-md': currentAnnouncement()?.format === 'Story'
              }">
            <svg *ngIf="currentAnnouncement()?.format !== 'Story'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
            </svg>
            {{ isPreviewMode ? 'Duyuru Önizlemesi' : 'Yeni Duyuru' }}
          </h3>
          <div class="flex items-center gap-3">
            <!-- Countdown Göstergesi (Once + süre varsa) -->
            <div *ngIf="!isPreviewMode && countdownSeconds() !== null"
                 class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                 [ngClass]="{
                   'bg-indigo-50 text-indigo-600': currentAnnouncement()?.format === 'Glassmorphism' || !currentAnnouncement()?.format,
                   'bg-white/10 text-white': currentAnnouncement()?.format === 'Story'
                 }">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ formatCountdown(countdownSeconds()!) }}
            </div>
            <button (click)="markAsReadAndNext()" class="transition-colors p-1.5 rounded-full"
                    [ngClass]="{
                      'text-gray-500 hover:text-red-500 hover:bg-white/50': currentAnnouncement()?.format === 'Glassmorphism' || !currentAnnouncement()?.format,
                      'text-white/80 hover:text-white bg-black/20 hover:bg-black/40': currentAnnouncement()?.format === 'Story'
                    }">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- İçerik Alanı -->
        <div class="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar flex flex-col"
             [ngClass]="{
               'py-24 text-center items-center': currentAnnouncement()?.format === 'Cinematic'
             }">
           
           <div [ngClass]="{
             'w-full max-w-3xl mx-auto': currentAnnouncement()?.format === 'Glassmorphism' || !currentAnnouncement()?.format,
             'w-full max-w-4xl mx-auto flex flex-col items-center': currentAnnouncement()?.format === 'Cinematic',
             'w-full flex-1 flex flex-col': currentAnnouncement()?.format === 'Story'
           }">
              <!-- Etiket -->
              <span *ngIf="currentAnnouncement()?.format !== 'Story'" class="inline-block px-3 py-1 text-xs font-bold rounded-full mb-6"
                    [ngClass]="{
                      'bg-indigo-50/80 text-indigo-700': currentAnnouncement()?.format === 'Glassmorphism' || !currentAnnouncement()?.format,
                      'bg-white/10 text-gray-300 border border-white/10 tracking-widest uppercase': currentAnnouncement()?.format === 'Cinematic'
                    }">
                {{ currentAnnouncement()?.format }}
              </span>

              <!-- Başlık -->
              <h1 class="font-extrabold mb-8"
                  [ngClass]="{
                    'text-3xl lg:text-4xl text-gray-900': currentAnnouncement()?.format === 'Glassmorphism' || !currentAnnouncement()?.format,
                    'text-5xl lg:text-7xl text-white tracking-tighter drop-shadow-2xl': currentAnnouncement()?.format === 'Cinematic',
                    'text-3xl text-white drop-shadow-lg leading-tight mt-auto': currentAnnouncement()?.format === 'Story'
                  }">
                {{ currentAnnouncement()?.title }}
              </h1>
              
              <!-- HTML İçerik (Prose) -->
              <div class="prose max-w-none w-full" 
                   [ngClass]="{
                     'prose-indigo prose-img:rounded-xl prose-img:shadow-md': currentAnnouncement()?.format === 'Glassmorphism' || !currentAnnouncement()?.format,
                     'prose-invert prose-xl prose-img:rounded-3xl prose-img:shadow-[0_20px_50px_rgba(0,0,0,0.5)] prose-img:my-12 [&_*]:!text-gray-100 [&_a]:!text-blue-400 [&_img]:!mx-auto [&_video]:!mx-auto [&_video]:!rounded-3xl [&_video]:!shadow-[0_20px_50px_rgba(0,0,0,0.5)] [&_video]:!my-12': currentAnnouncement()?.format === 'Cinematic',
                     'prose-invert prose-p:text-white/90 prose-headings:text-white prose-img:rounded-xl prose-a:text-white': currentAnnouncement()?.format === 'Story'
                   }"
                   [innerHTML]="currentAnnouncement()?.content"></div>
                   
              <!-- Cinematic Countdown + Kapat Butonu -->
              <div *ngIf="currentAnnouncement()?.format === 'Cinematic'" class="mt-16 flex flex-col items-center gap-4">
                <div *ngIf="!isPreviewMode && countdownSeconds() !== null"
                     class="flex items-center gap-2 text-gray-400 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ formatCountdown(countdownSeconds()!) }} içinde otomatik kapanacak</span>
                </div>
                <button (click)="markAsReadAndNext()" 
                        class="px-12 py-4 rounded-full border border-white/20 text-white font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300">
                   Kapat
                </button>
              </div>
           </div>
        </div>
        
        <!-- Footer / Butonlar (Cinematic Hariç) -->
        <div *ngIf="currentAnnouncement()?.format !== 'Cinematic'" class="px-6 py-4 flex justify-between items-center shrink-0"
             [ngClass]="{
               'border-t border-gray-200/50': currentAnnouncement()?.format === 'Glassmorphism' || !currentAnnouncement()?.format,
               'pb-8': currentAnnouncement()?.format === 'Story'
             }">
          <span class="text-xs font-bold" *ngIf="queue().length > 1 && !isPreviewMode"
               [ngClass]="currentAnnouncement()?.format === 'Glassmorphism' ? 'text-gray-500' : 'text-gray-400'">
            Okunmamış {{ queue().length - 1 }} duyuru daha var...
          </span>
          <div class="flex-1"></div>

          <!-- Countdown Progress Bar (Once + süre varsa) -->
          <div *ngIf="!isPreviewMode && countdownSeconds() !== null && countdownTotal() > 0"
               class="flex items-center gap-3 mr-4">
            <div class="w-24 h-1.5 rounded-full overflow-hidden"
                 [ngClass]="{
                   'bg-indigo-100': currentAnnouncement()?.format === 'Glassmorphism' || !currentAnnouncement()?.format,
                   'bg-white/20': currentAnnouncement()?.format === 'Story'
                 }">
              <div class="h-full rounded-full transition-all duration-1000 ease-linear"
                   [ngClass]="{
                     'bg-indigo-500': currentAnnouncement()?.format === 'Glassmorphism' || !currentAnnouncement()?.format,
                     'bg-white/60': currentAnnouncement()?.format === 'Story'
                   }"
                   [style.width.%]="(countdownSeconds()! / countdownTotal()) * 100">
              </div>
            </div>
            <span class="text-xs font-bold tabular-nums"
                  [ngClass]="{
                    'text-indigo-500': currentAnnouncement()?.format === 'Glassmorphism' || !currentAnnouncement()?.format,
                    'text-white/80': currentAnnouncement()?.format === 'Story'
                  }">
              {{ formatCountdown(countdownSeconds()!) }}
            </span>
          </div>

          <button (click)="markAsReadAndNext()" class="px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl active:scale-95"
                  [ngClass]="{
                    'bg-indigo-600 text-white hover:bg-indigo-700': currentAnnouncement()?.format === 'Glassmorphism' || !currentAnnouncement()?.format,
                    'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md w-full': currentAnnouncement()?.format === 'Story'
                  }">
            Okudum, Kapat
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Bildirim (Sağ alt köşe formatı) -->
    <div *ngIf="currentAnnouncement() && isToastFormat()" 
         class="fixed bottom-6 right-6 z-[9999] bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-gray-100 p-5 max-w-sm w-full animate-[slideUp_0.4s_ease-out]">
      <div class="flex justify-between items-start mb-3">
        <h4 class="font-bold text-gray-800 text-sm pr-4">{{ currentAnnouncement()?.title }}</h4>
        <div class="flex items-center gap-2 shrink-0">
          <!-- Toast Countdown -->
          <span *ngIf="!isPreviewMode && countdownSeconds() !== null"
                class="text-xs font-bold text-indigo-500 tabular-nums">
            {{ formatCountdown(countdownSeconds()!) }}
          </span>
          <button (click)="markAsReadAndNext()" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
      <div class="text-sm text-gray-600 line-clamp-3 prose" [innerHTML]="currentAnnouncement()?.content"></div>
      
      <!-- Toast Progress Bar -->
      <div *ngIf="!isPreviewMode && countdownSeconds() !== null && countdownTotal() > 0"
           class="mt-3 h-1 rounded-full bg-indigo-100 overflow-hidden">
        <div class="h-full rounded-full bg-indigo-500 transition-all duration-1000 ease-linear"
             [style.width.%]="(countdownSeconds()! / countdownTotal()) * 100">
        </div>
      </div>

      <div class="mt-4 flex justify-end">
         <button (click)="markAsReadAndNext()" class="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-md text-xs font-bold hover:bg-indigo-100 transition-colors">
           Kapat
         </button>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .prose img,
    :host ::ng-deep .prose video {
      display: block;
      margin-left: auto;
      margin-right: auto;
      max-width: 100%;
      border-radius: 12px;
    }
  `]
})
export class GlobalAnnouncementViewerComponent implements OnInit, OnDestroy {
  private announcementService = inject(AnnouncementService);
  private router = inject(Router);
  private sub = new Subscription();

  queue = signal<any[]>([]);
  currentAnnouncement = signal<any | null>(null);
  isPreviewMode = false;

  // Countdown state
  countdownSeconds = signal<number | null>(null);
  countdownTotal = signal<number>(0);
  private countdownTimerId: any = null;

  ngOnInit() {
    // İlk açılışta veriyi çek (Login sonrası Token & Auth işleminin oturması için ufak bir gecikme)
    setTimeout(() => {
      this.fetchUnreadAnnouncements();
    }, 500);

    // Önizleme event'ini dinle
    this.sub.add(
      this.announcementService.previewAnnouncement$.subscribe(data => {
        this.isPreviewMode = true;
        this.stopCountdown();
        this.currentAnnouncement.set(data);
      })
    );

    // Sayfa değiştirildiğinde anlık olarak kontrol et
    this.sub.add(
      this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.fetchUnreadAnnouncements();
      })
    );

    // SignalR WebSocket üzerinden gelen 'Yeni Duyuru Yayınlandı' tetikleyicisi
    this.sub.add(
      this.announcementService.newAnnouncement$.subscribe(() => {
        this.fetchUnreadAnnouncements();
      })
    );
  }

  async fetchUnreadAnnouncements() {
    // Eğer önizleme modundaysa arkaplanda veri çekme
    if (this.isPreviewMode) return;

    try {
      const data = await this.announcementService.getUnreadAnnouncements();
      if (data && data.length > 0) {
        
        // Sadece kuyrukta olmayan YENİ duyuruları ekle
        const currentQueue = this.queue();
        const currentActive = this.currentAnnouncement();
        
        // Zaten bu oturumda (session) kapatılmış (okundu denmiş) duyuruları filtrele
        const dismissedStr = sessionStorage.getItem('dismissed_announcements');
        const dismissed = dismissedStr ? JSON.parse(dismissedStr) : [];
        
        const newItems = data.filter((d: any) => {
          // Sıklıklı mod (Once + süre tanımlı) → dismissed kontrolü atla, süre zaten backend'de hesaplanıyor
          const isSiklikli = d.frequency === 'Once' && d.onceDurationMinutes > 0;
          const dismissedOk = isSiklikli || !dismissed.includes(d.id);
          return dismissedOk &&
            !currentQueue.find((x: any) => x.id === d.id) &&
            (!currentActive || currentActive.id !== d.id);
        });

        if (newItems.length > 0) {
          this.queue.update(q => [...q, ...newItems]);
          
          // Eğer ekranda aktif popup yoksa hemen göster
          if (!this.currentAnnouncement()) {
            this.processQueue();
          }
        }
      }
    } catch(err) {
      console.error('Okunmamış duyurular çekilemedi:', err);
    }
  }

  processQueue() {
    const q = this.queue();
    if (q.length > 0) {
      this.isPreviewMode = false;
      this.currentAnnouncement.set(q[0]);
      this.startCountdownIfNeeded(q[0]);
    } else {
      this.currentAnnouncement.set(null);
      this.stopCountdown();
    }
  }

  /** Once sıklığında ve onceDurationMinutes tanımlanmışsa geri sayım başlat */
  private startCountdownIfNeeded(announcement: any) {
    this.stopCountdown();

    const dakika = announcement?.onceDurationMinutes;
    if (announcement?.frequency !== 'Once' || !dakika || dakika <= 0) {
      this.countdownSeconds.set(null);
      this.countdownTotal.set(0);
      return;
    }

    const toplamSaniye = dakika * 60;
    this.countdownSeconds.set(toplamSaniye);
    this.countdownTotal.set(toplamSaniye);

    this.countdownTimerId = setInterval(() => {
      const kalan = this.countdownSeconds();
      if (kalan === null || kalan <= 1) {
        this.stopCountdown();
        this.markAsReadAndNext();
      } else {
        this.countdownSeconds.set(kalan - 1);
      }
    }, 1000);
  }

  private stopCountdown() {
    if (this.countdownTimerId) {
      clearInterval(this.countdownTimerId);
      this.countdownTimerId = null;
    }
    this.countdownSeconds.set(null);
    this.countdownTotal.set(0);
  }

  /** Saniyeyi "2:30" veya "1:05:00" formatına çevir */
  formatCountdown(saniye: number): string {
    if (saniye <= 0) return '0:00';
    const sa = Math.floor(saniye / 3600);
    const dk = Math.floor((saniye % 3600) / 60);
    const sn = saniye % 60;
    if (sa > 0) {
      return `${sa}:${dk.toString().padStart(2, '0')}:${sn.toString().padStart(2, '0')}`;
    }
    return `${dk}:${sn.toString().padStart(2, '0')}`;
  }

  async markAsReadAndNext() {
    const current = this.currentAnnouncement();
    this.stopCountdown();
    
    // Eğer önizleme modundaysa DB'ye yazma, direkt kapat
    if (this.isPreviewMode) {
      this.currentAnnouncement.set(null);
      this.isPreviewMode = false;
      // Kuyruğa geri dön (varsa)
      this.processQueue();
      return;
    }

    if (current && current.id) {
      try {
        await this.announcementService.markAsRead(current.id);

        // Sıklıklı duyuruları (Once + süre tanımlı) session'a EKLEME!
        // Süre dolunca backend tekrar göndereceği için dismiss edilmemeli.
        const isSiklikli = current.frequency === 'Once' && current.onceDurationMinutes > 0;
        if (!isSiklikli) {
          // Sadece klasik Once ve Always modlarında oturumda engelle
          const dismissedStr = sessionStorage.getItem('dismissed_announcements');
          const dismissed: number[] = dismissedStr ? JSON.parse(dismissedStr) : [];
          if (!dismissed.includes(current.id)) {
            dismissed.push(current.id);
            sessionStorage.setItem('dismissed_announcements', JSON.stringify(dismissed));
          }
        }
      } catch(e) {
         console.error('Okundu işaretlenirken hata:', e);
      }
      
      // İlk elemanı çıkar (Kuyruğu ilerlet)
      this.queue.update(q => q.slice(1));
      this.processQueue(); // sıradakini göster
    }
  }

  isToastFormat(): boolean {
    const format = this.currentAnnouncement()?.format;
    return format === 'Toast';
  }

  ngOnDestroy() {
    this.stopCountdown();
    this.sub.unsubscribe();
  }
}
