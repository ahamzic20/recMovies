import { Component, OnInit } from '@angular/core';
import { Neo4jService } from '../../services/movies-service.service';
import { FormsModule } from '@angular/forms';  // Import FormsModule
import { MatInputModule } from '@angular/material/input'; // For material input
import { MatButtonModule } from '@angular/material/button'; // For material button
import { MatCardModule } from '@angular/material/card'; // For material card
import { CommonModule } from '@angular/common'; // Import CommonModule instead of BrowserModule
import { IMovie } from '../../models/imovie';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, MatInputModule, MatButtonModule, MatCardModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  movies: IMovie[] = [];
  userMovies: IMovie[] = [];
  userId?: number;
  randomMovieByGenre?: IMovie;
  randomMovieByActor?: IMovie;
  randomMovieByDirector?: IMovie;
  randomMovie? : IMovie;

  constructor(private moviesService: Neo4jService,private route: ActivatedRoute){}

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.userId = params['success'];  // Get the 'success' query parameter
      console.log(this.userId);
    });
    this.movies = await this.moviesService.getMovies();

    this.userMovies = await this.moviesService.getUserMovies(this.userId as number);
    console.log('Movies:', this.userMovies);
    
  }

  async getRecomendations(){

      // Create an array to store the selected movies (to avoid repeating)
  const selectedMovies: IMovie[] = [];

  // Fetch random movie by genre, ensuring it's not already selected
  this.randomMovieByGenre = await this.moviesService.getMovieByFavoriteGenre(this.userId as number);
  if (!selectedMovies.some(movie => movie.id === this.randomMovieByGenre?.id)) {
    selectedMovies.push(this.randomMovieByGenre);
  } else {
    this.randomMovieByGenre = await this.moviesService.getMovieByFavoriteGenre(this.userId as number);
  }

  // Fetch random movie by actor, ensuring it's not already selected
  this.randomMovieByActor = await this.moviesService.getMovieByFavoriteActor(this.userId as number);
  if (!selectedMovies.some(movie => movie.id === this.randomMovieByActor?.id)) {
    selectedMovies.push(this.randomMovieByActor);
  } else {
    this.randomMovieByActor = await this.moviesService.getMovieByFavoriteActor(this.userId as number);
  }

  // Fetch random movie by director, ensuring it's not already selected
  this.randomMovieByDirector = await this.moviesService.getMovieByFavoriteDirector(this.userId as number);
  if (!selectedMovies.some(movie => movie.id === this.randomMovieByDirector?.id)) {
    selectedMovies.push(this.randomMovieByDirector);
  } else {
    this.randomMovieByDirector = await this.moviesService.getMovieByFavoriteDirector(this.userId as number);
  }

  // Fetch a random movie that hasn't been selected yet
  this.randomMovie = await this.moviesService.getRandomMovie(this.userId as number);
  if (!selectedMovies.some(movie => movie.id === this.randomMovie?.id)) {
    selectedMovies.push(this.randomMovie);
  } else {
    // If the random movie is already in the selected list, try again
    this.randomMovie = await this.moviesService.getRandomMovie(this.userId as number);
  }

  console.log("Random Movie By Genre", this.randomMovieByGenre);
  console.log("Random Movie By Actor", this.randomMovieByActor);
  console.log("Random Movie By Director", this.randomMovieByDirector);
  console.log("Random Movie", this.randomMovie);
    
  }
}
