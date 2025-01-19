import { Component, OnInit } from '@angular/core';
import { Neo4jService } from '../../services/movies-service.service';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { IMovie } from '../../models/imovie';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    CommonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  movies: IMovie[] = [];
  userMovies: IMovie[] = [];
  userId?: number;
  randomMovieByGenre?: IMovie;
  randomMovieByActor?: IMovie;
  randomMovieByDirector?: IMovie;
  randomMovie?: IMovie;

  constructor(
    private moviesService: Neo4jService,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.userId = params['success'];
      console.log(this.userId);
    });
    this.movies = await this.moviesService.getMovies();
    this.userMovies = await this.moviesService.getUserMovies(
      this.userId as number
    );

    console.log('Movies:', this.userMovies);
  }

  async getRecomendations() {
    const selectedMovies: IMovie[] = [];


    this.randomMovieByGenre = await this.getUniqueMovieByGenre(selectedMovies);
    selectedMovies.push(this.randomMovieByGenre);


    this.randomMovieByActor = await this.getUniqueMovieByActor(selectedMovies);
    selectedMovies.push(this.randomMovieByActor);


    this.randomMovieByDirector = await this.getUniqueMovieByDirector(selectedMovies);
    selectedMovies.push(this.randomMovieByDirector);

    9
    this.randomMovie = await this.getUniqueRandomMovie(selectedMovies);
    selectedMovies.push(this.randomMovie);

    console.log('Random Movie By Genre', this.randomMovieByGenre);
    console.log('Random Movie By Actor', this.randomMovieByActor);
    console.log('Random Movie By Director', this.randomMovieByDirector);
    console.log('Random Movie', this.randomMovie);
  }

  async getUniqueMovieByGenre(selectedMovies: IMovie[]): Promise<IMovie> {
    let movie: IMovie;
    do {
      movie = await this.moviesService.getMovieByFavoriteGenre(this.userId as number);
    } while (selectedMovies.some((selectedMovie) => selectedMovie.id === movie.id) && (!movie));
    return movie;
  }

  async getUniqueMovieByActor(selectedMovies: IMovie[]): Promise<IMovie> {
    let movie: IMovie;
    do {
      movie = await this.moviesService.getMovieByFavoriteActor(this.userId as number);
    } while (selectedMovies.some((selectedMovie) => selectedMovie.id === movie.id) && (!movie));
    return movie;
  }

  async getUniqueMovieByDirector(selectedMovies: IMovie[]): Promise<IMovie> {
    let movie: IMovie;
    do {
      movie = await this.moviesService.getMovieByFavoriteDirector(this.userId as number);
    } while (selectedMovies.some((selectedMovie) => selectedMovie.id === movie.id) && (!movie));
    return movie;
  }

  async getUniqueRandomMovie(selectedMovies: IMovie[]): Promise<IMovie> {
    let movie: IMovie;
    do {
      movie = await this.moviesService.getRandomMovie(this.userId as number);
    } while (selectedMovies.some((selectedMovie) => selectedMovie.id === movie.id) && (!movie));
    return movie;
  }

  async likeMovie(movie: IMovie) {
    var result = await this.moviesService.postFavoriteMovie(
      movie.title,
      this.userId as number
    );
    if (result) {
      this.getRecomendations();
    }
    console.log('LIKED MOVIE', movie);
  }
}
