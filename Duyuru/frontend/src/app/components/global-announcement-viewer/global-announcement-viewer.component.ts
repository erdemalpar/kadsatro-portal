import { Component, OnInit, OnDestroy, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
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
      <div class="relative overflow-visible shadow-2xl flex flex-col"
           [ngClass]="getOuterContainerClass()"
           [ngStyle]="bgStyle()">
        
        <!-- iPhone Notch / Dynamic Island -->
        <div *ngIf="currentAnnouncement()?.format === 'Story'" class="absolute top-0 inset-x-0 flex justify-center z-50 pt-3">
          <div class="w-32 h-7 bg-black rounded-full shadow-[inset_0_0_4px_rgba(255,255,255,0.2)]"></div>
        </div>
        <!-- iPhone Donanım Tuşları -->
        <div *ngIf="currentAnnouncement()?.format === 'Story'" class="absolute -left-[4px] top-24 w-[4px] h-8 bg-gray-700 rounded-l-md"></div>
        <div *ngIf="currentAnnouncement()?.format === 'Story'" class="absolute -left-[4px] top-36 w-[4px] h-12 bg-gray-700 rounded-l-md"></div>
        <div *ngIf="currentAnnouncement()?.format === 'Story'" class="absolute -left-[4px] top-52 w-[4px] h-12 bg-gray-700 rounded-l-md"></div>
        <div *ngIf="currentAnnouncement()?.format === 'Story'" class="absolute -right-[4px] top-40 w-[4px] h-16 bg-gray-700 rounded-r-md"></div>
        
        <!-- Cinematic Modu İçin Yüzer (Floating) Kapat Butonu -->
        <button *ngIf="currentAnnouncement()?.format === 'Cinematic'" (click)="markAsReadAndNext()" 
                class="absolute top-8 right-8 z-50 text-gray-500 hover:text-white bg-white/5 hover:bg-white/20 p-3 rounded-full backdrop-blur-md transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Header Kısmı (Cinematic Hariç) -->
        <div *ngIf="currentAnnouncement()?.format !== 'Cinematic'" class="px-6 py-4 flex justify-between items-center shrink-0 z-40 relative"
             [ngClass]="{
               'border-b border-gray-200/50': currentAnnouncement()?.format === 'Glassmorphism' || !currentAnnouncement()?.format,
               'border-none pt-10': currentAnnouncement()?.format === 'Story'
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
        <div #icerikAlani class="flex-1 min-h-0 overflow-y-scroll overflow-x-hidden p-6 lg:p-10 custom-scrollbar flex flex-col relative z-30"
             [ngClass]="{
               'text-center items-center': currentAnnouncement()?.format === 'Cinematic'
             }">
           
           <div [ngClass]="getContainerClass()"
                class="relative w-full z-10 transition-all duration-500 overflow-hidden shrink-0">
              <!-- Etiket -->
              <span *ngIf="currentAnnouncement()?.format !== 'Story'" class="inline-block px-3 py-1 text-xs font-bold rounded-full mb-6"
                    [ngClass]="getLabelClass()">
                {{ currentAnnouncement()?.format }}
              </span>

              <!-- Üst Medya (Kapak) -->
              <div *ngIf="currentAnnouncement()?.headerMediaUrl || currentAnnouncement()?.HeaderMediaUrl" class="w-full mb-6 rounded-2xl overflow-hidden shadow-md">
                <video *ngIf="isVideo(currentAnnouncement()?.headerMediaUrl || currentAnnouncement()?.HeaderMediaUrl)" 
                       [src]="safeHeaderMediaUrl()" 
                       autoplay muted loop playsinline class="w-full h-auto object-cover max-h-64"></video>
                <img *ngIf="!isVideo(currentAnnouncement()?.headerMediaUrl || currentAnnouncement()?.HeaderMediaUrl)" 
                     [src]="safeHeaderMediaUrl()" 
                     class="w-full h-auto object-cover max-h-64">
              </div>

              <!-- Başlık -->
              <h1 class="font-extrabold mb-8"
                  [ngClass]="getHeadingClass()"
                  [ngStyle]="getTitleStyles()">
                {{ currentAnnouncement()?.title }}
              </h1>
              
              <!-- HTML İçerik (Prose) -->
              <div class="prose max-w-none w-full overflow-x-hidden" 
                   [ngClass]="getProseClass()"
                   style="text-align: justify; word-break: normal; overflow-wrap: break-word; hyphens: none;"
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
        <div *ngIf="currentAnnouncement()?.format !== 'Cinematic'" class="px-6 py-4 flex justify-between items-center shrink-0 z-40 relative"
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
    /* Quill ve genel HTML editör çıktılarını korumak için */
    :host ::ng-deep .prose .ql-align-center { text-align: center; }
    :host ::ng-deep .prose .ql-align-right { text-align: right; }
    :host ::ng-deep .prose .ql-align-justify { text-align: justify; }
    
    :host ::ng-deep .prose .ql-size-small { font-size: 0.75em; }
    :host ::ng-deep .prose .ql-size-large { font-size: 1.5em; }
    :host ::ng-deep .prose .ql-size-huge { font-size: 2.5em; }
    
    :host ::ng-deep .prose .ql-font-arial { font-family: 'Arial', sans-serif; }
    :host ::ng-deep .prose .ql-font-verdana { font-family: 'Verdana', sans-serif; }
    :host ::ng-deep .prose .ql-font-tahoma { font-family: 'Tahoma', sans-serif; }
    :host ::ng-deep .prose .ql-font-trebuchet-ms { font-family: 'Trebuchet MS', sans-serif; }
    :host ::ng-deep .prose .ql-font-segoe-ui { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    :host ::ng-deep .prose .ql-font-century-gothic { font-family: 'Century Gothic', sans-serif; }
    :host ::ng-deep .prose .ql-font-franklin-gothic { font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif; }

    :host ::ng-deep .prose .ql-font-cambria { font-family: 'Cambria', Cochin, Georgia, Times, 'Times New Roman', serif; }
    :host ::ng-deep .prose .ql-font-garamond { font-family: 'Garamond', serif; }
    :host ::ng-deep .prose .ql-font-georgia { font-family: 'Georgia', serif; }
    :host ::ng-deep .prose .ql-font-book-antiqua { font-family: 'Book Antiqua', serif; }
    :host ::ng-deep .prose .ql-font-palatino-linotype { font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif; }
    :host ::ng-deep .prose .ql-font-baskerville-old-face { font-family: 'Baskerville Old Face', serif; }

    :host ::ng-deep .prose .ql-font-courier-new { font-family: 'Courier New', Courier, monospace; }
    :host ::ng-deep .prose .ql-font-consolas { font-family: 'Consolas', monospace; }
    :host ::ng-deep .prose .ql-font-lucida-console { font-family: 'Lucida Console', Monaco, monospace; }

    :host ::ng-deep .prose .ql-font-comic-sans-ms { font-family: 'Comic Sans MS', cursive, sans-serif; }
    :host ::ng-deep .prose .ql-font-impact { font-family: 'Impact', Charcoal, sans-serif; }
    :host ::ng-deep .prose .ql-font-brush-script-mt { font-family: 'Brush Script MT', cursive; }
    :host ::ng-deep .prose .ql-font-papyrus { font-family: 'Papyrus', fantasy; }
    :host ::ng-deep .prose .ql-font-jokerman { font-family: 'Jokerman', fantasy; }
    :host ::ng-deep .prose .ql-font-edwardian-script-itc { font-family: 'Edwardian Script ITC', cursive; }

    
    /* Enter (yeni satır boşluğu) sorununu çözmek için */
    :host ::ng-deep .prose p:empty::before,
    :host ::ng-deep .prose p:has(br:only-child)::before {
      content: "\\00a0"; /* Non-breaking space ile satır yüksekliğini sağla */
      display: inline-block;
    }
    :host ::ng-deep .prose,
    :host ::ng-deep .prose * {
      word-break: normal !important;
      overflow-wrap: normal !important;
      word-wrap: normal !important;
      hyphens: none !important;
    }
    :host ::ng-deep .prose p {
      min-height: 1.5em;
      margin-top: 0 !important;
      margin-bottom: 0.75em !important;
      text-align: justify;        /* Varsayılan: iki yana yaslı */
    }
    /* Quill tarafından seçilen hizalamalar üst kuralları ezer */
    :host ::ng-deep .prose .ql-align-center  { text-align: center  !important; }
    :host ::ng-deep .prose .ql-align-right   { text-align: right   !important; }
    :host ::ng-deep .prose .ql-align-justify { text-align: justify !important; }

    :host ::ng-deep .prose img,
    :host ::ng-deep .prose video {
      display: inline-block;
      margin: 4px;
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

  @ViewChild('icerikAlani') icerikAlani?: ElementRef<HTMLDivElement>;

  queue = signal<any[]>([]);
  currentAnnouncement = signal<any | null>(null);
  safeContent = computed(() => {
    let content = this.currentAnnouncement()?.content || '';
    // Editörden gelen bölünmeyen boşlukları normal boşluğa çevir
    content = content.replace(/&nbsp;/g, ' ');
    return this.sanitizer.bypassSecurityTrustHtml(content);
  });

  safeHeaderMediaUrl = computed(() => {
    const ann = this.currentAnnouncement();
    const url = ann?.headerMediaUrl || ann?.HeaderMediaUrl;
    if (!url) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  bgStyle = computed(() => {
    const ann = this.currentAnnouncement();
    if (!ann) return {};
    let style: any = {};
    if (ann.backgroundColor || ann.BackgroundColor) {
      style['background-color'] = ann.backgroundColor || ann.BackgroundColor;
    }
    if (ann.backgroundImageUrl || ann.BackgroundImageUrl) {
      style['background-image'] = `url(${ann.backgroundImageUrl || ann.BackgroundImageUrl})`;
      style['background-size'] = 'cover';
      style['background-position'] = 'center';
    }
    return style;
  });
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
        this.scrolluSifirla();
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
    } catch (err) {
      console.error('Okunmamış duyurular çekilemedi:', err);
    }
  }

  processQueue() {
    const q = this.queue();
    if (q.length > 0) {
      this.isPreviewMode = false;
      this.currentAnnouncement.set(q[0]);
      this.scrolluSifirla();
    } else {
      this.currentAnnouncement.set(null);
    }
  }

  /** Yeni duyuruya geçişte içerik alanının scroll pozisyonunu sıfırlar */
  private scrolluSifirla() {
    // DOM güncellemesinin tamamlanmasını bekleyip scroll'u sıfırla
    setTimeout(() => {
      if (this.icerikAlani?.nativeElement) {
        this.icerikAlani.nativeElement.scrollTop = 0;
      }
    }, 0);
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
      } catch (e) {
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
      const ann = this.currentAnnouncement();
      const hasBg = !!(ann?.backgroundColor || ann?.BackgroundColor || ann?.backgroundImageUrl || ann?.BackgroundImageUrl);
      const bgClass = hasBg ? 'bg-transparent' : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500';
      return `animate-[fadeIn_0.3s_ease-out] ${bgClass} rounded-[3rem] w-full max-w-md h-[85vh] border-[6px] border-black overflow-hidden ring-4 ring-gray-800`;
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
      let base = 'animate-[fadeIn_0.5s_ease-in-out] w-full flex flex-col items-center my-auto py-12 ';
      if (layout === 'Geniş') return base + 'max-w-6xl px-8';
      if (layout === 'Tam Ekran') return base + 'max-w-[95vw] px-12';
      return base + 'max-w-4xl';
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
    if (format === 'Cinematic') return 'drop-shadow-2xl';
    if (format === 'Story') return 'drop-shadow-lg leading-tight mt-auto';
    return '';
  }

  getTitleStyles(): any {
    const ann = this.currentAnnouncement();
    if (!ann) return {};
    return {
      'font-family': ann.titleFontFamily || ann.TitleFontFamily || 'inherit',
      'font-size': ann.titleFontSize || ann.TitleFontSize || 'inherit',
      'font-weight': (ann.titleIsBold ?? ann.TitleIsBold ?? true) ? 'bold' : 'normal',
      'color': ann.titleColor || ann.TitleColor || 'inherit'
    };
  }

  getProseClass(): string {
    const format = this.currentAnnouncement()?.format;
    if (format === 'Cinematic') return 'prose-invert prose-xl text-left prose-img:rounded-3xl prose-img:shadow-[0_20px_50px_rgba(0,0,0,0.5)] prose-img:m-1 [&_video]:!rounded-3xl [&_video]:!shadow-[0_20px_50px_rgba(0,0,0,0.5)] [&_video]:!m-1';
    if (format === 'Story') return 'prose-invert prose-img:rounded-xl';
    return 'prose-indigo prose-img:rounded-xl prose-img:shadow-md';
  }

  isVideo(url: string | null | undefined): boolean {
    if (!url) return false;
    const cleanUrl = url.split('?')[0].toLowerCase();
    return cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.ogg') || cleanUrl.endsWith('.mov');
  }
}
