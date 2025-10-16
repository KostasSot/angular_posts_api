import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Wordpress } from '../../services/wordpress';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register-user.html',
  styleUrls: ['./register-user.css']
})
export class RegisterUser {
  username = '';
  firstname ='';
  lastname = '';
  email = '';
  password = '';
  successMessage = '';
  errorMessage = '';

  // NEW: Add a property for the selected role, with a default
  selectedRole: string = 'subscriber';
  // NEW: Add a list of available roles
  availableRoles: string[] = ['subscriber', 'contributor', 'author', 'editor'];

  showPassword = false;

  constructor(private wordpress: Wordpress) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    // Pass the selectedRole to the service
    this.wordpress.createUser(this.username, this.firstname, this.lastname, this.email, this.password, this.selectedRole).subscribe({
      next: (response) => {
        this.successMessage = `User '${response.name}' created successfully with the role '${this.selectedRole}'!`;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to create user.';
        console.error('Create user error', err);
      }
    });
  }
}
