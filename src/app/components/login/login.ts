import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Wordpress } from '../../services/wordpress';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  username = '';
  password = ''; //Application Password
  error = '';

  constructor(private wordpress: Wordpress, private router: Router) { }

  onLogin(): void {
    this.error = '';
    this.wordpress.login(this.username, this.password).subscribe({
      next: (response) => {
        // On success, navigate to the homepage
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = 'Login failed. Please check your username and Application Password.';
        console.error('Login error', err);
      }
    });
  }
}
