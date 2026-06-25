import { Component, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Role } from '../../models/announcement.model';

declare var initNetworkAnimation: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Canvas Arka Plan Animasyonu -->
    <canvas id="networkCanvas" aria-hidden="true" class="fixed inset-0 w-full h-full z-[-1]"></canvas>

    <!-- Glassmorphism Container -->
    <div class="min-h-screen flex items-center justify-center p-4 relative z-10">
      
      <!-- Login Box (Portal tasarımıyla uyumlu) -->
      <div class="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--brand-alpha)] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-[2rem] w-full max-w-md overflow-hidden relative">
        
        <!-- Üst Işıltı Efekti -->
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--brand-color)] to-transparent opacity-70"></div>

        <!-- Header / Logo -->
        <div class="p-8 pb-6 flex flex-col items-center justify-center text-center">
          <div class="w-16 h-16 rounded-full border-2 border-[var(--brand-color)] flex items-center justify-center bg-[var(--bg-color)] shadow-[0_0_15px_var(--shadow-glow)] mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-[var(--brand-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 class="text-[var(--text-color)] text-xl font-bold transition-colors leading-tight mb-1">Tapu ve Kadastro Genel Müdürlüğü</h1>
          <h2 class="text-[var(--brand-dark)] text-[10px] font-bold tracking-wider uppercase leading-tight mb-4">Bilgi Teknolojileri Dairesi Başkanlığı</h2>
          
          <div class="w-full h-px bg-gradient-to-r from-transparent via-[var(--brand-alpha)] to-transparent my-2"></div>
          
          <h3 class="text-lg font-bold text-[var(--text-color)] mt-4">DYS Portalı Giriş</h3>
          <p class="text-xs text-[var(--text-muted)] mt-1">Lütfen yetkili hesabınızla oturum açın</p>
        </div>

        <div class="px-8 pb-8 pt-2">
          <!-- Divider & Test Hesapları Başlığı -->
          <div class="relative flex py-4 items-center">
            <div class="flex-grow border-t border-[var(--brand-alpha)]"></div>
            <span class="flex-shrink-0 mx-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Hızlı Giriş Rolleri</span>
            <div class="flex-grow border-t border-[var(--brand-alpha)]"></div>
          </div>

          <!-- Test Hesapları (Grid) -->
          <div class="grid grid-cols-2 gap-3 mt-4">
            <button (click)="login('Admin')" class="relative overflow-hidden py-3 px-4 bg-white/50 border border-[var(--brand-alpha)] rounded-xl hover:border-[var(--brand-color)] hover:shadow-[0_0_15px_var(--shadow-glow)] transition-all text-left flex flex-col items-center group backdrop-blur-sm cursor-pointer">
              <div class="w-10 h-10 rounded-full bg-[var(--brand-alpha-light)] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[var(--brand-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <span class="text-xs font-bold text-[var(--text-color)]">Sistem Yöneticisi</span>
              <span class="text-[9px] text-[var(--text-muted)]">(Admin)</span>
            </button>

            <button (click)="login('Editor')" class="relative overflow-hidden py-3 px-4 bg-white/50 border border-[var(--brand-alpha)] rounded-xl hover:border-[var(--brand-color)] hover:shadow-[0_0_15px_var(--shadow-glow)] transition-all text-left flex flex-col items-center group backdrop-blur-sm cursor-pointer">
              <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </div>
              <span class="text-xs font-bold text-[var(--text-color)]">İçerik Üretici</span>
              <span class="text-[9px] text-[var(--text-muted)]">(Editör)</span>
            </button>

            <button (click)="login('Moderator')" class="relative overflow-hidden py-3 px-4 bg-white/50 border border-[var(--brand-alpha)] rounded-xl hover:border-[var(--brand-color)] hover:shadow-[0_0_15px_var(--shadow-glow)] transition-all text-left flex flex-col items-center group backdrop-blur-sm cursor-pointer">
              <div class="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <span class="text-xs font-bold text-[var(--text-color)]">Onay Mercii</span>
              <span class="text-[9px] text-[var(--text-muted)]">(Moderatör)</span>
            </button>

            <button (click)="login('User')" class="relative overflow-hidden py-3 px-4 bg-white/50 border border-[var(--brand-alpha)] rounded-xl hover:border-[var(--brand-color)] hover:shadow-[0_0_15px_var(--shadow-glow)] transition-all text-left flex flex-col items-center group backdrop-blur-sm cursor-pointer">
              <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <span class="text-xs font-bold text-[var(--text-color)]">Personel/Vatandaş</span>
              <span class="text-[9px] text-[var(--text-muted)]">(Kullanıcı)</span>
            </button>
          </div>
          
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements AfterViewInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngAfterViewInit() {
    // Portal anasayfasındaki gibi animasyonu başlat
    const existingScript = document.getElementById('animation-script');
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'animation-script';
      script.src = 'animation.js';
      script.onload = () => {
        if (typeof initNetworkAnimation === 'function') {
           initNetworkAnimation();
        }
      };
      document.body.appendChild(script);
    } else {
      if (typeof initNetworkAnimation === 'function') {
           initNetworkAnimation();
      }
    }
  }

  login(role: Role) {
    this.authService.changeRole(role);
    this.router.navigate(['/app/dashboard']);
  }
}
