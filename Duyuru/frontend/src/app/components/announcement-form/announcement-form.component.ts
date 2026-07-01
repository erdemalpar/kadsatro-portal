import { Component, inject, effect, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnnouncementService } from '../../services/announcement.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { QuillModule } from 'ngx-quill';
import * as QuillNamespace from 'quill';

const Quill: any = (QuillNamespace as any).default || QuillNamespace;
const BlockEmbed = Quill.import('blots/block/embed');

class CustomVideoBlot extends BlockEmbed {
  static create(value: any) {
    const node = super.create();
    node.setAttribute('controls', 'true');
    node.setAttribute('style', 'max-width: 100%; border-radius: 8px; margin: 4px;');
    node.setAttribute('src', value);
    return node;
  }
  static value(node: any) {
    return node.getAttribute('src');
  }
}
(CustomVideoBlot as any)['blotName'] = 'nativeVideo';
(CustomVideoBlot as any)['tagName'] = 'video';
Quill.register(CustomVideoBlot, true);

// @ts-ignore
import ResizeModule from 'quill-resize-module';
Quill.register('modules/resize', ResizeModule);

@Component({
  selector: 'app-announcement-form',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule],
  template: `
    <div class="p-4 flex flex-col h-full bg-white">
      
      <div class="flex-1 space-y-5 flex flex-col">
        <!-- Başlık -->
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">Başlık</label>
          <div class="flex gap-2 mb-2 p-2 bg-gray-50 border border-gray-100 rounded-lg">
            <select [(ngModel)]="titleFontFamily" class="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400">
              <option value="Inter">Varsayılan (Inter)</option>
              <option value="'Times New Roman', Times, serif">Times New Roman</option>
              <option value="Arial, Helvetica, sans-serif">Arial</option>
              <option value="Verdana, Geneva, sans-serif">Verdana</option>
              <option value="Tahoma, Geneva, sans-serif">Tahoma</option>
              <option value="'Courier New', Courier, monospace">Courier New</option>
            </select>
            <select [(ngModel)]="titleFontSize" class="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400">
              <option value="1.5rem">Orta Boy</option>
              <option value="1.875rem">Büyük</option>
              <option value="2.25rem">Çok Büyük</option>
              <option value="3rem">Ekstra Büyük</option>
            </select>
            <button (click)="titleIsBold = !titleIsBold" [class.bg-indigo-100]="titleIsBold" [class.text-indigo-700]="titleIsBold" class="border border-gray-200 rounded px-3 py-1 font-bold text-sm text-gray-600 hover:bg-gray-100 transition-colors">B</button>
            <input type="color" [(ngModel)]="titleColor" class="w-8 h-8 rounded cursor-pointer border border-gray-200">
          </div>
          <input type="text" [(ngModel)]="title" placeholder="Örn: 2026 Tatil Günleri"
                 [ngStyle]="{'font-family': titleFontFamily, 'font-size': titleFontSize, 'font-weight': titleIsBold ? 'bold' : 'normal', 'color': titleColor}"
                 [ngClass]="(format === 'Cinematic' || format === 'Story') ? 'bg-gray-900 text-white border-gray-700' : 'bg-white border-gray-200'"
                 class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)] transition-colors duration-300">
        </div>

        <!-- Format Seçimi & Kategori Seçimi -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">Gösterim Stili</label>
            <select [(ngModel)]="format" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)]">
              <option value="Glassmorphism">Modern Cam (Glassmorphism)</option>
              <option value="Cinematic">Sinematik (Tam Ekran)</option>
              <option value="Story">Hikaye (Story)</option>
              <option value="Toast">Bildirim (Sağ Alt)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">Kategori</label>
            <select [(ngModel)]="categoryId" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)]">
              <option [value]="1">Genel Duyurular</option>
              <option [value]="2">Yazılım ve Güncellemeler</option>
              <option [value]="3">Mevzuat ve Kanun</option>
              <option [value]="4">Eğitim</option>
              <option [value]="5">Megsis</option>
              <option [value]="6">Sistemsel</option>
              <option [value]="7">Talimat</option>
              <option [value]="8">Genelge</option>
              <option [value]="9">Acil Duyuru</option>
              <option [value]="10">Sağlık</option>
            </select>
          </div>
          <div *ngIf="canSetDuration()">
            <label class="block text-xs font-bold text-gray-700 mb-1">İçerik Genişliği</label>
            <select [(ngModel)]="layoutWidth" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)]">
              <option value="Standart">Standart</option>
              <option value="Geniş">Geniş</option>
              <option value="Tam Ekran">Tam Ekran</option>
            </select>
          </div>
        </div>

        <!-- Yayın Süresi ve Gösterim Sıklığı -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">Okunma Sık.</label>
            <select [(ngModel)]="frequency" (ngModelChange)="onFrequencyChange()" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)]">
              <option value="Once">Sıklık</option>
              <option value="Daily">Günde Bir Kez</option>
              <option value="Always">Her Girişte</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">Başlangıç</label>
            <input type="datetime-local" [(ngModel)]="startDate" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)]">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">Bitiş</label>
            <input type="datetime-local" [(ngModel)]="endDate" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)]">
          </div>
        </div>

        <!-- Gelişmiş Ayarlar (Zamanlama ve Tekrar) -->
        <div *ngIf="canSetDuration()"
             class="flex items-start gap-4 p-4 rounded-xl border border-indigo-200 bg-indigo-50/60 animate-[fadeIn_0.2s_ease-out]">
          <div class="mt-0.5 shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Dakika Bazlı Sıklık -->
            <div [class.opacity-50]="frequency !== 'Once'" class="transition-opacity duration-300">
              <label class="block text-xs font-bold text-gray-800 mb-1.5">
                Dakika Bazlı Sıklık
                <span class="ml-1 font-normal text-gray-500">(opsiyonel)</span>
              </label>
              <div class="flex items-center gap-2">
                <input
                  type="number"
                  [(ngModel)]="onceDurationMinutes"
                  [disabled]="frequency !== 'Once'"
                  [min]="1"
                  [max]="1440"
                  placeholder="Örn: 1"
                  class="w-24 border border-indigo-200 rounded-lg px-3 py-2 text-sm font-semibold text-center
                         focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white
                         disabled:bg-gray-100 disabled:text-gray-400
                         [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                >
                <span class="text-sm text-gray-600 font-medium">dakika</span>
              </div>
              <p class="mt-1.5 text-[10px] text-gray-500 leading-snug">
                Okunduktan seçilen dakika sonra tekrar gösterilir. (Sadece "Sıklık" modunda çalışır).
              </p>
            </div>

            <!-- Takvimsel Tekrar (Yayın Tekrarı) -->
            <div>
              <label class="block text-xs font-bold text-gray-800 mb-1.5">
                Yayın Tekrarı (Takvimsel)
                <span class="ml-1 font-normal text-gray-500">(opsiyonel)</span>
              </label>
              <select [(ngModel)]="repeatInterval" class="w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-gray-700">
                <option value="None">Tekrar Yok</option>
                <option value="Yearly">Her Yıl (Başlangıç tarihinde)</option>
                <option value="Monthly">Her Ay (Başlangıç tarihinde)</option>
              </select>
              <p class="mt-1.5 text-[10px] text-gray-500 leading-snug">
                Örn: Sadece 29 Ekim'lerde otomatik yayınlansın istiyorsanız "Her Yıl" seçin.
              </p>
            </div>
          </div>
        </div>

        <!-- İçerik (Quill) -->
        <div class="flex-1 flex flex-col min-h-[350px]">
          <label class="block text-xs font-bold text-gray-700 mb-1">İçerik</label>
          <div class="flex-1 flex flex-col border rounded-lg overflow-hidden transition-colors duration-300"
               [ngClass]="(format === 'Cinematic' || format === 'Story') ? 'bg-gray-900 text-gray-100 border-gray-700' : 'bg-white text-gray-900 border-gray-200'">
             <quill-editor [modules]="quillConfig" [(ngModel)]="content" placeholder="Duyuru metni..." class="flex-1 flex flex-col"></quill-editor>
          </div>
        </div>

        <!-- Medya Ekle -->
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">Medya Ekle</label>
          <input type="file" #fileInput (change)="onFileSelected($event)" class="hidden" accept="image/*,video/*">
          <div class="grid grid-cols-3 gap-2">
            <button class="py-2 border border-[var(--brand-color)] bg-indigo-50 text-[var(--brand-color)] rounded-lg text-xs font-semibold flex flex-col items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
              Sadece Metin
            </button>
            <button (click)="triggerFileInput(fileInput, 'image')" class="py-2 border border-gray-200 text-gray-600 hover:border-gray-300 rounded-lg text-xs flex flex-col items-center gap-1 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Görsel Seç
            </button>
            <button (click)="triggerFileInput(fileInput, 'video')" class="py-2 border border-gray-200 text-gray-600 hover:border-gray-300 rounded-lg text-xs flex flex-col items-center gap-1 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Video Seç
            </button>
          </div>
          <div *ngIf="isUploading" class="text-xs text-[var(--brand-color)] mt-1 font-semibold animate-pulse">Medya yükleniyor, lütfen bekleyin...</div>
        </div>

      </div>

      <!-- Action Buttons -->
      <div class="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-2 pb-6 lg:pb-0 shrink-0">
        <button (click)="openPreview()" [disabled]="!title || !content" class="w-full py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 flex justify-center items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          Önizle
        </button>
        <button (click)="submit()" [disabled]="!title || !content" class="w-full py-2.5 bg-[var(--brand-color)] text-white rounded-lg text-sm font-bold hover:bg-[var(--brand-dark)] flex justify-center items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          {{ getSubmitButtonText() }}
        </button>
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    :host ::ng-deep .ql-toolbar {
      background-color: #f8fafc !important; /* Toolbar her zaman açık renk kalsın */
      border-color: #e2e8f0 !important;
    }
    :host ::ng-deep .ql-container {
      flex: 1;
      font-size: 15px;
      font-family: 'Inter', sans-serif;
      border-color: transparent !important; /* Dıştaki div'in kenarlığını kullanıyoruz */
    }
    :host ::ng-deep .ql-editor {
      min-height: 250px;
    }
    :host ::ng-deep .ql-editor img,
    :host ::ng-deep .ql-editor video {
      display: inline-block;
      margin: 4px;
      max-width: 100%;
      border-radius: 8px;
    }
  `]
})
export class AnnouncementFormComponent implements OnInit, OnDestroy {
  title = '';
  content = '';
  categoryId = 1;
  format: any = 'Glassmorphism';
  frequency: any = 'Once';
  startDate: string | null = null;
  endDate: string | null = null;
  onceDurationMinutes: number | null = null;
  layoutWidth: string = 'Standart';

  titleFontFamily = 'Inter';
  titleFontSize = '1.5rem';
  titleIsBold = true;
  titleColor = '#1f2937';
  repeatInterval = 'None';

  editId: number | null = null;
  isUploading = false;
  currentUploadType: 'image' | 'video' = 'image';

  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }, { 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image', 'video'],
      ['clean']
    ],
    resize: {
      locale: {}
    }
  };

  private announcementService = inject(AnnouncementService);
  private authService = inject(AuthService);
  private alertService = inject(AlertService);

  constructor() {
    effect(() => {
      const editItem = this.announcementService.activeEdit();
      if (editItem) {
        this.loadForEdit(editItem);
      } else {
        this.resetForm();
      }
    });
  }

  ngOnInit(): void {
    //
  }

  ngOnDestroy(): void {
    //
  }

  /** Sıklık değişince Once dışındaysa süreyi sıfırla */
  onFrequencyChange() {
    if (this.frequency !== 'Once') {
      this.onceDurationMinutes = null;
    }
  }

  /** Admin, Moderator ve Editor — sıklık zamanı ayarlayabilir */
  canSetDuration(): boolean {
    const role = this.authService.currentRole();
    return role === 'Admin' || role === 'Moderator' || role === 'Editor';
  }

  /** Dakikayı insan okuyabilir formata çevir */
  formatDuration(dakika: number): string {
    if (!dakika || dakika <= 0) return '';
    if (dakika < 60) return `${dakika} dk`;
    const saat = Math.floor(dakika / 60);
    const kalan = dakika % 60;
    return kalan > 0 ? `${saat} sa ${kalan} dk` : `${saat} saat`;
  }

  resetForm() {
    this.editId = null;
    this.title = '';
    this.content = '';
    this.categoryId = 1;
    this.format = 'Glassmorphism';
    this.frequency = 'Once';
    this.startDate = null;
    this.endDate = null;
    this.onceDurationMinutes = null;
    this.layoutWidth = 'Standart';
    this.titleFontFamily = 'Inter';
    this.titleFontSize = '1.5rem';
    this.titleIsBold = true;
    this.titleColor = '#1f2937';
    this.repeatInterval = 'None';
  }

  getSubmitButtonText(): string {
    const role = this.authService.currentRole();
    if (role === 'Editor') return 'Moderatöre Gönder';
    return 'Yayınla';
  }

  openPreview() {
    if (this.title && this.content) {
      this.announcementService.triggerPreview({
        title: this.title,
        content: this.content,
        format: this.format,
        layoutWidth: this.layoutWidth,
        titleFontFamily: this.titleFontFamily,
        titleFontSize: this.titleFontSize,
        titleIsBold: this.titleIsBold,
        titleColor: this.titleColor
      } as any);
    }
  }

  public loadForEdit(ann: any) {
    this.editId = ann.id;
    this.title = ann.title;
    this.content = ann.content;
    this.format = ann.format;
    this.categoryId = ann.categoryId || 1;
    this.frequency = ann.frequency || 'Once';
    const toLocalDatetime = (dateString: string | null) => {
      if (!dateString) return null;
      const d = new Date(dateString);
      return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    };

    this.startDate = toLocalDatetime(ann.startDate || ann.StartDate);
    this.endDate = toLocalDatetime(ann.endDate || ann.EndDate);
    this.onceDurationMinutes = ann.onceDurationMinutes ?? ann.OnceDurationMinutes ?? null;
    this.layoutWidth = ann.layoutWidth || ann.LayoutWidth || 'Standart';
    this.titleFontFamily = ann.titleFontFamily || ann.TitleFontFamily || 'Inter';
    this.titleFontSize = ann.titleFontSize || ann.TitleFontSize || '1.5rem';
    this.titleIsBold = ann.titleIsBold ?? ann.TitleIsBold ?? true;
    this.titleColor = ann.titleColor || ann.TitleColor || '#1f2937';
    this.repeatInterval = ann.repeatInterval || ann.RepeatInterval || 'None';
  }

  triggerFileInput(fileInput: HTMLInputElement, type: 'image' | 'video') {
    this.currentUploadType = type;
    fileInput.accept = type === 'image' ? 'image/*' : 'video/*';
    fileInput.click();
  }

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    this.isUploading = true;
    const url = await this.announcementService.uploadMedia(file);
    this.isUploading = false;

    if (url) {
      if (this.currentUploadType === 'image') {
        this.content += `<br><img src="${url}" style="max-width:100%; border-radius: 8px;"><br>`;
      } else {
        // Quill custom blot ile eşleşebilmesi için video tag'ını veriyoruz.
        this.content += `<br><video src="${url}"></video><br>`;
      }
    } else {
      this.alertService.error("Dosya yüklenemedi!");
    }
  }

  async submit() {
    if (!this.title || !this.content) return;

    let success = false;
    const payload = {
      title: this.title,
      content: this.content,
      format: this.format,
      categoryId: Number(this.categoryId),
      frequency: this.frequency,
      startDate: this.startDate ? new Date(this.startDate).toISOString() : null,
      endDate: this.endDate ? new Date(this.endDate).toISOString() : null,
      onceDurationMinutes: (this.frequency === 'Once' && this.canSetDuration() && this.onceDurationMinutes)
        ? Number(this.onceDurationMinutes)
        : null,
      layoutWidth: this.layoutWidth,
      titleFontFamily: this.titleFontFamily,
      titleFontSize: this.titleFontSize,
      titleIsBold: this.titleIsBold,
      titleColor: this.titleColor,
      repeatInterval: this.repeatInterval
    };

    if (this.editId) {
      success = await this.announcementService.updateAnnouncement(this.editId, payload);
    } else {
      success = await this.announcementService.createAnnouncement({
        ...payload,
        createdById: this.authService.currentUserId()
      });
    }

    if (success) {
      this.resetForm();
      this.announcementService.triggerEdit(null);
      this.announcementService.refreshArchive$.next();
      this.alertService.success(this.authService.currentRole() === 'Editor' ? 'Duyuru başarıyla onaya/güncellemeye gönderildi!' : 'Duyuru başarıyla kaydedildi!');
    } else {
      this.alertService.error('Hata oluştu!');
    }
  }
}
