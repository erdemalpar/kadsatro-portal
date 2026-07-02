import { Component, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var initNetworkAnimation: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Canvas Arka Plan Animasyonu (index'te z-index -1 olarak ayarlı) -->
    <canvas id="networkCanvas" aria-hidden="true"></canvas>

    <div id="ui-layer">
      <!-- Dark/Light Mod Butonu -->
      <div class="fixed top-6 right-6 z-50">
        <button (click)="toggleTheme()" class="w-10 h-10 flex items-center justify-center rounded-full border border-[var(--brand-alpha)] text-[var(--text-color)] hover:bg-[var(--brand-hover)] transition-all glass-panel cursor-pointer">
          <svg *ngIf="!isDarkMode" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          <svg *ngIf="isDarkMode" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        </button>
      </div>

      <!-- Saydam Login Alanı -->
      <div class="min-h-screen flex flex-col items-center justify-center p-4">
        
        <div class="glass-panel rounded-[2rem] p-8 md:p-10 w-full max-w-md relative z-10 text-center shadow-[0_8px_32px_0_var(--shadow-glow)] overflow-hidden">
          
          <!-- Üst Işıltı Efekti -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--brand-color)] to-transparent opacity-70"></div>

          <!-- Logo & Başlık -->
          <div class="w-16 h-16 mx-auto rounded-full border-2 border-[var(--brand-color)] flex items-center justify-center bg-[var(--bg-color)] shadow-[0_0_15px_var(--shadow-glow)] mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-[var(--brand-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 class="text-xl md:text-2xl font-bold text-[var(--text-color)] mb-1 tracking-tight leading-tight">Tapu ve Kadastro</h1>
          <h2 class="text-[10px] md:text-xs font-bold text-[var(--brand-color)] uppercase tracking-widest mb-6">Kadastro Portal Giriş Ekranı</h2>

          <!-- Kullanıcı Adı ve Şifre Alanları -->
          <div class="flex flex-col gap-4 text-left">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
              </div>
              <input #usernameInput type="text" placeholder="Kullanıcı Adı" class="w-full bg-[var(--bg-color)] text-[var(--text-color)] border border-[var(--brand-alpha)] rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[var(--brand-color)] focus:ring-1 focus:ring-[var(--brand-color)] transition-all placeholder:text-gray-400">
            </div>
            
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" /></svg>
              </div>
              <input #passwordInput type="password" (keyup.enter)="onAuthLogin(usernameInput.value, passwordInput.value)" placeholder="Parola" class="w-full bg-[var(--bg-color)] text-[var(--text-color)] border border-[var(--brand-alpha)] rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[var(--brand-color)] focus:ring-1 focus:ring-[var(--brand-color)] transition-all placeholder:text-gray-400">
            </div>

            <!-- Error Message -->
            <div *ngIf="loginError" class="text-red-500 text-xs font-bold bg-red-100/10 p-2 rounded-lg text-center border border-red-500/30">
              Kullanıcı adı veya parola hatalı!
            </div>

            <button (click)="onAuthLogin(usernameInput.value, passwordInput.value)" class="w-full bg-[var(--brand-color)] text-white font-bold py-3 rounded-xl hover:bg-[var(--brand-dark)] transition-all mt-2 shadow-lg flex items-center justify-center gap-2 cursor-pointer">
              <span>Sisteme Giriş Yap</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>

          <!-- Divider -->
          <div class="border-t border-[var(--brand-alpha)] my-6 relative flex items-center justify-center">
              <span class="absolute bg-[var(--bg-color)] px-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider rounded-full border border-[var(--brand-alpha)]">Hızlı Test Girişleri</span>
          </div>

          <!-- Hızlı Giriş Butonları -->
          <div class="grid grid-cols-2 gap-3">
             <button (click)="onLogin('Admin')" class="py-2.5 px-2 border border-[var(--brand-alpha)] bg-transparent rounded-lg text-xs font-bold text-[var(--text-color)] hover:border-[var(--brand-color)] hover:bg-[var(--brand-alpha-light)] transition-all flex flex-col items-center cursor-pointer">
                <span class="text-[var(--brand-color)] mb-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg></span>
                Admin
             </button>
             <button (click)="onLogin('Editor')" class="py-2.5 px-2 border border-[var(--brand-alpha)] bg-transparent rounded-lg text-xs font-bold text-[var(--text-color)] hover:border-[var(--brand-color)] hover:bg-[var(--brand-alpha-light)] transition-all flex flex-col items-center cursor-pointer">
                <span class="text-blue-500 mb-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg></span>
                Editör
             </button>
             <button (click)="onLogin('Moderator')" class="py-2.5 px-2 border border-[var(--brand-alpha)] bg-transparent rounded-lg text-xs font-bold text-[var(--text-color)] hover:border-[var(--brand-color)] hover:bg-[var(--brand-alpha-light)] transition-all flex flex-col items-center cursor-pointer">
                <span class="text-indigo-500 mb-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6.267 3.441A11.026 11.026 0 002 9.999c0 5.638 4.239 10.3 9.77 10.97a1 1 0 001.127-1.127 8.995 8.995 0 01-1.39-10.45 1 1 0 00-1.487-1.144zM10.842 2.766a1 1 0 00-1.127 1.127 8.994 8.994 0 011.39 10.45 1 1 0 001.487 1.144A11.025 11.025 0 0018 9.999c0-5.638-4.239-10.3-9.77-10.97z" clip-rule="evenodd" /></svg></span>
                Moderatör
             </button>
             <button (click)="onLogin('User')" class="py-2.5 px-2 border border-[var(--brand-alpha)] bg-transparent rounded-lg text-xs font-bold text-[var(--text-color)] hover:border-[var(--brand-color)] hover:bg-[var(--brand-alpha-light)] transition-all flex flex-col items-center cursor-pointer">
                <span class="text-gray-500 mb-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg></span>
                Personel
             </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class AppComponent implements OnInit, AfterViewInit {
  public isDarkMode = true;
  public loginError = false;

  ngOnInit() {
    if (!document.documentElement.classList.contains('dark-theme')) {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    }
  }

  ngAfterViewInit() {
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

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    
    // Animasyon renklerini güncelle
    if (typeof (window as any)['updateCanvasTheme'] === 'function') {
      (window as any)['updateCanvasTheme']();
    }
  }

  onAuthLogin(user: string, pass: string) {
    this.loginError = false;
    let role = '';

    // Kullanıcının istediği hardcoded kontroller
    if (user === 'admin' && pass === 'admin') role = 'Admin';
    else if (user === 'editör' && pass === 'editör') role = 'Editor';
    else if (user === 'moderatör' && pass === 'moderatör') role = 'Moderator';
    else if (user === 'user' && pass === 'user') role = 'User';

    if (role) {
      this.onLogin(role);
    } else {
      this.loginError = true;
    }
  }

  onLogin(role: string) {
    // Login portu 4212, Portal portu 4200 olduğu için LocalStorage paylaşılamaz!
    // Bu yüzden role ve username bilgilerini URL parametresi olarak Portal'a aktarıyoruz.
    const username = role === 'Admin' ? 'Admin' : role;
    localStorage.setItem('dys_role', role);
    localStorage.setItem('dys_username', username + ' User');
    window.location.href = `http://localhost:4200?token=${role}&user=${username}+User`;
  }
}
