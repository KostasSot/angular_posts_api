import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Wordpress } from '../../services/wordpress';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {


  //wordpress service injection
  constructor(public wordpress: Wordpress, private router: Router) {}

  onLogout() {
    this.wordpress.logout();
    this.router.navigate(['/']);
  }
}
