import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AnnouncementFormComponent } from '../announcement-form/announcement-form.component';
import { GlobalAnnouncementViewerComponent } from '../global-announcement-viewer/global-announcement-viewer.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AnnouncementFormComponent, GlobalAnnouncementViewerComponent],
  template: `
    <app-global-announcement-viewer></app-global-announcement-viewer>
    <div class="h-screen bg-[var(--bg-color)] flex flex-col overflow-hidden text-gray-800 font-sans">
      
      <!-- Top Header -->
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 z-20 shrink-0">
        <!-- Logo & Mobile Menu Button -->
        <div class="flex items-center gap-4">
          <button (click)="returnToPortal()" type="button" class="cursor-pointer p-2 text-gray-500 hover:text-[var(--brand-color)] rounded-lg hover:bg-gray-100 flex items-center gap-1 transition-colors" title="Portala Dön">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span class="text-sm font-medium hidden sm:block">Portala Dön</span>
          </button>
          <div class="w-px h-6 bg-gray-200"></div>
          
          <button class="lg:hidden p-2 text-gray-500 hover:text-[var(--brand-color)] rounded-lg hover:bg-gray-100" (click)="toggleMobileMenu()">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded bg-[var(--brand-color)] flex items-center justify-center text-white font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <span class="text-lg font-bold tracking-tight text-gray-900 hidden sm:block">DYS</span>
          </div>
        </div>

        <!-- Navigation Tabs (Center-ish) -->
        <div class="hidden md:flex items-center gap-2">
          <a *ngIf="canShowDashboard()" routerLink="/app/dashboard" routerLinkActive="bg-[var(--brand-alpha)] text-[var(--brand-color)] font-medium" class="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2">
            Genel Bakış
          </a>
          <a routerLink="/app/archive" routerLinkActive="bg-[var(--brand-alpha)] text-[var(--brand-color)] font-medium" class="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            Yönetim Paneli
          </a>
        </div>

        <!-- User Profile -->
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3 border-l border-gray-200 pl-4">
            <div class="hidden sm:flex flex-col items-end">
              <span class="text-sm font-semibold text-gray-900">{{ getCurrentUserName() }}</span>
              <span class="text-[10px] font-bold text-[var(--brand-color)] uppercase tracking-wider">{{ currentRole() }}</span>
            </div>
            <div class="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg>
            </div>
          </div>
          <button (click)="logout()" class="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Çıkış Yap">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </header>

      <!-- Main Content Area -->
      <div class="flex flex-1 overflow-hidden relative">
        
        <!-- Sidebar (Only for Admin/Editor) -->
        <ng-container *ngIf="canShowSidebar()">
          <!-- Mobile Overlay -->
          <div *ngIf="isMobileMenuOpen()" class="fixed inset-0 bg-gray-900/50 z-30 lg:hidden backdrop-blur-sm" (click)="toggleMobileMenu()"></div>
          
          <!-- Sidebar Panel (Resizeable) -->
          <aside [class.translate-x-0]="isMobileMenuOpen()" [class.-translate-x-full]="!isMobileMenuOpen()" 
                 [style.width.px]="sidebarWidth()"
                 class="overflow-hidden bg-white border-r border-gray-200 absolute lg:relative inset-y-0 left-0 transform lg:translate-x-0 transition-transform duration-300 z-40 flex flex-col shadow-2xl lg:shadow-none">
            
            <!-- Resizer Handle -->
            <div (mousedown)="startResize($event)" class="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize bg-transparent hover:bg-[var(--brand-color)] z-50 transition-colors"></div>

            <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 backdrop-blur shrink-0">
              <div>
                <h2 class="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[var(--brand-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  İçerik Düzenleyici
                </h2>
              </div>
              <button class="lg:hidden text-gray-400 hover:text-gray-600" (click)="toggleMobileMenu()">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div class="flex-1 overflow-y-auto custom-scrollbar">
              <app-announcement-form></app-announcement-form>
            </div>
          </aside>
        </ng-container>

        <!-- Route Content -->
        <main class="flex-1 overflow-y-auto bg-[var(--bg-color)] p-4 lg:p-8 custom-scrollbar relative">
          <!-- Mobile Nav Links (visible only on mobile if you want) -->
          <div class="md:hidden flex gap-2 mb-4">
            <a *ngIf="canShowDashboard()" routerLink="/app/dashboard" routerLinkActive="bg-[var(--brand-color)] text-white" class="flex-1 text-center py-2 rounded-lg text-sm bg-white border border-gray-200 text-gray-600 shadow-sm">Genel Bakış</a>
            <a routerLink="/app/archive" routerLinkActive="bg-[var(--brand-color)] text-white" class="flex-1 text-center py-2 rounded-lg text-sm bg-white border border-gray-200 text-gray-600 shadow-sm">Arşiv</a>
          </div>
          
          <router-outlet></router-outlet>
        </main>

      </div>
    </div>
  `
})
export class LayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentRole = this.authService.currentRole;
  isMobileMenuOpen = signal(false);
  
  sidebarWidth = signal(Math.round(window.innerWidth * 0.35)); // Ekranın %35'i
  private isResizing = false;

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isResizing) return;
    
    // Minimum %20, maksimum %50 viewport genişliği
    let newWidth = event.clientX;
    const minW = Math.round(window.innerWidth * 0.20);
    const maxW = Math.round(window.innerWidth * 0.50);
    if (newWidth < minW) newWidth = minW;
    if (newWidth > maxW) newWidth = maxW;
    
    this.sidebarWidth.set(newWidth);
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isResizing = false;
    document.body.style.cursor = 'default';
  }

  startResize(event: MouseEvent) {
    this.isResizing = true;
    document.body.style.cursor = 'col-resize';
    event.preventDefault(); // Metin seçilmesini engelle
  }

  getCurrentUserName(): string {
    const role = this.currentRole();
    const storedName = localStorage.getItem('dys_username');
    if (storedName) return storedName;
    
    if (role === 'Admin') return 'Ahmet Yönetici';
    if (role === 'Editor') return 'Ayşe Editör';
    if (role === 'Moderator') return 'Mehmet Moderatör';
    return 'Vatandaş / Personel';
  }

  canShowSidebar(): boolean {
    const role = this.currentRole();
    return role === 'Admin' || role === 'Editor' || role === 'Moderator';
  }

  canShowDashboard(): boolean {
    return this.currentRole() !== 'User';
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  logout() {
    this.authService.changeRole(null as any); // Reset signals
    localStorage.removeItem('dys_role');
    localStorage.removeItem('dys_username');
    window.location.href = 'http://localhost:4212';
  }

  returnToPortal() {
    const role = this.currentRole();
    const user = this.getCurrentUserName();
    // Portal 4200, Login 4212 — doğru hedefe (Portal) yönlendir
    window.location.assign(`http://localhost:4200?token=${role}&user=${encodeURIComponent(user)}`);
  }
}
