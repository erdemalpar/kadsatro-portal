import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnnouncementPopupComponent } from './home/announcement-popup.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AnnouncementPopupComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Kadastro Portal';
}
