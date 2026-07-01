import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as signalR from '@microsoft/signalr';
import { DomSanitizer } from '@angular/platform-browser';

const DUYURU_API = 'http://localhost:5005/api/announcement';
const DUYURU_HUB = 'http://localhost:5005/announcementHub';
const POLLING_MS  = 30_000;

@Component({
  selector: 'app-announcement-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- ===== MODAL ===== -->
    <div *ngIf="current() && !isToast()"
         [ngClass]="overlayClass()"
         class="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm">

      <div [ngClass]="containerClass()"
           class="relative overflow-hidden shadow-2xl flex flex-col">

        <!-- Cinematic kapatma -->
        <button *ngIf="current()?.format === 'Cinematic'" (click)="kapat()"
                class="absolute top-8 right-8 z-50 text-gray-500 hover:text-white bg-white/5 hover:bg-white/20 p-3 rounded-full backdrop-blur-md transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <!-- Header -->
        <div *ngIf="current()?.format !== 'Cinematic'"
             [ngClass]="headerClass()"
             class="px-6 py-4 flex justify-between items-center shrink-0">
          <h3 [ngClass]="baslikRenk()" class="font-bold flex items-center gap-2">
            <svg *ngIf="current()?.format !== 'Story'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
            </svg>
            Yeni Duyuru
          </h3>
          <div class="flex items-center gap-3">
            <button (click)="kapat()" [ngClass]="kapatBtnClass()" class="p-1.5 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- İçerik -->
        <div [ngClass]="icerikDivClass()"
             class="flex-1 min-h-0 overflow-y-scroll overflow-x-hidden p-6 lg:p-10 flex flex-col custom-scrollbar">
          <div [ngClass]="icerikIcClass()" class="shrink-0">
            <span *ngIf="current()?.format !== 'Story'"
                  [ngClass]="etiketClass()"
                  class="inline-block px-3 py-1 text-xs font-bold rounded-full mb-6">
              {{ current()?.format }}
            </span>
            <h1 [ngClass]="h1Class()" [ngStyle]="getTitleStyles()" class="font-extrabold mb-8">{{ current()?.title }}</h1>
            <div [ngClass]="proseClass()"
                 class="prose max-w-none w-full break-words overflow-x-auto"
                 [innerHTML]="safeContent()"></div>

            <!-- Cinematic alt -->
            <div *ngIf="current()?.format === 'Cinematic'" class="mt-16 flex flex-col items-center gap-4">
              <button (click)="kapat()"
                      class="px-12 py-4 rounded-full border border-white/20 text-white font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300">
                Kapat
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div *ngIf="current()?.format !== 'Cinematic'"
             [ngClass]="footerClass()"
             class="px-6 py-4 flex justify-between items-center shrink-0">
          <span *ngIf="kuyruk().length > 1" class="text-xs font-bold text-gray-400">
            {{ kuyruk().length - 1 }} duyuru daha var...
          </span>
          <div class="flex-1"></div>

          <button (click)="kapat()" [ngClass]="okudumClass()"
                  class="px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl active:scale-95">
            Okudum, Kapat
          </button>
        </div>
      </div>
    </div>

    <!-- ===== TOAST ===== -->
    <div *ngIf="current() && isToast()"
         class="fixed bottom-6 right-6 z-[9999] bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-gray-100 p-5 max-w-sm w-full animate-[slideUp_0.4s_ease-out]">
      <div class="flex justify-between items-start mb-3">
        <h4 class="font-bold text-gray-800 text-sm pr-4">{{ current()?.title }}</h4>
        <div class="flex items-center gap-2 shrink-0">
          <button (click)="kapat()" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="text-sm text-gray-600 line-clamp-3 prose" [innerHTML]="safeContent()"></div>
      <div class="mt-4 flex justify-end">
        <button (click)="kapat()"
                class="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-md text-xs font-bold hover:bg-indigo-100 transition-colors">
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

    /* Enter (yeni satır boşluğu) sorununu çözmek için */
    :host ::ng-deep .prose p:empty::before,
    :host ::ng-deep .prose p:has(br:only-child)::before {
      content: "\\00a0"; /* Non-breaking space ile satır yüksekliğini sağla */
      display: inline-block;
    }
    :host ::ng-deep .prose p {
      min-height: 1.5em; 
      margin-top: 0 !important;
      margin-bottom: 0.75em !important;
    }

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
export class AnnouncementPopupComponent implements OnInit, OnDestroy {
  kuyruk       = signal<any[]>([]);
  current      = signal<any | null>(null);
  private sanitizer = inject(DomSanitizer);
  safeContent = computed(() => this.sanitizer.bypassSecurityTrustHtml(this.current()?.content || ''));

  private pollingId:   any = null;
  private hub: signalR.HubConnection | null = null;

  private get userId(): number {
    const role = localStorage.getItem('dys_role') || '';
    if (role === 'Admin')     return 1;
    if (role === 'Editor')    return 2;
    if (role === 'Moderator') return 3;
    return 4;
  }

  ngOnInit() {
    this.baglanti();
    setTimeout(() => this.kontrol(), 600);
    this.pollingId = setInterval(() => this.kontrol(), POLLING_MS);
  }

  ngOnDestroy() {
    clearInterval(this.pollingId);
    this.hub?.stop();
  }

  private baglanti() {
    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(DUYURU_HUB)
      .withAutomaticReconnect()
      .build();
    this.hub.on('ReceiveNewAnnouncement', () => this.kontrol());
    this.hub.start().catch(e => console.warn('[Portal Popup] SignalR:', e));
  }

  private async kontrol() {
    try {
      const res = await fetch(`${DUYURU_API}/unread?userId=${this.userId}`);
      if (!res.ok) return;
      const liste: any[] = await res.json();

      const dismissed = this.dismissedList();
      const aktifId   = this.current()?.id;
      const kuyrukIds = this.kuyruk().map((x: any) => x.id);

      const yeniElemanlar = liste.filter((d: any) => {
        const isSiklikli = d.frequency === 'Once' && d.onceDurationMinutes > 0;
        const dismissedOk = isSiklikli || !dismissed.includes(d.id);
        return dismissedOk &&
          d.id !== aktifId &&
          !kuyrukIds.includes(d.id);
      });

      if (yeniElemanlar.length > 0) {
        this.kuyruk.update(q => [...q, ...yeniElemanlar]);
        if (!this.current()) this.siraya();
      }
    } catch { /* sessiz hata */ }
  }

  private siraya() {
    const q = this.kuyruk();
    if (q.length > 0) {
      this.current.set(q[0]);
    } else {
      this.current.set(null);
    }
  }

  async kapat() {
    const ann = this.current();
    if (ann?.id) {
      try {
        await fetch(`${DUYURU_API}/${ann.id}/read?userId=${this.userId}`, { method: 'POST' });
      } catch { /* sessiz */ }

      // Sıklıklı duyurular (Once + süre tanımlı) → session'a ekleme, süre dolunca tekrar gösterilmeli
      const isSiklikli = ann.frequency === 'Once' && ann.onceDurationMinutes > 0;
      if (!isSiklikli) {
        const d = this.dismissedList();
        if (!d.includes(ann.id)) {
          sessionStorage.setItem('dismissed_announcements', JSON.stringify([...d, ann.id]));
        }
      }
    }
    this.kuyruk.update(q => q.slice(1));
    this.siraya();
  }

  isToast(): boolean { return this.current()?.format === 'Toast'; }

  private dismissedList(): number[] {
    const raw = sessionStorage.getItem('dismissed_announcements');
    return raw ? JSON.parse(raw) : [];
  }

  // ── CSS helpers (Angular [class.x] yerine string döner) ──────────────────
  private get fmt() { return this.current()?.format; }

  overlayClass()    { return this.fmt === 'Cinematic' ? 'p-0' : 'p-4'; }

  containerClass(): string {
    const layout = this.current()?.layoutWidth || this.current()?.LayoutWidth || 'Standart';

    if (this.fmt === 'Cinematic')
      return 'animate-[fadeIn_0.5s_ease-in-out] bg-gradient-to-b from-gray-900 to-black rounded-none w-full h-full max-w-full max-h-full';
    if (this.fmt === 'Story')
      return 'animate-[fadeIn_0.3s_ease-out] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-[2.5rem] w-full max-w-md h-[85vh] border-4 border-gray-900';
    
    // Glassmorphism or default
    let base = 'animate-[fadeIn_0.3s_ease-out] bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl w-full max-h-[90vh] ';
    if (layout === 'Geniş') return base + 'max-w-6xl';
    if (layout === 'Tam Ekran') return base + 'max-w-[95vw]';
    return base + 'max-w-4xl';
  }

  headerClass(): string {
    return this.fmt === 'Story' ? 'border-none pt-6' : 'border-b border-gray-200/50';
  }

  baslikRenk(): string {
    return this.fmt === 'Story' ? '!text-white drop-shadow-md' : '!text-gray-800';
  }

  badgeClass(): string {
    return this.fmt === 'Story' ? 'bg-white/10 !text-white' : 'bg-indigo-50 !text-indigo-600';
  }

  kapatBtnClass(): string {
    return this.fmt === 'Story'
      ? 'text-white/80 hover:text-white bg-black/20 hover:bg-black/40'
      : 'text-gray-500 hover:text-red-500 hover:bg-white/50';
  }

  icerikDivClass(): string {
    return this.fmt === 'Cinematic' ? 'py-24 text-center items-center' : '';
  }

  icerikIcClass(): string {
    const layout = this.current()?.layoutWidth || this.current()?.LayoutWidth || 'Standart';
    let baseClass = 'w-full mx-auto ';
    if (this.fmt === 'Story') return baseClass + 'flex-1 flex flex-col';

    if (this.fmt === 'Cinematic') {
       baseClass += 'flex flex-col items-center shrink-0 ';
       if (layout === 'Geniş') return baseClass + 'max-w-6xl px-8';
       if (layout === 'Tam Ekran') return baseClass + 'max-w-[95vw] px-12';
       return baseClass + 'max-w-4xl';
    }

    return baseClass;
  }

  etiketClass(): string {
    if (this.fmt === 'Cinematic') return 'bg-white/10 !text-gray-300 border border-white/10 tracking-widest uppercase';
    return 'bg-indigo-50/80 !text-indigo-700';
  }

  h1Class(): string {
    if (this.fmt === 'Cinematic') return 'drop-shadow-2xl';
    if (this.fmt === 'Story')     return 'drop-shadow-lg leading-tight mt-auto';
    return '';
  }

  getTitleStyles(): any {
    const ann = this.current();
    if (!ann) return {};
    return {
      'font-family': ann.titleFontFamily || ann.TitleFontFamily || 'inherit',
      'font-size': ann.titleFontSize || ann.TitleFontSize || 'inherit',
      'font-weight': (ann.titleIsBold ?? ann.TitleIsBold ?? true) ? 'bold' : 'normal',
      'color': ann.titleColor || ann.TitleColor || 'inherit'
    };
  }

  proseClass(): string {
    if (this.fmt === 'Cinematic') return 'prose-invert prose-xl text-left';
    if (this.fmt === 'Story')     return 'prose-invert';
    return 'prose-indigo prose-img:rounded-xl prose-img:shadow-md';
  }

  footerClass(): string {
    return this.fmt === 'Story' ? 'pb-8' : 'border-t border-gray-200/50';
  }

  okudumClass(): string {
    return this.fmt === 'Story'
      ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md w-full'
      : 'bg-indigo-600 text-white hover:bg-indigo-700';
  }
}
