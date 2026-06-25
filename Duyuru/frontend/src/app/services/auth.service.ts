import { Injectable, signal, computed } from '@angular/core';
import { Role } from '../models/announcement.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Başlangıçta giriş yapılmadı
  private activeRoleSignal = signal<Role | null>(null);
  
  // Sahte (Mock) Kullanıcı ID'si
  private currentUserIdSignal = signal<number>(1);

  constructor() {
    // 1. SSO Token Kontrolü (Ana portal veya auth servisinden URL param ile gelindiyse)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const user = urlParams.get('user');

    if (token) {
       localStorage.setItem('dys_role', token);
       if(user) localStorage.setItem('dys_username', user);
       window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 2. Rutin Kontrol
    const savedRole = localStorage.getItem('dys_role') as Role;
    if (savedRole) {
      this.changeRole(savedRole);
    }
  }

  // Dışarıya Salt-Okunur (Read-only) sinyaller
  public readonly currentRole = computed(() => this.activeRoleSignal());
  public readonly currentUserId = computed(() => this.currentUserIdSignal());

  public isLoggedIn(): boolean {
    return this.activeRoleSignal() !== null;
  }

  // Rol değiştiren basit metod
  public changeRole(role: Role) {
    this.activeRoleSignal.set(role);
    
    // DB'deki sahte kullanıcılara denk gelen ID'leri atayalım
    switch(role) {
      case 'Admin': this.currentUserIdSignal.set(1); break;
      case 'Editor': this.currentUserIdSignal.set(2); break;
      case 'Moderator': this.currentUserIdSignal.set(3); break;
      case 'User': this.currentUserIdSignal.set(4); break;
    }
  }
}
