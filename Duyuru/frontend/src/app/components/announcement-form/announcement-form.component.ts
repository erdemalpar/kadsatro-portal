import { Component, inject, effect, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnnouncementService } from '../../services/announcement.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { QuillModule } from 'ngx-quill';
import * as QuillNamespace from 'quill';

const Quill: any = (QuillNamespace as any).default || QuillNamespace;
(window as any).Quill = Quill;

const BlockEmbed = Quill.import('blots/block/embed');

class CustomVideoBlot extends BlockEmbed {
  static create(value: any) {
    const node = super.create();
    node.setAttribute('controls', 'true');
    node.setAttribute('contenteditable', 'false');
    node.setAttribute('style', 'max-width: 100%; border-radius: 8px; margin: 4px; display: inline-block;');
    node.setAttribute('src', value);
    return node;
  }
  static value(node: any) {
    return node.getAttribute('src');
  }

  static formats(node: any) {
    let format: any = {};
    if (node.hasAttribute('style')) {
      format.style = node.getAttribute('style');
    }
    if (node.hasAttribute('width')) {
      format.width = node.getAttribute('width');
    }
    if (node.hasAttribute('height')) {
      format.height = node.getAttribute('height');
    }
    return format;
  }

  format(name: string, value: any) {
    if (name === 'style' || name === 'width' || name === 'height') {
      if (value) {
        (this as any).domNode.setAttribute(name, value);
      } else {
        (this as any).domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}
(CustomVideoBlot as any)['blotName'] = 'nativeVideo';
(CustomVideoBlot as any)['tagName'] = 'video';
Quill.register(CustomVideoBlot, true);

// @ts-ignore
import BlotFormatter, { ImageSpec, IframeVideoSpec, UnclickableBlotSpec, Action, AlignAction, ResizeAction, DeleteAction } from '@enzedonline/quill-blot-formatter2';

class CustomSizeAction extends Action {
  button: HTMLElement | null = null;

  override onCreate = () => {
    this.button = document.createElement('div');
    this.button.classList.add('blot-formatter__toolbar-button');
    // Simple SVG icon for resizing (ruler or expand)
    this.button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" style="margin:auto"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>';
    this.button.title = "Elle Boyutlandır (px veya %)";
    this.button.style.display = 'inline-flex';
    this.button.style.alignItems = 'center';
    this.button.style.justifyContent = 'center';
    this.button.style.width = '24px';
    this.button.style.height = '24px';
    this.button.style.cursor = 'pointer';

    this.button.onclick = (e) => {
      e.preventDefault();
      // @ts-ignore
      const spec = this.formatter.currentSpec;
      if (!spec) return;
      const el = spec.getTargetElement();
      if (!el) return;

      const currentWidth = el.style.width || el.getAttribute('width') || '';
      const w = prompt('Genişlik giriniz (Örn: 500px, 100%, 20rem):', currentWidth);
      if (w !== null) {
        el.style.width = w;
        el.removeAttribute('width');
      }

      const currentHeight = el.style.height || el.getAttribute('height') || '';
      const h = prompt('Yükseklik giriniz (Örn: auto, 300px):', currentHeight);
      if (h !== null) {
        el.style.height = h;
        el.removeAttribute('height');
      }

      // @ts-ignore
      this.formatter.update();
    };

    setTimeout(() => {
      // @ts-ignore
      const toolbar = this.formatter.overlay?.querySelector('.blot-formatter__toolbar');
      if (toolbar && this.button) {
        toolbar.appendChild(this.button);
      }
    }, 0);
  };

  override onDestroy = () => {
    if (this.button && this.button.parentNode) {
      this.button.parentNode.removeChild(this.button);
    }
    this.button = null;
  };

  override onUpdate = () => {};
}

class CustomImageSpec extends ImageSpec {
    override getActions = () => [new AlignAction(this.formatter), new ResizeAction(this.formatter), new DeleteAction(this.formatter), new CustomSizeAction(this.formatter)];
}
class CustomIframeVideoSpec extends IframeVideoSpec {
    override getActions = () => [new AlignAction(this.formatter), new ResizeAction(this.formatter), new DeleteAction(this.formatter), new CustomSizeAction(this.formatter)];
}

class NativeVideoSpec extends UnclickableBlotSpec {
    constructor(formatter: any) {
        super(formatter);
        this.selector = 'video';
    }
}

class CustomNativeVideoSpec extends NativeVideoSpec {
    override getActions = () => [new AlignAction(this.formatter), new ResizeAction(this.formatter), new DeleteAction(this.formatter), new CustomSizeAction(this.formatter)];
}

Quill.register('modules/blotFormatter', BlotFormatter);

const Font = Quill.import('formats/font');
Font.whitelist = [
  'arial', 'verdana', 'tahoma', 'trebuchet-ms', 'segoe-ui', 'century-gothic', 'franklin-gothic',
  'cambria', 'garamond', 'georgia', 'book-antiqua', 'palatino-linotype', 'baskerville-old-face',
  'courier-new', 'consolas', 'lucida-console',
  'comic-sans-ms', 'impact', 'brush-script-mt', 'papyrus', 'jokerman', 'edwardian-script-itc'
];
Quill.register(Font, true);


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
              <optgroup label="Tırnaksız (Sans-Serif)">
                <option value="Arial, Helvetica, sans-serif">Arial</option>
                <option value="Verdana, Geneva, sans-serif">Verdana</option>
                <option value="Tahoma, Geneva, sans-serif">Tahoma</option>
                <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                <option value="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">Segoe UI</option>
                <option value="'Century Gothic', sans-serif">Century Gothic</option>
                <option value="'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif">Franklin Gothic Medium</option>
              </optgroup>
              <optgroup label="Tırnaklı (Serif)">
                <option value="Cambria, Cochin, Georgia, Times, 'Times New Roman', serif">Cambria</option>
                <option value="Garamond, serif">Garamond</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Book Antiqua', serif">Book Antiqua</option>
                <option value="'Palatino Linotype', 'Book Antiqua', Palatino, serif">Palatino Linotype</option>
                <option value="'Baskerville Old Face', serif">Baskerville Old Face</option>
              </optgroup>
              <optgroup label="Eşit Aralıklı (Monospace)">
                <option value="'Courier New', Courier, monospace">Courier New</option>
                <option value="Consolas, monospace">Consolas</option>
                <option value="'Lucida Console', Monaco, monospace">Lucida Console</option>
              </optgroup>
              <optgroup label="Dekoratif (Script/Display)">
                <option value="'Comic Sans MS', cursive, sans-serif">Comic Sans MS</option>
                <option value="Impact, Charcoal, sans-serif">Impact</option>
                <option value="'Brush Script MT', cursive">Brush Script MT</option>
                <option value="Papyrus, fantasy">Papyrus</option>
                <option value="Jokerman, fantasy">Jokerman</option>
                <option value="'Edwardian Script ITC', cursive">Edwardian Script ITC</option>
              </optgroup>
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
            <input type="datetime-local" [(ngModel)]="endDate"
                   [min]="startDate || ''"
                   class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors"
                   [ngClass]="tarihHatasiVarMi ? 'border-red-400 focus:ring-red-400 bg-red-50' : 'border-gray-200 focus:ring-[var(--brand-color)]'">
            <p *ngIf="tarihHatasiVarMi" class="mt-1 text-xs text-red-600 font-semibold flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Bitiş tarihi başlangıçtan önce olamaz
            </p>
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

        <!-- Görsel Tasarım & Medya -->
        <div class="p-4 rounded-xl border border-pink-200 bg-pink-50/60 animate-[fadeIn_0.2s_ease-out]">
          <label class="flex text-xs font-bold text-gray-800 mb-3 items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
            Görsel Tasarım & Medya
          </label>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Arka Plan Rengi</label>
              <input type="color" [(ngModel)]="backgroundColor" class="w-full h-9 rounded cursor-pointer border border-gray-200 bg-white p-0.5">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Arka Plan Resmi</label>
              <div class="flex gap-2 h-9">
                <input type="text" [(ngModel)]="backgroundImageUrl" placeholder="URL veya Yükle" class="flex-1 w-full border border-gray-200 rounded-lg px-2 text-xs focus:ring-1 focus:ring-pink-400">
                <button (click)="triggerFileInput(fileInput, 'bg_image')" class="shrink-0 bg-white hover:bg-gray-50 text-gray-700 px-3 rounded-lg border border-gray-200 transition-colors shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Üst Medya (Kapak)</label>
              <div class="flex gap-2 h-9">
                <input type="text" [(ngModel)]="headerMediaUrl" placeholder="URL veya Yükle" class="flex-1 w-full border border-gray-200 rounded-lg px-2 text-xs focus:ring-1 focus:ring-pink-400">
                <button (click)="triggerFileInput(fileInput, 'header_media')" class="shrink-0 bg-white hover:bg-gray-50 text-gray-700 px-3 rounded-lg border border-gray-200 transition-colors shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
              </div>
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

    /* Quill Toolbars & Editor Fonts */
    :host ::ng-deep .ql-font-arial { font-family: 'Arial', sans-serif; }
    :host ::ng-deep .ql-font-verdana { font-family: 'Verdana', sans-serif; }
    :host ::ng-deep .ql-font-tahoma { font-family: 'Tahoma', sans-serif; }
    :host ::ng-deep .ql-font-trebuchet-ms { font-family: 'Trebuchet MS', sans-serif; }
    :host ::ng-deep .ql-font-segoe-ui { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    :host ::ng-deep .ql-font-century-gothic { font-family: 'Century Gothic', sans-serif; }
    :host ::ng-deep .ql-font-franklin-gothic { font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif; }

    :host ::ng-deep .ql-font-cambria { font-family: 'Cambria', Cochin, Georgia, Times, 'Times New Roman', serif; }
    :host ::ng-deep .ql-font-garamond { font-family: 'Garamond', serif; }
    :host ::ng-deep .ql-font-georgia { font-family: 'Georgia', serif; }
    :host ::ng-deep .ql-font-book-antiqua { font-family: 'Book Antiqua', serif; }
    :host ::ng-deep .ql-font-palatino-linotype { font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif; }
    :host ::ng-deep .ql-font-baskerville-old-face { font-family: 'Baskerville Old Face', serif; }

    :host ::ng-deep .ql-font-courier-new { font-family: 'Courier New', Courier, monospace; }
    :host ::ng-deep .ql-font-consolas { font-family: 'Consolas', monospace; }
    :host ::ng-deep .ql-font-lucida-console { font-family: 'Lucida Console', Monaco, monospace; }

    :host ::ng-deep .ql-font-comic-sans-ms { font-family: 'Comic Sans MS', cursive, sans-serif; }
    :host ::ng-deep .ql-font-impact { font-family: 'Impact', Charcoal, sans-serif; }
    :host ::ng-deep .ql-font-brush-script-mt { font-family: 'Brush Script MT', cursive; }
    :host ::ng-deep .ql-font-papyrus { font-family: 'Papyrus', fantasy; }
    :host ::ng-deep .ql-font-jokerman { font-family: 'Jokerman', fantasy; }
    :host ::ng-deep .ql-font-edwardian-script-itc { font-family: 'Edwardian Script ITC', cursive; }

    /* Dropdown İsimleri */
    :host ::ng-deep .ql-picker.ql-font .ql-picker-label[data-value="arial"]::before, :host ::ng-deep .ql-picker.ql-font .ql-picker-item[data-value="arial"]::before { content: 'Arial'; font-family: 'Arial', sans-serif; }
    :host ::ng-deep .ql-picker.ql-font .ql-picker-label[data-value="verdana"]::before, :host ::ng-deep .ql-picker.ql-font .ql-picker-item[data-value="verdana"]::before { content: 'Verdana'; font-family: 'Verdana', sans-serif; }
    :host ::ng-deep .ql-picker.ql-font .ql-picker-label[data-value="tahoma"]::before, :host ::ng-deep .ql-picker.ql-font .ql-picker-item[data-value="tahoma"]::before { content: 'Tahoma'; font-family: 'Tahoma', sans-serif; }
    :host ::ng-deep .ql-picker.ql-font .ql-picker-label[data-value="trebuchet-ms"]::before, :host ::ng-deep .ql-picker.ql-font .ql-picker-item[data-value="trebuchet-ms"]::before { content: 'Trebuchet MS'; font-family: 'Trebuchet MS', sans-serif; }
    :host ::ng-deep .ql-picker.ql-font .ql-picker-label[data-value="segoe-ui"]::before, :host ::ng-deep .ql-picker.ql-font .ql-picker-item[data-value="segoe-ui"]::before { content: 'Segoe UI'; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    :host ::ng-deep .ql-picker.ql-font .ql-picker-label[data-value="century-gothic"]::before, :host ::ng-deep .ql-picker.ql-font .ql-picker-item[data-value="century-gothic"]::before { content: 'Century Gothic'; font-family: 'Century Gothic', sans-serif; }
    :host ::ng-deep .ql-picker.ql-font .ql-picker-label[data-value="franklin-gothic"]::before, :host ::ng-deep .ql-picker.ql-font .ql-picker-item[data-value="franklin-gothic"]::before { content: 'Franklin Gothic'; font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif; }

    :host ::ng-deep .ql-picker.ql-font .ql-picker-label[data-value="cambria"]::before, :host ::ng-deep .ql-picker.ql-font .ql-picker-item[data-value="cambria"]::before { content: 'Cambria'; font-family: 'Cambria', Cochin, Georgia, Times, 'Times New Roman', serif; }
    :host ::ng-deep .ql-picker.ql-font .ql-picker-label[data-value="garamond"]::before, :host ::ng-deep .ql-picker.ql-font .ql-picker-item[data-value="garamond"]::before { content: 'Garamond'; font-family: 'Garamond', serif; }
    :host ::ng-deep .ql-picker.ql-font .ql-picker-label[data-value="georgia"]::before, :host ::ng-deep .ql-picker.ql-font .ql-picker-item[data-value="georgia"]::before { content: 'Georgia'; font-family: 'Georgia', serif; }
    :host ::ng-deep .ql-picker.ql-font .ql-picker-label[data-value="book-antiqua"]::before, :host ::ng-deep .ql-picker.ql-font .ql-picker-item[data-value="book-antiqua"]::before { content: 'Book Antiqua'; font-family: 'Book Antiqua', serif; }
    :host ::ng-deep .ql-picker.ql-font .ql-picker-label[data-value="palatino-linotype"]::before, :host ::ng-deep .ql-picker.ql-font .ql-picker-item[data-value="palatino-linotype"]::before { content: 'Palatino'; font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif; }
    :host ::ng-deep .ql-picker.ql-font .ql-picker-label[data-value="baskerville-old-face"]::before, :host ::ng-deep .ql-picker.ql-font .ql-picker-item[data-value="baskerville-old-face"]::before { content: 'Baskerville'; font-family: 'Baskerville Old Face', serif; }

    :host ::ng-deep .ql-picker.ql-font .ql-picker-label[data-value="courier-new"]::before, :host ::ng-deep .ql-picker.ql-font .ql-picker-item[data-value="courier-new"]::before { content: 'Courier New'; font-family: 'Courier New', Courier, monospace; }
    :host ::ng-deep .ql-picker.ql-font .ql-picker-label[data-value="consolas"]::before, :host ::ng-deep .ql-picker.ql-font .ql-picker-item[data-value="consolas"]::before { content: 'Consolas'; font-family: 'Consolas', monospace; }
    :host ::ng-deep .ql-picker.ql-font .ql-picker-label[data-value="lucida-console"]::before, :host ::ng-deep .ql-picker.ql-font .ql-picker-item[data-value="lucida-console"]::before { content: 'Lucida Console'; font-family: 'Lucida Console', Monaco, monospace; }

    :host ::ng-deep .ql-picker.ql-font .ql-picker-label[data-value="comic-sans-ms"]::before, :host ::ng-deep .ql-picker.ql-font .ql-picker-item[data-value="comic-sans-ms"]::before { content: 'Comic Sans MS'; font-family: 'Comic Sans MS', cursive, sans-serif; }
    :host ::ng-deep .ql-picker.ql-font .ql-picker-label[data-value="impact"]::before, :host ::ng-deep .ql-picker.ql-font .ql-picker-item[data-value="impact"]::before { content: 'Impact'; font-family: 'Impact', Charcoal, sans-serif; }
    :host ::ng-deep .ql-picker.ql-font .ql-picker-label[data-value="brush-script-mt"]::before, :host ::ng-deep .ql-picker.ql-font .ql-picker-item[data-value="brush-script-mt"]::before { content: 'Brush Script'; font-family: 'Brush Script MT', cursive; }
    :host ::ng-deep .ql-picker.ql-font .ql-picker-label[data-value="papyrus"]::before, :host ::ng-deep .ql-picker.ql-font .ql-picker-item[data-value="papyrus"]::before { content: 'Papyrus'; font-family: 'Papyrus', fantasy; }
    :host ::ng-deep .ql-picker.ql-font .ql-picker-label[data-value="jokerman"]::before, :host ::ng-deep .ql-picker.ql-font .ql-picker-item[data-value="jokerman"]::before { content: 'Jokerman'; font-family: 'Jokerman', fantasy; }
    :host ::ng-deep .ql-picker.ql-font .ql-picker-label[data-value="edwardian-script-itc"]::before, :host ::ng-deep .ql-picker.ql-font .ql-picker-item[data-value="edwardian-script-itc"]::before { content: 'Edwardian'; font-family: 'Edwardian Script ITC', cursive; }
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

  /** Bitiş tarihi başlangıç tarihinden önce mi? */
  get tarihHatasiVarMi(): boolean {
    if (!this.startDate || !this.endDate) return false;
    return new Date(this.endDate) < new Date(this.startDate);
  }
  onceDurationMinutes: number | null = null;
  layoutWidth: string = 'Standart';

  titleFontFamily = 'Inter';
  titleFontSize = '1.5rem';
  titleIsBold = true;
  titleColor = '#1f2937';
  repeatInterval = 'None';
  headerMediaUrl: string | null = null;
  backgroundColor: string | null = null;
  backgroundImageUrl: string | null = null;

  editId: number | null = null;
  isUploading = false;
  currentUploadType: 'image' | 'video' | 'bg_image' | 'header_media' = 'image';

  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'font': Font.whitelist }, { 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }, { 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image', 'video'],
      ['clean']
    ],
    blotFormatter: {
      specs: [
        CustomImageSpec,
        CustomIframeVideoSpec,
        CustomNativeVideoSpec
      ]
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
    this.headerMediaUrl = null;
    this.backgroundColor = null;
    this.backgroundImageUrl = null;
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
        titleColor: this.titleColor,
        headerMediaUrl: this.headerMediaUrl,
        backgroundColor: this.backgroundColor,
        backgroundImageUrl: this.backgroundImageUrl
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
    this.headerMediaUrl = ann.headerMediaUrl || ann.HeaderMediaUrl || null;
    this.backgroundColor = ann.backgroundColor || ann.BackgroundColor || null;
    this.backgroundImageUrl = ann.backgroundImageUrl || ann.BackgroundImageUrl || null;
  }

  triggerFileInput(fileInput: HTMLInputElement, type: 'image' | 'video' | 'bg_image' | 'header_media') {
    this.currentUploadType = type;
    if (type === 'image' || type === 'bg_image') {
      fileInput.accept = 'image/*';
    } else if (type === 'video') {
      fileInput.accept = 'video/*';
    } else {
      fileInput.accept = 'image/*,video/*';
    }
    fileInput.click();
  }

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    this.isUploading = true;
    const url = await this.announcementService.uploadMedia(file);
    this.isUploading = false;

    if (url) {
      if (this.currentUploadType === 'bg_image') {
        this.backgroundImageUrl = url;
      } else if (this.currentUploadType === 'header_media') {
        this.headerMediaUrl = url;
      } else if (this.currentUploadType === 'image') {
        this.content += `<p><img src="${url}" style="border-radius: 8px; max-width: 100%;"></p>`;
      } else {
        // Quill CustomVideoBlot ile eşleşebilmesi için video tag'ını veriyoruz.
        this.content += `<p><video src="${url}"></video></p>`;
      }
    } else {
      this.alertService.error("Dosya yüklenemedi!");
    }
  }

  async submit() {
    if (!this.title || !this.content) return;
    if (this.tarihHatasiVarMi) {
      this.alertService.error('Bitiş tarihi, başlangıç tarihinden önce olamaz!');
      return;
    }

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
      repeatInterval: this.repeatInterval,
      headerMediaUrl: this.headerMediaUrl,
      backgroundColor: this.backgroundColor,
      backgroundImageUrl: this.backgroundImageUrl
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
