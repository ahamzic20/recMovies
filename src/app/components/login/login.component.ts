import { Component } from '@angular/core';
import { Neo4jService } from '../../services/movies-service.service';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, MatInputModule, MatButtonModule, MatCardModule, CommonModule],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private neo4jService: Neo4jService, private router: Router) { }

  async onSubmit() {
    try {
      const success = await this.neo4jService.validateUser(this.username, this.password);
      if (success > 0) {
        alert('Login successful!');
        this.router.navigate(['/home'], { queryParams: { success } });
      } else {
        this.errorMessage = 'Invalid username or password.';
      }
    } catch (error) {
      console.error('Error during login:', error);
      this.errorMessage = 'An error occurred. Please try again later.';
    }
  }

  async redirectToRegister() {
    this.router.navigate(['/register']);
  }
}
