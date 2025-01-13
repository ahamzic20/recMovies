import { Component } from '@angular/core';
import { Neo4jService } from '../../services/movies-service.service';
import { FormsModule } from '@angular/forms';  // Import FormsModule
import { MatInputModule } from '@angular/material/input'; // For material input
import { MatButtonModule } from '@angular/material/button'; // For material button
import { MatCardModule } from '@angular/material/card'; // For material card
import { CommonModule } from '@angular/common'; // Import CommonModule instead of BrowserModule
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, MatInputModule, MatButtonModule, MatCardModule, CommonModule], // Remove BrowserAnimationsModule
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private neo4jService: Neo4jService, private router: Router) {}

  async onSubmit() {
    try {
      const success = await this.neo4jService.validateUser(this.username, this.password);
      if (success>0) {
        alert('Login successful!');
        this.router.navigate(['/home'], {queryParams: {success}});
        // Redirect to dashboard or another page
      } else {
        this.errorMessage = 'Invalid username or password.';
      }
    } catch (error) {
      console.error('Error during login:', error);
      this.errorMessage = 'An error occurred. Please try again later.';
    }
  }
}
