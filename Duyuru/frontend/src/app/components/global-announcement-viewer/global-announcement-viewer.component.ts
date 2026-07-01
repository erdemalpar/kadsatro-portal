import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnnouncementService } from '../../services/announcement.service';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

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
           [ngClass]="getOuterContainerClass()">
        
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
                '!text-gray-800': currentAnnouncement()?.format === 'Glassmorphism' || !currentAnnouncement()?.format,
                '!text-white drop-shadow-md': currentAnnouncement()?.format === 'Story'
              }">
            <svg *ngIf="currentAnnouncement()?.format !== 'Story'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
            </svg>
            {{ isPreviewMode ? 'Duyuru Önizlemesi' : 'Yeni Duyuru' }}
          </h3>
          <div class="flex items-center gap-3">
            <!-- Kapat butonu ve icon container -->
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
        <div class="flex-1 min-h-0 overflow-y-scroll overflow-x-hidden p-6 lg:p-10 custom-scrollbar flex flex-col"
             [ngClass]="{
               'py-24 text-center items-center': currentAnnouncement()?.format === 'Cinematic'
             }">
           
           <div [ngClass]="getContainerClass()"
                class="relative w-full z-10 transition-all duration-500 overflow-hidden shrink-0">
              <!-- Etiket -->
              <span *ngIf="currentAnnouncement()?.format !== 'Story'" class="inline-block px-3 py-1 text-xs font-bold rounded-full mb-6"
                    [ngClass]="getLabelClass()">
                {{ currentAnnouncement()?.format }}
              </span>

              <!-- Başlık -->
              <h1 class="font-extrabold mb-8"
                  [ngClass]="getHeadingClass()">
                {{ currentAnnouncement()?.title }}
              </h1>
              
              <!-- HTML İçerik (Prose) -->
              <div class="prose max-w-none w-full break-words overflow-x-auto" 
                   [ngClass]="getProseClass()"
                   [innerHTML]="safeContent()"></div>
                   
              <!-- Cinematic Kapat Butonu -->
              <div *ngIf="currentAnnouncement()?.format === 'Cinematic'" class="mt-16 flex items-center gap-4">
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
          <button (click)="markAsReadAndNext()" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
      <div class="text-sm text-gray-600 line-clamp-3 prose" [innerHTML]="safeContent()"></div>
      
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
      display: inline-block !important;
      margin: 4px !important;
      max-width: 100%;
      border-radius: 12px;
      vertical-align: middle;
    }
    :host ::ng-deep .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: rgba(156, 163, 175, 0.8) transparent;
    }
    :host ::ng-deep .custom-scrollbar::-webkit-scrollbar {
      width: 8px !important;
      height: 8px !important;
      display: block !important;
      -webkit-appearance: none !important;
    }
    :host ::ng-deep .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent !important;
    }
    :host ::ng-deep .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(156, 163, 175, 0.8) !important;
      border-radius: 10px !important;
    }
    :host ::ng-deep .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(107, 114, 128, 0.9);
    }
  `]
})
export class GlobalAnnouncementViewerComponent implements OnInit, OnDestroy {
  private announcementService = inject(AnnouncementService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private sub = new Subscription();

  queue = signal<any[]>([]);
  currentAnnouncement = signal<any | null>(null);
  safeContent = computed(() => this.sanitizer.bypassSecurityTrustHtml(this.currentAnnouncement()?.content || ''));
  pollingInterval: any;
  
  isPreviewMode = false;

  ngOnInit() {
    // İlk açılışta veriyi çek (Login sonrası Token & Auth işleminin oturması için ufak bir gecikme)
    setTimeout(() => {
      this.fetchUnreadAnnouncements();
    }, 500);

    // Önizleme event'ini dinle
    this.sub.add(
      this.announcementService.previewAnnouncement$.subscribe(data => {
        this.isPreviewMode = true;
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

    // Sıklık modları için periyodik kontrol (Her 1 dakikada bir)
    this.pollingInterval = setInterval(() => {
      this.fetchUnreadAnnouncements();
    }, 60000);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
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
    } else {
      this.currentAnnouncement.set(null);
    }
  }

  async markAsReadAndNext() {
    const current = this.currentAnnouncement();
    
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

  getOuterContainerClass(): string {
    const format = this.currentAnnouncement()?.format;
    const layout = this.currentAnnouncement()?.layoutWidth || this.currentAnnouncement()?.LayoutWidth || 'Standart';

    if (format === 'Cinematic') {
      return 'animate-[fadeIn_0.5s_ease-in-out] bg-gradient-to-b from-gray-900 to-black rounded-none w-full h-full max-w-full max-h-full';
    }
    if (format === 'Story') {
      return 'animate-[fadeIn_0.3s_ease-out] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-[2.5rem] w-full max-w-md h-[85vh] border-4 border-gray-900';
    }
    
    // Glassmorphism or default
    let base = 'animate-[fadeIn_0.3s_ease-out] bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl w-full max-h-[90vh] flex flex-col ';
    if (layout === 'Geniş') return base + 'max-w-6xl';
    if (layout === 'Tam Ekran') return base + 'max-w-[95vw]';
    return base + 'max-w-4xl';
  }

  getContainerClass(): string {
    const format = this.currentAnnouncement()?.format;
    const layout = this.currentAnnouncement()?.layoutWidth || this.currentAnnouncement()?.LayoutWidth || 'Standart';

    let baseClass = 'w-full mx-auto ';
    if (format === 'Story') return baseClass + 'flex-1 flex flex-col max-w-md';

    if (format === 'Cinematic') {
       baseClass += 'flex flex-col items-center shrink-0 ';
       if (layout === 'Geniş') return baseClass + 'max-w-6xl px-8';
       if (layout === 'Tam Ekran') return baseClass + 'max-w-full px-12';
       return baseClass + 'max-w-4xl';
    }

    // Glassmorphism or default
    return baseClass;
  }

  getLabelClass(): string {
    const format = this.currentAnnouncement()?.format;
    if (format === 'Cinematic') return 'bg-white/10 !text-gray-300 border border-white/10 tracking-widest uppercase';
    return 'bg-indigo-50/80 !text-indigo-700';
  }

  getHeadingClass(): string {
    const format = this.currentAnnouncement()?.format;
    if (format === 'Cinematic') return 'text-5xl lg:text-7xl !text-white tracking-tighter drop-shadow-2xl';
    if (format === 'Story') return 'text-3xl !text-white drop-shadow-lg leading-tight mt-auto';
    return 'text-3xl lg:text-4xl !text-gray-900';
  }

  getProseClass(): string {
    const format = this.currentAnnouncement()?.format;
    if (format === 'Cinematic') return 'prose-invert prose-xl text-left prose-img:rounded-3xl prose-img:shadow-[0_20px_50px_rgba(0,0,0,0.5)] prose-img:m-1 [&_*]:!text-gray-100 [&_h1]:!text-white [&_h2]:!text-white [&_h3]:!text-white [&_h4]:!text-white [&_a]:!text-blue-400 [&_video]:!rounded-3xl [&_video]:!shadow-[0_20px_50px_rgba(0,0,0,0.5)] [&_video]:!m-1';
    if (format === 'Story') return 'prose-invert prose-p:!text-white/90 prose-headings:!text-white prose-img:rounded-xl prose-a:!text-white';
    return 'prose-indigo prose-img:rounded-xl prose-img:shadow-md prose-p:!text-gray-800 prose-headings:!text-gray-900';
  }

}
