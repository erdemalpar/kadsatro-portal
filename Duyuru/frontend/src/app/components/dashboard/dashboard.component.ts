import { Component, inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnnouncementService } from '../../services/announcement.service';
import { AuthService } from '../../services/auth.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="space-y-6">
      
      <!-- Hoş Geldiniz Alanı -->
      <div class="mb-8">
        <h1 class="text-2xl font-extrabold text-gray-900 tracking-tight">Hoş Geldiniz, {{ getCurrentUserName() }}</h1>
        <p class="text-sm text-gray-500 mt-1">Sistemdeki son durumlara göz atın.</p>
      </div>

      <!-- Özet Kartları (Resimdeki 3 Kart + Sayaç) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div class="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Yayındaki Duyurular</p>
            <h2 class="text-2xl font-bold text-gray-900">{{ publishedCount }}</h2>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div class="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Onay Sürecindekiler</p>
            <h2 class="text-2xl font-bold text-gray-900">{{ pendingCount }}</h2>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div class="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Düzeltme Bekleyenler</p>
            <h2 class="text-2xl font-bold text-gray-900">{{ rejectedCount }}</h2>
          </div>
        </div>

        <!-- Canlı Artan Görüntülenme Sayacı (Prompt'taki istek) -->
        <div class="bg-gradient-to-br from-[var(--brand-color)] to-[var(--brand-dark)] rounded-2xl p-6 shadow-lg text-white flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </div>
          <div>
            <p class="text-xs font-medium text-indigo-100 uppercase tracking-wider">Toplam Görüntülenme</p>
            <h2 class="text-3xl font-extrabold tracking-tight">{{ totalViews | number:'1.0-0' }}</h2>
          </div>
        </div>

      </div>

      <!-- Haftalık Sistem Etkileşimi Grafiği -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-sm font-bold text-gray-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Sistem Etkileşimi
          </h3>
          <div class="flex bg-gray-100 p-1 rounded-lg gap-1">
            <button (click)="setPeriod('daily')" [class.bg-white]="currentPeriod === 'daily'" [class.shadow-sm]="currentPeriod === 'daily'" class="px-3 py-1 text-xs font-medium rounded-md transition-all text-gray-700">Günlük</button>
            <button (click)="setPeriod('weekly')" [class.bg-white]="currentPeriod === 'weekly'" [class.shadow-sm]="currentPeriod === 'weekly'" class="px-3 py-1 text-xs font-medium rounded-md transition-all text-gray-700">Haftalık</button>
            <button (click)="setPeriod('monthly')" [class.bg-white]="currentPeriod === 'monthly'" [class.shadow-sm]="currentPeriod === 'monthly'" class="px-3 py-1 text-xs font-medium rounded-md transition-all text-gray-700">Aylık</button>
            <button (click)="setPeriod('yearly')" [class.bg-white]="currentPeriod === 'yearly'" [class.shadow-sm]="currentPeriod === 'yearly'" class="px-3 py-1 text-xs font-medium rounded-md transition-all text-gray-700">Yıllık</button>
          </div>
        </div>
        
        <div class="h-80 w-full">
          <canvas baseChart
                  [data]="lineChartData"
                  [options]="lineChartOptions"
                  [type]="lineChartType">
          </canvas>
        </div>
      </div>
      
    </div>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  currentPeriod = 'weekly';
  
  publishedCount = 0;
  pendingCount = 0;
  rejectedCount = 0;
  totalViews = 0;

  private announcementService = inject(AnnouncementService);
  private authService = inject(AuthService);

  // Chart.js Yapılandırması (Görseldeki gibi dalgalı ve 2 çizgili)
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [2500, 1500, 10000, 4000, 4800, 3900, 4200],
        label: 'Görüntülenme',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: '#10b981', // Yeşil
        pointBackgroundColor: '#fff',
        pointBorderColor: '#10b981',
        pointHoverBackgroundColor: '#10b981',
        pointHoverBorderColor: '#fff',
        fill: 'origin',
        tension: 0.4 // Dalgalı hat için
      },
      {
        data: [4200, 3100, 2000, 2800, 1900, 2400, 3500],
        label: 'Etkileşim (Tıklama)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderColor: '#4f46e5', // Brand rengi
        pointBackgroundColor: '#fff',
        pointBorderColor: '#4f46e5',
        pointHoverBackgroundColor: '#4f46e5',
        pointHoverBorderColor: '#fff',
        fill: 'origin',
        tension: 0.4
      }
    ],
    labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: {
        borderWidth: 3
      },
      point: {
        radius: 4,
        borderWidth: 2
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6', // Çok hafif gri
        },
        border: {
          dash: [4, 4]
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: { display: true, position: 'top' }
    }
  };
  public lineChartType: ChartType = 'line';

  private viewTimer: any;

  ngOnInit() {
    this.loadStats();
    this.loadChartData(this.currentPeriod);
    // Gerçek zamanlı artış ve istatistik güncellemesi için her 5 saniyede bir tetikle
    this.viewTimer = setInterval(() => {
      this.loadStats();
      this.loadChartData(this.currentPeriod);
    }, 5000);
  }

  ngOnDestroy() {
    if (this.viewTimer) {
      clearInterval(this.viewTimer);
    }
  }

  getCurrentUserName(): string {
    const role = this.authService.currentRole();
    if (role === 'Admin') return 'Ahmet Yönetici';
    if (role === 'Editor') return 'Ayşe Editör';
    if (role === 'Moderator') return 'Mehmet Moderatör';
    return 'Vatandaş / Personel';
  }

  private async loadStats() {
    const stats = await this.announcementService.getDashboardStats();
    if (stats) {
      this.publishedCount = stats.publishedCount;
      this.pendingCount = stats.pendingCount;
      this.rejectedCount = stats.rejectedCount;
      this.totalViews = stats.totalViews;
    }
  }

  setPeriod(period: string) {
    this.currentPeriod = period;
    this.loadChartData(period);
  }

  async loadChartData(period: string) {
    const data = await this.announcementService.getChartData(period);
    if (data) {
      this.lineChartData.labels = data.labels;
      this.lineChartData.datasets[0].data = data.views;
      this.lineChartData.datasets[1].data = data.interactions;
      this.chart?.update();
    }
  }
}
