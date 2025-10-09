import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Wordpress } from '../../services/wordpress';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent {
  constructor(public wordpress: Wordpress, private router: Router) {}

  onLogout(): void {
    this.wordpress.logout();
    this.router.navigate(['/']);
  }

  // Helper to get the username for the template
  get username(): string | null {
    return this.wordpress.getUserDisplayName();
  }
}
