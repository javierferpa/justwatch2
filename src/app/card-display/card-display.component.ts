import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';


@Component({
  selector: 'app-card-display',
  standalone: true,
  imports: [CommonModule, HttpClientModule, NgOptimizedImage],
  templateUrl: './card-display.component.html',
  styleUrl: './card-display.component.css'
})
export class CardDisplayComponent implements OnInit {

  constructor(private router: Router) {}

  httpClient = inject(HttpClient);
  data: any[] = [];
  contador = 1;
  isLoadingData = false;

  ngOnInit() {
    this.fetchData();
  }

  async fetchData() {
    if (this.isLoadingData) {
      return;
    }

    this.isLoadingData = true;

    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MDYzNjY5ZWRhMTNiOWQ4ODA2ZDlkMGIxYTI1NWVlNyIsInN1YiI6IjY1NjEzOTI0MzY3OWExMDk3N2UwMzQxYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.gpPYfhFoIc9PBlcw9nP_AE6_9iv4sx27vyB_r27J07M'
      }
    };
    const url = 'https://api.themoviedb.org/3/trending/all/day?language=en-US&page=' + this.contador;

    try {
      
      const response = await fetch(url, options).then(response => {
        if (!response.ok) {
          throw new Error(`La solicitud falló con el código ${response.status}`);
        }
        return response.json();
      })
        .then(datos => {
          this.data = this.data.concat(datos.results);
          console.log(datos.results);
          console.log(this.data);
          this.contador += 1;
        })
        .catch(error => {
          console.error('Error en la solicitud:', error);
        });
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoadingData = false;
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    const windowHeight = 'innerHeight' in window ? window.innerHeight : document.documentElement.offsetHeight;
    const body = document.body;
    const html = document.documentElement;
    const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

    const windowBottom = windowHeight + window.scrollY;
    if (windowBottom >= docHeight - 50) {
      this.fetchData();
    }
  }

  onCardClick(cardId: string) {
    this.router.navigate(['/card-detail', cardId]);
  }
}
