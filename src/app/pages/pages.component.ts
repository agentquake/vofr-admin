import {Component} from '@angular/core';

import {MENU_ITEMS} from './pages-menu';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  template: `
      <ngx-one-column-layout>
          <nb-menu style="width: 10rem" [items]="menu"></nb-menu>
          <router-outlet></router-outlet>
      </ngx-one-column-layout>
  `,
})
export class PagesComponent {
  menu = MENU_ITEMS;
}
