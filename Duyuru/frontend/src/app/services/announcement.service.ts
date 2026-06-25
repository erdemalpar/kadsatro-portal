import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { AnnouncementResponseDto, CreateAnnouncementDto, UpdateAnnouncementStatusDto, UpdateAnnouncementDto, DashboardStatsDto } from '../models/announcement.model';
import { firstValueFrom, Observable, Subject } from 'rxjs';
import * as signalR from '@microsoft/signalr';
@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly apiUrl = 'http://localhost:5005/api/announcement';

  // Önizleme fırlatmak için event
  private previewSubject = new Subject<any>();
  public previewAnnouncement$ = this.previewSubject.asObservable();

  public newAnnouncement$ = new Subject<void>();
  public refreshArchive$ = new Subject<void>();

  public triggerPreview(announcementData: AnnouncementResponseDto) {
    this.previewSubject.next(announcementData);
  }

  private hubConnection: signalR.HubConnection | undefined;

  constructor() {
    this.startSignalRConnection();
  }

  private startSignalRConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5005/announcementHub')
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => console.log('SignalR connection established.'))
      .catch(err => console.error('Error while starting SignalR connection: ', err));

    this.hubConnection.on('ReceiveViewCountUpdate', (announcementId: number, viewCount: number) => {
      this.announcementsSignal.update(arr => arr.map(a => 
        a.id === announcementId ? { ...a, viewCount: viewCount } : a
      ));
    });

    this.hubConnection.on('ReceiveNewAnnouncement', () => {
      this.newAnnouncement$.next();
    });
  }

  // State (Signals)
  private announcementsSignal = signal<AnnouncementResponseDto[]>([]);
  
  // Düzenleme (Edit) modu için seçilen duyuru
  private activeEditSignal = signal<AnnouncementResponseDto | null>(null);

  // Computed
  public readonly announcements = computed(() => this.announcementsSignal());
  public readonly activeEdit = computed(() => this.activeEditSignal());

  // API Calls
  public async fetchAnnouncements() {
    const role = this.authService.currentRole();
    try {
      const data = await firstValueFrom(this.http.get<AnnouncementResponseDto[]>(`${this.apiUrl}?role=${role}`));
      this.announcementsSignal.set(data);
    } catch (error) {
      console.error('Duyurular alınamadı', error);
    }
  }

  public async createAnnouncement(dto: CreateAnnouncementDto) {
    try {
      const newAnn = await firstValueFrom(this.http.post<AnnouncementResponseDto>(this.apiUrl, dto));
      // Listeye başa ekle
      this.announcementsSignal.update(arr => [newAnn, ...arr]);
      return true;
    } catch (error) {
      console.error('Oluşturulamadı', error);
      return false;
    }
  }

  public async updateStatus(id: number, dto: UpdateAnnouncementStatusDto) {
    const role = this.authService.currentRole();
    try {
      const updated = await firstValueFrom(this.http.put<AnnouncementResponseDto>(`${this.apiUrl}/${id}/status?role=${role}`, dto));
      // Listede güncelle
      this.announcementsSignal.update(arr => arr.map(a => a.id === id ? updated : a));
      return true;
    } catch (error) {
      console.error('Güncellenemedi', error);
      return false;
    }
  }

  public async updateAnnouncement(id: number, dto: UpdateAnnouncementDto) {
    const role = this.authService.currentRole();
    try {
      const updated = await firstValueFrom(this.http.put<AnnouncementResponseDto>(`${this.apiUrl}/${id}?role=${role}`, dto));
      this.announcementsSignal.update(arr => arr.map(a => a.id === id ? updated : a));
      return true;
    } catch (error) {
      console.error('Güncellenemedi', error);
      return false;
    }
  }

  public async deleteAnnouncement(id: number) {
    const role = this.authService.currentRole();
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}?role=${role}`));
      this.announcementsSignal.update(arr => arr.filter(a => a.id !== id));
      return true;
    } catch (error) {
      console.error('Silinemedi', error);
      return false;
    }
  }

  public async getDashboardStats(): Promise<DashboardStatsDto | null> {
    try {
      return await firstValueFrom(this.http.get<DashboardStatsDto>(`${this.apiUrl}/stats`));
    } catch (error) {
      console.error('İstatistikler alınamadı', error);
      return null;
    }
  }

  public async getChartData(period: string = 'weekly') {
    try {
      return await firstValueFrom(this.http.get<any>(`${this.apiUrl}/chart?period=${period}`));
    } catch (error) {
      console.error('Grafik verisi çekilemedi:', error);
      return null;
    }
  }

  public async uploadMedia(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await firstValueFrom(this.http.post<{url: string}>(`${this.apiUrl}/upload`, formData));
      return 'http://localhost:5005' + res.url;
    } catch (error) {
      console.error('Dosya yüklenemedi', error);
      return null;
    }
  }

  public async getUnreadAnnouncements(): Promise<any[]> {
    const userId = this.authService.currentUserId();
    if (!userId) return [];
    try {
      return await firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/unread?userId=${userId}`));
    } catch(err) {
      console.error('Okunmamış duyurular çekilemedi', err);
      return [];
    }
  }

  public async markAsRead(announcementId: number): Promise<boolean> {
    const userId = this.authService.currentUserId();
    if (!userId) return false;
    try {
      await firstValueFrom(this.http.post(`${this.apiUrl}/${announcementId}/read?userId=${userId}`, {}));
      return true;
    } catch(err) {
      console.error('Okundu işaretlenemedi', err);
      return false;
    }
  }

  public async getReaders(announcementId: number): Promise<any[]> {
    try {
      return await firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/${announcementId}/readers`));
    } catch(err) {
      console.error('Okuyanlar çekilemedi', err);
      return [];
    }
  }

  // Edit System
  public triggerEdit(ann: AnnouncementResponseDto | null) {
    this.activeEditSignal.set(ann);
  }
}
