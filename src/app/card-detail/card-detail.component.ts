import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-detail.component.html',
  styleUrl: './card-detail.component.css'
})
export class CardDetailComponent {
  cardId: string | undefined;

  constructor(private route: ActivatedRoute) {}
  movieDetails: any = {};
  watchProviders: any[] = [];

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.cardId = params['id'];
      // Puedes cargar los detalles de la tarjeta con this.cardId
    });

    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MDYzNjY5ZWRhMTNiOWQ4ODA2ZDlkMGIxYTI1NWVlNyIsInN1YiI6IjY1NjEzOTI0MzY3OWExMDk3N2UwMzQxYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.gpPYfhFoIc9PBlcw9nP_AE6_9iv4sx27vyB_r27J07M'
      }
    };

    console.log('detail')
    fetch('https://api.themoviedb.org/3/movie/' + this.cardId + '?language=en-US', options)
      .then(response => response.json())
      .then(response => {
        this.movieDetails = response;
        console.log(response);
      })
      .catch(err => console.error(err));

    console.log('where')
    fetch('https://api.themoviedb.org/3/movie/' + this.cardId + '/watch/providers', options)
      .then(response => response.json())
      .then(response => {
        this.watchProviders = response.results.AU.buy;
        console.log(this.watchProviders);
      })
      .catch(err => console.error(err));
  }
}
