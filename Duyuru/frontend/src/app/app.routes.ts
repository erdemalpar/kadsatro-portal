import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ArchiveComponent } from './components/archive/archive.component';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/app/dashboard', pathMatch: 'full' },
  { 
    path: 'app', 
    component: LayoutComponent,
    canActivate: [() => {
      const auth = inject(AuthService);
      if (!auth.isLoggedIn()) {
         window.location.href = 'http://localhost:4200';
         return false;
      }
      return true;
    }],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        component: DashboardComponent,
        canActivate: [() => {
          const auth = inject(AuthService);
          if (auth.currentRole() === 'User') {
            const router = inject(Router);
            router.navigate(['/app/archive']);
            return false;
          }
          return true;
        }]
      },
      { path: 'archive', component: ArchiveComponent }
    ]
  }
];
