import { Component, AfterViewInit, OnInit, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';

declare var initNetworkAnimation: any;

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styles: ``
})
export class HomeComponent implements OnInit, AfterViewInit {
  public currentUser = 'Kullanıcı';
  public currentRole = 'Yetkisiz';
  
  // HTML'deki href linkleri için
  public dysRole = '';
  public dysUsername = '';

  private route = inject(ActivatedRoute);

  ngOnInit() {
    // 1. URL Parametrelerinden Token Yakalama (SSO Port Aktarımı)
    // Hem browser URL'inden hem de Angular Router üzerinden garantili alalım
    const urlParams = new URLSearchParams(window.location.search);
    const token = this.route.snapshot.queryParamMap.get('token') || urlParams.get('token');
    const user = this.route.snapshot.queryParamMap.get('user') || urlParams.get('user');

    if (token) {
       localStorage.setItem('dys_role', token);
       if(user) {
         localStorage.setItem('dys_username', user);
       }
       // URL'i temizle (Kullanıcı paramları görmesin)
       window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 2. Rutin Kontrol
    const role = localStorage.getItem('dys_role');
    if (!role) {
       window.location.href = 'http://localhost:4212';
    } else {
       this.dysRole = role;
       this.dysUsername = localStorage.getItem('dys_username') || role + ' User';
       
       this.currentRole = role === 'Admin' ? 'Sistem Yöneticisi' : 
                          role === 'Editor' ? 'İçerik Üretici' : 
                          role === 'Moderator' ? 'Onay Mercii' : 'Personel';
       this.currentUser = this.dysUsername;
    }
  }

  logout() {
    localStorage.removeItem('dys_role');
    localStorage.removeItem('dys_username');
    window.location.href = 'http://localhost:4212';
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
      // Script zaten yüklenmişse doğrudan fonksiyonu çağır
      if (typeof initNetworkAnimation === 'function') {
           initNetworkAnimation();
      }
    }
  }
}
