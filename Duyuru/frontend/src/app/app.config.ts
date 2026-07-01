import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';

import { NGX_EDITOR_CONFIG_TOKEN, NgxEditorConfig } from 'ngx-editor';

const editorConfig: NgxEditorConfig = {
  locals: {
    bold: 'Kalın',
    italic: 'İtalik',
    code: 'Kod',
    underline: 'Altı Çizili',
    strike: 'Üstü Çizili',
    blockquote: 'Alıntı',
    bullet_list: 'Sırasız Liste',
    ordered_list: 'Sıralı Liste',
    heading: 'Başlık',
    h1: 'Başlık 1',
    h2: 'Başlık 2',
    h3: 'Başlık 3',
    h4: 'Başlık 4',
    h5: 'Başlık 5',
    h6: 'Başlık 6',
    align_left: 'Sola Yasla',
    align_center: 'Ortala',
    align_right: 'Sağa Yasla',
    align_justify: 'İki Yana Yasla',
    text_color: 'Metin Rengi',
    background_color: 'Arka Plan Rengi',
    url: 'URL',
    text: 'Metin',
    openInNewTab: 'Yeni sekmede aç',
    insert: 'Ekle',
    altText: 'Alternatif Metin',
    title: 'Başlık',
    remove: 'Kaldır',
  }
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(),
    provideCharts(withDefaultRegisterables()),
    provideAnimationsAsync(),
    { provide: NGX_EDITOR_CONFIG_TOKEN, useValue: editorConfig }
  ]
};
