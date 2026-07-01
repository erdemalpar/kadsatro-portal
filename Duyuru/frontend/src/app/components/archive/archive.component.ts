import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnnouncementService } from '../../services/announcement.service';
import { AnnouncementResponseDto } from '../../models/announcement.model';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
      <!-- Tablo Başlığı ve Arama -->
      <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-[var(--brand-alpha-light)] flex items-center justify-center text-[var(--brand-color)]">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 tracking-tight">Duyuru Yönetimi</h2>
            <p class="text-sm text-gray-500 mt-1">Süreci takip edin ve yönetin.</p>
          </div>
        </div>

        <!-- Arama Çubuğu -->
        <div class="relative max-w-sm w-full">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
          <input type="text" (input)="searchQuery = $any($event.target).value"
                 class="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-gray-50 transition-colors" 
                 placeholder="Başlık, kategori, statü ara...">
        </div>
      </div>

      <!-- Scrollable Tablo Container (Mobil Uyumluluk İçin) -->
      <div class="flex-1 overflow-x-auto overflow-y-auto">
        <table class="w-full min-w-[900px] text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50">
              <th class="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider w-32 border-b border-gray-100">Tarih</th>
              <th class="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Konu Başlığı & Statü Notları</th>
              <th class="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider w-32 border-b border-gray-100 text-center">Kategori</th>
              <th class="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider w-48 border-b border-gray-100">Statü</th>
              <th class="py-4 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 text-right" style="white-space:nowrap;">İşlem</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <!-- Boş Durum -->
            <tr *ngIf="announcements.length === 0">
              <td colspan="5" class="py-12 text-center text-gray-500 text-sm">
                Gösterilecek kayıt bulunamadı.
              </td>
            </tr>

            <!-- Satırlar -->
            <tr *ngFor="let item of filteredAnnouncements" class="hover:bg-gray-50/50 transition-colors group">
              <!-- Tarih -->
              <td class="py-4 px-6 align-top">
                <div class="text-sm font-semibold text-gray-700">{{ item.createdAt | date:'dd.MM.yyyy' }}</div>
                <div class="text-xs text-gray-400 mt-0.5">{{ item.createdAt | date:'HH:mm' }}</div>
              </td>
              
              <!-- Konu -->
              <td class="py-4 px-6 align-top">
                <div class="text-sm font-bold text-gray-900 mb-1 group-hover:text-[var(--brand-color)] transition-colors">{{ item.title }}</div>
                <div class="text-[11px] text-gray-500 mb-2">{{ item.createdByName }}</div>

                <!-- Ayar etiketleri -->
                <div class="flex flex-wrap gap-1.5 mt-1.5">
                  <!-- Format -->
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm12 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
                    </svg>
                    {{ getFormatText(item.format) }}
                  </span>

                  <!-- Sıklık -->
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                          [ngClass]="{
                            'bg-purple-50 text-purple-700 border-purple-200': item.frequency === 'Once',
                            'bg-orange-50 text-orange-700 border-orange-200': item.frequency === 'Daily',
                            'bg-teal-50 text-teal-700 border-teal-200': item.frequency === 'Always'
                          }">
                      <svg *ngIf="item.frequency === 'Once'" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      <svg *ngIf="item.frequency === 'Daily'" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <svg *ngIf="item.frequency === 'Always'" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {{ getFrequencyText(item.frequency) }} {{ item.frequency === 'Once' && (item.onceDurationMinutes || $any(item).OnceDurationMinutes) ? '(' + (item.onceDurationMinutes || $any(item).OnceDurationMinutes) + ' dk)' : '' }}
                    </span>
                  </div>


                  <!-- Yayın aralığı -->
                  <span *ngIf="item.startDate || item.endDate"
                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-600 border border-teal-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    {{ item.startDate ? (item.startDate | date:'dd.MM.yy HH:mm') : '—' }}
                    →
                    {{ item.endDate ? (item.endDate | date:'dd.MM.yy HH:mm') : '∞' }}
                  </span>
                </div>

                <!-- Ret Sebebi (Reddedildiyse) -->
                <div *ngIf="item.status === 'Rejected'" class="inline-flex mt-2 p-2 bg-red-50 border border-red-100 rounded-md text-red-600 text-[11px]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <strong>Not:</strong>&nbsp;{{ item.rejectionReason || 'Eksik bilgi nedeniyle reddedildi.' }}
                </div>
              </td>


              <!-- Kategori -->
              <td class="py-4 px-6 align-top text-center">
                <span class="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200 shadow-sm">
                  {{ item.categoryName }}
                </span>
              </td>

              <!-- Statü -->
              <td class="py-4 px-6 align-top">
                <span [class]="getStatusClass(item.status)" class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border">
                  <!-- İkonlar statüye göre -->
                  <svg *ngIf="item.status === 'Published'" xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <svg *ngIf="item.status === 'PendingModerator' || item.status === 'PendingEditor'" xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <svg *ngIf="item.status === 'Rejected'" xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <svg *ngIf="item.status === 'Withdrawn'" xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                  
                  {{ getStatusText(item.status) }}
                </span>
              </td>

              <!-- Aksiyon İşlem Butonları -->
              <td class="py-4 px-3 align-middle text-right" style="white-space:nowrap;">
                <div class="flex flex-nowrap gap-1.5 justify-end items-center">
                  <button (click)="preview(item)" class="py-1 px-3 text-[11px] font-bold border border-gray-200 text-gray-600 rounded-md hover:bg-gray-50 transition-colors">
                    Önizle
                  </button>
                  
                  <ng-container *ngIf="canEditOrDelete(item)">
                    <button (click)="edit(item)" class="py-1 px-3 text-[11px] font-bold border border-blue-200 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors">
                      Düzenle
                    </button>
                    <button (click)="deleteItem(item)" class="py-1 px-3 text-[11px] font-bold border border-red-200 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors">
                      Sil
                    </button>
                  </ng-container>

                  <button *ngIf="canWithdraw(item)" (click)="withdraw(item)" class="py-1 px-3 text-[11px] font-bold border border-orange-200 bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 transition-colors">
                    Geri Çek
                  </button>

                  <button *ngIf="canViewReaders(item)" (click)="openReadersModal(item)" class="py-1 px-3 text-[11px] font-bold border border-indigo-200 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors">
                    Kimler Okudu?
                  </button>
                  
                  <!-- Admin, Editör ve Moderatör Onay/Red İşlemleri -->
                  <ng-container *ngIf="canApprove(item)">
                    <button (click)="approve(item)" class="py-1 px-3 text-[11px] font-bold border border-green-200 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors">
                      Onayla
                    </button>
                    <button (click)="reject(item)" class="py-1 px-3 text-[11px] font-bold border border-red-200 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors">
                      Reddet
                    </button>
                  </ng-container>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Kimler Okudu Modal -->
      <div *ngIf="isReadersModalOpen" class="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-[fadeIn_0.3s_ease-out]">
          
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 class="font-bold text-gray-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" /></svg>
              Okuyanlar Listesi
            </h3>
            <button (click)="closeReadersModal()" class="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-0">
             <table class="w-full text-left border-collapse">
               <thead>
                 <tr class="bg-gray-50 border-b border-gray-100">
                   <th class="py-3 px-6 text-xs font-bold text-gray-500 uppercase">Personel Adı</th>
                   <th class="py-3 px-6 text-xs font-bold text-gray-500 uppercase">Rol / Ünvan</th>
                   <th class="py-3 px-6 text-xs font-bold text-gray-500 uppercase text-right">Okuma Zamanı</th>
                 </tr>
               </thead>
               <tbody class="divide-y divide-gray-100">
                 <tr *ngIf="readers.length === 0">
                   <td colspan="3" class="py-8 text-center text-sm text-gray-500">Henüz kimse okumamış.</td>
                 </tr>
                 <tr *ngFor="let r of readers" class="hover:bg-gray-50/50">
                   <td class="py-3 px-6 text-sm font-bold text-gray-800">{{ r.fullName }}</td>
                   <td class="py-3 px-6 text-xs font-medium text-gray-600">{{ r.role }}</td>
                   <td class="py-3 px-6 text-xs text-gray-500 text-right">{{ r.readAt | date:'dd.MM.yyyy HH:mm' }}</td>
                 </tr>
               </tbody>
             </table>
          </div>

          <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 text-right">
             <button (click)="closeReadersModal()" class="px-5 py-2 bg-gray-800 text-white rounded-lg text-sm font-bold hover:bg-gray-900 transition-colors">Kapat</button>
          </div>
        </div>
      </div>

      <!-- Custom Confirm/Prompt Modal -->
      <div *ngIf="isConfirmModalOpen" class="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-[fadeIn_0.3s_ease-out]">
          <div class="px-6 py-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
            <div [class]="confirmModalConfig.iconBg" class="w-10 h-10 rounded-full flex items-center justify-center text-white">
              <svg *ngIf="confirmModalConfig.type === 'danger'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <svg *ngIf="confirmModalConfig.type === 'warning'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 class="font-bold text-gray-800 text-lg">{{ confirmModalConfig.title }}</h3>
          </div>
          <div class="p-6">
            <p class="text-gray-600 text-sm mb-4">{{ confirmModalConfig.message }}</p>
            <textarea *ngIf="confirmModalConfig.isPrompt" 
                      [(ngModel)]="confirmModalConfig.inputValue" 
                      rows="3" 
                      class="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                      placeholder="Lütfen sebebi buraya girin..."></textarea>
          </div>
          <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
             <button (click)="closeConfirmModal()" class="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300 transition-colors">İptal</button>
             <button (click)="confirmModalAction()" [class]="confirmModalConfig.btnClass" class="px-5 py-2 text-white rounded-lg text-sm font-bold transition-colors">{{ confirmModalConfig.confirmText }}</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ArchiveComponent implements OnInit, OnDestroy {
  announcements: AnnouncementResponseDto[] = [];
  private refreshSub?: Subscription;
  
  isReadersModalOpen = false;
  readers: any[] = [];
  searchQuery: string = '';

  isConfirmModalOpen = false;
  confirmModalConfig: any = {};

  private announcementService = inject(AnnouncementService);
  private authService = inject(AuthService);
  private alertService = inject(AlertService);

  get filteredAnnouncements() {
    if (!this.searchQuery) return this.announcements;
    const lowerQ = this.searchQuery.toLowerCase();
    
    return this.announcements.filter(a => {
       const statusText = this.getStatusText(a.status).toLowerCase();
       const formatText = this.getFormatText(a.format || '').toLowerCase();
       const freqText = this.getFrequencyText(a.frequency || '').toLowerCase();
       const createDate = a.createdAt ? new Date(a.createdAt).toLocaleDateString('tr-TR') : '';
       const startDate = a.startDate ? new Date(a.startDate).toLocaleDateString('tr-TR') : '';
       const endDate = a.endDate ? new Date(a.endDate).toLocaleDateString('tr-TR') : '';
       const createdBy = (a.createdByName || '').toLowerCase();
       const title = (a.title || '').toLowerCase();
       const category = (a.categoryName || '').toLowerCase();
       const rejection = (a.rejectionReason || '').toLowerCase();

       return title.includes(lowerQ) ||
              category.includes(lowerQ) ||
              statusText.includes(lowerQ) ||
              formatText.includes(lowerQ) ||
              freqText.includes(lowerQ) ||
              createdBy.includes(lowerQ) ||
              createDate.includes(lowerQ) ||
              startDate.includes(lowerQ) ||
              endDate.includes(lowerQ) ||
              rejection.includes(lowerQ);
    });
  }

  ngOnInit() {
    this.loadData();
    this.refreshSub = this.announcementService.refreshArchive$.subscribe(() => {
      this.loadData();
    });
  }

  ngOnDestroy() {
    this.refreshSub?.unsubscribe();
  }

  async loadData() {
    await this.announcementService.fetchAnnouncements();
    const res = this.announcementService.announcements();
    
    const role = this.authService.currentRole();
    if (role === 'User') {
      this.announcements = res.filter((a: any) => a.status === 'Published');
    } else {
      this.announcements = res;
    }
  }

  getStatusClass(status: string) {
    switch(status) {
      case 'Published': return 'bg-green-50 text-green-700 border-green-200';
      case 'PendingEditor': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'PendingModerator': return 'bg-blue-50 text-blue-700 border-blue-200'; // Prompt'taki Moderatör onayı bekliyor mavisi
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-200';
      case 'Withdrawn': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }

  getStatusText(status: string) {
    switch(status) {
      case 'Published': return 'Yayında';
      case 'PendingEditor': return 'Editör Onayı Bekliyor';
      case 'PendingModerator': return 'Moderatör Onayı Bekliyor';
      case 'Rejected': return 'Geri Döndü';
      case 'Withdrawn': return 'Yayından Çekildi';
      default: return status;
    }
  }

  getFormatText(format: string): string {
    switch(format) {
      case 'Glassmorphism': return '🪟 Cam';
      case 'Cinematic':     return '🎬 Sinematik';
      case 'Story':         return '📖 Hikaye';
      case 'Toast':         return '🔔 Bildirim';
      default:              return format;
    }
  }

  getFrequencyText(freq: string): string {
    switch(freq) {
      case 'Once':   return '⏱ Sıklık';
      case 'Daily':  return '📅 Günde Bir';
      case 'Always': return '🔁 Her Girişte';
      default:       return freq;
    }
  }

  formatDuration(dakika: number): string {
    if (!dakika || dakika <= 0) return '';
    if (dakika < 60) return `⏳ ${dakika} dk`;
    const saat  = Math.floor(dakika / 60);
    const kalan = dakika % 60;
    return kalan > 0 ? `⏳ ${saat} sa ${kalan} dk` : `⏳ ${saat} saat`;
  }


  canApprove(item: AnnouncementResponseDto): boolean {
    const role = this.authService.currentRole();
    if (role === 'Editor' && item.status === 'PendingEditor') return true;
    if (role === 'Moderator' && item.status === 'PendingModerator') return true;
    if (role === 'Admin' && (item.status === 'PendingEditor' || item.status === 'PendingModerator')) return true;
    return false;
  }

  canWithdraw(item: AnnouncementResponseDto): boolean {
    const role = this.authService.currentRole();
    return item.status === 'Published' && (role === 'Admin' || role === 'Editor' || role === 'Moderator');
  }

  approve(item: AnnouncementResponseDto) {
    const role = this.authService.currentRole();
    const nextStatus = role === 'Editor' ? 'PendingModerator' : 'Published';
    this.updateStatus(item.id, nextStatus);
  }

  async updateStatus(id: number, status: string, reason?: string) {
    const dto: any = { status: status, rejectionReason: reason };
    await this.announcementService.updateStatus(id, dto);
    this.loadData();
  }

  withdraw(item: AnnouncementResponseDto) {
    this.openConfirmModal({
      title: 'Emin misiniz?',
      message: `"${item.title}" başlıklı duyuruyu yayından çekmek istediğinize emin misiniz?`,
      type: 'warning',
      iconBg: 'bg-orange-500',
      btnClass: 'bg-orange-600 hover:bg-orange-700',
      confirmText: 'Evet, Geri Çek',
      action: () => this.updateStatus(item.id, 'Withdrawn')
    });
  }

  reject(item: AnnouncementResponseDto) {
    this.openConfirmModal({
      title: 'Ret (Düzeltme) Sebebi',
      message: `"${item.title}" başlıklı duyuru için lütfen düzeltme sebebini girin:`,
      type: 'danger',
      iconBg: 'bg-red-500',
      btnClass: 'bg-red-600 hover:bg-red-700',
      confirmText: 'Reddet',
      isPrompt: true,
      inputValue: '',
      action: (reason: string) => {
        if (reason && reason.trim() !== '') {
          this.updateStatus(item.id, 'Rejected', reason);
        }
      }
    });
  }

  preview(item: AnnouncementResponseDto) {
    this.announcementService.triggerPreview(item);
  }

  canEditOrDelete(item: AnnouncementResponseDto): boolean {
    const role = this.authService.currentRole();
    // Admin, Moderatör ve Editör düzenleme ve silme yetkisine sahip.
    if (role === 'Admin' || role === 'Moderator' || role === 'Editor') return true;
    return false;
  }
  
  edit(item: AnnouncementResponseDto) {
    this.announcementService.triggerEdit(item);
  }

  async deleteItem(item: AnnouncementResponseDto) {
    this.openConfirmModal({
      title: 'Kalıcı Olarak Silinecek',
      message: `"${item.title}" başlıklı duyuruyu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      type: 'danger',
      iconBg: 'bg-red-500',
      btnClass: 'bg-red-600 hover:bg-red-700',
      confirmText: 'Evet, Sil',
      action: async () => {
        await this.announcementService.deleteAnnouncement(item.id);
        this.loadData();
      }
    });
  }

  canViewReaders(item: AnnouncementResponseDto): boolean {
    const role = this.authService.currentRole();
    // User hariç herkes (Admin, Editor, Mod) okuyanları görebilir, tabii duyuru Published ise.
    if (role === 'User') return false;
    return item.status === 'Published';
  }

  async openReadersModal(item: AnnouncementResponseDto) {
    this.readers = await this.announcementService.getReaders(item.id);
    this.isReadersModalOpen = true;
  }

  closeReadersModal() {
    this.isReadersModalOpen = false;
    this.readers = [];
  }

  openConfirmModal(config: any) {
    this.confirmModalConfig = config;
    this.isConfirmModalOpen = true;
  }

  closeConfirmModal() {
    this.isConfirmModalOpen = false;
  }

  confirmModalAction() {
    if (this.confirmModalConfig.isPrompt) {
      if (!this.confirmModalConfig.inputValue || this.confirmModalConfig.inputValue.trim() === '') {
        this.alertService.error('Lütfen bir sebep girin.');
        return;
      }
      this.confirmModalConfig.action(this.confirmModalConfig.inputValue);
    } else {
      this.confirmModalConfig.action();
    }
    this.closeConfirmModal();
  }
}
