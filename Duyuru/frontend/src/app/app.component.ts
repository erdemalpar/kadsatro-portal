import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalAlertComponent } from './components/global-alert/global-alert.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GlobalAlertComponent],
  template: `
    <router-outlet></router-outlet>
    <app-global-alert></app-global-alert>
  `
})
export class AppComponent {
  title = 'frontend';
}
