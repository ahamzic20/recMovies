import { Component } from '@angular/core';
import { Neo4jService } from '../../services/movies-service.service';
import { FormsModule } from '@angular/forms';  // Import FormsModule
import { MatInputModule } from '@angular/material/input'; // For material input
import { MatButtonModule } from '@angular/material/button'; // For material button
import { MatCardModule } from '@angular/material/card'; // For material card
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [FormsModule, MatInputModule, MatButtonModule, MatCardModule, CommonModule],
})
export class RegisterComponent {
  username: string = '';
  name: string = '';
  lastName: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private neo4jService: Neo4jService, private router: Router) {}

  async onSubmit() {
    try {
      const success = await this.neo4jService.registerUser(this.username, this.name, this.lastName, this.password);
      if (success > 0) {
        alert('Registration successful!');
        this.router.navigate(['/login']);
      } else {
        this.errorMessage = 'An error occurred during registration. Please try again.';
      }
    } catch (error) {
      console.error('Error during registration:', error);
      this.errorMessage = 'An error occurred. Please try again later.';
    }
  }
}
