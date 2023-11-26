import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CardDisplayComponent } from "./card-display/card-display.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { CardDetailComponent } from './card-detail/card-detail.component';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [CommonModule, RouterOutlet,RouterLink, CardDisplayComponent, NavbarComponent,CardDetailComponent]
})
export class AppComponent {
  title = 'justwatch2';
}
